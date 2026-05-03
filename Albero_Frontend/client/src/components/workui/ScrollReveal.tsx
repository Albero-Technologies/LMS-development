import { useEffect } from 'react'

export default function ScrollReveal() {
    useEffect(() => {
        /* ── SCROLL REVEAL ── */
        const allReveal = document.querySelectorAll<HTMLElement>('.reveal,.reveal-left,.reveal-right,.stagger')
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible')
                        io.unobserve(e.target)
                    }
                })
            },
            { threshold: 0.08 }
        )
        allReveal.forEach((el) => io.observe(el))

        /* ── COUNTER ANIMATION ── */
        function animateCounter(el: Element) {
            const accent = el.querySelector('.stat-accent')
            if (!accent) return
            const target = +(el as HTMLElement).dataset.target!
            const duration = 1800
            const step = target / (duration / 16)
            let current = 0
            const tick = () => {
                current = Math.min(current + step, target)
                const first = el.firstChild as Text
                if (first) first.textContent = Math.floor(current).toString()
                if (current < target) requestAnimationFrame(tick)
            }
            tick()
        }
        const counterEls = document.querySelectorAll('.stat-num[data-target]')
        const cio = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        animateCounter(e.target)
                        cio.unobserve(e.target)
                    }
                })
            },
            { threshold: 0.5 }
        )
        counterEls.forEach((el) => cio.observe(el))

        /* ── PROJECT SLIDERS ── */
        const sliders = ['web', 'ecom', 'steam', 'digital', 'erp']
        sliders.forEach((id) => {
            const track = document.getElementById('slides-' + id)
            const btnPrev = document.getElementById('prev-' + id) as HTMLButtonElement | null
            const btnNext = document.getElementById('next-' + id) as HTMLButtonElement | null
            const curEl = document.getElementById('cur-' + id)
            const dotsWrap = document.getElementById('dots-' + id)
            if (!track || !btnPrev || !btnNext || !curEl || !dotsWrap) return

            const slides = track.querySelectorAll<HTMLElement>('.project-slide')
            const total = slides.length
            let current = 0

            slides.forEach((_, i) => {
                const d = document.createElement('button')
                d.className = 'slider-dot' + (i === 0 ? ' active' : '')
                d.setAttribute('aria-label', 'Go to slide ' + (i + 1))
                d.addEventListener('click', () => goTo(i))
                dotsWrap.appendChild(d)
            })

            function goTo(idx: number) {
                current = idx
                track!.style.transform = `translateX(-${current * 100}%)`
                curEl!.textContent = String(current + 1)
                btnPrev!.disabled = current === 0
                btnNext!.disabled = current === total - 1
                dotsWrap!.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current))
                const activeSlide = slides[current]
                activeSlide.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach((el) => {
                    el.classList.remove('visible')
                    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')))
                })
            }

            btnPrev.addEventListener('click', () => {
                if (current > 0) goTo(current - 1)
            })
            btnNext.addEventListener('click', () => {
                if (current < total - 1) goTo(current + 1)
            })

            let startX = 0
            track.addEventListener(
                'touchstart',
                (e) => {
                    startX = e.touches[0].clientX
                },
                { passive: true }
            )
            track.addEventListener(
                'touchend',
                (e) => {
                    const diff = startX - e.changedTouches[0].clientX
                    if (Math.abs(diff) > 50) {
                        if (diff > 0 && current < total - 1) goTo(current + 1)
                        if (diff < 0 && current > 0) goTo(current - 1)
                    }
                },
                { passive: true }
            )

            track.closest('.project-slider')?.addEventListener('keydown', (e: Event) => {
                const ke = e as KeyboardEvent
                if (ke.key === 'ArrowRight' && current < total - 1) goTo(current + 1)
                if (ke.key === 'ArrowLeft' && current > 0) goTo(current - 1)
            })

            const sectionReveal = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            slides[0].querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach((el) => el.classList.add('visible'))
                            sectionReveal.unobserve(entry.target)
                        }
                    })
                },
                { threshold: 0.1 }
            )
            const slider = track.closest('.project-slider')
            if (slider) sectionReveal.observe(slider)
        })

        return () => {
            io.disconnect()
            cio.disconnect()
        }
    }, [])

    return null
}
