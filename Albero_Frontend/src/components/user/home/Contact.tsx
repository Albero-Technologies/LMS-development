import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Facebook, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useContactForm } from '@/hooks/user/useContactForm'
import { contactData } from '@/constants/contact'
import { useTenantInfo } from '@/hooks/useContent'

// Pull contact info (email, phone, address, social links) from tenant.settings
// when available, otherwise fall back to constants. The fallback keeps the
// site rendering during a backend outage.
interface SettingsContacts {
    primaryEmail?: string
    primaryPhone?: string
    address?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
}

// Shared classes for all form inputs / textarea (was .ct-form-card input, .ct-form-card textarea)
const inputClasses =
    '!bg-white/[0.04] !border !border-white/[0.09] !rounded-[10px] !text-white/[0.88] ![font-family:var(--font-barlow)] !text-sm !backdrop-blur-[8px] ![box-shadow:inset_0_1px_0_rgba(255,255,255,0.05)] !transition-[border-color,box-shadow,background] !duration-200 !outline-none placeholder:!text-white/20 focus:!border-[rgba(99,102,241,0.5)] focus:!bg-[rgba(99,102,241,0.06)] focus:![box-shadow:inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_3px_rgba(99,102,241,0.12)]'

// Shared classes for label elements (was .ct-form-card label)
const labelClasses = 'block mb-2 ![font-family:var(--font-barlow-condensed)] !text-[10px] !font-bold !tracking-[0.12em] !uppercase !text-white/[0.32]'

// Shared classes for contact link rows (was .ct-contact-link)
const contactLinkClasses =
    '!flex !items-center !gap-3 !py-3 !px-[14px] !rounded-xl !border !border-white/[0.06] !bg-white/[0.03] !backdrop-blur-[8px] ![box-shadow:inset_0_1px_0_rgba(255,255,255,0.04)] !no-underline !transition-[background,border-color,color] !duration-200 !text-white/60 ![font-family:var(--font-barlow)] !text-sm hover:!bg-[rgba(99,102,241,0.1)] hover:!border-[rgba(99,102,241,0.3)] hover:!text-white/90'

// Shared classes for contact link icon (was .ct-link-icon)
const linkIconClasses =
    'w-[34px] h-[34px] rounded-[9px] flex-shrink-0 bg-[rgba(99,102,241,0.14)] border border-[rgba(99,102,241,0.28)] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center text-[oklch(0.707_0.165_254.624)]'

// Shared classes for social buttons (was .ct-social-btn)
const socialBtnClasses =
    '!w-10 !h-10 !rounded-[10px] !bg-white/[0.04] !border !border-white/[0.08] !backdrop-blur-[8px] ![box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)] !text-white/35 !transition-[background,border-color,color,transform] !duration-200 hover:!bg-[rgba(99,102,241,0.18)] hover:!border-[rgba(99,102,241,0.4)] hover:!text-[oklch(0.707_0.165_254.624)] hover:!-translate-y-0.5'

export const Contact = () => {
    const { submitForm, loading } = useContactForm()
    const tenantQ = useTenantInfo()

    const remoteContacts =
        (tenantQ.data?.landing as { contacts?: SettingsContacts } | null)?.contacts ??
        (tenantQ.data as unknown as { settings?: { contacts?: SettingsContacts } } | undefined)?.settings?.contacts
    const card = {
        email: remoteContacts?.primaryEmail || contactData.card.email,
        phone: remoteContacts?.primaryPhone || contactData.card.phone,
        address: remoteContacts?.address || contactData.card.address
    }
    const link = {
        title: contactData.link.title,
        facebook: remoteContacts?.facebook || contactData.link.facebook,
        twitter: remoteContacts?.twitter || contactData.link.twitter,
        linkedin: remoteContacts?.linkedin || contactData.link.linkedin,
        instagram: remoteContacts?.instagram || contactData.link.instagram
    }

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await submitForm(formData)

        if (success) {
            setFormData({ name: '', email: '', phone: '', message: '' })
        }
    }

    return (
        <section
            id="contact"
            className="px-5 py-12 md:py-20 text-white bg-transparent relative overflow-hidden">
            {/* Scene orbs (was .ct-orb) */}
            <div
                className="absolute rounded-full pointer-events-none blur-[10px]"
                style={{
                    top: -200,
                    left: '20%',
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle, oklch(0.546 0.245 262.881) 0%, transparent 70%)',
                    opacity: 0.1
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none blur-[10px]"
                style={{
                    bottom: -120,
                    right: '10%',
                    width: 500,
                    height: 500,
                    background: 'radial-gradient(circle, oklch(0.623 0.214 259.815) 0%, transparent 70%)',
                    opacity: 0.07
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none blur-[10px]"
                style={{
                    top: '50%',
                    left: '-5%',
                    width: 320,
                    height: 320,
                    background: 'radial-gradient(circle, oklch(0.511 0.262 276.966) 0%, transparent 70%)',
                    opacity: 0.08
                }}
            />

            <div className="container mx-auto relative z-[1]">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge
                        variant="outline"
                        className="mb-6 text-white text-xl">
                        {contactData.badgeTitle}
                    </Badge>
                    <h2 className="mb-6 [font-family:var(--font-bebas)] text-[clamp(36px,5vw,60px)] tracking-[0.04em] text-white/[0.95] leading-none">
                        {contactData.title}
                    </h2>
                    <p className="max-w-2xl mx-auto [font-family:var(--font-barlow)] text-base text-white/35 leading-[1.75]">
                        {contactData.subtitle}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* LEFT: Form (was .ct-form-card) */}
                    <div>
                        <Card className="p-8 !bg-[linear-gradient(135deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.018)_50%,rgba(99,102,241,0.04)_100%)] ![-webkit-backdrop-filter:blur(24px)_saturate(1.4)] ![backdrop-filter:blur(24px)_saturate(1.4)] !border !border-white/[0.09] ![box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.12),0_24px_64px_rgba(0,0,0,0.45),0_4px_16px_rgba(0,0,0,0.3)] !rounded-[20px] relative overflow-hidden isolate transition-[border-color,box-shadow] duration-300 hover:!border-[rgba(99,102,241,0.28)] hover:![box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.16),0_32px_80px_rgba(0,0,0,0.52),0_0_36px_rgba(99,102,241,0.1),0_8px_24px_rgba(0,0,0,0.35)]">
                            {/* ::before — top highlight line */}
                            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18)_40%,rgba(255,255,255,0.18)_60%,transparent)] pointer-events-none z-10" />

                            {/* ::after — noise texture overlay */}
                            <div
                                className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-[0.55] z-[1]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                                    backgroundSize: '200px 200px'
                                }}
                            />

                            {/* was .ct-form-card h3 */}
                            <h3 className="mb-6 ![font-family:var(--font-bebas)] !text-[clamp(24px,2.8vw,32px)] !tracking-[0.03em] !text-white/[0.95]">
                                {contactData.form.title}
                            </h3>

                            <form
                                onSubmit={handleSubmit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target instanceof HTMLTextAreaElement) {
                                        e.stopPropagation()
                                        handleSubmit(e)
                                    }
                                }}
                                className="space-y-6">
                                <div>
                                    <label className={labelClasses}>{contactData.form.nameLabel}</label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={contactData.form.namePlaceholder}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>{contactData.form.emailLabel}</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={contactData.form.emailPlaceholder}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>{contactData.form.phoneLabel}</label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder={contactData.form.phonePlaceholder}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>{contactData.form.messageLabel}</label>
                                    <Textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder={contactData.form.messagePlaceholder}
                                        rows={4}
                                        required
                                        className={inputClasses}
                                    />
                                </div>

                                {/* was .ct-submit-btn */}
                                <button className="w-full !inline-flex !items-center !justify-center !py-3 !px-6 !rounded-[10px] ![font-family:var(--font-barlow-condensed)] !text-sm !font-bold !tracking-[0.08em] !uppercase !cursor-pointer !bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(99,102,241,0.1))] !border !border-[rgba(99,102,241,0.4)] !text-[oklch(0.707_0.165_254.624)] !backdrop-blur-[8px] ![box-shadow:inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(99,102,241,0.12)] !transition-[opacity,transform] !duration-200 hover:!opacity-90 hover:!-translate-y-px">
                                    {loading ? (
                                        <Loader2
                                            className="animate-spin"
                                            size={18}
                                        />
                                    ) : (
                                        contactData.form.buttonLabel
                                    )}
                                </button>
                            </form>
                        </Card>
                    </div>

                    {/* RIGHT: Info (was .ct-right) */}
                    <div className="space-y-8">
                        <div>
                            {/* was .ct-right h3 */}
                            <h3 className="mb-6 ![font-family:var(--font-bebas)] !text-[clamp(22px,2.5vw,28px)] !tracking-[0.03em] !text-white/[0.95]">
                                {contactData.card.title}
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href={`mailto:${card.email}`}
                                    className={contactLinkClasses}>
                                    <div className={linkIconClasses}>
                                        <Mail size={15} />
                                    </div>
                                    <span>{card.email}</span>
                                </a>
                                <a
                                    href={`tel:${card.phone}`}
                                    className={contactLinkClasses}>
                                    <div className={linkIconClasses}>
                                        <Phone size={15} />
                                    </div>
                                    <span>{card.phone}</span>
                                </a>
                                <a
                                    className={contactLinkClasses}
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address)}`}
                                    target="_blank"
                                    rel="noreferrer">
                                    <div className={linkIconClasses}>
                                        <MapPin size={15} />
                                    </div>
                                    <span>{card.address}</span>
                                </a>
                            </div>
                        </div>

                        <div>
                            {/* was .ct-right h4 */}
                            <h4 className="mb-4 ![font-family:var(--font-barlow-condensed)] !text-[11px] !font-bold !tracking-[0.14em] !uppercase !text-white/[0.28]">
                                {link.title}
                            </h4>
                            <div className="flex space-x-3">
                                <a
                                    href={link.facebook}
                                    target="_blank"
                                    rel="noreferrer">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={socialBtnClasses}>
                                        <Facebook className="h-4 w-4" />
                                    </Button>
                                </a>
                                <a
                                    href={link.twitter}
                                    target="_blank"
                                    rel="noreferrer">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={socialBtnClasses}>
                                        <Twitter className="h-4 w-4" />
                                    </Button>
                                </a>
                                <a
                                    href={link.linkedin}
                                    target="_blank"
                                    rel="noreferrer">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={socialBtnClasses}>
                                        <Linkedin className="h-4 w-4" />
                                    </Button>
                                </a>
                                <a
                                    href={link.instagram}
                                    target="_blank"
                                    rel="noreferrer">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={socialBtnClasses}>
                                        <Instagram className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* CTA Card (was .ct-cta-card) */}
                        <Card className="p-6 !bg-[linear-gradient(135deg,rgba(99,102,241,0.12)_0%,rgba(99,102,241,0.05)_100%)] !border !border-[rgba(99,102,241,0.25)] !rounded-[18px] ![box-shadow:inset_0_1px_0_rgba(255,255,255,0.07),0_0_24px_rgba(99,102,241,0.08)] !backdrop-blur-[16px] relative overflow-hidden text-primary-foreground shadow-lg">
                            {/* Dot grid */}
                            <svg
                                width="140"
                                height="140"
                                viewBox="0 0 180 180"
                                fill="none"
                                className="absolute top-0 right-0 pointer-events-none opacity-50">
                                <defs>
                                    <pattern
                                        id="ct-dots"
                                        x="0"
                                        y="0"
                                        width="18"
                                        height="18"
                                        patternUnits="userSpaceOnUse">
                                        <circle
                                            cx="1.5"
                                            cy="1.5"
                                            r="1.5"
                                            fill="oklch(0.623 0.214 259.815)"
                                            fillOpacity="0.22"
                                        />
                                    </pattern>
                                </defs>
                                <rect
                                    width="180"
                                    height="180"
                                    fill="url(#ct-dots)"
                                />
                            </svg>

                            <div className="relative z-[2]">
                                <span className="inline-flex items-center gap-[6px] mb-3 py-[3px] px-[11px] rounded-[20px] [font-family:var(--font-barlow-condensed)] text-[10px] font-bold tracking-[0.12em] uppercase text-[oklch(0.707_0.165_254.624)] bg-[rgba(99,102,241,0.14)] border border-[rgba(99,102,241,0.3)]">
                                    <span className="w-[5px] h-[5px] rounded-full bg-[oklch(0.623_0.214_259.815)] [box-shadow:0_0_5px_oklch(0.623_0.214_259.815)] inline-block" />
                                    Free
                                </span>

                                {/* was .ct-cta-card h4 */}
                                <h4 className="mb-3 ![font-family:var(--font-bebas)] !text-[clamp(20px,2.2vw,26px)] !tracking-[0.04em] !text-white/[0.95]">
                                    {contactData.otherCard.title}
                                </h4>

                                {/* was .ct-cta-card p */}
                                <p className="mb-2 ![font-family:var(--font-barlow)] !text-[13px] !text-white/40 !leading-[1.78]">
                                    {contactData.otherCard.subtitle1}{' '}
                                    <span className="font-semibold text-white">{contactData.otherCard.subtitle2}</span>
                                    {contactData.otherCard.subtitle3} <span className="italic">{contactData.otherCard.subtitle4}</span>
                                    {contactData.otherCard.subtitle5}.
                                </p>

                                <div className="h-px bg-white/[0.07] my-[14px]" />

                                <div className="mt-3 text-sm text-gray-200 flex items-center gap-2">
                                    <span className="w-[5px] h-[5px] rounded-full bg-[oklch(0.623_0.214_259.815)] [box-shadow:0_0_6px_oklch(0.623_0.214_259.815)] flex-shrink-0 inline-block" />
                                    {contactData.otherCard.tagline}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
