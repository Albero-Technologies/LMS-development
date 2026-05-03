const images = {
    alt: 'Feature screenshot',
    step1img1: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1740&auto=format&fit=crop',
    step1img2: 'https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?q=80&w=1740&auto=format&fit=crop',
    step2img1: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1661&auto=format&fit=crop',
    step2img2: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1170&auto=format&fit=crop',
    step3img: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1740&auto=format&fit=crop',
    step4img: 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=1170&auto=format&fit=crop',
    step5img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1170&auto=format&fit=crop'
}

const defaultClasses = {
    img: 'rounded-xl border border-neutral-200 border-neutral-800 shadow-2xl shadow-black/10 shadow-neutral-950/50',
    step1img1: 'w-[50%] md:w-[90%] left-0 md:left-0 top-5',
    step1img2: 'w-[60%] md:hidden left-20 md:left-30 top-20',
    step2img1: 'w-[60%] md:hidden md:w-[50%] left-20 md:left-0 top-20',
    step2img2: 'w-[50%] md:w-[90%] left-0 md:0 top-5 md:top-5',
    step3img: 'w-[80%] md:w-[90%] left-0 top-5',
    step4img: 'w-[80%] md:w-[90%] left-0 top-5',
    step5img: 'w-[80%] md:w-[90%] left-0 top-5'
} as const

const TOTAL_STEPS = 5

const steps = [
    {
        id: '1',
        name: 'Step 1',
        title: 'Strategy & Product Planning',
        description:
            'We deep-dive into your business model, target users, and goals to define a clear roadmap. This ensures we build the right product—not just a good-looking one.'
    },
    {
        id: '2',
        name: 'Step 2',
        title: 'UI/UX Design That Converts',
        description:
            'We design intuitive, conversion-focused interfaces with Figma prototypes—so you can visualize, validate, and refine before development begins.'
    },
    {
        id: '3',
        name: 'Step 3',
        title: 'Scalable Development (Frontend + Backend)',
        description: 'Using modern tech stacks, we build fast, secure, and scalable systems engineered for long-term growth—not quick fixes.'
    },
    {
        id: '4',
        name: 'Step 4',
        title: 'Testing, Optimization & Security',
        description:
            'We rigorously test for performance, security, and reliability—ensuring your product runs flawlessly across all devices and user scenarios.'
    },
    {
        id: '5',
        name: 'Step 5',
        title: 'Launch, Scale & Continuous Support',
        description:
            'We don’t stop at launch. We help you scale, optimize, and continuously improve with ongoing support, updates, and growth-focused enhancements.'
    }
]

export const processData = {
    badgeTitle: 'Our Proven Process',
    heading: 'From Idea to Scalable Product — Delivered Fast & Right',
    description:
        'We follow a structured, result-driven approach to ensure your product is not just built—but optimized for performance, scalability, and real business growth.',
    images: images,
    defaultClasses: defaultClasses,
    totalSteps: TOTAL_STEPS,
    steps: steps
}
