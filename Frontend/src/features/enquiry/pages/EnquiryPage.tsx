// Public enquiry form. A student fills this → it creates a Lead in the pipeline
// and auto-assigns to the next counsellor via round-robin. There is NO mention
// of tenants, SaaS, or admin creation anywhere on this page — that's an
// internal process (handled under /app/admin/tenants).
//
// The thank-you screen shows the assigned counsellor's name when available
// so the student knows who will call them.
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Mail, Phone, User, MapPin, ArrowRight, CheckCircle2, Clock, MessageSquare, Sparkles, GraduationCap, Briefcase, ChevronDown, ChevronUp } from 'lucide-react'
import { Brand } from '@shared/components/Brand'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { submitPublicEnquiry } from '@features/counsellor/services/lead.service'
import { toApiError } from '@shared/libs/api'

// Form values use string for numeric fields because HTML inputs return
// strings; we coerce to number before submitting to match the backend schema.
const educationEntrySchema = z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    yearOfPassing: z.string().optional(),
    percentage: z.string().optional()
})

const schema = z.object({
    name: z.string().min(2, 'Please enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(8, 'Enter a valid phone number'),
    course: z.string().min(2, 'Pick a course'),
    language: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    qualification: z.string().optional(),
    message: z.string().optional(),
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

const COURSE_OPTIONS = [
    'System Design Foundations',
    'Full-stack TypeScript',
    'DSA in 30 days',
    'React for Production',
    'Backend Engineering',
    'Data Engineering',
    'Not sure yet — help me pick'
]

export const EnquiryPage = () => {
    const [params] = useSearchParams()
    const [submitted, setSubmitted] = useState<{ counsellor?: string } | null>(null)
    const [openEducation, setOpenEducation] = useState(false)
    const [openProfessional, setOpenProfessional] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            course: params.get('course') ?? '',
            language: 'English'
        }
    })

    // Slug comes from either the route (`/t/:slug/enquiry` — preferred for the
    // per-tenant landing flow) or the legacy `?tenant=` query string.
    const routeParams = useParams<{ slug?: string }>()

    const utmSource = params.get('utm_source') ?? undefined
    const utmMedium = params.get('utm_medium') ?? undefined
    const utmCampaign = params.get('utm_campaign') ?? undefined
    const tenantSlug = routeParams.slug ?? params.get('tenant') ?? undefined

    const mutation = useMutation({
        mutationFn: submitPublicEnquiry,
        onSuccess: (res) => {
            setSubmitted({ counsellor: res.assignedCounsellor?.name })
        },
        onError: (err) => toast.error(toApiError(err).message)
    })

    const submit = (data: TForm) => {
        // Compose the structured optional blocks. Each one only goes through
        // if the prospect actually filled at least one field in it — the
        // backend tolerates undefined but rejects empty strings on min(1)s.
        const grad = data.education?.graduation
        const masters = data.education?.masters
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

        const p = data.professional
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

        const g = data.gap
        const gap =
            g && (g.months || g.years || g.reason)
                ? { months: cleanInt(g.months), years: cleanInt(g.years), reason: cleanString(g.reason) }
                : undefined

        mutation.mutate({
            tenantSlug,
            name: data.name,
            email: data.email,
            phone: data.phone,
            course: data.course,
            language: data.language,
            city: cleanString(data.city),
            address: cleanString(data.address),
            qualification: cleanString(data.qualification),
            message: cleanString(data.message),
            utmSource,
            utmMedium,
            utmCampaign,
            education,
            professional,
            gap
        })
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-surface-2 flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] flex items-center justify-center mb-5">
                        <CheckCircle2 size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-fg tracking-tight">We've got your details</h1>
                    <p className="mt-3 text-fg-soft">
                        {submitted.counsellor ? (
                            <>
                                <span className="font-semibold text-fg">{submitted.counsellor}</span> from our team will call you within the next
                                working day.
                            </>
                        ) : (
                            'A counsellor from our team will call you within the next working day.'
                        )}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-xs text-fg-muted">
                        <Clock size={12} /> Expect a call Mon–Sat, 10 AM – 7 PM IST
                    </div>
                    <div className="mt-7 flex justify-center gap-2">
                        <Link to="/courses">
                            <Button variant="ghost">Browse courses</Button>
                        </Link>
                        <Link to="/">
                            <Button>Back home</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-5 bg-surface-2">
            {/* Left pitch panel — never mentions tenants / SaaS. */}
            <aside
                className="relative hidden lg:flex flex-col justify-between p-12 lg:col-span-2 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)'
                }}>
                <Link
                    to="/"
                    aria-label="Albero Academy home">
                    <Brand
                        size="md"
                        onDark
                    />
                </Link>
                <div className="text-white">
                    <Badge className="!bg-white/15 !text-white !border-white/25">
                        <Sparkles size={11} /> Free counsellor call
                    </Badge>
                    <h2 className="mt-4 text-3xl xl:text-4xl font-bold leading-tight tracking-tight">Not sure which course is right?</h2>
                    <p className="mt-4 text-white/85 max-w-sm">
                        Tell us where you are and where you want to go. A counsellor will help you pick the shortest honest path — no pressure, no
                        spam.
                    </p>
                    <ul className="mt-6 space-y-2 text-sm text-white/90">
                        <Bullet>15-min callback, not a sales pitch</Bullet>
                        <Bullet>Curriculum walkthrough for your track</Bullet>
                        <Bullet>Mentor profiles + sample lessons</Bullet>
                    </ul>
                </div>
                <div className="text-xs text-white/70">
                    Already enrolled?{' '}
                    <Link
                        to="/login"
                        className="underline hover:text-white">
                        Log in →
                    </Link>
                </div>
            </aside>

            {/* Right — form */}
            <main className="lg:col-span-3 flex flex-col bg-surface">
                <div className="h-16 px-6 sm:px-10 flex items-center justify-between border-b lg:border-transparent">
                    <div className="lg:hidden">
                        <Brand size="sm" />
                    </div>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
                    <div className="mx-auto w-full max-w-xl">
                        <h1 className="text-3xl font-bold tracking-tight text-fg">Talk to a counsellor</h1>
                        <p className="mt-2 text-sm text-fg-soft">
                            Leave your details. We'll call you at a time that works, explain the course, and help you enrol if it's the right fit.
                        </p>

                        <form
                            onSubmit={handleSubmit(submit)}
                            className="mt-8 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Input
                                    label="Full name"
                                    autoComplete="name"
                                    leftIcon={<User size={14} />}
                                    error={errors.name?.message}
                                    {...register('name')}
                                />
                                <Input
                                    label="Phone"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="+91 ..."
                                    leftIcon={<Phone size={14} />}
                                    error={errors.phone?.message}
                                    {...register('phone')}
                                />
                            </div>
                            <Input
                                label="Email"
                                type="email"
                                autoComplete="email"
                                leftIcon={<Mail size={14} />}
                                error={errors.email?.message}
                                {...register('email')}
                            />
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Select
                                    label="Interested course"
                                    error={errors.course?.message}
                                    {...register('course')}>
                                    <option value="">Select a course</option>
                                    {COURSE_OPTIONS.map((c) => (
                                        <option
                                            key={c}
                                            value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    label="Preferred language"
                                    {...register('language')}>
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Mix — whatever works</option>
                                </Select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Input
                                    label="City (optional)"
                                    leftIcon={<MapPin size={14} />}
                                    placeholder="Mumbai, Bengaluru, …"
                                    {...register('city')}
                                />
                                <Input
                                    label="Highest qualification (optional)"
                                    placeholder="e.g. BTech CSE"
                                    {...register('qualification')}
                                />
                            </div>
                            <Textarea
                                label="Address (optional)"
                                rows={2}
                                placeholder="House / street / city / state / pincode"
                                {...register('address')}
                            />

                            <CollapseSection
                                label="Education details"
                                sublabel="Optional — helps the counsellor pick the right cohort."
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
                            </CollapseSection>

                            <CollapseSection
                                label="Professional details"
                                sublabel="Optional — useful if you've worked before."
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
                                    label="Brief description"
                                    rows={3}
                                    placeholder="A few lines about your work."
                                    {...register('professional.description')}
                                />
                            </CollapseSection>

                            <Textarea
                                label="Anything we should know? (optional)"
                                rows={3}
                                placeholder="Background, goals, timelines — whatever helps the counsellor."
                                {...register('message')}
                            />

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                loading={mutation.isPending}
                                rightIcon={<ArrowRight size={16} />}>
                                Request a callback
                            </Button>

                            <p className="text-xs text-fg-muted text-center">
                                <MessageSquare
                                    size={10}
                                    className="inline-block mr-1"
                                />
                                We'll only use these details to call and email you about the course you picked.
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}

const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-2">
        <CheckCircle2
            size={14}
            className="mt-0.5 shrink-0"
        />
        <span>{children}</span>
    </li>
)

// Inline collapsible section used by the optional Education / Professional
// blocks. Same shape the onboarding form uses, kept local so the enquiry
// form stays self-contained.
const CollapseSection = ({
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
    <div className="rounded-md border border-[var(--color-border)]">
        <button
            type="button"
            onClick={onToggle}
            className={
                'w-full flex items-center justify-between px-4 py-3 text-left ' +
                (open ? 'border-b border-[var(--color-border)]' : '')
            }>
            <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center">{icon}</span>
                <div>
                    <div className="text-sm font-medium text-fg">{label}</div>
                    {sublabel && <div className="text-[11px] text-fg-muted">{sublabel}</div>}
                </div>
            </div>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {open && <div className="p-4 space-y-3">{children}</div>}
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
