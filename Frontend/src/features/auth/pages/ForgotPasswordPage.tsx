import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, ArrowRight } from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { forgotSchema, type TForgot } from '../schemas/auth.schema'
import { forgotPasswordRequest } from '../services/auth.service'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { toApiError } from '@shared/libs/api'

export const ForgotPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitSuccessful }
    } = useForm<TForgot>({ resolver: zodResolver(forgotSchema) })

    const mutation = useMutation({
        mutationFn: (d: TForgot) => forgotPasswordRequest(d.email),
        onSuccess: () => toast.success('If that email exists, a reset link is on its way.'),
        onError: (err) => toast.error(toApiError(err).message)
    })

    return (
        <AuthShell
            title="Reset your password"
            subtitle="We'll email you a link. It expires in 15 minutes."
            footer={
                <Link
                    to="/login"
                    className="text-brand hover:underline font-medium">
                    Back to sign in
                </Link>
            }>
            <form
                onSubmit={handleSubmit((d) => mutation.mutate(d))}
                className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    placeholder="you@institute.in"
                    leftIcon={<Mail size={14} />}
                    error={errors.email?.message}
                    {...register('email')}
                />
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={mutation.isPending}
                    rightIcon={<ArrowRight size={16} />}>
                    {isSubmitSuccessful ? 'Resend link' : 'Email reset link'}
                </Button>
            </form>
        </AuthShell>
    )
}
