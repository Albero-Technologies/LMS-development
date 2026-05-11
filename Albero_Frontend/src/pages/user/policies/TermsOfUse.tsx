import PolicyLayout, { Section, Bullets } from '@/components/user/policies/PolicyLayout'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { termsSEO } from '@/constants/seo'

export default function TermsOfUse() {
    return (
        <>
            <SEO
                title={termsSEO.title}
                description={termsSEO.description}
                keywords={termsSEO.keywords}
                url={termsSEO.url}
                canonical={termsSEO.canonical}
                image={termsSEO.image}
                type={termsSEO.type}
            />
            <StructuredData page="terms" />
            <PolicyLayout
                eyebrow="Legal"
                title="Terms of Use"
                intro="Welcome to Albero Academy. These Terms of Use govern your access to and use of our platform, programs, and services. We've written them to be clear, fair, and transparent — so you always know where you stand."
                effective="January 1, 2026"
                updated="May 1, 2026">
                <Section title="1. Your Agreement with Us">
                    <p>By accessing or using Albero Academy, you enter into a legally binding agreement with us.</p>
                    <p>
                        If something here doesn’t feel right to you, we recommend not using the platform — because your continued use means you fully
                        agree to these terms.
                    </p>
                </Section>

                <Section title="2. What We Offer">
                    <p>Albero Academy is a career-focused learning platform designed to help you build real-world skills in areas like:</p>
                    <Bullets items={['Data Analytics', 'Business Analytics', 'Data Science with ML and Generative AI', 'Full Stack Development']} />
                    <p>Our services include structured programs, live sessions, recorded content, mentorship, and career support tools.</p>
                </Section>

                <Section title="3. Responsible Use of the Platform">
                    <p>We trust our learners to use the platform responsibly. By using Albero Academy, you agree:</p>
                    <Bullets
                        items={[
                            'To use our services only for lawful and genuine learning purposes',
                            'To provide accurate information during registration',
                            'To keep your login credentials secure and personal',
                            'Not to share, resell, or misuse your account access',
                            'Not to interfere with the platform’s functionality or security'
                        ]}
                    />
                    <p>Think of your account as your personal learning space — protect it.</p>
                </Section>

                <Section title="4. Ownership & Intellectual Property">
                    <p>
                        Everything you access on Albero Academy — courses, videos, dashboards, frameworks, and content — is built with significant
                        expertise and effort.
                    </p>
                    <p>All rights belong to Albero Academy.</p>
                    <p>You may:</p>
                    <Bullets
                        items={[
                            'Use content for personal learning',
                            'Not copy, distribute, record, or resell any material',
                            'Not reuse content for commercial or public purposes'
                        ]}
                    />
                    <p>This ensures we can continue delivering high-quality, original learning experiences.</p>
                </Section>

                <Section title="5. Enrollment, Fees & Payments">
                    <p>When you enroll in a program:</p>
                    <Bullets
                        items={[
                            'You agree to pay the fees associated with that program',
                            'Payment timelines (full or installment) must be honored',
                            'Delayed payments may result in restricted access',
                            'Refunds, if applicable, follow our official Refund Policy'
                        ]}
                    />
                    <p>We aim to keep pricing fair and transparent — no hidden surprises.</p>
                </Section>

                <Section title="6. Learning Environment & Conduct">
                    <p>Albero Academy is a professional learning ecosystem. We expect you to:</p>
                    <Bullets
                        items={[
                            'Communicate respectfully with mentors, peers, and support teams',
                            'Maintain a collaborative and positive environment',
                            'Avoid abusive, discriminatory, or disruptive behavior',
                            'Not promote external services or spam within the platform'
                        ]}
                    />
                    <p>We take community quality seriously — violations may lead to removal.</p>
                </Section>

                <Section title="7. Outcomes & Expectations">
                    <p>We are committed to helping you grow — but we believe in honest expectations:</p>
                    <Bullets
                        items={[
                            'We do not guarantee job placement or salary outcomes',
                            'Your success depends on your effort, consistency, and skill application',
                            'Market conditions and hiring trends also play a role'
                        ]}
                    />
                    <p>What we guarantee is guidance, support, and a strong learning ecosystem.</p>
                </Section>

                <Section title="8. Career Support & Placement Assistance">
                    <p>Our career services may include:</p>
                    <Bullets items={['Resume and portfolio building', 'Mock interviews and mentorship', 'Job referrals and opportunity access']} />
                    <p>
                        However, placement is not guaranteed and opportunities depend on your readiness and eligibility. We open doors — you walk
                        through them.
                    </p>
                </Section>

                <Section title="9. Limitation of Liability">
                    <Bullets
                        items={[
                            'Our services are provided on an “as-is” basis',
                            'We are not liable for indirect losses, missed opportunities, or external outcomes',
                            'Our total liability is limited to the amount you paid for the program'
                        ]}
                    />
                </Section>

                <Section title="10. Updates to These Terms">
                    <p>
                        We may update these Terms to reflect improvements or legal changes. Updates will be communicated via email or website.
                        Continued use means you accept the revised terms.
                    </p>
                </Section>

                <Section title="11. Suspension or Termination">
                    <p>
                        We reserve the right to suspend or terminate access if these Terms are violated, platform integrity is at risk, or misuse /
                        unethical behavior is observed.
                    </p>
                </Section>

                <Section title="12. Governing Law">
                    <p>
                        These Terms are governed by the laws of India. Any disputes will fall under the jurisdiction of courts in Noida, Uttar
                        Pradesh.
                    </p>
                </Section>
            </PolicyLayout>
        </>
    )
}
