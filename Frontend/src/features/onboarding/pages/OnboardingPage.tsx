// Public counsellor-invite onboarding form (matches the backend
// `/api/v1/onboarding/:token/submit` flow). Full-screen layout (covers any
// sidebar), modern stepper-style progress bar, and a tenant + counsellor
// banner so the applicant knows who's enrolling them.
//
// All sections beyond the basics are optional. The progress bar reflects how
// many of the recommended fields are filled — it's a hint, not a gate.
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowRight, GraduationCap, Briefcase, Clock, ChevronDown, ChevronUp, Sparkles, BadgeCheck, Building2 } from 'lucide-react'
import { api, toApiError } from '@shared/libs/api'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { cn } from '@shared/helpers/cn'

interface InvitePreview {
    tenant: { id: string; name: string; slug: string; brandingLogo: string | null; brandingColor: string | null }
    counsellor: { id: string; firstName: string; lastName: string }
    course: { id: string; title: string; slug: string; thumbnailUrl: string | null } | null
    expiresAt: string
}

const fetchInvitePreview = async (token: string): Promise<InvitePreview> => {
    const { data } = await api.get<{ data: InvitePreview }>(`/onboarding/${token}`)
    return data.data
}

const educationEntrySchema = z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    yearOfPassing: z.string().optional(),
    percentage: z.string().optional()
})

const schema = z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(8, 'Phone number required'),
    address: z.string().optional(),
    qualification: z.string().optional(),
    notes: z.string().optional(),
    education: z
        .object({
            graduation: educationEntrySchema.optional(),
            masters: educationEntrySchema.optional()
        })
        .optional(),
    professional: z
        .object({
            totalExperienceYears: z.string().optional(),
            role: z.string().optional(),
            industry: z.string().optional(),
            ctcLakhs: z.string().optional(),
            description: z.string().optional()
        })
        .optional(),
    gap: z
        .object({
            months: z.string().optional(),
            years: z.string().optional(),
            reason: z.string().optional()
        })
        .optional()
})
type TForm = z.infer<typeof schema>

const cleanString = (v: string | undefined): string | undefined => {
    if (!v) return undefined
    const trimmed = v.trim()
    return trimmed.length > 0 ? trimmed : undefined
}
const cleanNumber = (v: string | undefined): number | undefined => {
    const s = cleanString(v)
    if (!s) return undefined
    const n = Number(s)
    return Number.isFinite(n) ? n : undefined
}
const cleanInt = (v: string | undefined): number | undefined => {
    const n = cleanNumber(v)
    return n === undefined ? undefined : Math.trunc(n)
}

const buildPayload = (d: TForm) => {
    const grad = d.education?.graduation
    const masters = d.education?.masters
    const cleanGrad =
        grad && (grad.degree || grad.institution || grad.yearOfPassing || grad.percentage)
            ? {
                  degree: cleanString(grad.degree),
                  institution: cleanString(grad.institution),
                  yearOfPassing: cleanInt(grad.yearOfPassing),
                  percentage: cleanNumber(grad.percentage)
              }
            : undefined
    const cleanMasters =
        masters && (masters.degree || masters.institution || masters.yearOfPassing || masters.percentage)
            ? {
                  degree: cleanString(masters.degree),
                  institution: cleanString(masters.institution),
                  yearOfPassing: cleanInt(masters.yearOfPassing),
                  percentage: cleanNumber(masters.percentage)
              }
            : undefined
    const education = cleanGrad || cleanMasters ? { graduation: cleanGrad, masters: cleanMasters } : undefined

    const p = d.professional
    const professional =
        p && (p.totalExperienceYears || p.role || p.industry || p.ctcLakhs || p.description)
            ? {
                  totalExperienceYears: cleanNumber(p.totalExperienceYears),
                  role: cleanString(p.role),
                  industry: cleanString(p.industry),
                  ctcLakhs: cleanNumber(p.ctcLakhs),
                  description: cleanString(p.description)
              }
            : undefined

    const g = d.gap
    const gap =
        g && (g.months || g.years || g.reason)
            ? {
                  months: cleanInt(g.months),
                  years: cleanInt(g.years),
                  reason: cleanString(g.reason)
              }
            : undefined

    return {
        firstName: d.firstName.trim(),
        lastName: d.lastName.trim(),
        email: d.email.trim(),
        phone: cleanString(d.phone),
        address: cleanString(d.address),
        qualification: cleanString(d.qualification),
        notes: cleanString(d.notes),
        education,
        professional,
        gap
    }
}

// Recommended fields used to compute the progress bar. The form will
// submit even with most of these blank — the bar is just a hint.
const RECOMMENDED_FIELDS: (keyof TForm | 'addr' | 'qual' | 'edu' | 'prof' | 'gap')[] = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'addr',
    'qual',
    'edu',
    'prof'
]

export const OnboardingPage = () => {
    const { token = '' } = useParams()
    const navigate = useNavigate()

    const previewQuery = useQuery({
        queryKey: ['onboarding', 'preview', token],
        queryFn: () => fetchInvitePreview(token),
        enabled: token.length > 0,
        retry: false
    })

    const [openEducation, setOpenEducation] = useState(false)
    const [openProfessional, setOpenProfessional] = useState(false)
    const [openGap, setOpenGap] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<TForm>({ resolver: zodResolver(schema) })

    // Watch the entire form so the progress bar updates as the applicant
    // types. `useWatch` is cheaper than re-rendering on every keystroke for
    // the whole tree.
    const watched = useWatch({ control })

    const progressPct = useMemo(() => {
        let filled = 0
        for (const f of RECOMMENDED_FIELDS) {
            if (f === 'addr') {
                if (cleanString(watched.address)) filled++
            } else if (f === 'qual') {
                if (cleanString(watched.qualification)) filled++
            } else if (f === 'edu') {
                const e = watched.education
                if (e?.graduation?.degree || e?.graduation?.institution || e?.masters?.degree) filled++
            } else if (f === 'prof') {
                const p = watched.professional
                if (p?.totalExperienceYears || p?.role || p?.industry) filled++
            } else if (f === 'gap') {
                const g = watched.gap
                if (g?.years || g?.months) filled++
            } else {
                if (cleanString(watched[f] as string | undefined)) filled++
            }
        }
        return Math.round((filled / RECOMMENDED_FIELDS.length) * 100)
    }, [watched])

    // Apply the tenant's brand color to the brand CSS vars while this page is
    // mounted, so the form takes on the institute's colour (header, buttons,
    // progress bar). Cleanup restores defaults on navigation away.
    useEffect(() => {
        const color = previewQuery.data?.tenant.brandingColor
        if (!color) return
        const root = document.documentElement
        const prev500 = root.style.getPropertyValue('--color-brand-500')
        const prev700 = root.style.getPropertyValue('--color-brand-700')
        root.style.setProperty('--color-brand-500', color)
        root.style.setProperty('--color-brand-700', color)
        return () => {
            root.style.setProperty('--color-brand-500', prev500)
            root.style.setProperty('--color-brand-700', prev700)
        }
    }, [previewQuery.data?.tenant.brandingColor])

    const mutation = useMutation({
        mutationFn: async (d: TForm) => {
            const payload = buildPayload(d)
            const { data } = await api.post(`/onboarding/${token}/submit`, payload)
            return data
        },
        onSuccess: () => {
            toast.success('Application submitted — your counsellor will share credentials shortly.')
            navigate('/thank-you', { replace: true })
        },
        onError: (err) => toast.error(toApiError(err).message)
    })

    if (previewQuery.isLoading) {
        return <FullScreenStatus message="Loading your invite…" />
    }
    if (previewQuery.isError || !previewQuery.data) {
        const msg = previewQuery.error instanceof Error ? toApiError(previewQuery.error).message : 'This invite link is invalid or has expired.'
        return (
            <FullScreenStatus
                title="Invite unavailable"
                message={msg}
            />
        )
    }

    const tenant = previewQuery.data.tenant
    const counsellor = previewQuery.data.counsellor
    const course = previewQuery.data.course
    const counsellorName = `${counsellor.firstName} ${counsellor.lastName}`.trim()

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-bg">
            {/* Top brand bar — sticky so the institute identity stays visible while scrolling. */}
            <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-bg/90 backdrop-blur">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {tenant.brandingLogo ? (
                            <img
                                src={tenant.brandingLogo}
                                alt={tenant.name}
                                className="h-8 w-8 rounded-md object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-md grid place-items-center bg-[var(--color-brand-500)] text-white font-semibold text-sm">
                                {tenant.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-fg truncate">{tenant.name}</div>
                            <div className="text-[11px] text-fg-muted">Powered by Albero Academy</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge tone="brand">Counsellor invite</Badge>
                        <ThemeToggle />
                    </div>
                </div>
                {/* Progress bar */}
                <div
                    className="h-1 bg-[var(--color-border)]"
                    aria-hidden>
                    <div
                        className="h-full bg-[var(--color-brand-500)] transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">
                {/* Greeting + counsellor card */}
                <div className="rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-50)] to-transparent p-5 sm:p-6 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Welcome to {tenant.name}</h1>
                    <p className="text-sm text-fg-soft mt-2">Tell us a little about yourself so we can enrol you and email your login credentials.</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 border border-[var(--color-border)]">
                            <BadgeCheck
                                size={12}
                                className="text-[var(--color-brand-500)]"
                            />
                            Invited by <strong className="text-fg">{counsellorName || 'your counsellor'}</strong>
                        </span>
                        {course && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 border border-[var(--color-border)]">
                                <Sparkles
                                    size={12}
                                    className="text-[var(--color-brand-500)]"
                                />
                                For <strong className="text-fg">{course.title}</strong>
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 border border-[var(--color-border)]">
                            <Building2 size={12} />
                            {tenant.name}
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit((d) => mutation.mutate(d))}
                    className="space-y-5">
                    <FormBlock title="Basics">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                                label="First name"
                                error={errors.firstName?.message}
                                {...register('firstName')}
                            />
                            <Input
                                label="Last name"
                                error={errors.lastName?.message}
                                {...register('lastName')}
                            />
                        </div>
                        <Input
                            label="Email"
                            type="email"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                        <Textarea
                            label="Address (optional)"
                            rows={2}
                            placeholder="House / street / city / state / pincode"
                            {...register('address')}
                        />
                        <Input
                            label="Highest qualification (optional)"
                            placeholder="e.g. BTech CSE"
                            {...register('qualification')}
                        />
                    </FormBlock>

                    <Section
                        label="Education details"
                        sublabel="Optional — helps us pick the right cohort for you."
                        icon={<GraduationCap size={14} />}
                        open={openEducation}
                        onToggle={() => setOpenEducation((v) => !v)}>
                        <EducationFields
                            heading="Graduation"
                            prefix="education.graduation"
                            register={register}
                        />
                        <EducationFields
                            heading="Masters"
                            prefix="education.masters"
                            register={register}
                        />
                    </Section>

                    <Section
                        label="Professional details"
                        sublabel="Optional — helps us tailor the projects to your stack."
                        icon={<Briefcase size={14} />}
                        open={openProfessional}
                        onToggle={() => setOpenProfessional((v) => !v)}>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                                label="Total experience (years)"
                                type="number"
                                step="0.5"
                                min={0}
                                {...register('professional.totalExperienceYears')}
                            />
                            <Input
                                label="CTC (₹ lakhs)"
                                type="number"
                                step="0.1"
                                min={0}
                                {...register('professional.ctcLakhs')}
                            />
                            <Input
                                label="Current / last role"
                                placeholder="e.g. DevOps Engineer"
                                {...register('professional.role')}
                            />
                            <Input
                                label="Industry"
                                placeholder="e.g. SaaS, Fintech"
                                {...register('professional.industry')}
                            />
                        </div>
                        <Textarea
                            label="What do you do? (brief description)"
                            rows={3}
                            placeholder="A few lines about your work."
                            {...register('professional.description')}
                        />
                    </Section>

                    <Section
                        label="Career gap"
                        sublabel="Optional — only if there's been a meaningful gap."
                        icon={<Clock size={14} />}
                        open={openGap}
                        onToggle={() => setOpenGap((v) => !v)}>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                                label="Years"
                                type="number"
                                min={0}
                                {...register('gap.years')}
                            />
                            <Input
                                label="Months"
                                type="number"
                                min={0}
                                max={12}
                                {...register('gap.months')}
                            />
                        </div>
                        <Textarea
                            label="Reason (optional)"
                            rows={2}
                            {...register('gap.reason')}
                        />
                    </Section>

                    <FormBlock title="Anything else?">
                        <Textarea
                            label="Notes for your counsellor (optional)"
                            rows={3}
                            {...register('notes')}
                        />
                    </FormBlock>

                    <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-bg/90 backdrop-blur border-t border-[var(--color-border)]">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-xs text-fg-muted">
                                {progressPct < 100 ? `${progressPct}% complete — extra fields are optional` : 'Looks complete!'}
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                loading={mutation.isPending}
                                rightIcon={<ArrowRight size={16} />}
                                className="w-full sm:w-auto">
                                Submit application
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}

const FormBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-[var(--color-border)] bg-surface p-5 space-y-3">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {children}
    </div>
)

const Section = ({
    label,
    sublabel,
    icon,
    open,
    onToggle,
    children
}: {
    label: string
    sublabel?: string
    icon: React.ReactNode
    open: boolean
    onToggle: () => void
    children: React.ReactNode
}) => (
    <div className="rounded-xl border border-[var(--color-border)] bg-surface overflow-hidden">
        <button
            type="button"
            onClick={onToggle}
            className={cn('w-full flex items-center justify-between px-5 py-4 text-left', open ? 'border-b border-[var(--color-border)]' : '')}>
            <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center">{icon}</span>
                <div>
                    <div className="text-sm font-semibold text-fg">{label}</div>
                    {sublabel && <div className="text-xs text-fg-muted">{sublabel}</div>}
                </div>
            </div>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {open && <div className="p-5 space-y-3">{children}</div>}
    </div>
)

type RegisterFn = ReturnType<typeof useForm<TForm>>['register']
const EducationFields = ({
    heading,
    prefix,
    register
}: {
    heading: string
    prefix: 'education.graduation' | 'education.masters'
    register: RegisterFn
}) => (
    <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2">{heading}</div>
        <div className="grid sm:grid-cols-2 gap-3">
            <Input
                label="Degree"
                placeholder="e.g. BTech / MBA"
                {...register(`${prefix}.degree`)}
            />
            <Input
                label="Institution"
                {...register(`${prefix}.institution`)}
            />
            <Input
                label="Year of passing"
                type="number"
                min={1950}
                max={2100}
                {...register(`${prefix}.yearOfPassing`)}
            />
            <Input
                label="Percentage / CGPA %"
                type="number"
                step="0.01"
                min={0}
                max={100}
                {...register(`${prefix}.percentage`)}
            />
        </div>
    </div>
)

const FullScreenStatus = ({ title = 'Just a moment', message }: { title?: string; message: string }) => (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-bg p-6">
        <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-fg-soft">{message}</p>
        </div>
    </div>
)
