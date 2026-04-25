// Razorpay Checkout loader + opener.
// Loads the script lazily on first call (idempotent — only injected once),
// then opens the checkout modal. Resolves on `payment.success`, rejects on
// dismiss or failure.

interface RazorpayCheckoutOptions {
    key: string
    amount: number
    currency: string
    name: string
    description?: string
    order_id: string
    prefill?: { name?: string; email?: string; contact?: string }
    notes?: Record<string, string>
    theme?: { color?: string }
    handler: (response: RazorpaySuccessResponse) => void
    modal?: { ondismiss?: () => void }
}

export interface RazorpaySuccessResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

interface RazorpayInstance {
    open: () => void
    on: (event: string, callback: (e: unknown) => void) => void
}

interface RazorpayConstructor {
    new (options: RazorpayCheckoutOptions): RazorpayInstance
}

declare global {
    interface Window {
        Razorpay?: RazorpayConstructor
    }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise: Promise<void> | null = null

const loadScript = (): Promise<void> => {
    if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay can only run in the browser'))
    if (window.Razorpay) return Promise.resolve()
    if (scriptPromise) return scriptPromise

    scriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
        if (existing) {
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load')))
            return
        }
        const script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => {
            scriptPromise = null
            reject(new Error('Razorpay script failed to load'))
        }
        document.body.appendChild(script)
    })
    return scriptPromise
}

export interface OpenCheckoutInput {
    keyId: string
    orderId: string
    amount: number
    currency: string
    invoiceNumber: string
    courseTitle?: string
    prefill?: { name?: string; email?: string; contact?: string }
    themeColor?: string
}

// Returns a promise that resolves with the gateway response when the user
// completes payment, or rejects when the user dismisses the modal / on error.
export const openRazorpayCheckout = async (input: OpenCheckoutInput): Promise<RazorpaySuccessResponse> => {
    await loadScript()
    if (!window.Razorpay) throw new Error('Razorpay SDK is unavailable')

    return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
        const rp = new window.Razorpay!({
            key: input.keyId,
            amount: input.amount,
            currency: input.currency,
            name: 'Albero Academy',
            description: input.courseTitle ? `${input.courseTitle} · ${input.invoiceNumber}` : input.invoiceNumber,
            order_id: input.orderId,
            prefill: input.prefill,
            notes: { invoiceNumber: input.invoiceNumber },
            theme: input.themeColor ? { color: input.themeColor } : undefined,
            handler: (response) => resolve(response),
            modal: {
                ondismiss: () => reject(new Error('PAYMENT_DISMISSED'))
            }
        })

        rp.on('payment.failed', (event: unknown) => {
            const err = event as { error?: { description?: string } }
            reject(new Error(err.error?.description ?? 'Payment failed'))
        })

        rp.open()
    })
}
