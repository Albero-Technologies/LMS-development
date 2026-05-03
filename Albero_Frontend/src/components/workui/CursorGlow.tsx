import { useEffect, useRef } from 'react'

export default function CursorGlow() {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current!
        const onMove = (e: MouseEvent) => {
            el.style.left = e.clientX + 'px'
            el.style.top = e.clientY + 'px'
        }
        document.addEventListener('mousemove', onMove)
        return () => document.removeEventListener('mousemove', onMove)
    }, [])
    return (
        <div
            ref={ref}
            className="cursor-glow"
        />
    )
}
