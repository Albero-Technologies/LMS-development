import React from 'react'
import { motion } from 'framer-motion'

const DURATION = 0.25
const STAGGER = 0.025

interface FlipLinkProps {
    children: string
}

const FlipLink: React.FC<FlipLinkProps> = ({ children }) => {
    return (
        <motion.span
            initial="initial"
            whileHover="hovered"
            className="relative inline-block overflow-hidden"
            style={{
                lineHeight: 0.85
            }}>
            <div>
                {children.split('').map((l, i) => (
                    <motion.span
                        variants={{
                            initial: {
                                y: 0
                            },
                            hovered: {
                                y: '-100%'
                            }
                        }}
                        transition={{
                            duration: DURATION,
                            ease: 'easeInOut',
                            delay: STAGGER * i
                        }}
                        className="inline-block mr-0.5"
                        key={i}>
                        {l}
                    </motion.span>
                ))}
            </div>
            <div className="absolute inset-0">
                {children.split('').map((l, i) => (
                    <motion.span
                        variants={{
                            initial: {
                                y: '100%'
                            },
                            hovered: {
                                y: 0
                            }
                        }}
                        transition={{
                            duration: DURATION,
                            ease: 'easeInOut',
                            delay: STAGGER * i
                        }}
                        className="inline-block mr-0.5"
                        key={i}>
                        {l}
                    </motion.span>
                ))}
            </div>
        </motion.span>
    )
}

export default FlipLink
