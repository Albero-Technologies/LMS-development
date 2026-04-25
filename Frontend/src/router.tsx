import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@shared/layouts/PublicLayout'
import { AppLayout } from '@shared/layouts/AppLayout'
import { ProtectedRoute } from '@shared/components/ProtectedRoute'
import { ROLES } from '@shared/constants/roles'

// Public marketing + enquiry
import { LandingPage } from '@features/marketing/pages/LandingPage'
import { NotFoundPage } from '@features/marketing/pages/NotFoundPage'
import { PublicCoursesPage } from '@features/marketing/pages/PublicCoursesPage'
import { PublicCourseDetailPage } from '@features/marketing/pages/PublicCourseDetailPage'
import { PricingPage } from '@features/marketing/pages/PricingPage'
import { AboutPage } from '@features/marketing/pages/AboutPage'
import { EnquiryPage } from '@features/enquiry/pages/EnquiryPage'

// Auth
import { LoginPage } from '@features/auth/pages/LoginPage'
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage'

// Dashboards
import { StudentDashboard } from '@features/dashboards/pages/StudentDashboard'
import { TrainerDashboard } from '@features/dashboards/pages/TrainerDashboard'
import { AdminDashboard } from '@features/dashboards/pages/AdminDashboard'
import { CounsellorDashboard } from '@features/dashboards/pages/CounsellorDashboard'
import { SupportDashboard } from '@features/dashboards/pages/SupportDashboard'

// Domain pages
import { CoursesPage } from '@features/courses/pages/CoursesPage'
import { CourseDetailPage } from '@features/courses/pages/CourseDetailPage'
import { CourseBuilderPage } from '@features/courses/pages/CourseBuilderPage'
import { QuizzesPage } from '@features/quizzes/pages/QuizzesPage'
import { QuizBuilderPage } from '@features/quizzes/pages/QuizBuilderPage'
import { TakeQuizPage } from '@features/quizzes/pages/TakeQuizPage'
import { BatchesPage } from '@features/batches/pages/BatchesPage'
import { UsersPage } from '@features/users/pages/UsersPage'
import { EnrollmentsPage } from '@features/enrollments/pages/EnrollmentsPage'
import { PaymentsPage } from '@features/payments/pages/PaymentsPage'
import { TicketsPage } from '@features/tickets/pages/TicketsPage'
import { TicketDetailPage } from '@features/tickets/pages/TicketDetailPage'
import { NotificationsPage } from '@features/notifications/pages/NotificationsPage'
import { SettingsPage } from '@features/settings/pages/SettingsPage'
import { ReportsPage } from '@features/reports/pages/ReportsPage'
import { OnboardingPage } from '@features/onboarding/pages/OnboardingPage'
import { LeadPipelinePage } from '@features/counsellor/pages/LeadPipelinePage'
import { CounsellorLinksPage } from '@features/counsellor/pages/CounsellorLinksPage'
import { AuditLogsPage } from '@features/audit/pages/AuditLogsPage'

// Super Admin · internal tooling
import { TenantsPage } from '@features/admin/pages/TenantsPage'
import { WebsiteEditorPage } from '@features/admin/pages/WebsiteEditorPage'
import { UtmBuilderPage } from '@features/admin/pages/UtmBuilderPage'
import { SeoBuilderPage } from '@features/admin/pages/SeoBuilderPage'
import { DemoControlPage } from '@features/admin/pages/DemoControlPage'

export const router = createBrowserRouter([
    // -------------------------------------------------------------- Public --
    {
        element: <PublicLayout />,
        children: [
            { path: '/', element: <LandingPage /> },
            { path: '/courses', element: <PublicCoursesPage /> },
            { path: '/courses/:slug/public', element: <PublicCourseDetailPage /> },
            { path: '/pricing', element: <PricingPage /> },
            { path: '/about', element: <AboutPage /> }
        ]
    },

    // Enquiry form — public, captures leads via round-robin to a counsellor.
    { path: '/enquiry', element: <EnquiryPage /> },

    // Auth (no public tenant registration — tenants are created by super admin).
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },

    // Legacy /register route — redirect to enquiry so any old links don't break.
    {
        path: '/register',
        element: (
            <Navigate
                to="/enquiry"
                replace
            />
        )
    },

    // Counsellor-invite onboarding (public, token-scoped)
    { path: '/onboarding/:token', element: <OnboardingPage /> },
    {
        path: '/thank-you',
        element: (
            <div className="min-h-screen bg-surface-2 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <h1 className="text-3xl font-bold text-brand tracking-tight">You're in.</h1>
                    <p className="mt-4 text-fg-soft">We just emailed your counsellor. They'll share your login credentials within an hour.</p>
                </div>
            </div>
        )
    },

    // -------------------------------------------------------------- App ----
    {
        path: '/app',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <Navigate
                        to="/app/student"
                        replace
                    />
                )
            },

            // Dashboards
            {
                path: 'student',
                element: (
                    <ProtectedRoute roles={[ROLES.STUDENT]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'trainer',
                element: (
                    <ProtectedRoute roles={[ROLES.TRAINER]}>
                        <TrainerDashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'counsellor',
                element: (
                    <ProtectedRoute roles={[ROLES.COUNSELLOR, ROLES.COUNSELLING_MANAGER]}>
                        <CounsellorDashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'counsellor/pipeline',
                element: (
                    <ProtectedRoute roles={[ROLES.COUNSELLOR, ROLES.COUNSELLING_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                        <LeadPipelinePage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'counsellor/invites',
                element: (
                    <ProtectedRoute roles={[ROLES.COUNSELLOR, ROLES.COUNSELLING_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                        <CounsellorLinksPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/demo-control',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                        <DemoControlPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'support',
                element: (
                    <ProtectedRoute roles={[ROLES.SUPPORT]}>
                        <SupportDashboard />
                    </ProtectedRoute>
                )
            },
            // Courses
            { path: 'courses', element: <CoursesPage /> },
            { path: 'courses/:id', element: <CourseDetailPage /> },
            {
                path: 'courses/:id/builder',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER]}>
                        <CourseBuilderPage />
                    </ProtectedRoute>
                )
            },

            // Quizzes
            { path: 'quizzes', element: <QuizzesPage /> },
            {
                path: 'quizzes/:id/edit',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER]}>
                        <QuizBuilderPage />
                    </ProtectedRoute>
                )
            },
            { path: 'quizzes/:id/take', element: <TakeQuizPage /> },

            // Batches
            { path: 'batches', element: <BatchesPage /> },

            // Users
            {
                path: 'users',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.COUNSELLING_MANAGER, ROLES.SUPPORT, ROLES.TRAINER]}>
                        <UsersPage />
                    </ProtectedRoute>
                )
            },

            // Money
            { path: 'enrollments', element: <EnrollmentsPage /> },
            {
                path: 'payments',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER, ROLES.STUDENT]}>
                        <PaymentsPage />
                    </ProtectedRoute>
                )
            },

            // Tickets
            { path: 'tickets', element: <TicketsPage /> },
            { path: 'tickets/:id', element: <TicketDetailPage /> },

            // Utility
            { path: 'notifications', element: <NotificationsPage /> },
            { path: 'settings', element: <SettingsPage /> },
            {
                path: 'reports',
                element: (
                    <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.COUNSELLING_MANAGER]}>
                        <ReportsPage />
                    </ProtectedRoute>
                )
            },

            // -------- Super Admin · internal only --------
            {
                path: 'admin/tenants',
                element: (
                    <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                        <TenantsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/website-editor',
                element: (
                    <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                        <WebsiteEditorPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/utm-builder',
                element: (
                    <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                        <UtmBuilderPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/seo-builder',
                element: (
                    <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                        <SeoBuilderPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'audit-logs',
                element: (
                    <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                        <AuditLogsPage />
                    </ProtectedRoute>
                )
            }
        ]
    },

    { path: '*', element: <NotFoundPage /> }
])
