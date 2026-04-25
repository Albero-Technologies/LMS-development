// Public counsellor-invite onboarding form (matches the backend
// `/api/v1/onboarding/:token/submit` flow). A student arrives via a
// share-link, fills these details, and the counsellor emails them
// credentials shortly after.
//
// Sections collapse below the basics so the form doesn't look intimidating
// on first paint — Education / Professional / Gap are optional.
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowRight, GraduationCap, Briefcase, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { api, toApiError } from '@shared/libs/api'
import { Brand } from '@shared/components/Brand'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { cn } from '@shared/helpers/cn'

// Mirrors the backend submitOnboardingSchema — keep keys aligned.
// Numbers are typed as strings on the form (HTML inputs return strings) and
// trimmed/coerced before submit.
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

// Drop empty strings before sending so the backend's optional fields don't
// receive `""` which would fail their min(1) checks.
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

export const OnboardingPage = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [openEducation, setOpenEducation] = useState(false)
    const [openProfessional, setOpenProfessional] = useState(false)
    const [openGap, setOpenGap] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TForm>({ resolver: zodResolver(schema) })

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

    return (
        <div className="min-h-screen bg-aurora-soft flex items-center justify-center p-6 noise">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <Brand />
                    <Badge tone="brand">Counsellor invite</Badge>
                </div>
                <Card>
                    <h1 className="font-display text-3xl mb-2">Tell us a little about yourself</h1>
                    <p className="text-sm text-fg-soft mb-6">
                        Your counsellor created this link just for you. We'll use these details to enrol you and share login credentials over email.
                    </p>
                    <form
                        onSubmit={handleSubmit((d) => mutation.mutate(d))}
                        className="space-y-4">
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

                        <Section
                            label="Education details"
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
                            label="Career gap (optional)"
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

                        <Textarea
                            label="Anything else we should know (optional)"
                            rows={3}
                            {...register('notes')}
                        />

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            loading={mutation.isPending}
                            rightIcon={<ArrowRight size={16} />}>
                            Submit application
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

// Collapsible section so the form stays approachable. Click the header to
// expand the optional block.
const Section = ({
    label,
    icon,
    open,
    onToggle,
    children
}: {
    label: string
    icon: React.ReactNode
    open: boolean
    onToggle: () => void
    children: React.ReactNode
}) => (
    <div className="rounded-md border border-[var(--color-border)]">
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-fg',
                open ? 'border-b border-[var(--color-border)]' : ''
            )}>
            <span className="inline-flex items-center gap-2">
                <span className="text-fg-soft">{icon}</span>
                {label}
            </span>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
)

// `prefix` lets one component render either Graduation or Masters by emitting
// nested `education.graduation.*` / `education.masters.*` field names.
type RegisterFn = ReturnType<typeof useForm<TForm>>['register']
const EducationFields = ({ heading, prefix, register }: { heading: string; prefix: 'education.graduation' | 'education.masters'; register: RegisterFn }) => (
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
