import PolicyLayout, { Section, Bullets } from '@/components/user/policies/PolicyLayout'

export default function PrivacyPolicy() {
    return (
        <PolicyLayout
            eyebrow="Legal"
            title="Privacy Policy"
            intro="Your privacy matters. This policy explains what information we collect, how we use it, and the choices you have. We aim to be plain-spoken and minimal — only what's needed to deliver and improve your learning experience."
            effective="January 1, 2026"
            updated="May 1, 2026">
            <Section title="1. Information We Collect">
                <p>We collect only what is needed to deliver our services:</p>
                <Bullets
                    items={[
                        'Account details: name, email, phone, password (hashed)',
                        'Enrollment & payment data: program selected, billing details, invoice history',
                        'Learning data: course progress, assignments, attendance, certificate issuance',
                        'Communications: messages with support, mentors, and community',
                        'Technical data: device, browser, IP, cookies, and analytics events'
                    ]}
                />
            </Section>

            <Section title="2. How We Use Your Information">
                <Bullets
                    items={[
                        'Deliver programs, track progress, and issue certificates',
                        'Process payments and manage installments',
                        'Provide career support, mentorship, and placement assistance',
                        'Improve our courses, platform, and user experience',
                        'Send important notifications, updates, and (with consent) marketing emails',
                        'Detect, prevent, and respond to fraud, abuse, or security issues'
                    ]}
                />
            </Section>

            <Section title="3. Cookies & Analytics">
                <p>We use cookies and analytics tools (e.g., Google Analytics, Meta Pixel) to understand how learners use our platform. You can disable cookies in your browser; some platform features may not work without them.</p>
            </Section>

            <Section title="4. How We Share Information">
                <p>We do not sell your personal data. We share data only:</p>
                <Bullets
                    items={[
                        'With service providers (payments, email, analytics) under strict data agreements',
                        'With certifying partners, where applicable, for issuing credentials',
                        'When required by law, court order, or to protect rights and safety'
                    ]}
                />
            </Section>

            <Section title="5. Data Security">
                <p>We use industry-standard encryption, access controls, and monitoring to protect your data. No system is 100% secure, but we work hard to safeguard yours and notify you in the event of a material breach.</p>
            </Section>

            <Section title="6. Your Rights & Choices">
                <Bullets
                    items={[
                        'Access, correct, or update your personal information',
                        'Request deletion of your account and associated data',
                        'Opt out of marketing communications at any time',
                        'Withdraw consent where processing is based on consent'
                    ]}
                />
                <p>To exercise any of these rights, write to support@alberoacademy.com.</p>
            </Section>

            <Section title="7. Data Retention">
                <p>We keep your data for as long as your account is active or as needed to deliver services, comply with legal obligations, resolve disputes, and enforce agreements.</p>
            </Section>

            <Section title="8. Children & Minors">
                <p>Our platform is intended for users 16 years and older. Minors must enroll under parental or guardian supervision.</p>
            </Section>

            <Section title="9. Updates to This Policy">
                <p>We may revise this Privacy Policy periodically. Material changes will be notified via email or platform announcements.</p>
            </Section>
        </PolicyLayout>
    )
}
