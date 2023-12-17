/* eslint-env node */
module.exports = {
    root: true,
    rules: {},
    overrides: [
        {
            files: ["src/**"],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/strict-type-checked'
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json'
            },
            plugins: [
                '@typescript-eslint',
                '@stylistic/ts'
            ],
            rules: {
            }
        }
    ],
    ignorePatterns: [
        "node_modules/**",
        "out/**",
        "webpack.config.js"
    ]
};