# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm start            # Run directly (node src/index.js — no build step)
npm run dev          # Run with file watching (node --watch)
npm test             # Run Vitest test suite
npm run lint         # Run ESLint on src/
npm run docker       # Build Docker image (devops/docker/dockerfile-fakeapi)
PORT=1090 npm start  # Run on a specific port (default: 1090)
```

No build step — the project runs native ESM directly from `src/`. Use `npm run dev` for watch mode during local development.

## Git Workflow

- **Never force-push** to any branch. If a rebase is needed, prefer a merge commit or a forward-fix commit instead.
- **Never push directly to `master`**. All changes go through a PR.
- **Merging into master**: squash-merge only — one clean commit per PR.

## Architecture

This is a stateless, in-memory fake API server for use in integration tests. All stored data is lost on server restart.

**Native ESM** (`"type":"module"`) — edit and run directly from `src/`. No compilation step.

### Source layout

```
src/
  app.js        — Express app factory (exported for tests)
  index.js      — thin HTTP server entry point
  config.js     — port, bodyLimit, corsHeaders
  api/
    mocker.js   — /mock routes
    twilio.js   — /twilio routes
    version.js  — /version route
  models/
    storedRequests.js   — in-memory map, newest-first
    storedResponses.js  — in-memory map, round-robin cycling
    twilioMessages.js   — array, filter by since/until/to/from
  lib/
    util.js     — isValidISODate()
```

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

### Validation

Input validation uses `express-validator` v7. Validators are defined alongside the models (not in route files). Handlers use `matchedData(req)` to access validated params — do not read from `req.query` directly.

### Testing

Tests live in `test/` (Vitest + supertest). `src/app.js` exports the Express app for test imports. In test `beforeEach`, reset model state directly: `storedRequests.content` and `storedResponses.content` via assignment; `twilioMessages` array via `.splice(0)` (not reassignment — other modules hold the reference).

### CI / Docker

- CI: `.github/workflows/ci.yml` (lint + test + audit), `.github/workflows/publish.yml` (Docker Hub publish on tag push)
- Docker: `devops/docker/dockerfile-fakeapi`, Node 22-alpine, non-root user, `npm ci`
