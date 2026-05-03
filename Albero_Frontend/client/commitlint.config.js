export default {
    extends: ['@commitlint/cli', '@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat', // New feature
                'fix', // Bug fix
                'docs', // Documentation only changes
                'chore', // Changes to the build process or auxiliary tools and libraries such as documentation generation
                'style', // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
                'refactor', // A code change that neither fixes a bug nor adds a feature
                'ci', // Changes to our CI configuration files and scripts
                'test', // Adding missing tests or correcting existing tests
                'revert', // Reverts a previous commit
                'perf', // A code change that improves performance
                'vercel' // Changes related to Vercel deployment
            ]
        ],
        'subject-case': [2, 'always', 'sentence-case'] // Subject should be in sentence case
    }
}
