import PolicyLayout, { Section, Bullets, PolicyTable } from '@/components/user/policies/PolicyLayout'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { escalationSEO } from '@/constants/seo'

export default function EscalationPolicy() {
    return (
        <>
            <SEO
                title={escalationSEO.title}
                description={escalationSEO.description}
                keywords={escalationSEO.keywords}
                url={escalationSEO.url}
                canonical={escalationSEO.canonical}
                image={escalationSEO.image}
                type={escalationSEO.type}
            />
            <StructuredData page="escalation" />
        <PolicyLayout
            eyebrow="Legal"
            title="Escalation & Grievance Resolution"
            intro="We take your concerns seriously — every single one. At Albero Academy, a strong learning experience includes fair, timely, and transparent issue resolution."
            effective="January 1, 2026"
            updated="May 1, 2026">
            <Section title="1. Our Commitment">
                <Bullets
                    items={[
                        'Listening without bias',
                        'Responding within defined timelines',
                        'Resolving issues fairly and transparently',
                        'Continuously improving based on your feedback'
                    ]}
                />
                <p>Raising a concern is not a problem — it’s a step toward improvement.</p>
            </Section>

            <Section title="2. What You Can Raise">
                <Bullets
                    items={[
                        'Course quality or delivery issues',
                        'Mentor or instructor-related concerns',
                        'Platform or technical difficulties',
                        'Payment, billing, or refund queries',
                        'Career support or placement-related issues',
                        'Certification or program completion concerns',
                        'Behavioral or conduct-related complaints',
                        'Administrative delays or communication gaps'
                    ]}
                />
            </Section>

            <Section title="3. Our 3-Level Escalation Structure">
                <h3 className="text-base font-semibold text-white mt-4 mb-2">Level 1 — Support Team (First Response)</h3>
                <p>Your first point of contact for all concerns. Handles general queries, technical issues, and initial complaints.</p>
                <p className="text-indigo-300">Response time: within 24–48 hours</p>

                <h3 className="text-base font-semibold text-white mt-4 mb-2">Level 2 — Program Management</h3>
                <p>Handled by Program Managers or Department Leads. Focuses on academic, mentor, or program-level concerns.</p>
                <p className="text-indigo-300">Resolution time: typically 3–5 business days</p>

                <h3 className="text-base font-semibold text-white mt-4 mb-2">Level 3 — Senior Management</h3>
                <p>Reviewed by senior leadership for unresolved or sensitive matters. Ensures fairness, policy alignment, and final resolution.</p>
                <p className="text-indigo-300">Resolution time: 5–10 business days depending on complexity</p>
            </Section>

            <Section title="4. How to Raise an Escalation">
                <Bullets
                    items={[
                        'Send an email to support@alberoacademy.com',
                        'Use your registered email ID',
                        'Include: full name & enrolled program, clear description of the issue, relevant screenshots or documents'
                    ]}
                />
                <p>Tip: clear details help us resolve your issue faster. You’ll receive an acknowledgment once your request is logged.</p>
            </Section>

            <Section title="5. Resolution Timeline">
                <PolicyTable
                    headers={['Stage', 'Timeline']}
                    rows={[
                        ['Acknowledgment', 'Within 24 hours'],
                        ['Initial Review', '24–48 hours'],
                        ['Investigation', '3–10 business days'],
                        ['Final Resolution', 'Based on complexity']
                    ]}
                />
                <p>For complex cases, timelines may extend — but you will always be kept informed.</p>
            </Section>

            <Section title="6. When Can You Escalate Further?">
                <Bullets
                    items={[
                        'You did not receive a response within the expected time',
                        'The resolution provided is incomplete or unclear',
                        'The issue requires higher-level intervention',
                        'New information changes the context of your concern'
                    ]}
                />
            </Section>

            <Section title="7. Confidentiality & Fair Treatment">
                <Bullets
                    items={[
                        'All concerns are handled confidentially',
                        'Your identity and information are protected',
                        'No retaliation for raising genuine concerns',
                        'Sensitive cases are handled with discretion'
                    ]}
                />
            </Section>

            <Section title="8. Contact Channels">
                <Bullets
                    items={[
                        'Level 1 (Support): support@alberoacademy.com',
                        'Level 2 (Program Team): programs@alberoacademy.com',
                        'Level 3 (Senior Management): escalation@alberoacademy.com'
                    ]}
                />
            </Section>
        </PolicyLayout>
        </>
    )
}
