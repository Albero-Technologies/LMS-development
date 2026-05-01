import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@shared/stores/authStore'
import type { TRole } from '@shared/constants/roles'
import { BoxLoader } from '@shared/components/BoxLoader'

type Props = {
    children: ReactNode
    roles?: TRole[]
}

export const ProtectedRoute = ({ children, roles }: Props) => {
    const { user, hydrated } = useAuthStore()
    const location = useLocation()

    if (!hydrated)
        return (
            <BoxLoader
                fullscreen
                size="lg"
            />
        )

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        )
    }

    if (roles && !roles.includes(user.role)) {
        return (
            <Navigate
                to="/app"
                replace
            />
        )
    }

    return <>{children}</>
}
