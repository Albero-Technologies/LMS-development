// SEO builder (§4.1). Real backend-backed: picks any tenant from the SA tenant
// list and edits `tenant.settings.seo` — the per-tenant public pages render
// these in <head>. Live preview on the right shows Google + social share.
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getTenantDetail, listAllTenants, readTenantSeo, updateTenantById, type TenantSeo, type TenantSettings } from '../services/tenant.service'

export const SeoBuilderPage = () => {
    const queryClient = useQueryClient()

    const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listAllTenants, staleTime: 60_000 })
    const [tenantId, setTenantId] = useState<string>('')

    useEffect(() => {
        if (!tenantId && tenantsQuery.data && tenantsQuery.data.length > 0) {
            setTenantId(tenantsQuery.data[0].id)
        }
    }, [tenantId, tenantsQuery.data])

    const detailQuery = useQuery({
        queryKey: ['tenants', tenantId],
        queryFn: () => getTenantDetail(tenantId),
        enabled: tenantId.length > 0,
        staleTime: 60_000
    })

    const initial = useMemo(() => readTenantSeo(detailQuery.data), [detailQuery.data])
    const [draft, setDraft] = useState<TenantSeo>(initial)
    useEffect(() => setDraft(initial), [initial])
    const [newKeyword, setNewKeyword] = useState('')

    const tenants = tenantsQuery.data ?? []
    const tenant = detailQuery.data
    const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!tenant) throw new Error('Tenant not loaded')
            const settings: TenantSettings = { ...(tenant.settings ?? {}), seo: draft }
            return updateTenantById(tenantId, { settings })
        },
        onSuccess: () => {
            toast.success('SEO saved')
            void queryClient.invalidateQueries({ queryKey: ['tenants', tenantId] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    const addKeyword = () => {
        const k = newKeyword.trim()
        if (!k || (draft.keywords ?? []).includes(k)) return
        setDraft({ ...draft, keywords: [...(draft.keywords ?? []), k] })
        setNewKeyword('')
    }
    const removeKeyword = (k: string) => setDraft({ ...draft, keywords: (draft.keywords ?? []).filter((x) => x !== k) })

    const titleLen = (draft.metaTitle ?? '').length
    const descLen = (draft.metaDescription ?? '').length

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
                                        {t.name} (/{t.slug})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<Save size={14} />}
                            disabled={!dirty || !tenant}
                            loading={saveMutation.isPending}
                            onClick={() => saveMutation.mutate()}>
                            Save SEO
                        </Button>
                    </>
                }
            />

            {detailQuery.isLoading || !tenant ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : (
                <div className="grid lg:grid-cols-[1fr_360px] gap-4">
                    <div className="space-y-4">
                        <Card>
                            <h3 className="text-sm font-semibold text-fg mb-3">Meta tags</h3>
                            <div className="space-y-3">
                                <Input
                                    label="Title tag"
                                    value={draft.metaTitle ?? ''}
                                    onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })}
                                    hint={`${titleLen} / 60 recommended`}
                                    error={titleLen > 60 ? 'Title is longer than the typical 60-char cap.' : undefined}
                                />
                                <Textarea
                                    label="Meta description"
                                    rows={3}
                                    value={draft.metaDescription ?? ''}
                                    onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
                                    hint={`${descLen} / 160 recommended`}
                                    error={descLen > 160 ? 'Description is longer than the typical 160-char cap.' : undefined}
                                />
                                <Input
                                    label="Canonical URL"
                                    placeholder={`https://albero.academy/t/${tenant.slug}`}
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
                                    value={draft.robots ?? 'index, follow'}
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
                                {(draft.keywords ?? []).map((k) => (
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
                                {(draft.keywords ?? []).length === 0 && <span className="text-xs text-fg-muted">No keywords yet.</span>}
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

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Google preview</h3>
                        <div className="p-4 rounded-md border bg-surface">
                            <div className="text-xs text-fg-muted truncate">{draft.canonicalUrl || `https://albero.academy/t/${tenant.slug}`}</div>
                            <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-medium mt-1 leading-snug">
                                {draft.metaTitle || 'Untitled'}
                            </div>
                            <div className="text-sm text-fg-soft mt-1 leading-relaxed line-clamp-3">{draft.metaDescription || '—'}</div>
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
                                    {(draft.canonicalUrl || `albero.academy/t/${tenant.slug}`).replace(/^https?:\/\//, '')}
                                </div>
                                <div className="text-sm font-semibold text-fg mt-0.5">{draft.metaTitle || '—'}</div>
                                <div className="text-xs text-fg-soft mt-1 line-clamp-2">{draft.metaDescription || '—'}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    )
}
