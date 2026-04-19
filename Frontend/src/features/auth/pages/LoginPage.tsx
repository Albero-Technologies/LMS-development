import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { loginSchema, type TLogin } from '../schemas/auth.schema'
import { loginRequest } from '../services/auth.service'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLE_HOME } from '@shared/constants/roles'
import { toApiError } from '@shared/libs/api'

export const LoginPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const setAuth = useAuthStore((s) => s.setAuth)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TLogin>({ resolver: zodResolver(loginSchema) })

    const mutation = useMutation({
        mutationFn: loginRequest,
        onSuccess: ({ accessToken, user }) => {
            setAuth(user, accessToken)
            toast.success(`Welcome back, ${user.name || user.email.split('@')[0]}`)
            const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
            navigate(from ?? ROLE_HOME[user.role], { replace: true })
        },
        onError: (err) => {
            const e = toApiError(err)
            toast.error(e.message || 'Unable to sign in')
        }
    })

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue where you left off."
            footer={
                <div className="flex items-center justify-between">
                    <span>
                        New to Albero Academy?{' '}
                        <Link
                            to="/enquiry"
                            className="text-brand hover:underline font-medium">
                            Talk to a counsellor
                        </Link>
                    </span>
                </div>
            }>
            <form
                onSubmit={handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@institute.in"
                    leftIcon={<Mail size={14} />}
                    error={errors.email?.message}
                    {...register('email')}
                />
                <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    leftIcon={<Lock size={14} />}
                    error={errors.password?.message}
                    {...register('password')}
                />
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-fg-soft select-none">
                        <input
                            type="checkbox"
                            className="accent-[var(--color-brand-500)]"
                        />
                        Remember me
                    </label>
                    <Link
                        to="/forgot-password"
                        className="text-fg-soft hover:text-brand">
                        Forgot password?
                    </Link>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={mutation.isPending}
                    rightIcon={<ArrowRight size={16} />}>
                    Sign in
                </Button>
            </form>

            <div className="flex items-center gap-3 my-6 text-xs text-fg-muted">
                <span className="flex-1 h-px bg-[var(--color-border)]" />
                OR
                <span className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
            <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => toast.info('Google OAuth — wire up in auth.service.ts once GOOGLE_CLIENT_ID is set')}>
                Continue with Google
            </Button>
        </AuthShell>
    )
}
