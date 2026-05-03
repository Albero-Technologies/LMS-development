import { useState } from 'react'
import { sendContactForm, type ContactData } from '@/services/contactService'
import { showSuccess, showError } from '@/lib/toast'

export const useContactForm = () => {
    const [loading, setLoading] = useState(false)

    const submitForm = async (formData: ContactData): Promise<boolean> => {
        setLoading(true)
        try {
            await sendContactForm(formData)
            showSuccess('Message sent successfully!')
            return true
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const response = (err as { response?: { data?: { message?: string } } }).response
                showError(response?.data?.message || 'Something went wrong!')
            } else {
                showError('Something went wrong!')
            }
            return false
        } finally {
            setLoading(false)
        }
    }

    return { submitForm, loading }
}
