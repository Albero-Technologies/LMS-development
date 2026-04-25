import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Sheet, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getMyTenant, updateMyTenant, type TenantSettings } from '../services/tenant.service'

// First class admin home for external integrations. Today: Google Sheets push
// for new enquiries. Future: Razorpay (per-tenant), Slack, Zoho, etc.
export const IntegrationsPage = () => {
    const queryClient = useQueryClient()
    const tenantQuery = useQuery({
        queryKey: ['tenant', 'me'],
        queryFn: getMyTenant,
        staleTime: 60_000
    })

    const [sheetId, setSheetId] = useState('')
    const [sheetRange, setSheetRange] = useState('Sheet1!A1')

    useEffect(() => {
        if (!tenantQuery.data) return
        setSheetId((tenantQuery.data.settings?.googleSheetId as string) ?? '')
        setSheetRange((tenantQuery.data.settings?.googleSheetRange as string) ?? 'Sheet1!A1')
    }, [tenantQuery.data])

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!tenantQuery.data) throw new Error('Tenant not loaded yet')
            const trimmed = sheetId.trim()
            const settings: TenantSettings = {
                ...(tenantQuery.data.settings ?? {}),
                googleSheetId: trimmed || undefined,
                googleSheetRange: trimmed ? sheetRange.trim() || 'Sheet1!A1' : undefined
            }
            return updateMyTenant({ settings })
        },
        onSuccess: () => {
            toast.success('Integration settings saved')
            void queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    return (
        <>
            <PageHeader
                eyebrow="Tenant settings"
                title="Integrations"
                description="Connect your tenant to external tools. Each integration here pushes data out — incoming syncs arrive in their own modules."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Save size={14} />}
                        loading={saveMutation.isPending}
                        disabled={!tenantQuery.data}
                        onClick={() => saveMutation.mutate()}>
                        Save
                    </Button>
                }
            />

            {tenantQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3" />
                </Card>
            ) : tenantQuery.isError ? (
                <Card>
                    <p className="text-sm text-fg-soft">Couldn't load tenant settings.</p>
                </Card>
            ) : (
                <Card>
                    <div className="flex items-start gap-3 mb-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)]">
                            <Sheet size={18} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-fg">Google Sheets — lead sync</h3>
                            <p className="mt-0.5 text-xs text-fg-soft">
                                Every new public enquiry pushes a row to the configured spreadsheet. Add the platform service account as an Editor on
                                your sheet, then paste its ID below.
                            </p>
                        </div>
                    </div>
                    <Input
                        label="Spreadsheet ID"
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                        placeholder="1AbCdEfGh-IJKLmnoPqrSTUv01234567890abcde"
                    />
                    <p className="mt-1 text-xs text-fg-muted">
                        From the sheet URL:{' '}
                        <code className="font-mono">
                            https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                        </code>
                    </p>
                    <div className="mt-4">
                        <Input
                            label="Tab + range (optional)"
                            value={sheetRange}
                            onChange={(e) => setSheetRange(e.target.value)}
                            placeholder="Sheet1!A1"
                        />
                        <p className="mt-1 text-xs text-fg-muted">A1 notation. New rows are appended after the last filled row in this range.</p>
                    </div>
                    <div className="mt-5 rounded-md border border-dashed border-[var(--color-border)] bg-surface-2 p-4 text-xs text-fg-soft space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-fg">
                            <ExternalLink size={12} /> Setup
                        </div>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Open your Google Sheet → Share → add the platform service account email as an Editor.</li>
                            <li>Copy the spreadsheet ID from the URL and paste it above.</li>
                            <li>Save. The next enquiry submission will push a row.</li>
                        </ol>
                        <p className="text-fg-muted">
                            Each row contains: timestamp, name, email, phone, course, city, language, message, UTM source/medium/campaign, assigned
                            counsellor id.
                        </p>
                    </div>
                </Card>
            )}
        </>
    )
}
