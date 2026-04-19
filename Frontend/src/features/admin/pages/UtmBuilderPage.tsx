// UTM builder — mirrors lms.pen frame 23 (SA UTM Builder). Used by the super
// admin to generate tagged URLs for paid campaigns. Once the backend lands,
// redirect clicks on short URLs through /r/:id so click counts are accurate.
import { useMemo, useState } from 'react'
import { Link2, Copy, Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Empty } from '@shared/components/ui/Empty'
import { useTenantStore } from '../stores/tenantStore'

export const UtmBuilderPage = () => {
    const tenants = useTenantStore((s) => s.tenants)
    const links = useTenantStore((s) => s.utmLinks)
    const addLink = useTenantStore((s) => s.addUtmLink)
    const deleteLink = useTenantStore((s) => s.deleteUtmLink)

    const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '')
    const [label, setLabel] = useState('')
    const [destination, setDestination] = useState('/enquiry')
    const [source, setSource] = useState('instagram')
    const [medium, setMedium] = useState('cpc')
    const [campaign, setCampaign] = useState('spring-2026')
    const [term, setTerm] = useState('')
    const [content, setContent] = useState('')
    const [copied, setCopied] = useState<string | null>(null)

    const tenantLinks = useMemo(() => links.filter((l) => l.tenantId === tenantId), [links, tenantId])

    const preview = useMemo(() => {
        if (!tenantId) return ''
        const params = new URLSearchParams()
        params.set('utm_source', source || 'src')
        params.set('utm_medium', medium || 'med')
        params.set('utm_campaign', campaign || 'camp')
        if (term) params.set('utm_term', term)
        if (content) params.set('utm_content', content)
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const dest = destination.startsWith('http') ? destination : `${origin}${destination}`
        const sep = dest.includes('?') ? '&' : '?'
        return `${dest}${sep}${params.toString()}`
    }, [tenantId, destination, source, medium, campaign, term, content])

    const copy = (id: string, url: string) => {
        navigator.clipboard.writeText(url)
        setCopied(id)
        setTimeout(() => setCopied(null), 1400)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!tenantId) return
        const created = addLink({
            tenantId,
            label: label.trim() || `${source}/${medium}`,
            destination,
            source,
            medium,
            campaign,
            term: term || undefined,
            content: content || undefined
        })
        toast.success('UTM link created')
        setLabel('')
        setTerm('')
        setContent('')
        copy(created.id, created.fullUrl)
    }

    if (tenants.length === 0) {
        return (
            <>
                <PageHeader
                    eyebrow="Super Admin"
                    title="UTM builder"
                />
                <Empty
                    icon={<Link2 size={32} />}
                    title="No tenants yet"
                    description="Create a tenant first, then generate UTM links for their campaigns."
                />
            </>
        )
    }

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="UTM builder"
                description="Generate tagged URLs for paid + organic campaigns. Each link is scoped to a tenant."
                actions={
                    <div className="w-64">
                        <Select
                            aria-label="Choose tenant"
                            value={tenantId}
                            onChange={(e) => setTenantId(e.target.value)}>
                            {tenants.map((t) => (
                                <option
                                    key={t.id}
                                    value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-[380px_1fr] gap-4">
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">New UTM link</h3>
                    <form
                        onSubmit={submit}
                        className="space-y-3">
                        <Input
                            label="Internal label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Instagram · spring 2026"
                        />
                        <Input
                            label="Destination path or URL"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="/enquiry or https://..."
                            hint="Paths resolve against the current origin."
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="utm_source"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                            />
                            <Input
                                label="utm_medium"
                                value={medium}
                                onChange={(e) => setMedium(e.target.value)}
                            />
                        </div>
                        <Input
                            label="utm_campaign"
                            value={campaign}
                            onChange={(e) => setCampaign(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="utm_term (optional)"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                            />
                            <Input
                                label="utm_content (optional)"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md border bg-surface-2 p-3">
                            <div className="text-xs text-fg-muted mb-1 font-medium">Preview</div>
                            <code className="font-mono text-xs text-fg break-all">{preview}</code>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            leftIcon={<Link2 size={14} />}>
                            Create UTM link
                        </Button>
                    </form>
                </Card>

                <Card padded={false}>
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-fg">UTM links</h3>
                        <span className="text-xs text-fg-muted">{tenantLinks.length} total</span>
                    </div>
                    {tenantLinks.length === 0 ? (
                        <Empty
                            icon={<Link2 size={28} />}
                            title="No UTM links yet"
                            description="Create your first one on the left."
                        />
                    ) : (
                        <ul className="divide-y">
                            {tenantLinks.map((l) => (
                                <li
                                    key={l.id}
                                    className="p-4 flex items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-fg">{l.label}</div>
                                        <div className="text-[11px] text-fg-muted mt-0.5">
                                            {l.source} / {l.medium} / {l.campaign}
                                        </div>
                                        <code className="block font-mono text-xs text-fg-soft mt-2 break-all">
                                            {l.fullUrl}
                                        </code>
                                        <div className="mt-2 text-[11px] text-fg-muted font-mono">
                                            {l.clickCount} click{l.clickCount === 1 ? '' : 's'} ·{' '}
                                            {new Date(l.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0">
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            aria-label="Copy URL"
                                            onClick={() => copy(l.id, l.fullUrl)}>
                                            {copied === l.id ? <Check size={13} /> : <Copy size={13} />}
                                        </Button>
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            aria-label="Delete"
                                            className="!text-[var(--color-danger)]"
                                            onClick={() => {
                                                if (!window.confirm('Delete this UTM link?')) return
                                                deleteLink(l.id)
                                            }}>
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </>
    )
}
