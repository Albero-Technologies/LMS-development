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
import { SuccessStories } from '@/components/user/program-page/SuccessStories'
import { VideoTestimonial } from '@/components/user/program-page/VideoTestimonial'
import { FEATURED_SUCCESS_STORIES } from '@/constants/program-extras'

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

            <InteractiveSkillsGrid />
            <LearningExperience />
            <StaircaseClimb />
            <MobileLadderClimb />
            <ThreeSection />
            <Outcomes />
            <CertificationPath />

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
