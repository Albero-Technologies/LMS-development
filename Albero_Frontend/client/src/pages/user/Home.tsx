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
            <LearnerStories />
            <FAQSection />
            <FinalCTA />

            <StructuredData page="home" isHomePage />
        </div>
    )
}
