import { Hero } from '@/components/user/home/Hero'
import ProgramsShowcase from '@/components/user/home/lms/ProgramsShowcase'
import LearningExperience from '@/components/user/home/lms/LearningExperience'
import Outcomes from '@/components/user/home/lms/Outcomes'
import HiringPartners from '@/components/user/home/lms/HiringPartners'
import CertificationPath from '@/components/user/home/lms/CertificationPath'
import Collaboration from '@/components/user/home/lms/Collaboration'
import ThreeSection from '@/components/user/home/lms/ThreeSection'
import InteractiveSkillsGrid from '@/components/user/home/lms/InteractiveSkillsGrid'
import StaircaseClimb from '@/components/user/home/lms/StaircaseClimb'
import MobileLadderClimb from '@/components/user/home/lms/MobileLadderClimb'
import Mentors from '@/components/user/home/lms/Mentors'
import LearnerStories from '@/components/user/home/lms/LearnerStories'
import Certifications from '@/components/user/home/lms/Certifications'
import FAQSection from '@/components/user/home/lms/FAQSection'
import FinalCTA from '@/components/user/home/lms/FinalCTA'
import SEO from '@/components/user/common/SEO'
import { heroData } from '@/constants/hero'
import { homeSEO } from '@/constants/seo'
import StructuredData from '@/components/user/common/StructuredData'

// Meritshot/ArmorCode-parity sections — additive, slot in next to the
// existing components so the redesign doesn't lose any of the content
// the marketing team has already authored.
import { StatsBar } from '@/components/user/program-page/StatsBar'
import { CareerRoadmap } from '@/components/user/program-page/CareerRoadmap'
import { SuccessStories } from '@/components/user/program-page/SuccessStories'
import { ProgramExplorer } from '@/components/user/program-page/ProgramExplorer'
import { AlumniCompanyWall } from '@/components/user/program-page/AlumniCompanyWall'
import { VideoTestimonial } from '@/components/user/program-page/VideoTestimonial'
import { ALUMNI_COMPANIES, FEATURED_SUCCESS_STORIES, HOME_ROADMAP_STEPS } from '@/constants/program-extras'
import { programs as PROGRAMS } from '@/constants/programs'

export default function Home() {
    return (
        <div>
            <SEO
                title={homeSEO.title}
                description={homeSEO.description}
                keywords={homeSEO.keywords}
                url={homeSEO.url}
                canonical={homeSEO.canonical}
                image={homeSEO.image}
                type={homeSEO.type}
            />

            <Hero
                title={heroData.title}
                subtitle={heroData.subtitle}
                eyebrow={heroData.eyebrow}
                ctaLabel={heroData.ctaLabel}
            />

            {/* Stats bar — moves headline social proof above the fold for
                first-time visitors. Numbers are placeholders; the CMS will
                drive these once the homepage_stats schema lands. */}
            <StatsBar
                tone="deep"
                stats={[
                    { label: 'Students placed', value: 18000, suffix: '+' },
                    { label: 'Success rate', value: 95, suffix: '%' },
                    { label: 'Rating', value: 0, prefix: '4.8', suffix: '/5' },
                    { label: 'Hiring partners', value: 180, suffix: '+' }
                ]}
            />

            <ProgramsShowcase />

            {/* Interactive program selector — Meritshot-style left rail +
                right detail panel. Mobile collapses to a vertical accordion. */}
            <ProgramExplorer
                programs={PROGRAMS.slice(0, 6).map((p) => ({
                    slug: p.slug,
                    title: p.title,
                    duration: p.duration,
                    badge: p.badge,
                    bullets: p.highlights.slice(0, 3),
                    techTags: p.tools.slice(0, 6),
                    priceLabel: p.fees.find((t) => t.recommended)?.price ?? p.fees[0]?.price
                }))}
            />

            {/* Career roadmap — the 4-step process every student walks. */}
            <CareerRoadmap steps={HOME_ROADMAP_STEPS} />

            <InteractiveSkillsGrid />
            <LearningExperience />
            <StaircaseClimb />
            <MobileLadderClimb />
            <ThreeSection />
            <Outcomes />
            <CertificationPath />

            {/* Auto-scrolling alumni-logo wall — same Ticker component the
                program-page tool strip uses, configured for company logos. */}
            <AlumniCompanyWall companies={ALUMNI_COMPANIES} />

            <HiringPartners />
            <Collaboration />
            <Mentors />
            <Certifications />

            {/* Salary-jump success stories — auto-advancing carousel mirroring
                the Meritshot reference screenshot the redesign was scoped from. */}
            <SuccessStories stories={FEATURED_SUCCESS_STORIES} />

            <LearnerStories />

            {/* Video testimonial — lazy-loaded YouTube embed. CMS will drive
                the youtubeId once homepage_video_url ships. */}
            <VideoTestimonial youtubeId="dQw4w9WgXcQ" />

            <FAQSection />
            <FinalCTA />

            <StructuredData
                page="home"
                isHomePage
            />
        </div>
    )
}
