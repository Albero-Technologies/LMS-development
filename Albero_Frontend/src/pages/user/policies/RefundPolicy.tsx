import PolicyLayout, { Section, Bullets } from '@/components/user/policies/PolicyLayout'

export default function RefundPolicy() {
    return (
        <PolicyLayout
            eyebrow="Legal"
            title="Refund & Cancellation Policy"
            intro="We believe in fair decisions, not fine-print traps. At Albero Academy, we aim to create a transparent and learner-first experience — while maintaining the integrity of our programs."
            effective="January 1, 2026"
            updated="May 1, 2026">
            <Section title="1. Our Approach to Refunds">
                <p>Our refund policy is designed to be:</p>
                <Bullets items={['Fair to learners', 'Sustainable for program delivery', 'Transparent at every step']} />
                <p>We encourage you to review program details carefully before enrolling.</p>
            </Section>

            <Section title="2. Refund Eligibility">
                <h3 className="text-base font-semibold text-white mt-4 mb-2">a. Full Refund (100%)</h3>
                <p>You may be eligible for a full refund if:</p>
                <Bullets
                    items={[
                        'You cancel within 7 days of enrollment',
                        'You have not significantly accessed course content',
                        'The request is made before the program officially begins'
                    ]}
                />

                <h3 className="text-base font-semibold text-white mt-4 mb-2">b. Partial Refund</h3>
                <p>A partial refund may be considered for:</p>
                <Bullets
                    items={[
                        'Limited participation after program start',
                        'Documented personal emergencies',
                        'Technical issues that significantly impacted access (verified by our team)'
                    ]}
                />
                <p>Refund amount will be evaluated based on content accessed, sessions attended, and time elapsed since enrollment.</p>

                <h3 className="text-base font-semibold text-white mt-4 mb-2">c. No Refund</h3>
                <Bullets
                    items={[
                        'More than 10–15% of the program has been completed',
                        'You have accessed a substantial portion of course materials',
                        'You violate our Terms of Use or code of conduct',
                        'Payment default leads to suspension',
                        'The program has been completed or certification issued'
                    ]}
                />
            </Section>

            <Section title="3. How to Request a Refund">
                <Bullets
                    items={[
                        'Submit a request via email to support@alberoacademy.com',
                        'Use your registered email ID',
                        'Include: full name, program enrolled, reason for cancellation, supporting documents (if applicable)'
                    ]}
                />
                <p>Your request will be reviewed within 5–7 business days.</p>
            </Section>

            <Section title="4. Refund Processing Timeline">
                <Bullets items={['UPI / Wallets: 5–7 business days', 'Credit/Debit Cards: 7–10 business days', 'Net Banking: 7–10 business days']} />
                <p>Processing time may vary depending on your bank or payment provider.</p>
            </Section>

            <Section title="5. Deductions & Administrative Charges">
                <p>
                    Approved refunds may include reasonable deductions such as payment gateway charges, administrative processing fees, cost of
                    resources or materials already accessed, and value of sessions attended.
                </p>
            </Section>

            <Section title="6. EMI & Installment Plans">
                <Bullets
                    items={[
                        'Refunds apply only to the amount paid to Albero Academy',
                        'Loan / EMI obligations with third-party providers remain your responsibility',
                        'Interest and processing fees charged by lenders are non-refundable'
                    ]}
                />
            </Section>

            <Section title="7. Program Transfer & Deferment">
                <p>Before opting for cancellation, you may consider:</p>
                <Bullets
                    items={[
                        'Program Deferment: shift your batch to a later date',
                        'Program Transfer: switch to another program (subject to eligibility)',
                        'Credit Note: use your paid amount for future enrollment'
                    ]}
                />
            </Section>

            <Section title="8. Special Circumstances">
                <p>
                    Refund exceptions may be considered for medical emergencies, serious personal/family situations, or unforeseen critical events.
                    All such requests are reviewed case-by-case, with supporting documentation.
                </p>
            </Section>

            <Section title="9. Non-Refundable Components">
                <Bullets
                    items={[
                        'Registration or enrollment fees',
                        'Third-party certification or exam fees',
                        'External tools, software licenses, or subscriptions',
                        'Completed mentorship sessions',
                        'Career services or placement assistance fees'
                    ]}
                />
            </Section>

            <Section title="10. Dispute Resolution">
                <p>
                    If you disagree with a refund decision, you may submit a formal escalation within 15 days. Our team will conduct a secondary
                    review and decisions are made after internal evaluation.
                </p>
            </Section>
        </PolicyLayout>
    )
}
