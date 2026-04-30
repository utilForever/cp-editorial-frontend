# AGENTS.md

This file provides context and instructions for AI coding agents working on the **cp-editorial-frontend** project.

## Project Overview

**cp-editorial-frontend** is a React + Vite + TypeScript web app for discovering competitive-programming editorials managed in `cp-editorial-data`.

- Main target: `https://editorial.coduck.io`
- Runtime data: static editorial index in `public/data/editorial-index.json`
- Architecture and behavior details: `README.md`, `ARCHITECTURE.md`

## Tech Stack

| Component       | Details                 |
| --------------- | ----------------------- |
| Framework       | React 18                |
| Build tool      | Vite 4                  |
| Language        | TypeScript              |
| Package manager | npm                     |
| Routing         | react-router-dom        |
| i18n            | i18next + react-i18next |

## Repository Structure

```text
cp-editorial-frontend/
├── src/
│   ├── app/                         # App composition, providers, routes
│   ├── pages/                       # Route-level pages
│   ├── entities/editorial/model/    # Editorial domain types/normalization
│   └── shared/                      # API, hooks, i18n, reusable UI
├── scripts/                         # Index generation and config
├── public/                          # Static assets and generated data
├── .github/workflows/               # CI and deployment workflows
├── README.md
└── ARCHITECTURE.md
```

## Common Commands

### Local development

```bash
npm install
npm run dev
```

### Quality and delivery

```bash
npm run index:generate
npm run format:check
npm run lint
npm run analyze
npm run build
```

## CI Pipeline

- Workflow file: `.github/workflows/ci.yml`
- Trigger policy: runs on every pull request and on pushes to `main`.
- Runtime baseline: Node.js 20 with `npm ci`.
- Required quality gates (in order): `format:check` -> `lint` -> `analyze` -> `build`.
- All CI jobs should pass before merging.

## Contribution Guidelines

- Keep pull requests focused and scoped to a single behavior or documentation change.
- Follow existing module boundaries and avoid unrelated refactors.
- If behavior changes, update related docs (`README.md`, `ARCHITECTURE.md`, or this file) in the same change set.
- For editorial content onboarding, follow `/contribute` guidance and use `Category/Contest(or Organization)/Editorial file` hierarchy in `cp-editorial-data`.
- Preserve index generation rules and path conventions in `scripts/editorial-index.config.json`.

## Commit Style

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`
- Split commits by behavior or another meaningful unit of change.
- Release commits: `feat: vX.Y.Z — short summary`
- Hotfix: `fix: description` (no version in message)

## Agent working rules

- Keep edits tightly scoped to the user request; do not refactor unrelated areas.
- Follow existing file/module boundaries and naming conventions.
- Prefer updating existing utilities/components over introducing duplicate logic.
- Preserve type safety (`tsc -b` must remain clean); avoid `any` unless already established in nearby code.
- For UI text changes, keep i18n behavior consistent with existing locale handling (`en`, `ko`, `ja`).
- If behavior or architecture expectations change, update docs in the same change set.

## Editorial index and routing notes

- Index generation script: `scripts/generate-editorial-index.mjs`.
- Index generation config: `scripts/editorial-index.config.json`.
- Path conventions are important: first segment = category, second = contest/organizer.
- Routing should continue to rely on stable editorial identifiers rather than filename language.

## Change checklist for agents

- Confirm assumptions from existing docs/code before editing.
- Implement minimal complete changes for the requested scope.
- Run the relevant quality commands for touched areas.
- Ensure docs stay aligned with changed behavior.
