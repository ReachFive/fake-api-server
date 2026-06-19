# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Compile src/ → dist/ via Babel
npm start            # Build then run (node dist)
npm test             # Run ESLint on src/ (no unit test framework exists)
npm run docker       # Build Docker image
PORT=1090 npm start  # Run on a specific port (default: 1090)
```

There is no `npm run dev` watch mode — it was never implemented.

## Architecture

This is a stateless, in-memory fake API server for use in integration tests. All stored data is lost on server restart.

**Source is ES6 modules; Babel compiles to CommonJS** — edit files in `src/`, run from `dist/`. The build step is baked into `prestart`.

### Request/Response lifecycle (`/mock`)

The two models work together to implement a record-and-playback pattern:

- **`storedRequests`** (`src/models/storedRequests.js`): an in-memory map `{ [name]: request[] }`. Requests are stored newest-first (`unshift`). Supports filtering by `method`, `since`, `until` query params.
- **`storedResponses`** (`src/models/storedResponses.js`): an in-memory map `{ [name]: { responses[], index } }`. Supports cycling — if you POST an array of responses, they are served in round-robin order across successive requests.

The router (`src/api/mocker.js`) captures any HTTP method on `/:name/request`, saves the request, then immediately looks up and returns the configured response (defaulting to `200` with no body).

### Routes

| Prefix     | File                     | Purpose                              |
|------------|--------------------------|--------------------------------------|
| `/mock`    | `src/api/mocker.js`      | Generic mock record-and-playback     |
| `/twilio`  | `src/api/twilio.js`      | Fake Twilio SMS store                |
| `/version` | `src/api/version.js`     | Returns `version` from `package.json` |

### `db.js`

`src/db.js` is a callback stub with no real database. It exists as an integration point if a persistence layer is ever added — it calls its callback immediately. All models hold state in module-level objects.

### Validation

Input validation uses `express-validator` v5 (legacy check/query API from `express-validator/check`). The validator instances (`storedRequestSearchValidation`, `storedResponseValidation`, etc.) are defined alongside the models, not in the route files.
