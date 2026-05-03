import SEO from '@/components/user/common/SEO'
import { termsSEO } from '@/constants/seo'

export default function Terms() {
    return (
        <div className="bg-black text-white min-h-screen">
            <SEO
                title={termsSEO.title}
                description={termsSEO.description}
                keywords={termsSEO.keywords}
                url={termsSEO.url}
                canonical={termsSEO.canonical}
                image={termsSEO.image}
                type={termsSEO.type}
            />

            <div className="max-w-5xl mx-auto px-6 py-24">
                <h1 className="text-3xl font-semibold mb-10">Terms & Conditions</h1>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
                        <p>
                            By accessing this website or engaging with our services, you agree to comply with and be legally bound by these Terms and
                            Conditions. These terms apply to all visitors, clients, partners, and users interacting with our website, software, or
                            services.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">2. Services Provided</h2>

                        <p className="mt-3">
                            <strong className="text-white">Web & Software Development</strong>
                            <br />
                            We design, develop, and deploy custom web applications, websites, and software systems tailored to client requirements.
                            Services may include frontend development, backend systems, cloud deployment, API integrations, and ongoing maintenance.
                        </p>

                        <p className="mt-3">
                            <strong className="text-white">E-Commerce & SaaS Platforms</strong>
                            <br />
                            Our company builds scalable SaaS platforms and e-commerce systems including payment gateway integrations, subscription
                            billing, analytics dashboards, and user management systems.
                        </p>

                        <p className="mt-3">
                            <strong className="text-white">STEAM Labs for Schools</strong>
                            <br />
                            We design and implement STEAM innovation labs for educational institutions including hardware setup, learning curriculum,
                            training support, and technology infrastructure.
                        </p>

                        <p className="mt-3">
                            <strong className="text-white">Branding & Digital Marketing</strong>
                            <br />
                            Our marketing services include brand identity creation, SEO optimization, content strategy, advertising campaigns, and
                            social media management.
                        </p>

                        <p className="mt-3">
                            <strong className="text-white">ERP & Enterprise Solutions</strong>
                            <br />
                            We develop enterprise-grade software including ERP systems, workflow automation platforms, analytics dashboards, and
                            business intelligence tools.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">3. Client Responsibilities</h2>
                        <p>
                            Clients must provide accurate project requirements, content materials, approvals, and timely feedback. Delays caused due
                            to lack of communication, missing information, or delayed approvals may affect project timelines.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">4. Intellectual Property</h2>
                        <p>
                            All software code, designs, systems, and digital assets developed by our company remain our intellectual property until
                            the full payment for the project has been completed. Upon final payment, ownership rights may be transferred as defined in
                            the project agreement.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">5. Payment Terms</h2>
                        <p>
                            Projects typically follow a structured payment model including advance payment, milestone-based payments, and final
                            delivery payment. Failure to complete scheduled payments may result in project suspension.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">6. Confidentiality</h2>
                        <p>
                            Both parties agree to maintain confidentiality regarding proprietary business information, technical documentation, and
                            project data shared during collaboration.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">7. Third-Party Services</h2>
                        <p>
                            Some projects may involve third-party platforms such as hosting providers, payment gateways, APIs, analytics tools, or
                            software libraries. We are not responsible for downtime, policy changes, or service disruptions caused by such third-party
                            providers.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">8. Limitation of Liability</h2>
                        <p>
                            Our company shall not be liable for indirect, incidental, or consequential damages including loss of revenue, business
                            interruption, or data loss arising from the use of our services.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">9. Project Timelines</h2>
                        <p>
                            Estimated timelines are based on project scope and client cooperation. Changes in requirements, additional features, or
                            delayed approvals may impact delivery schedules.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">10. Changes to Terms</h2>
                        <p>
                            We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Updated policies
                            will be published on this page.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">11. Governing Law</h2>
                        <p>
                            These terms shall be governed by and interpreted in accordance with applicable laws and regulations of the jurisdiction in
                            which our company operates.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">12. Contact</h2>
                        <p>
                            For questions regarding these Terms and Conditions please contact us through the official communication channels available
                            on our website.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
