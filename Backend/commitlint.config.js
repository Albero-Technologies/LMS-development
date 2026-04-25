/* eslint-disable no-undef */
// Conventional Commits config — enforced by .husky/commit-msg and CI.
// Message shape:  <type>(<scope>): <subject>
// Example      :  feat(auth): add Google OAuth callback handler

module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // ---- Type ----
        'type-enum': [
            2,
            'always',
            [
                'feat', // A new feature
                'fix', // A bug fix
                'docs', // Documentation only
                'chore', // Tooling / build / housekeeping
                'style', // Formatting, whitespace, no code change
                'refactor', // Neither a fix nor a feature
                'perf', // Performance improvement
                'test', // Adding / fixing tests
                'build', // Build system (Docker, npm, tsc)
                'ci', // CI / pipelines / workflows
                'revert', // Revert a previous commit
                'security' // Security patch
            ]
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],

        // ---- Scope — kebab-case, strongly-recommended vocabulary ----
        'scope-case': [2, 'always', 'kebab-case'],
        'scope-enum': [
            1, // warn, not fail — unusual scopes pass with a reminder
            'always',
            [
                'auth',
                'users',
                'tenants',
                'courses',
                'lessons',
                'enrollments',
                'payments',
                'quizzes',
                'batches',
                'leads',
                'tickets',
                'notifications',
                'dashboards',
                'uploads',
                'docs',
                'webhooks',
                'infra',
                'docker',
                'nginx',
                'ci',
                'deps',
                'db',
                'prisma',
                'config',
                'security',
                'release',
                'repo'
            ]
        ],

        // ---- Subject ----
        'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'subject-min-length': [2, 'always', 5],
        'subject-max-length': [2, 'always', 80],

        // ---- Header + body + footer shape ----
        'header-max-length': [2, 'always', 100],
        'body-leading-blank': [2, 'always'],
        'body-max-line-length': [1, 'always', 120],
        'footer-leading-blank': [2, 'always']
    }
}
