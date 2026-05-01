# cp-editorial-frontend

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

## UI preferences

- Theme: switch between light and dark mode from the header; the selected mode is saved in local storage.
- Language: switch UI language at runtime (`en`, `ko`, `ja`); the selected language is also saved in local storage.

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
