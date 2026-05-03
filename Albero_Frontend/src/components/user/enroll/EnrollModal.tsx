import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, CreditCard, Loader2, Mail, Phone, ShieldCheck, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { initPurchase, verifyPurchase, cancelPurchase, type InitPurchaseResponse, type PaymentType } from '@/services/purchaseService'
import { openRazorpayCheckout } from '@/lib/razorpay'

interface EnrollModalProps {
    open: boolean
    onClose: () => void
    courseSlug: string
    courseTitle: string
    // Optional override of the displayed price (for the "From" label). The
    // actual amount comes from the backend at init time, so this is purely
    // cosmetic. Pass undefined to hide the price line.
    displayPrice?: string
    // Default payment intent — the program page passes 'REGISTRATION' for the
    // "Reserve Your Slot" CTA and 'FULL' for "Pay Full Fee". The user can flip
    // between the two from inside the modal too.
    defaultPaymentType?: PaymentType
    // Tier metadata — recorded as advisory info on the enquiry/invoice so the
    // counsellor knows which plan the student picked. tierKey is the canonical
    // id matching an entry in Course.priceTiers; when set, the backend uses
    // its priceMinor as the authoritative full-fee charge.
    tierKey?: string
    tierLabel?: string
    tierPriceMinor?: number
    // Display-only registration fee amount (in INR, not paise). Used in the
    // "Reserve Your Slot" pill so the user knows the upfront cost. The
    // authoritative amount comes from the backend — this is hint-only.
    registrationFeeDisplay?: string
}

type Phase =
    | { kind: 'form' }
    | { kind: 'initializing' } // waiting for /init response + Razorpay script
    | { kind: 'checkout'; init: InitPurchaseResponse } // Razorpay window open
    | { kind: 'verifying'; init: InitPurchaseResponse } // /verify in flight
    | {
          kind: 'success'
          email: string
          loginUrl: string
          courseTitle: string
          paymentType: PaymentType
          amountPaidMinor: number
          balanceDueMinor: number
          balanceInvoiceNumber?: string
      }
    | { kind: 'demo'; message: string }

const fmtINR = (paise: number): string => {
    if (!Number.isFinite(paise)) return '—'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100)
}

// One modal that walks the user through:
//   form → init → Razorpay checkout → verify → success
//   on dismiss → demo lead capture
// The component owns the phase state machine; the parent only knows whether
// the modal is open. Closing mid-checkout calls /cancel so we don't strand a
// hung "pending" enquiry.
export default function EnrollModal({
    open,
    onClose,
    courseSlug,
    courseTitle,
    displayPrice,
    defaultPaymentType = 'FULL',
    tierKey,
    tierLabel,
    tierPriceMinor,
    registrationFeeDisplay = '₹5,000'
}: EnrollModalProps) {
    const [phase, setPhase] = useState<Phase>({ kind: 'form' })
    const [form, setForm] = useState({ name: '', email: '', phone: '', city: '' })
    const [paymentType, setPaymentType] = useState<PaymentType>(defaultPaymentType)

    // Reset state every time the modal re-opens. Otherwise a previous success
    // screen would persist when the user starts a fresh enrolment.
    useEffect(() => {
        if (open) {
            setPhase({ kind: 'form' })
            setForm({ name: '', email: '', phone: '', city: '' })
            setPaymentType(defaultPaymentType)
        }
    }, [open, defaultPaymentType])

    const close = async () => {
        // If the checkout is pending and we have a purchaseId, mark it
        // cancelled so the lead transitions to DEMO_SCHEDULED. Fire-and-
        // forget — closing the modal shouldn't depend on the network.
        if (phase.kind === 'checkout') {
            void cancelPurchase({ purchaseId: phase.init.purchaseId, reason: 'closed modal mid-checkout' })
        }
        onClose()
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.phone) {
            toast.error('Please fill in your name, email, and phone.')
            return
        }
        setPhase({ kind: 'initializing' })
        try {
            const init = await initPurchase({
                courseSlug,
                name: form.name,
                email: form.email,
                phone: form.phone,
                city: form.city || undefined,
                paymentType,
                tierKey,
                tierLabel,
                tierPriceMinor
            })
            setPhase({ kind: 'checkout', init })
            await openRazorpayCheckout({
                key: init.keyId,
                amount: init.amount,
                currency: init.currency,
                name: 'Albero Academy',
                description: init.courseTitle,
                order_id: init.orderId,
                prefill: {
                    name: init.prefill.name,
                    email: init.prefill.email,
                    contact: init.prefill.phone
                },
                theme: { color: '#0d4f3c' },
                handler: async (response) => {
                    setPhase({ kind: 'verifying', init })
                    try {
                        const verified = await verifyPurchase({
                            purchaseId: init.purchaseId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        })
                        setPhase({
                            kind: 'success',
                            email: verified.email,
                            loginUrl: verified.loginUrl,
                            courseTitle: verified.courseTitle,
                            paymentType: verified.paymentType ?? paymentType,
                            amountPaidMinor: verified.amountPaidMinor ?? init.totalAmount,
                            balanceDueMinor: verified.balanceDueMinor ?? init.balanceMinor,
                            balanceInvoiceNumber: verified.balanceInvoiceNumber
                        })
                    } catch (err) {
                        const msg = errorMessage(err, 'Payment verification failed.')
                        toast.error(msg)
                        setPhase({ kind: 'form' })
                    }
                },
                modal: {
                    ondismiss: async () => {
                        // User closed the Razorpay sheet without paying. Convert the
                        // intent to a DEMO_SCHEDULED lead so a counsellor follows up
                        // with a callback offering a free demo.
                        try {
                            const result = await cancelPurchase({
                                purchaseId: init.purchaseId,
                                reason: 'dismissed Razorpay checkout'
                            })
                            setPhase({ kind: 'demo', message: result.message })
                        } catch {
                            setPhase({ kind: 'form' })
                        }
                    }
                }
            })
        } catch (err) {
            const msg = errorMessage(err, "We couldn't start checkout. Please try again.")
            toast.error(msg)
            setPhase({ kind: 'form' })
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[min(520px,92vw)] rounded-3xl overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow-hover)' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6">
                            <div className="text-[11px] tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--brand)' }}>
                                {paymentType === 'REGISTRATION' ? 'Reserve your seat in' : 'Enroll in'}
                            </div>
                            <button
                                onClick={close}
                                aria-label="Close"
                                className="p-1 rounded-full hover:bg-[var(--surface-2)] transition-colors"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="px-6 pt-1 pb-2">
                            <h3 className="font-display text-[22px] md:text-[26px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                {courseTitle}
                            </h3>
                            {tierLabel && phase.kind === 'form' && (
                                <p className="mt-1 text-[12.5px] font-semibold" style={{ color: 'var(--brand)' }}>
                                    {tierLabel}
                                    {tierPriceMinor ? <span className="font-medium" style={{ color: 'var(--text-tertiary)' }}> · {fmtINR(tierPriceMinor)}</span> : null}
                                </p>
                            )}
                            {displayPrice && phase.kind === 'form' && !tierLabel && (
                                <p className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                                    From <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{displayPrice}</span> · GST applicable at checkout
                                </p>
                            )}

                            {phase.kind === 'form' && (
                                <div
                                    className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-xl"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('REGISTRATION')}
                                        className="px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors"
                                        style={{
                                            background: paymentType === 'REGISTRATION' ? 'var(--brand)' : 'transparent',
                                            color: paymentType === 'REGISTRATION' ? 'var(--text-on-inverse)' : 'var(--text-secondary)'
                                        }}>
                                        Reserve seat · {registrationFeeDisplay}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('FULL')}
                                        className="px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors"
                                        style={{
                                            background: paymentType === 'FULL' ? 'var(--brand)' : 'transparent',
                                            color: paymentType === 'FULL' ? 'var(--text-on-inverse)' : 'var(--text-secondary)'
                                        }}>
                                        Pay full fee
                                        {tierPriceMinor ? ` · ${fmtINR(tierPriceMinor)}` : ''}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Body — switches by phase */}
                        <div className="px-6 pb-6 pt-3">
                            {phase.kind === 'form' && (
                                <form
                                    onSubmit={onSubmit}
                                    className="space-y-3">
                                    <Field
                                        Icon={User}
                                        placeholder="Full name"
                                        value={form.name}
                                        onChange={(v) => setForm({ ...form, name: v })}
                                        required
                                    />
                                    <Field
                                        Icon={Mail}
                                        type="email"
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={(v) => setForm({ ...form, email: v })}
                                        required
                                    />
                                    <Field
                                        Icon={Phone}
                                        type="tel"
                                        placeholder="Phone (with country code)"
                                        value={form.phone}
                                        onChange={(v) => setForm({ ...form, phone: v })}
                                        required
                                    />
                                    <Field
                                        Icon={ShieldCheck}
                                        placeholder="City (optional)"
                                        value={form.city}
                                        onChange={(v) => setForm({ ...form, city: v })}
                                    />

                                    <button
                                        type="submit"
                                        className="w-full mt-2 px-5 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                                        style={{
                                            background: 'var(--brand)',
                                            color: 'var(--text-on-inverse)',
                                            boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                        }}>
                                        <CreditCard size={15} />{' '}
                                        {paymentType === 'REGISTRATION'
                                            ? `Reserve seat · ${registrationFeeDisplay}`
                                            : tierPriceMinor
                                              ? `Pay full fee · ${fmtINR(tierPriceMinor)}`
                                              : 'Pay securely & enroll'}
                                    </button>

                                    <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                        We'll redirect you to Razorpay for payment. Cancel anytime — we'll have a counsellor reach out for a free demo instead.
                                    </p>
                                </form>
                            )}

                            {(phase.kind === 'initializing' || phase.kind === 'verifying') && (
                                <Centered>
                                    <Loader2
                                        className="animate-spin"
                                        size={36}
                                        style={{ color: 'var(--brand)' }}
                                    />
                                    <p className="mt-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                                        {phase.kind === 'initializing' ? 'Setting up your secure checkout…' : 'Confirming your payment…'}
                                    </p>
                                </Centered>
                            )}

                            {phase.kind === 'checkout' && (
                                <Centered>
                                    <CreditCard
                                        size={36}
                                        style={{ color: 'var(--brand)' }}
                                    />
                                    <h4
                                        className="font-display text-[18px] font-semibold mt-3"
                                        style={{ color: 'var(--text-primary)' }}>
                                        Complete payment
                                    </h4>
                                    <p
                                        className="mt-1 text-[13px]"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        Please complete your payment in the Razorpay window.
                                    </p>
                                </Centered>
                            )}

                            {phase.kind === 'success' && (
                                <Centered>
                                    <div
                                        className="w-14 h-14 rounded-full inline-flex items-center justify-center"
                                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <h4
                                        className="font-display text-[20px] font-semibold mt-4"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {phase.paymentType === 'REGISTRATION'
                                            ? `Seat reserved in ${phase.courseTitle}!`
                                            : `You're enrolled in ${phase.courseTitle}!`}
                                    </h4>
                                    <p
                                        className="mt-2 text-[13.5px] leading-relaxed"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        We've emailed your login credentials to <strong>{phase.email}</strong>. Sign in to start
                                        learning.
                                    </p>

                                    <div
                                        className="mt-4 w-full rounded-xl p-4 text-left"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                        <div className="flex items-center justify-between text-[13px]">
                                            <span style={{ color: 'var(--text-tertiary)' }}>Paid today</span>
                                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {fmtINR(phase.amountPaidMinor)}
                                            </span>
                                        </div>
                                        {phase.balanceDueMinor > 0 && (
                                            <>
                                                <div className="flex items-center justify-between text-[13px] mt-2">
                                                    <span style={{ color: 'var(--text-tertiary)' }}>Balance due</span>
                                                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                                                        {fmtINR(phase.balanceDueMinor)}
                                                    </span>
                                                </div>
                                                {phase.balanceInvoiceNumber && (
                                                    <p className="mt-2 text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                                                        A counsellor will reach out to collect the balance · Invoice {phase.balanceInvoiceNumber}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <a
                                        href={phase.loginUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-[13.5px]"
                                        style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                        Open student portal
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className="mt-3 text-[12.5px] underline"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        Close
                                    </button>
                                </Centered>
                            )}

                            {phase.kind === 'demo' && (
                                <Centered>
                                    <div
                                        className="w-14 h-14 rounded-full inline-flex items-center justify-center"
                                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                        <Phone size={26} />
                                    </div>
                                    <h4
                                        className="font-display text-[20px] font-semibold mt-4"
                                        style={{ color: 'var(--text-primary)' }}>
                                        Want a free demo first?
                                    </h4>
                                    <p
                                        className="mt-2 text-[13.5px] leading-relaxed"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {phase.message}
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-[13.5px]"
                                        style={{
                                            background: 'var(--brand)',
                                            color: 'var(--text-on-inverse)'
                                        }}>
                                        Got it
                                    </button>
                                </Centered>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function Field({
    Icon,
    placeholder,
    value,
    onChange,
    type = 'text',
    required
}: {
    Icon: React.ElementType
    placeholder: string
    value: string
    onChange: (v: string) => void
    type?: string
    required?: boolean
}) {
    return (
        <label
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
            <Icon
                size={16}
                style={{ color: 'var(--text-tertiary)' }}
            />
            <input
                type={type}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: 'var(--text-primary)' }}
            />
        </label>
    )
}

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col items-center text-center py-6">{children}</div>
}

const errorMessage = (err: unknown, fallback: string): string => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
        const r = (err as { response?: { data?: { message?: string } } }).response
        if (r?.data?.message) return r.data.message
    }
    if (err instanceof Error && err.message) return err.message
    return fallback
}
