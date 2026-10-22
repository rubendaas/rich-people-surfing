# Generated production artwork

Generated with the built-in `image_gen` tool on 22 October 2026. These are original satirical editorial caricatures, not endorsements. Exact production prompts are preserved in `prompts.json`.

The current opening adds an original exhausted meme face: [`you-meme.md`](you-meme.md) records its exact prompt, generation method, export, and chin anchor. The production file is `../public/art/you-meme.webp`; its unchanged original is `masters/you-meme.png`. It shrinks onto a plain code-drawn stick body, deliberately unlike the moguls.

The first Bezos sprite was generated and inspected as the style pilot. It informed Musk, Altman, the visitor, and foam. Each surfer’s base image was then the identity/registration reference for its leaning pose. Genuine transparent alpha was requested and verified (RGBA with fully transparent pixels).

- `masters/`: the original eight transparent PNG outputs plus the new meme face, unchanged.
- `../public/art/`: eight 900px-wide WebP exports (quality 88; alpha quality 100), plus the full-resolution 1254px meme face (quality 94); about 1.1 MB in total.
- `../src/data/assets.json`: original dimensions, nominal display width, pose, and normalized pivot. Surfer board-contact pivot is approximately `(0.5, 0.87)`; the complete sprite is translated/rotated as one piece.
- `prompts.json`: complete prompts, tool, date, reference relationships.

The active scene uses the three base mogul sprites and the new meme head on a code-drawn stick body. The original visitor, foam, and lean poses remain available for the archived scene and export helpers.

All base/lean images were inspected. Faces and boards stay in frame; alpha is preserved. Actual display sizing was inspected at desktop and 390px mobile widths on warm paper and cobalt. Base/lean registration is anchored to the board rather than the changing head pose. Generated foam is decoration, never part of the measured extent of a money wave.

Run `node scripts/assets.mjs` to reproduce web exports from committed masters. This does not invoke image generation or require credentials.

The release audit also checks the new face in the asset manifest, all four 1200 × 630 social images, favicon loading, self-hosted fonts, and portrait bounds in the production build. The rightmost surfer is clamped to the screen width to preserve its full board on narrow phones.

Fonts are self-hosted Fontsource Big Shoulders Display and DM Sans under the SIL Open Font License; licenses are copied into `dist/licenses/` at build time. The social-image builder expands the bundled WOFF1 font to a temporary SFNT inside `node_modules/.cache/` for Sharp/Pango; no system font installation is needed.
