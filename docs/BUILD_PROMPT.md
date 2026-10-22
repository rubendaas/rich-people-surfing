# Implementation prompt — Sorry, You’re Plankton

Use this prompt when the owner explicitly starts the implementation phase. Until then, discuss the plan and editorial choices without scaffolding or running an application.

---

Build **Sorry, You’re Plankton**, an original interactive editorial webpage about the scale of money behind AI. Tagline: **Big money. Tiny you.** The central metaphor is an absurdly exclusive surf club: recognizable technology figures ride investment waves, and the visitor eventually adds themselves to the water.

The owner has chosen the primary takeaway: **“The scale of AI investment is almost impossible to comprehend.”** Build the main journey around curiosity, humor, and tangible financial magnitude. Ownership and public benefit are optional onward exploration.

The chosen audience is **a broad public with no finance or AI knowledge**. Introduce people and organizations briefly, start with familiar amounts, explain each financial metric in plain language, and present one idea per scroll beat. Spell out million, billion, and trillion before abbreviating them. Keep detailed methodology available on demand, with source links beside the figures. Label location-specific everyday benchmarks honestly.

The chosen voice is **sharper satire**, with “Lovely day for a swim. Shame they bought the ocean.” as the tone reference. Aim the humor at the powerful surfers and the absurd scale. Pair pointed headlines with plain, sourced financial captions, and keep the visitor included in the joke.

The chosen ending is **“Where do I fit?” — personal scale and a sharp, shareable punchline**. Make adding yourself, finding your place in the wave, and sharing or saving the result the main call to action. The personal reveal is the narrative finish.

Read `PLAN.md` and `docs/RESEARCH.md` first. Incorporate the owner’s later editorial decisions. Inspect the repository and applicable instructions before changing files. The core editorial interview is complete: when implementation is requested, proceed with these decisions and resolve routine design choices without repeating the intake.

## Constraints

- Vue 3, Vite, TypeScript, and GSAP with ScrollTrigger.
- Static browser application. No database, backend, accounts, runtime financial API dependency, or secrets.
- Develop and run locally. The owner will self-host the static build. Do not register, synchronize, or publish a ChatGPT Site or deploy elsewhere.
- Use normal browser scrolling, responsive layouts, keyboard-accessible controls, and reduced-motion alternatives.
- Keep financial data, people, organizations, and editorial copy separate.
- Generate actual raster illustrations and sprites with the built-in image-generation tool. Use transparent PNG masters and optimized local PNG/WebP files. Do not illustrate people, boards, or decorative art with hand-built SVG, CSS, canvas drawing commands, or emoji.

## Experience

Create a satisfying two-to-four-minute primary story: invitation → choose a surfer → learn the financial ruler → surf through the scale → add yourself → find your pixel → preview and share your guest pass. Keep sources and optional context accessible throughout. Finish the story on the personalized result and its punchline.

Start with Bezos, Musk, and Altman for a complete vertical slice. Expand selectively to Zuckerberg, Pichai, Nadella, and Huang. Research the further European, Chinese, and financing cast from the plan before inclusion. Keep founder, operator, supplier, investor, and political roles accurate and visible.

Keep investment waves, personal-fortune comparisons, and government ambitions in clearly differentiated chapters. Do not force incompatible numbers into a leaderboard. Return the main personal reveal to the selected AI investment wave, explicitly identifying the corporate metric and period alongside the visitor's wealth snapshot. Offer a separate personal-fortune lens for a comparison between two wealth snapshots.

## Visual direction

Combine Dutch editorial clarity, campaign-poster typography, and witty magazine-cartoon drawing with flat colors. Use warm paper, dark ink, cobalt water, acid yellow, coral, and restrained green. Make the composition confident and spacious.

Generate original satirical caricatures with oversized heads, self-important poses, simple expressive bodies, distinctive boards, and recognizable physical cues. Produce one polished pilot surfer, inspect it, and use it as a style reference for the remaining cast. The first usable pack includes Bezos, Musk, and Altman, each with a base surfing pose and a leaning/reaction variant, plus the visitor on a floatie and a small reusable foam/spray set. Produce illustrated textures only where the composition needs them.

Use complete transparent character-and-board cutouts initially. Keep camera angle, proportions, face, board, clothing, line weight, and palette consistent between variants. Request actual alpha transparency, sufficient padding, and no baked-in text or financial numbers. GSAP will move, rotate, and switch these sprites; separately generated body parts are optional only when alignment has been verified.

Copy selected generated assets into the repository. Preserve source masters and generation notes; create optimized local web exports. Start with individual pose files and an asset manifest recording dimensions, poses, display size, and board-contact pivots. An atlas is optional once frames are verified. Check recognizable likeness at intended screen size, clean alpha on contrasting backgrounds, resolution, cropping, pose consistency, and contact with the wave. Reuse the same generated artwork in the selector, scene, and share card. A mood board or unused generated image does not satisfy this requirement. If generation is unavailable, report the asset blocker instead of substituting code-drawn illustrations.

Lead tone reference: “Lovely day for a swim. Shame they bought the ocean.” Supporting copy candidates: “You brought a floatie. They brought a data centre.” “Different planet. Same ocean.” “Find my pixel.” The tone is selected; final wording remains open. Use humor sparingly enough that the factual story remains clear.

## Scale and motion

Wave horizontal length encodes dollars with one common linear ruler per comparison. Doubling an amount doubles its world-space distance. Height, surfer size, and foam are decorative. Align comparison origins and zoom all lanes together.

Use explicit ruler transitions when changing zoom between story beats. Subpixel values receive an honestly labeled marker/magnified inset. Never silently clamp financial geometry or use a logarithmic ruler.

Use ScrollTrigger for pinned horizontal travel driven by native vertical scrolling. Render the accurately scaled wave surface with Canvas 2D and keep labels/rulers readable in HTML/CSS. Generated water and foam art may decorate the surface without changing the financial geometry. Position and tilt the raster surfers using their board-contact pivots and a shared wave function. Provide chapter jumps and a readable reduced-motion presentation. Render a bounded scene window rather than an enormous document or image.

## Data

Before presenting any amount as real, select its current appropriate source and add a dated record. Prefer official filings, investor releases, company announcements, government program documents, and Stanford HAI for country context. SEC and ECB APIs may aid preparation; visitors should read local reviewed snapshots.

Each record needs the entity, metric, value/range, native currency, reporting period or valuation date, status, scope, source URL, publication/check dates, currency conversion if applicable, and overlap notes.

Keep actual, forecast, commitment, target, funding, revenue, and estimated wealth distinct. Preserve ranges and “up to” language. Do not describe broad company CapEx as exclusively AI spending without support. Do not double count shared projects or treat missing values as zero. Do not fabricate current fortunes or assign state budgets to individual politicians.

## Personal comparison and sharing

Invite an estimated net worth with a plain-language definition, currency choice, sample values, skip option, and deliberate zero/debt behavior. Keep the input in browser memory and out of analytics and URLs.

Build the “find my pixel” reveal and a beautiful guest-pass export. The result card must explain what it compares, show the source date, and provide a reason to try the experience. Preview before sharing, hide raw input by default, and make clear that precise ratios can also disclose approximate wealth. Offer a nonnumeric card.

Start the reveal close to the visitor's floatie, pull back to the selected investment wave, and keep a “you are here” arrow visible. Settle into a composition that can become the share card. Candidate punchline: “I'm in this picture. Technically.” Primary action: “Share my place in the wave.” Recipient invitation: “Where do you fit?” Match copy to the actual comparison and provide a save-image alternative.

Compose personalized share images locally from the generated raster assets and separately rendered text; do not run AI image generation in the visitor's browser. Support native file sharing where available, image download, and copy-link fallback. Copied links preserve public surfer/chapter selection and invite the recipient to enter their own amount; they do not expose the sender’s financial input. Prebuild a few public social landing pages and Open Graph images. Do not promise personalized link previews from a static-only app.

Prepare layouts that could support “AI Surf Reports” around earnings announcements and vertical “Find My Pixel” clips. Do not send outreach, post to social media, register domains, or add production analytics without a separate request.

## Delivery

Generate and integrate the first real asset pack while building one complete, polished journey before widening the cast. Make sensible routine choices and keep the owner informed about meaningful findings and tradeoffs. Do not call the visual work complete while generated assets are missing or replaced with code illustrations.

Verify the financial scale and ratio edge cases, source labels, visitor privacy, mobile and keyboard interactions, reduced-motion behavior, and share fallbacks. Run the production build and relevant meaningful checks. Leave the working app available locally and provide its URL, commands, and static-hosting instructions. Report any remaining verification limits accurately.
