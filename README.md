# Sorry, You’re Plankton

**Big money. Tiny you.** A playful, scroll-driven comparison of your money and three enormous company waves.

Start with an exhausted, gender-neutral meme face filling the screen. Scroll to reveal the stick figure, build a personal line through a few beats of hard work, then pull far back through thousands, millions, and billions. The visitor becomes a dot before all three moguls and their company waves finally fit in view.

The opening responds on the first scroll and moves through the personal introduction in roughly half the previous scroll distance, with a bouncing arrow as a cue. The long pullback keeps its sense of distance.

Scroll gestures settle on story beats. Fading trackpad momentum is absorbed, while a renewed swipe or continued steady scrolling moves on without waiting for complete silence. A second swipe during travel is retained. Swipes and arrow/page keys follow the same beats; the ending and dialogs scroll normally. Dragging the scrollbar and using stage buttons remain available.

The interface appears as the story needs it: first you, then the editable $25,000 example, then the scale. Stage buttons let you go back or skip ahead. Reduced motion shows the complete comparison immediately. Amazon, xAI, and OpenAI each have a wave on the same linear dollar ruler; there is no person selector or financial lens switch.

Built with Vue 3, TypeScript, and Vite. Data, fonts, and artwork are local. Financial inputs stay in memory, with no account, analytics, backend, or runtime financial API.

## Run and build

Requires Node.js 22.12+.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**.

```sh
npm run build
npm run preview
```

The production preview runs at **http://127.0.0.1:4173/sorry-youre-plankton/**. The default production destination is **https://studioalloy.space/sorry-youre-plankton/**, configured in `site.config.json`. Upload the contents of `dist/` into that server folder. The host must serve directory `index.html` files. No SPA rewrite is needed.

The supplied `sorry-youre-plankton-dist.zip` contains those same files at the archive root. Extract it into the server’s `sorry-youre-plankton/` folder, replacing the previous upload. This release uses `/sorry-youre-plankton/` as its base path; it includes the fonts, favicon, artwork, social images, invitation pages, and font licenses. The server needs no Node.js process or financial API.

For another server path or domain, override the configured path and origin:

```sh
BASE_PATH=/another-folder/ SITE_URL=https://your-domain.example npm run build
```

Use `BASE_PATH=/` to build for a document root. Local development remains at `/` unless overridden. When testing an overridden build, supply the same `BASE_PATH` to `npm run test:production` and `npm run preview`.

This only builds files; it does not publish a site. The build retains public invitation pages at `share/bezos/`, `share/musk/`, and `share/altman/` beneath the configured base path. Their portrait cards feature the corresponding company amount, and every page opens the same three-wave experience. New invitation pages do not add a selection hash; legacy `#surfer=…` links can remain in the URL without selecting a person. Social-image URLs use the configured public origin.

## The numbers

- Amazon: **$128.3 billion** in company-wide cash capital expenditure in 2025, including cloud and fulfillment infrastructure. Not AI-only spending or Bezos’s money.
- xAI: **$20 billion** raised in its January 2026 Series E, before its acquisition by SpaceX.
- OpenAI: **$122 billion** in committed capital in its March 2026 closed round. Not necessarily received or spent.

The editable **$25,000 is an illustrative net-worth example**, not a statistical average. The early line build-up illustrates effort; it is not an earnings forecast or timeline. EUR inputs use the committed ECB snapshot. Sources, dates, scope, and the scale method are available in the Sources dialog. Spending, funding, committed capital, and personal net worth have different economic meanings. The page compares their size without adding them together.

The archived Bezos and Musk personal-wealth records remain in the source drawer for reference, but are not plotted in the experience. This redesign does not refresh the committed source data.

## Check changes

```sh
npm test
npx playwright install chromium
# With the dev server running:
npm run test:browser
node scripts/inspect.mjs
# Check the actual upload folder on a plain static server:
npm run build
npm run test:production
```

Review the face, personal-line build, long pullback, and final three-wave comparison at desktop and mobile sizes. Check stage navigation, progressive amount controls, the changing dollar ruler, subpixel values, zero/debt input, keyboard controls, and reduced motion. Inspection screenshots go to ignored `test-results/`. Browser viewport checks do not replace physical-device testing.

The production check verifies all nine transparent WebP exports, social-image dimensions, font licenses, and direct invitation routes. It also checks image loading, portrait bounds, the icon, self-hosted fonts, stage controls, and reduced motion at desktop, laptop, tablet, and two phone sizes. Production screenshots go to `test-results/production/`.

## Maintain

Financial snapshots and exchange rates live in `src/data/`. Review sources before changing a value or calling it current. See [implementation notes](docs/IMPLEMENTATION.md) for the scale contract.

The generated mogul portraits and original exhausted meme face use optimized WebP files in `public/art/`. The visitor transitions into a deliberately plain stick figure, visually separate from the moguls. Artwork masters and provenance are in [`art/`](art/README.md). Earlier guest-pass components and export helpers remain in the repository, but are not part of the active interface.

The visible afterword acknowledges that the code and illustrations were made with AI through a lot of back-and-forth. The financial gap can be absurd while the tools remain exciting to use. This is a playful evening project, not a plan to change the world.

The original [plan](PLAN.md), [research](docs/RESEARCH.md), and [build brief](docs/BUILD_PROMPT.md) document the first design. The current scroll-first design supersedes their editorial layout, horizontal wave measurement, and matching visitor artwork requirements.
