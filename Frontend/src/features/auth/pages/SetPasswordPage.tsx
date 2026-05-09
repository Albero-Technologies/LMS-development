import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLE_HOME } from '@shared/constants/roles'
import { toApiError } from '@shared/libs/api'
import { setPasswordWithTokenRequest, verifyResetTokenRequest } from '../services/auth.service'

// Two-step set-password flow.
//   1. GET ?token=… → verify the token, render the form, show the masked email.
//   2. POST → consume the token, sign the user in, push them to ROLE_HOME.
// Errors at step 1 short-circuit to a friendly "link expired" panel; the
// student can request a fresh link from the forgot-password page.

const setPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'At least 8 characters')
            .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Include a letter and a digit'),
        confirmPassword: z.string()
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match'
    })

type FormValues = z.infer<typeof setPasswordSchema>

export const SetPasswordPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const setAuth = useAuthStore((s) => s.setAuth)

    const token = searchParams.get('token') ?? ''

    const verifyQuery = useQuery({
        queryKey: ['auth', 'verify-set-password', token],
        queryFn: () => verifyResetTokenRequest(token),
        enabled: !!token,
        retry: false,
        staleTime: 30_000
    })

    const [showPassword, setShowPassword] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormValues>({ resolver: zodResolver(setPasswordSchema) })

    const mutation = useMutation({
        mutationFn: (values: FormValues) => setPasswordWithTokenRequest({ token, newPassword: values.newPassword }),
        onSuccess: ({ accessToken, user }) => {
            setAuth(user, accessToken, { remember: true })
            toast.success('Password set — you are signed in')
            navigate(ROLE_HOME[user.role] ?? '/app/student', { replace: true })
        },
        onError: (err) => {
            const e = toApiError(err)
            toast.error(e.message || 'Could not set password')
        }
    })

    // No token in URL → bounce to login (the email link should always have one).
    useEffect(() => {
        if (!token) navigate('/login', { replace: true })
    }, [token, navigate])

    if (!token) return null

    return (
        <AuthShell
            title="Set your new"
            titleAccent="password"
            subtitle="Pick a strong password to take over your student account. The temporary one stops working once this is set."
            footer={
                <p className="text-xs text-fg-muted">
                    Already changed it? <button className="underline" onClick={() => navigate('/login')}>Sign in →</button>
                </p>
            }>
            {verifyQuery.isLoading && <div className="text-sm text-fg-muted">Validating your link…</div>}

            {verifyQuery.isError && (
                <div className="rounded-md border border-[var(--color-danger,#ef4444)] bg-[var(--color-danger-soft,rgba(239,68,68,0.08))] p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 text-[var(--color-danger,#ef4444)] shrink-0" />
                        <div className="text-sm">
                            <strong className="block text-fg">Link is invalid or expired.</strong>
                            <p className="text-fg-muted mt-1">
                                {toApiError(verifyQuery.error).message ||
                                    'Reset links are good for 24 hours and can be used once. Request a fresh one from the forgot-password page.'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            rightIcon={<ArrowRight size={12} />}
                            onClick={() => navigate('/forgot-password')}>
                            Request new link
                        </Button>
                    </div>
                </div>
            )}

            {verifyQuery.data?.valid && (
                <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                    <div className="rounded-md border bg-surface-2 p-3 flex items-center gap-2 text-xs text-fg-soft">
                        <ShieldCheck size={14} className="text-[var(--color-brand-500)] shrink-0" />
                        <span>
                            Setting password for <strong className="text-fg font-mono">{verifyQuery.data.maskedEmail}</strong>
                        </span>
                    </div>

                    <Input
                        label="New password"
                        type={showPassword ? 'text' : 'password'}
                        leftIcon={<Lock size={14} />}
                        rightSlot={
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="text-fg-muted hover:text-fg"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        }
                        error={errors.newPassword?.message}
                        hint="At least 8 characters with a letter and a digit."
                        autoComplete="new-password"
                        {...register('newPassword')}
                    />

                    <Input
                        label="Confirm new password"
                        type={showPassword ? 'text' : 'password'}
                        leftIcon={<Lock size={14} />}
                        error={errors.confirmPassword?.message}
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                    />

                    <Button type="submit" className="w-full" loading={mutation.isPending} rightIcon={<ArrowRight size={14} />}>
                        Set password & sign in
                    </Button>
                </form>
            )}
        </AuthShell>
    )
}
