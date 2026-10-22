# Implementation notes — 22 October 2026

## Current experience

A full-height scene opens with an original AI-generated, exhausted meme face filling the screen. Scrolling reveals the plain, gender-neutral stick figure, builds the personal line through an illustrative sequence of hard work, and then pulls far back until all three company waves fit on one axis. The long geometric pullback makes the visitor a dot before the moguls come into view.

The opening responds immediately to scrolling. A piecewise scroll mapping spends 20% of the physical scroll on the first 32% of the story, in a 1000svh section. This roughly halves the opening distance while keeping the billions pullback close to its previous length. A bouncing arrow indicates scrolling; reduced motion disables it.

Wheel/trackpad gestures, vertical swipes, and navigation keys settle on authored story beats with a short eased arrival. Fading momentum is absorbed. Renewed wheel acceleration, a new gesture, or sustained steady input can move on without waiting for the trackpad to become completely quiet; a deliberate second swipe during travel is queued. This prevents the earlier indefinite lock on continuous trackpad events. The effort sequence pauses on work, bills, savings, and the completed personal line; the pullback retains several stops before the moguls arrive. Gestures work in both directions. Scrollbar dragging and direct stage links remain available. The ending and dialogs scroll normally, browser pinch zoom passes through, and reduced motion bypasses snapping. `lib/scrollSnap.ts` owns input handling and cancellation; scroll position still drives the scene and its shared scale.

Controls are introduced in stages. The editable USD/EUR amount appears during the personal-line build. Stage buttons let the visitor revisit earlier beats or skip ahead; reduced motion shows the full comparison immediately. Sources remain available. There is no person selector, financial lens switch, active guest-pass, or sharing flow.

The three waves show Amazon’s annual cash capital expenditure, xAI’s funding round, and OpenAI’s committed funding. The $25,000 personal amount is explicitly illustrative net worth, not income or an average-wealth statistic. Its early build-up illustrates effort, not an earnings forecast, savings plan, or dated history. The visible afterword acknowledges AI-made code and artwork, enjoyment of the tools, and the limits of an evening’s satirical webpage.

## Scale contract

- Height above zero measures USD on one linear ruler shared by the visitor and all three company waves. Equal amounts have equal heights at every camera position.
- The opening personal-line build is an illustrative introduction. Once complete, scrolling changes the zoom geometrically so the camera travels from thousands to billions while all amounts stay fixed. The Y-axis ticks expose the current scale. This is not a time series.
- Subpixel heights remain subpixel. A hollow locator marks the visitor’s position without creating a minimum measured amount.
- The screen-filling meme face, stick figure, boards, and water styling are illustrative, not measured dollar areas. The gender-neutral visitor deliberately differs from the generated mogul portraits.
- Each company wave keeps its own amount and label. Spending, funding, commitments, and personal net worth have different economic meanings; they are never summed or presented as interchangeable.
- Zero and negative inputs do not become positive heights or meaningless ratios. Currency conversion uses the dated FX snapshot once.
- Reduced motion retains the values and controls without requiring animated zooming.

The earlier horizontal sine-wave profile is not the main scene’s financial measure. Each current wave finishes on a plateau at its measured dollar height rather than returning to zero.

## Code and retained helpers

`App.vue` owns the active scene, staged controls, and AI afterword. `ScaleScene.vue` renders the face, personal-line build, and three-wave pullback. `SourceDrawer.vue` explains the shared ruler and retains all three company records, dated source links, scope, FX, privacy notes, and archived personal-wealth records. `lib/journey.ts` defines the four stages, face transition, personal build, and camera pullback. `lib/scale.ts` provides linear pixel heights and dollar ticks. `lib/model.ts` and `src/data/` hold formatting, validation, conversion, and financial records.

Earlier `OceanScene.vue`, `PersonalReveal.vue`, `AmountLanes.vue`, and `lib/share.ts` are retained as inactive components/export helpers. Their older horizontal diagrams and guest-pass behavior are not part of the current scroll journey. `scripts/social.mjs` still builds public invitation pages and social images. Each portrait card uses its corresponding company record, and every invitation opens the same three-wave scene. These images are illustrations, not quantitative charts. The generator no longer initializes a person-selection hash; legacy hashes can remain in incoming URLs but have no selection behavior.

Inputs live only in tab memory. The page has no financial-data fetch, account, analytics, or browser persistence. Public URLs must never include the visitor’s number. Build output is static; publishing is the owner’s responsibility.

## Verification status

The production build, 28 unit tests, and twelve browser acceptance tests pass for this revision. Browser checks cover desktop and mobile stage progression, a hard trackpad fling and momentum tail, renewed swipes without an idle gap, retaining a swipe during travel, continuous gentle wheel input, reverse navigation, touch swipes, keyboard beats, exit into the afterword, the growing personal amount, shared ratios across all three waves, stable plateau endpoints, stage navigation, editable amounts, currency conversion, zero/debt/large values, source-dialog focus, reduced motion, and private input remaining local. Screenshots cover the opening face, effort, completed personal line, pullback, all three waves, and the AI afterword at 1440 × 1000 and 390 × 844. No browser runtime errors or horizontal page overflow were observed.

## Source records

The committed records were checked 22 October 2026. This redesign retains the data rather than refreshing it.

- Amazon’s 2025 annual report records **$128.3 billion** in cash capital expenditure, covering technology infrastructure and fulfillment capacity. This is company-wide completed annual spending, not an AI-only figure or 2026 guidance.
- xAI’s 6 January 2026 announcement records a completed **$20 billion Series E**. This predates its February 2026 acquisition by SpaceX.
- OpenAI’s 31 March 2026 announcement records **$122 billion in committed capital** in a closed round. Committed is not equivalent to received or spent.
- Forbes’s annual list uses a **1 March 2026** valuation snapshot: Bezos **$224 billion**, Musk **$839 billion**. These are dated estimates, not live fortunes or cash holdings.
- The fixed ECB snapshot is **EUR 1 = USD 1.1234**, dated **21 October 2026**. No inflation adjustment is applied.

Exact source URLs, publication dates, checked dates, status, scope, and overlap notes remain in `src/data/records.json` and `benchmarks.json`. The old Census household-income benchmark is retained in data but is not the opening personal amount. Nothing is summed across potentially overlapping flows.

## Updating and checking

Read the primary source before changing a record. Preserve the metric, period, status, scope, and person/company distinction. Missing estimates remain unavailable. Future ranges or “up to” claims need explicitly bounded geometry and labels before being admitted as records.

Run the build and unit suite, then exercise the desktop/mobile scroll journey. Check the initial face, illustrative line build, long pullback, and final three-wave view. During the pullback, increasing scroll must expand the visible dollar scale, shrink the visitor’s measured height, and leave all three company values fixed. Check stage buttons, delayed amount controls, input validation, zero/debt, EUR conversion, source-dialog focus, reduced motion, overflow, legacy share URLs, and absence of private input in storage, requests, and URLs.

Tests and screenshots are development checks, not proof of physical-device behavior or public social-crawler support. No production origin is deployed by these commands.

## Upload release audit

`npm run test:production` serves `dist/` directly, without Vite or an SPA fallback. It verifies all nine transparent image exports, four 1200 × 630 social images, font licenses, the SVG favicon, and self-hosted fonts. The opening, effort, completed line, pullback, and final portraits are checked at 1440 × 1000, 1280 × 720, 768 × 1024, 390 × 844, and 360 × 740. Direct `/share/bezos/`, `/share/musk/`, and `/share/altman/` loads must resolve their assets and open the same three-wave scene. Production screenshots are retained under ignored `test-results/production/`.

The audit corrected slight horizontal clipping of the rightmost portrait on narrow phones. It also brought the meme face into the reproducible nine-asset exporter and replaced the production checker’s retired guest-pass selectors with the current scene. The archive `sorry-youre-plankton-dist.zip` contains the fresh `dist/` contents at its root. No runtime server application is required.

The first upload to `https://studioalloy.space/sorry-youre-plankton/` exposed a deployment-path mismatch: the earlier document-root build requested `/assets/…` (404), while the uploaded files were at `/sorry-youre-plankton/assets/…` (200). `site.config.json` now records that public origin and base path. Vite’s production build/preview, the social generator, and the static production checker share those defaults. Local development retains `/`. `BASE_PATH` and `SITE_URL` can override the destination for another host. Extract the release archive into the existing server subdirectory and replace the previous files.
