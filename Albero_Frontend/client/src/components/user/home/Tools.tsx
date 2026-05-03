import { animate, motion, useMotionValue } from 'motion/react'
import React, { useEffect, useState, type CSSProperties } from 'react'
import useMeasure from 'react-use-measure'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toolsData } from '@/constants/tools'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// ─── InfiniteSlider (unchanged) ───────────────────────────────────────────────

type InfiniteSliderProps = {
    children: React.ReactNode
    gap?: number
    speed?: number
    speedOnHover?: number
    direction?: 'horizontal' | 'vertical'
    reverse?: boolean
    className?: string
}

function InfiniteSlider({
    children,
    gap = 16,
    speed = 100,
    speedOnHover,
    direction = 'horizontal',
    reverse = false,
    className
}: InfiniteSliderProps) {
    const [currentSpeed, setCurrentSpeed] = useState(speed)
    const [ref, { width, height }] = useMeasure()
    const translation = useMotionValue(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [key, setKey] = useState(0)

    useEffect(() => {
        let controls
        const size = direction === 'horizontal' ? width : height
        if (size === 0) return
        const contentSize = size + gap
        const from = reverse ? -contentSize / 2 : 0
        const to = reverse ? 0 : -contentSize / 2
        const duration = Math.abs(to - from) / currentSpeed
        if (isTransitioning) {
            controls = animate(translation, [translation.get(), to], {
                ease: 'linear',
                duration: Math.abs(translation.get() - to) / currentSpeed,
                onComplete: () => {
                    setIsTransitioning(false)
                    setKey((k) => k + 1)
                }
            })
        } else {
            controls = animate(translation, [from, to], {
                ease: 'linear',
                duration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0,
                onRepeat: () => {
                    translation.set(from)
                }
            })
        }
        return () => controls?.stop()
    }, [key, translation, currentSpeed, width, height, gap, isTransitioning, direction, reverse])

    const hoverProps = speedOnHover
        ? {
              onHoverStart: () => {
                  setIsTransitioning(true)
                  setCurrentSpeed(speedOnHover)
              },
              onHoverEnd: () => {
                  setIsTransitioning(true)
                  setCurrentSpeed(speed)
              }
          }
        : {}

    return (
        <div className={cn('overflow-x-hidden overflow-y-visible', className)}>
            <motion.div
                className="flex w-max"
                style={{
                    ...(direction === 'horizontal' ? { x: translation } : { y: translation }),
                    gap: `${gap}px`,
                    flexDirection: direction === 'horizontal' ? 'row' : 'column'
                }}
                ref={ref}
                {...hoverProps}>
                {children}
                {children}
            </motion.div>
        </div>
    )
}

export type BlurredInfiniteSliderProps = InfiniteSliderProps & {
    fadeWidth?: number
    containerClassName?: string
}

export function BlurredInfiniteSlider({ children, fadeWidth = 80, containerClassName, ...sliderProps }: BlurredInfiniteSliderProps) {
    const maskStyle: CSSProperties = {
        maskImage: `linear-gradient(to right, transparent, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent)`,
        WebkitMaskImage: `linear-gradient(to right, transparent, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent)`
    }
    return (
        <div
            className={cn('relative w-full', containerClassName)}
            style={maskStyle}>
            <InfiniteSlider {...sliderProps}>{children}</InfiniteSlider>
        </div>
    )
}

// ─── Row config ───────────────────────────────────────────────────────────────

const rows = [
    { data: toolsData.row1, label: toolsData.rowLabels.row1, sub: '10 technologies', reverse: false, speed: 36 },
    { data: toolsData.row2, label: toolsData.rowLabels.row2, sub: '10 technologies', reverse: true, speed: 42 },
    { data: toolsData.row3, label: toolsData.rowLabels.row3, sub: '15 technologies', reverse: false, speed: 34 }
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LogoCloudDemoPage() {
    return (
        <section className="w-full bg-black overflow-x-hidden py-20">
            {/* ── Section header ── */}
            <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px w-15 bg-gradient-to-r from-transparent to-white/15" />
                <p className="font-barlow-condensed text-[11px] font-bold tracking-[0.18em] uppercase text-white/25 whitespace-nowrap">
                    {toolsData.heading}
                </p>
                <div className="h-px w-15 bg-gradient-to-l from-transparent to-white/15" />
            </div>

            {/* ── Rows ── */}
            <div className="max-w-[1400px] mx-auto">
                {rows.map((row, ri) => (
                    <React.Fragment key={ri}>
                        {/* Row wrapper */}
                        <div className="flex items-center gap-0">
                            {/* Left: vertical bar + label */}
                            <div className="flex-shrink-0 w-[180px] flex items-center gap-[14px] pr-5">
                                {/* Vertical accent bar */}
                                <div
                                    className="w-0.5 h-11 rounded-sm flex-shrink-0"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, transparent, oklch(0.623 0.214 259.815 / 0.7) 40%, oklch(0.623 0.214 259.815 / 0.7) 60%, transparent)'
                                    }}
                                />
                                <div className="flex flex-col gap-[3px]">
                                    <span className="font-barlow-condensed text-[11px] font-bold tracking-[0.12em] uppercase text-white/50 leading-tight">
                                        {row.label}
                                    </span>
                                    <span className="font-barlow text-[10px] text-white/20 tracking-[0.04em]">{row.sub}</span>
                                </div>
                            </div>

                            {/* Slider */}
                            <div
                                className="flex-1 min-w-0 overflow-x-hidden overflow-y-visible pt-3 pb-3"
                                style={{
                                    maskImage: 'linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%)',
                                    WebkitMaskImage:
                                        'linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%)'
                                }}>
                                <InfiniteSlider
                                    speedOnHover={10}
                                    speed={row.speed}
                                    gap={52}
                                    reverse={row.reverse}>
                                    {row.data.map((logo) => (
                                        <div
                                            key={logo.id}
                                            title={logo.iconName}
                                            className="flex items-center justify-center flex-shrink-0 text-white opacity-[0.38] grayscale brightness-90 transition-[opacity,filter] duration-300 ease-in-out cursor-default hover:opacity-100 hover:grayscale-0 hover:brightness-[1.2] hover:text-[#D49C01]">
                                            <logo.icon size={36} />
                                        </div>
                                    ))}
                                </InfiniteSlider>
                            </div>
                        </div>

                        {/* Divider between rows */}
                        {ri < rows.length - 1 && (
                            <div
                                className="h-px my-5 ml-[180px]"
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)'
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </section>
    )
}
