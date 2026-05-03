import './App.css'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, useLocation, Outlet } from 'react-router-dom'

// Components
import Loader from './components/user/common/Loader'
import NotFound from './components/user/not-found/NotFound'
import { Navbar } from './components/ui/navbar'
import OfflinePage from './components/user/common/OfflinePage'
import Footer from './components/ui/animated-footer'
import BackToTopButton from './components/user/common/BackToTopButton'
import WhatsAppButton from './components/user/common/WhatsAppButton'
import SmoothScroll from './components/common/SmoothScroll'
import { dashboardLoginUrl } from './config/tenant'

// Lazy load pages
const Home = lazy(() => import('./pages/user/Home'))
const WorkPage = lazy(() => import('./pages/user/work'))
const AboutPage = lazy(() => import('./pages/user/About'))
const PricingPage = lazy(() => import('./pages/user/Pricing'))
const ContactPage = lazy(() => import('./pages/user/Contact'))

// Programs
const Program = lazy(() => import('./pages/user/programs/Program'))

// Resources
const Blogs = lazy(() => import('./pages/user/resources/Blogs'))
const BlogPost = lazy(() => import('./pages/user/resources/BlogPost'))
const Tutorials = lazy(() => import('./pages/user/resources/Tutorials'))
const TutorialTopic = lazy(() => import('./pages/user/resources/TutorialTopic'))
const TutorialChapter = lazy(() => import('./pages/user/resources/TutorialChapter'))
const SoftSkills = lazy(() => import('./pages/user/resources/SoftSkills'))
const SoftSkillSession = lazy(() => import('./pages/user/resources/SoftSkillSession'))
const CaseStudies = lazy(() => import('./pages/user/resources/CaseStudies'))
const CaseStudyDetail = lazy(() => import('./pages/user/resources/CaseStudyDetail'))
const InterviewGuides = lazy(() => import('./pages/user/resources/InterviewGuides'))
const InterviewGuideDetail = lazy(() => import('./pages/user/resources/InterviewGuideDetail'))
const CheatSheet = lazy(() => import('./pages/user/resources/CheatSheet'))
const CheatSheetDetail = lazy(() => import('./pages/user/resources/CheatSheetDetail'))

// Policies
const TermsOfUse = lazy(() => import('./pages/user/policies/TermsOfUse'))
const PrivacyPolicy = lazy(() => import('./pages/user/policies/PrivacyPolicy'))
const RefundPolicy = lazy(() => import('./pages/user/policies/RefundPolicy'))
const EscalationPolicy = lazy(() => import('./pages/user/policies/EscalationPolicy'))
const ExaminationPolicy = lazy(() => import('./pages/user/policies/ExaminationPolicy'))

// Admin / dashboard work happens on the LMS Frontend (Frontend/), not here.
// Any /admin/* hit on this site bounces to VITE_DASHBOARD_URL/login.
function DashboardRedirect() {
    useEffect(() => {
        window.location.replace(dashboardLoginUrl())
    }, [])
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] text-sm text-white/70">
            Redirecting to the dashboard…
        </div>
    )
}

function PublicLayout() {
    return (
        <div>
            <SmoothScroll />
            <Navbar />
            <BackToTopButton />
            <WhatsAppButton />
            <Outlet />
            <Footer copyrightText="Albero Academy 2026. All Rights Reserved" />
        </div>
    )
}

export default function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const location = useLocation()

    useEffect(() => {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number | string | HTMLElement, opts?: object) => void } }).__lenis
        if (location.state?.scrollTo) {
            const section = document.getElementById(location.state.scrollTo)
            if (section) {
                if (lenis) {
                    lenis.scrollTo(section, { offset: -80, duration: 1.2 })
                } else {
                    const y = section.getBoundingClientRect().top + window.pageYOffset - 80
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }
            }
        } else {
            if (lenis) {
                lenis.scrollTo(0, { immediate: true })
            } else {
                window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
            }
        }
    }, [location])

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOnline) {
        return <OfflinePage />
    }

    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                {/* Public site */}
                <Route element={<PublicLayout />}>
                    <Route
                        path="/"
                        element={<Home />}
                    />
                    <Route
                        path="/work"
                        element={<WorkPage />}
                    />
                    <Route
                        path="/about"
                        element={<AboutPage />}
                    />
                    <Route
                        path="/pricing"
                        element={<PricingPage />}
                    />
                    <Route
                        path="/contact"
                        element={<ContactPage />}
                    />

                    {/* Programs */}
                    <Route
                        path="/programs/:slug"
                        element={<Program />}
                    />

                    {/* Resources */}
                    <Route
                        path="/resources/blogs"
                        element={<Blogs />}
                    />
                    <Route
                        path="/resources/blogs/:slug"
                        element={<BlogPost />}
                    />
                    <Route
                        path="/resources/tutorials"
                        element={<Tutorials />}
                    />
                    <Route
                        path="/resources/tutorials/:slug"
                        element={<TutorialTopic />}
                    />
                    <Route
                        path="/resources/tutorials/:topic/:chapter"
                        element={<TutorialChapter />}
                    />
                    <Route
                        path="/resources/soft-skills"
                        element={<SoftSkills />}
                    />
                    <Route
                        path="/resources/soft-skills/:slug"
                        element={<SoftSkillSession />}
                    />
                    <Route
                        path="/resources/case-studies"
                        element={<CaseStudies />}
                    />
                    <Route
                        path="/resources/case-studies/:slug"
                        element={<CaseStudyDetail />}
                    />
                    <Route
                        path="/resources/interview-guides"
                        element={<InterviewGuides />}
                    />
                    <Route
                        path="/resources/interview-guides/:slug"
                        element={<InterviewGuideDetail />}
                    />
                    <Route
                        path="/resources/cheatsheet"
                        element={<CheatSheet />}
                    />
                    <Route
                        path="/resources/cheatsheet/:slug"
                        element={<CheatSheetDetail />}
                    />

                    {/* Policies */}
                    <Route
                        path="/policies/terms"
                        element={<TermsOfUse />}
                    />
                    <Route
                        path="/policies/privacy"
                        element={<PrivacyPolicy />}
                    />
                    <Route
                        path="/policies/refund"
                        element={<RefundPolicy />}
                    />
                    <Route
                        path="/policies/escalation"
                        element={<EscalationPolicy />}
                    />
                    <Route
                        path="/policies/examination"
                        element={<ExaminationPolicy />}
                    />

                    {/* Legacy redirects (keep deep links working) */}
                    <Route
                        path="/refund-policy"
                        element={<RefundPolicy />}
                    />
                    <Route
                        path="/terms-and-policies"
                        element={<TermsOfUse />}
                    />

                    {/* 404 — keep public chrome */}
                    <Route
                        path="*"
                        element={<NotFound />}
                    />
                </Route>

                {/* /admin/* on this site bounces to the LMS dashboard. */}
                <Route
                    path="/admin/*"
                    element={<DashboardRedirect />}
                />
                <Route
                    path="/login"
                    element={<DashboardRedirect />}
                />
            </Routes>
        </Suspense>
    )
}
