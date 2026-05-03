import { motion } from 'motion/react'
import React from 'react'

interface ParticleBurstProps {
    x: number
    y: number
    count?: number
    size?: number
    color?: string
    duration?: number
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({ x, y, count = 12, size = 6, color = '#fff', duration = 0.8 }) => {
    const particles = Array.from({ length: count })

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((_, i) => {
                const angle = (i / count) * 2 * Math.PI
                const dx = Math.cos(angle) * 60 // spread distance
                const dy = Math.sin(angle) * 60

                return (
                    <motion.span
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            left: x,
                            top: y
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                            x: dx,
                            y: dy,
                            opacity: 0,
                            scale: 0.5
                        }}
                        transition={{
                            duration,
                            ease: 'easeOut'
                        }}
                    />
                )
            })}
        </div>
    )
}
