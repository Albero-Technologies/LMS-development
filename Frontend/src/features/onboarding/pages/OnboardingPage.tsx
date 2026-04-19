// Public counsellor-invite onboarding form (matches the backend
// `/api/v1/onboarding/:token/submit` flow). A student arrives via a
// share-link → fills this form → gets credentials emailed back.
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { api, toApiError } from '@shared/libs/api'
import { Brand } from '@shared/components/Brand'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'

const schema = z.object({
    name: z.string().min(2, 'Full name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(8, 'Phone number required'),
    qualification: z.string().optional(),
    note: z.string().optional()
})
type TForm = z.infer<typeof schema>

export const OnboardingPage = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TForm>({ resolver: zodResolver(schema) })

    const mutation = useMutation({
        mutationFn: async (d: TForm) => {
            const { data } = await api.post(`/onboarding/${token}/submit`, d)
            return data
        },
        onSuccess: () => {
            toast.success('Application submitted — your counsellor will share credentials shortly.')
            navigate('/thank-you', { replace: true })
        },
        onError: (err) => toast.error(toApiError(err).message)
    })

    return (
        <div className="min-h-screen bg-aurora-soft flex items-center justify-center p-6 noise">
            <div className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-6">
                    <Brand />
                    <Badge tone="brand">Counsellor invite</Badge>
                </div>
                <Card>
                    <h1 className="font-display text-3xl mb-2">Tell us a little about yourself</h1>
                    <p className="text-sm text-ink-400 mb-6">
                        Your counsellor created this link just for you. We'll use these details to enrol you and share
                        login credentials over email.
                    </p>
                    <form
                        onSubmit={handleSubmit((d) => mutation.mutate(d))}
                        className="space-y-4">
                        <Input
                            label="Full name"
                            error={errors.name?.message}
                            {...register('name')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                        <Input
                            label="Highest qualification (optional)"
                            {...register('qualification')}
                        />
                        <Input
                            label="Anything else we should know (optional)"
                            {...register('note')}
                        />
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            loading={mutation.isPending}
                            rightIcon={<ArrowRight size={16} />}>
                            Submit application
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}
