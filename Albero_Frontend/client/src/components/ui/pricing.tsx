import React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CheckCircleIcon, StarIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { NavLink } from '../user/common/NavLink'

// Currency setup
type CURRENCY = 'USD' | 'EUR' | 'INR'
const currencies: CURRENCY[] = ['USD', 'EUR', 'INR']

// const currencyRates: Record<CURRENCY, number> = {
//     USD: 1,
//     EUR: 0.85,
//     INR: 83.0
// }

interface Plan {
    name: string
    info: string
    tag?: string
    price: number // single price instead of monthly/yearly
    features: {
        text: string
        tooltip?: string
    }[]
    btn: {
        text: string
    }
    highlighted?: boolean
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
    plans: Plan[]
    currency: CURRENCY
    setCurrency: React.Dispatch<React.SetStateAction<CURRENCY>>
}

export function PricingSection({ plans, currency, ...props }: PricingSectionProps) {
    return (
        <div
            className={cn('flex w-full flex-col items-center justify-center space-y-5 p-4', props.className)}
            {...props}>
            {/* Currency Toggle Only */}
            {/* <CurrencySelector
                currency={currency}
                setCurrency={setCurrency}
            /> */}

            {/* Pricing Cards */}
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        currency={currency}
                    />
                ))}
            </div>
        </div>
    )
}

type CurrencySelectorProps = React.ComponentProps<'div'> & {
    currency: CURRENCY
    setCurrency: React.Dispatch<React.SetStateAction<CURRENCY>>
}

export function CurrencySelector({ currency, setCurrency, ...props }: CurrencySelectorProps) {
    return (
        <div
            className={cn('bg-[#262626] mx-auto flex w-fit rounded-full border border-white/10 p-1', props.className)}
            {...props}>
            {currencies.map((curr) => (
                <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className="relative px-4 py-1 text-sm uppercase">
                    <span className="text-white relative z-10">{curr}</span>
                    {currency === curr && (
                        <motion.span
                            layoutId="currency"
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-white absolute inset-0 z-10 rounded-full mix-blend-difference"
                        />
                    )}
                </button>
            ))}
        </div>
    )
}

type PricingCardProps = React.ComponentProps<'div'> & {
    plan: Plan
    currency?: CURRENCY
}

export function PricingCard({ plan, className, ...props }: PricingCardProps) {
    // const convertedPrice = plan.price * currencyRates[currency]

    // const formatPrice = (price: number, currency: CURRENCY) => {
    //     return new Intl.NumberFormat('en-US', {
    //         style: 'currency',
    //         currency,
    //         minimumFractionDigits: currency === 'USD' || currency === 'EUR' ? 2 : 0,
    //         maximumFractionDigits: currency === 'INR' ? 0 : 2
    //     }).format(price)
    // }

    return (
        <div
            className={cn('relative flex w-full flex-col rounded-lg border border-white/10', className)}
            {...props}>
            {plan.highlighted && (
                <BorderTrail
                    style={{
                        boxShadow: '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)'
                    }}
                    size={100}
                />
            )}
            <div className="bg-[#262626] rounded-t-lg border-b border-white/10 p-4">
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                    {plan.highlighted && (
                        <p className="bg-white flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-xs">
                            <StarIcon className="h-3 w-3 fill-current" />
                            Popular
                        </p>
                    )}
                </div>

                <div className="text-lg font-medium text-white">{plan.name}</div>
                {plan.tag && <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{plan.tag}</p>}
                <p className="text-white text-sm font-normal">{plan.info}</p>
                {/* <h3 className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">{formatPrice(convertedPrice, currency)}</span>
                </h3> */}
            </div>
            <div className="text-white space-y-4 px-4 py-6 text-sm">
                {plan.features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2">
                        <CheckCircleIcon className="text-white h-4 w-4" />
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <p className={cn(feature.tooltip && 'cursor-pointer border-b border-white/10 border-dashed')}>{feature.text}</p>
                                </TooltipTrigger>
                                {feature.tooltip && (
                                    <TooltipContent>
                                        <p>{feature.tooltip}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ))}
            </div>
            <div className="mt-auto w-full border-t border-white/10/10 p-3">
                <NavLink href="#contact">
                    <Button
                        className={`w-full ${plan.highlighted ? 'bg-white text-black font-semibold hover:bg-gray-200' : 'bg-black text-white hover:bg-[#262626]'}`}
                        variant={plan.highlighted ? 'default' : 'outline'}
                        asChild>
                        <span>{plan.btn.text}</span>
                    </Button>
                </NavLink>
            </div>
        </div>
    )
}

// Same BorderTrail as before
type BorderTrailProps = {
    className?: string
    size?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transition?: any
    delay?: number
    onAnimationComplete?: () => void
    style?: React.CSSProperties
}

export function BorderTrail({ className, size = 60, transition, delay, onAnimationComplete, style }: BorderTrailProps) {
    const BASE_TRANSITION = { repeat: Infinity, duration: 5, ease: 'linear' }

    return (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
            <motion.div
                className={cn('absolute aspect-square bg-zinc-500', className)}
                style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, ...style }}
                animate={{ offsetDistance: ['0%', '100%'] }}
                transition={{ ...(transition ?? BASE_TRANSITION), delay }}
                onAnimationComplete={onAnimationComplete}
            />
        </div>
    )
}
