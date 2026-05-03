// Single source of truth for the tenant this site represents on the LMS
// backend. Override with VITE_TENANT_SLUG when this codebase is reused for
// another institute. The slug must match a tenant.slug seeded in the LMS.
export const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'albero-academy'

// LMS Frontend dashboard URL — auth + admin/student/trainer/counsellor
// dashboards live there, not in this marketing site. The navbar "Sign in"
// button hands off to this URL's /login page.
export const DASHBOARD_URL = (import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174').replace(/\/+$/, '')

export const dashboardLoginUrl = (): string => `${DASHBOARD_URL}/login`
