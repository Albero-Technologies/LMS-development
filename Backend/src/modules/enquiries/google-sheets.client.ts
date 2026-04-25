import { JWT } from 'google-auth-library'
import config from '../../config/config'
import logger from '../../util/logger'

// Single platform-wide service account is shared across tenants. Each tenant
// punches in their own Google Sheet ID + must add this service account email
// as an "Editor" on their sheet. Per-tenant service accounts (where each
// tenant uploads their own credentials) will arrive in §4.1.

let cachedClient: JWT | null = null

const getClient = (): JWT | null => {
    if (cachedClient) return cachedClient
    const email = config.GOOGLE_SHEETS_CLIENT_EMAIL
    const key = config.GOOGLE_SHEETS_PRIVATE_KEY
    if (!email || !key) return null

    cachedClient = new JWT({
        email,
        // Newlines in env vars are typically escaped — restore them.
        key: key.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    return cachedClient
}

interface AppendInput {
    sheetId: string
    // Tab name + range. Default appends to the first tab starting at A1.
    range?: string
    values: (string | number | null)[]
}

// Appends a single row to the configured spreadsheet. Fails silently in dev
// (returns false) if credentials or sheetId are missing — the enquiry create
// must never break because a marketing integration is misconfigured.
export const appendRow = async ({ sheetId, range = 'Sheet1!A1', values }: AppendInput): Promise<boolean> => {
    const client = getClient()
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
