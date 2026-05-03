import SEO from '@/components/user/common/SEO'
import { refundSEO } from '@/constants/seo'

export default function RefundPolicy() {
    return (
        <div className="bg-black text-white min-h-screen">
            <SEO
                title={refundSEO.title}
                description={refundSEO.description}
                keywords={refundSEO.keywords}
                url={refundSEO.url}
                canonical={refundSEO.canonical}
                image={refundSEO.image}
                type={refundSEO.type}
            />

            <div className="max-w-5xl mx-auto px-6 py-24">
                <h1 className="text-3xl font-semibold mb-10">Refund & Cancellation Policy</h1>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">1. Overview</h2>
                        <p>
                            This policy outlines the rules governing refunds, cancellations, and payment disputes for services including software
                            development, SaaS products, enterprise solutions, digital marketing, and STEAM lab installations.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">2. Advance Payments</h2>
                        <p>
                            Advance payments are required before project initiation. Once work has begun, advance payments are generally
                            non-refundable as resources and development time are already allocated to the project.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">3. Milestone Payments</h2>
                        <p>
                            Payments associated with completed project milestones are non-refundable. Each milestone represents completed work and
                            deliverables approved by the client.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">4. Client Cancellation</h2>
                        <p>
                            Clients may cancel services by submitting written notice. Work completed up to the cancellation date will be billed
                            accordingly. Any pending invoices must be cleared before project closure.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">5. Subscription Services</h2>
                        <p>
                            SaaS subscriptions may be cancelled at the end of the current billing cycle. Subscription fees already billed are not
                            refundable.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">6. Digital Marketing Services</h2>
                        <p>
                            Marketing services involve planning, strategy development, and campaign execution. Once a campaign has begun or
                            advertising spend has been allocated, refunds cannot be processed.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">7. Company Cancellation Rights</h2>
                        <p>
                            We reserve the right to suspend or cancel services if payments are overdue, contractual terms are violated, or the project
                            scope is altered without formal agreement.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">8. Exceptional Refunds</h2>
                        <p>
                            Refunds may be issued only in exceptional circumstances where services cannot be delivered due to operational limitations
                            or technical constraints.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">9. Processing Time</h2>
                        <p>
                            Approved refunds, if applicable, will be processed within a reasonable timeframe using the original payment method or
                            mutually agreed alternative.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">10. Contact</h2>
                        <p>For refund or cancellation requests please contact our support team through the website contact page.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
