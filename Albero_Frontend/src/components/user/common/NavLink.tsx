import { useLocation, useNavigate } from 'react-router-dom'

export const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        const targetId = href.replace('#', '')

        if (location.pathname !== '/') {
            // Navigate to home, then scroll after load
            navigate('/', { state: { scrollTo: targetId } })
        } else {
            // Already on home → scroll directly with offset
            const section = document.getElementById(targetId)
            if (section) {
                const yOffset = -60 // 👈 adjust this to your navbar height
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset

                window.scrollTo({ top: y, behavior: 'smooth' })
            }
        }
    }

    return (
        <a
            href={href}
            onClick={handleClick}>
            {children}
        </a>
    )
}
