const Terms = () => {
    return (
        <div className="min-h-screen flex items-center bg-black text-gray-200 px-6 md:px-20 py-32">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-6">Terms & Policies</h1>
                <p className="text-gray-400 mb-8">
                    Please read these terms carefully before using our services. By accessing or using our website, you agree to be bound by these
                    terms.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-3">1. Use of Services</h2>
                    <p className="text-gray-400 leading-relaxed">
                        You agree to use our services only for lawful purposes and in accordance with applicable laws and regulations. Any misuse of
                        our services may result in termination.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-3">2. Intellectual Property</h2>
                    <p className="text-gray-400 leading-relaxed">
                        All content, designs, and code remain our intellectual property. Unauthorized reproduction or distribution is strictly
                        prohibited.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-3">3. Limitation of Liability</h2>
                    <p className="text-gray-400 leading-relaxed">
                        We are not liable for any indirect, incidental, or consequential damages resulting from the use of our services.
                    </p>
                </section>

                <p className="text-gray-500 text-sm mt-12">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    )
}

export default Terms
