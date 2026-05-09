import type { ReactNode } from 'react'
import { H2, P, UL, LI, Strong, Callout, Takeaways } from '@/components/user/resources/tutorial-prose'

export interface CaseStudyEntry {
    slug: string
    brand: string
    title: string
    description: string
    sector: string
    founded: string
    headquarters: string
    revenue?: string
    employees?: string
    coverGradient: string
    badge?: string
    tags: string[]
    author: { name: string; role: string }
    readMin: number
    date: string
    keyFacts: { label: string; value: string }[]
    toc: { id: string; label: string }[]
    content: ReactNode
}

// ─── Starbucks ────────────────────────────────────────────────────────────────

const starbucks: CaseStudyEntry = {
    slug: 'starbucks',
    brand: 'Starbucks',
    title: 'Starbucks — How a Seattle Coffee Roaster Became a $100B Brand',
    description:
        "From a single store in Pike Place Market to 38,000+ outlets globally — a deep dive into Starbucks' franchise-licensing hybrid, third-place positioning, and the loyalty engine that powers half its revenue.",
    sector: 'Food & Beverage',
    founded: '1971',
    headquarters: 'Seattle, USA',
    revenue: '$36B',
    employees: '402,000+',
    coverGradient: 'linear-gradient(135deg,#065f46,#047857)',
    badge: 'Most Popular',
    tags: ['Business Model', 'Marketing Strategy', 'Brand'],
    author: { name: 'Vikram Mehra', role: 'Brand Strategy mentor' },
    readMin: 18,
    date: '23 Mar 2026',
    keyFacts: [
        { label: 'Stores worldwide', value: '38,000+' },
        { label: 'Daily customers', value: '100M+' },
        { label: 'Countries', value: '83' },
        { label: 'Loyalty members', value: '34M+' }
    ],
    toc: [
        { id: 'origin', label: 'Origin story' },
        { id: 'model', label: 'Business model' },
        { id: 'thirdplace', label: 'The "third place" strategy' },
        { id: 'rewards', label: 'Rewards & lock-in' },
        { id: 'lessons', label: 'Lessons for builders' }
    ],
    content: (
        <>
            <P>
                Starbucks is one of the most-studied brands of the last fifty years for a reason: it changed how America drinks coffee, how shopping
                malls anchor their food courts, and how loyalty programs convert habitual purchases into financial assets on a balance sheet. In this
                study we'll trace the moves that turned a single Seattle store into a $100 billion company.
            </P>

            <H2 id="origin">Origin story</H2>
            <P>
                Starbucks opened in 1971 as a single bean-roasting shop at Pike Place Market, Seattle. It sold ground coffee, not coffee drinks. The
                pivot to becoming a coffeehouse came in 1983 when Howard Schultz returned from Italy convinced that what America was missing was the
                espresso bar. After acquiring the brand in 1987, Schultz expanded with a relentless real-estate-first strategy.
            </P>

            <H2 id="model">Business model</H2>
            <P>
                Starbucks operates a hybrid model that's frequently misunderstood. Globally, ~50% of stores are <Strong>company-operated</Strong> and
                ~50% are <Strong>licensed</Strong> — but it does not run a traditional franchise system in the McDonald's sense.
            </P>
            <UL>
                <LI>
                    <Strong>Company-operated stores</Strong> sit on premium streets and capture the full margin. They control the brand experience.
                </LI>
                <LI>
                    <Strong>Licensed stores</Strong> live inside airports, supermarkets, and hotels — places Starbucks itself can't easily lease.
                    Royalties are smaller but capital is light.
                </LI>
                <LI>
                    <Strong>CPG channel</Strong> — packaged coffee and bottled drinks distributed by Nestlé under a $7B 2018 licensing deal. High
                    margin, zero stores.
                </LI>
            </UL>

            <Callout kind="info">
                In India, Starbucks runs as a 50-50 joint venture with Tata. This is neither pure licensing nor pure ownership — it's a hybrid that
                shows up in many regulated emerging markets.
            </Callout>

            <H2 id="thirdplace">The "third place" strategy</H2>
            <P>
                Schultz's most quoted idea is the "third place" — a space that isn't home (the first place) or work (the second). The store design
                follows from this brief: comfortable seating, free Wi-Fi, no time pressure, espresso-bar acoustics. Every choice from chair height to
                music volume is downstream of the third-place positioning.
            </P>

            <H2 id="rewards">Rewards &amp; the lock-in flywheel</H2>
            <P>
                The Starbucks Rewards program is the quietest financial-services innovation of the last decade. Customers preload money onto a
                Starbucks balance to earn faster — at any given quarter Starbucks is sitting on $1.6B+ of customer money. This balance is effectively
                an interest-free loan, larger than the deposit base of many community banks.
            </P>
            <P>The flywheel works like this:</P>
            <UL>
                <LI>Customer preloads ₹500 to earn 2× stars on next visit.</LI>
                <LI>Starbucks holds the cash — non-interest-bearing, in foreign currencies that strengthen.</LI>
                <LI>Customer is now psychologically locked in: spending Starbucks-money "doesn't feel" like spending real money.</LI>
                <LI>Breakage on unredeemed balances books straight to revenue.</LI>
            </UL>

            <H2 id="lessons">Lessons for builders</H2>
            <Takeaways
                items={[
                    'Hybrid models beat pure ones: own where the margin is, licence where the access is, partner where the regulation is.',
                    "Sell the experience, not the SKU. Coffee is a commodity; the third place isn't.",
                    'Pre-paid loyalty is a balance-sheet weapon — it converts habit into working capital.',
                    'Defend brand consistency obsessively in company-owned stores; let licensees flex on the edges.',
                    'A $100B brand is built from a clear customer brief — Schultz wrote one in 1983 and never deviated.'
                ]}
            />
        </>
    )
}

// ─── Zara ─────────────────────────────────────────────────────────────────────

const zara: CaseStudyEntry = {
    slug: 'zara',
    brand: 'Zara',
    title: 'Zara — The Fast-Fashion Empire That Made Trends in Two Weeks',
    description:
        "How Zara compressed the fashion supply chain from 9 months to 14 days, redefined retail merchandising, and grew Inditex into the world's most profitable apparel group — without TV ads.",
    sector: 'Fashion Retail',
    founded: '1975',
    headquarters: 'Arteixo, Spain',
    revenue: '$28B',
    employees: '165,000+',
    coverGradient: 'linear-gradient(135deg,#171717,#404040)',
    badge: 'Top Pick',
    tags: ['Business Model', 'Supply Chain', 'Marketing Strategy'],
    author: { name: 'Sneha Kapoor', role: 'Retail Strategy mentor' },
    readMin: 16,
    date: '23 Mar 2026',
    keyFacts: [
        { label: 'Stores worldwide', value: '2,200+' },
        { label: 'New designs / year', value: '12,000+' },
        { label: 'Markdown rate', value: '15%' },
        { label: 'Industry markdown rate', value: '50%' }
    ],
    toc: [
        { id: 'origin', label: 'The Inditex story' },
        { id: 'supplychain', label: 'A two-week supply chain' },
        { id: 'merchandising', label: 'Scarcity as merchandising' },
        { id: 'data', label: 'Stores as data sensors' },
        { id: 'lessons', label: 'Lessons for builders' }
    ],
    content: (
        <>
            <P>
                Zara is the brand that proved the fashion industry's century-old playbook was wrong. While competitors were forecasting trends 9
                months in advance, Zara was reading customer demand off the shop floor and shipping new product to stores within 14 days. The result:
                the largest, most profitable apparel group in history — and a textbook every operations student studies.
            </P>

            <H2 id="origin">The Inditex story</H2>
            <P>
                Amancio Ortega founded Confecciones Goa in 1963 as a robe-and-lingerie maker in A Coruña, Spain. The first Zara store opened in 1975.
                The strategic insight that built the empire came early: <Strong>treat fashion as a perishable good</Strong>, not a seasonal forecast.
                Inditex now operates eight brands; Zara remains the flagship, contributing ~70% of group revenue.
            </P>

            <H2 id="supplychain">A two-week supply chain</H2>
            <P>The Zara number that gets quoted everywhere is "14 days from sketch to store". That's enabled by:</P>
            <UL>
                <LI>
                    <Strong>Vertical integration.</Strong> Zara owns the design, fabric dyeing, cutting, and ~50% of garment manufacturing — most of
                    it in Spain, Portugal, Morocco, and Turkey. Most competitors outsource everything to Asia.
                </LI>
                <LI>
                    <Strong>Air freight, not sea.</Strong> Inditex ships product by air from a single hub in A Coruña, twice a week. It's expensive —
                    but margin from selling at full price beats the freight cost.
                </LI>
                <LI>
                    <Strong>Small batches.</Strong> Zara designs are made in small initial runs. If a SKU sells, more is made; if it doesn't, it
                    quietly disappears. There's no markdown season.
                </LI>
            </UL>

            <Callout kind="tip">
                The most counter-intuitive Zara number: only ~15% of inventory ends up at markdown vs. 50% industry average. That delta is the whole
                story of the group's profitability.
            </Callout>

            <H2 id="merchandising">Scarcity as merchandising</H2>
            <P>
                Zara stores deliberately keep less inventory than they could sell. A typical SKU sits on the floor for under 4 weeks. Customers learn
                that "I'll come back next week" is the wrong strategy — by next week it's gone. The result is roughly 17 store visits per customer per
                year, vs. 3–4 for typical apparel retail.
            </P>

            <H2 id="data">Stores as data sensors</H2>
            <P>
                Every Zara store manager reports daily on what's selling, what customers asked for that wasn't on the rack, and which fits got tried
                but not bought. That data lands at the design centre in Arteixo every evening. Decisions on which SKUs to scale, which to kill, and
                which trends to pursue happen on a weekly cadence.
            </P>

            <H2 id="lessons">Lessons for builders</H2>
            <Takeaways
                items={[
                    'Replace forecasting with sensing. Build cycles short enough to react instead of predict.',
                    'Vertical integration is a competitive moat when the supply chain is the product.',
                    'Treat scarcity as merchandising — not a manufacturing failure.',
                    'Stores (or in your business: customers) are the cheapest market-research instrument you own.',
                    'Air freight looks expensive on the freight line and cheap on the markdown line. Optimise the right line.'
                ]}
            />
        </>
    )
}

// ─── Discord ──────────────────────────────────────────────────────────────────

const discord: CaseStudyEntry = {
    slug: 'discord',
    brand: 'Discord',
    title: 'Discord — The Community-Led Platform That Out-Scaled Slack Without Paid Marketing',
    description:
        'How Discord turned a niche gamer voice-chat tool into a 200M+ user platform by betting on community-led growth, server-as-product, and zero spend on traditional acquisition.',
    sector: 'Consumer SaaS',
    founded: '2015',
    headquarters: 'San Francisco, USA',
    revenue: '$600M',
    employees: '850+',
    coverGradient: 'linear-gradient(135deg,#5865F2,#4752C4)',
    badge: 'Trending',
    tags: ['Business Model', 'Growth Strategy', 'Community'],
    author: { name: 'Arjun Nair', role: 'Growth mentor' },
    readMin: 14,
    date: '23 Mar 2026',
    keyFacts: [
        { label: 'Monthly users', value: '200M+' },
        { label: 'Servers', value: '19M+' },
        { label: 'Marketing spend', value: '<3% rev' },
        { label: 'Last valuation', value: '$15B' }
    ],
    toc: [
        { id: 'origin', label: 'From failed game studio' },
        { id: 'wedge', label: 'The gamer wedge' },
        { id: 'servers', label: 'Servers as product' },
        { id: 'monetization', label: 'Slow, deliberate monetization' },
        { id: 'lessons', label: 'Lessons for builders' }
    ],
    content: (
        <>
            <P>
                Discord is the rare consumer platform that scaled from zero to 200 million users without buying ads. Its growth playbook — start in a
                single passionate niche, build the product around communities, monetise patiently — has become the default reference for community-led
                growth in 2026.
            </P>

            <H2 id="origin">From a failed game studio</H2>
            <P>
                Discord's founders spent three years building a mobile game called Fates Forever. It didn't work. But while building, they hated every
                voice-chat tool they tried — TeamSpeak, Mumble, Skype. So they pivoted in 2015 to fix that one problem.
            </P>

            <H2 id="wedge">The gamer wedge</H2>
            <P>
                Discord's first 100,000 users came from one place: the League of Legends and World of Warcraft subreddits. The team sat in those
                communities, posted invites, and shipped weekly fixes for the exact pain those users felt — low-latency voice, no install for guests,
                free private servers. The wedge was so specific that the broader market underestimated what was being built.
            </P>

            <Callout kind="info">
                A useful analogy: Slack started as a dev-team niche, Notion as a docs-and-databases niche, Figma as a design niche. Each grew
                horizontally only after going deeper than anyone else in their wedge.
            </Callout>

            <H2 id="servers">Servers as product</H2>
            <P>
                The strategic move that unlocked horizontal expansion was treating <Strong>servers</Strong> as the unit of product, not chat rooms. A
                server in Discord is a fully-loaded community workspace: roles, channels, voice rooms, bots, moderation, analytics. By 2018, study
                groups, crypto DAOs, NFT communities, fan clubs, and university classrooms all looked like servers — even though Discord never built
                features for them specifically.
            </P>

            <H2 id="monetization">Slow, deliberate monetization</H2>
            <P>
                Discord refused to insert ads. Instead it launched <Strong>Nitro</Strong>, a $9.99/mo subscription unlocking emoji, file size, and
                sticker perks. Nitro currently powers most of Discord's revenue and is the cleanest example of a monetization model where{' '}
                <em>the product gets better, not worse, when you pay</em>.
            </P>

            <H2 id="lessons">Lessons for builders</H2>
            <Takeaways
                items={[
                    'Find a wedge community where the pain is acute and existing tools are bad.',
                    "Ship weekly to that community. Don't try to look like a finished product.",
                    'Make the unit of value bigger than the conversation — turn it into a workspace, a server, a guild.',
                    'Refuse the easy money (ads). Build a model where paying users still feel like winners.',
                    'Community-led growth is patient growth. It compounds longer than paid acquisition can.'
                ]}
            />
        </>
    )
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────

const razorpay: CaseStudyEntry = {
    slug: 'razorpay',
    brand: 'Razorpay',
    title: 'Razorpay — Payment Infrastructure for India and the Developer-First Wedge',
    description:
        'How Razorpay shipped a developer-first checkout, then layered neo-banking, payouts, and capital on top — the API-first playbook for fintech.',
    sector: 'Fintech / Payments',
    founded: '2014',
    headquarters: 'Bengaluru, India',
    revenue: '$120M',
    employees: '3,000+',
    coverGradient: 'linear-gradient(135deg,#3395FF,#2563eb)',
    badge: 'Editor Pick',
    tags: ['Fintech', 'Developer-First', 'API'],
    author: { name: 'Albero curriculum', role: 'Editorial' },
    readMin: 13,
    date: '09 May 2026',
    keyFacts: [
        { label: 'Businesses served', value: '10M+' },
        { label: 'TPV (annual)', value: '$90B+' },
        { label: 'Products shipped', value: '40+' },
        { label: 'Valuation', value: '$7.5B' }
    ],
    toc: [
        { id: 'origin', label: 'Origin story' },
        { id: 'wedge', label: 'The developer-first wedge' },
        { id: 'expansion', label: 'From checkout to neo-bank' },
        { id: 'moats', label: 'Where the moats are' },
        { id: 'lessons', label: 'Lessons for builders' }
    ],
    content: (
        <>
            <P>
                Razorpay started as a payment gateway in 2014 — a market that was already crowded with PayU, CCAvenue, and Citrus. A decade later it
                processes more than $90B in annual TPV, banks 10M+ Indian businesses, and ships products that touch every corner of B2B money
                movement. The story is a clinic in how a developer-first wedge becomes a multi-product platform.
            </P>

            <H2 id="origin">Origin story</H2>
            <P>
                Founders Harshil Mathur and Shashank Kumar met at IIT Roorkee. Their first attempt at a startup — a crowdfunding platform for social
                causes — kept dying on the same problem: the existing payment gateways were a nightmare to integrate. Two-week onboardings, PDF
                contracts, and APIs that returned XML in 2014. The pivot was obvious: build the gateway they wanted as developers.
            </P>
            <P>
                YC accepted them in 2015 — the first Indian fintech in YC. The early product was a single, well-documented REST API + a hosted
                checkout that took ~30 minutes to integrate. That's it. No PDF contract, no relationship manager required.
            </P>

            <H2 id="wedge">The developer-first wedge</H2>
            <P>
                Razorpay's first three years can be summarised in one sentence: <Strong>they competed on integration time, not pricing</Strong>. Every
                legacy gateway charged ~2% MDR and so did Razorpay — the wedge was that startups could go live in an afternoon instead of a month.
            </P>
            <UL>
                <LI>
                    <Strong>Self-serve KYC</Strong> with an online dashboard, not an account manager. Salesforce-grade pipelines compressed into a 10-
                    minute form.
                </LI>
                <LI>
                    <Strong>Public API + SDKs</Strong> for every major language. Documentation that rivalled Stripe's, in a market where documentation
                    was an afterthought.
                </LI>
                <LI>
                    <Strong>Webhook-first design</Strong> meant developers could build idempotent systems. Legacy gateways had no webhooks at all.
                </LI>
            </UL>

            <Callout kind="info">
                The "Stripe of India" framing was wrong in one important way: Stripe's market in 2014 was developed-economy SMBs paying USD;
                Razorpay's was Indian SMBs navigating UPI, NEFT, IMPS, NACH, and 11+ payment methods at once. The complexity Razorpay abstracted away
                was 5× higher than Stripe's.
            </Callout>

            <H2 id="expansion">From checkout to neo-bank</H2>
            <P>
                Once Razorpay had a million businesses on the gateway, it had a unique data asset: the cash flow of small Indian businesses. Every
                product after 2018 was a bet that this distribution + this data could be re-used to sell adjacent fintech:
            </P>
            <UL>
                <LI>
                    <Strong>RazorpayX</Strong> (2018) — neo-banking. Vendor payouts, automated reconciliation, expense cards. The bet: gateway
                    customers were already losing 4 hours a week on manual bank ops.
                </LI>
                <LI>
                    <Strong>Razorpay Capital</Strong> (2019) — working-capital loans underwritten on gateway-level cash-flow data. Underwriting
                    accuracy beats banks by 30%+ because Razorpay sees the order book in real time.
                </LI>
                <LI>
                    <Strong>Razorpay Payroll</Strong> (2020) — salary disbursal + compliance. Same playbook: piggy-back on the gateway distribution.
                </LI>
                <LI>
                    <Strong>International expansion</Strong> (2022+) — Curlec acquisition in Malaysia, then a license in Singapore. The product
                    pattern travels; the regulatory work doesn't.
                </LI>
            </UL>

            <H2 id="moats">Where the moats are</H2>
            <P>Three durable advantages compound:</P>
            <UL>
                <LI>
                    <Strong>Switching cost</Strong> — once a business runs payouts, payroll, and reconciliation through RazorpayX, the gateway becomes
                    sticky by association.
                </LI>
                <LI>
                    <Strong>Data flywheel</Strong> — every transaction sharpens fraud scoring, underwriting, and merchant onboarding. Newer entrants
                    can match the API but not the data.
                </LI>
                <LI>
                    <Strong>Regulatory access</Strong> — payment-aggregator licence, NBFC arm, banking partnerships. Each took 18+ months to secure
                    and is non-trivial to replicate.
                </LI>
            </UL>

            <H2 id="lessons">Lessons for builders</H2>
            <Takeaways
                items={[
                    "Don't fight on price when you can fight on time-to-integration. Developers will switch for documentation.",
                    'A wedge product is just permission to ship the next ten products into a captive customer base.',
                    "Data assets compound — every new product makes the others smarter. Stripe knows this; PayPal didn't.",
                    'Regulatory work is a moat in fintech. Treat licences as product roadmap, not back-office overhead.',
                    "The API-first playbook is a 10-year game. Razorpay's compounding really started in year 6."
                ]}
            />
        </>
    )
}

// ─── Flipkart ─────────────────────────────────────────────────────────────────

const flipkart: CaseStudyEntry = {
    slug: 'flipkart',
    brand: 'Flipkart',
    title: 'Flipkart — Building Indian E-Commerce From Books to a $35B Marketplace',
    description:
        'How Flipkart cracked Indian e-commerce — cash-on-delivery, Big Billion Days, supply-chain control, and the Walmart bet that re-shaped the market.',
    sector: 'E-commerce / Marketplace',
    founded: '2007',
    headquarters: 'Bengaluru, India',
    revenue: '$11B GMV',
    employees: '40,000+',
    coverGradient: 'linear-gradient(135deg,#2874F0,#1d4ed8)',
    badge: 'Editor Pick',
    tags: ['Marketplace', 'Operations', 'Logistics'],
    author: { name: 'Albero curriculum', role: 'Editorial' },
    readMin: 14,
    date: '09 May 2026',
    keyFacts: [
        { label: 'Registered customers', value: '500M+' },
        { label: 'Sellers', value: '1.5M+' },
        { label: 'Pin codes served', value: '20,000+' },
        { label: 'Big Billion Days GMV', value: '$1.4B' }
    ],
    toc: [
        { id: 'origin', label: 'Origin story' },
        { id: 'cod', label: 'Cash-on-delivery: the unlock' },
        { id: 'bbd', label: 'Big Billion Days' },
        { id: 'logistics', label: 'Owning the supply chain' },
        { id: 'walmart', label: 'The Walmart deal' },
        { id: 'lessons', label: 'Lessons for builders' }
    ],
    content: (
        <>
            <P>
                Flipkart is the case study every Indian operator references when they talk about building a market from scratch. The founders started
                with one product (books), one customer base (English-reading metro buyers), and one delivery option (a courier slip and a prayer).
                Sixteen years later they sit on 500M+ customer accounts and the largest e-commerce sale in Asia. The lessons are about market
                creation, not market capture.
            </P>

            <H2 id="origin">Origin story</H2>
            <P>
                Sachin Bansal and Binny Bansal (no relation) left Amazon Bangalore in 2007 to start Flipkart. The first office was an apartment; the
                first product was a single-page site that took book orders and forwarded them to a distributor. Their early growth hack was the
                cleanest in retail history — they bought the books themselves at the local market and delivered them by hand the same day.
            </P>
            <P>
                That bootstrap year mattered. Flipkart's earliest customers weren't just buying books; they were buying{' '}
                <Strong>delivery certainty</Strong> in a country where Amazon was still sceptical and Indian e-commerce was synonymous with broken
                shipments.
            </P>

            <H2 id="cod">Cash-on-delivery: the unlock</H2>
            <P>
                In 2010 less than 7% of Indians had a credit card. Existing online retailers required prepayment, which meant the addressable market
                was effectively zero. Flipkart launched <Strong>cash-on-delivery</Strong> as a default — pay only when the parcel arrives.
            </P>
            <UL>
                <LI>It eliminated the trust barrier (you didn't pay until you held the product).</LI>
                <LI>It unlocked tier-2 and tier-3 cities almost overnight.</LI>
                <LI>It forced Flipkart to build a logistics arm (Ekart) because no third-party courier could collect cash reliably.</LI>
            </UL>
            <Callout kind="warning">
                COD also became a structural cost. Returns and "fake orders" pushed COD margins ~3% below prepaid orders for years. Flipkart only
                began closing that gap when it shifted to UPI-on-delivery in 2019.
            </Callout>

            <H2 id="bbd">Big Billion Days</H2>
            <P>
                In 2014 Flipkart ran the first <Strong>Big Billion Days</Strong> sale, modelled after Singles' Day in China. The first edition broke —
                servers crashed, prices showed wrong, customers rage-tweeted for a week. Flipkart's apology letter from Sachin became one of the
                most-read corporate communications of the year.
            </P>
            <P>
                The event itself was a strategic win regardless. Big Billion Days established e-commerce as a cultural moment in India. By 2023 it
                generated $1.4B+ in GMV in five days — bigger than the annual revenue of most listed Indian retailers.
            </P>

            <H2 id="logistics">Owning the supply chain</H2>
            <P>
                Flipkart's bet — eventually copied by Amazon India — was that <Strong>supply chain</Strong>, not catalogue, was the moat in Indian
                e-commerce.
            </P>
            <UL>
                <LI>
                    <Strong>Ekart</Strong> — the captive logistics arm. Today the largest e-commerce delivery network in India, even ahead of India
                    Post by parcel volume.
                </LI>
                <LI>
                    <Strong>Fulfilment centres</Strong> — 50+ warehouses, with hyperlocal "kirana" partnerships in 20,000+ pin codes.
                </LI>
                <LI>
                    <Strong>Same-day in metros</Strong> — possible because Flipkart owns the last-mile, not because of any algorithmic miracle.
                </LI>
            </UL>

            <H2 id="walmart">The Walmart deal</H2>
            <P>
                In 2018 Walmart acquired 77% of Flipkart for $16B — at the time the largest e-commerce acquisition in history. The deal was not
                primarily about Walmart entering India retail (FDI rules made that thorny). It was about:
            </P>
            <UL>
                <LI>Locking in a hedge against Amazon in the world's last large open e-commerce market.</LI>
                <LI>Importing Walmart's grocery and supply-chain expertise into Flipkart's flywheel.</LI>
                <LI>Setting up PhonePe (Flipkart-incubated) as an independent fintech worth $12B+ on its own.</LI>
            </UL>

            <H2 id="lessons">Lessons for builders</H2>
            <Takeaways
                items={[
                    "Solve the trust problem before the catalogue problem. COD wasn't elegant — it just unlocked the market.",
                    'Own the parts of the supply chain your competitors treat as commodities. Logistics is the moat in physical goods.',
                    "A botched product launch can still be a strategic win if it establishes a category. Big Billion Days' first year was a disaster that minted a behaviour.",
                    'The right exit is sometimes the one that resets the cap-table for the next decade. Walmart bought time, capital, and a global distribution map.',
                    'Adjacent fintech (PhonePe) often becomes more valuable than the original commerce engine — plan for the second product on day one.'
                ]}
            />
        </>
    )
}

// ─── Stub list ────────────────────────────────────────────────────────────────

const stubBrands: Omit<CaseStudyEntry, 'content' | 'toc'>[] = [
    {
        slug: 'apple',
        brand: 'Apple',
        title: 'Apple — Premium Pricing, Vertical Integration & Brand Loyalty',
        description: "How Apple built the world's most valuable brand through hardware-software integration and a cult-like ecosystem.",
        sector: 'Consumer Tech',
        founded: '1976',
        headquarters: 'Cupertino, USA',
        revenue: '$383B',
        employees: '161,000+',
        coverGradient: 'linear-gradient(135deg,#9ca3af,#e5e7eb)',
        tags: ['Business Model', 'Premium Pricing', 'Ecosystem'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 16,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Active devices', value: '2.2B+' },
            { label: 'App Store devs', value: '36M+' },
            { label: 'Margin (services)', value: '70%' },
            { label: 'Market cap', value: '$3.4T' }
        ]
    },
    {
        slug: 'amazon',
        brand: 'Amazon',
        title: 'Amazon — Day-1 Culture, Flywheels & Ruthless Customer Obsession',
        description: 'The flywheel that powered the everything-store, AWS, Prime, and a culture of long-term thinking.',
        sector: 'E-commerce / Cloud',
        founded: '1994',
        headquarters: 'Seattle, USA',
        revenue: '$575B',
        employees: '1.5M+',
        coverGradient: 'linear-gradient(135deg,#f97316,#fbbf24)',
        tags: ['Business Model', 'Flywheel', 'Operations'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 18,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Prime members', value: '230M+' },
            { label: 'AWS revenue', value: '$90B' },
            { label: 'SKUs', value: '350M+' },
            { label: 'Market cap', value: '$1.9T' }
        ]
    },
    {
        slug: 'netflix',
        brand: 'Netflix',
        title: 'Netflix — DVDs, Streaming, and the Bet That Built Modern Hollywood',
        description: "From mailing DVDs to commissioning the world's most-watched shows — the strategy bets that defined Netflix's three eras.",
        sector: 'Media / Streaming',
        founded: '1997',
        headquarters: 'Los Gatos, USA',
        revenue: '$33B',
        employees: '13,000+',
        coverGradient: 'linear-gradient(135deg,#dc2626,#7f1d1d)',
        tags: ['Business Model', 'Strategy Bets', 'Content'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 14,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Subscribers', value: '283M' },
            { label: 'Original hours / yr', value: '5,500+' },
            { label: 'Content spend', value: '$17B' },
            { label: 'Operating margin', value: '21%' }
        ]
    },
    {
        slug: 'spotify',
        brand: 'Spotify',
        title: 'Spotify — Music Streaming, Discovery, and the Audio Two-Sided Market',
        description: 'How Spotify won streaming, then bet on podcasts, then built audiobooks — and the platform economics underneath.',
        sector: 'Music Streaming',
        founded: '2006',
        headquarters: 'Stockholm, Sweden',
        revenue: '$15B',
        employees: '7,400+',
        coverGradient: 'linear-gradient(135deg,#16a34a,#22c55e)',
        tags: ['Business Model', 'Two-Sided Market', 'Content'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 12,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Premium subs', value: '252M' },
            { label: 'MAUs', value: '640M' },
            { label: 'Tracks', value: '100M+' },
            { label: 'Markets', value: '180+' }
        ]
    },
    {
        slug: 'airbnb',
        brand: 'Airbnb',
        title: 'Airbnb — Building Trust Between Strangers at Global Scale',
        description: 'Cereal boxes, regulatory wars, and the trust infrastructure that turned spare bedrooms into a $100B marketplace.',
        sector: 'Travel Marketplace',
        founded: '2008',
        headquarters: 'San Francisco, USA',
        revenue: '$11B',
        employees: '7,300+',
        coverGradient: 'linear-gradient(135deg,#fb7185,#f43f5e)',
        tags: ['Marketplace', 'Trust', 'Brand'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 13,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Listings', value: '7.7M' },
            { label: 'Hosts', value: '5M' },
            { label: 'Cumulative guests', value: '2B+' },
            { label: 'Cities', value: '100,000+' }
        ]
    },
    {
        slug: 'tesla',
        brand: 'Tesla',
        title: 'Tesla — Vertical Integration, Software-First Cars, and a Brand Built on a CEO',
        description: 'How Tesla turned an EV niche into the most valuable automaker, built its own factories, and made software the differentiator.',
        sector: 'EV / Energy',
        founded: '2003',
        headquarters: 'Austin, USA',
        revenue: '$96B',
        employees: '140,000+',
        coverGradient: 'linear-gradient(135deg,#991b1b,#7f1d1d)',
        tags: ['Vertical Integration', 'Brand', 'Disruption'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 15,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Vehicles delivered', value: '1.8M / yr' },
            { label: 'Supercharger stalls', value: '60,000+' },
            { label: 'Marketing spend', value: '$0' },
            { label: 'Market cap', value: '$800B' }
        ]
    },
    {
        slug: 'nike',
        brand: 'Nike',
        title: 'Nike — Brand-Led Athletics, Endorsement Economics, and the DTC Pivot',
        description: 'Just Do It, Air Jordan, and the long arc from manufacturer to brand-first DTC athletic powerhouse.',
        sector: 'Apparel / Athletics',
        founded: '1964',
        headquarters: 'Beaverton, USA',
        revenue: '$51B',
        employees: '79,000+',
        coverGradient: 'linear-gradient(135deg,#0a0a0a,#262626)',
        tags: ['Brand', 'DTC', 'Endorsements'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 13,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'DTC revenue', value: '44%' },
            { label: 'Retail stores', value: '1,000+' },
            { label: 'Endorsements', value: '$1.5B / yr' },
            { label: 'Athletes signed', value: '2,000+' }
        ]
    },
    {
        slug: 'pinterest',
        brand: 'Pinterest',
        title: 'Pinterest — Visual Discovery as a $2.8B Advertising Engine',
        description:
            "From idea-bookmarking app to one of the highest-intent ad platforms — Pinterest's category creation and slow-burn monetisation.",
        sector: 'Social / Discovery',
        founded: '2010',
        headquarters: 'San Francisco, USA',
        revenue: '$3B',
        employees: '3,800+',
        coverGradient: 'linear-gradient(135deg,#dc2626,#ef4444)',
        tags: ['Business Model', 'Advertising', 'Discovery'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 16,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'MAUs', value: '498M' },
            { label: 'Pins saved', value: '300B+' },
            { label: 'ARPU (US)', value: '$8.5' },
            { label: 'Shopping conversion', value: '+88%' }
        ]
    },
    {
        slug: 'mcdonalds',
        brand: "McDonald's",
        title: "McDonald's — How a Burger Stand Became the World's Largest Real-Estate Company",
        description: "The supply chain, franchise model, and (yes) real-estate strategy that built the world's most recognisable food brand.",
        sector: 'Quick-Service Restaurants',
        founded: '1940',
        headquarters: 'Chicago, USA',
        revenue: '$25B (corp)',
        employees: '150,000+',
        coverGradient: 'linear-gradient(135deg,#fbbf24,#dc2626)',
        tags: ['Franchise', 'Real Estate', 'Operations'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 14,
        date: '23 Mar 2026',
        keyFacts: [
            { label: 'Restaurants', value: '40,000+' },
            { label: 'Daily customers', value: '69M' },
            { label: 'Franchised', value: '93%' },
            { label: 'Real estate value', value: '$45B' }
        ]
    },
    {
        slug: 'swiggy',
        brand: 'Swiggy',
        title: 'Swiggy — Hyperlocal Delivery, Dark Stores, and the Three-App Strategy',
        description:
            'How Swiggy went from food delivery to Instamart, Genie, and Dineout — the hyperlocal flywheel and the cancellation-cost lesson it learned the hard way.',
        sector: 'Food Delivery / Quick Commerce',
        founded: '2014',
        headquarters: 'Bengaluru, India',
        revenue: '$1.3B',
        employees: '6,000+',
        coverGradient: 'linear-gradient(135deg,#FC8019,#f97316)',
        tags: ['Marketplace', 'Operations', 'Hyperlocal'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 12,
        date: '09 May 2026',
        keyFacts: [
            { label: 'Cities', value: '600+' },
            { label: 'Delivery partners', value: '350,000+' },
            { label: 'Restaurant partners', value: '200,000+' },
            { label: 'Orders / day', value: '2M+' }
        ]
    },
    {
        slug: 'adobe',
        brand: 'Adobe',
        title: 'Adobe — Subscription Bet, Creative Cloud, and the AI Re-Boot',
        description:
            "The licence-to-subscription pivot that doubled valuations, the Figma deal that didn't happen, and how Firefly is reshaping Adobe again.",
        sector: 'Creative SaaS',
        founded: '1982',
        headquarters: 'San Jose, USA',
        revenue: '$22B',
        employees: '30,000+',
        coverGradient: 'linear-gradient(135deg,#FA0F00,#dc2626)',
        tags: ['SaaS', 'Subscription', 'AI'],
        author: { name: 'Albero curriculum', role: 'Editorial' },
        readMin: 15,
        date: '09 May 2026',
        keyFacts: [
            { label: 'Creative Cloud subs', value: '33M+' },
            { label: 'Annual recurring rev', value: '$19B' },
            { label: 'Margin (operating)', value: '36%' },
            { label: 'Market cap', value: '$240B' }
        ]
    }
]

const allCaseStudies: CaseStudyEntry[] = [
    starbucks,
    zara,
    discord,
    razorpay,
    flipkart,
    ...stubBrands.map((s) => ({
        ...s,
        toc: [],
        content: (
            <>
                <P>
                    A full-length case study for <Strong>{s.brand}</Strong> is part of our publishing pipeline and will be available shortly. In the
                    meantime, explore other studies in <Strong>{s.sector}</Strong> or check out our published deep-dives on Starbucks, Zara and
                    Discord.
                </P>
                <Callout kind="info">
                    Want us to prioritise this case study? Email <Strong>support@alberoacademy.com</Strong> with the brand name — we publish what
                    learners ask for first.
                </Callout>
            </>
        )
    }))
]

export function findCaseStudy(slug: string) {
    return allCaseStudies.find((c) => c.slug === slug)
}
export function listCaseStudies() {
    return allCaseStudies
}
