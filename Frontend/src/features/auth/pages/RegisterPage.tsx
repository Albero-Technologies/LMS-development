import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { registerSchema, type TRegister } from '../schemas/auth.schema'
import { registerRequest } from '../services/auth.service'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLE_HOME } from '@shared/constants/roles'
import { toApiError } from '@shared/libs/api'

export const RegisterPage = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TRegister>({ resolver: zodResolver(registerSchema) })

    const mutation = useMutation({
        mutationFn: (data: TRegister) => {
            const [first, ...rest] = data.name.trim().split(/\s+/)
            return registerRequest({
                tenantName: data.tenantName,
                email: data.email,
                password: data.password,
                phone: data.phone,
                firstName: first ?? data.name.trim(),
                lastName: rest.join(' ')
            })
        },
        onSuccess: ({ accessToken, user }) => {
            setAuth(user, accessToken)
            toast.success('Tenant created — welcome to Albero Academy')
            navigate(ROLE_HOME[user.role], { replace: true })
        },
        onError: (err) => toast.error(toApiError(err).message || 'Registration failed')
    })

    return (
        <AuthShell
            title="Create your"
            titleAccent="tenant."
            subtitle="You become the first admin. Invite your team after."
            footer={
                <span>
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-brand hover:underline font-medium">
                        Sign in
                    </Link>
                </span>
            }>
            <form
                onSubmit={handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4">
                <Input
                    label="Institute name"
                    placeholder="Ascend Academy"
                    leftIcon={<Building2 size={14} />}
                    error={errors.tenantName?.message}
                    {...register('tenantName')}
                />
                <Input
                    label="Your name"
                    placeholder="Priya Shetty"
                    leftIcon={<User size={14} />}
                    error={errors.name?.message}
                    {...register('name')}
                />
                <Input
                    label="Work email"
                    type="email"
                    placeholder="priya@ascend.in"
                    leftIcon={<Mail size={14} />}
                    error={errors.email?.message}
                    {...register('email')}
                />
                <Input
                    label="Phone (optional)"
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    {...register('phone')}
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    leftIcon={<Lock size={14} />}
                    error={errors.password?.message}
                    {...register('password')}
                />
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={mutation.isPending}
                    rightIcon={<ArrowRight size={16} />}>
                    Create tenant
                </Button>
                <p className="text-xs text-fg-muted">By creating a tenant you agree to our Terms and Privacy Policy.</p>
            </form>
        </AuthShell>
    )
}
