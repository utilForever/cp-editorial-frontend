# cp-editorial-frontend

Frontend for discovering competitive-programming editorials managed in `cp-editorial-data`.

## Local development

```bash
npm install
npm run dev
```

## Quality scripts

```bash
npm run index:generate
npm run format:check
npm run lint
npm run analyze
npm run build
```

## Deployment

- Production target: **https://editorial.coduck.io**
- `cp-editorial-data` updates on `main` regenerate the static index (`npm run index:generate`) and trigger frontend deployment.

## Index generation rules

- Config file: `scripts/editorial-index.config.json`
- You can exclude files and paths with:
  - `excludeFileNames` (exact file names, e.g. `README.md`)
  - `excludePathPrefixes` (prefix paths, e.g. `School/Draft`)
  - `excludePathPatterns` (regex patterns)
- Path parsing:
  - first directory = category (e.g. `Olympiad`)
  - second directory = contest name / organizer (e.g. `Russian Olympiad in Informatics`)
  - filename stem = contest entry / editorial title

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture, data model, routing, CI, and deployment design.
