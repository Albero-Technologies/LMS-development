// Auto-fix on commit. Older config ran lint:eslint and format:check (read-only)
// which failed commits even when the issue was auto-fixable. This variant runs
// eslint --fix and prettier --write so common issues fix themselves.
const config = {
    '*.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
    '*.{css,scss}': ['stylelint --fix', 'prettier --write'],
    '*.{json,html,md,yml,yaml}': ['prettier --write']
}

export default config
