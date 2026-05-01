// Policy content for Albero Academy. Each entry is a sequence of `prose`
// landing-sections used to seed the public policy pages. The renderer
// preserves newlines via `whitespace-pre-line`, so blank lines here become
// paragraph breaks on the rendered page.
//
// Kept in its own file so albero-academy.ts stays focused on layout/branding;
// edits to legal text don't churn the rest of the seed.

interface ProseSection {
    id: string
    type: 'prose'
    variant: 'narrow'
    data: { eyebrow?: string; title?: string; body?: string }
}

interface PolicyPage {
    id: string
    slug: string
    name: string
    title: string
    seoDescription: string
    sections: ProseSection[]
}

const sec = (key: string, eyebrow: string | undefined, title: string, body: string): ProseSection => ({
    id: `sec-${key}`,
    type: 'prose',
    variant: 'narrow',
    data: { eyebrow, title, body }
})

const intro = (key: string, hero: string, dates: string, body: string): ProseSection =>
    sec(key, 'POLICY', hero, `${dates}\n\n${body}`)

// --- Terms of Use ----------------------------------------------------------

const termsSections: ProseSection[] = [
    intro(
        'terms-intro',
        'Terms of Use',
        'Effective Date: January 1, 2026 · Last Updated: May 1, 2026',
        `Welcome to Albero Academy.\n\nThese Terms of Use govern your access to and use of our platform, programs, and services. We've written them to be clear, fair, and transparent—so you always know where you stand.`
    ),
    sec(
        'terms-1',
        'SECTION 1',
        'Your Agreement with Us',
        `By accessing or using Albero Academy, you enter into a legally binding agreement with us.\n\nIf something here doesn't feel right to you, we recommend not using the platform—because your continued use means you fully agree to these terms.`
    ),
    sec(
        'terms-2',
        'SECTION 2',
        'What We Offer',
        `Albero Academy is a career-focused learning platform designed to help you build real-world skills in areas like:\n\n• Data Analytics\n• Business Analytics\n• Data Science with ML and Gen AI\n• Full-stack Development\n\nOur services include structured programs, live sessions, recorded content, mentorship, and career support tools.`
    ),
    sec(
        'terms-3',
        'SECTION 3',
        'Responsible Use of the Platform',
        `We trust our learners to use the platform responsibly. By using Albero Academy, you agree:\n\n• To use our services only for lawful and genuine learning purposes\n• To provide accurate information during registration\n• To keep your login credentials secure and personal\n• Not to share, resell, or misuse your account access\n• Not to interfere with the platform's functionality or security\n\nThink of your account as your personal learning space—protect it.`
    ),
    sec(
        'terms-4',
        'SECTION 4',
        'Ownership & Intellectual Property',
        `Everything you access on Albero Academy—courses, videos, dashboards, frameworks, and content—is built with significant expertise and effort. All rights belong to Albero Academy.\n\nYou may:\n✔ Use content for personal learning\n✖ Not copy, distribute, record, or resell any material\n✖ Not reuse content for commercial or public purposes\n\nThis ensures we can continue delivering high-quality, original learning experiences.`
    ),
    sec(
        'terms-5',
        'SECTION 5',
        'Enrollment, Fees & Payments',
        `When you enroll in a program:\n\n• You agree to pay the fees associated with that program\n• Payment timelines (full or installment) must be honored\n• Delayed payments may result in restricted access\n• Refunds, if applicable, follow our official Refund Policy\n\nWe aim to keep pricing fair and transparent—no hidden surprises.`
    ),
    sec(
        'terms-6',
        'SECTION 6',
        'Learning Environment & Conduct',
        `Albero Academy is a professional learning ecosystem. We expect you to:\n\n• Communicate respectfully with mentors, peers, and support teams\n• Maintain a collaborative and positive environment\n• Avoid abusive, discriminatory, or disruptive behavior\n• Not promote external services or spam within the platform\n\nWe take community quality seriously—violations may lead to removal.`
    ),
    sec(
        'terms-7',
        'SECTION 7',
        'Outcomes & Expectations',
        `We are committed to helping you grow—but we believe in honest expectations:\n\n• We do not guarantee job placement or salary outcomes\n• Your success depends on your effort, consistency, and skill application\n• Market conditions and hiring trends also play a role\n\nWhat we guarantee is guidance, support, and a strong learning ecosystem.`
    ),
    sec(
        'terms-8',
        'SECTION 8',
        'Career Support & Placement Assistance',
        `Our career services may include:\n\n• Resume and portfolio building\n• Mock interviews and mentorship\n• Job referrals and opportunity access\n\nHowever:\n• Placement is not guaranteed\n• Opportunities depend on your readiness and eligibility\n\nWe open doors—you walk through them.`
    ),
    sec(
        'terms-9',
        'SECTION 9',
        'Limitation of Liability',
        `While we strive for excellence:\n\n• Our services are provided on an "as-is" basis\n• We are not liable for indirect losses, missed opportunities, or external outcomes\n• Our total liability is limited to the amount you paid for the program\n\nThis helps us maintain fairness while continuing to innovate.`
    ),
    sec(
        'terms-10',
        'SECTION 10',
        'Updates to These Terms',
        `We may update these Terms to reflect improvements or legal changes.\n\n• Updates will be communicated via email or website\n• Continued use means you accept the revised terms\n\nWe recommend reviewing this page periodically.`
    ),
    sec(
        'terms-11',
        'SECTION 11',
        'Suspension or Termination',
        `We reserve the right to suspend or terminate access if:\n\n• These Terms are violated\n• Platform integrity is at risk\n• Misuse or unethical behavior is observed\n\nOur goal is to protect the learning experience for everyone.`
    ),
    sec(
        'terms-12',
        'SECTION 12',
        'Governing Law',
        `These Terms are governed by the laws of India.\n\nAny disputes will fall under the jurisdiction of courts in Noida, Uttar Pradesh.`
    ),
    sec(
        'terms-13',
        'SECTION 13',
        'Contact Us',
        `We're always here to help.\n\nEmail: support@alberoacademy.com\nPhone: +91-XXXXXXXXXX\nAddress: Albero Academy Pvt. Ltd., Noida, Uttar Pradesh, India`
    )
]

// --- Privacy Policy --------------------------------------------------------

const privacySections: ProseSection[] = [
    intro(
        'privacy-intro',
        'Privacy Policy',
        'Effective Date: January 1, 2026 · Last Updated: May 1, 2026',
        `Your privacy matters to us—deeply.\n\nAt Albero Academy, we don't just collect data—we protect it, respect it, and use it responsibly to improve your learning experience. This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our platform.`
    ),
    sec(
        'privacy-1',
        'SECTION 1',
        'Who We Are',
        `Albero Academy is a career-focused learning platform offering programs in technology, data, and business domains.\n\nWhen we say "we", "our", or "us", we mean Albero Academy.\nWhen we say "you", we mean you—the learner, visitor, or user of our platform.`
    ),
    sec(
        'privacy-2',
        'SECTION 2',
        'Information We Collect',
        `We collect only what's necessary to provide and improve your experience.\n\nPersonal Information you provide directly:\n• Full name, email address, phone number\n• Educational background and professional details\n• Resume, portfolio, or uploaded documents\n• Payment and billing details\n\nTechnical & Usage Data we collect automatically:\n• IP address, device type, browser details\n• Pages visited, session duration, interactions\n• Cookies and tracking technologies\n\nOptional Information:\n• Feedback, surveys, testimonials\n• Career preferences and goals\n\nWe aim to be minimal, relevant, and transparent—no unnecessary data collection.`
    ),
    sec(
        'privacy-3',
        'SECTION 3',
        'How We Use Your Information',
        `We use your data to create a better, more personalized learning journey:\n\n• To provide and manage your enrolled programs\n• To personalize course recommendations and learning paths\n• To communicate important updates, reminders, and support\n• To process payments securely\n• To offer career support, mentorship, and placement assistance\n• To improve our platform, content, and user experience\n• To comply with legal obligations\n\nWe do not sell your personal data. Ever.`
    ),
    sec(
        'privacy-4',
        'SECTION 4',
        'When We Share Your Information',
        `We share your data only when necessary—and always responsibly.\n\nWe may share with:\n• Hiring partners (only with your consent) for job opportunities\n• Service providers (payment gateways, analytics, cloud services)\n• Academic or certification partners (if applicable)\n• Legal authorities when required by law\n\nEvery partner we work with is expected to maintain strict data protection standards.`
    ),
    sec(
        'privacy-5',
        'SECTION 5',
        'Data Security',
        `We take your data security seriously. We use:\n\n• Encryption for sensitive data\n• Secure servers and access controls\n• Regular security audits and monitoring\n• Restricted internal access to personal information\n\nWhile no system is 100% immune, we continuously upgrade our safeguards.`
    ),
    sec(
        'privacy-6',
        'SECTION 6',
        'Your Rights & Control',
        `You remain in control of your data. You have the right to:\n\n• Access the data we hold about you\n• Correct or update your information\n• Request deletion (subject to legal obligations)\n• Opt out of marketing communications\n• Withdraw consent where applicable\n\nTo exercise these rights, simply contact us—we'll respond promptly.`
    ),
    sec(
        'privacy-7',
        'SECTION 7',
        'Cookies & Tracking Technologies',
        `We use cookies to improve your experience, not invade your privacy.\n\nCookies help us:\n• Remember your preferences\n• Understand how you use our platform\n• Improve performance and usability\n• Provide relevant recommendations\n\nYou can manage or disable cookies through your browser settings.`
    ),
    sec(
        'privacy-8',
        'SECTION 8',
        'Data Retention',
        `We retain your data only as long as necessary:\n\n• To deliver your learning experience\n• To provide ongoing career support\n• To comply with legal and regulatory requirements\n\nWhen no longer needed, your data is securely deleted or anonymized.`
    ),
    sec(
        'privacy-9',
        'SECTION 9',
        "Children's Privacy",
        `Albero Academy is designed for individuals 18 years and above. We do not knowingly collect data from minors. If such data is identified, we will promptly remove it.`
    ),
    sec(
        'privacy-10',
        'SECTION 10',
        'International Data Transfers',
        `Your data may be processed on servers located outside your region. In such cases, we ensure:\n\n• Adequate safeguards are in place\n• Data protection standards are maintained\n\nYour privacy travels with your data.`
    ),
    sec(
        'privacy-11',
        'SECTION 11',
        'Updates to This Policy',
        `We may update this Privacy Policy to reflect improvements or legal requirements.\n\n• Updates will be posted on this page\n• Significant changes may be communicated via email\n\nWe encourage you to review this page periodically.`
    ),
    sec(
        'privacy-12',
        'SECTION 12',
        'Contact Us',
        `If you have questions, concerns, or requests:\n\nEmail: support@alberoacademy.com\nPhone: +91-XXXXXXXXXX\nAddress: Albero Academy Pvt. Ltd., Noida, Uttar Pradesh, India`
    )
]

// --- Refund & Cancellation Policy -----------------------------------------

const refundSections: ProseSection[] = [
    intro(
        'refund-intro',
        'Refund & Cancellation Policy',
        'Effective Date: January 1, 2026 · Last Updated: May 1, 2026',
        `We believe in fair decisions, not fine print traps.\n\nAt Albero Academy, we aim to create a transparent and learner-first experience—while maintaining the integrity of our programs. This policy outlines how cancellations, refunds, and adjustments are handled.`
    ),
    sec(
        'refund-1',
        'SECTION 1',
        'Our Approach to Refunds',
        `We understand that plans can change. Our refund policy is designed to be:\n\n• Fair to learners\n• Sustainable for program delivery\n• Transparent at every step\n\nWe encourage you to review program details carefully before enrolling.`
    ),
    sec(
        'refund-2',
        'SECTION 2',
        'Refund Eligibility',
        `Full Refund (100%)\nYou may be eligible for a full refund if:\n• You cancel within 7 days of enrollment\n• You have not significantly accessed course content\n• The request is made before the program officially begins\n\nPartial Refund\nA partial refund may be considered in the following cases:\n• Limited participation after program start\n• Documented personal emergencies\n• Technical issues that significantly impacted access (verified by our team)\n\nRefund amount will be evaluated based on:\n• Content accessed\n• Sessions attended\n• Time elapsed since enrollment\n\nNo Refund\nRefunds will not be applicable if:\n• More than 10–15% of the program has been completed\n• You have accessed a substantial portion of course materials\n• You violate our Terms of Use or code of conduct\n• Payment default leads to suspension\n• The program has been completed or certification issued`
    ),
    sec(
        'refund-3',
        'SECTION 3',
        'How to Request a Refund',
        `We've kept the process simple and accountable:\n\n• Submit a request via email to support@alberoacademy.com\n• Use your registered email ID\n• Include:\n   – Full name\n   – Program enrolled\n   – Reason for cancellation\n   – Supporting documents (if applicable)\n\nReview Timeline: your request will be reviewed within 5–7 business days.`
    ),
    sec(
        'refund-4',
        'SECTION 4',
        'Refund Processing Timeline',
        `Once approved, refunds are processed as follows:\n\n• UPI / Wallets: 5–7 business days\n• Credit / Debit Cards: 7–10 business days\n• Net Banking: 7–10 business days\n\nProcessing time may vary depending on your bank or payment provider.`
    ),
    sec(
        'refund-5',
        'SECTION 5',
        'Deductions & Administrative Charges',
        `Approved refunds may include reasonable deductions such as:\n\n• Payment gateway charges\n• Administrative processing fees\n• Cost of resources or materials already accessed\n• Value of sessions attended\n\nWe ensure all deductions are fair and justifiable.`
    ),
    sec(
        'refund-6',
        'SECTION 6',
        'EMI & Installment Plans',
        `If you enrolled using EMI or installment options:\n\n• Refunds apply only to the amount paid to Albero Academy\n• Loan/EMI obligations with third-party providers remain your responsibility\n• Interest and processing fees charged by lenders are non-refundable\n\nFor cancellations, you may need to coordinate with both Albero Academy and your EMI/loan provider.`
    ),
    sec(
        'refund-7',
        'SECTION 7',
        'Program Transfer & Deferment',
        `Before opting for cancellation, you may consider:\n\n• Program Deferment: Shift your batch to a later date\n• Program Transfer: Switch to another program (subject to eligibility)\n• Credit Note: Use your paid amount for future enrollment\n\nThese options are designed to give you flexibility without financial loss.`
    ),
    sec(
        'refund-8',
        'SECTION 8',
        'Special Circumstances',
        `We understand that life can be unpredictable. Refund exceptions may be considered in cases like:\n\n• Medical emergencies\n• Serious personal or family situations\n• Unforeseen critical events\n\nAll such requests are reviewed case-by-case, with supporting documentation.`
    ),
    sec(
        'refund-9',
        'SECTION 9',
        'Non-Refundable Components',
        `The following are generally non-refundable:\n\n• Registration or enrollment fees\n• Third-party certification or exam fees\n• External tools, software licenses, or subscriptions\n• Completed mentorship sessions\n• Career services or placement assistance fees`
    ),
    sec(
        'refund-10',
        'SECTION 10',
        'Dispute Resolution',
        `If you disagree with a refund decision:\n\n• You may submit a formal escalation within 15 days\n• Our team will conduct a secondary review\n• Final decisions are made after internal evaluation\n\nWe aim to resolve concerns respectfully and fairly.`
    ),
    sec(
        'refund-11',
        'SECTION 11',
        'Policy Updates',
        `We may update this policy to reflect operational or legal changes.\n\n• Updates will be posted on our website\n• Continued enrollment implies acceptance of revised terms`
    ),
    sec(
        'refund-12',
        'SECTION 12',
        'Contact Us',
        `We're here to help you make the right decision.\n\nEmail: support@alberoacademy.com\nPhone: +91-XXXXXXXXXX\nAddress: Albero Academy Pvt. Ltd., Noida, Uttar Pradesh, India`
    )
]

// --- Escalation & Grievance Resolution Policy ------------------------------

const escalationSections: ProseSection[] = [
    intro(
        'escalation-intro',
        'Escalation & Grievance Resolution Policy',
        'Effective Date: January 1, 2026 · Last Updated: May 1, 2026',
        `We take your concerns seriously—every single one.\n\nAt Albero Academy, we believe that a strong learning experience includes not just great teaching, but also fair, timely, and transparent issue resolution. This policy outlines how you can raise concerns and how we ensure they are addressed efficiently.`
    ),
    sec(
        'escalation-1',
        'SECTION 1',
        'Our Commitment',
        `We are committed to:\n\n• Listening without bias\n• Responding within defined timelines\n• Resolving issues fairly and transparently\n• Continuously improving based on your feedback\n\nRaising a concern is not a problem—it's a step toward improvement.`
    ),
    sec(
        'escalation-2',
        'SECTION 2',
        'What You Can Raise',
        `This policy covers a wide range of concerns, including:\n\n• Course quality or delivery issues\n• Mentor or instructor-related concerns\n• Platform or technical difficulties\n• Payment, billing, or refund queries\n• Career support or placement-related issues\n• Certification or program completion concerns\n• Behavioral or conduct-related complaints\n• Administrative delays or communication gaps\n\nIf something doesn't feel right, you should raise it.`
    ),
    sec(
        'escalation-3',
        'SECTION 3',
        'Our 3-Level Escalation Structure',
        `To ensure clarity and accountability, we follow a structured escalation system:\n\nLevel 1: Support Team (First Response)\nYour first point of contact for all concerns.\n• Handles general queries, technical issues, and initial complaints\n• Aims to resolve most issues quickly\n• Response Time: Within 24–48 hours\n\nLevel 2: Program Management\nIf your concern needs deeper review:\n• Handled by Program Managers or Department Leads\n• Focuses on academic, mentor, or program-level concerns\n• Resolution Time: Typically 3–5 business days\n\nLevel 3: Senior Management\nFor unresolved or sensitive matters:\n• Reviewed by senior leadership\n• Ensures fairness, policy alignment, and final resolution\n• Resolution Time: 5–10 business days depending on complexity`
    ),
    sec(
        'escalation-4',
        'SECTION 4',
        'How to Raise an Escalation',
        `We've made the process simple and structured:\n\n• Send an email to support@alberoacademy.com\n• Use your registered email ID\n• Include:\n   – Full name & enrolled program\n   – Clear description of the issue\n   – Relevant screenshots or documents\n\nTip: Clear details help us resolve your issue faster. You'll receive an acknowledgment once your request is logged.`
    ),
    sec(
        'escalation-5',
        'SECTION 5',
        'Resolution Timeline (What to Expect)',
        `Stage → Timeline\n\n• Acknowledgment: Within 24 hours\n• Initial Review: 24–48 hours\n• Investigation: 3–10 business days\n• Final Resolution: Based on complexity\n\nFor complex cases, timelines may extend—but you will always be kept informed.`
    ),
    sec(
        'escalation-6',
        'SECTION 6',
        'When Can You Escalate Further?',
        `You can move to the next level if:\n\n• You did not receive a response within the expected time\n• The resolution provided is incomplete or unclear\n• The issue requires higher-level intervention\n• New information changes the context of your concern\n\nWe ensure your issue doesn't get stuck.`
    ),
    sec(
        'escalation-7',
        'SECTION 7',
        'Confidentiality & Fair Treatment',
        `We maintain strict standards of integrity:\n\n• All concerns are handled confidentially\n• Your identity and information are protected\n• No retaliation for raising genuine concerns\n• Sensitive cases are handled with discretion\n\nYou should feel safe speaking up.`
    ),
    sec(
        'escalation-8',
        'SECTION 8',
        'Expected Conduct During Resolution',
        `To ensure smooth resolution, we expect:\n\n• Respectful and professional communication\n• Accurate and honest information\n• Cooperation during investigation\n• Patience during review timelines\n\nWe're on the same team—working toward a solution.`
    ),
    sec(
        'escalation-9',
        'SECTION 9',
        'External Resolution Options',
        `If you are not satisfied after internal escalation:\n\n• You may seek resolution through consumer forums\n• Approach relevant regulatory authorities\n• Use legal remedies as per applicable laws\n\nHowever, we strongly encourage resolving concerns internally first—we're committed to making it right.`
    ),
    sec(
        'escalation-10',
        'SECTION 10',
        'Continuous Improvement',
        `Every concern helps us improve.\n\n• Issues are analyzed for root causes\n• Feedback is shared with internal teams\n• Processes are upgraded regularly\n\nYour voice directly shapes Albero Academy.`
    ),
    sec(
        'escalation-11',
        'SECTION 11',
        'Contact Details',
        `For all escalations and complaints:\n\n• Level 1 (Support): support@alberoacademy.com\n• Level 2 (Program Team): programs@alberoacademy.com\n• Level 3 (Senior Management): escalation@alberoacademy.com\n\nPhone: +91-XXXXXXXXXX\nAddress: Albero Academy Pvt. Ltd., Noida, Uttar Pradesh, India`
    )
]

// --- Examination & Certification Policy ------------------------------------

const examSections: ProseSection[] = [
    intro(
        'exam-intro',
        'Examination & Certification Policy',
        'Effective Date: January 1, 2026 · Last Updated: May 1, 2026',
        `Built on merit. Backed by credibility. Designed for real-world outcomes.\n\nAt Albero Academy, our evaluation and certification process is designed to reflect not just knowledge—but applied skills, consistency, and professional readiness. This policy outlines how assessments are conducted, how performance is evaluated, and how certifications are awarded.`
    ),
    sec(
        'exam-1',
        'SECTION 1',
        'Our Evaluation Philosophy',
        `We believe that true learning goes beyond exams. Our assessment approach is:\n\n• Practical-first (real-world application over theory)\n• Continuous (not just one final test)\n• Transparent (clear criteria and expectations)\n• Fair and unbiased\n\nYour certification represents what you can do—not just what you know.`
    ),
    sec(
        'exam-2',
        'SECTION 2',
        'Assessment Structure',
        `Each program may include a combination of:\n\n• Assignments & Case Studies\n• Projects (Individual / Capstone)\n• Quizzes & Module Assessments\n• Final Evaluation (if applicable)\n\nTypical weightage:\n• Continuous Assessments: 40–60%\n• Projects & Practical Work: 30–50%\n• Final Evaluation: 10–20%\n\n(Exact structure may vary by program and will be shared at enrollment.)`
    ),
    sec(
        'exam-3',
        'SECTION 3',
        'Eligibility for Examination',
        `To qualify for assessments and certification, you must:\n\n• Maintain minimum required attendance (live or recorded engagement)\n• Complete mandatory assignments and project submissions\n• Clear any prerequisite modules (if applicable)\n• Adhere to academic integrity and conduct guidelines\n\nFailure to meet these criteria may result in ineligibility for certification.`
    ),
    sec(
        'exam-4',
        'SECTION 4',
        'Examination Guidelines',
        `To ensure fairness and integrity:\n\n• Exams may be conducted online or offline, depending on the program\n• Identity verification may be required before assessments\n• Use of unauthorized resources, tools, or assistance is prohibited\n• Submissions must be original and completed within given timelines\n\nViolations may lead to disqualification.`
    ),
    sec(
        'exam-5',
        'SECTION 5',
        'Grading System',
        `Performance is evaluated using a structured grading framework:\n\n• A+ — Outstanding\n• A — Excellent\n• B+ — Very Good\n• B — Good\n• C — Satisfactory\n• D / F — Needs Improvement\n\nGrades reflect overall performance across all assessments, not just a single test.`
    ),
    sec(
        'exam-6',
        'SECTION 6',
        'Re-Examination & Improvement',
        `We understand that performance can vary.\n\n• Re-attempts may be allowed for failed assessments (program-specific)\n• Improvement attempts may be offered for certain modules\n• Additional fees may apply depending on the case\n\nThis ensures fairness while maintaining academic standards.`
    ),
    sec(
        'exam-7',
        'SECTION 7',
        'Academic Integrity & Plagiarism',
        `Integrity is non-negotiable. You agree:\n\n• To submit only original work\n• Not to copy, share, or misuse content\n• Not to use unfair means during assessments\n\nAny form of plagiarism, cheating, or misconduct may result in:\n• Disqualification\n• Revocation of certification\n• Suspension from the program\n\nYour certification must be earned, not manipulated.`
    ),
    sec(
        'exam-8',
        'SECTION 8',
        'Certification Criteria',
        `To receive certification, you must:\n\n• Successfully meet minimum grading criteria\n• Complete all required assignments and projects\n• Demonstrate practical understanding of the subject\n\nTypes of certifications may include:\n• Program Completion Certificate\n• Industry/Partner Certification (if applicable)\n• Merit-based or Distinction Certificates`
    ),
    sec(
        'exam-9',
        'SECTION 9',
        'Certificate Issuance Timeline',
        `Once you qualify:\n\n• Digital certificates are issued within 7–15 working days\n• Physical certificates (if applicable) may take additional time\n• Certificates will be sent to your registered email or address\n\nDelays, if any, will be communicated transparently.`
    ),
    sec(
        'exam-10',
        'SECTION 10',
        'Certificate Verification',
        `To ensure authenticity:\n\n• Certificates may include unique verification IDs\n• Employers or institutions can verify credentials via our platform\n• Digital validation mechanisms may be implemented\n\nYour certificate is designed to be credible and verifiable.`
    ),
    sec(
        'exam-11',
        'SECTION 11',
        'Lost or Duplicate Certificates',
        `If your certificate is lost or damaged:\n\n• You may request a duplicate copy\n• A nominal processing fee may apply\n• Digital copies can be reissued faster`
    ),
    sec(
        'exam-12',
        'SECTION 12',
        'Re-evaluation & Appeals',
        `If you believe your evaluation needs review:\n\n• You may request re-evaluation within 7 days of result declaration\n• Requests must include valid justification\n• Re-evaluation decisions are final\n\nWe ensure every evaluation is accurate and unbiased.`
    ),
    sec(
        'exam-13',
        'SECTION 13',
        'Special Considerations',
        `We aim to support learners in genuine situations:\n\n• Medical emergencies\n• Personal hardships\n• Documented exceptional circumstances\n\nSuch cases are reviewed individually with appropriate documentation.`
    ),
    sec(
        'exam-14',
        'SECTION 14',
        'Policy Updates',
        `We may update this policy to maintain academic standards or align with industry practices.\n\n• Changes will be communicated via official channels\n• Continued participation implies acceptance`
    ),
    sec(
        'exam-15',
        'SECTION 15',
        'Contact Us',
        `For any queries related to assessments or certification:\n\nEmail: support@alberoacademy.com\nPhone: +91-XXXXXXXXXX\nAddress: Albero Academy Pvt. Ltd., Noida, Uttar Pradesh, India`
    )
]

export const POLICY_PAGES: PolicyPage[] = [
    {
        id: 'pg-terms-of-use',
        slug: '/terms-of-use',
        name: 'Terms of Use',
        title: 'Terms of Use · Albero Academy',
        seoDescription: 'Read the Terms of Use that govern access to Albero Academy programs, services, and platform.',
        sections: termsSections
    },
    {
        id: 'pg-privacy-policy',
        slug: '/privacy-policy',
        name: 'Privacy Policy',
        title: 'Privacy Policy · Albero Academy',
        seoDescription: 'How Albero Academy collects, uses, and protects your personal data.',
        sections: privacySections
    },
    {
        id: 'pg-refund-policy',
        slug: '/refund-policy',
        name: 'Refund & Cancellation Policy',
        title: 'Refund & Cancellation Policy · Albero Academy',
        seoDescription: 'Eligibility, timelines, and procedures for refunds and program cancellations at Albero Academy.',
        sections: refundSections
    },
    {
        id: 'pg-escalation-policy',
        slug: '/escalation-policy',
        name: 'Escalation Policy',
        title: 'Escalation & Grievance Resolution Policy · Albero Academy',
        seoDescription: 'How concerns are raised and resolved across our 3-level escalation structure at Albero Academy.',
        sections: escalationSections
    },
    {
        id: 'pg-examination-policy',
        slug: '/examination-policy',
        name: 'Examination & Certification Policy',
        title: 'Examination & Certification Policy · Albero Academy',
        seoDescription: 'Assessment structure, grading, certification criteria, and integrity guidelines at Albero Academy.',
        sections: examSections
    }
]
