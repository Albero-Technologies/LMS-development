import { JWT } from 'google-auth-library'
import config from '../../config/config'
import logger from '../../util/logger'

// Per-tenant Google Sheets push (§4.1). Tenants can paste their own service
// account JSON in the Environment tab — when present we instantiate a tenant-
// scoped JWT client and write to their sheet under their own credentials.
// Tenants without a service account fall back to the platform-wide one.

interface ServiceAccountJson {
    client_email?: string
    private_key?: string
}

let platformClient: JWT | null = null
const tenantClients = new Map<string, JWT>()

const getPlatformClient = (): JWT | null => {
    if (platformClient) return platformClient
    const email = config.GOOGLE_SHEETS_CLIENT_EMAIL
    const key = config.GOOGLE_SHEETS_PRIVATE_KEY
    if (!email || !key) return null

    platformClient = new JWT({
        email,
        // Newlines in env vars are typically escaped — restore them.
        key: key.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    return platformClient
}

const getTenantClient = (rawJson: string): JWT | null => {
    const cached = tenantClients.get(rawJson)
    if (cached) return cached
    let parsed: ServiceAccountJson
    try {
        parsed = JSON.parse(rawJson) as ServiceAccountJson
    } catch {
        logger.warn('SHEETS_TENANT_JSON_INVALID')
        return null
    }
    if (!parsed.client_email || !parsed.private_key) return null
    const client = new JWT({
        email: parsed.client_email,
        key: parsed.private_key.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    tenantClients.set(rawJson, client)
    return client
}

interface AppendInput {
    sheetId: string
    // Tab name + range. Default appends to the first tab starting at A1.
    range?: string
    values: (string | number | null)[]
    // Optional tenant-owned service account JSON. When set, this client is used
    // instead of the platform service account.
    serviceAccountJson?: string
}

// Appends a single row to the configured spreadsheet. Fails silently in dev
// (returns false) if credentials or sheetId are missing — the enquiry create
// must never break because a marketing integration is misconfigured.
export const appendRow = async ({ sheetId, range = 'Sheet1!A1', values, serviceAccountJson }: AppendInput): Promise<boolean> => {
    const client = serviceAccountJson ? getTenantClient(serviceAccountJson) : getPlatformClient()
    if (!client || !sheetId) {
        logger.info('SHEETS_SKIPPED', { meta: { reason: client ? 'no_sheet_id' : 'not_configured', sheetId } })
        return false
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

    const tokenResponse = await client.getAccessToken()
    const token = tokenResponse.token
    if (!token) {
        logger.warn('SHEETS_AUTH_FAILED', { meta: { sheetId } })
        return false
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [values] })
    })

    if (!res.ok) {
        const body = await res.text().catch(() => '')
        logger.error('SHEETS_APPEND_FAILED', { meta: { sheetId, status: res.status, body: body.slice(0, 500) } })
        return false
    }

    return true
}
