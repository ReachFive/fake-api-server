import { createRequire } from 'module'

// express-validator@5 is CommonJS — re-export what we need as named ESM exports.
// createRequire needs a path within the project to resolve node_modules correctly.
const require = createRequire(process.cwd() + '/package.json')
const { check, query, validationResult } = require('express-validator/check')

export { check, query, validationResult }
