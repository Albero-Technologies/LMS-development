const config = {
    '*.{js,ts,jsx,tsx}': ['npm run lint:eslint', 'npm run format:check'],
    '*.{css,scss}': ['npm run lint:stylelint', 'npm run format:check'],
    '*.{json,html,md,yml,yaml}': ['npm run format:check']
}

export default config
