import PolicyLayout, { Section, Bullets, PolicyTable } from '@/components/user/policies/PolicyLayout'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { examinationSEO } from '@/constants/seo'

export default function ExaminationPolicy() {
    return (
        <>
            <SEO
                title={examinationSEO.title}
                description={examinationSEO.description}
                keywords={examinationSEO.keywords}
                url={examinationSEO.url}
                canonical={examinationSEO.canonical}
                image={examinationSEO.image}
                type={examinationSEO.type}
            />
            <StructuredData page="examination" />
        <PolicyLayout
            eyebrow="Academic"
            title="Examination & Certification Policy"
            intro="Built on merit. Backed by credibility. Designed for real-world outcomes. Our evaluation and certification process reflects applied skills, consistency, and professional readiness."
            effective="January 1, 2026"
            updated="May 1, 2026">
            <Section title="1. Our Evaluation Philosophy">
                <Bullets
                    items={[
                        'Practical-first (real-world application over theory)',
                        'Continuous (not just one final test)',
                        'Transparent (clear criteria and expectations)',
                        'Fair and unbiased'
                    ]}
                />
                <p>Your certification represents what you can do — not just what you know.</p>
            </Section>

            <Section title="2. Assessment Structure">
                <p>Each program may include a combination of assignments & case studies, projects (individual / capstone), quizzes & module assessments, and a final evaluation.</p>
                <p>Typical weightage:</p>
                <Bullets items={['Continuous Assessments: 40–60%', 'Projects & Practical Work: 30–50%', 'Final Evaluation: 10–20%']} />
                <p>Exact structure may vary by program and will be shared at enrollment.</p>
            </Section>

            <Section title="3. Eligibility for Examination">
                <Bullets
                    items={[
                        'Maintain minimum required attendance (live or recorded engagement)',
                        'Complete mandatory assignments and project submissions',
                        'Clear any prerequisite modules (if applicable)',
                        'Adhere to academic integrity and conduct guidelines'
                    ]}
                />
                <p>Failure to meet these criteria may result in ineligibility for certification.</p>
            </Section>

            <Section title="4. Examination Guidelines">
                <Bullets
                    items={[
                        'Exams may be conducted online or offline, depending on the program',
                        'Identity verification may be required before assessments',
                        'Use of unauthorized resources, tools, or assistance is prohibited',
                        'Submissions must be original and completed within given timelines'
                    ]}
                />
                <p>Violations may lead to disqualification.</p>
            </Section>

            <Section title="5. Grading System">
                <PolicyTable
                    headers={['Grade', 'Performance Level']}
                    rows={[
                        ['A+', 'Outstanding'],
                        ['A', 'Excellent'],
                        ['B+', 'Very Good'],
                        ['B', 'Good'],
                        ['C', 'Satisfactory'],
                        ['D / F', 'Needs Improvement']
                    ]}
                />
            </Section>

            <Section title="6. Re-Examination & Improvement">
                <Bullets
                    items={[
                        'Re-attempts may be allowed for failed assessments (program-specific)',
                        'Improvement attempts may be offered for certain modules',
                        'Additional fees may apply depending on the case'
                    ]}
                />
            </Section>

            <Section title="7. Academic Integrity & Plagiarism">
                <p>Integrity is non-negotiable. Any form of plagiarism, cheating, or misconduct may result in:</p>
                <Bullets items={['Disqualification', 'Revocation of certification', 'Suspension from the program']} />
                <p>Your certification must be earned, not manipulated.</p>
            </Section>

            <Section title="8. Certification Criteria">
                <p>To receive certification, you must successfully meet minimum grading criteria, complete all required assignments and projects, and demonstrate practical understanding of the subject.</p>
                <p>Types of certifications include:</p>
                <Bullets items={['Program Completion Certificate', 'Industry / Partner Certification (if applicable)', 'Merit-based or Distinction Certificates']} />
            </Section>

            <Section title="9. Certificate Issuance Timeline">
                <Bullets
                    items={[
                        'Digital certificates are issued within 7–15 working days',
                        'Physical certificates (if applicable) may take additional time',
                        'Certificates will be sent to your registered email or address'
                    ]}
                />
            </Section>

            <Section title="10. Certificate Verification">
                <Bullets
                    items={[
                        'Certificates may include unique verification IDs',
                        'Employers or institutions can verify credentials via our platform',
                        'Digital validation mechanisms may be implemented'
                    ]}
                />
            </Section>

            <Section title="11. Re-evaluation & Appeals">
                <p>You may request re-evaluation within 7 days of result declaration. Requests must include valid justification. Re-evaluation decisions are final.</p>
            </Section>
        </PolicyLayout>
        </>
    )
}
