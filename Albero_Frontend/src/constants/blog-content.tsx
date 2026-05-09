import type { ReactNode } from 'react'
import CodeBlock from '@/components/ui/code-block'
import { H2, P, UL, LI, Code, Strong, Callout, Takeaways } from '@/components/user/resources/tutorial-prose'

export interface BlogPost {
    slug: string
    title: string
    description: string
    category: string
    date: string
    readMin: number
    tags: string[]
    author: { name: string; role: string }
    coverGradient: string
    toc: { id: string; label: string }[]
    content: ReactNode
}

// ─── Featured: Data Warehousing 101 ───────────────────────────────────────────

const dataWarehousing101: BlogPost = {
    slug: 'data-warehousing-101-star-vs-snowflake',
    title: 'Data Warehousing 101: Star Schema vs Snowflake Schema',
    description:
        'Understand the fundamentals of data warehouse design — comparing star schema and snowflake schema with practical examples, use cases, and guidance on choosing the right approach.',
    category: 'Data Engineering',
    date: '5 May 2026',
    readMin: 11,
    tags: ['DataWarehousing', 'StarSchema', 'SnowflakeSchema'],
    author: { name: 'Meritshot Team', role: 'Albero curriculum' },
    coverGradient: 'linear-gradient(135deg,#0ea5e9,#3b82f6)',
    toc: [
        { id: 'intro', label: 'Why warehouse design matters' },
        { id: 'star', label: 'The star schema' },
        { id: 'snowflake', label: 'The snowflake schema' },
        { id: 'comparison', label: 'Side-by-side comparison' },
        { id: 'choosing', label: 'How to choose' }
    ],
    content: (
        <>
            <span
                id="intro"
                className="block scroll-mt-32"
            />
            <P>
                If you've ever waited 90 seconds for a Power BI dashboard to load, you've felt the cost of bad warehouse design. The way you model
                your data — how you split it across tables, how you join it — is the single biggest decision you'll make in any analytics project. In
                this post we'll compare the two most common warehouse modelling patterns: the <Strong>star schema</Strong> and the{' '}
                <Strong>snowflake schema</Strong>.
            </P>

            <H2 id="star">The star schema</H2>
            <P>
                A star schema has one central <Strong>fact table</Strong> surrounded by several <Strong>dimension tables</Strong>. Every dimension
                joins directly to the fact table. There is no inter-dimension chaining. The shape — when you draw it — looks like a star.
            </P>
            <CodeBlock
                language="sql"
                title="star schema · sales mart"
                code={`-- fact_sales has the metrics
CREATE TABLE fact_sales (
    sale_id        BIGINT,
    date_id        INT REFERENCES dim_date(date_id),
    customer_id    INT REFERENCES dim_customer(customer_id),
    product_id     INT REFERENCES dim_product(product_id),
    store_id       INT REFERENCES dim_store(store_id),
    quantity       INT,
    revenue        NUMERIC(12,2)
);

-- each dimension is a flat, denormalised table
CREATE TABLE dim_product (
    product_id     INT PRIMARY KEY,
    product_name   TEXT,
    brand          TEXT,
    category       TEXT,
    sub_category   TEXT,
    department     TEXT       -- redundant on purpose
);`}
            />
            <P>
                Notice that <Code>dim_product</Code> stores the brand, category, and department all on one row. Yes, that means brand names get
                duplicated across thousands of products. That's the trade-off — and it's intentional.
            </P>

            <H2 id="snowflake">The snowflake schema</H2>
            <P>
                A snowflake schema starts the same way — fact in the middle, dimensions around it — but each dimension is{' '}
                <Strong>normalised into multiple tables</Strong>. Brand sits in its own <Code>dim_brand</Code>, category in its own{' '}
                <Code>dim_category</Code>, and so on.
            </P>
            <CodeBlock
                language="sql"
                title="snowflake · same domain"
                code={`CREATE TABLE dim_product (
    product_id    INT PRIMARY KEY,
    product_name  TEXT,
    brand_id      INT REFERENCES dim_brand(brand_id),
    category_id   INT REFERENCES dim_category(category_id)
);

CREATE TABLE dim_category (
    category_id        INT PRIMARY KEY,
    category_name      TEXT,
    sub_category_id    INT REFERENCES dim_sub_category(sub_category_id)
);

CREATE TABLE dim_sub_category (
    sub_category_id   INT PRIMARY KEY,
    sub_category_name TEXT,
    department_id     INT REFERENCES dim_department(department_id)
);

-- and so on…`}
            />
            <P>
                Now to get from a sale to a department name, your query has to walk:{' '}
                <Code>fact_sales → dim_product → dim_category → dim_sub_category → dim_department</Code>. Five joins. Even though the data is cleaner.
            </P>

            <H2 id="comparison">Side-by-side comparison</H2>
            <UL>
                <LI>
                    <Strong>Storage.</Strong> Snowflake wins — no duplication. But disk is cheap. This rarely tips the decision.
                </LI>
                <LI>
                    <Strong>Query speed.</Strong> Star wins — fewer joins, faster scans. Critical at BI-tool speed.
                </LI>
                <LI>
                    <Strong>Maintenance.</Strong> Snowflake wins — change a brand name in one place. Star duplicates the change everywhere.
                </LI>
                <LI>
                    <Strong>Analyst usability.</Strong> Star wins — fewer tables to learn, fewer joins to remember.
                </LI>
                <LI>
                    <Strong>ETL complexity.</Strong> Star wins — fewer surrogate keys to manage during loads.
                </LI>
            </UL>

            <Callout kind="tip">
                Modern columnar warehouses (BigQuery, Snowflake, Redshift, ClickHouse) handle wide denormalised tables very efficiently. That tilts
                the scale toward <Strong>star</Strong> for most analytics use cases in 2026.
            </Callout>

            <H2 id="choosing">How to choose</H2>
            <P>A simple decision framework we use at Albero when reviewing student projects:</P>
            <UL>
                <LI>
                    Pick <Strong>star</Strong> if BI dashboards are the primary consumer (90% of cases).
                </LI>
                <LI>
                    Pick <Strong>snowflake</Strong> if you have very large dimensions ({'>'}50M rows) or strict regulatory requirements that demand a
                    single source of truth per attribute.
                </LI>
                <LI>
                    For mixed needs, build a <Strong>star schema</Strong> in your gold layer and keep the snowflaked source available in the silver
                    layer.
                </LI>
            </UL>

            <Takeaways
                items={[
                    'Star schema: one fact table, flat denormalised dimensions, faster queries, easier for analysts.',
                    'Snowflake schema: same fact, but dimensions normalised into multiple tables — cleaner data, more joins.',
                    'Modern columnar warehouses make star the default choice for analytics in 2026.',
                    'Reach for snowflake only when you have very large dimensions or strict consistency requirements.',
                    'A practical pattern: snowflake in your silver layer, star in your gold/serving layer.'
                ]}
            />
        </>
    )
}

// ─── Apache Kafka ─────────────────────────────────────────────────────────────

const apacheKafka: BlogPost = {
    slug: 'apache-kafka-real-time-pipelines',
    title: 'Apache Kafka: Building Real-Time Data Streaming Pipelines',
    description:
        'A beginner-friendly guide to Apache Kafka — covering core concepts like topics, partitions, producers, consumers, and how to build your first real-time streaming pipeline.',
    category: 'Data Engineering',
    date: '1 May 2026',
    readMin: 9,
    tags: ['ApacheKafka', 'DataEngineering', 'Streaming'],
    author: { name: 'Meritshot Team', role: 'Albero curriculum' },
    coverGradient: 'linear-gradient(135deg,#f97316,#fbbf24)',
    toc: [
        { id: 'why', label: 'Why Kafka?' },
        { id: 'core', label: 'Core concepts' },
        { id: 'producer', label: 'Your first producer' },
        { id: 'consumer', label: 'Your first consumer' }
    ],
    content: (
        <>
            <P>
                Apache Kafka is the backbone of modern real-time data systems. Uber, Netflix, LinkedIn, Razorpay — all run massive Kafka clusters to
                move billions of events per day. In this post we'll cut through the jargon and build a working producer-consumer pair in under 30
                lines of Python.
            </P>

            <H2 id="why">Why Kafka?</H2>
            <P>
                Before Kafka, moving events between systems meant point-to-point integrations. Service A calls service B which calls service C. One
                outage and the whole graph collapses. Kafka inverts the model: services <Strong>publish events</Strong> to topics, and any number of
                services can <Strong>subscribe</Strong>. The producer doesn't care who's listening, and the consumer doesn't care who wrote the event.
            </P>

            <H2 id="core">Core concepts in 60 seconds</H2>
            <UL>
                <LI>
                    <Strong>Topic.</Strong> A named stream of events. e.g. <Code>orders.placed</Code>, <Code>user.signups</Code>.
                </LI>
                <LI>
                    <Strong>Partition.</Strong> A topic is split into partitions for parallelism. Each partition is an ordered, append-only log.
                </LI>
                <LI>
                    <Strong>Producer.</Strong> An app that writes events to a topic.
                </LI>
                <LI>
                    <Strong>Consumer.</Strong> An app that reads events from a topic. Multiple consumers can read the same topic independently.
                </LI>
                <LI>
                    <Strong>Offset.</Strong> A consumer's bookmark inside a partition. Kafka doesn't push — consumers pull at their own pace.
                </LI>
            </UL>

            <H2 id="producer">Your first producer</H2>
            <P>
                Install <Code>kafka-python</Code> and connect to a local broker:
            </P>
            <CodeBlock
                language="python"
                title="producer.py"
                code={`from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

order = {
    "order_id": 7842,
    "user_id": 412,
    "amount": 1499.00,
    "currency": "INR"
}

producer.send("orders.placed", value=order)
producer.flush()
print("Order published!")`}
            />

            <H2 id="consumer">Your first consumer</H2>
            <P>Now read those events from another script:</P>
            <CodeBlock
                language="python"
                title="consumer.py"
                code={`from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    "orders.placed",
    bootstrap_servers="localhost:9092",
    auto_offset_reset="earliest",
    group_id="order-fulfilment",
    value_deserializer=lambda b: json.loads(b.decode("utf-8"))
)

for msg in consumer:
    order = msg.value
    print(f"Processing order #{order['order_id']} for ₹{order['amount']}")
    # ship to fulfilment, send WhatsApp, write to warehouse, etc.`}
            />

            <Callout kind="info">
                The <Code>group_id</Code> is the magic that lets you scale. Run two copies of the consumer with the same group_id and Kafka will
                automatically split the partitions between them. Run them with <em>different</em> group_ids and they each get the full stream
                independently.
            </Callout>

            <Takeaways
                items={[
                    'Kafka decouples producers from consumers via topics — the central nervous system of event-driven systems.',
                    'Topics are split into partitions for parallelism; each partition is an ordered append-only log.',
                    'Consumers track their own offsets — they pull at their own pace, replays are free.',
                    'Group consumers with the same group_id share work; different group_ids each get the full stream.',
                    'You can build a working producer-consumer pair in 30 lines of Python — start there before reaching for Kafka Streams.'
                ]}
            />
        </>
    )
}

// ─── Stub list — preview only, body is "coming soon" ──────────────────────────

const stubPosts: Omit<BlogPost, 'content' | 'toc'>[] = [
    {
        slug: 'mastering-data-visualization',
        title: 'Mastering Data Visualization: Charts, Mistakes & Storytelling',
        description: 'Master the principles of effective data visualization — chart selection, common mistakes, and storytelling.',
        category: 'Data Science',
        date: '8 Apr 2026',
        readMin: 7,
        tags: ['DataVisualization', 'DataScience', 'Charts'],
        author: { name: 'Meritshot Team', role: 'Albero curriculum' },
        coverGradient: 'linear-gradient(135deg,#16a34a,#10b981)'
    },
    {
        slug: 'computer-vision-2026',
        title: 'Computer Vision in 2026: Real-World Applications Transforming Industries',
        description: 'Explore how computer vision is transforming manufacturing, healthcare, agriculture, retail, and autonomous vehicles.',
        category: 'AI',
        date: '2 Apr 2026',
        readMin: 8,
        tags: ['ComputerVision', 'AI', 'DeepLearning'],
        author: { name: 'Meritshot Team', role: 'Albero curriculum' },
        coverGradient: 'linear-gradient(135deg,#dc2626,#ef4444)'
    },
    {
        slug: 'large-language-models-explained',
        title: 'Large Language Models Explained: How AI Understands Text',
        description: 'A clear explanation of how LLMs like GPT and Claude work — transformers, training, fine-tuning, and 2026 applications.',
        category: 'AI',
        date: '28 Mar 2026',
        readMin: 8,
        tags: ['LLM', 'AI', 'MachineLearning'],
        author: { name: 'Meritshot Team', role: 'Albero curriculum' },
        coverGradient: 'linear-gradient(135deg,#facc15,#f97316)'
    },
    {
        slug: 'git-branching-strategies',
        title: 'Git Branching Strategies That Actually Work for Teams',
        description: 'A practical comparison of Git Flow, GitHub Flow, and Trunk-Based Development.',
        category: 'Software Development',
        date: '20 Mar 2026',
        readMin: 6,
        tags: ['Git', 'DevOps', 'Engineering'],
        author: { name: 'Meritshot Team', role: 'Albero curriculum' },
        coverGradient: 'linear-gradient(135deg,#a855f7,#7c3aed)'
    },
    {
        slug: 'investment-banking-analyst-day',
        title: 'Investment Banking: A Day in the Life of an Analyst',
        description: 'Hours, deal flow, pitch books, modeling, mentorship, and unwritten rules of IB analyst life.',
        category: 'Finance & Investment Banking',
        date: '15 Mar 2026',
        readMin: 10,
        tags: ['InvestmentBanking', 'Career', 'Finance'],
        author: { name: 'Meritshot Team', role: 'Albero curriculum' },
        coverGradient: 'linear-gradient(135deg,#facc15,#f59e0b)'
    },
    {
        slug: 'cracking-pm-interview',
        title: 'Cracking the Product Manager Interview at MAANG',
        description: 'A structured framework for PM interview prep — strategy, behavioural, technical depth, case studies.',
        category: 'Career',
        date: '10 Mar 2026',
        readMin: 12,
        tags: ['ProductManagement', 'Interviews', 'Career'],
        author: { name: 'Meritshot Team', role: 'Albero curriculum' },
        coverGradient: 'linear-gradient(135deg,#3b82f6,#0ea5e9)'
    }
]

const allPosts: BlogPost[] = [
    dataWarehousing101,
    apacheKafka,
    ...stubPosts.map((p) => ({
        ...p,
        toc: [],
        content: (
            <>
                <P>
                    This article is part of our publishing pipeline and will be available shortly. In the meantime, explore our other in-depth blogs
                    or jump into the <Strong>tutorials section</Strong> for hands-on, code-first learning.
                </P>
                <Callout kind="info">
                    Want us to prioritise this post? Email <Code>support@alberoacademy.com</Code> with the slug — we publish what learners ask for.
                </Callout>
            </>
        )
    }))
]

export function findPost(slug: string) {
    return allPosts.find((p) => p.slug === slug)
}
export function listPosts() {
    return allPosts
}
