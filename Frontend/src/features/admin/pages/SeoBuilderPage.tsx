// SEO builder — mirrors lms.pen frame 22 (SA SEO Manager). Per-tenant meta tags
// + OG image + robots config. The public site uses these when serving the
// tenant's pages (SSR on the real deploy; static at build-time locally).
import { useMemo, useState } from 'react'
import { Save, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { useTenantStore, type TSeoMeta } from '../stores/tenantStore'

export const SeoBuilderPage = () => {
    const tenants = useTenantStore((s) => s.tenants)
    const getSeo = useTenantStore((s) => s.getSeo)
    const saveSeo = useTenantStore((s) => s.saveSeo)

    const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '')
    const tenant = tenants.find((t) => t.id === tenantId) ?? null
    const initial = useMemo<TSeoMeta | null>(() => (tenant ? getSeo(tenant.id) : null), [tenant, getSeo])
    const [draft, setDraft] = useState<TSeoMeta | null>(initial)
    const [newKeyword, setNewKeyword] = useState('')

    if (draft?.tenantId !== initial?.tenantId) setDraft(initial)

    if (!tenant || !draft) {
        return (
            <>
                <PageHeader
                    eyebrow="Super Admin"
                    title="SEO builder"
                />
                <Card>
                    <div className="text-sm text-fg-soft">Create a tenant first to configure their SEO.</div>
                </Card>
            </>
        )
    }

    const save = () => {
        saveSeo(draft)
        toast.success('SEO saved — takes effect on next deploy')
    }

    const addKeyword = () => {
        const k = newKeyword.trim()
        if (!k || draft.keywords.includes(k)) return
        setDraft({ ...draft, keywords: [...draft.keywords, k] })
        setNewKeyword('')
    }
    const removeKeyword = (k: string) => setDraft({ ...draft, keywords: draft.keywords.filter((x) => x !== k) })

    const titleLen = draft.metaTitle.length
    const descLen = draft.metaDescription.length
    const titleTone = titleLen > 60 ? 'warn' : titleLen > 0 && titleLen < 30 ? 'muted' : 'ok'
    const descTone = descLen > 160 ? 'warn' : descLen > 0 && descLen < 80 ? 'muted' : 'ok'

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="SEO builder"
                description="Per-tenant meta tags, OG image, and robots directives. Applied to the tenant's public pages."
                actions={
                    <>
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
                        <Button
                            size="sm"
                            leftIcon={<Save size={14} />}
                            onClick={save}>
                            Save SEO
                        </Button>
                    </>
                }
            />

            <div className="grid lg:grid-cols-[1fr_360px] gap-4">
                {/* Form */}
                <div className="space-y-4">
                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Meta tags</h3>
                        <div className="space-y-3">
                            <Input
                                label="Title tag"
                                value={draft.metaTitle}
                                onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })}
                                hint={`${titleLen} / 60 recommended`}
                                error={titleTone === 'warn' ? 'Title is longer than the typical 60-char cap.' : undefined}
                            />
                            <Textarea
                                label="Meta description"
                                rows={3}
                                value={draft.metaDescription}
                                onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
                                hint={`${descLen} / 160 recommended`}
                                error={
                                    descTone === 'warn' ? 'Description is longer than the typical 160-char cap.' : undefined
                                }
                            />
                            <Input
                                label="Canonical URL"
                                placeholder="https://ascend.learnhub.in"
                                value={draft.canonicalUrl ?? ''}
                                onChange={(e) => setDraft({ ...draft, canonicalUrl: e.target.value })}
                            />
                            <Input
                                label="OG image URL"
                                placeholder="https://cdn…/og.png (1200×630)"
                                value={draft.ogImageUrl ?? ''}
                                onChange={(e) => setDraft({ ...draft, ogImageUrl: e.target.value })}
                            />
                            <Input
                                label="Favicon URL"
                                placeholder="https://cdn…/favicon.ico"
                                value={draft.faviconUrl ?? ''}
                                onChange={(e) => setDraft({ ...draft, faviconUrl: e.target.value })}
                            />
                            <Select
                                label="Robots directive"
                                value={draft.robots}
                                onChange={(e) => setDraft({ ...draft, robots: e.target.value })}>
                                <option value="index, follow">index, follow</option>
                                <option value="noindex, follow">noindex, follow</option>
                                <option value="index, nofollow">index, nofollow</option>
                                <option value="noindex, nofollow">noindex, nofollow</option>
                            </Select>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Keywords</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {draft.keywords.map((k) => (
                                <span
                                    key={k}
                                    className="chip">
                                    {k}
                                    <button
                                        type="button"
                                        aria-label={`Remove ${k}`}
                                        onClick={() => removeKeyword(k)}
                                        className="text-fg-muted hover:text-[var(--color-danger)] ml-1">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addKeyword()
                                    }
                                }}
                                placeholder="Add a keyword and press Enter"
                            />
                            <Button
                                variant="ghost"
                                leftIcon={<Plus size={13} />}
                                onClick={addKeyword}>
                                Add
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Search result preview */}
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">Google preview</h3>
                    <div className="p-4 rounded-md border bg-surface">
                        <div className="text-xs text-fg-muted truncate">
                            {draft.canonicalUrl || `https://${tenant.slug}.learnhub.in`}
                        </div>
                        <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-medium mt-1 leading-snug">
                            {draft.metaTitle || 'Untitled'}
                        </div>
                        <div className="text-sm text-fg-soft mt-1 leading-relaxed line-clamp-3">
                            {draft.metaDescription || '—'}
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-fg mt-5 mb-3">Social share</h3>
                    <div className="rounded-md border overflow-hidden">
                        {draft.ogImageUrl ? (
                            <img
                                src={draft.ogImageUrl}
                                alt="OG preview"
                                className="w-full h-40 object-cover bg-surface-2"
                            />
                        ) : (
                            <div className="w-full h-40 bg-surface-2 border-b flex items-center justify-center text-xs text-fg-muted">
                                1200×630 OG image
                            </div>
                        )}
                        <div className="p-3">
                            <div className="text-xs text-fg-muted truncate">
                                {(draft.canonicalUrl || `${tenant.slug}.learnhub.in`).replace(/^https?:\/\//, '')}
                            </div>
                            <div className="text-sm font-semibold text-fg mt-0.5">{draft.metaTitle || '—'}</div>
                            <div className="text-xs text-fg-soft mt-1 line-clamp-2">{draft.metaDescription || '—'}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}
