const Refund = () => {
    return (
        <div className="min-h-screen flex items-center bg-black text-gray-200 px-6 md:px-20 py-32">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-6">Refund Policy</h1>
                <p className="text-gray-400 mb-8">We value your satisfaction. Please read our refund policy carefully before making a purchase.</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-3">1. Eligibility for Refund</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Refund requests must be made within <strong>7 days</strong> of purchase. Services that have already been delivered or
                        initiated are not eligible for a refund.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-3">2. Non-Refundable Items</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Digital products, completed projects, or services customized for a client are non-refundable.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-3">3. Refund Process</h2>
                    <p className="text-gray-400 leading-relaxed">
                        To request a refund, please contact our support team with your order details. Approved refunds will be processed to your
                        original payment method within 5–10 business days.
                    </p>
                </section>

                <p className="text-gray-500 text-sm mt-12">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    )
}

export default Refund
