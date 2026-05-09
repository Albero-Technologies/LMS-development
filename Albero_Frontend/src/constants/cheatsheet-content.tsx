export type CheatLanguage = 'python' | 'sql' | 'javascript' | 'typescript' | 'bash' | 'output' | 'text'

export interface CheatItem {
    label: string
    code?: string
    language?: CheatLanguage
    note?: string
}

export interface CheatGroup {
    title: string
    intro?: string
    items: CheatItem[]
}

export interface CheatSheet {
    slug: string
    title: string
    tagline: string
    description: string
    pages: number
    pdfHref?: string
    accentGradient: string
    iconKey: 'python' | 'sql' | 'powerbi' | 'excel' | 'statistics' | 'tableau' | 'ml' | 'genai'
    tags: string[]
    groups: CheatGroup[]
}

// ─── Python — fully fleshed ──────────────────────────────────────────────────

const python: CheatSheet = {
    slug: 'python',
    title: 'Python Cheat Sheet',
    tagline: 'Syntax · Pandas · One-liners',
    description:
        'Python syntax, list/dict/set operations, comprehensions, f-strings, file I/O and the pandas one-liners you will reach for daily — on a single page.',
    pages: 2,
    accentGradient: 'linear-gradient(135deg,#3b82f6,#facc15)',
    iconKey: 'python',
    tags: ['Python', 'Pandas', 'Quick Ref'],
    groups: [
        {
            title: 'Variables & data types',
            items: [
                {
                    label: 'Common scalars',
                    language: 'python',
                    code: 'x = 42         # int\nrate = 1.18    # float\nname = "Aanya" # str\nflag = True    # bool\nempty = None   # NoneType'
                },
                {
                    label: 'Type conversion',
                    language: 'python',
                    code: 'int("12") + 1     # 13\nfloat("87.5")     # 87.5\nstr(2026)         # "2026"\nbool(0)           # False'
                }
            ]
        },
        {
            title: 'Strings & f-strings',
            items: [
                {
                    label: 'Slicing & methods',
                    language: 'python',
                    code: 's = "Albero Academy"\ns[:6]         # "Albero"\ns.lower()     # "albero academy"\ns.replace("a", "@")\ns.split(" ")  # ["Albero", "Academy"]'
                },
                { label: 'f-string formatting', language: 'python', code: 'price = 199.5\nf"₹{price:,.2f}"   # ₹199.50\nf"{price * 1.18:.0f}" # 235' }
            ]
        },
        {
            title: 'Lists, dicts, sets',
            items: [
                {
                    label: 'List comprehensions',
                    language: 'python',
                    code: '[n * n for n in range(5)]\n# [0, 1, 4, 9, 16]\n\n[w for w in words if len(w) > 3]'
                },
                { label: 'Dict comprehensions', language: 'python', code: '{x: x**2 for x in range(4)}\n# {0: 0, 1: 1, 2: 4, 3: 9}' },
                { label: 'Set ops', language: 'python', code: 'a | b   # union\na & b   # intersection\na - b   # difference' }
            ]
        },
        {
            title: 'Control flow',
            items: [
                {
                    label: 'if / elif / else',
                    language: 'python',
                    code: 'if score >= 90:\n    grade = "A+"\nelif score >= 75:\n    grade = "A"\nelse:\n    grade = "B"'
                },
                {
                    label: 'for + enumerate + zip',
                    language: 'python',
                    code: 'for i, v in enumerate(items):\n    print(i, v)\n\nfor a, b in zip(xs, ys):\n    print(a, b)'
                }
            ]
        },
        {
            title: 'Functions',
            items: [
                {
                    label: 'Defaults & *args / **kwargs',
                    language: 'python',
                    code: 'def gst(amount, rate=0.18):\n    return amount * (1 + rate)\n\ndef log(*args, **kw):\n    print(args, kw)'
                },
                { label: 'Lambda + map / filter', language: 'python', code: 'list(map(lambda x: x * 2, nums))\nlist(filter(lambda x: x > 0, nums))' }
            ]
        },
        {
            title: 'File I/O',
            items: [
                { label: 'Read file', language: 'python', code: 'with open("data.csv") as f:\n    text = f.read()' },
                {
                    label: 'Write JSON',
                    language: 'python',
                    code: 'import json\nwith open("out.json", "w") as f:\n    json.dump(payload, f, indent=2)'
                }
            ]
        },
        {
            title: 'Pandas one-liners',
            items: [
                {
                    label: 'Read & inspect',
                    language: 'python',
                    code: 'import pandas as pd\ndf = pd.read_csv("sales.csv")\ndf.head()\ndf.info()\ndf.describe()'
                },
                { label: 'Filter & group', language: 'python', code: 'df[df["region"] == "North"]\ndf.groupby("region")["revenue"].sum()' },
                {
                    label: 'Apply & transform',
                    language: 'python',
                    code: 'df["margin"] = df["revenue"] - df["cost"]\ndf["bucket"] = df["amount"].apply(\n    lambda x: "high" if x > 1000 else "low"\n)'
                }
            ]
        }
    ]
}

// ─── SQL — fully fleshed ─────────────────────────────────────────────────────

const sql: CheatSheet = {
    slug: 'sql',
    title: 'SQL Cheat Sheet',
    tagline: 'Queries · Joins · Windows',
    description: 'SELECT/WHERE/JOINs, window functions, CTEs, indexes, common patterns and an interview-prep query bank — all on one card.',
    pages: 2,
    accentGradient: 'linear-gradient(135deg,#a855f7,#7c3aed)',
    iconKey: 'sql',
    tags: ['SQL', 'Joins', 'Windows'],
    groups: [
        {
            title: 'SELECT basics',
            items: [
                {
                    label: 'Filtering & sorting',
                    language: 'sql',
                    code: "SELECT name, salary\nFROM employees\nWHERE department = 'Engineering'\nORDER BY salary DESC\nLIMIT 10;"
                },
                {
                    label: 'Aggregates',
                    language: 'sql',
                    code: 'SELECT department,\n       AVG(salary) AS avg_salary,\n       COUNT(*)    AS headcount\nFROM employees\nGROUP BY department\nHAVING COUNT(*) >= 5;'
                }
            ]
        },
        {
            title: 'JOINs',
            items: [
                { label: 'INNER JOIN', language: 'sql', code: 'SELECT o.id, c.name\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.id;' },
                {
                    label: 'LEFT JOIN with NULL filter',
                    language: 'sql',
                    code: 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;  -- customers with no orders'
                }
            ]
        },
        {
            title: 'CTEs',
            items: [
                {
                    label: 'Single CTE',
                    language: 'sql',
                    code: 'WITH top_products AS (\n    SELECT product_id, SUM(quantity) AS qty\n    FROM order_items\n    GROUP BY product_id\n    ORDER BY qty DESC\n    LIMIT 10\n)\nSELECT * FROM top_products;'
                }
            ]
        },
        {
            title: 'Window functions',
            items: [
                {
                    label: 'Running total',
                    language: 'sql',
                    code: 'SELECT order_date,\n       amount,\n       SUM(amount) OVER (\n           ORDER BY order_date\n       ) AS running_total\nFROM orders;'
                },
                {
                    label: 'Rank within group',
                    language: 'sql',
                    code: 'SELECT name, salary,\n       RANK() OVER (\n           PARTITION BY department\n           ORDER BY salary DESC\n       ) AS rk\nFROM employees;'
                },
                {
                    label: 'LEAD / LAG',
                    language: 'sql',
                    code: 'SELECT user_id, login_at,\n       LAG(login_at) OVER (\n           PARTITION BY user_id\n           ORDER BY login_at\n       ) AS prev_login\nFROM logins;'
                }
            ]
        },
        {
            title: 'Indexes & performance',
            items: [
                {
                    label: 'Create / use index',
                    language: 'sql',
                    code: 'CREATE INDEX idx_orders_user\nON orders(user_id);\n\n-- queries that filter on user_id will use it automatically'
                },
                { label: 'EXPLAIN', language: 'sql', code: 'EXPLAIN ANALYZE\nSELECT * FROM orders\nWHERE user_id = 42;' }
            ]
        },
        {
            title: 'Interview classics',
            items: [
                {
                    label: '2nd highest salary',
                    language: 'sql',
                    code: 'SELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);'
                },
                { label: 'Find duplicates', language: 'sql', code: 'SELECT email, COUNT(*) c\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;' }
            ]
        }
    ]
}

// ─── Power BI DAX — full ─────────────────────────────────────────────────────

const dax: CheatSheet = {
    slug: 'powerbi-dax',
    title: 'Power BI DAX Cheat Sheet',
    tagline: 'CALCULATE · time intelligence · iterators',
    description: 'CALCULATE, FILTER, time intelligence, iterators, virtual tables, and the most-used DAX patterns analysts reach for daily.',
    pages: 2,
    accentGradient: 'linear-gradient(135deg,#facc15,#f97316)',
    iconKey: 'powerbi',
    tags: ['Power BI', 'DAX'],
    groups: [
        {
            title: 'Aggregations',
            items: [
                {
                    label: 'Sum / count / distinct',
                    language: 'text',
                    code: 'Total Sales = SUM(Sales[Amount])\nOrders = COUNTROWS(Sales)\nCustomers = DISTINCTCOUNT(Sales[CustomerKey])'
                }
            ]
        },
        {
            title: 'CALCULATE',
            items: [
                { label: 'Filter context', language: 'text', code: 'Sales North =\nCALCULATE(\n    [Total Sales],\n    Region[Name] = "North"\n)' },
                { label: 'Remove filters', language: 'text', code: 'All Sales =\nCALCULATE(\n    [Total Sales],\n    REMOVEFILTERS(Region)\n)' }
            ]
        },
        {
            title: 'Time intelligence',
            items: [
                {
                    label: 'YTD / MTD / QTD',
                    language: 'text',
                    code: 'Sales YTD = TOTALYTD([Total Sales], Date[Date])\nSales MTD = TOTALMTD([Total Sales], Date[Date])\nSales QTD = TOTALQTD([Total Sales], Date[Date])'
                },
                {
                    label: 'YoY %',
                    language: 'text',
                    code: 'Sales LY =\nCALCULATE([Total Sales], SAMEPERIODLASTYEAR(Date[Date]))\n\nYoY % = DIVIDE([Total Sales] - [Sales LY], [Sales LY])'
                }
            ]
        },
        {
            title: 'Iterators',
            items: [
                {
                    label: 'SUMX / AVERAGEX',
                    language: 'text',
                    code: 'Revenue =\nSUMX(Sales, Sales[Quantity] * Sales[Price])\n\nAvg Order Value =\nAVERAGEX(Orders, Orders[Total])'
                }
            ]
        },
        {
            title: 'Variables (always use these)',
            items: [
                {
                    label: 'VAR / RETURN',
                    language: 'text',
                    code: 'Profit Margin =\nVAR Rev = [Total Sales]\nVAR Cost = [Total Cost]\nRETURN\n    DIVIDE(Rev - Cost, Rev)'
                }
            ]
        }
    ]
}

// ─── Excel — full ────────────────────────────────────────────────────────────

const excel: CheatSheet = {
    slug: 'excel',
    title: 'Excel Power User Cheat Sheet',
    tagline: 'XLOOKUP · pivot · 40 shortcuts',
    description: 'XLOOKUP, INDEX/MATCH, dynamic arrays, pivot tables, Power Query, and 40+ shortcuts that save hours every week.',
    pages: 1,
    accentGradient: 'linear-gradient(135deg,#16a34a,#10b981)',
    iconKey: 'excel',
    tags: ['Excel', 'Shortcuts'],
    groups: [
        {
            title: 'Lookups',
            items: [
                {
                    label: 'XLOOKUP (modern)',
                    language: 'text',
                    code: '=XLOOKUP(\n  lookup_value,\n  lookup_array,\n  return_array,\n  "Not found"\n)'
                },
                { label: 'INDEX/MATCH (legacy)', language: 'text', code: '=INDEX(C:C, MATCH(A2, B:B, 0))' }
            ]
        },
        {
            title: 'Logical & aggregation',
            items: [
                { label: 'IFS / SWITCH', language: 'text', code: '=IFS(A2>=90,"A+", A2>=75,"A", A2>=60,"B", TRUE,"C")' },
                { label: 'SUMIFS / COUNTIFS', language: 'text', code: '=SUMIFS(D:D, A:A, "North", B:B, ">2026-01-01")' }
            ]
        },
        {
            title: 'Dynamic arrays',
            items: [
                {
                    label: 'FILTER / UNIQUE / SORT',
                    language: 'text',
                    code: '=FILTER(A2:C100, B2:B100>1000)\n=UNIQUE(D2:D100)\n=SORT(A2:C100, 3, -1)  // sort by col 3 desc'
                }
            ]
        },
        {
            title: 'Top shortcuts',
            items: [
                {
                    label: 'Selection & navigation',
                    language: 'text',
                    code: 'Ctrl + Shift + L     toggle filters\nCtrl + Shift + Arrow extend selection to edge\nCtrl + Home / End    top-left / bottom-right\nF2                   edit cell\nAlt + =              quick AutoSum'
                },
                {
                    label: 'Pivot & format',
                    language: 'text',
                    code: 'Alt + N + V          new pivot table\nCtrl + T             format as table\nCtrl + Shift + $     currency format\nCtrl + Shift + %     percentage format'
                }
            ]
        }
    ]
}

// ─── Statistics — full ───────────────────────────────────────────────────────

const statistics: CheatSheet = {
    slug: 'statistics',
    title: 'Statistics Cheat Sheet',
    tagline: 'Distributions · hypothesis tests · regression',
    description: 'Descriptive vs inferential, distributions, hypothesis testing, p-values, regression — every formula on one card.',
    pages: 2,
    accentGradient: 'linear-gradient(135deg,#fb7185,#dc2626)',
    iconKey: 'statistics',
    tags: ['Statistics', 'Math'],
    groups: [
        {
            title: 'Descriptive stats',
            items: [
                {
                    label: 'Mean / median / mode',
                    language: 'text',
                    code: 'Mean       μ = (Σ xᵢ) / n\nMedian     middle value (sorted)\nMode       most frequent value'
                },
                { label: 'Variance & SD', language: 'text', code: 'Variance   σ² = (Σ (xᵢ - μ)²) / n\nStd dev    σ  = √σ²\nIQR        Q3 - Q1' }
            ]
        },
        {
            title: 'Distributions',
            items: [
                {
                    label: 'Common ones',
                    language: 'text',
                    code: 'Normal       symmetric, bell-shaped, ~68/95/99.7 rule\nUniform      every outcome equally likely\nBinomial     fixed n trials, success / fail\nPoisson      events per fixed interval'
                }
            ]
        },
        {
            title: 'Hypothesis testing',
            items: [
                {
                    label: 'p-values',
                    language: 'text',
                    code: 'H₀  null hypothesis\nH₁  alternative\nα = 0.05 (typical threshold)\np < α  →  reject H₀\np ≥ α  →  fail to reject H₀'
                },
                {
                    label: 'Test selector',
                    language: 'text',
                    code: 'one-sample  →  t-test\ntwo-sample  →  independent t-test\npaired      →  paired t-test\nproportions →  z-test / chi-squared\n>2 groups   →  ANOVA'
                }
            ]
        },
        {
            title: 'Regression',
            items: [
                {
                    label: 'Linear regression',
                    language: 'text',
                    code: 'y = β₀ + β₁ x + ε\n\nR²    proportion of variance explained\nRMSE  √(mean(yᵢ - ŷᵢ)²)\nMAE   mean(|yᵢ - ŷᵢ|)'
                },
                {
                    label: 'Watch outs',
                    language: 'text',
                    code: 'Multicollinearity → VIF > 5\nHeteroscedasticity → residuals plot\nOverfitting → train vs test gap'
                }
            ]
        }
    ]
}

// ─── Tableau, ML, GenAI — full enough ────────────────────────────────────────

const tableau: CheatSheet = {
    slug: 'tableau',
    title: 'Tableau Cheat Sheet',
    tagline: 'Calc fields · LODs · table calcs',
    description: 'Calculated fields, LOD expressions, parameter actions, table calculations, and dashboard layout best practices.',
    pages: 1,
    accentGradient: 'linear-gradient(135deg,#f97316,#ef4444)',
    iconKey: 'tableau',
    tags: ['Tableau', 'BI'],
    groups: [
        {
            title: 'Calculated fields',
            items: [
                { label: 'Profit margin', language: 'text', code: '[Profit Margin] = [Profit] / [Sales]' },
                { label: 'IF / CASE', language: 'text', code: 'IF [Sales] > 1000 THEN "High"\nELSEIF [Sales] > 500 THEN "Mid"\nELSE "Low" END' }
            ]
        },
        {
            title: 'LOD expressions',
            items: [
                {
                    label: 'FIXED / INCLUDE / EXCLUDE',
                    language: 'text',
                    code: '{ FIXED [Region] : SUM([Sales]) }\n{ INCLUDE [Sub-Category] : AVG([Profit]) }\n{ EXCLUDE [Order Date] : SUM([Sales]) }'
                }
            ]
        },
        {
            title: 'Table calculations',
            items: [{ label: 'Running / pct of total', language: 'text', code: 'RUNNING_SUM(SUM([Sales]))\nSUM([Sales]) / TOTAL(SUM([Sales]))' }]
        }
    ]
}

const ml: CheatSheet = {
    slug: 'machine-learning',
    title: 'Machine Learning Cheat Sheet',
    tagline: 'Algorithms · metrics · pipelines',
    description: 'Supervised vs unsupervised, top algorithms, evaluation metrics, hyperparameter tuning, and pipeline visuals.',
    pages: 3,
    accentGradient: 'linear-gradient(135deg,#a855f7,#7c3aed)',
    iconKey: 'ml',
    tags: ['ML', 'Algorithms'],
    groups: [
        {
            title: 'Algorithm selector',
            items: [
                {
                    label: 'By problem type',
                    language: 'text',
                    code: 'Regression   → Linear Reg, Random Forest, XGBoost\nClassification → Logistic Reg, RF, XGBoost, SVM\nClustering   → KMeans, DBSCAN, Hierarchical\nAnomaly      → Isolation Forest, One-class SVM\nNLP          → Transformers (BERT, GPT family)'
                }
            ]
        },
        {
            title: 'Evaluation metrics',
            items: [
                {
                    label: 'Classification',
                    language: 'text',
                    code: 'Accuracy   = (TP + TN) / total\nPrecision  = TP / (TP + FP)\nRecall     = TP / (TP + FN)\nF1         = 2 * P * R / (P + R)\nROC-AUC    classifier vs random'
                },
                { label: 'Regression', language: 'text', code: 'MAE   mean(|y - ŷ|)\nMSE   mean((y - ŷ)²)\nRMSE  √MSE\nR²    1 - SS_res / SS_tot' }
            ]
        },
        {
            title: 'Sklearn pipeline',
            items: [
                {
                    label: 'End-to-end pipeline',
                    language: 'python',
                    code: 'from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\npipe = Pipeline([\n    ("scaler", StandardScaler()),\n    ("clf",    LogisticRegression())\n])\n\npipe.fit(X_train, y_train)\npipe.score(X_test, y_test)'
                }
            ]
        }
    ]
}

const genai: CheatSheet = {
    slug: 'generative-ai-llms',
    title: 'Generative AI & LLMs Cheat Sheet',
    tagline: 'Transformers · RAG · prompting · fine-tuning',
    description: 'Transformers, embeddings, RAG, prompting, fine-tuning vs context — the 2026 must-know reference for AI builders.',
    pages: 2,
    accentGradient: 'linear-gradient(135deg,#a855f7,#7c3aed)',
    iconKey: 'genai',
    tags: ['GenAI', 'LLM'],
    groups: [
        {
            title: 'Core concepts',
            items: [
                {
                    label: 'Glossary',
                    language: 'text',
                    code: 'Token       smallest unit of text the model sees\nEmbedding   vector representation of a token\nContext     all tokens the model attends to\nTransformer self-attention based architecture\nRAG         retrieval-augmented generation'
                }
            ]
        },
        {
            title: 'Prompting patterns',
            items: [
                {
                    label: 'Zero / few / chain-of-thought',
                    language: 'text',
                    code: 'Zero-shot   plain instruction\nFew-shot    instruction + 3-5 examples\nCoT         "let\'s think step by step"\nReAct       reason + act loop with tool calls'
                }
            ]
        },
        {
            title: 'Build a RAG pipeline',
            items: [
                {
                    label: 'High-level flow',
                    language: 'text',
                    code: '1. Chunk the docs (~500 tokens, overlap)\n2. Embed each chunk (OpenAI / Cohere / local)\n3. Store in a vector DB (Pinecone / pgvector / Chroma)\n4. At query: embed → top-k retrieve → stuff into prompt\n5. Send to LLM, return cited answer'
                },
                {
                    label: 'Minimal code',
                    language: 'python',
                    code: 'from openai import OpenAI\nclient = OpenAI()\n\nemb = client.embeddings.create(\n    model="text-embedding-3-small",\n    input=chunks\n).data\n\n# similarity search → top_k → prompt\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[\n        {"role": "system", "content": SYSTEM},\n        {"role": "user", "content": question + "\\n\\n" + context}\n    ]\n)'
                }
            ]
        },
        {
            title: 'Fine-tuning vs context',
            items: [
                {
                    label: 'When to use which',
                    language: 'text',
                    code: 'Use context (RAG) when:\n  - Knowledge changes often\n  - Need cited sources\n  - Small / medium domain\n\nFine-tune when:\n  - Style / format must be consistent\n  - Heavy traffic + cost-sensitive\n  - Need to teach a new task pattern'
                }
            ]
        }
    ]
}

const allSheets: CheatSheet[] = [python, sql, dax, excel, statistics, tableau, ml, genai]

export function findSheet(slug: string) {
    return allSheets.find((s) => s.slug === slug)
}
export function listSheets() {
    return allSheets
}
