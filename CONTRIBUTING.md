# Contributing to cp-editorial-frontend

Thanks for contributing to **cp-editorial-frontend**. This document describes the expected workflow for this repository.

## Getting Started

1. Use **Node.js 20** and **npm**.
2. Install dependencies:

```bash
npm install
```

3. Start local development:

```bash
npm run dev
```

The app serves the frontend for `https://editorial.coduck.io` and reads editorial index data from `public/data/editorial-index.json`.

## Architecture

Read these documents first:

- [`README.md`](./README.md) for project overview and commands
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) for module boundaries, routing, and data model

Keep changes within existing boundaries:

- `src/app`: app composition, providers, routes
- `src/pages`: route-level pages
- `src/entities/editorial/model`: editorial domain model and normalization
- `src/shared`: API, hooks, i18n, reusable UI
- `scripts`: editorial index generation

If behavior changes, update related documentation in the same PR.

## Code Style

This repository enforces TypeScript + ESLint + Prettier checks.

Run quality commands locally before opening a PR:

```bash
npm run format:check
npm run lint
npm run analyze
npm run build
```

CI runs these gates in the same order (`format:check` -> `lint` -> `analyze` -> `build`).
SonarCloud runs in a separate workflow (`.github/workflows/sonarcloud.yml`) and should be configured as a required PR status check.

Formatting and linting rules are configured in:

- `.prettierrc.json`
- `.eslintrc.cjs`

## Pull Requests

Keep pull requests focused to one behavior or documentation change.

Before creating a PR:

1. Ensure quality checks pass locally.
2. Keep edits scoped and avoid unrelated refactors.
3. Update docs when behavior or architecture expectations change.
4. Use clear, conventional commit messages:
   - `feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`

For editorial content onboarding rules (`Category/Contest(or Organization)/Editorial file`), follow the website `/contribute` guidance and the `cp-editorial-data` repository flow.

## Releasing

Follow repository commit conventions:

- Release commit format: `feat: vX.Y.Z — short summary`
- Hotfix commit format: `fix: description`

Deployment behavior:

- Pushes to `main` trigger deployment (`.github/workflows/deploy.yml`).
- `repository_dispatch` (`cp-editorial-data-updated`) also triggers deployment after index regeneration.
- `workflow_dispatch` can trigger a manual deployment run.

## Dependencies

Dependency maintenance uses npm and Dependabot.

- Runtime and dev dependencies are managed in `package.json` and `package-lock.json`.
- Dependabot is configured for daily updates to:
  - npm packages
  - GitHub Actions workflows

When updating dependencies:

1. Keep lockfile changes with manifest changes.
2. Run quality checks (`format:check`, `lint`, `analyze`, `build`).
3. Include dependency rationale in the PR description when non-trivial.
