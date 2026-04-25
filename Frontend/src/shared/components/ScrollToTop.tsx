import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Resets window scroll on every navigation. Without this, react-router preserves
// the previous page's scroll position, so a long page → short page leaves the
// short page rendered mid-way down. Mounted inside each layout so it lives in
// the router context and re-runs whenever pathname changes.
export const ScrollToTop = () => {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, [pathname])
    return null
}
