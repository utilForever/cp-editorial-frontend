# Social-preview fonts

These files are used only by `scripts/generate-route-previews.mjs`. They are not copied into `dist` or served as webfonts. Keep each font's license when updating the files.

- **Pretendard Regular/Bold** remains the primary font. Source: [Pretendard](https://github.com/orioncactus/pretendard). License: `LICENSE-Pretendard.txt`.
- **Source Han Sans Regular/Bold**, version **2.005R**, supplies missing CJK glyphs, including `𠮷`. Source: [Japanese full-coverage OTFs at commit `6c709ca`](https://github.com/adobe-fonts/source-han-sans/tree/6c709ca72d3d7c46ab42ebecc1a26e7d69595a37/OTF/Japanese). These use Japanese default glyph forms and retain the full CJK character set of this release; they are not the region-specific subsets. License: `LICENSE-SourceHanSans.txt`.
- **Noto Emoji** supplies monochrome emoji. `NotoEmoji.ttf` is the unmodified `NotoEmoji[wght].ttf` from [Google Fonts at commit `8b0a1d0`](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoemoji). License: `LICENSE-NotoEmoji.txt`.

System fonts are disabled. The same explicit font-file list is used for rendering. Han ideographs and recognized emoji sequences are rendered in separate SVG text chunks to preserve the surrounding Pretendard text and avoid Resvg's compound-emoji fallback limitation. The fallback fonts do not provide every Unicode character or every emoji sequence; regression snapshots cover representative CJK, supplementary CJK, single emoji, ZWJ, skin-tone, and flag sequences.
