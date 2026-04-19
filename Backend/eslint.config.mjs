// @ts-check
//
// LearnHub backend — ESLint flat config (v9+).
// Layered strictness:
//   - strict TypeScript + type-aware rules for src/
//   - relaxed rules for test/, prisma/seed.ts, operational scripts
//   - dist/, migrations, logs ignored entirely

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
    // ---- Global ignores --------------------------------------------------
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'logs/**',
            'public/**',
            'prisma/migrations/**',
            '**/*.d.ts',
            'vitest.config.ts'
        ]
    },

    // ---- Baseline + type-aware recommended rules -------------------------
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    eslintConfigPrettier,

    // ---- Production source (src/) — strictest settings -------------------
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            // --- Code correctness ---
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-alert': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-param-reassign': ['error', { props: false }],
            'no-throw-literal': 'error',
            'no-useless-catch': 'off', // we rethrow-with-context in services

            // --- Style ---
            quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
            'prefer-const': 'error',
            'prefer-template': 'error',
            'object-shorthand': ['error', 'always'],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            curly: ['error', 'multi-line'],

            // --- TypeScript-specific ---
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': [
                'error',
                { checksVoidReturn: { attributes: false, arguments: false } }
            ],
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'off', // noisy against Prisma optional relations
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                { allowNumber: true, allowBoolean: true, allowNullish: true }
            ],
            '@typescript-eslint/no-redundant-type-constituents': 'off',

            // --- Security-ish defaults ---
            'no-prototype-builtins': 'error',
            'no-script-url': 'error',
            'no-restricted-globals': ['error', 'event', 'fdescribe']
        }
    },

    // ---- Test files — looser to allow expressive assertions --------------
    {
        files: ['test/**/*.ts'],
        languageOptions: {
            parserOptions: { project: true, tsconfigRootDir: import.meta.dirname }
        },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/unbound-method': 'off'
        }
    },

    // ---- Prisma seed + operational scripts — allow console ---------------
    {
        files: ['prisma/seed.ts', 'script/**/*.{ts,js}'],
        languageOptions: {
            parserOptions: { project: true, tsconfigRootDir: import.meta.dirname }
        },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-floating-promises': 'off'
        }
    }
)
