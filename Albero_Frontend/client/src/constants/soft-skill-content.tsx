import type { ReactNode, ComponentType, CSSProperties } from 'react'
import { Clock, Linkedin, Mic, MessageCircle, Lightbulb, Briefcase } from 'lucide-react'
import { H2, H3, P, UL, LI, Strong, Callout, Takeaways } from '@/components/user/resources/tutorial-prose'

export interface SoftSkillSession {
    slug: string
    title: string
    tagline: string
    description: string
    duration: string
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    audience: string[]
    tags: string[]
    Icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>
    coverGradient: string
    keyOutcomes: string[]
    toc: { id: string; label: string }[]
    content: ReactNode
}

// ─── Time management (full) ───────────────────────────────────────────────────

const timeManagement: SoftSkillSession = {
    slug: 'how-to-manage-time',
    title: 'How to Manage Time',
    tagline: 'Manage time better and stay productive',
    description:
        "A practical, opinionated framework for managing your time the way high-performing operators do — without becoming a productivity-app hoarder.",
    duration: '18 min',
    level: 'Beginner',
    audience: ['Students', 'Fresh Graduates', 'Working Professionals'],
    tags: ['Productivity', 'Time Management', 'Focus'],
    Icon: Clock,
    coverGradient: 'linear-gradient(135deg,#0a3d1f,#16a34a)',
    keyOutcomes: [
        'Run a 90-minute deep-work block without losing focus',
        'Plan tomorrow in 8 minutes the night before',
        'Cut your meetings by 30% using a default decline rule',
        "Use the 'two lists' method to stop being busy and start being effective"
    ],
    toc: [
        { id: 'why', label: 'Why most time-management advice fails' },
        { id: 'two-lists', label: 'The two-lists method' },
        { id: 'deep-work', label: 'Designing a deep-work block' },
        { id: 'meetings', label: 'A default-decline rule for meetings' },
        { id: 'review', label: 'The 8-minute evening review' }
    ],
    content: (
        <>
            <P>
                Most time-management advice doesn't work. It assumes you're already disciplined and the only problem is "scheduling". You're not,
                and that isn't your problem. Your problem is that the inputs to your day are unfiltered — Slack, calendar invites, "quick
                questions", that one client who emails at 11 PM. This session is about <Strong>filtering inputs first</Strong>, and only then
                worrying about how you allocate the time that's left.
            </P>

            <H2 id="why">Why most time-management advice fails</H2>
            <P>
                If you're a senior IC or a student in your first internship, the canonical Pomodoro / GTD playbook breaks down for the same reason:
                it gives you a system to <em>process</em> tasks, but not a stance on <em>what to refuse</em>. Without a refusal stance, your
                calendar fills up with everyone else's priorities. By 5 PM you're "busy" and "tired" and the actual work is untouched.
            </P>

            <Callout kind="tip">
                Productivity is not how much you do per day. Productivity is how often the most important thing got done before everything else.
            </Callout>

            <H2 id="two-lists">The two-lists method</H2>
            <P>
                Warren Buffett is rumoured to have given his pilot Mike Flint this exercise. It's now overused — but it actually works. Here's the
                method, day-of:
            </P>
            <UL>
                <LI>Write down the 25 things you could do today.</LI>
                <LI>Circle the top 5.</LI>
                <LI>The other 20 are not your "todo later" list. They are your <Strong>avoid-at-all-costs</Strong> list.</LI>
            </UL>
            <P>
                The reason it works: it's not the top-5 that's the insight. It's that the other 20 — the things you almost-but-didn't-pick — are
                the ones that quietly devour your week. Naming them as "avoid" makes them visible.
            </P>

            <H2 id="deep-work">Designing a deep-work block</H2>
            <P>
                Cal Newport's research, and most operators we've trained at Albero, converges on this: 90 minutes of high-quality focus a day
                produces more value than 8 hours of fragmented work. Set up the block like this:
            </P>
            <H3>Before the block</H3>
            <UL>
                <LI>Pick the <Strong>one</Strong> outcome you want to walk out with — written down, not in your head.</LI>
                <LI>Phone in another room, on do-not-disturb. Slack desktop quit, not minimised.</LI>
                <LI>One browser tab open. Notion / Cursor / your editor. Nothing else.</LI>
                <LI>Water on the desk. No coffee runs mid-block.</LI>
            </UL>
            <H3>During the block</H3>
            <UL>
                <LI>If a "I should also..." thought hits, write it on a post-it. Don't act on it.</LI>
                <LI>If you genuinely can't progress, switch tasks within the block — don't end it.</LI>
            </UL>
            <H3>After the block</H3>
            <UL>
                <LI>Walk for five minutes — outside if possible.</LI>
                <LI>Then, only then, check Slack and email.</LI>
            </UL>

            <H2 id="meetings">A default-decline rule for meetings</H2>
            <P>
                Most teams treat the calendar invite as a binding social contract. Big mistake. Make this your rule: <Strong>by default, decline
                </Strong> any meeting that doesn't have a clear agenda or decision required. Reply with a short:
            </P>
            <P>
                <em>"Happy to help — could we get this to a 15-minute slot with a one-line agenda? If async works, I can drop notes in the doc."</em>
            </P>
            <P>
                You'll save 5–8 hours a week. The good organisers will start sending agendas. The bad ones will stop inviting you. Both are wins.
            </P>

            <H2 id="review">The 8-minute evening review</H2>
            <P>
                Don't plan tomorrow morning. Plan it the night before. Eight minutes is enough:
            </P>
            <UL>
                <LI><Strong>2 min</Strong> — write tomorrow's three "must-do" outcomes.</LI>
                <LI><Strong>3 min</Strong> — block deep-work time on the calendar before anyone else can.</LI>
                <LI><Strong>2 min</Strong> — write 1 thing that went well today and 1 that you'd do differently.</LI>
                <LI><Strong>1 min</Strong> — close the laptop. Walk away.</LI>
            </UL>

            <Takeaways
                items={[
                    'Productivity = importance * focus * cadence. Not minutes worked.',
                    'The "avoid" list matters more than the "to-do" list.',
                    "Protect 90 minutes of deep work daily — phone away, one tab, one outcome.",
                    'Default-decline meetings without agendas. Most should not have been meetings.',
                    'Plan tomorrow tonight in 8 minutes. Mornings are too late.'
                ]}
            />
        </>
    )
}

// ─── LinkedIn (full) ──────────────────────────────────────────────────────────

const linkedinOptimization: SoftSkillSession = {
    slug: 'linkedin-optimization-2026',
    title: 'LinkedIn Optimization (2026)',
    tagline: 'Build a profile recruiters actually open',
    description:
        "How to make your LinkedIn profile work for you in 2026 — headline rewriting, banner design, content cadence, recruiter messaging, and what's changed since 2024.",
    duration: '22 min',
    level: 'Beginner',
    audience: ['Students', 'Fresh Graduates', 'Working Professionals'],
    tags: ['LinkedIn', 'Personal Brand', 'Job Search'],
    Icon: Linkedin,
    coverGradient: 'linear-gradient(135deg,#1a0a0a,#dc2626)',
    keyOutcomes: [
        'Write a headline that gets clicked, not skipped',
        'Pick a banner that works for your role and seniority',
        'Send recruiter DMs that actually get a reply',
        'Maintain a content cadence without burning out'
    ],
    toc: [
        { id: 'why', label: 'Why LinkedIn matters more in 2026' },
        { id: 'headline', label: 'The headline formula' },
        { id: 'banner', label: 'Banner & profile photo' },
        { id: 'about', label: 'The "About" section' },
        { id: 'content', label: 'Content cadence' },
        { id: 'dms', label: 'Recruiter DMs that work' }
    ],
    content: (
        <>
            <P>
                LinkedIn in 2026 is no longer just a digital CV — it's an active discovery surface. Most hiring at top product companies in India
                runs through inbound DMs from recruiters or warm intros from your network. If your profile doesn't pull its weight, you're losing
                opportunities you don't even know existed.
            </P>

            <H2 id="why">Why LinkedIn matters more in 2026</H2>
            <UL>
                <LI>87% of recruiters at MAANG-tier firms screen profiles before opening a resume.</LI>
                <LI>The LinkedIn algorithm now boosts content with substance over reach-bait — short essays beat motivational posts.</LI>
                <LI>"Open to Work" is no longer a stigma; it's a recruiter filter.</LI>
            </UL>

            <H2 id="headline">The headline formula</H2>
            <P>
                Default LinkedIn fills your headline with your job title at your company. That's bland. Use this formula instead:
            </P>
            <P>
                <Strong>{`<role you want> · <thing you do well> · <proof point>`}</Strong>
            </P>
            <P>Compare:</P>
            <UL>
                <LI>❌ <em>Software Engineer at Infosys</em></LI>
                <LI>✅ <em>Backend Engineer · Distributed systems @ scale · Built order pipeline serving 8M req/day</em></LI>
            </UL>

            <Callout kind="tip">
                Your headline is the most-read 220 characters of your profile. Spend an hour on it. Re-read it monthly.
            </Callout>

            <H2 id="banner">Banner &amp; profile photo</H2>
            <UL>
                <LI><Strong>Banner.</Strong> Make it role-specific, not generic. Engineers: a clean dashboard or system diagram. Analysts: a chart visual. Designers: a Figma frame.</LI>
                <LI><Strong>Photo.</Strong> Solid neutral background, shoulders-up, one clear smile. Phone selfies are fine if the lighting is good.</LI>
                <LI>Both should answer in 2 seconds: "what does this person do?"</LI>
            </UL>

            <H2 id="about">The "About" section</H2>
            <P>
                Don't write a CV in prose. Use this structure:
            </P>
            <UL>
                <LI><Strong>1 line</Strong> — what you do, in plain language.</LI>
                <LI><Strong>2-3 bullets</Strong> — concrete achievements with numbers.</LI>
                <LI><Strong>1 line</Strong> — what you're looking for next.</LI>
                <LI><Strong>1 line</Strong> — how to reach you.</LI>
            </UL>

            <H2 id="content">Content cadence</H2>
            <P>
                The biggest mistake people make in 2026 is daily posting. Don't. Post when you have something to say. A useful rule:
            </P>
            <UL>
                <LI>1 substantial post per week — 200-400 words on something you actually built or learned.</LI>
                <LI>2-3 thoughtful comments per week on posts in your field.</LI>
                <LI>0 motivational quotes. Ever.</LI>
            </UL>

            <H2 id="dms">Recruiter DMs that get a reply</H2>
            <P>
                When you reach out to a recruiter, don't say "looking for opportunities". Say:
            </P>
            <UL>
                <LI>The specific role/team you're interested in (researched).</LI>
                <LI>One concrete reason you're a fit (1 line).</LI>
                <LI>A clear ask — usually "could you point me to the hiring manager" works better than "considering me".</LI>
            </UL>

            <Takeaways
                items={[
                    'LinkedIn in 2026 is a discovery surface — your profile pulls inbound, your CV doesn\'t.',
                    'Headline formula: role you want · what you do well · proof point.',
                    'Banner + photo should answer "what does this person do" in 2 seconds.',
                    "Post once a week with substance; comment 2-3 times. Never motivational quotes.",
                    'Researched, specific recruiter DMs get replies. Generic ones don\'t.'
                ]}
            />
        </>
    )
}

// ─── Stub list ────────────────────────────────────────────────────────────────

const stubs: Omit<SoftSkillSession, 'content' | 'toc'>[] = [
    { slug: 'communication-for-tech-professionals', title: 'Communication for Tech Professionals', tagline: 'Speak with clarity in standups, design reviews and stakeholder calls', description: 'Frameworks for explaining complex work simply — for engineers, analysts, and technical PMs.', duration: '28 min', level: 'Intermediate', audience: ['Working Professionals'], tags: ['Communication', 'Workplace'], Icon: Mic, coverGradient: 'linear-gradient(135deg,#7c2d12,#fbbf24)', keyOutcomes: ['Run a clear weekly status update', 'Pitch a technical design in 5 minutes', 'Translate jargon for non-tech stakeholders', 'Push back politely when scope creeps'] },
    { slug: 'mastering-1-1-meetings', title: 'Mastering 1:1 Meetings', tagline: "Get the most out of your manager 1:1s", description: 'How to prepare, escalate blockers, request feedback, and own your career path through the highest-leverage 30 minutes of your week.', duration: '14 min', level: 'Beginner', audience: ['Working Professionals', 'Fresh Graduates'], tags: ['Career', 'Mentorship'], Icon: MessageCircle, coverGradient: 'linear-gradient(135deg,#7f1d1d,#fb7185)', keyOutcomes: ['Walk in with a written agenda every time', 'Surface blockers without sounding like complaints', 'Ask for feedback that actually changes behaviour', 'Map your 12-month career path in 4 sessions'] },
    { slug: 'creative-problem-solving-for-analysts', title: 'Creative Problem Solving for Analysts', tagline: 'Apply structured thinking to messy business problems', description: 'MECE frameworks, the Issue Tree, and lateral problem solving — the toolkit consultants use to break down ambiguous problems quickly.', duration: '25 min', level: 'Intermediate', audience: ['Working Professionals', 'Students'], tags: ['Problem Solving', 'Frameworks'], Icon: Lightbulb, coverGradient: 'linear-gradient(135deg,#581c87,#a855f7)', keyOutcomes: ['Build an MECE issue tree in 10 minutes', 'Avoid the most common analyst framing mistakes', 'Synthesise findings into a 1-page exec brief', 'Defend conclusions with a logical argument tree'] },
    { slug: 'interview-body-language-and-voice', title: 'Interview Body Language & Voice', tagline: 'Project confidence on Zoom and in-person', description: 'Posture, eye contact, pacing, and the small cues that change interview outcomes — backed by research, tested in mocks.', duration: '19 min', level: 'Beginner', audience: ['Students', 'Fresh Graduates', 'Working Professionals'], tags: ['Interviews', 'Confidence'], Icon: Briefcase, coverGradient: 'linear-gradient(135deg,#7c2d12,#f97316)', keyOutcomes: ['Set up your camera angle and lighting in 5 minutes', 'Use the "open posture" trick that signals confidence', 'Pace your speech at 130-150 words per minute', 'Handle the awkward silence after the panel\'s question'] }
]

const allSessions: SoftSkillSession[] = [
    timeManagement,
    linkedinOptimization,
    ...stubs.map((s) => ({
        ...s,
        toc: [],
        content: (
            <>
                <P>
                    The full session for <Strong>{s.title}</Strong> is part of our publishing pipeline and will be available shortly. Until then,
                    explore our published sessions on Time Management and LinkedIn Optimization.
                </P>
                <Callout kind="info">
                    Want this session prioritised? Email <Strong>support@alberoacademy.com</Strong> with the topic — we publish what learners ask
                    for first.
                </Callout>
            </>
        )
    }))
]

export function findSession(slug: string) {
    return allSessions.find((s) => s.slug === slug)
}
export function listSessions() {
    return allSessions
}
