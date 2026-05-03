import axios, { type InternalAxiosRequestConfig } from 'axios'
import { TENANT_SLUG } from '@/config/tenant'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Inject the tenant slug header on every request. The backend resolves the
// tenant from this header on routes that would otherwise require sub-domain
// parsing (`/enquiries`, public CMS reads, etc.). This site is purely public,
// so no auth tokens — admin work happens on the LMS dashboard (Frontend/).
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.headers) {
        config.headers['X-Tenant-Slug'] = TENANT_SLUG
    }
    return config
})

export default apiClient
