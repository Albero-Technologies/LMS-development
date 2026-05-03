import type { ReactNode } from 'react'
import CodeBlock from '@/components/ui/code-block'
import { H2, H3, P, UL, LI, Code, Strong, Callout, Takeaways, Table } from '@/components/user/resources/tutorial-prose'

export interface TutorialChapter {
    slug: string
    topic: string
    topicSlug: string
    chapter: string
    title: string
    description: string
    readMin: number
    tags: string[]
    next?: { slug: string; title: string }
    prev?: { slug: string; title: string }
    toc: { id: string; label: string }[]
    content: ReactNode
}

// ─── PYTHON ─ Chapter 1: Python Fundamentals ──────────────────────────────────

const pythonFundamentals: TutorialChapter = {
    slug: 'python/python-fundamentals',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 1',
    title: 'Python Fundamentals',
    description: 'Learn the basics of Python — installation, variables, data types, input/output, comments, and your first programs.',
    readMin: 11,
    tags: ['Python', 'Basics', 'Variables'],
    next: { slug: 'python/python-operators', title: 'Python Operators' },
    toc: [
        { id: 'why-python', label: 'Why Python in 2026?' },
        { id: 'install', label: 'Installing Python' },
        { id: 'first-program', label: 'Your first program' },
        { id: 'variables', label: 'Variables' },
        { id: 'data-types', label: 'Built-in data types' },
        { id: 'io', label: 'Reading input · printing output' },
        { id: 'comments', label: 'Comments & docstrings' },
        { id: 'practice', label: 'Practice exercises' }
    ],
    content: (
        <>
            <P>
                Python is the most popular programming language for analytics, data science, and AI in 2026 — and it's one of the easiest to read.
                In this chapter we'll set up Python on your machine, walk through variables and data types, and write a few small programs you can
                actually use. Even if you've never coded before, you'll have a working Python setup by the end.
            </P>

            <H2 id="why-python">Why Python in 2026?</H2>
            <P>
                Python's appeal is that it reads almost like English. Compare a sum-of-squares written in Python and in another language:
            </P>
            <CodeBlock
                language="python"
                title="python · readable"
                code={`numbers = [1, 2, 3, 4, 5]
total = sum(n * n for n in numbers)
print(total)  # 55`}
            />
            <P>That's three lines. The same logic in Java is roughly 10. Beyond readability, Python earns its place because:</P>
            <UL>
                <LI>
                    <Strong>Massive ecosystem.</Strong> 400,000+ libraries on PyPI — from <Code>pandas</Code> and <Code>scikit-learn</Code> to
                    <Code>fastapi</Code> and <Code>langchain</Code>.
                </LI>
                <LI>
                    <Strong>Top language for data &amp; AI.</Strong> Most ML papers ship reference code in Python. All major LLM SDKs are
                    Python-first.
                </LI>
                <LI>
                    <Strong>Job market.</Strong> Roughly 35% of analytics &amp; ML roles in India list Python as a primary requirement.
                </LI>
            </UL>

            <H2 id="install">Installing Python</H2>
            <P>
                Albero recommends installing the latest stable release of Python (3.12 or later). On Windows and macOS, the easiest path is the
                official installer at <Code>python.org</Code>. On Linux, your package manager already has it.
            </P>
            <CodeBlock
                language="bash"
                title="terminal"
                showLines={false}
                code={`# macOS (with Homebrew)
brew install python

# Ubuntu / Debian
sudo apt update && sudo apt install -y python3 python3-pip

# Windows
# Download the installer from python.org and tick "Add Python to PATH"`}
            />
            <P>Verify the install:</P>
            <CodeBlock
                language="bash"
                title="terminal"
                showLines={false}
                code={`python --version
# Python 3.12.4

pip --version
# pip 24.0`}
            />
            <Callout kind="tip">
                On Windows, if <Code>python</Code> doesn't work, try <Code>py</Code>. On macOS &amp; Linux you may need <Code>python3</Code> instead
                of <Code>python</Code> — pick whichever your terminal recognises.
            </Callout>

            <H2 id="first-program">Your first program</H2>
            <P>
                Create a new file called <Code>hello.py</Code> in any folder. Open it in VS Code (or any editor) and add a single line:
            </P>
            <CodeBlock
                language="python"
                title="hello.py"
                code={`print("Hello, Albero!")`}
            />
            <P>
                Save the file, then run it from your terminal:
            </P>
            <CodeBlock
                language="bash"
                showLines={false}
                title="terminal"
                code={`python hello.py
# Hello, Albero!`}
            />
            <P>
                That's it — you've shipped a Python program. The <Code>print()</Code> function is built in; you don't need to import anything to
                use it.
            </P>

            <H2 id="variables">Variables</H2>
            <P>
                A variable is a labelled box. You put a value in, and you can refer to that value by the label. Python uses an equals sign to
                assign:
            </P>
            <CodeBlock
                language="python"
                code={`name = "Aanya"
age = 28
salary_lpa = 12.4
is_alumni = True

print(name, age, salary_lpa, is_alumni)
# Aanya 28 12.4 True`}
            />
            <P>Two things to notice:</P>
            <UL>
                <LI>Python is <Strong>dynamically typed</Strong> — you don't write a type. The value's type is inferred when you assign.</LI>
                <LI>The conventional naming style is <Code>snake_case</Code> — lowercase with underscores. Reserve <Code>CamelCase</Code> for class names.</LI>
            </UL>

            <Callout kind="warning">
                Variable names must start with a letter or underscore, and cannot collide with reserved keywords like <Code>class</Code>,{' '}
                <Code>def</Code>, <Code>None</Code>, <Code>True</Code>, <Code>False</Code>. Python will refuse to run if you try.
            </Callout>

            <H2 id="data-types">Built-in data types</H2>
            <P>
                You'll work with a small set of built-in types every day. Here are the five you must know cold:
            </P>
            <CodeBlock
                language="python"
                code={`# int — whole numbers
roll_no = 42

# float — decimal numbers
price = 199.99

# str — text
city = "Noida"

# bool — True / False
is_passing = True

# NoneType — absence of value
referral_code = None

print(type(roll_no), type(price), type(city), type(is_passing), type(referral_code))`}
            />
            <P>The output:</P>
            <CodeBlock
                language="output"
                title="output"
                showLines={false}
                code={`<class 'int'> <class 'float'> <class 'str'> <class 'bool'> <class 'NoneType'>`}
            />
            <H3>Quick conversions</H3>
            <P>You'll often need to switch between types — for example, when reading user input (which always arrives as a string).</P>
            <CodeBlock
                language="python"
                code={`age_text = "28"
age_num = int(age_text)        # str -> int
percent = float("87.5")        # str -> float
label = str(2026)              # int -> str
flag = bool(0)                 # 0 -> False, anything else -> True

print(age_num + 2, percent, label, flag)
# 30 87.5 2026 False`}
            />

            <H2 id="io">Reading input &middot; printing output</H2>
            <P>
                The <Code>input()</Code> function pauses the program and waits for the user to type something. Whatever they type comes back as a
                string.
            </P>
            <CodeBlock
                language="python"
                title="greet.py"
                code={`name = input("What's your name? ")
print(f"Welcome to Albero, {name} 🌱")`}
            />
            <P>
                The <Code>f"..."</Code> syntax is an <Strong>f-string</Strong> — Python's built-in way to plug variables into a string. They're the
                cleanest way to format output, and you'll see them everywhere.
            </P>
            <Callout kind="tip">
                You can do basic math inside an f-string: <Code>{`f"Total: {price * 1.18:.2f}"`}</Code> — that prints <Code>Total: 235.99</Code> with two
                decimals.
            </Callout>

            <H2 id="comments">Comments &amp; docstrings</H2>
            <P>
                Comments are notes for humans. Python ignores them at runtime.
            </P>
            <CodeBlock
                language="python"
                code={`# A single-line comment

"""
A multi-line string used as a comment block.
Often used at the top of a file or function (called a docstring).
"""

def gst(amount, rate=0.18):
    """Return amount inclusive of GST."""
    return amount * (1 + rate)

print(gst(100))  # 118.0`}
            />

            <H2 id="practice">Practice exercises</H2>
            <P>Try these in a fresh file. Solutions are intentionally not included — figure them out, then move to the next chapter.</P>
            <UL>
                <LI>
                    Ask the user for two numbers. Print their sum, difference, product, and quotient using f-strings.
                </LI>
                <LI>
                    Read a temperature in Celsius and print it in Fahrenheit. Round to 2 decimals.
                </LI>
                <LI>
                    Build a "tip calculator" — ask for the bill amount and tip percent, print the total.
                </LI>
                <LI>
                    Bonus: print a friendly error message if the user types something that can't be converted to a number.
                </LI>
            </UL>

            <Takeaways
                items={[
                    'Python reads like English — it\'s the most popular language for analytics, ML and AI in 2026.',
                    'Variables are dynamically typed — assign with =, name them in snake_case.',
                    'The five built-in types you\'ll use daily are int, float, str, bool, and NoneType.',
                    'Use input() to read text from the user and f-strings to format output cleanly.',
                    'Comments and docstrings live for the future reader — write them generously.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 2 (stub) ────────────────────────────────────────────────

const pythonOperators: TutorialChapter = {
    slug: 'python/python-operators',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 2',
    title: 'Python Operators',
    description: 'Master arithmetic, comparison, logical, assignment, bitwise, membership, and identity operators with practical examples.',
    readMin: 14,
    tags: ['Python', 'Operators', 'Arithmetic'],
    prev: { slug: 'python/python-fundamentals', title: 'Python Fundamentals' },
    next: { slug: 'python/python-data-types', title: 'Python Data Types' },
    toc: [
        { id: 'arithmetic', label: 'Arithmetic operators' },
        { id: 'comparison', label: 'Comparison operators' },
        { id: 'logical', label: 'Logical operators' },
        { id: 'assignment', label: 'Assignment operators' },
        { id: 'membership', label: 'Membership & identity' }
    ],
    content: (
        <>
            <P>Operators are how you do real work in Python — adding numbers, comparing values, building decisions. This chapter covers the seven categories every Python developer uses every day.</P>

            <H2 id="arithmetic">Arithmetic operators</H2>
            <P>The seven arithmetic operators in Python:</P>
            <CodeBlock
                language="python"
                code={`a = 17
b = 5

print(a + b)   # 22  addition
print(a - b)   # 12  subtraction
print(a * b)   # 85  multiplication
print(a / b)   # 3.4 float division
print(a // b)  # 3   integer division (floor)
print(a % b)   # 2   modulus (remainder)
print(a ** b)  # 1419857  exponentiation`}
            />
            <Callout kind="tip">
                The <Code>//</Code> operator returns a whole number — it's perfect for "how many full pages?" or "how many full hours fit?" calculations.
            </Callout>

            <H2 id="comparison">Comparison operators</H2>
            <P>Comparisons always return a <Code>bool</Code> — either <Code>True</Code> or <Code>False</Code>.</P>
            <CodeBlock
                language="python"
                code={`x, y = 10, 20

print(x == y)  # False  equal
print(x != y)  # True   not equal
print(x <  y)  # True
print(x >  y)  # False
print(x <= 10) # True
print(y >= 25) # False`}
            />

            <H2 id="logical">Logical operators</H2>
            <P>Combine conditions with <Code>and</Code>, <Code>or</Code>, <Code>not</Code>:</P>
            <CodeBlock
                language="python"
                code={`age = 22
has_id = True

# you can enter if you're 18+ AND have ID
if age >= 18 and has_id:
    print("Welcome in.")

# you skip the queue if you have a member card OR a VIP pass
member = False
vip = True
if member or vip:
    print("Skip the queue.")

# inversion
print(not member)  # True`}
            />

            <H2 id="assignment">Assignment operators</H2>
            <P>Shorthand for "operate then reassign". Two patterns you'll use the most:</P>
            <CodeBlock
                language="python"
                code={`total = 0
total += 50    # equivalent to total = total + 50
total += 30
total -= 10
total *= 2
print(total)   # 140`}
            />

            <H2 id="membership">Membership &amp; identity</H2>
            <P>Two pairs that confuse beginners but are actually simple:</P>
            <CodeBlock
                language="python"
                code={`fruits = ["apple", "mango", "banana"]

# membership: is value in collection?
print("mango" in fruits)      # True
print("kiwi" not in fruits)   # True

# identity: do two names point at the SAME object?
a = [1, 2, 3]
b = a
c = [1, 2, 3]
print(a is b)   # True  — same list in memory
print(a is c)   # False — different lists with equal contents
print(a == c)   # True  — values are equal`}
            />

            <Callout kind="warning">
                Use <Code>==</Code> for value comparison and <Code>is</Code> for identity checks (mostly only <Code>x is None</Code> in real code).
                Mixing them up is one of the most common Python bugs.
            </Callout>

            <Takeaways
                items={[
                    'Arithmetic: +, -, *, /, //, %, ** — note that / is float division, // is integer division.',
                    'Comparison operators always return True or False.',
                    'Use and / or / not to combine conditions; Python short-circuits left-to-right.',
                    'Compound assignment (+=, -=, *=, /=) keeps your code readable.',
                    'Use == for "values equal", is for "same object in memory" (commonly is None).'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 3: Data Types ───────────────────────────────────────────

const pythonDataTypes: TutorialChapter = {
    slug: 'python/python-data-types',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 3',
    title: 'Python Data Types',
    description: "Deep dive into Python's data types — integers, floats, strings, booleans, None, type conversion, and how they work in memory.",
    readMin: 18,
    tags: ['Python', 'Data Types'],
    prev: { slug: 'python/python-operators', title: 'Python Operators' },
    next: { slug: 'python/python-lists', title: 'Python Lists' },
    toc: [
        { id: 'overview', label: 'The full type tree' },
        { id: 'numbers', label: 'Numbers — int, float, complex' },
        { id: 'strings', label: 'Strings (str)' },
        { id: 'booleans', label: 'Booleans (bool)' },
        { id: 'none', label: 'NoneType' },
        { id: 'type-checking', label: 'Type checking & isinstance' },
        { id: 'conversion', label: 'Type conversion in depth' },
        { id: 'mutable', label: 'Mutable vs immutable' }
    ],
    content: (
        <>
            <P>
                Every value in Python has a type. Understanding the built-in types — and their mutability — is the difference between code that
                works in toy examples and code that works in production.
            </P>

            <H2 id="overview">The full type tree</H2>
            <Table
                headers={['Category', 'Types']}
                rows={[
                    ['Numeric', 'int, float, complex'],
                    ['Text', 'str'],
                    ['Sequence', 'list, tuple, range'],
                    ['Mapping', 'dict'],
                    ['Set', 'set, frozenset'],
                    ['Boolean', 'bool'],
                    ['Binary', 'bytes, bytearray'],
                    ['None', 'NoneType']
                ]}
            />

            <H2 id="numbers">Numbers — int, float, complex</H2>
            <P>
                Python has three numeric types. <Code>int</Code> for whole numbers (unlimited precision), <Code>float</Code> for 64-bit decimals,
                and <Code>complex</Code> for complex numbers (rarely used outside scientific code).
            </P>
            <CodeBlock
                language="python"
                code={`a = 10              # int
b = 3.14            # float
c = 2 + 3j          # complex (the j is the imaginary unit)

print(type(a), type(b), type(c))
# <class 'int'> <class 'float'> <class 'complex'>

# int has unlimited precision
huge = 2 ** 1000
print(len(str(huge)))   # 302 digits — no overflow`}
            />
            <Callout kind="warning">
                Floats follow IEEE 754 — meaning <Code>0.1 + 0.2</Code> is <Code>0.30000000000000004</Code>, not <Code>0.3</Code>. For money,{' '}
                use the <Code>decimal</Code> module:
            </Callout>
            <CodeBlock
                language="python"
                code={`from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 0.3 — exact`}
            />

            <H2 id="strings">Strings (str)</H2>
            <CodeBlock
                language="python"
                code={`single = 'hello'
double = "hello"
triple = """spans
multiple lines"""
raw = r"C:\\Users\\Aanya"   # backslashes are literal

print(len(single))      # 5
print(double[0])        # 'h'
print(double[-1])       # 'o' — negative indexing from the end
print(double[1:4])      # 'ell' — slicing`}
            />
            <P>Common string methods:</P>
            <CodeBlock
                language="python"
                code={`s = "Albero Academy"
print(s.lower())            # albero academy
print(s.upper())            # ALBERO ACADEMY
print(s.replace("a", "@"))  # Albero @c@demy
print(s.startswith("Alb"))  # True
print(s.split(" "))         # ['Albero', 'Academy']
print("-".join(s.split()))  # Albero-Academy`}
            />

            <H2 id="booleans">Booleans (bool)</H2>
            <P>
                <Code>bool</Code> is technically a subclass of <Code>int</Code> — <Code>True</Code> equals 1 and <Code>False</Code> equals 0. This
                lets you do tricks like sum a list of booleans:
            </P>
            <CodeBlock
                language="python"
                code={`results = [True, False, True, True, False]
print(sum(results))     # 3 — counts the Trues

# Truthiness — what counts as False
print(bool(0))          # False
print(bool(""))         # False — empty string
print(bool([]))         # False — empty list
print(bool(None))       # False
print(bool("False"))    # True  — non-empty string is truthy`}
            />

            <H2 id="none">NoneType</H2>
            <P>
                <Code>None</Code> is Python's "nothing" value. It's the default return of any function that doesn't explicitly return.
            </P>
            <CodeBlock
                language="python"
                code={`def first_greater_than(numbers, threshold):
    for n in numbers:
        if n > threshold:
            return n
    return None    # explicit "not found"

result = first_greater_than([1, 2, 3], 100)
if result is None:
    print("nothing matched")`}
            />
            <Callout kind="tip">
                Always check for <Code>None</Code> with <Code>is None</Code>, not <Code>== None</Code>. <Code>is</Code> compares object identity
                and is the standard idiom — pylint will flag the alternative.
            </Callout>

            <H2 id="type-checking">Type checking &amp; isinstance</H2>
            <CodeBlock
                language="python"
                code={`x = 42

# type() returns the exact class
print(type(x))                  # <class 'int'>
print(type(x) is int)           # True

# isinstance() respects subclassing — preferred
print(isinstance(x, int))       # True
print(isinstance(True, int))    # True — bool is a subclass of int!

# Check multiple types
print(isinstance(x, (int, float)))  # True`}
            />

            <H2 id="conversion">Type conversion in depth</H2>
            <Table
                headers={['Function', 'Converts to', 'Example']}
                rows={[
                    ['int(x)', 'integer', 'int("42") → 42'],
                    ['float(x)', 'float', 'float("3.14") → 3.14'],
                    ['str(x)', 'string', 'str(42) → "42"'],
                    ['bool(x)', 'boolean', 'bool(0) → False'],
                    ['list(x)', 'list', 'list("abc") → ["a","b","c"]'],
                    ['tuple(x)', 'tuple', 'tuple([1,2,3]) → (1,2,3)'],
                    ['set(x)', 'set', 'set("abca") → {"a","b","c"}']
                ]}
            />
            <CodeBlock
                language="python"
                code={`# Common pitfalls
int("3.14")    # ValueError — int() can't parse decimals from strings
int(3.14)      # 3 — but it can truncate from a float

# Safe parsing
def to_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

print(to_int("42"))      # 42
print(to_int("oops"))    # 0`}
            />

            <H2 id="mutable">Mutable vs immutable</H2>
            <P>This is the most important distinction in Python and trips up most beginners:</P>
            <Table
                headers={['Mutable', 'Immutable']}
                rows={[
                    ['list', 'int, float, complex'],
                    ['dict', 'str'],
                    ['set', 'tuple'],
                    ['bytearray', 'frozenset, bytes'],
                    ['(custom classes)', 'NoneType, bool']
                ]}
            />
            <CodeBlock
                language="python"
                code={`# Immutable: every "change" creates a new object
s = "hello"
s += " world"   # creates a new string, rebinds s
print(s)        # hello world

# Mutable: same object, modified in place
nums = [1, 2, 3]
nums.append(4)  # modifies the list in place
print(nums)     # [1, 2, 3, 4]

# This causes the most-common Python bug: shared mutable defaults
def add_item(item, basket=[]):       # ⚠️  default is shared!
    basket.append(item)
    return basket

print(add_item("apple"))   # ['apple']
print(add_item("banana"))  # ['apple', 'banana']  ← surprising!`}
            />
            <Callout kind="warning">
                Never use a mutable default argument. Use <Code>None</Code> as the sentinel and create a fresh list inside the function.
            </Callout>
            <CodeBlock
                language="python"
                code={`def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket`}
            />

            <Takeaways
                items={[
                    'Python has three numeric types: int (unlimited precision), float (IEEE 754), complex.',
                    'For money, use Decimal — never float — to avoid 0.1 + 0.2 ≠ 0.3 issues.',
                    'Strings are immutable; every operation returns a new string.',
                    'bool is a subclass of int — True == 1, False == 0. You can sum booleans.',
                    'Use isinstance() not type() == — it respects inheritance.',
                    'Memorise mutable vs immutable — and never use a mutable default argument.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 4: Lists ────────────────────────────────────────────────

const pythonLists: TutorialChapter = {
    slug: 'python/python-lists',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 4',
    title: 'Python Lists',
    description: 'Master Python lists — creation, indexing, slicing, methods, iteration, comprehensions, nested lists, and common patterns.',
    readMin: 22,
    tags: ['Python', 'Lists', 'Comprehensions'],
    prev: { slug: 'python/python-data-types', title: 'Python Data Types' },
    next: { slug: 'python/python-strings', title: 'Python Strings' },
    toc: [
        { id: 'create', label: 'Creating lists' },
        { id: 'index', label: 'Indexing & slicing' },
        { id: 'methods', label: 'List methods' },
        { id: 'iterate', label: 'Iterating over lists' },
        { id: 'comprehensions', label: 'List comprehensions' },
        { id: 'nested', label: 'Nested lists' },
        { id: 'sorting', label: 'Sorting & reversing' },
        { id: 'gotchas', label: 'Common gotchas' }
    ],
    content: (
        <>
            <P>
                Lists are Python's workhorse collection — ordered, mutable, can hold anything. They're also the gateway to one of Python's best
                features: list comprehensions.
            </P>

            <H2 id="create">Creating lists</H2>
            <CodeBlock
                language="python"
                code={`# Literal
fruits = ["apple", "mango", "banana"]

# Empty list — two equivalent ways
empty = []
empty2 = list()

# From an iterable
chars = list("hello")          # ['h', 'e', 'l', 'l', 'o']
nums = list(range(5))          # [0, 1, 2, 3, 4]

# Mixed types — Python doesn't care
mixed = [1, "two", 3.0, True, None]`}
            />

            <H2 id="index">Indexing &amp; slicing</H2>
            <CodeBlock
                language="python"
                code={`fruits = ["apple", "mango", "banana", "kiwi", "guava"]

print(fruits[0])     # apple        — first
print(fruits[-1])    # guava        — last
print(fruits[2])     # banana       — third

# Slicing: [start:stop:step]   stop is exclusive
print(fruits[1:3])   # ['mango', 'banana']
print(fruits[:2])    # ['apple', 'mango']
print(fruits[2:])    # ['banana', 'kiwi', 'guava']
print(fruits[::-1])  # reversed copy
print(fruits[::2])   # every other element`}
            />
            <Callout kind="tip">
                Slicing always returns a <Strong>new list</Strong>. <Code>copy = lst[:]</Code> is a quick way to copy a list.
            </Callout>

            <H2 id="methods">List methods</H2>
            <Table
                headers={['Method', 'Effect']}
                rows={[
                    ['append(x)', 'add x to the end'],
                    ['insert(i, x)', 'insert x at index i'],
                    ['extend(iterable)', 'add all items from iterable'],
                    ['remove(x)', 'remove first occurrence of x'],
                    ['pop(i=-1)', 'remove and return item at i (last by default)'],
                    ['index(x)', 'return index of first x (raises if missing)'],
                    ['count(x)', 'count occurrences of x'],
                    ['sort()', 'sort in place'],
                    ['reverse()', 'reverse in place'],
                    ['clear()', 'empty the list']
                ]}
            />
            <CodeBlock
                language="python"
                code={`scores = [70, 85, 90]

scores.append(75)         # [70, 85, 90, 75]
scores.insert(0, 100)     # [100, 70, 85, 90, 75]
scores.extend([60, 95])   # [100, 70, 85, 90, 75, 60, 95]
scores.remove(70)         # [100, 85, 90, 75, 60, 95]

last = scores.pop()       # 95   scores: [100, 85, 90, 75, 60]
first = scores.pop(0)     # 100  scores: [85, 90, 75, 60]

print(scores.count(85))   # 1
print(scores.index(75))   # 2`}
            />

            <H2 id="iterate">Iterating over lists</H2>
            <CodeBlock
                language="python"
                code={`fruits = ["apple", "mango", "banana"]

# Plain
for f in fruits:
    print(f)

# With index
for i, f in enumerate(fruits):
    print(i, f)

# Two lists in lockstep
prices = [120, 80, 50]
for f, p in zip(fruits, prices):
    print(f"{f}: ₹{p}")`}
            />

            <H2 id="comprehensions">List comprehensions</H2>
            <P>The single most-loved Python feature. Create a list by transforming/filtering an iterable in one expression:</P>
            <CodeBlock
                language="python"
                code={`# Squares of numbers 0-9
squares = [n * n for n in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Even numbers only
evens = [n for n in range(10) if n % 2 == 0]
# [0, 2, 4, 6, 8]

# Apply a transform with filter
prices_inr = [80, 120, 250, 400]
discounted = [p * 0.9 for p in prices_inr if p > 100]
# [108.0, 225.0, 360.0]

# Strings — uppercase only the long fruit names
fruits = ["apple", "kiwi", "banana", "fig"]
loud = [f.upper() for f in fruits if len(f) > 4]
# ['APPLE', 'BANANA']`}
            />
            <Callout kind="info">
                A comprehension is roughly 25% faster than the equivalent <Code>for</Code>-loop with <Code>append()</Code> in CPython, and reads
                better.
            </Callout>

            <H2 id="nested">Nested lists</H2>
            <CodeBlock
                language="python"
                code={`# A 3x3 matrix
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Access row 1, column 2
print(matrix[1][2])   # 6

# Iterate
for row in matrix:
    for val in row:
        print(val, end=" ")
    print()

# Build with nested comprehension
identity = [[1 if i == j else 0 for j in range(4)] for i in range(4)]`}
            />

            <H2 id="sorting">Sorting &amp; reversing</H2>
            <CodeBlock
                language="python"
                code={`nums = [3, 1, 4, 1, 5, 9, 2, 6]

# In place
nums.sort()             # [1, 1, 2, 3, 4, 5, 6, 9]
nums.sort(reverse=True) # [9, 6, 5, 4, 3, 2, 1, 1]

# Returns a new list — original untouched
sorted_copy = sorted(nums)

# Sort with a key
fruits = ["apple", "fig", "banana"]
fruits.sort(key=len)    # by length: ['fig', 'apple', 'banana']

# Sort dicts by a field
people = [{"name": "A", "age": 30}, {"name": "B", "age": 22}]
people.sort(key=lambda p: p["age"])`}
            />

            <H2 id="gotchas">Common gotchas</H2>
            <H3>1. Multiplying lists copies references</H3>
            <CodeBlock
                language="python"
                code={`# This looks like 3 separate rows, but…
grid = [[0] * 3] * 3
grid[0][0] = 1
print(grid)
# [[1, 0, 0], [1, 0, 0], [1, 0, 0]]   ← all rows share the same list!

# Correct — build with a comprehension
grid = [[0] * 3 for _ in range(3)]
grid[0][0] = 1
print(grid)
# [[1, 0, 0], [0, 0, 0], [0, 0, 0]]   ← independent rows`}
            />
            <H3>2. Modifying a list while iterating</H3>
            <CodeBlock
                language="python"
                code={`# ⚠️  Don't do this
nums = [1, 2, 3, 4]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)   # [1, 3] — but unreliable; some elements get skipped

# ✅  Build a new list
nums = [n for n in nums if n % 2 != 0]`}
            />

            <Takeaways
                items={[
                    'Lists are ordered, mutable, can hold anything. Use square brackets or list().',
                    'Slicing returns a new list — [::-1] is the canonical "reverse a list" idiom.',
                    'Methods like append, insert, extend modify in place; sorted() and slicing return copies.',
                    'List comprehensions are the standard tool — faster, more readable than manual loops.',
                    'Never multiply a list of lists — use [[0]*N for _ in range(M)] for nested grids.',
                    "Don't mutate a list while iterating it — build a new list instead."
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 5: Strings ──────────────────────────────────────────────

const pythonStrings: TutorialChapter = {
    slug: 'python/python-strings',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 5',
    title: 'Python Strings',
    description: 'Complete guide to Python strings — creation, indexing, slicing, methods, formatting, regex basics and real-world use cases.',
    readMin: 20,
    tags: ['Python', 'Strings', 'Text'],
    prev: { slug: 'python/python-lists', title: 'Python Lists' },
    next: { slug: 'python/tuples-and-sets', title: 'Tuples & Sets' },
    toc: [
        { id: 'create', label: 'Creating strings' },
        { id: 'index', label: 'Indexing & slicing' },
        { id: 'methods', label: 'Essential methods' },
        { id: 'fstrings', label: 'f-strings & formatting' },
        { id: 'split-join', label: 'split, join, replace' },
        { id: 'regex', label: 'Regex basics' },
        { id: 'encoding', label: 'Encoding & bytes' }
    ],
    content: (
        <>
            <P>
                Strings show up in every program — file names, user input, API responses. Python's <Code>str</Code> is unicode-aware by default,
                immutable, and rich in built-in methods.
            </P>

            <H2 id="create">Creating strings</H2>
            <CodeBlock
                language="python"
                code={`# Three quote styles
single = 'hello'
double = "hello"
multi  = """spans
multiple
lines"""

# Raw strings — backslashes are literal (great for paths and regex)
path = r"C:\\Users\\Aanya\\Desktop"
pattern = r"\\d{3}-\\d{4}"

# Concatenation
greet = "Hello, " + "Aanya"
greet = "Hi " * 3        # 'Hi Hi Hi '

# Length
print(len("Albero"))     # 6`}
            />

            <H2 id="index">Indexing &amp; slicing</H2>
            <CodeBlock
                language="python"
                code={`s = "Albero Academy"

print(s[0])      # 'A'
print(s[-1])     # 'y'
print(s[:6])     # 'Albero'
print(s[7:])     # 'Academy'
print(s[::-1])   # 'ymedacA orebla' — reversed`}
            />
            <Callout kind="info">
                Strings are <Strong>immutable</Strong>. <Code>s[0] = "X"</Code> raises a TypeError. Every "edit" returns a new string.
            </Callout>

            <H2 id="methods">Essential methods</H2>
            <Table
                headers={['Method', 'Returns']}
                rows={[
                    ['s.lower() / s.upper()', 'all lowercase / uppercase'],
                    ['s.strip()', 'remove leading & trailing whitespace'],
                    ['s.lstrip() / s.rstrip()', 'remove from left / right only'],
                    ['s.startswith(x) / s.endswith(x)', 'bool'],
                    ['s.find(x)', 'index of first x, or -1 if not found'],
                    ['s.replace(a, b)', 'new string with a replaced by b'],
                    ['s.split(sep)', 'list of substrings'],
                    ['sep.join(iterable)', 'concatenate with sep between'],
                    ['s.isdigit() / s.isalpha()', 'bool'],
                    ['s.title() / s.capitalize()', 'title-cased / first-letter-cap']
                ]}
            />
            <CodeBlock
                language="python"
                code={`s = "  Albero Academy  "

print(s.strip())              # 'Albero Academy'
print(s.lower())              # '  albero academy  '
print(s.replace("Albero", "Albero 🌱"))
print(s.startswith("  Alb"))  # True
print("123".isdigit())        # True
print("abc".isalpha())        # True`}
            />

            <H2 id="fstrings">f-strings &amp; formatting</H2>
            <P>F-strings are the standard way to format. They support inline math, format specifiers, and any Python expression.</P>
            <CodeBlock
                language="python"
                code={`name = "Aanya"
salary = 1240000

print(f"Hi {name}, your CTC is ₹{salary:,}.")
# Hi Aanya, your CTC is ₹12,40,000.

# Format specifiers
pi = 3.14159
print(f"{pi:.2f}")           # 3.14    — 2 decimals
print(f"{pi:10.2f}")         # '      3.14'  — width 10
print(f"{42:>10}")           # right-align in 10
print(f"{42:<10}")           # left-align
print(f"{42:^10}")           # centred
print(f"{0.875:.0%}")        # 88%      — percentage`}
            />

            <H2 id="split-join">split · join · replace</H2>
            <CodeBlock
                language="python"
                code={`# split breaks a string into a list
csv = "Aanya,28,Noida,Analyst"
fields = csv.split(",")
# ['Aanya', '28', 'Noida', 'Analyst']

# join is the inverse
parts = ["data", "warehousing", "101"]
slug = "-".join(parts)
# 'data-warehousing-101'

# replace returns a new string
text = "I love coffee. Coffee is life."
print(text.replace("coffee", "tea"))
# 'I love tea. Coffee is life.'   — case-sensitive!`}
            />

            <H2 id="regex">Regex basics</H2>
            <CodeBlock
                language="python"
                code={`import re

text = "Contact: aanya@albero.com, phone: 9810012345"

# Find all email addresses
emails = re.findall(r"[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}", text)
# ['aanya@albero.com']

# Find all 10-digit phone numbers
phones = re.findall(r"\\b\\d{10}\\b", text)
# ['9810012345']

# Substitution
masked = re.sub(r"\\b\\d{10}\\b", "XXXX-XXXXXX", text)`}
            />
            <Callout kind="tip">
                Always use <Code>r"..."</Code> raw strings for regex patterns — Python's <Code>\\</Code> escape rules and regex's overlap.
            </Callout>

            <H2 id="encoding">Encoding &amp; bytes</H2>
            <CodeBlock
                language="python"
                code={`s = "Albero 🌱"
b = s.encode("utf-8")
print(b)
# b'Albero \\xf0\\x9f\\x8c\\xb1'

print(b.decode("utf-8"))
# Albero 🌱

# When reading files
with open("data.csv", "rb") as f:
    raw_bytes = f.read()
text = raw_bytes.decode("utf-8")`}
            />

            <Takeaways
                items={[
                    'Strings are immutable; every operation returns a new string.',
                    'Slicing works exactly like lists; [::-1] reverses.',
                    'f-strings are the standard for formatting — they support format specs and any expression.',
                    'split / join / replace handle 80% of text wrangling without regex.',
                    'Reach for re for anything pattern-based — emails, phone numbers, dates.',
                    "Python 3 strings are unicode; encode/decode at I/O boundaries with utf-8."
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 6: Tuples & Sets ────────────────────────────────────────

const pythonTuplesAndSets: TutorialChapter = {
    slug: 'python/tuples-and-sets',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 6',
    title: 'Tuples & Sets',
    description: 'Understand immutable tuples and unique-element sets — creation, operations, methods, use cases, and when to use which.',
    readMin: 16,
    tags: ['Python', 'Tuples', 'Sets'],
    prev: { slug: 'python/python-strings', title: 'Python Strings' },
    toc: [
        { id: 'tuple-create', label: 'Creating tuples' },
        { id: 'tuple-when', label: 'When to use a tuple' },
        { id: 'tuple-unpack', label: 'Tuple unpacking' },
        { id: 'set-create', label: 'Creating sets' },
        { id: 'set-ops', label: 'Set operations' },
        { id: 'frozen', label: 'frozenset' }
    ],
    content: (
        <>
            <P>
                Tuples and sets round out the four built-in collection types (list, tuple, set, dict). Tuples are immutable sequences — like
                read-only lists. Sets are unordered collections of unique elements.
            </P>

            <H2 id="tuple-create">Creating tuples</H2>
            <CodeBlock
                language="python"
                code={`# Parentheses — most common
point = (10, 20)
rgb   = (255, 100, 50)

# Parens are optional but recommended
point2 = 10, 20

# Single-element tuple — comma is REQUIRED
single  = (42,)        # tuple
not_a_tuple = (42)     # just an int in parens

# Empty tuple
empty = ()

# From an iterable
chars = tuple("hello")   # ('h', 'e', 'l', 'l', 'o')`}
            />

            <H2 id="tuple-when">When to use a tuple instead of a list</H2>
            <UL>
                <LI>The collection should not change — coordinates, RGB triples, database rows.</LI>
                <LI>You need it to be hashable — tuples can be dictionary keys; lists cannot.</LI>
                <LI>You're returning multiple values from a function — Python returns a tuple by default.</LI>
                <LI>You want a small performance edge — tuples are slightly faster to create and iterate.</LI>
            </UL>
            <CodeBlock
                language="python"
                code={`def location():
    return 28.6139, 77.2090   # returns a tuple

lat, lon = location()
print(lat, lon)

# Tuple as dict key — common for caching grids
distances = {}
distances[(0, 0)] = 0
distances[(1, 0)] = 1.0`}
            />
            <Callout kind="info">
                Tuples have only two methods: <Code>count</Code> and <Code>index</Code>. That's not a limitation — that's the point.
            </Callout>

            <H2 id="tuple-unpack">Tuple unpacking</H2>
            <CodeBlock
                language="python"
                code={`# Basic unpack
x, y = (10, 20)
print(x, y)   # 10 20

# Swap variables — no temp var needed
a, b = 1, 2
a, b = b, a
print(a, b)   # 2 1

# Star unpacking — collect "the rest"
first, *middle, last = [1, 2, 3, 4, 5]
print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5

# In iteration with enumerate
for i, fruit in enumerate(["apple", "mango", "kiwi"]):
    print(f"{i}: {fruit}")`}
            />

            <H2 id="set-create">Creating sets</H2>
            <P>Sets store unique elements with no defined order. Membership tests are O(1).</P>
            <CodeBlock
                language="python"
                code={`# Curly braces — most common
fruits = {"apple", "mango", "banana"}

# From an iterable — duplicates are removed
unique = set([1, 2, 2, 3, 3, 3, 4])
# {1, 2, 3, 4}

# ⚠️  Empty set — must use set(), NOT {}
empty = set()    # {} would create an empty DICT

# Adding & removing
fruits.add("kiwi")
fruits.discard("apple")    # no error if missing
fruits.remove("mango")     # KeyError if missing

# Membership — fast even for huge sets
print("apple" in fruits)`}
            />

            <H2 id="set-ops">Set operations</H2>
            <Table
                headers={['Operation', 'Operator', 'Method']}
                rows={[
                    ['Union (a ∪ b)', 'a | b', 'a.union(b)'],
                    ['Intersection (a ∩ b)', 'a & b', 'a.intersection(b)'],
                    ['Difference (a - b)', 'a - b', 'a.difference(b)'],
                    ['Symmetric diff', 'a ^ b', 'a.symmetric_difference(b)'],
                    ['Subset', 'a <= b', 'a.issubset(b)'],
                    ['Superset', 'a >= b', 'a.issuperset(b)']
                ]}
            />
            <CodeBlock
                language="python"
                code={`a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)  # {1, 2, 3, 4, 5, 6}    union
print(a & b)  # {3, 4}                intersection
print(a - b)  # {1, 2}                in a but not b
print(a ^ b)  # {1, 2, 5, 6}          xor / symmetric diff

# Practical: find users active on both platforms
ios_users    = {"u1", "u2", "u3", "u4"}
web_users    = {"u3", "u4", "u5"}

both         = ios_users & web_users   # {'u3', 'u4'}
mobile_only  = ios_users - web_users   # {'u1', 'u2'}`}
            />
            <Callout kind="tip">
                Use a set as a deduper:{' '}
                <Code>{`unique_emails = list(set(emails))`}</Code>. It's the cleanest one-liner for "remove duplicates".
            </Callout>

            <H2 id="frozen">frozenset</H2>
            <CodeBlock
                language="python"
                code={`tags = frozenset(["python", "ml", "interview"])
# tags.add("data")    # AttributeError — immutable

# Can be a dict key
groups = {
    frozenset(["python", "ml"]): "Data Science cohort",
    frozenset(["sql", "powerbi"]): "Analytics cohort"
}`}
            />

            <Takeaways
                items={[
                    'Tuples are immutable lists — use them for fixed-shape data, dict keys, and multi-value returns.',
                    'A single-element tuple needs a trailing comma: (42,).',
                    'Tuple unpacking (incl. star *) makes Python idiomatic — swap, destructure, iterate.',
                    'Sets are unordered, unique, with O(1) membership — perfect for dedupe and overlap checks.',
                    'Use set() for an empty set; {} is an empty dict.',
                    'Reach for set operators (|, &, -, ^) for clean overlap/diff logic.',
                    'frozenset is the immutable, hashable cousin — use as dict keys or set-of-sets.'
                ]}
            />
        </>
    )
}

// ─── SQL ─ Chapter 1: SELECT, WHERE, ORDER BY ─────────────────────────────────

const sqlIntro: TutorialChapter = {
    slug: 'sql/sql-intro',
    topic: 'SQL',
    topicSlug: 'sql',
    chapter: 'Chapter 1',
    title: 'SQL Intro — SELECT, WHERE, ORDER BY',
    description: 'Get started with SQL — the SELECT statement, filtering with WHERE, sorting with ORDER BY, and the basics of relational thinking.',
    readMin: 14,
    tags: ['SQL', 'Basics', 'Queries'],
    next: { slug: 'sql/sql-joins', title: 'SQL Joins' },
    toc: [
        { id: 'why', label: 'Why SQL?' },
        { id: 'syntax', label: 'Anatomy of a SELECT' },
        { id: 'where', label: 'Filtering with WHERE' },
        { id: 'order', label: 'ORDER BY & LIMIT' },
        { id: 'aggregate', label: 'Aggregations & GROUP BY' }
    ],
    content: (
        <>
            <P>
                SQL is the language every analyst, data engineer, and backend developer needs. It's been around since the 1970s and isn't going
                anywhere — every major database speaks a dialect of it. This chapter covers the four statements that handle most everyday work.
            </P>

            <H2 id="why">Why SQL?</H2>
            <UL>
                <LI><Strong>Universal.</Strong> Postgres, MySQL, SQL Server, BigQuery, Snowflake, Redshift, ClickHouse — they all speak SQL.</LI>
                <LI><Strong>Declarative.</Strong> You describe what you want, not how to get it. The query planner figures out the rest.</LI>
                <LI><Strong>Hire-able.</Strong> Every analytics, data, and BI role lists SQL as a primary requirement.</LI>
            </UL>

            <H2 id="syntax">Anatomy of a SELECT</H2>
            <CodeBlock
                language="sql"
                title="employees"
                code={`SELECT name, department, salary
FROM employees
WHERE salary > 100000
ORDER BY salary DESC
LIMIT 10;`}
            />
            <P>SQL clauses run in a fixed logical order, even though you write them in a different order:</P>
            <Table
                headers={['Written order', 'Logical order']}
                rows={[
                    ['SELECT', 'FROM'],
                    ['FROM', 'WHERE'],
                    ['WHERE', 'GROUP BY'],
                    ['GROUP BY', 'HAVING'],
                    ['HAVING', 'SELECT'],
                    ['ORDER BY', 'ORDER BY'],
                    ['LIMIT', 'LIMIT']
                ]}
            />
            <Callout kind="info">
                This is why you can't reference a column alias in the <Code>WHERE</Code> clause — by the time WHERE runs, the SELECT clause hasn't
                been computed yet.
            </Callout>

            <H2 id="where">Filtering with WHERE</H2>
            <CodeBlock
                language="sql"
                code={`-- Comparison operators
SELECT * FROM employees
WHERE salary >= 100000;

-- AND / OR
SELECT * FROM employees
WHERE department = 'Engineering' AND salary > 80000;

-- IN — match any value in a list
SELECT * FROM employees
WHERE department IN ('Engineering', 'Design', 'Product');

-- BETWEEN — inclusive range
SELECT * FROM orders
WHERE order_date BETWEEN '2026-01-01' AND '2026-03-31';

-- LIKE — wildcards
SELECT * FROM customers
WHERE email LIKE '%@gmail.com';   -- ends with
SELECT * FROM products
WHERE name LIKE 'Apple%';          -- starts with

-- NULL checks — = NULL never matches!
SELECT * FROM users
WHERE referral_code IS NULL;`}
            />
            <Callout kind="warning">
                <Code>= NULL</Code> always returns <Code>UNKNOWN</Code>, not <Code>TRUE</Code>. Use <Code>IS NULL</Code> /{' '}
                <Code>IS NOT NULL</Code>. This is the #1 SQL bug for beginners.
            </Callout>

            <H2 id="order">ORDER BY &amp; LIMIT</H2>
            <CodeBlock
                language="sql"
                code={`-- Sort ascending (default)
SELECT name, salary FROM employees ORDER BY salary;

-- Sort descending
SELECT name, salary FROM employees ORDER BY salary DESC;

-- Multi-column sort
SELECT name, department, salary FROM employees
ORDER BY department ASC, salary DESC;

-- Top 5
SELECT name, salary FROM employees
ORDER BY salary DESC
LIMIT 5;

-- Pagination — Postgres / MySQL
SELECT name FROM employees
ORDER BY name
LIMIT 20 OFFSET 40;   -- skip 40, take 20`}
            />

            <H2 id="aggregate">Aggregations &amp; GROUP BY</H2>
            <P>The other half of SQL: collapsing many rows into one.</P>
            <Table
                headers={['Function', 'Returns']}
                rows={[
                    ['COUNT(*)', 'number of rows'],
                    ['COUNT(col)', 'non-NULL values in col'],
                    ['SUM(col)', 'total of numeric col'],
                    ['AVG(col)', 'mean of col'],
                    ['MIN(col) / MAX(col)', 'extremes']
                ]}
            />
            <CodeBlock
                language="sql"
                code={`-- Count rows
SELECT COUNT(*) FROM orders;

-- Group by department
SELECT department,
       COUNT(*)    AS headcount,
       AVG(salary) AS avg_salary,
       MAX(salary) AS top_salary
FROM employees
GROUP BY department
ORDER BY headcount DESC;

-- Filter on the aggregate — use HAVING, not WHERE
SELECT department, COUNT(*) AS cnt
FROM employees
GROUP BY department
HAVING COUNT(*) >= 10;`}
            />
            <Callout kind="tip">
                <Strong>WHERE</Strong> filters rows <em>before</em> aggregation. <Strong>HAVING</Strong> filters groups <em>after</em>.
            </Callout>

            <Takeaways
                items={[
                    'SQL is declarative — describe what you want; the engine figures out how.',
                    'Logical evaluation order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
                    'Always use IS NULL / IS NOT NULL — never = NULL.',
                    'WHERE filters rows before aggregation; HAVING filters groups after.',
                    'Five aggregates handle 90% of work: COUNT, SUM, AVG, MIN, MAX.'
                ]}
            />
        </>
    )
}

// ─── SQL ─ Chapter 2: Joins ───────────────────────────────────────────────────

const sqlJoins: TutorialChapter = {
    slug: 'sql/sql-joins',
    topic: 'SQL',
    topicSlug: 'sql',
    chapter: 'Chapter 2',
    title: 'SQL Joins — INNER, LEFT, RIGHT, FULL',
    description: 'Understand the four classical joins, the difference between INNER and LEFT, common pitfalls, and how to find missing matches.',
    readMin: 15,
    tags: ['SQL', 'Joins'],
    prev: { slug: 'sql/sql-intro', title: 'SQL Intro — SELECT, WHERE, ORDER BY' },
    next: { slug: 'sql/sql-window-functions', title: 'SQL Window Functions' },
    toc: [
        { id: 'why', label: 'Why we join' },
        { id: 'inner', label: 'INNER JOIN' },
        { id: 'left', label: 'LEFT JOIN' },
        { id: 'right-full', label: 'RIGHT & FULL OUTER JOIN' },
        { id: 'missing', label: 'Finding missing matches' },
        { id: 'self', label: 'Self joins' }
    ],
    content: (
        <>
            <P>
                Real databases never live in a single table. Customers in one table, orders in another, products in a third. Joins are how you
                stitch them back together for analysis.
            </P>

            <H2 id="why">Why we join</H2>
            <P>
                Take two tables: <Code>customers(id, name)</Code> and <Code>orders(id, customer_id, amount)</Code>. To answer "which customers
                placed which orders", you need to <em>connect</em> them on the matching key — that's a join.
            </P>

            <H2 id="inner">INNER JOIN</H2>
            <P>Returns rows with a match in both tables.</P>
            <CodeBlock
                language="sql"
                code={`SELECT c.name, o.amount, o.order_date
FROM customers c
INNER JOIN orders o
    ON o.customer_id = c.id;`}
            />
            <Callout kind="info">
                <Code>INNER JOIN</Code> is the default. <Code>JOIN</Code> alone means <Code>INNER JOIN</Code>. Always be explicit; it reads
                better.
            </Callout>

            <H2 id="left">LEFT JOIN</H2>
            <P>
                Returns <Strong>all rows from the left table</Strong> plus matches from the right. Where there's no match, the right side is{' '}
                <Code>NULL</Code>.
            </P>
            <CodeBlock
                language="sql"
                code={`-- All customers, including those who never ordered
SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.id;`}
            />

            <H2 id="right-full">RIGHT &amp; FULL OUTER JOIN</H2>
            <CodeBlock
                language="sql"
                code={`-- RIGHT — mirror image of LEFT (rarely used; flip the tables instead)
SELECT c.name, o.amount
FROM customers c
RIGHT JOIN orders o ON o.customer_id = c.id;

-- FULL OUTER — every row from BOTH tables
SELECT c.name, o.amount
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;`}
            />
            <Table
                headers={['Join', 'Returns']}
                rows={[
                    ['INNER', 'rows that match in BOTH tables'],
                    ['LEFT', 'all rows from LEFT + matches from right'],
                    ['RIGHT', 'all rows from RIGHT + matches from left'],
                    ['FULL OUTER', 'all rows from both, NULL where no match']
                ]}
            />

            <H2 id="missing">Finding missing matches</H2>
            <P>The classic interview pattern — "find customers who never placed an order":</P>
            <CodeBlock
                language="sql"
                code={`SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`}
            />
            <P>This is faster than the equivalent <Code>NOT IN</Code> on most engines, and unlike <Code>NOT IN</Code> it handles NULLs correctly.</P>

            <H2 id="self">Self joins</H2>
            <P>A self join is when you join a table to itself — for example, an employees table where each row has a <Code>manager_id</Code>:</P>
            <CodeBlock
                language="sql"
                code={`-- Get every employee with their manager's name
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m
    ON m.id = e.manager_id;`}
            />

            <Takeaways
                items={[
                    'INNER JOIN keeps only matched rows. LEFT JOIN keeps all left rows + matches.',
                    'Always alias your tables (c, o, e, m) — it makes joins readable.',
                    'LEFT JOIN ... WHERE x IS NULL is the canonical "find rows in A but not B" pattern.',
                    'RIGHT JOIN exists but is rarely written — just flip the tables and use LEFT.',
                    'Self joins solve hierarchy problems (employees → managers, comments → parent comments).'
                ]}
            />
        </>
    )
}

// ─── SQL ─ Chapter 3: Window Functions ────────────────────────────────────────

const sqlWindow: TutorialChapter = {
    slug: 'sql/sql-window-functions',
    topic: 'SQL',
    topicSlug: 'sql',
    chapter: 'Chapter 3',
    title: 'SQL Window Functions',
    description: 'Master OVER, PARTITION BY, ROW_NUMBER, RANK, LAG and running totals — the most-asked topic in modern analytics interviews.',
    readMin: 17,
    tags: ['SQL', 'Window Functions', 'Analytics'],
    prev: { slug: 'sql/sql-joins', title: 'SQL Joins' },
    toc: [
        { id: 'what', label: 'What is a window function?' },
        { id: 'over', label: 'OVER and PARTITION BY' },
        { id: 'rank', label: 'ROW_NUMBER, RANK, DENSE_RANK' },
        { id: 'lag', label: 'LAG and LEAD' },
        { id: 'running', label: 'Running totals' },
        { id: 'topn', label: 'Top-N per group' }
    ],
    content: (
        <>
            <P>
                Window functions are the most-asked topic in 2026 SQL interviews — and the single biggest unlock for analytics work. They let you
                compute aggregates and rankings <em>without collapsing rows</em> the way <Code>GROUP BY</Code> does.
            </P>

            <H2 id="what">What is a window function?</H2>
            <P>
                A window function performs a calculation across a set of rows ("the window") that are related to the current row. The output is{' '}
                <em>still one row per input row</em> — that's what makes it different from <Code>GROUP BY</Code>.
            </P>

            <H2 id="over">OVER and PARTITION BY</H2>
            <CodeBlock
                language="sql"
                code={`-- Show each employee's salary alongside their department's average
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg
FROM employees;`}
            />
            <P>The <Code>OVER (PARTITION BY ...)</Code> clause defines the window. Without <Code>PARTITION BY</Code>, the window is the entire result set:</P>
            <CodeBlock
                language="sql"
                code={`SELECT name, salary,
       salary / SUM(salary) OVER () AS share_of_payroll
FROM employees;`}
            />

            <H2 id="rank">ROW_NUMBER, RANK, DENSE_RANK</H2>
            <Table
                headers={['Function', 'Behaviour on ties']}
                rows={[
                    ['ROW_NUMBER()', 'always sequential — 1, 2, 3, 4'],
                    ['RANK()', 'gaps after ties — 1, 2, 2, 4'],
                    ['DENSE_RANK()', 'no gaps — 1, 2, 2, 3']
                ]}
            />
            <CodeBlock
                language="sql"
                code={`SELECT name, department, salary,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
       RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rk,
       DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dr
FROM employees;`}
            />

            <H2 id="lag">LAG and LEAD</H2>
            <P>Useful for time-series questions: "what was the previous value?" / "what's the next?"</P>
            <CodeBlock
                language="sql"
                code={`-- Days between a user's logins
SELECT user_id, login_at,
       LAG(login_at)  OVER (PARTITION BY user_id ORDER BY login_at) AS prev_login,
       login_at - LAG(login_at) OVER (PARTITION BY user_id ORDER BY login_at) AS gap
FROM logins;

-- Compare today's revenue to yesterday's
SELECT day, revenue,
       LAG(revenue) OVER (ORDER BY day) AS yesterday,
       revenue - LAG(revenue) OVER (ORDER BY day) AS day_over_day
FROM daily_metrics;`}
            />

            <H2 id="running">Running totals</H2>
            <CodeBlock
                language="sql"
                code={`SELECT order_date,
       amount,
       SUM(amount) OVER (
           ORDER BY order_date
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_total
FROM orders;`}
            />
            <Callout kind="tip">
                <Code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</Code> is the default when you specify <Code>ORDER BY</Code> without a frame
                — but writing it explicitly is clearer for reviewers.
            </Callout>

            <H2 id="topn">Top-N per group</H2>
            <P>The single most-asked SQL interview pattern: "find the 3 highest-paid employees per department."</P>
            <CodeBlock
                language="sql"
                code={`WITH ranked AS (
    SELECT name, department, salary,
           DENSE_RANK() OVER (
               PARTITION BY department
               ORDER BY salary DESC
           ) AS rk
    FROM employees
)
SELECT name, department, salary
FROM ranked
WHERE rk <= 3
ORDER BY department, salary DESC;`}
            />

            <Takeaways
                items={[
                    'Window functions compute aggregates without collapsing rows.',
                    "OVER (PARTITION BY ...) defines the window; ORDER BY orders rows within it.",
                    'Use ROW_NUMBER for unique rankings, RANK / DENSE_RANK to handle ties.',
                    'LAG/LEAD look at previous/next rows — perfect for time-series gaps.',
                    'The Top-N-per-group pattern is the most-asked window question — memorise it.'
                ]}
            />
        </>
    )
}

// ─── Power BI ─ Chapter 1: Intro & Data Modelling ─────────────────────────────

const powerbiIntro: TutorialChapter = {
    slug: 'power-bi/power-bi-intro',
    topic: 'Power BI',
    topicSlug: 'power-bi',
    chapter: 'Chapter 1',
    title: 'Power BI Intro & Data Modelling',
    description: 'Get started with Power BI Desktop — load data, build a star schema, set relationships, and create your first dashboard.',
    readMin: 16,
    tags: ['Power BI', 'Data Modelling', 'Star Schema'],
    next: { slug: 'power-bi/power-bi-dax', title: 'Introduction to DAX' },
    toc: [
        { id: 'what', label: 'What is Power BI?' },
        { id: 'install', label: 'Power BI Desktop' },
        { id: 'load', label: 'Loading data' },
        { id: 'modelling', label: 'Star schema modelling' },
        { id: 'dashboard', label: 'Your first dashboard' }
    ],
    content: (
        <>
            <P>
                Power BI is Microsoft's business intelligence platform — and the most-used dashboarding tool in Indian enterprises. The Desktop
                app is free, the cloud service has a per-user licence, and the underlying engine (VertiPaq) is the same one that powers Excel's
                Power Pivot.
            </P>

            <H2 id="what">What is Power BI?</H2>
            <UL>
                <LI><Strong>Power BI Desktop</Strong> — the free Windows app where you connect data, model it, and design reports.</LI>
                <LI><Strong>Power BI Service</Strong> — the cloud (powerbi.com) where you publish and share dashboards.</LI>
                <LI><Strong>Power BI Mobile</Strong> — iOS/Android apps for consumption on the go.</LI>
            </UL>

            <H2 id="install">Power BI Desktop</H2>
            <P>Download from <Code>powerbi.microsoft.com</Code> or the Microsoft Store. It's free, Windows-only, and updates monthly.</P>
            <Callout kind="tip">
                The Power BI ribbon has three big buttons that map to the three "modes": <Strong>Report</Strong> (visuals), <Strong>Data</Strong>{' '}
                (table view), and <Strong>Model</Strong> (relationships). You'll switch between them constantly.
            </Callout>

            <H2 id="load">Loading data</H2>
            <P>Click <Strong>Get Data</Strong>. Power BI supports 100+ connectors. Common ones:</P>
            <UL>
                <LI>Excel / CSV files (drag-and-drop works too)</LI>
                <LI>SQL Server, Postgres, MySQL, Snowflake, BigQuery</LI>
                <LI>SharePoint, OneDrive, Web pages, JSON, Azure Blob</LI>
            </UL>
            <P>
                Once you click <Strong>Transform Data</Strong>, you're in <Strong>Power Query</Strong> — Power BI's ETL editor. You'll see steps
                applied on the right, and the M language under the hood:
            </P>
            <CodeBlock
                language="text"
                title="Power Query · M"
                code={`let
    Source = Csv.Document(File.Contents("C:\\data\\sales.csv"), [Delimiter=","]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"OrderID", Int64.Type},
        {"OrderDate", type date},
        {"Revenue", type number}
    })
in
    ChangedTypes`}
            />

            <H2 id="modelling">Star schema modelling</H2>
            <P>
                Power BI loves star schemas: one fact table in the centre, multiple dimensions around it, joined on keys. The VertiPaq engine
                compresses star schemas extremely well — your model will be smaller and faster.
            </P>
            <CodeBlock
                language="text"
                title="recommended model"
                code={`fact_sales (the centre)
   date_id      ─── dim_date(date_id)
   customer_id  ─── dim_customer(customer_id)
   product_id   ─── dim_product(product_id)
   store_id     ─── dim_store(store_id)
   quantity
   revenue`}
            />
            <P>In <Strong>Model view</Strong>, drag a key from the fact table onto the matching dimension key. Power BI infers the cardinality (typically one-to-many) and creates the relationship.</P>
            <Callout kind="warning">
                Avoid bidirectional relationships and many-to-many unless you know exactly why. They cause ambiguous filters and surprising
                totals.
            </Callout>

            <H2 id="dashboard">Your first dashboard</H2>
            <UL>
                <LI>Drag <Code>revenue</Code> onto the canvas. Power BI guesses a column chart.</LI>
                <LI>Drop <Code>region</Code> on the X-axis — now it's revenue by region.</LI>
                <LI>Add a slicer with <Code>order_date</Code> for time filtering.</LI>
                <LI>Click <Strong>Format</Strong> on each visual — set titles, font sizes, axis labels.</LI>
            </UL>
            <P>Save as <Code>.pbix</Code> and publish via <Strong>File → Publish</Strong> to your Power BI Service workspace.</P>

            <Takeaways
                items={[
                    'Power BI = Desktop (build) + Service (share) + Mobile (consume).',
                    "Power Query (M) is the ETL layer; you'll use it to clean every dataset.",
                    'Always model as a star schema — one fact, many dimensions, joined on keys.',
                    'Avoid bidirectional and many-to-many relationships unless absolutely necessary.',
                    'Build, format, then publish. Save .pbix files to source control just like code.'
                ]}
            />
        </>
    )
}

// ─── Power BI ─ Chapter 2: Intro to DAX ──────────────────────────────────────

const powerbiDax: TutorialChapter = {
    slug: 'power-bi/power-bi-dax',
    topic: 'Power BI',
    topicSlug: 'power-bi',
    chapter: 'Chapter 2',
    title: 'Introduction to DAX',
    description: 'DAX fundamentals — measures vs calculated columns, CALCULATE, time intelligence, and the patterns analysts use daily.',
    readMin: 18,
    tags: ['Power BI', 'DAX'],
    prev: { slug: 'power-bi/power-bi-intro', title: 'Power BI Intro & Data Modelling' },
    toc: [
        { id: 'what', label: 'What is DAX?' },
        { id: 'measure-vs-col', label: 'Measure vs calculated column' },
        { id: 'calculate', label: 'CALCULATE — the workhorse' },
        { id: 'time', label: 'Time intelligence' },
        { id: 'iterators', label: 'Iterators (SUMX / AVERAGEX)' },
        { id: 'variables', label: 'Variables (VAR / RETURN)' }
    ],
    content: (
        <>
            <P>
                DAX (Data Analysis Expressions) is the formula language behind Power BI, Power Pivot, and SSAS Tabular. It looks like Excel, but
                evaluates against an entire <em>filter context</em> instead of single cells. That difference is everything.
            </P>

            <H2 id="what">What is DAX?</H2>
            <P>DAX has 250+ functions. You'll use about 30 of them daily. The mental model:</P>
            <UL>
                <LI>Every visual on the canvas creates a <Strong>filter context</Strong> — the slicers, axis values, and column filters in play.</LI>
                <LI>A measure is evaluated <em>once per cell</em> in that filter context.</LI>
                <LI>To change the filter context, you use <Code>CALCULATE</Code>.</LI>
            </UL>

            <H2 id="measure-vs-col">Measure vs calculated column</H2>
            <Table
                headers={['Aspect', 'Calculated column', 'Measure']}
                rows={[
                    ['When evaluated', 'at refresh time', 'at query time'],
                    ['Stored in', 'the model (RAM)', 'computed live'],
                    ['Filter context', 'row-level', 'whole filter context'],
                    ['Use for', 'static row attributes', 'aggregations, KPIs']
                ]}
            />
            <Callout kind="tip">
                Default to measures. Reach for a calculated column only when you need the value as a row attribute (e.g., to use as a slicer or
                axis).
            </Callout>
            <CodeBlock
                language="text"
                title="DAX"
                code={`-- Measure (preferred)
Total Sales = SUM(Sales[Amount])

Avg Order Value = DIVIDE(SUM(Sales[Amount]), COUNTROWS(Sales))

-- Calculated column (only when needed)
Sales[Margin Bucket] =
SWITCH(
    TRUE(),
    Sales[Margin] >= 0.30, "High",
    Sales[Margin] >= 0.15, "Mid",
    "Low"
)`}
            />

            <H2 id="calculate">CALCULATE — the workhorse</H2>
            <P>
                <Code>CALCULATE</Code> evaluates an expression in a modified filter context. Almost every non-trivial measure uses it.
            </P>
            <CodeBlock
                language="text"
                title="CALCULATE patterns"
                code={`-- Sales for a fixed region
Sales North =
CALCULATE(
    [Total Sales],
    Region[Name] = "North"
)

-- Sales ignoring the region filter (useful for "% of total")
Sales All Regions =
CALCULATE(
    [Total Sales],
    REMOVEFILTERS(Region)
)

-- Share of total
Region Share % =
DIVIDE([Total Sales], [Sales All Regions])`}
            />

            <H2 id="time">Time intelligence</H2>
            <Callout kind="info">
                Time intelligence functions need a <Strong>marked Date table</Strong>. In Model view, right-click your date table → "Mark as date
                table" → pick the date column.
            </Callout>
            <CodeBlock
                language="text"
                title="DAX · time intelligence"
                code={`-- Year-to-date
Sales YTD = TOTALYTD([Total Sales], 'Date'[Date])

-- Same period last year
Sales LY =
CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

-- Year-over-year %
YoY % =
DIVIDE([Total Sales] - [Sales LY], [Sales LY])

-- Last 7 days rolling
Sales 7D =
CALCULATE(
    [Total Sales],
    DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -7, DAY)
)`}
            />

            <H2 id="iterators">Iterators (SUMX / AVERAGEX)</H2>
            <P>X-functions evaluate row-by-row inside the table you give them.</P>
            <CodeBlock
                language="text"
                code={`-- Revenue = quantity * price (per row), then summed
Revenue =
SUMX(Sales, Sales[Quantity] * Sales[Price])

-- Average order value, per order — not weighted by line items
AOV =
AVERAGEX(VALUES(Sales[OrderID]), CALCULATE(SUM(Sales[Amount])))`}
            />

            <H2 id="variables">Variables (VAR / RETURN)</H2>
            <P>Use <Code>VAR</Code> liberally — it makes complex measures readable and avoids re-computing the same thing twice.</P>
            <CodeBlock
                language="text"
                code={`Profit Margin =
VAR Revenue = [Total Sales]
VAR Cost    = [Total Cost]
VAR Profit  = Revenue - Cost
RETURN
    DIVIDE(Profit, Revenue)`}
            />

            <Takeaways
                items={[
                    'DAX evaluates inside a filter context — not against single cells like Excel.',
                    'Default to measures; use calculated columns only when you need a row attribute.',
                    'CALCULATE modifies filter context — almost every advanced measure uses it.',
                    'Time intelligence needs a marked Date table — TOTALYTD, SAMEPERIODLASTYEAR are the workhorses.',
                    'Iterators (SUMX / AVERAGEX) compute row-by-row inside a table.',
                    'Always use VAR / RETURN for readable, performant measures.'
                ]}
            />
        </>
    )
}

// ─── Excel ─ Chapter 1: Formulas Foundations ──────────────────────────────────

const excelFormulas: TutorialChapter = {
    slug: 'excel/excel-formulas',
    topic: 'Excel',
    topicSlug: 'excel',
    chapter: 'Chapter 1',
    title: 'Excel Formulas — Foundations',
    description: 'The 15 Excel formulas every analyst needs — IF, SUMIFS, COUNTIFS, XLOOKUP, INDEX/MATCH, dynamic arrays, and more.',
    readMin: 16,
    tags: ['Excel', 'Formulas', 'Lookups'],
    next: { slug: 'excel/excel-pivot-tables', title: 'Pivot Tables' },
    toc: [
        { id: 'refs', label: 'Cell references — relative, absolute, mixed' },
        { id: 'logical', label: 'Logical — IF, IFS, AND, OR' },
        { id: 'agg', label: 'Aggregates — SUMIFS, COUNTIFS' },
        { id: 'lookups', label: 'Lookups — XLOOKUP, INDEX/MATCH' },
        { id: 'dynamic', label: 'Dynamic arrays — FILTER, UNIQUE, SORT' },
        { id: 'text', label: 'Text functions' }
    ],
    content: (
        <>
            <P>
                Excel is still the world's most-used analytics tool. If you can write 15 formulas well, you can solve 90% of analyst day-to-day
                work. This chapter is those 15.
            </P>

            <H2 id="refs">Cell references — relative, absolute, mixed</H2>
            <Table
                headers={['Reference', 'Behaviour when copied']}
                rows={[
                    ['A1', 'both row and column shift'],
                    ['$A1', 'column locked, row shifts'],
                    ['A$1', 'row locked, column shifts'],
                    ['$A$1', 'both locked']
                ]}
            />
            <Callout kind="tip">
                Press <Code>F4</Code> while editing a reference to cycle: <Code>A1 → $A$1 → A$1 → $A1 → A1</Code>.
            </Callout>

            <H2 id="logical">Logical — IF, IFS, AND, OR</H2>
            <CodeBlock
                language="text"
                title="Excel"
                code={`=IF(A2 >= 60, "Pass", "Fail")

=IF(AND(A2>=60, B2>=60), "Pass", "Fail")

-- IFS replaces nested IFs (Excel 2019+)
=IFS(
    A2>=90, "A+",
    A2>=75, "A",
    A2>=60, "B",
    TRUE,   "C"
)`}
            />

            <H2 id="agg">Aggregates — SUMIFS, COUNTIFS, AVERAGEIFS</H2>
            <CodeBlock
                language="text"
                code={`-- Sum revenue for North region in Q1 2026
=SUMIFS(D:D,                     // sum range
        A:A, "North",            // criteria 1
        B:B, ">=2026-01-01",     // criteria 2
        B:B, "<=2026-03-31")     // criteria 3

-- Count orders > ₹1000 in Mumbai
=COUNTIFS(C:C, "Mumbai", D:D, ">1000")

-- Average order value per region
=AVERAGEIFS(D:D, A:A, "South")`}
            />

            <H2 id="lookups">Lookups — XLOOKUP, INDEX/MATCH</H2>
            <P>
                <Code>XLOOKUP</Code> (Excel 2021+) replaces both <Code>VLOOKUP</Code> and <Code>HLOOKUP</Code>. Use it whenever you can.
            </P>
            <CodeBlock
                language="text"
                code={`-- Modern: XLOOKUP
=XLOOKUP(
    A2,                  // what to find
    Products[ID],        // where to look
    Products[Price],     // what to return
    "Not found"          // if missing
)

-- Backward search — find the LAST match
=XLOOKUP(A2, Products[ID], Products[Price], , 0, -1)

-- Legacy systems: INDEX/MATCH
=INDEX(Products[Price], MATCH(A2, Products[ID], 0))`}
            />

            <H2 id="dynamic">Dynamic arrays — FILTER, UNIQUE, SORT</H2>
            <P>Excel 2021+ introduced spilling formulas. One formula → many cells.</P>
            <CodeBlock
                language="text"
                code={`-- All orders > ₹10,000 — spills down automatically
=FILTER(Orders, Orders[Amount] > 10000)

-- Distinct cities
=UNIQUE(Orders[City])

-- Sorted by revenue desc
=SORT(Orders, 4, -1)

-- Top 5 products by revenue
=TAKE(SORT(Products, 2, -1), 5)`}
            />

            <H2 id="text">Text functions</H2>
            <CodeBlock
                language="text"
                code={`=LEFT("Albero", 3)              // "Alb"
=RIGHT("Albero", 3)             // "ero"
=MID("Albero Academy", 8, 7)    // "Academy"
=LEN("Albero")                  // 6
=UPPER("hello") / LOWER("WORLD") / PROPER("aanya kapoor")
=TRIM("  spaces   ")            // "spaces"
=TEXTSPLIT("a,b,c", ",")        // {"a","b","c"}
=TEXTJOIN(",", TRUE, A1:A10)`}
            />

            <Takeaways
                items={[
                    'F4 cycles through reference types — memorise it.',
                    'IFS replaces nested IFs; SWITCH handles equality chains.',
                    'SUMIFS/COUNTIFS/AVERAGEIFS take ANY number of criteria.',
                    'XLOOKUP > VLOOKUP — bi-directional, with a default value, no column number.',
                    'Dynamic arrays (FILTER, UNIQUE, SORT) replace pivot tables for many use cases.',
                    'TEXTSPLIT and TEXTJOIN make string surgery painless.'
                ]}
            />
        </>
    )
}

// ─── Excel ─ Chapter 2: Pivot Tables ──────────────────────────────────────────

const excelPivot: TutorialChapter = {
    slug: 'excel/excel-pivot-tables',
    topic: 'Excel',
    topicSlug: 'excel',
    chapter: 'Chapter 2',
    title: 'Excel Pivot Tables',
    description: 'Build, slice, and customise pivot tables — the fastest way to summarise transactional data without writing formulas.',
    readMin: 14,
    tags: ['Excel', 'Pivot Tables'],
    prev: { slug: 'excel/excel-formulas', title: 'Excel Formulas — Foundations' },
    toc: [
        { id: 'why', label: 'Why pivot tables?' },
        { id: 'create', label: 'Creating a pivot table' },
        { id: 'fields', label: 'Rows · Columns · Values · Filters' },
        { id: 'calc', label: 'Calculated fields' },
        { id: 'slicers', label: 'Slicers & timelines' },
        { id: 'getpivot', label: 'GETPIVOTDATA' }
    ],
    content: (
        <>
            <P>
                A pivot table is the single fastest way to summarise transactional data into a clean report. Drag fields, get totals. No formulas
                required. Mastering them is non-negotiable for any analyst role.
            </P>

            <H2 id="why">Why pivot tables?</H2>
            <UL>
                <LI>Group thousands of rows by category in one drag.</LI>
                <LI>Switch between sum / average / count / max with a single click.</LI>
                <LI>Drill down into any cell to see the underlying rows.</LI>
                <LI>Refresh in one click when the source data updates.</LI>
            </UL>

            <H2 id="create">Creating a pivot table</H2>
            <UL>
                <LI>Format your data as an Excel Table first (<Code>Ctrl + T</Code>) — pivots auto-pick up new rows.</LI>
                <LI>Click anywhere in the table → <Strong>Insert → PivotTable</Strong> → choose New Worksheet.</LI>
                <LI>You'll see the empty Pivot canvas on the left and the <Strong>Field List</Strong> on the right.</LI>
            </UL>
            <Callout kind="tip">
                Always source pivot tables from a Table (<Code>Ctrl+T</Code>), never a static range. Tables auto-extend, so adding new rows
                requires only a Refresh, not a re-source.
            </Callout>

            <H2 id="fields">Rows · Columns · Values · Filters</H2>
            <Table
                headers={['Drop zone', 'What it does']}
                rows={[
                    ['Rows', 'creates a row label per unique value'],
                    ['Columns', 'creates a column per unique value'],
                    ['Values', 'aggregates this field (default Sum for numbers, Count for text)'],
                    ['Filters', 'adds a top-level filter for the whole pivot']
                ]}
            />
            <P>Example: drag <Code>Region</Code> to Rows, <Code>Year</Code> to Columns, <Code>Revenue</Code> to Values. You instantly have a region × year revenue grid.</P>
            <P>Click the dropdown next to a value field → <Strong>Value Field Settings</Strong> → switch from Sum to Average / Count / Max. Same panel sets number formatting.</P>

            <H2 id="calc">Calculated fields</H2>
            <P>Need a column that doesn't exist in the source? Add a calculated field.</P>
            <UL>
                <LI><Strong>PivotTable Analyze → Fields, Items, &amp; Sets → Calculated Field</Strong></LI>
                <LI>Name it <Code>Profit Margin</Code> and write <Code>= Profit / Revenue</Code></LI>
                <LI>Format the new field as a percentage</LI>
            </UL>
            <Callout kind="warning">
                Calculated fields aggregate <em>after</em> summing — so <Code>=Profit/Revenue</Code> at a row level becomes{' '}
                <Code>SUM(Profit)/SUM(Revenue)</Code>, which is what you usually want. But not always — be deliberate.
            </Callout>

            <H2 id="slicers">Slicers &amp; timelines</H2>
            <P>Slicers are visual filters. <Strong>PivotTable Analyze → Insert Slicer</Strong>. Pick a field — you get clickable filter buttons.</P>
            <UL>
                <LI><Strong>Slicer:</Strong> for any categorical field (region, product, customer segment)</LI>
                <LI><Strong>Timeline:</Strong> only for date fields — slide-through filtering by month/quarter/year</LI>
                <LI>Connect one slicer to multiple pivots — <Strong>Slicer → Report Connections</Strong> → tick all the pivots</LI>
            </UL>

            <H2 id="getpivot">GETPIVOTDATA</H2>
            <P>When you click into a pivot table cell from elsewhere, Excel writes a <Code>GETPIVOTDATA</Code> formula. It looks scary but it's actually very stable — the cell reference doesn't break when the pivot reshapes.</P>
            <CodeBlock
                language="text"
                code={`=GETPIVOTDATA(
    "Revenue",            // value field
    $A$3,                 // any cell in the pivot
    "Region", "North",    // filter pair
    "Year",   2026
)`}
            />
            <Callout kind="tip">
                If you'd rather have a normal A1-style reference: <Strong>PivotTable Analyze → Options</Strong> → uncheck "Generate
                GetPivotData".
            </Callout>

            <Takeaways
                items={[
                    'Always source pivots from a Table (Ctrl+T) — they auto-extend.',
                    "Field zones: Rows for grouping, Columns for cross-tabs, Values for aggregates, Filters for top-level.",
                    "Calculated fields aggregate after summing — perfect for ratios like profit margin.",
                    "Slicers + Timelines turn a pivot into an interactive dashboard.",
                    'GETPIVOTDATA is more stable than A1 references — let Excel write it.'
                ]}
            />
        </>
    )
}

// ─── Tableau ─ Chapter 1: Intro ───────────────────────────────────────────────

const tableauIntro: TutorialChapter = {
    slug: 'tableau/tableau-intro',
    topic: 'Tableau',
    topicSlug: 'tableau',
    chapter: 'Chapter 1',
    title: 'Tableau Intro & First Dashboard',
    description: "Connect to data, build sheets, design a dashboard — Tableau's authoring model in 14 minutes.",
    readMin: 14,
    tags: ['Tableau', 'Dashboards'],
    toc: [
        { id: 'why', label: 'Why Tableau?' },
        { id: 'connect', label: 'Connecting to data' },
        { id: 'shelves', label: 'Shelves — Rows, Columns, Marks' },
        { id: 'measures', label: 'Dimensions vs Measures' },
        { id: 'calc', label: 'Calculated fields' },
        { id: 'dashboard', label: 'Building a dashboard' }
    ],
    content: (
        <>
            <P>
                Tableau popularised drag-and-drop analytics. The same chart-building gestures from 2003 still work today — and they're more
                ergonomic than any code-first BI tool. This chapter covers the absolute essentials.
            </P>

            <H2 id="why">Why Tableau?</H2>
            <UL>
                <LI>Best-in-class chart variety — 24+ chart types out of the box.</LI>
                <LI>"Show Me" panel — drag a measure, get a recommended visualisation instantly.</LI>
                <LI>Strong calculated-field language with LOD expressions for advanced aggregates.</LI>
                <LI>Tableau Public — free hosting for your portfolio dashboards.</LI>
            </UL>

            <H2 id="connect">Connecting to data</H2>
            <P>Open Tableau Desktop. The Connect pane lists 80+ sources. Common ones:</P>
            <UL>
                <LI>Excel, CSV, JSON, PDF</LI>
                <LI>SQL Server, Postgres, MySQL, Snowflake, BigQuery, Redshift</LI>
                <LI>Google Sheets, Salesforce, REST API via Web Data Connector</LI>
            </UL>
            <P>You'll land on the Data Source tab. Drag tables to join (Tableau infers the JOIN keys). Switch to Sheet 1 to start building.</P>

            <H2 id="shelves">Shelves — Rows, Columns, Marks</H2>
            <Table
                headers={['Shelf', 'Effect']}
                rows={[
                    ['Columns', 'adds horizontal axis / column header'],
                    ['Rows', 'adds vertical axis / row header'],
                    ['Marks → Color', 'colours marks by a field'],
                    ['Marks → Size', 'sizes marks by a field'],
                    ['Marks → Label', 'shows a value label'],
                    ['Marks → Detail', 'increases granularity without showing'],
                    ['Filters', 'adds a filter']
                ]}
            />
            <Callout kind="tip">
                The order of pills on Rows/Columns matters — left-most pill is the outer grouping, right-most is the innermost.
            </Callout>

            <H2 id="measures">Dimensions vs Measures</H2>
            <UL>
                <LI><Strong>Dimensions</Strong> are categorical/qualitative fields — region, product, date. They <em>slice</em> data.</LI>
                <LI><Strong>Measures</Strong> are numeric/quantitative fields — sales, profit, quantity. They get <em>aggregated</em> (default SUM).</LI>
            </UL>
            <P>You can convert one to the other via right-click → Convert to Dimension/Measure. Year-as-int often needs to be a Dimension, not a Measure.</P>

            <H2 id="calc">Calculated fields</H2>
            <CodeBlock
                language="text"
                title="Tableau · calculated field"
                code={`// Profit margin
[Profit] / [Sales]

// Tier classification with IF
IF [Sales] > 1000 THEN "High"
ELSEIF [Sales] > 500 THEN "Mid"
ELSE "Low"
END

// LOD: regional total ignoring the view
{ FIXED [Region] : SUM([Sales]) }

// Rolling 7-day sum (table calc)
WINDOW_SUM(SUM([Sales]), -6, 0)`}
            />

            <H2 id="dashboard">Building a dashboard</H2>
            <UL>
                <LI>Build 3–5 individual sheets first. Each sheet should answer one question.</LI>
                <LI>Click the <Strong>New Dashboard</Strong> tab at the bottom (the +Dashboard icon).</LI>
                <LI>Drag sheets onto the canvas. Switch the layout from "Floating" to "Tiled" for predictable alignment.</LI>
                <LI>Add a Filter (right-click a sheet → Filters → "Apply to other worksheets") to wire up cross-filtering.</LI>
                <LI>Publish via <Strong>Server → Publish Workbook</Strong> to Tableau Server / Cloud / Public.</LI>
            </UL>

            <Takeaways
                items={[
                    'Tableau is drag-first — Columns/Rows shelves drive most charts.',
                    'Dimensions slice; Measures aggregate (default SUM).',
                    'Marks card (Color / Size / Label / Detail) controls visual encoding.',
                    'Calculated fields support IF, LOD ({ FIXED ... }), and window functions.',
                    'Build sheets first, then assemble them into dashboards with cross-filtering.'
                ]}
            />
        </>
    )
}

// ─── Statistics ─ Chapter 1: Descriptive Stats ────────────────────────────────

const statsDescriptive: TutorialChapter = {
    slug: 'statistics/descriptive-statistics',
    topic: 'Statistics',
    topicSlug: 'statistics',
    chapter: 'Chapter 1',
    title: 'Descriptive Statistics',
    description: 'Mean, median, mode, variance, standard deviation, percentiles — the toolkit for summarising any dataset.',
    readMin: 14,
    tags: ['Statistics', 'Descriptive'],
    toc: [
        { id: 'why', label: 'Why descriptive stats?' },
        { id: 'central', label: 'Measures of central tendency' },
        { id: 'spread', label: 'Measures of spread' },
        { id: 'percentiles', label: 'Percentiles & quartiles' },
        { id: 'shape', label: 'Skewness & kurtosis' },
        { id: 'python', label: 'Computing them in Python' }
    ],
    content: (
        <>
            <P>
                Before any modelling, A/B test, or machine-learning pipeline, you summarise your data. Descriptive statistics are the toolkit —
                six numbers that tell you almost everything about a column.
            </P>

            <H2 id="why">Why descriptive stats?</H2>
            <UL>
                <LI>Spot data-quality issues — outliers, wrong units, encoding errors.</LI>
                <LI>Choose the right model — many ML algorithms assume roughly-normal features.</LI>
                <LI>Communicate results — "median order value rose 12%" is easier than dumping a CSV.</LI>
            </UL>

            <H2 id="central">Measures of central tendency</H2>
            <Table
                headers={['Measure', 'Formula / definition', 'When to prefer it']}
                rows={[
                    ['Mean (μ)', 'sum / n', 'no extreme outliers, roughly-symmetric data'],
                    ['Median', 'middle value (sorted)', 'skewed data, presence of outliers'],
                    ['Mode', 'most frequent value', 'categorical data; multimodal distributions']
                ]}
            />
            <Callout kind="tip">
                Salaries, house prices, revenue per customer are almost always reported as <Strong>median</Strong>, not mean — the right tail
                drags the mean way too high.
            </Callout>

            <H2 id="spread">Measures of spread</H2>
            <Table
                headers={['Measure', 'What it tells you']}
                rows={[
                    ['Range', 'max − min (very sensitive to outliers)'],
                    ['Variance (σ²)', 'average squared deviation from the mean'],
                    ['Std deviation (σ)', '√variance — same units as the data'],
                    ['IQR', 'Q3 − Q1 (robust to outliers)']
                ]}
            />
            <P>For a roughly normal distribution, the <Strong>68/95/99.7 rule</Strong> holds:</P>
            <UL>
                <LI>~68% of values fall within 1σ of the mean</LI>
                <LI>~95% within 2σ</LI>
                <LI>~99.7% within 3σ</LI>
            </UL>

            <H2 id="percentiles">Percentiles &amp; quartiles</H2>
            <P>The Pth percentile is the value below which P% of the data falls. Quartiles (Q1, Q2, Q3) are the 25th, 50th, 75th percentiles. The <Strong>Inter-Quartile Range (IQR)</Strong> = Q3 − Q1.</P>
            <P>Standard outlier rule: any value below <Code>Q1 − 1.5·IQR</Code> or above <Code>Q3 + 1.5·IQR</Code> is flagged as an outlier (this is what box-plot whiskers visualise).</P>

            <H2 id="shape">Skewness &amp; kurtosis</H2>
            <UL>
                <LI><Strong>Skewness</Strong> measures asymmetry. Right-skew (positive) is common in income & revenue data — a long right tail.</LI>
                <LI><Strong>Kurtosis</Strong> measures tail-heaviness. High kurtosis = more extreme outliers than a normal distribution would predict.</LI>
            </UL>

            <H2 id="python">Computing them in Python</H2>
            <CodeBlock
                language="python"
                code={`import numpy as np
import pandas as pd

salaries = pd.Series([35, 42, 50, 58, 60, 60, 72, 90, 110, 350])

print(salaries.mean())            # 92.7   — pulled up by the 350
print(salaries.median())          # 60.0   — robust
print(salaries.mode().tolist())   # [60]
print(salaries.std())             # 95.4
print(salaries.var())             # 9106
print(salaries.quantile([0.25, 0.5, 0.75]))
print(salaries.describe())        # all of the above in one go

# Custom: compute the 95th percentile
print(np.percentile(salaries, 95))`}
            />
            <Callout kind="info">
                <Code>df.describe()</Code> is the fastest way to print mean/std/min/Q1/median/Q3/max for every numeric column at once. It's the
                first thing every data scientist runs after loading a fresh dataset.
            </Callout>

            <Takeaways
                items={[
                    'Mean is sensitive to outliers; median is robust. Default to median for skewed data.',
                    'Standard deviation has the same units as your data; variance is in units squared.',
                    'For a normal distribution: ~68/95/99.7 of values lie within 1/2/3 std devs.',
                    'Outliers are values outside Q1 − 1.5·IQR or Q3 + 1.5·IQR.',
                    'In Python, df.describe() prints all the descriptives at once — start there every time.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 7: Dictionaries ────────────────────────────────────────

const pythonDictionaries: TutorialChapter = {
    slug: 'python/python-dictionaries',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 7',
    title: 'Python Dictionaries',
    description: 'Master Python dictionaries — creation, access patterns, CRUD operations, iteration, comprehensions, nested dicts, and common idioms.',
    readMin: 18,
    tags: ['Python', 'Dictionaries', 'Key-Value'],
    prev: { slug: 'python/tuples-and-sets', title: 'Tuples & Sets' },
    next: { slug: 'python/conditional-statements', title: 'Conditional Statements' },
    toc: [
        { id: 'create', label: 'Creating dictionaries' },
        { id: 'access', label: 'Accessing values' },
        { id: 'crud', label: 'Add · update · delete' },
        { id: 'methods', label: 'Useful methods' },
        { id: 'iterate', label: 'Iterating over a dict' },
        { id: 'comprehensions', label: 'Dict comprehensions' },
        { id: 'nested', label: 'Nested dictionaries' },
        { id: 'idioms', label: 'Common idioms' }
    ],
    content: (
        <>
            <P>
                Dictionaries are Python's hash maps — the workhorse for any "look up a value by a key" problem. They're ordered (insertion order
                preserved since Python 3.7), mutable, and rely on hashable keys. If you've used JSON, you've already used dicts.
            </P>

            <H2 id="create">Creating dictionaries</H2>
            <CodeBlock
                language="python"
                code={`# Literal — most common
user = {"name": "Aanya", "age": 28, "city": "Noida"}

# Empty dict
empty = {}
empty2 = dict()

# From keyword arguments
user2 = dict(name="Karan", age=32, city="Bengaluru")

# From a list of pairs
user3 = dict([("name", "Meera"), ("age", 24)])

# From two parallel lists with zip()
keys = ["name", "age", "city"]
vals = ["Vikram", 30, "Mumbai"]
user4 = dict(zip(keys, vals))`}
            />

            <H2 id="access">Accessing values</H2>
            <CodeBlock
                language="python"
                code={`user = {"name": "Aanya", "age": 28}

# Bracket access — raises KeyError if missing
print(user["name"])     # Aanya

# .get() — returns None if missing, no error
print(user.get("city"))            # None
print(user.get("city", "Noida"))   # Noida — default value

# Membership check
print("age" in user)               # True
print("salary" in user)            # False`}
            />
            <Callout kind="tip">
                Default to <Code>.get()</Code> when reading from API payloads or user-supplied data — it never raises and lets you set a sensible
                fallback in one expression.
            </Callout>

            <H2 id="crud">Add · update · delete</H2>
            <CodeBlock
                language="python"
                code={`user = {"name": "Aanya", "age": 28}

# Add or update — same syntax
user["city"] = "Noida"        # add
user["age"] = 29              # update
user.update({"role": "Analyst", "salary_lpa": 12.4})

# Delete
del user["salary_lpa"]
removed = user.pop("role")    # also returns the value
last = user.popitem()         # removes & returns last inserted (key, value)
user.clear()                  # empties the dict`}
            />

            <H2 id="methods">Useful methods</H2>
            <Table
                headers={['Method', 'Returns']}
                rows={[
                    ['d.keys()', 'view of all keys'],
                    ['d.values()', 'view of all values'],
                    ['d.items()', 'view of (key, value) tuples'],
                    ['d.get(k, default)', 'value or default — no KeyError'],
                    ['d.setdefault(k, default)', 'get if exists, else set then return'],
                    ['d.update(other)', 'merge other into d (in place)'],
                    ['d.pop(k)', 'remove and return value'],
                    ['d | other (3.9+)', 'new dict with merged keys']
                ]}
            />
            <CodeBlock
                language="python"
                code={`a = {"x": 1, "y": 2}
b = {"y": 99, "z": 3}

# Merge with | (Python 3.9+) — values in b win on collision
merged = a | b
print(merged)   # {'x': 1, 'y': 99, 'z': 3}

# In-place merge with |=
a |= b
print(a)        # {'x': 1, 'y': 99, 'z': 3}`}
            />

            <H2 id="iterate">Iterating over a dict</H2>
            <CodeBlock
                language="python"
                code={`scores = {"Aanya": 92, "Karan": 87, "Meera": 95}

# Default — iterates over keys
for name in scores:
    print(name)

# Values only
for score in scores.values():
    print(score)

# Most useful: items() — both at once
for name, score in scores.items():
    print(f"{name}: {score}")`}
            />

            <H2 id="comprehensions">Dict comprehensions</H2>
            <CodeBlock
                language="python"
                code={`# Squares of 0-4 keyed by the number
squares = {n: n * n for n in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Filter — keep passing scores only
scores = {"Aanya": 92, "Karan": 47, "Meera": 95}
passing = {name: s for name, s in scores.items() if s >= 60}
# {'Aanya': 92, 'Meera': 95}

# Invert a dict — values become keys
codes = {"in": 91, "us": 1, "uk": 44}
flipped = {v: k for k, v in codes.items()}
# {91: 'in', 1: 'us', 44: 'uk'}`}
            />

            <H2 id="nested">Nested dictionaries</H2>
            <CodeBlock
                language="python"
                code={`# A common shape — JSON-like data
order = {
    "id": 1042,
    "customer": {"name": "Aanya", "email": "aanya@x.com"},
    "items": [
        {"sku": "P1", "qty": 2, "price": 199},
        {"sku": "P2", "qty": 1, "price": 1499}
    ]
}

print(order["customer"]["name"])         # Aanya
print(order["items"][0]["sku"])           # P1

# Safe deep access
email = order.get("customer", {}).get("email", "n/a")`}
            />

            <H2 id="idioms">Common idioms</H2>
            <H3>Counting occurrences</H3>
            <CodeBlock
                language="python"
                code={`words = "to be or not to be that is the question".split()

# Manual
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1

# Idiomatic — use Counter
from collections import Counter
counts = Counter(words)
print(counts.most_common(3))
# [('to', 2), ('be', 2), ('or', 1)]`}
            />
            <H3>Grouping items</H3>
            <CodeBlock
                language="python"
                code={`from collections import defaultdict

users = [
    {"name": "Aanya", "city": "Noida"},
    {"name": "Karan", "city": "Bengaluru"},
    {"name": "Meera", "city": "Noida"}
]

by_city = defaultdict(list)
for u in users:
    by_city[u["city"]].append(u["name"])

print(dict(by_city))
# {'Noida': ['Aanya', 'Meera'], 'Bengaluru': ['Karan']}`}
            />

            <Takeaways
                items={[
                    'Dicts are ordered (since Python 3.7), mutable hash maps with O(1) average lookup.',
                    'Use d.get(k, default) for safe reads — never d[k] on data you don\'t fully trust.',
                    "Iterate with .items() to get key and value at the same time.",
                    'Dict comprehensions are the cleanest way to transform or filter mappings.',
                    'Counter and defaultdict cover 90% of "count" / "group" patterns elegantly.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 8: Conditional Statements ──────────────────────────────

const pythonConditionals: TutorialChapter = {
    slug: 'python/conditional-statements',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 8',
    title: 'Conditional Statements',
    description: 'Control program flow with if, elif, else, ternary expressions, match-case, guard clauses, and clean conditionals.',
    readMin: 14,
    tags: ['Python', 'Control Flow', 'Conditionals'],
    prev: { slug: 'python/python-dictionaries', title: 'Python Dictionaries' },
    next: { slug: 'python/python-loops', title: 'Loops' },
    toc: [
        { id: 'basics', label: 'if / elif / else' },
        { id: 'truthy', label: 'Truthy & falsy values' },
        { id: 'ternary', label: 'Ternary expressions' },
        { id: 'match', label: 'match-case (Python 3.10+)' },
        { id: 'guards', label: 'Guard clauses' },
        { id: 'clean', label: 'Writing clean conditionals' }
    ],
    content: (
        <>
            <P>
                Conditionals are how programs make decisions. Python's <Code>if</Code> family is short and readable, but the way you{' '}
                <em>structure</em> conditionals separates clean code from spaghetti. This chapter covers both.
            </P>

            <H2 id="basics">if / elif / else</H2>
            <CodeBlock
                language="python"
                code={`score = 78

if score >= 90:
    grade = "A+"
elif score >= 75:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"

print(grade)   # A`}
            />
            <P>Python uses indentation to mark blocks — no curly braces, no <Code>then</Code>.</P>

            <H2 id="truthy">Truthy &amp; falsy values</H2>
            <P>Any value can be tested in an <Code>if</Code> — Python evaluates "truthiness". The following are all falsy:</P>
            <Table
                headers={['Falsy values']}
                rows={[
                    ['False'],
                    ['None'],
                    ['0, 0.0, 0j (any zero)'],
                    ['"" (empty string)'],
                    ['[], {}, (), set() (empty containers)'],
                    ['custom objects with __bool__ → False']
                ]}
            />
            <CodeBlock
                language="python"
                code={`name = ""

# Pythonic — relies on truthiness
if not name:
    print("name is missing")

# Less pythonic — explicit comparison
if name == "":
    print("name is missing")

# Common pattern — provide default
display_name = name or "Anonymous"`}
            />
            <Callout kind="warning">
                Don't write <Code>if x == True:</Code> — write <Code>if x:</Code>. And don't write <Code>if x == None:</Code> — write{' '}
                <Code>if x is None:</Code>.
            </Callout>

            <H2 id="ternary">Ternary expressions</H2>
            <CodeBlock
                language="python"
                code={`age = 22
status = "adult" if age >= 18 else "minor"
print(status)   # adult

# Compose with f-strings
print(f"You are {'eligible' if age >= 18 else 'too young'} to vote.")`}
            />
            <Callout kind="tip">
                Ternary expressions are great for one-line assignments. If the expression starts wrapping across lines, switch to a regular{' '}
                <Code>if/else</Code>.
            </Callout>

            <H2 id="match">match-case (Python 3.10+)</H2>
            <P>Python's pattern matching — like a smarter <Code>switch</Code>. Best for branching on the <em>shape</em> of data.</P>
            <CodeBlock
                language="python"
                code={`def describe(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0):
            return f"on x-axis at {x}"
        case (0, y):
            return f"on y-axis at {y}"
        case (x, y):
            return f"point at ({x}, {y})"
        case _:
            return "not a 2-tuple"

print(describe((0, 0)))     # origin
print(describe((5, 0)))     # on x-axis at 5
print(describe((3, 4)))     # point at (3, 4)`}
            />

            <H2 id="guards">Guard clauses</H2>
            <P>One of the most underused patterns. Instead of nesting your "happy path" deep inside conditionals, return early:</P>
            <CodeBlock
                language="python"
                code={`# ❌ Nested
def process(user):
    if user is not None:
        if user.is_active:
            if user.has_subscription:
                return charge(user)
            else:
                return None
        else:
            return None
    else:
        return None

# ✅  Guard clauses — return early, indent shallowly
def process(user):
    if user is None:           return None
    if not user.is_active:     return None
    if not user.has_subscription: return None
    return charge(user)`}
            />
            <P>The second version is faster to read, easier to debug, and gives each failure a clear exit point.</P>

            <H2 id="clean">Writing clean conditionals</H2>
            <UL>
                <LI>Prefer <Strong>guard clauses</Strong> over nested <Code>if</Code> trees.</LI>
                <LI>Use <Code>in</Code> for membership: <Code>if status in {'{"open", "pending"}'}:</Code>, not a chain of <Code>or</Code>s.</LI>
                <LI>Extract complex conditions into named variables: <Code>is_eligible = age &gt;= 18 and has_id and not is_banned</Code>.</LI>
                <LI>Reach for <Code>match-case</Code> when matching the shape of data, not for simple value checks.</LI>
                <LI>Avoid double negatives: <Code>if not is_invalid:</Code> is harder to read than <Code>if is_valid:</Code>.</LI>
            </UL>

            <Takeaways
                items={[
                    'Python uses indentation, not braces — and any value can be truthy or falsy.',
                    'Always use is None for None checks; never == None.',
                    'Ternary expressions are one-liners — break to regular if/else if they wrap.',
                    'match-case is for matching the shape of data; if/elif is fine for simple values.',
                    'Guard clauses (return early) beat deeply nested ifs every time.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 9: Loops ───────────────────────────────────────────────

const pythonLoops: TutorialChapter = {
    slug: 'python/python-loops',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 9',
    title: 'Python Loops',
    description: 'Master for loops, while loops, range(), enumerate(), zip(), break, continue, nested loops, and efficient iteration patterns.',
    readMin: 16,
    tags: ['Python', 'Loops', 'For'],
    prev: { slug: 'python/conditional-statements', title: 'Conditional Statements' },
    next: { slug: 'python/python-functions', title: 'Functions' },
    toc: [
        { id: 'for', label: 'for loops' },
        { id: 'range', label: 'range()' },
        { id: 'enumerate', label: 'enumerate() & zip()' },
        { id: 'while', label: 'while loops' },
        { id: 'break', label: 'break, continue, else' },
        { id: 'nested', label: 'Nested loops' },
        { id: 'patterns', label: 'Iteration patterns' }
    ],
    content: (
        <>
            <P>
                Looping is iterating over a sequence. Python's loops are clean — no manual indices, no off-by-one bugs — because the language
                pushes you to iterate over <em>items</em>, not positions.
            </P>

            <H2 id="for">for loops</H2>
            <CodeBlock
                language="python"
                code={`fruits = ["apple", "mango", "banana"]
for fruit in fruits:
    print(fruit)

# Iterate over a string — char by char
for ch in "Albero":
    print(ch)

# Iterate over a dict — keys by default
user = {"name": "Aanya", "age": 28}
for key in user:
    print(key, "=", user[key])

# Iterate over file lines (one of the most common Python tasks)
with open("data.csv") as f:
    for line in f:
        print(line.rstrip())`}
            />

            <H2 id="range">range()</H2>
            <P><Code>range(stop)</Code>, <Code>range(start, stop)</Code>, <Code>range(start, stop, step)</Code>. The end is exclusive.</P>
            <CodeBlock
                language="python"
                code={`for i in range(5):
    print(i)        # 0, 1, 2, 3, 4

for i in range(2, 7):
    print(i)        # 2, 3, 4, 5, 6

for i in range(0, 20, 3):
    print(i)        # 0, 3, 6, 9, 12, 15, 18

# Countdown
for i in range(10, 0, -1):
    print(i, end=" ")
# 10 9 8 7 6 5 4 3 2 1`}
            />
            <Callout kind="tip">
                If you find yourself writing <Code>for i in range(len(my_list)):</Code> followed by <Code>my_list[i]</Code>, you almost certainly
                want <Code>enumerate()</Code> instead.
            </Callout>

            <H2 id="enumerate">enumerate() &amp; zip()</H2>
            <CodeBlock
                language="python"
                code={`fruits = ["apple", "mango", "banana"]

# enumerate gives you (index, item) pairs
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# Start the index at a different number
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}: {fruit}")

# zip pairs up two iterables in lockstep
prices = [120, 80, 50]
for fruit, price in zip(fruits, prices):
    print(f"{fruit}: ₹{price}")

# zip stops at the shortest iterable
for a, b in zip([1, 2, 3], ['a', 'b']):
    print(a, b)
# 1 a
# 2 b`}
            />

            <H2 id="while">while loops</H2>
            <P>A <Code>while</Code> loop runs <em>as long as</em> a condition is true. Use it when you don't know how many iterations you need upfront.</P>
            <CodeBlock
                language="python"
                code={`# Read until EOF
n = 0
while True:
    line = input()
    if line == "STOP":
        break
    n += 1
print(f"Read {n} lines")

# Retry pattern
attempts = 0
while attempts < 3:
    if try_login():
        break
    attempts += 1
else:
    print("Locked out.")`}
            />

            <H2 id="break">break, continue, else</H2>
            <UL>
                <LI><Code>break</Code> — exit the closest enclosing loop immediately.</LI>
                <LI><Code>continue</Code> — skip the rest of this iteration and start the next.</LI>
                <LI><Code>else</Code> on a loop — runs only if the loop completed <em>without</em> a <Code>break</Code>.</LI>
            </UL>
            <CodeBlock
                language="python"
                code={`# Find the first prime in a range
for n in range(2, 100):
    for d in range(2, n):
        if n % d == 0:
            break              # not prime
    else:
        print(f"{n} is prime")
        break                  # found the first one`}
            />

            <H2 id="nested">Nested loops</H2>
            <CodeBlock
                language="python"
                code={`# Multiplication table 1-5
for i in range(1, 6):
    for j in range(1, 6):
        print(f"{i*j:>4}", end=" ")
    print()

# Output:
#    1    2    3    4    5
#    2    4    6    8   10
#    3    6    9   12   15
#    4    8   12   16   20
#    5   10   15   20   25`}
            />

            <H2 id="patterns">Iteration patterns</H2>
            <H3>Building a list from a loop → use a comprehension</H3>
            <CodeBlock
                language="python"
                code={`# Manual
squared = []
for n in range(10):
    squared.append(n * n)

# Idiomatic — same speed, more readable
squared = [n * n for n in range(10)]`}
            />
            <H3>Pairwise iteration</H3>
            <CodeBlock
                language="python"
                code={`# Compare consecutive elements
nums = [4, 7, 2, 9, 1]
for a, b in zip(nums, nums[1:]):
    print(a, "→", b, "diff:", b - a)

# Or use itertools.pairwise (Python 3.10+)
from itertools import pairwise
for a, b in pairwise(nums):
    print(a, b)`}
            />

            <Takeaways
                items={[
                    "Iterate over items, not indices — for x in lst, never for i in range(len(lst)).",
                    'enumerate() gives you (index, item); zip() pairs two iterables in lockstep.',
                    'while is for "until X happens"; for is for "for each item".',
                    'else on a loop runs only if it didn\'t break — useful for "search and report".',
                    'Replace "build a list with append" loops with list comprehensions.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 10: Functions ──────────────────────────────────────────

const pythonFunctions: TutorialChapter = {
    slug: 'python/python-functions',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 10',
    title: 'Python Functions',
    description: 'Define and call functions, pass arguments, set defaults, use *args/**kwargs, write lambdas, and structure clean reusable code.',
    readMin: 18,
    tags: ['Python', 'Functions', 'Reusable Code'],
    prev: { slug: 'python/python-loops', title: 'Loops' },
    next: { slug: 'python/file-handling', title: 'File Handling' },
    toc: [
        { id: 'define', label: 'Defining functions' },
        { id: 'arguments', label: 'Arguments — positional, keyword, default' },
        { id: 'args-kwargs', label: '*args and **kwargs' },
        { id: 'return', label: 'Return values' },
        { id: 'scope', label: 'Scope & closures' },
        { id: 'lambda', label: 'Lambda functions' },
        { id: 'docstrings', label: 'Docstrings & type hints' }
    ],
    content: (
        <>
            <P>
                Functions are the smallest reusable unit in Python. Naming them well, choosing the right argument style, and writing useful
                docstrings are skills that pay off across every project.
            </P>

            <H2 id="define">Defining functions</H2>
            <CodeBlock
                language="python"
                code={`def greet(name):
    return f"Hello, {name}!"

print(greet("Aanya"))   # Hello, Aanya!

# A function with no return — implicitly returns None
def log(message):
    print(f"[LOG] {message}")

result = log("starting")
print(result)            # None`}
            />

            <H2 id="arguments">Arguments — positional, keyword, default</H2>
            <CodeBlock
                language="python"
                code={`def gst(amount, rate=0.18, label="GST"):
    return f"{label}: ₹{amount * rate:.2f}"

# Positional
print(gst(1000))                       # GST: ₹180.00

# Override one keyword arg
print(gst(1000, rate=0.05))            # GST: ₹50.00

# Mix positional and keyword
print(gst(1000, label="Service Tax"))  # Service Tax: ₹180.00

# All by name (recommended for readability)
print(gst(amount=1000, rate=0.12, label="Sales Tax"))`}
            />
            <Callout kind="warning">
                Never use a mutable default like <Code>def add(item, basket=[])</Code> — the list is shared across calls. Use{' '}
                <Code>basket=None</Code> as the sentinel.
            </Callout>

            <H2 id="args-kwargs">*args and **kwargs</H2>
            <CodeBlock
                language="python"
                code={`# *args collects extra positional arguments into a tuple
def total(*nums):
    return sum(nums)

print(total(1, 2, 3))         # 6
print(total(1, 2, 3, 4, 5))   # 15

# **kwargs collects extra keyword arguments into a dict
def log(**fields):
    for key, value in fields.items():
        print(f"{key}: {value}")

log(user="Aanya", action="login", ip="10.0.0.1")

# Combine all four kinds — positional, *args, keyword, **kwargs
def event(name, *participants, level="info", **metadata):
    print(name, participants, level, metadata)

event("birthday", "Aanya", "Karan", level="warn", venue="Noida", year=2026)`}
            />

            <H2 id="return">Return values</H2>
            <CodeBlock
                language="python"
                code={`# Return multiple values — implicitly a tuple
def split_full_name(full):
    first, *rest = full.split()
    return first, " ".join(rest)

first, last = split_full_name("Aanya Kapoor Sharma")
print(first, "|", last)   # Aanya | Kapoor Sharma

# Early returns make code cleaner
def discount(price, customer):
    if customer.is_vip:
        return price * 0.7
    if customer.age >= 60:
        return price * 0.85
    return price`}
            />

            <H2 id="scope">Scope &amp; closures</H2>
            <P>Python uses LEGB lookup — Local, Enclosing, Global, Built-in.</P>
            <CodeBlock
                language="python"
                code={`x = 10                   # global

def outer():
    x = 20               # enclosing
    def inner():
        x = 30           # local
        print("inner:", x)
    inner()
    print("outer:", x)

outer()
print("global:", x)
# inner: 30
# outer: 20
# global: 10

# Closure: inner function "remembers" enclosing scope
def make_counter():
    count = 0
    def increment():
        nonlocal count   # without this, you'd get an UnboundLocalError
        count += 1
        return count
    return increment

c = make_counter()
print(c(), c(), c())     # 1 2 3`}
            />

            <H2 id="lambda">Lambda functions</H2>
            <P>Anonymous, single-expression functions. Best for short, throwaway transforms passed to higher-order functions.</P>
            <CodeBlock
                language="python"
                code={`square = lambda x: x * x
print(square(5))         # 25

# Sort a list of dicts by a field
people = [
    {"name": "Aanya", "age": 28},
    {"name": "Karan", "age": 22},
    {"name": "Meera", "age": 35}
]
people.sort(key=lambda p: p["age"])

# filter + map
nums = [1, 2, 3, 4, 5, 6]
evens_squared = list(map(lambda n: n * n, filter(lambda n: n % 2 == 0, nums)))
# [4, 16, 36]

# But comprehensions usually read better
evens_squared = [n * n for n in nums if n % 2 == 0]`}
            />

            <H2 id="docstrings">Docstrings &amp; type hints</H2>
            <CodeBlock
                language="python"
                code={`def calculate_emi(
    principal: float,
    annual_rate: float,
    months: int
) -> float:
    """
    Calculate the equated monthly instalment.

    Args:
        principal: loan amount in INR
        annual_rate: yearly interest rate as a decimal (0.10 = 10%)
        months: tenure in months

    Returns:
        Monthly instalment in INR.
    """
    monthly_rate = annual_rate / 12
    num = principal * monthly_rate * (1 + monthly_rate) ** months
    den = (1 + monthly_rate) ** months - 1
    return num / den

print(round(calculate_emi(500_000, 0.09, 36), 2))
# 15899.85`}
            />
            <Callout kind="tip">
                Type hints are optional but invaluable. Editors (VS Code, PyCharm) use them for autocomplete; tools like <Code>mypy</Code> and{' '}
                <Code>pyright</Code> use them for static analysis.
            </Callout>

            <Takeaways
                items={[
                    'Use keyword arguments at call sites — readability beats brevity.',
                    'Never use a mutable default; use None and create the value inside the function.',
                    "*args collects extra positional args (tuple); **kwargs collects extra keyword args (dict).",
                    "Closures let inner functions remember enclosing scope — use nonlocal to mutate it.",
                    'Lambdas are for short, throwaway transforms. Reach for comprehensions or named functions otherwise.',
                    'Always write a one-line docstring; add type hints — your editor and reviewer will thank you.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 11: File Handling ───────────────────────────────────────

const pythonFileHandling: TutorialChapter = {
    slug: 'python/file-handling',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 11',
    title: 'Python File Handling',
    description: 'Read and write text files, CSVs, and JSON in Python — with safe context managers, common modes, and Pathlib best practices.',
    readMin: 16,
    tags: ['Python', 'File I/O', 'CSV', 'JSON'],
    prev: { slug: 'python/python-functions', title: 'Functions' },
    next: { slug: 'python/exception-handling', title: 'Exception Handling' },
    toc: [
        { id: 'open', label: 'open() and modes' },
        { id: 'with', label: 'The with-statement' },
        { id: 'read', label: 'Reading text' },
        { id: 'write', label: 'Writing text' },
        { id: 'csv', label: 'CSV files' },
        { id: 'json', label: 'JSON files' },
        { id: 'pathlib', label: 'Pathlib — modern paths' }
    ],
    content: (
        <>
            <P>
                Reading from disk is one of the first things any program needs to do — log files, data dumps, config, CSVs from analysts. Python
                makes it short and safe. The golden rule: always use a <Code>with</Code> block.
            </P>

            <H2 id="open">open() and modes</H2>
            <Table
                headers={['Mode', 'Meaning']}
                rows={[
                    ['"r"', 'read text (default)'],
                    ['"w"', 'write text — overwrites existing file'],
                    ['"a"', 'append text'],
                    ['"x"', 'create new file — fails if it exists'],
                    ['"rb" / "wb"', 'binary read / write'],
                    ['"r+"', 'read AND write']
                ]}
            />

            <H2 id="with">The with-statement</H2>
            <P>
                Always open files inside a <Code>with</Code> block. The file is automatically closed when the block exits — even if an exception
                is raised inside.
            </P>
            <CodeBlock
                language="python"
                code={`# ✅  Correct — auto-closes
with open("notes.txt") as f:
    text = f.read()

# ❌  Risky — no auto-close, leaks the handle on exception
f = open("notes.txt")
text = f.read()
f.close()`}
            />

            <H2 id="read">Reading text</H2>
            <CodeBlock
                language="python"
                code={`# Whole file at once — careful with huge files
with open("notes.txt") as f:
    text = f.read()

# Line by line — efficient even for 10GB files
with open("logs.txt") as f:
    for line in f:
        print(line.rstrip())   # rstrip removes the trailing newline

# All lines at once into a list
with open("config.txt") as f:
    lines = f.readlines()

# Specify encoding when in doubt — utf-8 is the right default
with open("emoji.txt", encoding="utf-8") as f:
    print(f.read())`}
            />
            <Callout kind="tip">
                On Windows, default encoding is locale-specific. Always pass <Code>encoding="utf-8"</Code> for portable code.
            </Callout>

            <H2 id="write">Writing text</H2>
            <CodeBlock
                language="python"
                code={`# Overwrite (or create)
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, Albero!\\n")
    f.write("Line 2\\n")

# Append
with open("log.txt", "a") as f:
    f.write(f"{user_id} logged in\\n")

# Write many lines at once
lines = ["one\\n", "two\\n", "three\\n"]
with open("nums.txt", "w") as f:
    f.writelines(lines)`}
            />

            <H2 id="csv">CSV files</H2>
            <P>The standard library's <Code>csv</Code> module handles quoting and escaping correctly. Don't roll your own with <Code>split(",")</Code>.</P>
            <CodeBlock
                language="python"
                code={`import csv

# Read
with open("orders.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["customer"], "→", row["amount"])

# Write
rows = [
    {"name": "Aanya", "score": 92},
    {"name": "Karan", "score": 87}
]
with open("scores.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerows(rows)`}
            />
            <Callout kind="info">
                For data-science work, <Code>pandas.read_csv</Code> is the right tool — it's faster, handles types, and is the standard. The{' '}
                <Code>csv</Code> module is for lightweight scripts that can't take a pandas dependency.
            </Callout>

            <H2 id="json">JSON files</H2>
            <CodeBlock
                language="python"
                code={`import json

# Read
with open("config.json") as f:
    config = json.load(f)
print(config["api_url"])

# Write
data = {"name": "Aanya", "scores": [92, 87, 95]}
with open("out.json", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Strings (not files)
text  = json.dumps(data)               # dict -> JSON string
back  = json.loads('{"x": 1, "y": 2}') # JSON string -> dict`}
            />

            <H2 id="pathlib">Pathlib — modern paths</H2>
            <P>Forget <Code>os.path.join</Code> — <Code>pathlib</Code> is cleaner, type-safe, and works the same on Windows / macOS / Linux.</P>
            <CodeBlock
                language="python"
                code={`from pathlib import Path

# Build a path
data_dir = Path.home() / "Albero" / "data"
notes = data_dir / "notes.txt"

# Useful methods
print(notes.exists())          # True / False
print(notes.is_file())         # True
print(notes.suffix)            # '.txt'
print(notes.stem)              # 'notes'
print(notes.parent)            # /Users/aanya/Albero/data

# Read/write directly — no open() needed for simple cases
notes.write_text("Hello!\\n", encoding="utf-8")
print(notes.read_text(encoding="utf-8"))

# Iterate over files in a folder
for csv_file in data_dir.glob("*.csv"):
    print(csv_file.name)`}
            />

            <Takeaways
                items={[
                    'Always open files inside a with-statement — guarantees auto-close.',
                    'Pass encoding="utf-8" explicitly; never trust the system default.',
                    'For huge files, iterate line-by-line — never .read() the whole thing.',
                    'Use the csv module for simple work; pandas.read_csv for analytics.',
                    'json.load / json.dump handle files; json.loads / json.dumps handle strings.',
                    'Reach for pathlib over os.path — cleaner API, cross-platform out of the box.'
                ]}
            />
        </>
    )
}

// ─── PYTHON ─ Chapter 12: Exception Handling ─────────────────────────────────

const pythonExceptions: TutorialChapter = {
    slug: 'python/exception-handling',
    topic: 'Python',
    topicSlug: 'python',
    chapter: 'Chapter 12',
    title: 'Python Exception Handling',
    description: 'Handle errors gracefully with try/except/else/finally, raise exceptions, define custom exception classes, and write robust Python.',
    readMin: 15,
    tags: ['Python', 'Exceptions', 'Error Handling'],
    prev: { slug: 'python/file-handling', title: 'File Handling' },
    toc: [
        { id: 'why', label: 'Why exceptions?' },
        { id: 'try', label: 'try / except' },
        { id: 'multi', label: 'Multiple except blocks' },
        { id: 'else', label: 'else and finally' },
        { id: 'raise', label: 'Raising exceptions' },
        { id: 'custom', label: 'Custom exception classes' },
        { id: 'best', label: 'Best practices' }
    ],
    content: (
        <>
            <P>
                Code that doesn't handle errors is broken. Python uses exceptions — events that interrupt normal flow when something goes wrong.
                The trick isn't catching every exception; it's catching the right ones, at the right level, and letting the rest bubble up.
            </P>

            <H2 id="why">Why exceptions?</H2>
            <P>Compare two styles of error reporting:</P>
            <CodeBlock
                language="python"
                code={`# Old-school C-style: returns a sentinel
def to_int(s):
    try:
        return int(s)
    except ValueError:
        return -1

result = to_int("oops")
if result == -1:                # easy to forget the check
    print("invalid")

# Pythonic: raise on failure, callers handle it
def to_int(s):
    return int(s)               # raises ValueError automatically

try:
    result = to_int("oops")
except ValueError:
    print("invalid")`}
            />

            <H2 id="try">try / except</H2>
            <CodeBlock
                language="python"
                code={`try:
    age = int(input("Age? "))
    print(f"You are {age} years old.")
except ValueError:
    print("That wasn't a number.")

# Catch the exception object itself
try:
    open("missing.txt")
except FileNotFoundError as e:
    print(f"Couldn't open: {e}")
    print(f"File: {e.filename}")`}
            />

            <H2 id="multi">Multiple except blocks</H2>
            <CodeBlock
                language="python"
                code={`try:
    response = requests.get(url, timeout=5)
    data = response.json()
    user = data["user"]["name"]
except requests.Timeout:
    print("Server took too long.")
except requests.ConnectionError:
    print("No network.")
except KeyError as e:
    print(f"Unexpected response shape — missing {e}")
except Exception as e:           # last resort
    print(f"Something else broke: {e}")`}
            />
            <P>You can also catch multiple exceptions in one block:</P>
            <CodeBlock
                language="python"
                code={`try:
    risky()
except (ValueError, TypeError, KeyError) as e:
    print(f"Bad input: {e}")`}
            />

            <H2 id="else">else and finally</H2>
            <Table
                headers={['Block', 'Runs when']}
                rows={[
                    ['try', 'always'],
                    ['except', 'only on matching exception'],
                    ['else', 'only if try succeeded with no exception'],
                    ['finally', 'always — even after return / exception']
                ]}
            />
            <CodeBlock
                language="python"
                code={`try:
    f = open("data.csv")
except FileNotFoundError:
    print("missing file")
else:
    process(f)         # only if open() succeeded
finally:
    f.close()          # always — clean up`}
            />

            <H2 id="raise">Raising exceptions</H2>
            <CodeBlock
                language="python"
                code={`def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise ValueError(f"insufficient funds (have {balance})")
    return balance - amount

# Re-raise after logging
try:
    withdraw(100, 1000)
except ValueError as e:
    log.warning(f"withdrawal failed: {e}")
    raise            # re-raises the same exception

# Chain — keeps the original cause visible
try:
    parse(data)
except ValueError as e:
    raise ParseError("could not parse input") from e`}
            />

            <H2 id="custom">Custom exception classes</H2>
            <CodeBlock
                language="python"
                code={`class PaymentError(Exception):
    """Base class for all payment-related failures."""

class InsufficientFunds(PaymentError):
    def __init__(self, balance, requested):
        super().__init__(f"have {balance}, need {requested}")
        self.balance = balance
        self.requested = requested

# Now callers can catch the family
try:
    process_payment()
except InsufficientFunds as e:
    suggest_topup(e.balance, e.requested)
except PaymentError as e:
    log.error(e)`}
            />

            <H2 id="best">Best practices</H2>
            <UL>
                <LI><Strong>Catch what you can handle.</Strong> Don't <Code>except Exception:</Code> just to make a problem disappear.</LI>
                <LI><Strong>Catch narrowly.</Strong> <Code>except ValueError</Code> is better than <Code>except Exception</Code>.</LI>
                <LI><Strong>Don't swallow errors.</Strong> A bare <Code>except: pass</Code> is almost always a bug waiting to happen.</LI>
                <LI><Strong>Add context.</Strong> When re-raising, use <Code>from</Code> so the original traceback is preserved.</LI>
                <LI><Strong>Use finally for cleanup</Strong> only when a context manager (<Code>with</Code>) won't do.</LI>
                <LI><Strong>Define custom exception classes</Strong> for your domain — they read better and let callers catch a category.</LI>
            </UL>

            <Takeaways
                items={[
                    "Exceptions interrupt control flow — they're better than sentinel return values.",
                    "Catch the most specific exception class you can. except Exception is a code smell.",
                    'else runs after try succeeds; finally runs no matter what.',
                    "raise SomeError('msg') from original_exc preserves the cause chain.",
                    'Define custom exception classes for your domain — InsufficientFunds reads better than ValueError.',
                    "Never write `except: pass`. If you really mean it, log first."
                ]}
            />
        </>
    )
}

// ─── SQL ─ Chapter 4: Subqueries & CTEs ──────────────────────────────────────

const sqlSubqueriesCtes: TutorialChapter = {
    slug: 'sql/subqueries-and-ctes',
    topic: 'SQL',
    topicSlug: 'sql',
    chapter: 'Chapter 4',
    title: 'SQL Subqueries & CTEs',
    description: 'Master subqueries and Common Table Expressions (WITH) — when to use which, recursive CTEs, and writing readable analytical SQL.',
    readMin: 16,
    tags: ['SQL', 'Subqueries', 'CTEs', 'WITH'],
    prev: { slug: 'sql/sql-window-functions', title: 'SQL Window Functions' },
    next: { slug: 'sql/aggregations-deep-dive', title: 'Aggregations Deep Dive' },
    toc: [
        { id: 'subqueries', label: 'Scalar & inline subqueries' },
        { id: 'in-exists', label: 'IN, EXISTS, ANY, ALL' },
        { id: 'cte', label: 'Common Table Expressions (WITH)' },
        { id: 'cte-vs-sub', label: 'CTE vs subquery — when to choose' },
        { id: 'recursive', label: 'Recursive CTEs' }
    ],
    content: (
        <>
            <P>
                Subqueries and CTEs are how you compose SQL — wrap one query inside another to build up complex analyses step by step. Modern
                analytics SQL leans heavily on CTEs because they read top-to-bottom like a script.
            </P>

            <H2 id="subqueries">Scalar &amp; inline subqueries</H2>
            <H3>Scalar subquery — returns one value</H3>
            <CodeBlock
                language="sql"
                code={`-- Show every employee's salary alongside the company average
SELECT name,
       salary,
       (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;`}
            />

            <H3>Inline subquery — used like a table</H3>
            <CodeBlock
                language="sql"
                code={`-- Top-3 highest-paid employees per department
SELECT *
FROM (
    SELECT name, department, salary,
           DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rk
    FROM employees
) t
WHERE rk <= 3;`}
            />

            <H2 id="in-exists">IN, EXISTS, ANY, ALL</H2>
            <CodeBlock
                language="sql"
                code={`-- Customers who placed at least one order over ₹10,000
SELECT name FROM customers c
WHERE c.id IN (
    SELECT customer_id FROM orders WHERE amount > 10000
);

-- Same logic with EXISTS — usually faster on large tables
SELECT name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.amount > 10000
);

-- ALL — bigger than every value in the subquery
SELECT name, salary FROM employees
WHERE salary > ALL (
    SELECT salary FROM employees WHERE department = 'Sales'
);`}
            />
            <Callout kind="tip">
                <Code>EXISTS</Code> short-circuits — the moment it finds a matching row, it stops. <Code>IN</Code> evaluates the entire subquery
                first. Prefer <Code>EXISTS</Code> for "is there at least one" patterns on large tables.
            </Callout>

            <H2 id="cte">Common Table Expressions (WITH)</H2>
            <P>A CTE is a named subquery you define before the main query. It reads top-to-bottom like a workflow:</P>
            <CodeBlock
                language="sql"
                code={`WITH dept_avg AS (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
),
ranked AS (
    SELECT e.name, e.department, e.salary, d.avg_salary,
           e.salary - d.avg_salary AS diff_from_avg
    FROM employees e
    JOIN dept_avg d ON d.department = e.department
)
SELECT *
FROM ranked
WHERE diff_from_avg > 0
ORDER BY diff_from_avg DESC;`}
            />

            <H2 id="cte-vs-sub">CTE vs subquery — when to choose</H2>
            <Table
                headers={['Use a CTE when', 'Use a subquery when']}
                rows={[
                    ['Reusing the result more than once', 'It\'s used in exactly one place'],
                    ['You want named, readable steps', 'The logic is simple and inline'],
                    ['Building up a multi-step analysis', 'You\'re returning a single scalar value'],
                    ['Recursing (CTEs only)', 'Performance is critical (engine-dependent)']
                ]}
            />

            <H2 id="recursive">Recursive CTEs</H2>
            <P>Useful for hierarchies — org charts, comment threads, file folder trees, BOM (bill of materials).</P>
            <CodeBlock
                language="sql"
                code={`-- Find the entire reporting chain under CEO id = 1
WITH RECURSIVE org AS (
    -- Anchor: start with the CEO
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE id = 1

    UNION ALL

    -- Recursive: every employee whose manager is in the previous level
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    INNER JOIN org o ON e.manager_id = o.id
)
SELECT level, name FROM org ORDER BY level, name;`}
            />
            <Callout kind="info">
                Recursive CTEs always have two parts joined by <Code>UNION ALL</Code>: the <Strong>anchor</Strong> (base case) and the{' '}
                <Strong>recursive member</Strong> (refers back to the CTE's own name).
            </Callout>

            <Takeaways
                items={[
                    "Scalar subqueries return one value; inline subqueries act as virtual tables.",
                    "EXISTS short-circuits — usually faster than IN on big tables.",
                    "CTEs (WITH) make multi-step analytics queries readable top-to-bottom.",
                    "CTEs let you name and reuse intermediate results — much cleaner than nesting subqueries.",
                    "Recursive CTEs handle hierarchies — anchor + recursive member joined by UNION ALL."
                ]}
            />
        </>
    )
}

// ─── SQL ─ Chapter 5: Aggregations Deep Dive ─────────────────────────────────

const sqlAggregations: TutorialChapter = {
    slug: 'sql/aggregations-deep-dive',
    topic: 'SQL',
    topicSlug: 'sql',
    chapter: 'Chapter 5',
    title: 'SQL Aggregations Deep Dive',
    description: 'COUNT vs COUNT DISTINCT, conditional aggregation, GROUPING SETS, ROLLUP, CUBE, and the patterns that show up in real analytics work.',
    readMin: 14,
    tags: ['SQL', 'Aggregations', 'GROUP BY'],
    prev: { slug: 'sql/subqueries-and-ctes', title: 'Subqueries & CTEs' },
    toc: [
        { id: 'count', label: 'COUNT, COUNT DISTINCT, COUNT(*)' },
        { id: 'conditional', label: 'Conditional aggregation' },
        { id: 'filter', label: 'FILTER (WHERE …)' },
        { id: 'rollup', label: 'GROUPING SETS, ROLLUP, CUBE' },
        { id: 'patterns', label: 'Real-world patterns' }
    ],
    content: (
        <>
            <P>
                Beyond SUM and AVG, SQL has aggregation tools most analysts never learn — and they're the ones that solve real problems. This
                chapter covers conditional aggregation, FILTER, and the GROUPING family.
            </P>

            <H2 id="count">COUNT, COUNT DISTINCT, COUNT(*)</H2>
            <Table
                headers={['Form', 'Counts']}
                rows={[
                    ['COUNT(*)', 'all rows, including those with NULLs'],
                    ['COUNT(col)', 'rows where col IS NOT NULL'],
                    ['COUNT(DISTINCT col)', 'unique non-NULL values of col'],
                    ['COUNT(*) FILTER (...)', 'all rows matching the filter']
                ]}
            />
            <CodeBlock
                language="sql"
                code={`-- All orders, including NULL customers
SELECT COUNT(*) FROM orders;

-- Orders with a known customer
SELECT COUNT(customer_id) FROM orders;

-- Distinct customers who ever ordered
SELECT COUNT(DISTINCT customer_id) FROM orders;`}
            />

            <H2 id="conditional">Conditional aggregation</H2>
            <P>The single most-asked SQL technique in 2026 analyst interviews. Use a <Code>CASE</Code> inside an aggregate to count or sum only specific rows.</P>
            <CodeBlock
                language="sql"
                code={`-- Pivot order status counts on one row per region
SELECT
    region,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'paid'      THEN 1 ELSE 0 END) AS paid,
    SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
    SUM(CASE WHEN status = 'paid'      THEN amount ELSE 0 END) AS paid_revenue
FROM orders
GROUP BY region;`}
            />

            <H2 id="filter">FILTER (WHERE …) — the modern syntax</H2>
            <P>Postgres, SQL Server, BigQuery and others support <Code>FILTER (WHERE …)</Code>, which is much cleaner than CASE-inside-SUM:</P>
            <CodeBlock
                language="sql"
                code={`SELECT
    region,
    COUNT(*)                                   AS total_orders,
    COUNT(*) FILTER (WHERE status = 'paid')    AS paid,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending,
    SUM(amount) FILTER (WHERE status = 'paid') AS paid_revenue
FROM orders
GROUP BY region;`}
            />

            <H2 id="rollup">GROUPING SETS, ROLLUP, CUBE</H2>
            <P>Compute multiple GROUP BY combinations in one pass:</P>
            <CodeBlock
                language="sql"
                code={`-- Subtotals by region, plus a grand total row at the bottom
SELECT
    region,
    SUM(amount) AS revenue
FROM orders
GROUP BY ROLLUP(region);

-- region    | revenue
-- ----------+---------
-- North     | 12000
-- South     | 18000
-- West      | 15000
-- NULL      | 45000     ← grand total

-- Subtotals at every combination of region × month
SELECT region, month, SUM(amount)
FROM orders
GROUP BY CUBE(region, month);

-- Custom combinations — only the ones you want
SELECT region, status, month, SUM(amount)
FROM orders
GROUP BY GROUPING SETS (
    (region),
    (status),
    (region, status),
    ()                    -- the grand total
);`}
            />

            <H2 id="patterns">Real-world patterns</H2>
            <H3>1. Funnel analysis</H3>
            <CodeBlock
                language="sql"
                code={`SELECT
    COUNT(DISTINCT user_id)                                                AS visited,
    COUNT(DISTINCT user_id) FILTER (WHERE event = 'add_to_cart')           AS added_to_cart,
    COUNT(DISTINCT user_id) FILTER (WHERE event = 'checkout')              AS reached_checkout,
    COUNT(DISTINCT user_id) FILTER (WHERE event = 'purchase')              AS purchased
FROM events
WHERE event_date = CURRENT_DATE;`}
            />
            <H3>2. Cohort retention shell</H3>
            <CodeBlock
                language="sql"
                code={`WITH first_seen AS (
    SELECT user_id, DATE_TRUNC('month', MIN(event_at)) AS cohort
    FROM events GROUP BY user_id
)
SELECT
    cohort,
    COUNT(DISTINCT f.user_id)                                                  AS cohort_size,
    COUNT(DISTINCT e.user_id) FILTER (WHERE e.event_at < f.cohort + INTERVAL '7 days')  AS active_w1,
    COUNT(DISTINCT e.user_id) FILTER (WHERE e.event_at < f.cohort + INTERVAL '30 days') AS active_m1
FROM first_seen f
LEFT JOIN events e ON e.user_id = f.user_id
GROUP BY cohort;`}
            />

            <Takeaways
                items={[
                    "COUNT(*) counts rows; COUNT(col) skips NULLs; COUNT(DISTINCT col) deduplicates.",
                    "Conditional aggregation (CASE-inside-SUM or FILTER WHERE) is the workhorse of analytics SQL.",
                    "FILTER (WHERE …) reads better than CASE — use it where supported.",
                    'ROLLUP gives subtotals + grand total; CUBE gives every combination; GROUPING SETS lets you pick.',
                    'Funnels, cohorts, and pivot tables all reduce to conditional aggregation patterns.'
                ]}
            />
        </>
    )
}

// ─── Statistics ─ Chapter 2: Probability & Distributions ─────────────────────

const statsProbability: TutorialChapter = {
    slug: 'statistics/probability-and-distributions',
    topic: 'Statistics',
    topicSlug: 'statistics',
    chapter: 'Chapter 2',
    title: 'Probability & Distributions',
    description: 'Probability basics, the Normal / Binomial / Poisson distributions, the CLT, and computing probabilities in Python.',
    readMin: 16,
    tags: ['Statistics', 'Probability', 'Distributions'],
    prev: { slug: 'statistics/descriptive-statistics', title: 'Descriptive Statistics' },
    next: { slug: 'statistics/hypothesis-testing', title: 'Hypothesis Testing' },
    toc: [
        { id: 'why', label: 'What is probability?' },
        { id: 'rules', label: 'Probability rules' },
        { id: 'normal', label: 'The Normal distribution' },
        { id: 'binomial', label: 'The Binomial distribution' },
        { id: 'poisson', label: 'The Poisson distribution' },
        { id: 'clt', label: 'The Central Limit Theorem' }
    ],
    content: (
        <>
            <P>
                Probability is the language of uncertainty. Every A/B test, every confidence interval, every machine-learning model is grounded
                in it. This chapter covers the three distributions you'll meet most often, plus the theorem that ties everything together.
            </P>

            <H2 id="why">What is probability?</H2>
            <P>The chance of an event, between 0 (impossible) and 1 (certain). Two intuitions:</P>
            <UL>
                <LI><Strong>Frequentist:</Strong> the long-run proportion of times the event happens.</LI>
                <LI><Strong>Bayesian:</Strong> a degree of belief that updates as evidence arrives.</LI>
            </UL>

            <H2 id="rules">Probability rules</H2>
            <Table
                headers={['Rule', 'Formula']}
                rows={[
                    ['Complement', 'P(not A) = 1 − P(A)'],
                    ['Union (any)', 'P(A or B) = P(A) + P(B) − P(A and B)'],
                    ['Independent intersection', 'P(A and B) = P(A) · P(B)'],
                    ['Conditional', 'P(A | B) = P(A and B) / P(B)'],
                    ['Bayes', 'P(A | B) = P(B | A) · P(A) / P(B)']
                ]}
            />

            <H2 id="normal">The Normal distribution</H2>
            <P>The bell curve. Defined by its mean (μ) and standard deviation (σ). Many natural measurements (heights, blood pressure, IQ scores, measurement errors) follow it.</P>
            <CodeBlock
                language="python"
                code={`from scipy.stats import norm

# Probability of being below 175cm in a population with μ=170, σ=8
print(norm.cdf(175, loc=170, scale=8))    # 0.7340

# Probability of being between 165 and 180
print(norm.cdf(180, 170, 8) - norm.cdf(165, 170, 8))  # 0.6883

# Inverse — the value below which 95% of the population falls
print(norm.ppf(0.95, loc=170, scale=8))   # 183.16`}
            />
            <Callout kind="tip">
                The 68/95/99.7 rule: ~68% of a normal distribution lies within 1σ of the mean, ~95% within 2σ, ~99.7% within 3σ. Memorise this.
            </Callout>

            <H2 id="binomial">The Binomial distribution</H2>
            <P>The number of successes in <em>n</em> independent Yes/No trials, each with the same success probability <em>p</em>. Coin flips, click-or-not, defect-or-not.</P>
            <CodeBlock
                language="python"
                code={`from scipy.stats import binom

# An ad has a 5% click-through rate. Out of 1000 impressions, what's the
# probability of getting exactly 60 clicks?
print(binom.pmf(60, n=1000, p=0.05))   # 0.0151

# Probability of 60 or more clicks
print(1 - binom.cdf(59, n=1000, p=0.05))  # 0.0813

# Mean & variance (without simulating)
print(binom.mean(1000, 0.05))   # 50
print(binom.var(1000, 0.05))    # 47.5`}
            />

            <H2 id="poisson">The Poisson distribution</H2>
            <P>The number of events in a fixed interval, given an average rate (λ). Calls to a help-desk per minute, customers entering a shop per hour, typos per page.</P>
            <CodeBlock
                language="python"
                code={`from scipy.stats import poisson

# Customer-care line averages 4 calls per minute. What's the probability
# of getting exactly 6 calls in the next minute?
print(poisson.pmf(6, mu=4))    # 0.1042

# Probability of 0 calls in the next minute
print(poisson.pmf(0, mu=4))    # 0.0183

# Probability of 10 or more calls — overload threshold
print(1 - poisson.cdf(9, mu=4))  # 0.0081`}
            />
            <Callout kind="info">
                A Poisson with mean λ ≥ 30 looks visually almost identical to a Normal(μ=λ, σ=√λ). That's why the Normal approximation works so
                often for big λ.
            </Callout>

            <H2 id="clt">The Central Limit Theorem</H2>
            <P>
                <Strong>Take any distribution.</Strong> Sample <em>n</em> values from it, take their mean, repeat. As <em>n</em> grows, the
                distribution of those sample means approaches a Normal distribution — regardless of what the underlying distribution looks like.
            </P>
            <CodeBlock
                language="python"
                code={`import numpy as np
import matplotlib.pyplot as plt

# An ugly, non-normal underlying distribution
population = np.random.exponential(scale=2, size=100_000)

# Take 5000 samples of size n=30 and average each
sample_means = [np.mean(np.random.choice(population, 30)) for _ in range(5000)]

# The sample-means distribution is shockingly normal
plt.hist(sample_means, bins=50)
plt.title("CLT in action: sample means of an exponential distribution")
plt.show()`}
            />
            <P>The CLT is what makes inference possible — it's why we can compute confidence intervals and run t-tests on real-world data that's almost never perfectly normal.</P>

            <Takeaways
                items={[
                    'Probability is bounded between 0 and 1; the rules cover complement, union, intersection, conditional.',
                    "Normal distribution: bell-shaped, defined by μ and σ. The 68/95/99.7 rule is essential.",
                    "Binomial: yes/no trials with fixed n and p. Use it for click-through rates and defect counts.",
                    "Poisson: events per fixed interval. Use it for call volumes, arrivals, queue length.",
                    "The Central Limit Theorem says sample means tend toward Normal — that's why inference works on non-normal data."
                ]}
            />
        </>
    )
}

// ─── Statistics ─ Chapter 3: Hypothesis Testing ──────────────────────────────

const statsHypothesis: TutorialChapter = {
    slug: 'statistics/hypothesis-testing',
    topic: 'Statistics',
    topicSlug: 'statistics',
    chapter: 'Chapter 3',
    title: 'Hypothesis Testing',
    description: 'Null & alternative hypotheses, p-values, Type I/II errors, t-tests, chi-squared, and how to read an A/B test result.',
    readMin: 16,
    tags: ['Statistics', 'Hypothesis Testing', 'A/B Testing'],
    prev: { slug: 'statistics/probability-and-distributions', title: 'Probability & Distributions' },
    toc: [
        { id: 'framework', label: 'The framework' },
        { id: 'pvalue', label: 'p-values demystified' },
        { id: 'errors', label: 'Type I & Type II errors' },
        { id: 'tests', label: 'Picking the right test' },
        { id: 'ttest', label: 't-test in Python' },
        { id: 'chi', label: 'Chi-squared in Python' },
        { id: 'reading', label: 'Reading an A/B test result' }
    ],
    content: (
        <>
            <P>
                Hypothesis testing is how we draw conclusions about a population from a sample. It's also the most-misunderstood part of
                statistics. By the end of this chapter you'll know how to set up a test, choose the right one, and read the result without making
                the classic mistakes.
            </P>

            <H2 id="framework">The framework</H2>
            <UL>
                <LI><Strong>H₀ (null hypothesis):</Strong> "nothing's going on" — no difference, no effect.</LI>
                <LI><Strong>H₁ (alternative):</Strong> the effect you actually want to detect.</LI>
                <LI><Strong>α (significance level):</Strong> the false-positive rate you're willing to accept. Conventionally 0.05.</LI>
                <LI><Strong>p-value:</Strong> probability of seeing data at least this extreme, <em>assuming H₀ is true</em>.</LI>
                <LI>If <Code>p &lt; α</Code>, reject H₀. If <Code>p ≥ α</Code>, fail to reject — not the same as "accept H₀".</LI>
            </UL>

            <H2 id="pvalue">p-values demystified</H2>
            <Callout kind="warning">
                A p-value is <Strong>NOT</Strong> the probability that H₀ is true. It's the probability of the observed data (or more extreme),{' '}
                <em>assuming H₀ is true</em>. This single confusion sinks most data-analyst interviews.
            </Callout>
            <P>If a coin returns 70 heads in 100 flips and the p-value is 0.0001, it means: <em>"if the coin were fair, we'd see results this extreme only 0.01% of the time"</em>. It does not mean the probability of fairness is 0.01%.</P>

            <H2 id="errors">Type I &amp; Type II errors</H2>
            <Table
                headers={['Reality \\ Decision', 'Reject H₀', 'Fail to reject H₀']}
                rows={[
                    ['H₀ true', 'Type I error (α)', 'Correct'],
                    ['H₀ false', 'Correct', 'Type II error (β)']
                ]}
            />
            <P>
                <Strong>Power</Strong> = 1 − β — the probability of correctly detecting an effect when it exists. Aim for power ≥ 0.8 in
                experiment design.
            </P>

            <H2 id="tests">Picking the right test</H2>
            <Table
                headers={['Question', 'Test']}
                rows={[
                    ['Compare a sample mean to a known value', 'one-sample t-test'],
                    ['Compare two independent groups (means)', 'independent two-sample t-test'],
                    ['Compare paired observations (before/after)', 'paired t-test'],
                    ['Compare a proportion to a known value', 'one-sample z-test'],
                    ['Compare two proportions', 'two-proportion z-test'],
                    ['More than 2 groups (means)', 'ANOVA'],
                    ['Categorical vs categorical', 'Chi-squared test'],
                    ['Non-normal data, two groups', 'Mann-Whitney U']
                ]}
            />

            <H2 id="ttest">t-test in Python</H2>
            <CodeBlock
                language="python"
                code={`from scipy import stats

# Did variant B (n=200, mean=12.4 min, std=3.1) reduce time-on-task vs A (n=200, mean=14.1, std=3.5)?
import numpy as np
np.random.seed(42)
a = np.random.normal(14.1, 3.5, 200)
b = np.random.normal(12.4, 3.1, 200)

t_stat, p_value = stats.ttest_ind(a, b, equal_var=False)
print(f"t = {t_stat:.3f}, p = {p_value:.4f}")
# t = 5.171, p = 0.0000

# Paired t-test — same users, before & after
before = np.array([72, 65, 80, 90, 68])
after  = np.array([74, 70, 85, 88, 72])
t, p = stats.ttest_rel(before, after)
print(f"paired t = {t:.3f}, p = {p:.4f}")`}
            />

            <H2 id="chi">Chi-squared in Python</H2>
            <CodeBlock
                language="python"
                code={`from scipy.stats import chi2_contingency

# Is button colour independent of click behaviour?
# Rows = colour (red, green), Columns = clicked / didn't
observed = [
    [120, 380],   # red
    [180, 320]    # green
]

chi2, p, dof, expected = chi2_contingency(observed)
print(f"chi² = {chi2:.3f}, p = {p:.4f}")
# chi² = 18.18, p = 0.0000   ← reject independence: colour matters`}
            />

            <H2 id="reading">Reading an A/B test result</H2>
            <P>You ran an A/B test. The output says <Code>p = 0.03, lift = +4.2%</Code>. What's the right read?</P>
            <UL>
                <LI><Strong>p &lt; 0.05</Strong>: statistically significant at the 95% level. You reject the null.</LI>
                <LI><Strong>+4.2% lift</Strong>: the point estimate of effect size. The actual effect could be smaller or larger.</LI>
                <LI><Strong>Always look at confidence intervals.</Strong> A "+4.2% lift, 95% CI [0.5%, 8.0%]" is honest — the true effect could realistically be a tiny 0.5%.</LI>
                <LI><Strong>Practical significance ≠ statistical significance.</Strong> A 0.05% lift can be statistically significant if your sample is huge — but might not justify shipping.</LI>
                <LI><Strong>Stopping early invalidates the test.</Strong> Pre-register your sample size; don't peek and stop.</LI>
            </UL>

            <Takeaways
                items={[
                    'p-value = P(data | H₀), not P(H₀ | data). The reverse is the most common stats mistake.',
                    "Type I (α): false positive. Type II (β): false negative. Power = 1 − β; target 0.8.",
                    'Pick the test by question type — t-test for means, chi-squared for categorical, ANOVA for >2 groups.',
                    'In Python: scipy.stats covers t-test, chi-squared, ANOVA in one line each.',
                    "Always report a confidence interval alongside the p-value. Practical significance > statistical significance."
                ]}
            />
        </>
    )
}

// ─── Tableau ─ Chapter 2: LOD Expressions ────────────────────────────────────

const tableauLod: TutorialChapter = {
    slug: 'tableau/lod-expressions',
    topic: 'Tableau',
    topicSlug: 'tableau',
    chapter: 'Chapter 2',
    title: 'Tableau LOD Expressions',
    description: 'Master FIXED, INCLUDE, and EXCLUDE — the most-asked Tableau interview topic and the key to advanced calculated fields.',
    readMin: 14,
    tags: ['Tableau', 'LOD', 'Calculations'],
    prev: { slug: 'tableau/tableau-intro', title: 'Tableau Intro & First Dashboard' },
    toc: [
        { id: 'why', label: 'Why LOD?' },
        { id: 'fixed', label: 'FIXED — pin a granularity' },
        { id: 'include', label: 'INCLUDE — add detail' },
        { id: 'exclude', label: 'EXCLUDE — coarser detail' },
        { id: 'order', label: 'Filters & order of operations' },
        { id: 'patterns', label: 'Real-world patterns' }
    ],
    content: (
        <>
            <P>
                Level of Detail (LOD) expressions let you compute aggregates at a different grain than the view. They're Tableau's superpower —
                and the topic interviewers ask about most. Once you understand <Code>{`{ FIXED }`}</Code>, the rest follows.
            </P>

            <H2 id="why">Why LOD?</H2>
            <P>By default, Tableau aggregates to the view's level. If your view shows revenue per region, every measure on the canvas aggregates per region. LOD expressions let you escape that:</P>
            <UL>
                <LI><Strong>FIXED:</Strong> aggregate at <em>this fixed</em> level, ignoring the view.</LI>
                <LI><Strong>INCLUDE:</Strong> aggregate at view-level <em>plus</em> these extra dimensions.</LI>
                <LI><Strong>EXCLUDE:</Strong> aggregate at view-level <em>minus</em> these dimensions.</LI>
            </UL>

            <H2 id="fixed">FIXED — pin a granularity</H2>
            <CodeBlock
                language="text"
                title="Tableau · calc"
                code={`// Total sales per region — regardless of what's on the view
{ FIXED [Region] : SUM([Sales]) }

// Each customer's lifetime spend, even when viewing by month
{ FIXED [Customer] : SUM([Sales]) }

// First-order date per customer — useful for cohort analysis
{ FIXED [Customer] : MIN([Order Date]) }`}
            />
            <P>Example: show each customer's order alongside their total lifetime spend, even on a view broken down by month:</P>
            <CodeBlock
                language="text"
                code={`[Order Total]              // Sum of this row
{ FIXED [Customer] : SUM([Sales]) }     // Sum across ALL rows for that customer

[% of LTV] = [Order Total] / { FIXED [Customer] : SUM([Sales]) }`}
            />

            <H2 id="include">INCLUDE — add detail</H2>
            <P>Computes at a finer grain than the view, then aggregates back up.</P>
            <CodeBlock
                language="text"
                code={`// Average customer spend per region
// Without INCLUDE: SUM(Sales) / DISTINCT(Customers) — accurate but ugly
// With INCLUDE: aggregates per customer first, then averages those

{ INCLUDE [Customer] : SUM([Sales]) }

// Wrap with AVG to get average per customer — even on a region view
AVG({ INCLUDE [Customer] : SUM([Sales]) })`}
            />

            <H2 id="exclude">EXCLUDE — coarser detail</H2>
            <CodeBlock
                language="text"
                code={`// On a view showing region × month, get the year total ignoring month
{ EXCLUDE [Order Date].[Month] : SUM([Sales]) }

// Region's share of grand total — independent of region filter
SUM([Sales]) / { EXCLUDE [Region] : SUM([Sales]) }`}
            />

            <H2 id="order">Filters &amp; order of operations</H2>
            <P>This is the part that confuses everyone. Tableau filters apply in this order:</P>
            <Table
                headers={['Step', 'What runs']}
                rows={[
                    ['1', 'Extract filters'],
                    ['2', 'Data source filters'],
                    ['3', 'Context filters'],
                    ['4', 'FIXED LODs'],
                    ['5', 'Dimension filters'],
                    ['6', 'INCLUDE / EXCLUDE LODs'],
                    ['7', 'Measure filters']
                ]}
            />
            <Callout kind="warning">
                <Strong>FIXED LODs ignore dimension filters.</Strong> If you want a FIXED to respect a filter, right-click that filter → "Add to
                Context". Then it becomes a context filter (step 3) and applies before the LOD.
            </Callout>

            <H2 id="patterns">Real-world patterns</H2>
            <H3>1. % of total — even with filters</H3>
            <CodeBlock
                language="text"
                code={`SUM([Sales]) / { FIXED : SUM([Sales]) }   // share of grand total`}
            />
            <H3>2. New vs returning customers</H3>
            <CodeBlock
                language="text"
                code={`// Boolean — was this their first order?
[Order Date] = { FIXED [Customer] : MIN([Order Date]) }`}
            />
            <H3>3. Cohort analysis — customer's first month bucket</H3>
            <CodeBlock
                language="text"
                code={`DATETRUNC('month', { FIXED [Customer] : MIN([Order Date]) })`}
            />
            <H3>4. Average daily revenue per region</H3>
            <CodeBlock
                language="text"
                code={`AVG({ INCLUDE [Order Date] : SUM([Sales]) })`}
            />

            <Takeaways
                items={[
                    'FIXED ignores the view; INCLUDE adds finer grain; EXCLUDE removes a dimension.',
                    'FIXED runs before dimension filters — use Context filters to influence it.',
                    "FIXED [Customer]: MIN([Order Date]) is the canonical 'first-order date' pattern.",
                    "Wrap an INCLUDE in AVG/SUM/etc. to aggregate the per-row results.",
                    'When in doubt: write the FIXED first, then layer INCLUDE/EXCLUDE if needed.'
                ]}
            />
        </>
    )
}

// ─── Power BI ─ Chapter 3: Power Query Deep Dive ─────────────────────────────

const powerbiPowerQuery: TutorialChapter = {
    slug: 'power-bi/power-query-deep-dive',
    topic: 'Power BI',
    topicSlug: 'power-bi',
    chapter: 'Chapter 3',
    title: 'Power Query Deep Dive',
    description: 'Connect, clean, and reshape data with Power Query — the M language, common transformations, parameters, and refresh-friendly patterns.',
    readMin: 17,
    tags: ['Power BI', 'Power Query', 'M Language', 'ETL'],
    prev: { slug: 'power-bi/power-bi-dax', title: 'Introduction to DAX' },
    next: { slug: 'power-bi/time-intelligence', title: 'Time Intelligence in DAX' },
    toc: [
        { id: 'why', label: 'Why Power Query?' },
        { id: 'editor', label: 'The editor tour' },
        { id: 'transforms', label: 'Common transformations' },
        { id: 'm-language', label: 'A taste of the M language' },
        { id: 'merge-append', label: 'Merge & Append queries' },
        { id: 'parameters', label: 'Parameters & functions' },
        { id: 'best', label: 'Refresh-friendly patterns' }
    ],
    content: (
        <>
            <P>
                Power Query is the ETL layer underneath Power BI, Excel, and Microsoft Fabric. Every Power BI dataset starts here — and almost
                every dashboard performance problem can be traced back to bad Power Query habits. This chapter is the deep dive most learners
                skip and later regret.
            </P>

            <H2 id="why">Why Power Query?</H2>
            <UL>
                <LI><Strong>Repeatable.</Strong> Steps are recorded as code. Refresh re-runs them; new rows flow through automatically.</LI>
                <LI><Strong>Visual.</Strong> 90% of common transformations are point-and-click — no need to learn M for daily work.</LI>
                <LI><Strong>Connector-rich.</Strong> 100+ connectors. SQL, REST APIs, SharePoint, Salesforce, Excel, JSON, all behave the same way once loaded.</LI>
                <LI><Strong>Push-down friendly.</Strong> When connected to a database, Power Query pushes filters and joins back as native SQL — fast, even on huge tables.</LI>
            </UL>

            <H2 id="editor">The editor tour</H2>
            <P>Click <Strong>Transform Data</Strong> on the Power BI ribbon to open the Power Query Editor. The four panes:</P>
            <UL>
                <LI><Strong>Queries pane</Strong> (left) — every query in the file.</LI>
                <LI><Strong>Preview grid</Strong> (centre) — first 1,000 rows of the current query.</LI>
                <LI><Strong>Query Settings</Strong> (right) — the <em>step list</em>. Click any step to time-travel.</LI>
                <LI><Strong>Formula bar</Strong> (top) — shows the M expression for the current step.</LI>
            </UL>

            <H2 id="transforms">Common transformations</H2>
            <Table
                headers={['Action', 'Where to click']}
                rows={[
                    ['Promote first row to headers', 'Home → Use First Row as Headers'],
                    ['Change column type', 'right-click column → Change Type'],
                    ['Remove rows', 'Home → Remove Rows → Remove Top Rows'],
                    ['Remove duplicates', 'Home → Remove Rows → Remove Duplicates'],
                    ['Filter rows', 'click the dropdown on the column header'],
                    ['Replace values', 'right-click column → Replace Values'],
                    ['Pivot / Unpivot', 'Transform → Pivot Column / Unpivot'],
                    ['Split column', 'right-click column → Split Column']
                ]}
            />
            <Callout kind="tip">
                <Strong>Always set column types early.</Strong> Auto-detection works most of the time, but explicit types make refresh more
                predictable and prevent locale surprises ("12/05/26" parsed as month-day in the US, day-month elsewhere).
            </Callout>

            <H2 id="m-language">A taste of the M language</H2>
            <P>Behind the visual editor, every step is a line of M. Reading it is enough; you rarely need to write it from scratch.</P>
            <CodeBlock
                language="text"
                title="M · sales.csv pipeline"
                code={`let
    Source = Csv.Document(File.Contents("C:\\data\\sales.csv"), [Delimiter=","]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"OrderID",   Int64.Type},
        {"OrderDate", type date},
        {"Revenue",   type number}
    }),
    FilteredRows = Table.SelectRows(ChangedTypes, each [Revenue] > 0),
    AddedMonth = Table.AddColumn(
        FilteredRows,
        "Month",
        each Date.MonthName([OrderDate])
    )
in
    AddedMonth`}
            />
            <Callout kind="info">
                M is <em>case-sensitive</em>. <Code>Table.SelectRows</Code> works; <Code>table.SelectRows</Code> errors. Function names follow
                <Code>Type.Method</Code> casing.
            </Callout>

            <H2 id="merge-append">Merge &amp; Append queries</H2>
            <UL>
                <LI><Strong>Append</Strong> — stack two tables vertically (same columns). Like SQL <Code>UNION ALL</Code>.</LI>
                <LI><Strong>Merge</Strong> — join two tables on a key. Like SQL <Code>JOIN</Code>. Choose the join kind: Inner, Left Outer, Right Outer, Full Outer, Anti.</LI>
            </UL>
            <CodeBlock
                language="text"
                title="merge in M"
                code={`Merged = Table.NestedJoin(
    Sales,        {"CustomerID"},
    Customers,    {"CustomerID"},
    "CustomerInfo",
    JoinKind.LeftOuter
)`}
            />

            <H2 id="parameters">Parameters &amp; functions</H2>
            <P>Parameters let you swap values at refresh time — e.g., switch from a dev database to prod without editing the query.</P>
            <UL>
                <LI><Strong>Manage Parameters → New Parameter</Strong> — define a typed parameter (text, date, etc.) with a default.</LI>
                <LI>Reference the parameter in any step instead of a hard-coded value.</LI>
                <LI>Convert a query to a function (right-click → Create Function) to apply it across many files.</LI>
            </UL>

            <H2 id="best">Refresh-friendly patterns</H2>
            <UL>
                <LI><Strong>Disable load on staging queries.</Strong> If a query is just an intermediate step (e.g., a lookup), right-click → Disable Load. Saves memory.</LI>
                <LI><Strong>Filter early.</Strong> Push <Code>Table.SelectRows</Code> as close to the source as possible — Power Query may push it down to SQL.</LI>
                <LI><Strong>Avoid wide unpivots in fact tables.</Strong> Reshape in the warehouse if you can; do it in PQ only if you must.</LI>
                <LI><Strong>Don't use Excel as a source for production reports.</Strong> Switch to a database or dataflow once the analysis is real.</LI>
            </UL>

            <Takeaways
                items={[
                    "Power Query is the ETL layer — visual on top, M language underneath, push-down friendly.",
                    "Set column types early; auto-detect doesn't survive locale changes.",
                    'M is case-sensitive: Table.SelectRows works, table.SelectRows errors.',
                    'Append = UNION ALL; Merge = JOIN with all the join-kind variants.',
                    'Parameters & functions make queries reusable across files & environments.',
                    'Filter early; disable load on staging queries; avoid Excel as a long-term source.'
                ]}
            />
        </>
    )
}

// ─── Power BI ─ Chapter 4: Time Intelligence in DAX ───────────────────────────

const powerbiTimeIntelligence: TutorialChapter = {
    slug: 'power-bi/time-intelligence',
    topic: 'Power BI',
    topicSlug: 'power-bi',
    chapter: 'Chapter 4',
    title: 'Time Intelligence in DAX',
    description: 'YTD, MTD, Same-Period-Last-Year, rolling averages, and the Date table that makes them all work — the recipes analysts ship daily.',
    readMin: 16,
    tags: ['Power BI', 'DAX', 'Time Intelligence'],
    prev: { slug: 'power-bi/power-query-deep-dive', title: 'Power Query Deep Dive' },
    toc: [
        { id: 'date-table', label: 'You need a Date table' },
        { id: 'ytd', label: 'YTD, MTD, QTD' },
        { id: 'comparison', label: 'Year-over-Year & Period-over-Period' },
        { id: 'rolling', label: 'Rolling averages' },
        { id: 'fiscal', label: 'Fiscal calendars' },
        { id: 'patterns', label: 'Production patterns' }
    ],
    content: (
        <>
            <P>
                Time intelligence is the part of DAX that answers business questions: <em>How are we doing this year?</em> <em>vs last year?</em>{' '}
                <em>What's the 30-day moving average?</em> All these formulas rely on one thing — a properly set-up <Strong>Date table</Strong>.
            </P>

            <H2 id="date-table">You need a Date table</H2>
            <P>A Date table is a separate dimension with one row per calendar date in your data range. It must:</P>
            <UL>
                <LI>Have a <Strong>contiguous</Strong> date range — no gaps, even for weekends.</LI>
                <LI>Be marked as a Date table (<em>Model view → right-click → Mark as date table</em>).</LI>
                <LI>Be related to your fact table on the date column.</LI>
            </UL>
            <CodeBlock
                language="text"
                title="DAX · build a date table"
                code={`Date =
ADDCOLUMNS(
    CALENDAR(DATE(2022, 1, 1), DATE(2027, 12, 31)),
    "Year",     YEAR([Date]),
    "Quarter",  "Q" & FORMAT([Date], "Q"),
    "Month",    FORMAT([Date], "MMMM"),
    "Month No", MONTH([Date]),
    "Year-Mo",  FORMAT([Date], "YYYY-MM"),
    "Weekday",  FORMAT([Date], "dddd"),
    "Is WE",    WEEKDAY([Date], 2) > 5
)`}
            />

            <H2 id="ytd">YTD, MTD, QTD</H2>
            <CodeBlock
                language="text"
                code={`Sales YTD = TOTALYTD([Total Sales], 'Date'[Date])
Sales MTD = TOTALMTD([Total Sales], 'Date'[Date])
Sales QTD = TOTALQTD([Total Sales], 'Date'[Date])

-- Need a fiscal-year YTD ending in March?
Sales FY YTD =
TOTALYTD([Total Sales], 'Date'[Date], "31/03")`}
            />

            <H2 id="comparison">Year-over-Year &amp; Period-over-Period</H2>
            <CodeBlock
                language="text"
                code={`-- Same period, one year ago
Sales LY =
CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

-- Year-over-Year %
YoY % =
DIVIDE([Total Sales] - [Sales LY], [Sales LY])

-- Same period, one quarter ago
Sales QoQ =
CALCULATE(
    [Total Sales],
    PARALLELPERIOD('Date'[Date], -1, QUARTER)
)

-- Same period, one month ago
Sales MoM =
CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH))`}
            />

            <H2 id="rolling">Rolling averages</H2>
            <CodeBlock
                language="text"
                code={`-- Last 7 days rolling sum
Sales 7D =
CALCULATE(
    [Total Sales],
    DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -7, DAY)
)

-- 7-day rolling average
Sales 7D Avg = DIVIDE([Sales 7D], 7)

-- Trailing 12 months — common executive KPI
Sales TTM =
CALCULATE(
    [Total Sales],
    DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -12, MONTH)
)`}
            />
            <Callout kind="tip">
                For rolling windows, use <Code>DATESINPERIOD</Code> rather than <Code>DATESBETWEEN</Code> — it's anchored to the latest date in
                the filter context, so the window slides automatically.
            </Callout>

            <H2 id="fiscal">Fiscal calendars</H2>
            <P>If your fiscal year doesn't start in January, add a "fiscal year" column to your Date table:</P>
            <CodeBlock
                language="text"
                code={`-- Indian FY (April-March)
"Fiscal Year" =
IF(MONTH([Date]) >= 4,
   YEAR([Date]),
   YEAR([Date]) - 1)`}
            />
            <P>Then most "regular" measures work — just slice by Fiscal Year instead of Year.</P>

            <H2 id="patterns">Production patterns</H2>
            <H3>1. The compact KPI tile</H3>
            <CodeBlock
                language="text"
                code={`Revenue =     [Total Sales]
Δ vs LY =     DIVIDE([Total Sales] - [Sales LY], [Sales LY])
Trend =
SWITCH(TRUE(),
    [Δ vs LY] >  0.05, "▲",
    [Δ vs LY] < -0.05, "▼",
    "▶"
)`}
            />

            <H3>2. Smart % change formatting</H3>
            <CodeBlock
                language="text"
                code={`-- Show "—" when there's no comparison period
YoY % =
VAR LY = [Sales LY]
RETURN
    IF(ISBLANK(LY) || LY = 0, BLANK(),
       DIVIDE([Total Sales] - LY, LY))`}
            />

            <Takeaways
                items={[
                    'A proper Date table (contiguous, marked) is the foundation of all time intelligence.',
                    'TOTALYTD / TOTALMTD / TOTALQTD handle period-to-date with one function each.',
                    'SAMEPERIODLASTYEAR / DATEADD / PARALLELPERIOD cover all comparison patterns.',
                    'DATESINPERIOD beats DATESBETWEEN for rolling windows — it slides automatically.',
                    'Wrap with VAR + ISBLANK to handle missing comparison periods elegantly.'
                ]}
            />
        </>
    )
}

// ─── Excel ─ Chapter 3: Power Query in Excel ─────────────────────────────────

const excelPowerQuery: TutorialChapter = {
    slug: 'excel/power-query-in-excel',
    topic: 'Excel',
    topicSlug: 'excel',
    chapter: 'Chapter 3',
    title: 'Power Query in Excel',
    description: 'Use Power Query inside Excel to clean and combine messy data — connect, transform, and refresh without VBA.',
    readMin: 15,
    tags: ['Excel', 'Power Query', 'ETL'],
    prev: { slug: 'excel/excel-pivot-tables', title: 'Excel Pivot Tables' },
    next: { slug: 'excel/charts-and-dashboards', title: 'Charts & Dashboards' },
    toc: [
        { id: 'why', label: 'Why Power Query in Excel?' },
        { id: 'launch', label: 'Launching the editor' },
        { id: 'cleanup', label: 'Cleaning a messy file' },
        { id: 'combine', label: 'Combine files in a folder' },
        { id: 'unpivot', label: 'Unpivot wide reports' },
        { id: 'refresh', label: 'Refresh & connections' }
    ],
    content: (
        <>
            <P>
                Power Query in Excel is the same engine that lives in Power BI. Most analysts using Excel for the past 10 years have never opened
                it — and it would have saved them thousands of hours. This chapter is the catch-up.
            </P>

            <H2 id="why">Why Power Query in Excel?</H2>
            <UL>
                <LI><Strong>Repeatable cleanup.</Strong> Record once, refresh forever. New file? Drop it in the same folder and click Refresh.</LI>
                <LI><Strong>No VBA.</Strong> Replaces 80% of the macro recordings analysts inherit but don't understand.</LI>
                <LI><Strong>Same skills as Power BI.</Strong> Everything you learn here transfers to Power BI Desktop one-for-one.</LI>
            </UL>

            <H2 id="launch">Launching the editor</H2>
            <P>From a blank workbook: <Strong>Data → Get Data</Strong> → pick your source. From a Table: <Strong>Data → From Table/Range</Strong>.</P>
            <P>The editor opens in its own window. The same four panes as Power BI: Queries (left), Preview grid (centre), Applied Steps (right), Formula bar (top).</P>

            <H2 id="cleanup">Cleaning a messy file</H2>
            <P>The classic scenario: someone sent a "monthly report" Excel file with a logo image, a merged title row, blank rows between sections, and totals at the bottom. Here's the recipe:</P>
            <UL>
                <LI><Strong>Home → Remove Rows → Remove Top Rows</Strong> — strip the title.</LI>
                <LI><Strong>Home → Use First Row as Headers</Strong> — promote the proper header row.</LI>
                <LI><Strong>Right-click "Total" column header → Remove Rows → Remove Bottom Rows</Strong>.</LI>
                <LI><Strong>Filter the column for "(blank)"</Strong> → uncheck → drops the section dividers.</LI>
                <LI><Strong>Right-click columns → Change Type</Strong> for date and number columns.</LI>
                <LI><Strong>Home → Close &amp; Load</Strong> → drops the cleaned data into a new sheet as a Table.</LI>
            </UL>
            <Callout kind="tip">
                Click any step in the Applied Steps panel to time-travel back to that point. Made a mistake? Delete the step instead of starting
                over.
            </Callout>

            <H2 id="combine">Combine files in a folder</H2>
            <P>The single most-loved Power Query feature. You have 12 monthly Excel files with the same structure — combine them in one click.</P>
            <UL>
                <LI><Strong>Data → Get Data → From File → From Folder</Strong> — point to the folder.</LI>
                <LI>Click <Strong>Combine &amp; Transform Data</Strong>. Power Query auto-builds a function that processes one file, then maps it across all files.</LI>
                <LI>The result is one big Table that auto-refreshes when you drop new files into the folder.</LI>
            </UL>

            <H2 id="unpivot">Unpivot wide reports</H2>
            <P>Source data often arrives "wide" — months as columns. For analysis, you want it "tall" — one row per (entity, month, value). Power Query does this in three clicks.</P>
            <CodeBlock
                language="text"
                title="before — wide"
                showLines={false}
                code={`Region   Jan   Feb   Mar   Apr
North    100   120   140   180
South     80    90   110   130`}
            />
            <P>Select the "Region" column → <Strong>Transform → Unpivot Other Columns</Strong>:</P>
            <CodeBlock
                language="text"
                title="after — tall"
                showLines={false}
                code={`Region   Attribute   Value
North    Jan         100
North    Feb         120
North    Mar         140
North    Apr         180
South    Jan          80
South    Feb          90
...`}
            />

            <H2 id="refresh">Refresh &amp; connections</H2>
            <UL>
                <LI><Strong>Refresh All</Strong> (Ctrl + Alt + F5) — re-runs every query in the workbook.</LI>
                <LI><Strong>Data → Queries &amp; Connections</Strong> — see every query, edit it, or refresh individually.</LI>
                <LI><Strong>Right-click query → Properties</Strong> — set "Refresh every N minutes" or "Refresh on file open".</LI>
            </UL>

            <Takeaways
                items={[
                    "Power Query in Excel is the same engine as Power BI — skills are 100% transferable.",
                    'Replaces 80% of macros for cleaning/combining files. No VBA needed.',
                    'Combine Files from Folder is the killer feature — drop new files, click refresh.',
                    'Unpivot Other Columns turns wide reports into analysis-ready tall data.',
                    "Click any step in Applied Steps to time-travel — never start over from scratch."
                ]}
            />
        </>
    )
}

// ─── Excel ─ Chapter 4: Charts & Dashboards ──────────────────────────────────

const excelCharts: TutorialChapter = {
    slug: 'excel/charts-and-dashboards',
    topic: 'Excel',
    topicSlug: 'excel',
    chapter: 'Chapter 4',
    title: 'Excel Charts & Dashboards',
    description: 'Build executive-grade Excel charts and dashboards — chart selection, formatting, slicers, and the layout patterns analysts ship.',
    readMin: 14,
    tags: ['Excel', 'Charts', 'Dashboards'],
    prev: { slug: 'excel/power-query-in-excel', title: 'Power Query in Excel' },
    toc: [
        { id: 'pick', label: 'Picking the right chart' },
        { id: 'format', label: 'Formatting that works' },
        { id: 'pivotcharts', label: 'PivotCharts' },
        { id: 'slicers', label: 'Slicers & timelines' },
        { id: 'layout', label: 'Dashboard layout' },
        { id: 'sparklines', label: 'Sparklines & in-cell charts' }
    ],
    content: (
        <>
            <P>
                Excel charts are still the most-shared piece of analyst output. Most charts on real-world dashboards are bad — over-decorated,
                under-labelled, wrongly chosen. This chapter is the opinionated guide to making yours good.
            </P>

            <H2 id="pick">Picking the right chart</H2>
            <Table
                headers={['Question', 'Chart']}
                rows={[
                    ['Compare values across categories', 'Bar / column'],
                    ['Show a trend over time', 'Line'],
                    ['Show parts of a whole', 'Stacked bar (avoid pie)'],
                    ['Compare two metrics across categories', 'Clustered bar'],
                    ['Highlight one number among many', 'Bar with one coloured'],
                    ['Show distribution', 'Histogram / box plot'],
                    ['Show correlation', 'Scatter plot'],
                    ['Show one big number', 'Card / KPI tile (just text)']
                ]}
            />
            <Callout kind="warning">
                Pie charts work for at most 2 slices. Three or more, switch to a horizontal bar — humans are bad at comparing angles. Donut charts
                are pies in disguise; same problem.
            </Callout>

            <H2 id="format">Formatting that works</H2>
            <UL>
                <LI><Strong>Remove chart junk.</Strong> Delete legend if obvious; remove gridlines on bars; thin the axes.</LI>
                <LI><Strong>One accent colour, neutral rest.</Strong> Highlight the bar that matters; grey out the others.</LI>
                <LI><Strong>Sort bars by value.</Strong> Default alphabetical sort is almost never what you want.</LI>
                <LI><Strong>Direct-label important values.</Strong> Put numbers next to the bar; remove the y-axis if the labels do the job.</LI>
                <LI><Strong>Title is a sentence, not a label.</Strong> "Q1 revenue grew 12% YoY" beats "Revenue by Quarter".</LI>
            </UL>

            <H2 id="pivotcharts">PivotCharts</H2>
            <P>Build a pivot table first, then click <Strong>PivotTable Analyze → PivotChart</Strong>. The chart stays linked — add a row to the pivot, the chart updates.</P>
            <UL>
                <LI>Drill in: double-click any data point to open the underlying rows.</LI>
                <LI>Hide field buttons on the chart (right-click → Hide All Field Buttons) — they look messy on dashboards.</LI>
            </UL>

            <H2 id="slicers">Slicers &amp; timelines</H2>
            <P>One slicer can drive multiple charts. <Strong>Slicer → Report Connections</Strong> → tick every PivotTable / PivotChart it should filter.</P>
            <UL>
                <LI><Strong>Slicer:</Strong> for any categorical field — region, product, segment.</LI>
                <LI><Strong>Timeline:</Strong> only for date fields — slide-through filtering by month/quarter/year.</LI>
            </UL>

            <H2 id="layout">Dashboard layout</H2>
            <UL>
                <LI><Strong>Header row:</Strong> 4-6 KPI tiles. Big number, small label, single colour for direction (red/green sparingly).</LI>
                <LI><Strong>Main panel:</Strong> 1-2 large charts that tell the headline story.</LI>
                <LI><Strong>Side panel:</Strong> 3-4 smaller breakdowns (by category, geography, segment).</LI>
                <LI><Strong>Filter bar:</Strong> place slicers / timelines at the top — users find them faster.</LI>
                <LI><Strong>Same chart type on the same row.</Strong> Visual rhythm reduces cognitive load.</LI>
            </UL>
            <Callout kind="tip">
                Set sheet view to <Strong>Page Layout</Strong> while designing. It shows page breaks and prevents the dreaded "exports to 12
                pages" surprise.
            </Callout>

            <H2 id="sparklines">Sparklines &amp; in-cell charts</H2>
            <P>Tiny charts inside a single cell — perfect for tables where each row needs a trend.</P>
            <UL>
                <LI><Strong>Insert → Sparklines → Line / Column / Win-Loss</Strong>.</LI>
                <LI>Select the data range and the location range (one cell per row).</LI>
                <LI>Use <Strong>Sparkline → High Point / Low Point</Strong> markers for instant readability.</LI>
            </UL>
            <CodeBlock
                language="text"
                title="In-cell bar with REPT()"
                showLines={false}
                code={`=REPT("█", ROUND(B2 / MAX($B$2:$B$10) * 20, 0))   // bar of length 0-20`}
            />

            <Takeaways
                items={[
                    'Choose the chart by question; never use a pie for more than 2 slices.',
                    'Strip chart junk. One accent colour, sort by value, direct-label important points.',
                    'Make the title a sentence — "Q1 revenue grew 12% YoY", not "Revenue by Quarter".',
                    'PivotCharts stay linked to their pivot — refresh the pivot, the chart follows.',
                    'Slicers + timelines connect to multiple visuals via Report Connections.',
                    'Use sparklines for trend per row — tiny but effective.'
                ]}
            />
        </>
    )
}

// ─── Tableau ─ Chapter 3: Calculated Fields & Table Calcs ────────────────────

const tableauCalcs: TutorialChapter = {
    slug: 'tableau/calculated-fields-and-table-calcs',
    topic: 'Tableau',
    topicSlug: 'tableau',
    chapter: 'Chapter 3',
    title: 'Calculated Fields & Table Calculations',
    description: 'Master row-level vs aggregate calcs, IF/CASE logic, and table calculations — running totals, % of total, rank, and moving averages.',
    readMin: 14,
    tags: ['Tableau', 'Calculations', 'Table Calcs'],
    prev: { slug: 'tableau/lod-expressions', title: 'LOD Expressions' },
    next: { slug: 'tableau/dashboard-design', title: 'Dashboard Design' },
    toc: [
        { id: 'kinds', label: 'Three kinds of calculations' },
        { id: 'row', label: 'Row-level calculations' },
        { id: 'agg', label: 'Aggregate calculations' },
        { id: 'logic', label: 'IF / CASE / SWITCH' },
        { id: 'table-calcs', label: 'Table calculations' },
        { id: 'recipes', label: 'Recipes you\'ll reuse' }
    ],
    content: (
        <>
            <P>
                Tableau has three flavours of calculation: row-level, aggregate, and table calculations. Each runs at a different stage of the
                pipeline. Knowing which to reach for is the difference between code that works and code that mysteriously gives wrong totals.
            </P>

            <H2 id="kinds">Three kinds of calculations</H2>
            <Table
                headers={['Kind', 'Runs', 'Example']}
                rows={[
                    ['Row-level', 'on every row of the source data', '[Profit] / [Sales]'],
                    ['Aggregate', 'on the aggregated result in the view', 'SUM([Profit]) / SUM([Sales])'],
                    ['Table calc', 'on the visible table in the view', 'WINDOW_SUM(SUM([Sales]))']
                ]}
            />
            <Callout kind="warning">
                Row-level <Code>[Profit]/[Sales]</Code> followed by <Code>SUM</Code> ≠ aggregate <Code>SUM(Profit)/SUM(Sales)</Code>. The first
                averages percentages (wrong); the second computes margin from totals (right). Always pick aggregate for ratios.
            </Callout>

            <H2 id="row">Row-level calculations</H2>
            <CodeBlock
                language="text"
                code={`// Date math
DATEDIFF('day', [Order Date], [Ship Date])

// Concat strings
[First Name] + " " + [Last Name]

// Boolean flag
[Region] = "South" AND [Discount] > 0`}
            />

            <H2 id="agg">Aggregate calculations</H2>
            <CodeBlock
                language="text"
                code={`// Profit margin — correct
SUM([Profit]) / SUM([Sales])

// Average order value
SUM([Sales]) / COUNTD([Order ID])

// Conditional aggregate
SUM(IF [Status] = "Paid" THEN [Sales] END)`}
            />
            <Callout kind="tip">
                <Code>SUM(IF condition THEN value END)</Code> is Tableau's equivalent of SQL's <Code>SUM(CASE WHEN ... THEN ... END)</Code>.
                Indispensable for "paid revenue", "premium-tier count", etc.
            </Callout>

            <H2 id="logic">IF / CASE / SWITCH</H2>
            <CodeBlock
                language="text"
                code={`// IF / ELSEIF
IF [Sales] > 1000 THEN "High"
ELSEIF [Sales] > 500 THEN "Mid"
ELSE "Low"
END

// CASE — best for equality on a single field
CASE [Region]
    WHEN "North" THEN 1
    WHEN "South" THEN 2
    WHEN "East"  THEN 3
    ELSE 9
END

// IIF for short ternaries
IIF([Profit] >= 0, "Positive", "Loss")`}
            />

            <H2 id="table-calcs">Table calculations</H2>
            <P>Run on the rows visible in the view. The most-used:</P>
            <Table
                headers={['Function', 'What it does']}
                rows={[
                    ['RUNNING_SUM(expr)', 'cumulative total'],
                    ['WINDOW_SUM(expr, start, end)', 'sliding-window sum'],
                    ['WINDOW_AVG(expr)', 'mean across the window'],
                    ['LOOKUP(expr, offset)', 'previous / next value'],
                    ['INDEX() / FIRST() / LAST()', 'position helpers'],
                    ['RANK() / RANK_DENSE()', 'rank within the partition']
                ]}
            />
            <CodeBlock
                language="text"
                code={`// Running total
RUNNING_SUM(SUM([Sales]))

// % of total — across the view
SUM([Sales]) / TOTAL(SUM([Sales]))

// 7-day moving average
WINDOW_AVG(SUM([Sales]), -6, 0)

// Difference from previous month
SUM([Sales]) - LOOKUP(SUM([Sales]), -1)`}
            />
            <Callout kind="info">
                Table calcs depend on the <Strong>direction</Strong> they compute along. Right-click the field → <em>Compute Using</em> → pick
                the dimension. "Table (Across)", "Pane (Down)", or a specific field.
            </Callout>

            <H2 id="recipes">Recipes you'll reuse</H2>
            <H3>1. % difference from prior period</H3>
            <CodeBlock
                language="text"
                code={`(SUM([Sales]) - LOOKUP(SUM([Sales]), -1)) / LOOKUP(SUM([Sales]), -1)`}
            />
            <H3>2. Rank with ties broken</H3>
            <CodeBlock
                language="text"
                code={`RANK_UNIQUE(SUM([Sales]))   // each row gets a unique rank`}
            />
            <H3>3. Top-N filter that respects the view</H3>
            <CodeBlock
                language="text"
                code={`// Use a parameter for N, then filter on this calc
INDEX() <= [Top N parameter]`}
            />

            <Takeaways
                items={[
                    'Row-level runs per source row; aggregate runs after grouping; table calcs run on the view.',
                    'Use SUM(IF condition THEN x END) for conditional aggregates — like SQL CASE.',
                    'Reach for table calcs (RUNNING_SUM, WINDOW_AVG, LOOKUP) for view-relative metrics.',
                    'Compute Using direction matters — right-click → Compute Using → pick the dimension.',
                    'Average of percentages != percentage of totals. Compute ratios at the aggregate level.'
                ]}
            />
        </>
    )
}

// ─── Tableau ─ Chapter 4: Dashboard Design ───────────────────────────────────

const tableauDashboard: TutorialChapter = {
    slug: 'tableau/dashboard-design',
    topic: 'Tableau',
    topicSlug: 'tableau',
    chapter: 'Chapter 4',
    title: 'Tableau Dashboard Design',
    description: 'Layout containers, sizing modes, actions, parameter swaps, mobile layouts — the design patterns behind dashboards that get used.',
    readMin: 14,
    tags: ['Tableau', 'Dashboards', 'Design'],
    prev: { slug: 'tableau/calculated-fields-and-table-calcs', title: 'Calculated Fields & Table Calculations' },
    toc: [
        { id: 'why', label: 'What makes a dashboard get used?' },
        { id: 'sizing', label: 'Sizing & device layouts' },
        { id: 'containers', label: 'Layout containers' },
        { id: 'actions', label: 'Filter, highlight, navigation actions' },
        { id: 'parameters', label: 'Parameters for what-if' },
        { id: 'polish', label: 'Polish checklist' }
    ],
    content: (
        <>
            <P>
                A dashboard people actually use is rare. Most fall into one of two traps: too dense (a wall of charts no one reads) or too pretty
                (slow, infographic-style). The middle path is what this chapter teaches.
            </P>

            <H2 id="why">What makes a dashboard get used?</H2>
            <UL>
                <LI><Strong>One job.</Strong> Every dashboard answers one primary question. If you can't state it in one sentence, split into two.</LI>
                <LI><Strong>Top-down hierarchy.</Strong> KPIs at the top, breakdowns below, detail at the bottom — the inverted pyramid.</LI>
                <LI><Strong>Filterable by the things stakeholders care about.</Strong> Region, time, segment.</LI>
                <LI><Strong>Loads in &lt; 10 seconds.</Strong> Speed is a feature; people abandon slow dashboards quickly.</LI>
            </UL>

            <H2 id="sizing">Sizing &amp; device layouts</H2>
            <Table
                headers={['Mode', 'When to use']}
                rows={[
                    ['Fixed size', 'consistent rendering across screens — most boardroom reports'],
                    ['Automatic', 'fills the browser window — exploratory dashboards'],
                    ['Range', 'fixes minimums but allows growth — most middle-of-the-road reports']
                ]}
            />
            <P>Once your desktop layout works, click <Strong>Device Preview</Strong> → add a <Strong>Tablet</Strong> and <Strong>Phone</Strong> layout. Drag-and-drop sheets to rearrange for the smaller screens.</P>

            <H2 id="containers">Layout containers</H2>
            <P>Containers are how Tableau dashboards stay aligned. Two flavours:</P>
            <UL>
                <LI><Strong>Horizontal container</Strong> — children are placed side by side.</LI>
                <LI><Strong>Vertical container</Strong> — children stack top to bottom.</LI>
            </UL>
            <P>Drop everything into containers from the start; resizing one sheet then ripples through the whole dashboard cleanly.</P>
            <Callout kind="tip">
                Hold <Code>Shift</Code> while dragging a sheet onto the canvas — Tableau places it inside the existing container instead of as a
                new floating element.
            </Callout>

            <H2 id="actions">Filter, highlight, navigation actions</H2>
            <UL>
                <LI><Strong>Filter action:</Strong> click a region in chart A → chart B filters to that region. The bread-and-butter interaction.</LI>
                <LI><Strong>Highlight action:</Strong> click a row in the table → the corresponding bar in the chart highlights without filtering others.</LI>
                <LI><Strong>Go to URL action:</Strong> click an order ID → opens that order in the order-management system.</LI>
                <LI><Strong>Go to Sheet:</Strong> click a customer → navigate to a customer-detail dashboard with that customer pre-filtered.</LI>
            </UL>
            <P><Strong>Dashboard → Actions</Strong> manages all four kinds.</P>

            <H2 id="parameters">Parameters for what-if</H2>
            <CodeBlock
                language="text"
                title="parameter-driven measure swap"
                code={`// Parameter: [Metric Choice] — string, allowable values "Revenue", "Profit", "Margin"

CASE [Metric Choice]
    WHEN "Revenue" THEN SUM([Sales])
    WHEN "Profit"  THEN SUM([Profit])
    WHEN "Margin"  THEN SUM([Profit]) / SUM([Sales])
END`}
            />
            <P>Drop the parameter on the dashboard via <Strong>Parameter → Show Parameter Control</Strong>. Now stakeholders can switch metrics without you rebuilding the dashboard.</P>

            <H2 id="polish">Polish checklist</H2>
            <UL>
                <LI>One title per dashboard, written as a sentence.</LI>
                <LI>One accent colour, used sparingly.</LI>
                <LI>Filters at the top — visible, labelled clearly.</LI>
                <LI>Tooltips upgraded with custom labels, not "SUM(Sales): 12345".</LI>
                <LI>Remove gridlines &amp; field buttons; thin the axes.</LI>
                <LI>Hide unused fields from the data pane (right-click → Hide).</LI>
                <LI>Test on the device your audience will actually use.</LI>
                <LI>Run <Strong>Performance Recording</Strong> if a viz takes more than ~3 seconds.</LI>
            </UL>

            <Takeaways
                items={[
                    'A good dashboard answers one question. Split it if you can\'t state the question in one sentence.',
                    'Build everything inside layout containers — they keep alignment after every resize.',
                    'Filter actions are the workhorse interaction; highlight and navigation cover the rest.',
                    'Parameters + CASE turn one chart into a metric-swap; stakeholders love it.',
                    "Speed is a feature. Use Performance Recording on anything slower than 3 seconds."
                ]}
            />
        </>
    )
}

// ─── Statistics ─ Chapter 4: Linear Regression ───────────────────────────────

const statsRegression: TutorialChapter = {
    slug: 'statistics/linear-regression',
    topic: 'Statistics',
    topicSlug: 'statistics',
    chapter: 'Chapter 4',
    title: 'Linear Regression',
    description: 'Simple & multiple linear regression — fitting a line, R², residuals, coefficients, and the assumptions you must check.',
    readMin: 16,
    tags: ['Statistics', 'Regression', 'Modelling'],
    prev: { slug: 'statistics/hypothesis-testing', title: 'Hypothesis Testing' },
    next: { slug: 'statistics/ab-testing', title: 'A/B Testing' },
    toc: [
        { id: 'why', label: 'What is regression?' },
        { id: 'simple', label: 'Simple linear regression' },
        { id: 'multiple', label: 'Multiple regression' },
        { id: 'metrics', label: 'R², MAE, RMSE' },
        { id: 'assumptions', label: 'The four assumptions' },
        { id: 'sklearn', label: 'In Python with scikit-learn' }
    ],
    content: (
        <>
            <P>
                Linear regression is the gateway model — most ML courses, every analyst's first model, the foundation of A/B testing analysis,
                price modelling, demand forecasting, and the "predicted next month sales" sheet your CFO sends you. Worth learning properly.
            </P>

            <H2 id="why">What is regression?</H2>
            <P>
                Regression is the family of methods that estimate the relationship between a <Strong>dependent variable</Strong> (y, what you
                want to predict) and one or more <Strong>independent variables</Strong> (x, the inputs).
            </P>
            <P>"Linear" means: we assume the relationship is well-approximated by a straight line — <Code>y = β₀ + β₁x + ε</Code>.</P>

            <H2 id="simple">Simple linear regression</H2>
            <CodeBlock
                language="python"
                code={`import numpy as np
import matplotlib.pyplot as plt

# Marketing spend (x) vs revenue (y) for 10 weeks
x = np.array([12, 18, 22, 30, 35, 40, 45, 55, 60, 70])
y = np.array([85, 95, 110, 130, 140, 145, 160, 180, 195, 220])

# Fit the line: y = β0 + β1 * x
slope, intercept = np.polyfit(x, y, 1)
print(f"y = {intercept:.1f} + {slope:.2f} * x")
# y = 60.4 + 2.27 * x

# Predict revenue at ₹50k spend
predicted = intercept + slope * 50
print(f"At ₹50k spend → ₹{predicted:.0f}k revenue")
# At ₹50k spend → ₹174k revenue`}
            />
            <P>Interpretation:</P>
            <UL>
                <LI><Strong>β₁ = 2.27</Strong> — for every ₹1k more spend, revenue rises by ₹2.27k.</LI>
                <LI><Strong>β₀ = 60.4</Strong> — predicted revenue at zero spend (intercept). Often not meaningful, just an anchor.</LI>
            </UL>

            <H2 id="multiple">Multiple regression</H2>
            <P>More than one input. <Code>y = β₀ + β₁x₁ + β₂x₂ + … + βₙxₙ + ε</Code>. Each coefficient now means "all else equal":</P>
            <CodeBlock
                language="python"
                code={`# House prices: depend on size (sqft) AND number of bedrooms
# Coefficients you might fit: β₁ = 1500, β₂ = 25000

# Interpretation:
#  - All else equal, every extra sqft adds ₹1,500 to the price
#  - All else equal, every extra bedroom adds ₹25,000

# "All else equal" is doing a lot of work — beware of correlated inputs!`}
            />

            <H2 id="metrics">R², MAE, RMSE</H2>
            <Table
                headers={['Metric', 'Formula', 'Reading']}
                rows={[
                    ['R²', '1 − SS_res / SS_tot', '0–1; share of variance the model explains'],
                    ['MAE', 'mean(|y − ŷ|)', 'avg error in same units as y'],
                    ['MSE', 'mean((y − ŷ)²)', 'penalises big errors'],
                    ['RMSE', '√MSE', 'same units as y; comparable to mean']
                ]}
            />
            <Callout kind="info">
                R² is intuitive but misleading on its own. A high R² doesn't mean the model is good — it just means it explains the variance in
                <em>this</em> dataset. Always validate on held-out data.
            </Callout>

            <H2 id="assumptions">The four assumptions</H2>
            <P>Linear regression has four classical assumptions. Violating them doesn't crash the model — it makes the coefficients and standard errors unreliable.</P>
            <UL>
                <LI><Strong>Linearity:</Strong> y is a linear function of x. Check with a scatter plot of residuals vs predictions — should look like a random cloud.</LI>
                <LI><Strong>Independence:</Strong> observations are independent of each other. Time series usually violate this.</LI>
                <LI><Strong>Homoscedasticity:</Strong> residual variance is constant across predictions. The "fan shape" in residual plots is the telltale violation.</LI>
                <LI><Strong>Normality of residuals:</Strong> for hypothesis tests on coefficients. Less critical for prediction.</LI>
            </UL>

            <H2 id="sklearn">In Python with scikit-learn</H2>
            <CodeBlock
                language="python"
                code={`from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import numpy as np

# Simulated: house price ~ 1500 * sqft + 25000 * bedrooms + noise
np.random.seed(0)
n = 200
sqft     = np.random.normal(1200, 400, n)
bedrooms = np.random.choice([1, 2, 3, 4], n)
noise    = np.random.normal(0, 50_000, n)
price    = 1500 * sqft + 25_000 * bedrooms + noise

X = np.column_stack([sqft, bedrooms])
X_train, X_test, y_train, y_test = train_test_split(X, price, test_size=0.2, random_state=0)

model = LinearRegression().fit(X_train, y_train)
print(f"Coefficients: {model.coef_}")     # ~[1500, 25000]
print(f"Intercept:    {model.intercept_}")

preds = model.predict(X_test)
print(f"R² (test):    {r2_score(y_test, preds):.3f}")
print(f"MAE (test):   {mean_absolute_error(y_test, preds):,.0f}")`}
            />

            <Takeaways
                items={[
                    'Linear regression assumes y ≈ β₀ + β₁x — a straight-line relationship.',
                    'In multiple regression, each coefficient is "effect of x_i, all else equal".',
                    'R² is variance explained on this data; always validate on held-out data.',
                    'Watch for the four assumptions — violations make coefficients & p-values unreliable.',
                    'sklearn.LinearRegression fits, predicts, and exposes coefs in 4 lines.'
                ]}
            />
        </>
    )
}

// ─── Statistics ─ Chapter 5: A/B Testing ─────────────────────────────────────

const statsAbTesting: TutorialChapter = {
    slug: 'statistics/ab-testing',
    topic: 'Statistics',
    topicSlug: 'statistics',
    chapter: 'Chapter 5',
    title: 'A/B Testing in Practice',
    description: 'Design, run, and read A/B tests — sample sizing, power, peeking, segmentation, and the mistakes that ruin them.',
    readMin: 15,
    tags: ['Statistics', 'A/B Testing', 'Experiments'],
    prev: { slug: 'statistics/linear-regression', title: 'Linear Regression' },
    toc: [
        { id: 'design', label: 'Designing an A/B test' },
        { id: 'sample', label: 'Sample size & power' },
        { id: 'peeking', label: 'The peeking problem' },
        { id: 'reading', label: 'Reading the result' },
        { id: 'segments', label: 'Segmentation traps' },
        { id: 'pitfalls', label: 'Real-world pitfalls' }
    ],
    content: (
        <>
            <P>
                A/B testing is how product teams ship changes with confidence. It's also how teams accidentally ship bad ideas because they
                misread results. This chapter is the playbook — design, sample size, reading results, and the traps that take down even
                experienced teams.
            </P>

            <H2 id="design">Designing an A/B test</H2>
            <UL>
                <LI><Strong>Hypothesis:</Strong> "Showing the price more prominently will increase conversion by ≥ 5%."</LI>
                <LI><Strong>Primary metric:</Strong> the one number that decides ship/don't ship. <em>Secondary</em> metrics watch for unintended damage.</LI>
                <LI><Strong>Unit of randomisation:</Strong> usually the user — never the session, or you'll get the same user in both arms.</LI>
                <LI><Strong>Control vs treatment:</Strong> treatment is what you're testing; control is the existing experience.</LI>
                <LI><Strong>Pre-register:</Strong> write down the hypothesis, sample size, and stopping rule <em>before</em> the test starts. Stick to it.</LI>
            </UL>

            <H2 id="sample">Sample size &amp; power</H2>
            <P>The sample size depends on three things: the baseline rate, the smallest effect you care about (MDE), and the power you want.</P>
            <Table
                headers={['Variable', 'Typical choice']}
                rows={[
                    ['α (significance)', '0.05'],
                    ['1 − β (power)', '0.80'],
                    ['MDE (smallest effect to detect)', 'business-driven — 1%, 2%, 5%']
                ]}
            />
            <CodeBlock
                language="python"
                code={`from statsmodels.stats.power import NormalIndPower

# Baseline conversion 10% → wants to detect a 1pp absolute lift to 11%
# Effect size as Cohen's h
from statsmodels.stats.proportion import proportion_effectsize
h = proportion_effectsize(0.11, 0.10)

n_per_arm = NormalIndPower().solve_power(
    effect_size=h, alpha=0.05, power=0.80, alternative="two-sided"
)
print(f"~{round(n_per_arm):,} users per arm")
# ~14,747 users per arm`}
            />
            <Callout kind="tip">
                If you can't reach the required sample size in a reasonable time window, you don't have an A/B problem — you have a sensitivity
                problem. Ship the change with a feature flag and monitor instead.
            </Callout>

            <H2 id="peeking">The peeking problem</H2>
            <P>
                If you check the test daily and stop the moment <Code>p &lt; 0.05</Code>, you'll see "significant" results from pure noise{' '}
                roughly <Strong>30%</Strong> of the time. Stopping rules baked into traditional tests assume a single look at a fixed sample size.
            </P>
            <UL>
                <LI><Strong>The fix:</Strong> pre-commit to a sample size and only check the result at that point.</LI>
                <LI><Strong>Or:</Strong> use sequential / Bayesian methods that account for repeated looks (e.g., always-valid p-values).</LI>
            </UL>

            <H2 id="reading">Reading the result</H2>
            <P>You ran the test. The dashboard says "treatment lift = +4.3%, p = 0.028". What do you actually conclude?</P>
            <UL>
                <LI><Strong>Statistically significant?</Strong> Yes — at α = 0.05.</LI>
                <LI><Strong>Confidence interval?</Strong> "95% CI: +0.4% to +8.1%" — the true effect could realistically be much smaller.</LI>
                <LI><Strong>Practical significance?</Strong> If 0.4% lift wouldn't justify ship, the result is statistically significant but practically inconclusive.</LI>
                <LI><Strong>Secondary metrics?</Strong> Did latency get worse? Cancellation rate? Don't tunnel-vision on the primary.</LI>
                <LI><Strong>Pre-registered hypothesis?</Strong> If you ran 12 segment cuts and one became significant, that's not a discovery — that's multiple-testing.</LI>
            </UL>

            <H2 id="segments">Segmentation traps</H2>
            <P>"The treatment didn't work overall, but it was great for users in the South!" — be careful.</P>
            <UL>
                <LI>Every additional segment cut multiplies your false-positive rate.</LI>
                <LI>Pre-register segments you'll look at; treat post-hoc segments as <em>hypotheses for the next test</em>, not conclusions.</LI>
                <LI>Apply a Bonferroni or Holm correction if you're testing many segments simultaneously.</LI>
            </UL>

            <H2 id="pitfalls">Real-world pitfalls</H2>
            <UL>
                <LI><Strong>Sample-ratio mismatch (SRM):</Strong> if the actual split isn't ~50/50, your randomisation broke. Investigate before reading the result.</LI>
                <LI><Strong>Network effects:</Strong> social products (think Facebook, Slack) violate independence — treatment users interact with control users.</LI>
                <LI><Strong>Novelty effects:</Strong> any change shows a short-term lift just because it's different. Run long enough to see steady-state.</LI>
                <LI><Strong>Day-of-week effects:</Strong> Mondays and Fridays behave differently. Run for at least one full week — ideally two.</LI>
                <LI><Strong>Outlier-driven results:</Strong> one whale account can swing a small test. Cap or winsorise extreme values.</LI>
            </UL>

            <Takeaways
                items={[
                    'Pre-register: hypothesis, primary metric, sample size, stopping rule. Don\'t deviate.',
                    'Compute sample size before starting — typical α=0.05, power=0.80, MDE business-driven.',
                    "Don't peek-and-stop — it inflates false positives to ~30%. Pre-commit to one look.",
                    'Always look at the confidence interval and practical significance, not just the p-value.',
                    'SRM, novelty effects, day-of-week and outliers are the four most-common ways tests mislead.'
                ]}
            />
        </>
    )
}

// ─── Topic landing pages ─ topic intro ────────────────────────────────────────

interface TutorialTopic {
    slug: string
    name: string
    description: string
    chapters: { slug: string; chapter: string; title: string; description: string; readMin: number; tags: string[] }[]
}

export const tutorialTopics: TutorialTopic[] = [
    {
        slug: 'python',
        name: 'Python',
        description: 'Master Python from basics to advanced — data types, loops, functions, OOP, and real-world projects.',
        chapters: [
            { slug: 'python/python-fundamentals', chapter: 'Chapter 1', title: 'Python Fundamentals', description: 'Installation, variables, data types, input/output, comments, and your first programs.', readMin: 11, tags: ['Python', 'Basics'] },
            { slug: 'python/python-operators', chapter: 'Chapter 2', title: 'Python Operators', description: 'Arithmetic, comparison, logical, assignment, bitwise, membership, identity.', readMin: 14, tags: ['Python', 'Operators'] },
            { slug: 'python/python-data-types', chapter: 'Chapter 3', title: 'Python Data Types', description: "Integers, floats, strings, booleans, None, type conversion, and how they work.", readMin: 18, tags: ['Python', 'Data Types'] },
            { slug: 'python/python-lists', chapter: 'Chapter 4', title: 'Python Lists', description: 'Creation, indexing, slicing, methods, iteration, comprehensions, nested lists.', readMin: 22, tags: ['Python', 'Lists'] },
            { slug: 'python/python-strings', chapter: 'Chapter 5', title: 'Python Strings', description: 'Indexing, slicing, methods, formatting, regex basics and real-world use.', readMin: 20, tags: ['Python', 'Strings'] },
            { slug: 'python/tuples-and-sets', chapter: 'Chapter 6', title: 'Tuples & Sets', description: 'Immutable tuples and unique-element sets — operations, methods, when to use which.', readMin: 16, tags: ['Python', 'Tuples', 'Sets'] },
            { slug: 'python/python-dictionaries', chapter: 'Chapter 7', title: 'Python Dictionaries', description: 'CRUD operations, iteration, comprehensions, nested dicts, common idioms (Counter, defaultdict).', readMin: 18, tags: ['Python', 'Dictionaries'] },
            { slug: 'python/conditional-statements', chapter: 'Chapter 8', title: 'Conditional Statements', description: 'if / elif / else, ternary expressions, match-case, guard clauses, and clean conditionals.', readMin: 14, tags: ['Python', 'Control Flow'] },
            { slug: 'python/python-loops', chapter: 'Chapter 9', title: 'Python Loops', description: 'for / while loops, range, enumerate, zip, break, continue, nested loops, iteration patterns.', readMin: 16, tags: ['Python', 'Loops'] },
            { slug: 'python/python-functions', chapter: 'Chapter 10', title: 'Python Functions', description: 'Define and call functions, *args/**kwargs, lambdas, scope/closures, docstrings, type hints.', readMin: 18, tags: ['Python', 'Functions'] },
            { slug: 'python/file-handling', chapter: 'Chapter 11', title: 'File Handling', description: 'Read & write text / CSV / JSON, with-statement, modes, encoding, and modern Pathlib.', readMin: 16, tags: ['Python', 'File I/O'] },
            { slug: 'python/exception-handling', chapter: 'Chapter 12', title: 'Exception Handling', description: 'try / except / else / finally, raising, custom exceptions, and error-handling best practices.', readMin: 15, tags: ['Python', 'Exceptions'] }
        ]
    },
    {
        slug: 'sql',
        name: 'SQL',
        description: 'Queries, joins, subqueries, window functions and database design for analytics work.',
        chapters: [
            { slug: 'sql/sql-intro', chapter: 'Chapter 1', title: 'SQL Intro — SELECT, WHERE, ORDER BY', description: 'Get started with SQL — the SELECT statement, filtering, sorting, and basic aggregations.', readMin: 14, tags: ['SQL', 'Basics'] },
            { slug: 'sql/sql-joins', chapter: 'Chapter 2', title: 'SQL Joins', description: 'INNER, LEFT, RIGHT, FULL OUTER joins and finding missing matches.', readMin: 15, tags: ['SQL', 'Joins'] },
            { slug: 'sql/sql-window-functions', chapter: 'Chapter 3', title: 'SQL Window Functions', description: 'OVER, PARTITION BY, ROW_NUMBER, RANK, LAG and running totals.', readMin: 17, tags: ['SQL', 'Window Functions'] },
            { slug: 'sql/subqueries-and-ctes', chapter: 'Chapter 4', title: 'SQL Subqueries & CTEs', description: 'Scalar / inline subqueries, IN / EXISTS, WITH-statements, recursive CTEs for hierarchies.', readMin: 16, tags: ['SQL', 'CTEs', 'WITH'] },
            { slug: 'sql/aggregations-deep-dive', chapter: 'Chapter 5', title: 'Aggregations Deep Dive', description: 'COUNT distinct, conditional aggregation, FILTER, ROLLUP/CUBE, funnels & cohorts.', readMin: 14, tags: ['SQL', 'Aggregations'] }
        ]
    },
    {
        slug: 'power-bi',
        name: 'Power BI',
        description: 'Build interactive dashboards, DAX formulas, data modelling, and business intelligence reports.',
        chapters: [
            { slug: 'power-bi/power-bi-intro', chapter: 'Chapter 1', title: 'Power BI Intro & Data Modelling', description: 'Power BI Desktop, Power Query, star schemas, and your first dashboard.', readMin: 16, tags: ['Power BI', 'Modelling'] },
            { slug: 'power-bi/power-bi-dax', chapter: 'Chapter 2', title: 'Introduction to DAX', description: 'CALCULATE, time intelligence, iterators, and the patterns analysts use daily.', readMin: 18, tags: ['Power BI', 'DAX'] },
            { slug: 'power-bi/power-query-deep-dive', chapter: 'Chapter 3', title: 'Power Query Deep Dive', description: 'M language, common transformations, parameters, merge/append, and refresh-friendly patterns.', readMin: 17, tags: ['Power BI', 'Power Query', 'ETL'] },
            { slug: 'power-bi/time-intelligence', chapter: 'Chapter 4', title: 'Time Intelligence in DAX', description: 'YTD, MTD, Same-Period-Last-Year, rolling averages, and the Date table that makes them all work.', readMin: 16, tags: ['Power BI', 'DAX', 'Time Intelligence'] }
        ]
    },
    {
        slug: 'excel',
        name: 'Excel',
        description: 'Formulas, pivot tables, Power Query, dashboarding and advanced analytics in Excel.',
        chapters: [
            { slug: 'excel/excel-formulas', chapter: 'Chapter 1', title: 'Excel Formulas — Foundations', description: 'IF, SUMIFS, COUNTIFS, XLOOKUP, INDEX/MATCH, dynamic arrays, and text functions.', readMin: 16, tags: ['Excel', 'Formulas'] },
            { slug: 'excel/excel-pivot-tables', chapter: 'Chapter 2', title: 'Excel Pivot Tables', description: 'Build, slice, customise pivot tables — calculated fields, slicers, GETPIVOTDATA.', readMin: 14, tags: ['Excel', 'Pivot'] },
            { slug: 'excel/power-query-in-excel', chapter: 'Chapter 3', title: 'Power Query in Excel', description: 'Connect, clean and combine messy data — replaces 80% of macros, no VBA needed.', readMin: 15, tags: ['Excel', 'Power Query'] },
            { slug: 'excel/charts-and-dashboards', chapter: 'Chapter 4', title: 'Charts & Dashboards', description: 'Picking the right chart, formatting, slicers, and dashboard layout patterns analysts ship.', readMin: 14, tags: ['Excel', 'Charts'] }
        ]
    },
    {
        slug: 'tableau',
        name: 'Tableau',
        description: 'Create stunning data visualisations, calculated fields, and interactive storytelling dashboards.',
        chapters: [
            { slug: 'tableau/tableau-intro', chapter: 'Chapter 1', title: 'Tableau Intro & First Dashboard', description: 'Connect, build sheets, design dashboards — the authoring model in 14 minutes.', readMin: 14, tags: ['Tableau', 'Dashboards'] },
            { slug: 'tableau/lod-expressions', chapter: 'Chapter 2', title: 'LOD Expressions', description: 'FIXED, INCLUDE, EXCLUDE — order of operations, real-world cohort & % patterns.', readMin: 14, tags: ['Tableau', 'LOD'] },
            { slug: 'tableau/calculated-fields-and-table-calcs', chapter: 'Chapter 3', title: 'Calculated Fields & Table Calculations', description: 'Row-level vs aggregate calcs, IF/CASE logic, RUNNING_SUM, WINDOW_AVG, LOOKUP recipes.', readMin: 14, tags: ['Tableau', 'Calculations'] },
            { slug: 'tableau/dashboard-design', chapter: 'Chapter 4', title: 'Dashboard Design', description: 'Layout containers, sizing, actions, parameters, mobile layouts — design patterns that get used.', readMin: 14, tags: ['Tableau', 'Design'] }
        ]
    },
    {
        slug: 'statistics',
        name: 'Statistics',
        description: 'Descriptive & inferential statistics, hypothesis testing, regression, and data interpretation.',
        chapters: [
            { slug: 'statistics/descriptive-statistics', chapter: 'Chapter 1', title: 'Descriptive Statistics', description: 'Mean, median, mode, variance, std dev, percentiles — the toolkit for summarising data.', readMin: 14, tags: ['Statistics', 'Descriptive'] },
            { slug: 'statistics/probability-and-distributions', chapter: 'Chapter 2', title: 'Probability & Distributions', description: 'Probability rules, Normal / Binomial / Poisson distributions, the Central Limit Theorem.', readMin: 16, tags: ['Statistics', 'Probability'] },
            { slug: 'statistics/hypothesis-testing', chapter: 'Chapter 3', title: 'Hypothesis Testing', description: 'p-values, Type I/II errors, t-tests, chi-squared, and reading A/B test results.', readMin: 16, tags: ['Statistics', 'A/B Testing'] },
            { slug: 'statistics/linear-regression', chapter: 'Chapter 4', title: 'Linear Regression', description: 'Simple & multiple linear regression — fitting, R², residuals, coefficients, assumptions.', readMin: 16, tags: ['Statistics', 'Regression'] },
            { slug: 'statistics/ab-testing', chapter: 'Chapter 5', title: 'A/B Testing in Practice', description: 'Design, sample sizing, peeking, segmentation, and the pitfalls that ruin tests.', readMin: 15, tags: ['Statistics', 'Experiments'] }
        ]
    }
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const allChapters: TutorialChapter[] = [
    // Python
    pythonFundamentals, pythonOperators, pythonDataTypes, pythonLists, pythonStrings, pythonTuplesAndSets,
    pythonDictionaries, pythonConditionals, pythonLoops, pythonFunctions, pythonFileHandling, pythonExceptions,
    // SQL
    sqlIntro, sqlJoins, sqlWindow, sqlSubqueriesCtes, sqlAggregations,
    // Power BI
    powerbiIntro, powerbiDax, powerbiPowerQuery, powerbiTimeIntelligence,
    // Excel
    excelFormulas, excelPivot, excelPowerQuery, excelCharts,
    // Tableau
    tableauIntro, tableauLod, tableauCalcs, tableauDashboard,
    // Statistics
    statsDescriptive, statsProbability, statsHypothesis, statsRegression, statsAbTesting
]

export function findChapter(slug: string) {
    return allChapters.find((c) => c.slug === slug)
}

export function findTopic(slug: string) {
    return tutorialTopics.find((t) => t.slug === slug)
}
