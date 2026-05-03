'use client'
import React from 'react'
import { motion } from 'motion/react'

export const TestimonialsColumn = (props: {
    className?: string
    testimonials: Array<{
        text: string
        image: string
        name: string
        role: string
    }>
    duration?: number
}) => {
    return (
        <div className={props.className}>
            <motion.div
                animate={{
                    translateY: '-50%'
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatType: 'loop'
                }}
                className="flex flex-col gap-6 pb-6 bg-background">
                {[
                    ...new Array(2).fill(0).map((_, index) => (
                        <React.Fragment key={index}>
                            {props.testimonials.map(({ text, image, name, role }, i) => (
                                <div
                                    className="p-10 rounded-3xl border-white/10 bg-black/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(255,255,255,0.1),inset_0_0_8px_4px_rgba(255,255,255,0.4)] max-w-xs w-full"
                                    key={i}>
                                    <div className="text-white">{text}</div>
                                    <div className="flex items-center gap-2 mt-5">
                                        <img
                                            width={40}
                                            height={40}
                                            src={image}
                                            alt={name}
                                            className="h-10 w-10 rounded-full"
                                        />
                                        <div className="flex flex-col">
                                            <div className="font-medium tracking-tight leading-5 text-white">{name}</div>
                                            <div className="leading-5 opacity-60 tracking-tight text-white">{role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))
                ]}
            </motion.div>
        </div>
    )
}
