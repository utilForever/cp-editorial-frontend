# Frontend for Competitive Programming Editorials

<p align="center">
  <img src="./Logo.png" alt="cp-editorial" width="400">
</p>

[![CI](https://img.shields.io/github/actions/workflow/status/utilForever/cp-editorial-frontend/ci.yml?branch=main&label=CI)](https://github.com/utilForever/cp-editorial-frontend/actions/workflows/ci.yml)
[![Deploy Frontend](https://img.shields.io/github/actions/workflow/status/utilForever/cp-editorial-frontend/deploy.yml?branch=main&label=Deploy)](https://github.com/utilForever/cp-editorial-frontend/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=utilForever_cp-editorial-frontend&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=utilForever_cp-editorial-frontend)

Frontend for discovering competitive-programming editorials managed in `cp-editorial-data`.

## Quick Start

### Prerequisites

- Node.js 20
- npm

### Local development

```bash
npm install
npm run dev
```

### Quality and build commands

```bash
npm run index:generate
npm run format:check
npm run lint
npm run analyze
npm run build
```

### Browser regression tests

```bash
npx playwright install chromium
npm test
```

The tests start a local Vite server and use fixed editorial indexes to check search URLs, detail/Back navigation, refresh, filter defaults, Clear, multi-word matching, relevance ordering, and highlights. The rapid-input and complete-match ordering tests use the repository's full editorial index.

Viewer regression tests cover localized loading, timeout and failure recovery, retries, cancellation and Blob URL cleanup, late response bodies, and direct opening of Markdown/text sources without PDF requests.

ID regression tests also generate preview HTML and PNG files in an isolated test output directory and check that browser detail routes and preview images use the same IDs for ASCII, Korean, supplementary CJK, emoji, and explicit IDs.

Preview regression tests check PNG dimensions and size, rebuilding after clearing `dist`, cache reuse, and invalidation when editorial metadata, the generator, any bundled font, the background, or dependencies change. Rendered-image snapshots check mixed Korean, Latin, Japanese, supplementary CJK, and emoji in bold titles and regular footers, including wrapping and truncation of long Unicode titles.

### Social-preview build cache

Editorial previews remain 1200 × 630 PNGs at the same per-editorial URLs. The build uses `sharp` to compress rendered images to a 256-colour palette. Pretendard remains the primary font; bundled Source Han Sans and monochrome Noto Emoji supply missing CJK characters and emoji. System fonts are disabled for reproducible rendering. These fonts are build inputs only and are not downloaded by site visitors. Versions, sources, and licenses are recorded in [the font directory](scripts/assets/fonts/README.md).

Generated images are cached in `.cache/route-previews`, outside Vite's cleared `dist` directory. Each build copies the required images into `dist` and regenerates route HTML. Cache keys cover normalized editorial metadata, generator/template code, font and background bytes, the dependency lockfile, and the Node.js/platform version. CI and deployment restore this cache across runs, including editorial-data dispatches. Missing caches simply trigger a complete render; deleting `.cache/route-previews` forces one. Old entries can be removed with that directory to reclaim disk space.

The generator logs rendered/reused counts, total image bytes, and elapsed preview-generation time.

Initial optimization measurements, before adding the bundled fallback fonts, were taken on 2026-10-24 with the checked-in 247-record index, Windows x64, Node.js 24.14.1, and an Intel Core i9-10940X. Each row is one local run of the preview generator (including route HTML and process startup), excluding Vite, TypeScript, and uploads; these are not production timings. The baseline uses the generator from `cb29660` with the same index and assets.

| Generator              | Editorial PNG bytes |   MiB | Duration | Rendered / reused |
| ---------------------- | ------------------: | ----: | -------: | ----------------: |
| Baseline               |         283,425,134 | 270.3 |  119.7 s |           247 / 0 |
| Optimized, empty cache |          79,050,546 |  75.4 |  126.6 s |           247 / 0 |
| Optimized, warm cache  |          79,050,546 |  75.4 |    3.8 s |           0 / 247 |

This reduces editorial image bytes by 72.1%. Palette encoding and loading bundled fallback fonts add work to a cold build; caching removes repeated rendering and encoding. Korean and long English title samples were visually checked. To compare locally, run `npm run build` with `.cache/route-previews` absent, then run it again with the cache retained and compare the `[route-previews]` log lines. Vite clears `dist` on both runs.

After adding the fallback fonts, a full build on the same machine produced all 247 existing previews byte-for-byte unchanged. The generator reported 131.85 s with no cache hits and 0.96 s with all images reused (1.27 s including process startup for the warm run). No font files were included in `dist`. The mixed-script and long-Unicode snapshot cases also rendered identically on Node.js 20.20.2 and 24.14.1.

## UI preferences

The interface follows [Microsoft Fluent 2](https://fluent2.microsoft.design/) guidance using existing React components and semantic CSS tokens. Neutral surfaces, a blue primary action, consistent spacing and typography, and visible keyboard focus apply across all routes in light and dark themes. Long titles wrap, filters keep their labels, and narrow screens stack controls. The mobile menu supports Escape and returns focus to its trigger after dismissal or navigation; a skip link moves directly to the content. Loading, empty and failure states include localized status announcements and recovery guidance.

See the [design reference and before/after gallery](docs/design/fluent-2/README.md) for the responsive Home/Search proposal, token/state decisions and validation scope.

- Theme: switch between light and dark mode from the header; the selected mode is saved in local storage.
- Language: switch UI language at runtime (`en`, `ko`, `ja`); the selected language is also saved in local storage.
- Search: the query, category, and year are stored in the URL (`q`, `category`, `year`) so Back, refresh, and shared links restore the same search. Changes replace the current history entry, and Clear removes the search parameters.
- Search matching: each whitespace-separated word must appear in at least one searchable field, ignoring case and word order. Category and year filters still apply. Results stay grouped by contest, prioritizing complete title/contest word matches, then stronger partial matches. Matching words are highlighted, including overlapping matches and Unicode text. Match context omits repeated title/field text (ignoring case and whitespace) and filenames that only add an extension, unless that extension explains a search word. Snippets that become identical after shortening are also shown only once, unless they explain different search words. Distinct matching text and category/year context remain visible.
- Search presentation: editorial titles are shown in full with wrapping and highlights; supporting match snippets remain compact. Result counts and empty results are announced without moving keyboard focus from the search controls.
- Editorial data: the index is loaded and normalized once per page session, then reused across SPA navigation. Reload the page or open a new tab to check for updated deployment data. Failed loads can be retried by navigating to another data page or reloading.
- Editorial viewer: PDFs load into the browser preview with a 15-second timeout. Failures offer Retry without reloading the app; timeout guidance also suggests opening the source through Download for large files or slow connections. Markdown and text files offer a direct source link in a new tab. Download and return/navigation links remain available for all formats.
- Social previews: Build output now includes route-specific Open Graph/Twitter HTML pages for `/search`, `/categories` (including hierarchy sub-routes), `/contribute`, `/copyright`, and `/editorials/:editorialId`.
- Preview images: `search/categories/contribute/copyright` share one preview image, while each editorial detail route gets a compressed per-editorial PNG; unchanged images are reused during builds.

## The way the system works

1. Editorial files are managed in `cp-editorial-data`.
2. Updates on `cp-editorial-data` trigger a `repository_dispatch` event for this repository.
3. The frontend workflow runs `npm run index:generate` to regenerate `public/data/editorial-index.json`.
4. The app is built and deployed to GitHub Pages at **https://editorial.coduck.io**.

For full architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- local quality checks
- coding and commit conventions
- pull request workflow

## License

<img align="right" src="https://149753425.v2.pressablecdn.com/wp-content/uploads/2009/06/OSIApproved_100X125.png">

The class is licensed under the [MIT License](https://opensource.org/licenses/MIT):

Copyright &copy; 2026 [Chris Ohk](https://www.github.com/utilForever).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
