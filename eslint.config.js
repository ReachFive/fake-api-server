import js from '@eslint/js'
import globals from 'globals'

export default [
    { ignores: ['test/', 'eslint.config.js', 'vitest.config.mjs'] },
    {
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-console': 'warn',
            'no-unused-vars': 'error',
        },
    },
]
