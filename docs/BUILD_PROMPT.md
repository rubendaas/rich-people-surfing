# Implementation prompt — Silicon Swell

Use this prompt when the owner explicitly starts the implementation phase. Until then, discuss the plan and editorial choices without scaffolding or running an application.

---

Build **Silicon Swell**, an original interactive editorial webpage about the scale of money behind AI. Tagline: **Big money. Tiny you.** The central metaphor is an absurdly exclusive surf club: recognizable technology figures ride investment waves, and the visitor eventually adds themselves to the water.

The owner has chosen the primary takeaway: **“The scale of AI investment is almost impossible to comprehend.”** Build the main journey around curiosity, humor, and tangible financial magnitude. Ownership and public benefit are optional onward exploration.

The chosen audience is **a broad public with no finance or AI knowledge**. Introduce people and organizations briefly, start with familiar amounts, explain each financial metric in plain language, and present one idea per scroll beat. Spell out million, billion, and trillion before abbreviating them. Keep detailed methodology available on demand, with source links beside the figures. Label location-specific everyday benchmarks honestly.

Read `PLAN.md` and `docs/RESEARCH.md` first. Incorporate the owner’s later editorial decisions. Inspect the repository and applicable instructions before changing files. Continue the editorial interview from its first unanswered question; do not ask the owner to choose the primary takeaway or audience again.

## Constraints

- Vue 3, Vite, TypeScript, and GSAP with ScrollTrigger.
- Static browser application. No database, backend, accounts, runtime financial API dependency, or secrets.
- Develop and run locally. The owner will self-host the static build. Do not register, synchronize, or publish a ChatGPT Site or deploy elsewhere.
- Use normal browser scrolling, responsive layouts, keyboard-accessible controls, and reduced-motion alternatives.
- Keep financial data, people, organizations, and editorial copy separate.

## Experience

Create a satisfying two-to-four-minute primary story: invitation → choose a surfer → learn the financial ruler → surf through the scale → add yourself → find your pixel → preview and share your guest pass. Offer expandable context beneath the surface, “what do I get?”, and sources without interrupting the main experience.

Start with Bezos, Musk, and Altman for a complete vertical slice. Expand selectively to Zuckerberg, Pichai, Nadella, and Huang. Research the further European, Chinese, and financing cast from the plan before inclusion. Keep founder, operator, supplier, investor, and political roles accurate and visible.

Keep investment waves, personal-fortune comparisons, and government ambitions in clearly differentiated chapters. Do not force incompatible numbers into a leaderboard. Return the main personal reveal to the selected AI investment wave, explicitly identifying the corporate metric and period alongside the visitor's wealth snapshot. Offer a separate personal-fortune lens for a comparison between two wealth snapshots.

## Visual direction

Combine Dutch editorial clarity, campaign-poster typography, and witty magazine-cartoon drawing with flat colors. Use warm paper, dark ink, cobalt water, acid yellow, coral, and restrained green. Make the composition confident and spacious.

Create original, affectionate-but-sharp caricatures with oversized heads, simple expressive bodies, distinctive boards, and economical physical cues. Establish one coherent illustration system before producing the cast. Keep head/body/board layers suitable for animation. Avoid generic symbols standing in for portraits.

Strong copy candidates: “You brought a floatie. They brought a data centre.” “Different planet. Same ocean.” “Find my pixel.” Use humor sparingly enough that the factual story remains clear.

## Scale and motion

Wave horizontal length encodes dollars with one common linear ruler per comparison. Doubling an amount doubles its world-space distance. Height, surfer size, and foam are decorative. Align comparison origins and zoom all lanes together.

Use explicit ruler transitions when changing zoom between story beats. Subpixel values receive an honestly labeled marker/magnified inset. Never silently clamp financial geometry or use a logarithmic ruler.

Use ScrollTrigger for pinned horizontal travel driven by native vertical scrolling. Keep surfers in contact with the wave through a shared geometry function. Provide chapter jumps and a readable reduced-motion presentation. Render a bounded scene window rather than an enormous document or image.

## Data

Before presenting any amount as real, select its current appropriate source and add a dated record. Prefer official filings, investor releases, company announcements, government program documents, and Stanford HAI for country context. SEC and ECB APIs may aid preparation; visitors should read local reviewed snapshots.

Each record needs the entity, metric, value/range, native currency, reporting period or valuation date, status, scope, source URL, publication/check dates, currency conversion if applicable, and overlap notes.

Keep actual, forecast, commitment, target, funding, revenue, and estimated wealth distinct. Preserve ranges and “up to” language. Do not describe broad company CapEx as exclusively AI spending without support. Do not double count shared projects or treat missing values as zero. Do not fabricate current fortunes or assign state budgets to individual politicians.

## Personal comparison and sharing

Invite an estimated net worth with a plain-language definition, currency choice, sample values, skip option, and deliberate zero/debt behavior. Keep the input in browser memory and out of analytics and URLs.

Build the “find my pixel” reveal and a beautiful guest-pass export. The result card must explain what it compares, show the source date, and provide a reason to try the experience. Preview before sharing, hide raw input by default, and make clear that precise ratios can also disclose approximate wealth. Offer a nonnumeric card.

Generate personalized images locally. Support native file sharing where available, image download, and copy-link fallback. Copied links preserve public surfer/chapter selection and invite the recipient to enter their own amount; they do not expose the sender’s financial input. Prebuild a few public social landing pages and Open Graph images. Do not promise personalized link previews from a static-only app.

Prepare layouts that could support “AI Surf Reports” around earnings announcements and vertical “Find My Pixel” clips. Do not send outreach, post to social media, register domains, or add production analytics without a separate request.

## Delivery

Build one complete, polished journey before widening the cast. Make sensible routine choices and keep the owner informed about meaningful findings and tradeoffs.

Verify the financial scale and ratio edge cases, source labels, visitor privacy, mobile and keyboard interactions, reduced-motion behavior, and share fallbacks. Run the production build and relevant meaningful checks. Leave the working app available locally and provide its URL, commands, and static-hosting instructions. Report any remaining verification limits accurately.
