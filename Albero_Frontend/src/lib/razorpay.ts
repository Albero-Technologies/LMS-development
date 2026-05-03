// Razorpay Checkout helper. The vendored script tag is the canonical
// integration: we lazy-load it the first time a user clicks "Enroll", reuse
// the same script element afterwards, and never bundle it into our own JS so
// users who never start a checkout don't pay the kB cost.

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let loadPromise: Promise<void> | null = null

export const loadRazorpayScript = (): Promise<void> => {
    if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay can only load in the browser'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) return Promise.resolve()
    if (loadPromise) return loadPromise

    loadPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`)
        if (existing) {
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
            return
        }
        const script = document.createElement('script')
        script.src = SCRIPT_URL
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => {
            loadPromise = null
            reject(new Error('Failed to load Razorpay'))
        }
        document.head.appendChild(script)
    })
    return loadPromise
}

// Subset of the Razorpay options shape we actually use. The library exposes
// a much wider surface (subscriptions, EMI, etc.); we only type the fields
// the checkout flow needs so changes elsewhere don't trip TS.
export interface RazorpayOpenOptions {
    key: string
    amount: number
    currency: string
    name: string
    description?: string
    image?: string
    order_id: string
    prefill?: { name?: string; email?: string; contact?: string }
    theme?: { color?: string }
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
    modal?: { ondismiss?: () => void }
    notes?: Record<string, string>
}

interface RazorpayInstance {
    open: () => void
    on: (event: 'payment.failed', cb: (resp: unknown) => void) => void
}

export const openRazorpayCheckout = async (options: RazorpayOpenOptions): Promise<void> => {
    await loadRazorpayScript()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Razorpay = (window as any).Razorpay as new (opts: RazorpayOpenOptions) => RazorpayInstance
    const instance = new Razorpay(options)
    instance.open()
}
