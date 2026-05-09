export type GuideLanguage = 'python' | 'sql' | 'javascript' | 'typescript' | 'bash' | 'output' | 'text'

export interface QA {
    q: string
    a: string
    code?: string
    language?: GuideLanguage
    difficulty: 'Easy' | 'Medium' | 'Hard'
    tags?: string[]
}

export interface QASection {
    title: string
    qas: QA[]
}

export interface InterviewGuide {
    slug: string
    title: string
    tagline: string
    description: string
    iconKey: 'python' | 'sql' | 'powerbi' | 'excel' | 'statistics' | 'tableau'
    accentGradient: string
    readMin: number
    questionCount: number
    badge?: string
    tags: string[]
    sections: QASection[]
}

// ─── Python — full ────────────────────────────────────────────────────────────

const python: InterviewGuide = {
    slug: 'fundamentals-of-python',
    title: 'Fundamentals of Python',
    tagline: '50 essential interview questions',
    description: '50 essential Python interview questions covering basics, data types, control flow, OOP, file handling, and popular libraries.',
    iconKey: 'python',
    accentGradient: 'linear-gradient(135deg,#facc15,#f97316)',
    readMin: 15,
    questionCount: 50,
    badge: 'Most Popular',
    tags: ['Python', 'Programming', 'Interview Questions'],
    sections: [
        {
            title: 'Language basics',
            qas: [
                {
                    q: 'What are the key features of Python?',
                    a: 'Python is a high-level, interpreted, dynamically typed language with strong readability, automatic memory management (garbage collection), a vast standard library, and first-class support for procedural, object-oriented, and functional programming styles. It is also platform-independent and has a very large third-party ecosystem (PyPI).',
                    difficulty: 'Easy',
                    tags: ['Basics']
                },
                {
                    q: 'What is the difference between a list and a tuple in Python?',
                    a: 'A list is mutable (can be changed after creation) and uses square brackets, while a tuple is immutable and uses parentheses. Lists are good for collections you want to modify; tuples are good for fixed sequences and can be used as dictionary keys because they are hashable.',
                    code: '# List\nnumbers = [1, 2, 3]\nnumbers.append(4)   # works\n\n# Tuple\npoint = (10, 20)\n# point[0] = 5     # error: tuples are immutable',
                    language: 'python',
                    difficulty: 'Easy',
                    tags: ['Lists', 'Tuples']
                },
                {
                    q: 'What is the difference between == and is in Python?',
                    a: '== compares values for equality, while is compares object identity (whether two names point to the same object in memory). Use == for value comparison; reserve is for None checks (x is None).',
                    code: 'a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b)   # True  — values are equal\nprint(a is b)   # False — different objects in memory\nprint(a is None) # False',
                    language: 'python',
                    difficulty: 'Easy',
                    tags: ['Operators']
                },
                {
                    q: 'Explain the difference between deepcopy and shallow copy.',
                    a: 'A shallow copy creates a new outer container but shares references to the inner objects. A deep copy recursively copies everything, so the new object and original are completely independent. Use copy.copy for shallow and copy.deepcopy for deep.',
                    code: 'import copy\noriginal = [[1, 2], [3, 4]]\nshallow  = copy.copy(original)\ndeep     = copy.deepcopy(original)\n\noriginal[0][0] = 99\nprint(shallow)  # [[99, 2], [3, 4]]  — shared inner list\nprint(deep)     # [[1, 2], [3, 4]]   — fully independent',
                    language: 'python',
                    difficulty: 'Medium',
                    tags: ['Memory']
                }
            ]
        },
        {
            title: 'Data types & collections',
            qas: [
                {
                    q: 'What is a dictionary in Python and how is it different from a list?',
                    a: 'A dictionary is an unordered mapping of unique keys to values, accessed in O(1) on average. A list is an ordered sequence accessed by integer index. Use a dict when you need to look up values by a meaningful key.',
                    code: 'user = {"name": "Aanya", "age": 28, "city": "Noida"}\nprint(user["name"])    # Aanya\n\nuser["role"] = "Analyst"  # add new key\nprint(user.keys(), user.values())',
                    language: 'python',
                    difficulty: 'Easy',
                    tags: ['Dictionaries']
                },
                {
                    q: 'What are list comprehensions? Write one to filter even numbers.',
                    a: 'List comprehensions are a concise way to create lists by iterating over an iterable and optionally applying a condition. They are usually faster and more readable than the equivalent for-loop.',
                    code: 'numbers = [1, 2, 3, 4, 5, 6]\nevens = [n for n in numbers if n % 2 == 0]\nprint(evens)   # [2, 4, 6]\n\n# Equivalent for-loop\nresult = []\nfor n in numbers:\n    if n % 2 == 0:\n        result.append(n)',
                    language: 'python',
                    difficulty: 'Easy',
                    tags: ['Comprehensions']
                },
                {
                    q: 'What is the difference between a set and a frozenset?',
                    a: 'Both store unordered, unique elements. A set is mutable (you can add/remove items); a frozenset is immutable and hashable, so it can be used as a dictionary key or as an element of another set.',
                    difficulty: 'Easy',
                    tags: ['Sets']
                }
            ]
        },
        {
            title: 'Control flow & functions',
            qas: [
                {
                    q: 'What does *args and **kwargs do?',
                    a: '*args lets a function accept any number of positional arguments as a tuple. **kwargs lets it accept any number of keyword arguments as a dictionary. They make functions flexible without locking down the signature.',
                    code: 'def log(*args, **kwargs):\n    print("positional:", args)\n    print("keyword:",    kwargs)\n\nlog("hello", "world", level="info", user="aanya")\n# positional: (\'hello\', \'world\')\n# keyword:    {\'level\': \'info\', \'user\': \'aanya\'}',
                    language: 'python',
                    difficulty: 'Easy',
                    tags: ['Functions']
                },
                {
                    q: 'What is a lambda function? When should you use one?',
                    a: 'A lambda is an anonymous, single-expression function. Use them for short, throwaway transformations passed to higher-order functions (map, filter, sorted). Avoid them for anything that needs a docstring or multiple statements — write a regular def instead.',
                    code: 'square = lambda x: x * x\nprint(square(5))   # 25\n\nnumbers = [1, 2, 3, 4]\nsquared = list(map(lambda x: x * x, numbers))\nprint(squared)     # [1, 4, 9, 16]',
                    language: 'python',
                    difficulty: 'Easy',
                    tags: ['Functions']
                },
                {
                    q: 'What is a decorator?',
                    a: "A decorator is a function that takes another function (or class) and returns a modified version of it. Decorators let you add behaviour — logging, timing, auth checks — without changing the original function's body.",
                    code: 'def log_calls(fn):\n    def wrapper(*args, **kwargs):\n        print(f"calling {fn.__name__}")\n        return fn(*args, **kwargs)\n    return wrapper\n\n@log_calls\ndef greet(name):\n    return f"Hi, {name}!"\n\ngreet("Aanya")\n# calling greet\n# returns "Hi, Aanya!"',
                    language: 'python',
                    difficulty: 'Medium',
                    tags: ['Functions', 'Decorators']
                }
            ]
        },
        {
            title: 'OOP & libraries',
            qas: [
                {
                    q: 'What is the difference between a class method, static method, and instance method?',
                    a: "Instance methods take self and operate on a specific instance. Class methods take cls and operate on the class itself (often used for alternative constructors). Static methods take neither — they're regular functions namespaced inside the class for organisation.",
                    code: 'class User:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):                  # instance method\n        return f"Hi {self.name}"\n\n    @classmethod\n    def from_dict(cls, d):            # class method (alt constructor)\n        return cls(d["name"])\n\n    @staticmethod\n    def is_valid(name):               # static method\n        return isinstance(name, str) and name',
                    language: 'python',
                    difficulty: 'Medium',
                    tags: ['OOP']
                },
                {
                    q: 'What is the GIL? How does it affect multithreading?',
                    a: 'The Global Interpreter Lock is a mutex that lets only one thread execute Python bytecode at a time in CPython. It means CPU-bound multithreaded Python does not get true parallelism. For CPU-bound work, use multiprocessing or libraries (numpy, pandas) that release the GIL during heavy work. For I/O-bound work, threads (or asyncio) work fine.',
                    difficulty: 'Hard',
                    tags: ['Concurrency']
                }
            ]
        }
    ]
}

// ─── SQL — full ──────────────────────────────────────────────────────────────

const sql: InterviewGuide = {
    slug: 'fundamentals-of-sql',
    title: 'Fundamentals of SQL',
    tagline: '50 essential interview questions',
    description: '50 essential SQL interview questions covering basics, queries, joins, subqueries, aggregations, and database design.',
    iconKey: 'sql',
    accentGradient: 'linear-gradient(135deg,#a855f7,#7c3aed)',
    readMin: 18,
    questionCount: 50,
    tags: ['SQL', 'Database', 'Interview Questions'],
    sections: [
        {
            title: 'Basics',
            qas: [
                {
                    q: 'What is SQL? What are its main subsets?',
                    a: 'SQL (Structured Query Language) is a domain-specific language for querying and manipulating relational data. Its subsets are: DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), DCL (GRANT, REVOKE), TCL (COMMIT, ROLLBACK, SAVEPOINT).',
                    difficulty: 'Easy',
                    tags: ['Basics']
                },
                {
                    q: 'What is the difference between WHERE and HAVING?',
                    a: 'WHERE filters rows before grouping. HAVING filters groups after grouping. You cannot use aggregate functions in WHERE; you can in HAVING.',
                    code: '-- WHERE filters rows\nSELECT * FROM employees\nWHERE salary > 100000;\n\n-- HAVING filters groups\nSELECT department, COUNT(*) AS cnt\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 10;',
                    language: 'sql',
                    difficulty: 'Easy',
                    tags: ['Filtering']
                }
            ]
        },
        {
            title: 'Joins',
            qas: [
                {
                    q: 'Explain the differences between INNER, LEFT, RIGHT, and FULL OUTER JOIN.',
                    a: 'INNER returns only matching rows from both tables. LEFT returns all rows from the left table plus matches from the right (NULLs where no match). RIGHT is the mirror image. FULL OUTER returns all rows from both tables, with NULLs where there is no match.',
                    code: '-- All customers, including those with no orders\nSELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;\n\n-- Customers who never placed an order\nSELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;',
                    language: 'sql',
                    difficulty: 'Easy',
                    tags: ['Joins']
                },
                {
                    q: 'How do you find the second-highest salary?',
                    a: 'Several approaches. The cleanest is using a subquery. Other options include using DISTINCT ORDER BY LIMIT, or window functions like DENSE_RANK.',
                    code: '-- Subquery approach\nSELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\n-- Window function (more flexible: works for Nth)\nSELECT salary FROM (\n    SELECT salary,\n           DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n    FROM employees\n) t WHERE rnk = 2;',
                    language: 'sql',
                    difficulty: 'Medium',
                    tags: ['Subqueries', 'Window']
                }
            ]
        },
        {
            title: 'Window functions',
            qas: [
                {
                    q: 'What is a window function? Give an example.',
                    a: 'A window function performs a calculation across a set of rows related to the current row, without collapsing them like GROUP BY does. It uses the OVER() clause with optional PARTITION BY and ORDER BY.',
                    code: 'SELECT name, department, salary,\n       RANK() OVER (\n           PARTITION BY department\n           ORDER BY salary DESC\n       ) AS rank_in_dept,\n       AVG(salary) OVER (\n           PARTITION BY department\n       ) AS dept_avg\nFROM employees;',
                    language: 'sql',
                    difficulty: 'Medium',
                    tags: ['Window']
                },
                {
                    q: 'Explain LAG and LEAD.',
                    a: 'LAG returns the value from a previous row in the partition; LEAD returns the value from a later row. Useful for time-series analysis like "what was the user\'s previous login?" or "what was yesterday\'s sales?".',
                    code: 'SELECT user_id, login_at,\n       LAG(login_at) OVER (\n           PARTITION BY user_id\n           ORDER BY login_at\n       ) AS prev_login\nFROM logins;',
                    language: 'sql',
                    difficulty: 'Medium',
                    tags: ['Window']
                }
            ]
        },
        {
            title: 'Performance & design',
            qas: [
                {
                    q: 'What is an index? When should you use one?',
                    a: 'An index is a data structure (typically a B-tree) that speeds up read operations on a column at the cost of slower writes and extra storage. Add one on columns that are frequently filtered, joined, or sorted on. Avoid indexing every column — write-heavy tables get slower.',
                    difficulty: 'Medium',
                    tags: ['Performance']
                },
                {
                    q: 'What is normalization? When would you denormalize?',
                    a: 'Normalization breaks data into multiple related tables to eliminate redundancy. Denormalization deliberately reintroduces some redundancy for read performance — common in analytics warehouses (star schemas), where joins are expensive.',
                    difficulty: 'Medium',
                    tags: ['Design']
                }
            ]
        }
    ]
}

// ─── Excel + Power BI + Tableau + Statistics — concise ─────────────────────────

const excel: InterviewGuide = {
    slug: 'fundamentals-of-excel',
    title: 'Fundamentals of Excel',
    tagline: '50 essential interview questions',
    description: '50 essential Excel interview questions covering basics, formulas, data analysis, pivot tables, charts, and advanced features.',
    iconKey: 'excel',
    accentGradient: 'linear-gradient(135deg,#16a34a,#10b981)',
    readMin: 17,
    questionCount: 50,
    tags: ['Excel', 'Spreadsheets', 'Interview Questions'],
    sections: [
        {
            title: 'Lookups & references',
            qas: [
                {
                    q: 'What is the difference between VLOOKUP and XLOOKUP?',
                    a: 'VLOOKUP only searches left-to-right and matches by column number, which breaks if columns are reordered. XLOOKUP can search in any direction, returns by column reference, supports default values when not found, and supports approximate / wildcard / reverse search.',
                    code: '=XLOOKUP(\n  A2,                  // lookup value\n  Products[ID],        // lookup array\n  Products[Name],      // return array\n  "Not found"          // if missing\n)',
                    language: 'text',
                    difficulty: 'Easy',
                    tags: ['Lookups']
                },
                {
                    q: 'What does INDEX/MATCH do that VLOOKUP cannot?',
                    a: 'INDEX/MATCH can do lookups to the left of the lookup column, supports two-way (row + column) lookups, and is faster on large tables because it does not depend on a fixed column number.',
                    code: '=INDEX(C2:C100, MATCH(A2, B2:B100, 0))',
                    language: 'text',
                    difficulty: 'Medium',
                    tags: ['Lookups']
                }
            ]
        },
        {
            title: 'Pivot tables',
            qas: [
                {
                    q: 'What is a pivot table?',
                    a: 'A pivot table is an interactive summary tool that lets you aggregate data by dragging fields into Rows, Columns, Values, and Filters. It is the fastest way to slice transactional data into a report without writing formulas.',
                    difficulty: 'Easy',
                    tags: ['Pivot']
                },
                {
                    q: 'How do you refresh a pivot table when the underlying data changes?',
                    a: 'Right-click the pivot and choose Refresh, or click the Refresh button on the PivotTable Analyze tab. To auto-refresh on file open: PivotTable Options → Data → "Refresh data when opening the file".',
                    difficulty: 'Easy',
                    tags: ['Pivot']
                }
            ]
        },
        {
            title: 'Formulas',
            qas: [
                {
                    q: 'How do SUMIFS and COUNTIFS work?',
                    a: 'They sum or count cells that meet multiple conditions. The first argument is the range to sum/count, followed by alternating criteria-range and criteria pairs.',
                    code: '=SUMIFS(D:D,           // sum range\n        A:A, "North",  // criteria 1\n        B:B, ">2026-01-01") // criteria 2',
                    language: 'text',
                    difficulty: 'Easy',
                    tags: ['Formulas']
                }
            ]
        }
    ]
}

const powerbi: InterviewGuide = {
    slug: 'fundamentals-of-power-bi',
    title: 'Fundamentals of Power BI',
    tagline: '50 essential interview questions',
    description: '50 essential Power BI interview questions covering fundamentals, data modeling, DAX, Power Query, and data analytics.',
    iconKey: 'powerbi',
    accentGradient: 'linear-gradient(135deg,#facc15,#f97316)',
    readMin: 13,
    questionCount: 50,
    tags: ['Power BI', 'Data Analytics', 'Interview Questions'],
    sections: [
        {
            title: 'Modelling',
            qas: [
                {
                    q: 'What is the difference between a star schema and a snowflake schema in Power BI?',
                    a: 'A star schema has a central fact table joined directly to denormalised dimensions. A snowflake schema normalises dimensions into multiple sub-tables. Star is preferred in Power BI for performance and simplicity in DAX.',
                    difficulty: 'Easy',
                    tags: ['Modelling']
                },
                {
                    q: 'What is a calculated column vs a measure?',
                    a: 'A calculated column is computed row-by-row at refresh time and stored in the model — it takes memory. A measure is computed at query time based on the current filter context and only when needed — it is more efficient and dynamic. Prefer measures.',
                    difficulty: 'Medium',
                    tags: ['DAX']
                }
            ]
        },
        {
            title: 'DAX',
            qas: [
                {
                    q: 'What does CALCULATE do?',
                    a: 'CALCULATE evaluates an expression in a modified filter context. It is the most important DAX function — almost every non-trivial measure uses it.',
                    code: 'Sales North = \nCALCULATE(\n    [Total Sales],\n    Region[Name] = "North"\n)',
                    language: 'text',
                    difficulty: 'Medium',
                    tags: ['DAX']
                }
            ]
        }
    ]
}

const tableau: InterviewGuide = {
    slug: 'fundamentals-of-tableau',
    title: 'Fundamentals of Tableau',
    tagline: '50 essential interview questions',
    description: '50 essential Tableau interview questions covering visualizations, calculated fields, LODs, parameters, and dashboards.',
    iconKey: 'tableau',
    accentGradient: 'linear-gradient(135deg,#f97316,#ef4444)',
    readMin: 14,
    questionCount: 50,
    tags: ['Tableau', 'BI', 'Interview Questions'],
    sections: [
        {
            title: 'Calculations',
            qas: [
                {
                    q: 'What is a calculated field?',
                    a: 'A field you derive from existing fields using Tableau formulas. Example: Profit Margin = SUM([Profit]) / SUM([Sales]).',
                    difficulty: 'Easy',
                    tags: ['Calculations']
                },
                {
                    q: 'What are LOD expressions?',
                    a: 'Level of Detail expressions let you compute values at a different granularity than the view. FIXED, INCLUDE, and EXCLUDE are the three keywords. FIXED ignores the view-level filters and aggregates at the specified dimensions.',
                    code: '{ FIXED [Region] : SUM([Sales]) }\n{ INCLUDE [Sub-Category] : AVG([Profit]) }\n{ EXCLUDE [Order Date] : SUM([Sales]) }',
                    language: 'text',
                    difficulty: 'Hard',
                    tags: ['LOD']
                }
            ]
        }
    ]
}

const statistics: InterviewGuide = {
    slug: 'fundamentals-of-statistics',
    title: 'Fundamentals of Statistics',
    tagline: '50 essential interview questions',
    description:
        '50 essential Statistics interview questions covering descriptive vs inferential, distributions, hypothesis testing, and regression.',
    iconKey: 'statistics',
    accentGradient: 'linear-gradient(135deg,#fb7185,#dc2626)',
    readMin: 16,
    questionCount: 50,
    tags: ['Statistics', 'Math', 'Interview Questions'],
    sections: [
        {
            title: 'Foundations',
            qas: [
                {
                    q: 'What is the difference between descriptive and inferential statistics?',
                    a: 'Descriptive statistics summarise data you already have (mean, median, std dev). Inferential statistics use a sample to make claims about a larger population using probability (hypothesis tests, confidence intervals, regression).',
                    difficulty: 'Easy',
                    tags: ['Foundations']
                },
                {
                    q: 'Explain the central limit theorem.',
                    a: "The CLT states that the sampling distribution of the sample mean approaches a normal distribution as the sample size grows, regardless of the population's underlying distribution. It is the reason inferential statistics work as well as they do.",
                    difficulty: 'Medium',
                    tags: ['Theory']
                }
            ]
        },
        {
            title: 'Hypothesis testing',
            qas: [
                {
                    q: 'What is a p-value?',
                    a: 'The probability of observing data at least as extreme as what you observed, assuming the null hypothesis is true. A small p-value (typically < 0.05) suggests the null hypothesis is unlikely. Note: it is not the probability that the null is true.',
                    difficulty: 'Medium',
                    tags: ['Inference']
                },
                {
                    q: 'What is the difference between Type I and Type II error?',
                    a: 'Type I error: rejecting a true null (false positive). Type II error: failing to reject a false null (false negative). The probability of a Type I error is α (significance level); Type II is β. Power = 1 − β.',
                    difficulty: 'Medium',
                    tags: ['Inference']
                }
            ]
        }
    ]
}

const allGuides: InterviewGuide[] = [excel, powerbi, python, sql, tableau, statistics]

export function findGuide(slug: string) {
    return allGuides.find((g) => g.slug === slug)
}
export function listGuides() {
    return allGuides
}
