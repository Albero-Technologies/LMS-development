// Website editor — mirrors lms.pen frame 24 (SA Landing Page Builder).
// The super admin picks a tenant, edits hero content + featured courses,
// and previews the changes alongside the form.
import { useMemo, useState } from 'react'
import { Save, Eye, Globe, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Badge } from '@shared/components/ui/Badge'
import { useTenantStore, type TWebsiteContent } from '../stores/tenantStore'
import { useCourseStore } from '@features/courses/stores/courseStore'

export const WebsiteEditorPage = () => {
    const tenants = useTenantStore((s) => s.tenants)
    const getWebsite = useTenantStore((s) => s.getWebsite)
    const saveWebsite = useTenantStore((s) => s.saveWebsite)

    const courses = useCourseStore((s) => s.courses)

    const [tenantId, setTenantId] = useState<string>(tenants[0]?.id ?? '')
    const tenant = useMemo(() => tenants.find((t) => t.id === tenantId) ?? null, [tenants, tenantId])

    const initial = useMemo<TWebsiteContent | null>(() => (tenant ? getWebsite(tenant.id) : null), [tenant, getWebsite])
    const [draft, setDraft] = useState<TWebsiteContent | null>(initial)

    // Reset the draft when the tenant changes.
    if (draft?.tenantId !== initial?.tenantId) {
        setDraft(initial)
    }

    if (!tenant || !draft) {
        return (
            <>
                <PageHeader
                    eyebrow="Super Admin"
                    title="Website editor"
                    description="Pick a tenant to edit their public landing content."
                />
                <Card>
                    <div className="text-sm text-fg-soft">Create a tenant first to edit its website.</div>
                </Card>
            </>
        )
    }

    const addCourse = (slug: string) => {
        if (!slug || draft.featuredCourseSlugs.includes(slug)) return
        setDraft({ ...draft, featuredCourseSlugs: [...draft.featuredCourseSlugs, slug] })
    }
    const removeCourse = (slug: string) => {
        setDraft({ ...draft, featuredCourseSlugs: draft.featuredCourseSlugs.filter((s) => s !== slug) })
    }

    const save = () => {
        saveWebsite(draft)
        toast.success(`Saved — ${tenant.name}'s landing is live`)
    }

    const featured = draft.featuredCourseSlugs
        .map((slug) => courses.find((c) => c.slug === slug || c.id === slug))
        .filter((c): c is NonNullable<typeof c> => !!c)

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="Website editor"
                description="Per-tenant public landing content. Students on each tenant see what you configure here."
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
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye size={14} />}
                            onClick={() => window.open('/', '_blank')}>
                            Preview
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Save size={14} />}
                            onClick={save}>
                            Save changes
                        </Button>
                    </>
                }
            />

            <div className="grid lg:grid-cols-[360px_1fr] gap-4">
                {/* Edit panel */}
                <div className="space-y-4">
                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Hero</h3>
                        <div className="space-y-3">
                            <Input
                                label="Eyebrow tag"
                                value={draft.heroTag}
                                onChange={(e) => setDraft({ ...draft, heroTag: e.target.value })}
                                hint="Small badge above the headline."
                            />
                            <Input
                                label="Headline"
                                value={draft.heroTitle}
                                onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
                            />
                            <Textarea
                                label="Sub-headline"
                                rows={3}
                                value={draft.heroSubtitle}
                                onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })}
                            />
                            <Input
                                label="Primary CTA label"
                                value={draft.primaryCta}
                                onChange={(e) => setDraft({ ...draft, primaryCta: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Featured courses</h3>
                        <div className="space-y-2 mb-3">
                            {featured.length === 0 && (
                                <div className="text-sm text-fg-muted py-2">Pick a course to feature below.</div>
                            )}
                            {featured.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center gap-2 bg-surface-2 border rounded-md px-3 py-2 text-sm">
                                    <span className="flex-1 truncate text-fg">{c.title}</span>
                                    <button
                                        type="button"
                                        aria-label="Remove"
                                        onClick={() => removeCourse(c.slug)}
                                        className="text-fg-muted hover:text-[var(--color-danger)]">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Select
                                value=""
                                onChange={(e) => addCourse(e.target.value)}
                                aria-label="Add course">
                                <option value="">+ Add course…</option>
                                {courses
                                    .filter((c) => !draft.featuredCourseSlugs.includes(c.slug))
                                    .map((c) => (
                                        <option
                                            key={c.slug}
                                            value={c.slug}>
                                            {c.title}
                                        </option>
                                    ))}
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Add course"
                                onClick={() => addCourse(courses[0]?.slug ?? '')}>
                                <Plus size={14} />
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Sections</h3>
                        <Toggle
                            label="Show pricing page"
                            value={draft.showPricingPage}
                            onChange={(v) => setDraft({ ...draft, showPricingPage: v })}
                        />
                    </Card>
                </div>

                {/* Live preview */}
                <Card padded={false}>
                    <div className="p-4 border-b flex items-center gap-2 text-xs text-fg-muted">
                        <Globe size={14} />
                        <span className="font-mono">
                            {tenant.slug}.learnhub.in
                        </span>
                        <Badge className="ml-auto">Preview</Badge>
                    </div>
                    <div
                        className="p-8 sm:p-12 text-center"
                        style={{
                            background:
                                'linear-gradient(160deg, #F0F4FF 0%, var(--color-surface) 50%, #E8F0FE 100%)'
                        }}>
                        <Badge tone="brand">{draft.heroTag}</Badge>
                        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-fg max-w-2xl mx-auto">
                            {draft.heroTitle}
                        </h1>
                        <p className="mt-3 text-sm text-fg-soft max-w-xl mx-auto leading-relaxed">
                            {draft.heroSubtitle}
                        </p>
                        <div className="mt-5 flex justify-center gap-2">
                            <Button size="sm">{draft.primaryCta}</Button>
                            <Button
                                size="sm"
                                variant="ghost">
                                Browse courses
                            </Button>
                        </div>
                    </div>
                    <div className="p-6 border-t">
                        <h3 className="text-xs text-fg-muted font-semibold uppercase tracking-wider mb-3">
                            Featured courses ({featured.length})
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {featured.map((c) => (
                                <div
                                    key={c.id}
                                    className="rounded-md border p-3 bg-surface">
                                    <div className="text-sm font-semibold text-fg truncate">{c.title}</div>
                                    <div className="text-xs text-fg-muted mt-1">
                                        ₹{c.price.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                            {featured.length === 0 && (
                                <div className="col-span-3 text-sm text-fg-muted py-4 text-center">
                                    No courses featured yet.
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}

const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between py-2 cursor-pointer select-none">
        <span className="text-sm text-fg">{label}</span>
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => onChange(!value)}
            className={
                'relative w-9 h-5 rounded-full transition-colors ' +
                (value ? 'bg-[var(--color-brand-500)]' : 'bg-[var(--color-border)]')
            }>
            <span
                className={
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ' +
                    (value ? 'translate-x-4' : '')
                }
            />
        </button>
    </label>
)
