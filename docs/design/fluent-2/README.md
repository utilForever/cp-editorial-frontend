# Fluent 2 redesign — issue #280

## Direction

The [responsive proposal](mockup.html) was prepared before the implementation, then its palette was refined to match the existing duck logo. Open it in a browser and choose Home/Search, desktop/320px, and light/dark to compare the intended hierarchy. Its token and key-state table records the direction. It is a design reference, not a second application.

The implementation uses the existing React components, native controls and CSS. A Fluent UI dependency would replace working routing, controls and preference integration without removing substantial repeated behavior. The only new shared component is `PageState`, replacing repeated loading/failure/missing-record markup.

References: [tokens](https://fluent2.microsoft.design/design-tokens), [color](https://fluent2.microsoft.design/color), [typography](https://fluent2.microsoft.design/typography), [layout](https://fluent2.microsoft.design/layout), [accessibility](https://fluent2.microsoft.design/accessibility).

## Rules

- The existing `public/home-icon.png` supplies the color direction: the duck's cream feathers and notebook paper inform ivory surfaces, the pencil and books inform amber actions, and the mug informs olive links and selection. Light mode uses dark brown text; dark mode uses warm charcoal surfaces and pale amber/olive accents. View comes before Download and Browse contest on the detail screen.
- Primary actions use `#8b5018` in light mode and `#e6ad54` in dark mode. Links/selection use `#4f5d2f` and `#c4d39a`. These are contrast-adjusted relatives of the illustrated colors, not exact pixel samples. Error colors retain their separate meaning.
- The unchanged transparent logo keeps an ivory backing in both themes so its dark wordmark remains readable on the dark canvas.
- Spacing follows a 4px base. Controls use 4px corners, surfaces 8px. Only the search control group has a small shadow; static cards no longer move on hover.
- Body text is 16px, metadata 14px, section headings 20px, page headings 28–32px, and the desktop Home title 40px. Sizes use rem with unitless line height and local Korean/Japanese font fallbacks.
- Controls have a minimum 44px height. Default, hover, pressed, focus-visible and disabled states share token roles. Navigation selection also has an underline; errors contain text and recovery actions.
- Labels stay attached to fields. Long titles and category names wrap; search titles are no longer shortened. Supporting match snippets retain their existing bounds.
- At narrow widths the navigation disclosure expands in document flow. Escape and navigating from it return focus to Menu. Tab exits normally and closes it. Skip to content precedes the brand link.
- All routes share status surfaces and typography. Information pages have a narrower reading measure. PDF presentation stays inside a bounded reading area with recovery controls outside it.

## Comparison gallery

Screenshots use the same deterministic four-record sample index in English, with ICPC, Korean and Japanese titles. They are visual comparisons, not production data. The PDF viewer screenshots deliberately show an HTTP failure so recovery controls can be compared. Each image is full-page at 320px or 1280px, with a 900px viewport height. Baseline: `803f03c`.

| Screen             | 1280 light                                                                              | 1280 dark                                                                             | 320 light                                                                             | 320 dark                                                                            |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Home               | [Before](before/home-1280-light.webp) / [After](after/home-1280-light.webp)             | [Before](before/home-1280-dark.webp) / [After](after/home-1280-dark.webp)             | [Before](before/home-320-light.webp) / [After](after/home-320-light.webp)             | [Before](before/home-320-dark.webp) / [After](after/home-320-dark.webp)             |
| Search             | [Before](before/search-1280-light.webp) / [After](after/search-1280-light.webp)         | [Before](before/search-1280-dark.webp) / [After](after/search-1280-dark.webp)         | [Before](before/search-320-light.webp) / [After](after/search-320-light.webp)         | [Before](before/search-320-dark.webp) / [After](after/search-320-dark.webp)         |
| Categories         | [Before](before/categories-1280-light.webp) / [After](after/categories-1280-light.webp) | [Before](before/categories-1280-dark.webp) / [After](after/categories-1280-dark.webp) | [Before](before/categories-320-light.webp) / [After](after/categories-320-light.webp) | [Before](before/categories-320-dark.webp) / [After](after/categories-320-dark.webp) |
| Category hierarchy | [Before](before/category-1280-light.webp) / [After](after/category-1280-light.webp)     | [Before](before/category-1280-dark.webp) / [After](after/category-1280-dark.webp)     | [Before](before/category-320-light.webp) / [After](after/category-320-light.webp)     | [Before](before/category-320-dark.webp) / [After](after/category-320-dark.webp)     |
| Contest            | [Before](before/contest-1280-light.webp) / [After](after/contest-1280-light.webp)       | [Before](before/contest-1280-dark.webp) / [After](after/contest-1280-dark.webp)       | [Before](before/contest-320-light.webp) / [After](after/contest-320-light.webp)       | [Before](before/contest-320-dark.webp) / [After](after/contest-320-dark.webp)       |
| Detail             | [Before](before/detail-1280-light.webp) / [After](after/detail-1280-light.webp)         | [Before](before/detail-1280-dark.webp) / [After](after/detail-1280-dark.webp)         | [Before](before/detail-320-light.webp) / [After](after/detail-320-light.webp)         | [Before](before/detail-320-dark.webp) / [After](after/detail-320-dark.webp)         |
| PDF recovery       | [Before](before/viewer-1280-light.webp) / [After](after/viewer-1280-light.webp)         | [Before](before/viewer-1280-dark.webp) / [After](after/viewer-1280-dark.webp)         | [Before](before/viewer-320-light.webp) / [After](after/viewer-320-light.webp)         | [Before](before/viewer-320-dark.webp) / [After](after/viewer-320-dark.webp)         |
| Source file        | [Before](before/source-1280-light.webp) / [After](after/source-1280-light.webp)         | [Before](before/source-1280-dark.webp) / [After](after/source-1280-dark.webp)         | [Before](before/source-320-light.webp) / [After](after/source-320-light.webp)         | [Before](before/source-320-dark.webp) / [After](after/source-320-dark.webp)         |
| Upload guide       | [Before](before/contribute-1280-light.webp) / [After](after/contribute-1280-light.webp) | [Before](before/contribute-1280-dark.webp) / [After](after/contribute-1280-dark.webp) | [Before](before/contribute-320-light.webp) / [After](after/contribute-320-light.webp) | [Before](before/contribute-320-dark.webp) / [After](after/contribute-320-dark.webp) |
| Copyright          | [Before](before/copyright-1280-light.webp) / [After](after/copyright-1280-light.webp)   | [Before](before/copyright-1280-dark.webp) / [After](after/copyright-1280-dark.webp)   | [Before](before/copyright-320-light.webp) / [After](after/copyright-320-light.webp)   | [Before](before/copyright-320-dark.webp) / [After](after/copyright-320-dark.webp)   |

## Validation scope

Local validation passed `format:check` → `lint` → `analyze` → `build`, followed by all 68 Playwright tests (45 existing and 23 added). The production build retained 319 route pages and 247 editorial preview images.

`tests/design.spec.ts` checks all screen types in en/ko/ja, light/dark, at 320/768/1280 CSS pixels, then doubles root text size on each route. It uses long multilingual titles and checks element/document overflow. The 320 CSS pixel viewport covers reflow equivalent to a 1280px viewport at 400% page zoom. Native input/select editing and PDF document content are excluded from text-clipping assertions; browser-native controls retain their full accessible values.

Keyboard regression covers Skip → main, Menu → Escape, menu navigation → trigger, Search → query/category/year → result → View/Download. Separate checks cover leaving the menu by Tab, saved theme/language, reduced motion, failure reload, missing records, empty results and Clear. Theme tests calculate WCAG sRGB contrast for text (4.5:1) and control/focus boundaries (3:1), including primary action default/hover/pressed and highlight/error pairs.

Existing tests continue to cover search URLs, Back/refresh, matching/ranking/highlighting, IDs, metadata and preview contracts, caching, PDF timeout/failure/retry/cleanup and Markdown/text source links. No data schema, index generation or preview generator changes are required.

Automated DOM/contrast checks do not establish a screen-reader audit or certify the browser's built-in PDF UI. Native PDF controls and document scrolling are browser-owned and are checked separately from application reflow.

On 2026-10-25, desktop Chrome was also checked with its native page zoom at 400% on Home, search, detail and the PDF viewer using the checked-in 247-record index. The 2024 ICPC Asia Pacific Championship PDF loaded successfully and remained contained with independent document scrolling. The external Download action remains available outside the PDF area. Zoom was restored to 100% after the check. Other browsers and screen-reader output were not manually audited.
