# Data and editorial research

Source discovery checked **22 October 2026**. This is a source plan and cast assessment, not an approved production dataset. Historical announcements below establish relevance and illustrate metric differences; they must be checked for revisions before appearing as “current” numbers.

## Is there a public API?

**Yes, for parts of the story.** The useful free foundation is the SEC’s public EDGAR/XBRL API. It supplies reported financial facts for filing entities, without an API key. It is not a normalized feed of all AI investment, private fortunes, or government promises. Its browser CORS restriction also makes a preparation-time download more suitable than a live browser request.

Primary documentation: [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces).

Documented endpoint shape: `https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json`.

Use it as an optional research/import aid. A selected financial concept still needs review for period, scope, leases, and comparability. Do not blindly sum year-to-date disclosures as if they were independent quarters. Company-specific extension disclosures may require reading the filing rather than relying on aggregate API facts. Follow the SEC’s access policy when importing.

**Recommended first version:** manually review a small number of official disclosures and commit the resulting JSON. Add an import script only when maintenance justifies it. Review imported updates before publishing.

## Source map

| Need | Preferred source | Access and editorial treatment |
| --- | --- | --- |
| Reported public-company CapEx | SEC filings and company investor-relations releases | Optional SEC JSON import; verify the definition and fiscal dates. |
| Current spending guidance | Latest earnings release, shareholder letter, and earnings-call materials | Manual extraction. Keep guidance separate from actual results and retain ranges. |
| Model-company financing | The company and named investors’ official announcements | Manual records. Funding is not CapEx or valuation. |
| Multiyear infrastructure promises | Official project announcements, then later status updates | Manual records with period, status, and overlap notes. |
| Country-level AI investment context | Stanford HAI AI Index, economy chapter and public data | Use the report’s definition and covered year. Do not equate private investment with total national spending. |
| European and Chinese policy | Commission, national government, and official program documents | Distinguish public funding, mobilization goals, and private pledges. |
| Personal fortunes | [Bloomberg](https://www.bloomberg.com/billionaires/) or Forbes estimates | Manually record a dated estimate; no production scraping dependency. |
| EUR/USD and other supported FX | ECB reference rates | Snapshot a dated rate during preparation; no live conversion dependency. |

[Stanford’s 2026 report page](https://hai.stanford.edu/ai-index/2026-ai-index-report) links both the report and public data. It explicitly cautions that private-investment comparisons can understate Chinese spending because of government guidance funds. Country context should preserve that limitation.

The [ECB provides a documented data API](https://data.ecb.europa.eu/help/api/data-examples), including CSV responses. An example monthly USD/EUR series is `https://data-api.ecb.europa.eu/service/data/EXR/M.USD.EUR.SP00.A?format=csvdata`. Choose and disclose whether the snapshot uses a period average or a particular reference date. Keep currency conversion separate from inflation adjustment.

There is no identified single free public API that adequately covers every planned metric and entity. Do not turn an unofficial billionaires API or a commercial financial aggregator into a launch dependency.

## Evidence for the cast and story

### Public company infrastructure

- **Amazon / Bezos, with Jassy as the operator:** [Jassy’s 2025 shareholder letter, published in 2026](https://www.aboutamazon.com/news/company-news/amazon-ceo-andy-jassy-2025-letter-to-shareholders) discusses capital spending and the AI infrastructure opportunity. It is a useful source of context, not a guarantee that its forecast remains the latest. Check later releases before selecting an amount. Keep broader Amazon spending correctly labeled.
- **Microsoft / Nadella:** the [FY2026 Q4 earnings call](https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4) is especially useful for understanding how leases and accounting changes affect headline CapEx. Preserve the relevant definition; do not compare figures with different lease treatment silently.
- **Meta / Zuckerberg:** the [2025 annual report](https://www.sec.gov/Archives/edgar/data/1326801/000162828026025534/meta-12312025x10kars.htm) distinguishes property/equipment purchases and investments, and describes forward spending for AI and the core business. Later guidance must supersede older guidance explicitly.
- **Alphabet / Pichai:** start with [Alphabet investor relations](https://abc.xyz/investor/). The research pass identified Alphabet as a major infrastructure candidate, but did not lock a specific current financial release. That remains a source-selection task before production. Page/Brin are optional founder representatives, not two additional spending pools.

### Financing and supply relationships

- **Musk / xAI within SpaceX:** [xAI’s acquisition announcement](https://x.ai/news/xai-joins-spacex), dated 2 February 2026, establishes the changed ownership. Historical xAI funding and later consolidated company figures need distinct records. If AI-only expenditure cannot be established, use a correctly scoped disclosed funding or project metric.
- **Altman / OpenAI, Son / SoftBank, Ellison / Oracle:** the [official Stargate announcement from SoftBank](https://group.softbank/en/news/press/20250122) identifies the original equity funders. [OpenAI’s Oracle infrastructure update](https://openai.com/index/stargate-advances-with-partnership-with-oracle/) provides project context. The shared project is a reason to explain financing relationships, not to count its headline under every participant and add the results.
- **Huang / NVIDIA:** [the OpenAI–NVIDIA systems partnership announcement](https://openai.com/index/openai-nvidia-systems-partnership/) shows the intersection of investment and equipment deployment. Announcement terms can be conditional and later revised; do not treat an intent or maximum as paid investment. NVIDIA’s supplier role warrants a distinct lens, rather than ranking its revenue as customer spending.
- **Amodei / Anthropic:** a strong next candidate for the model-financing chapter. A specific current primary financing source still needs to be selected; no amount is approved by this research pass.

### Europe and China

- **Ursula von der Leyen / EU:** the [Commission’s InvestAI announcement](https://digital-strategy.ec.europa.eu/en/news/eu-launches-investai-initiative-mobilise-eu200-billion-investment-artificial-intelligence), dated February 2025, describes an ambition to mobilize €200 billion, including a €20 billion fund for gigafactories. Label it a mobilization initiative and investigate subsequent implementation. It is not a statement that the EU has already spent €200 billion.
- **Arthur Mensch / Mistral and Christophe Fouquet / ASML:** [Mistral’s September 2025 financing announcement](https://mistral.ai/news/mistral-ai-raises-1-7-b-to-accelerate-technological-progress-with-ai/) connects a European model company and semiconductor supplier. Useful for a European financing story; check subsequent rounds rather than presenting this historical round as the latest.
- **Macron / France:** the [Élysée’s February 2025 announcement](https://www.elysee.fr/emmanuel-macron/2025/02/11/faire-de-la-france-une-puissance-de-lia) describes €109 billion of announced investment projects. The [project breakdown](https://www.elysee.fr/admin/upload/default/0001/17/d9c1462e7337d353f918aac7d654b896b77c5349.pdf) includes private and foreign-company projects. This must not become “Macron’s wealth” or be blindly added to European and company amounts.
- **Eddie Wu / Alibaba:** [Alibaba’s February 2025 announcement](https://home.alibabagroup.com/en-US/document-1830678592242057216) describes a three-year AI/cloud infrastructure plan. Its [September 2025 update](https://home.alibabagroup.com/en-US/document-1911884625546838016) signals further investment ambition. This is a more concrete company-money story than attributing all Chinese AI investment to Xi.
- **Xi Jinping / China:** the [official April 2025 policy account](https://english.www.gov.cn/news/202504/29/content_WS68100ef1c6d0868f4e8f2275.html) supports a role in the industrial-policy chapter. It does not establish a comparable personal or national investment amount. Do not manufacture one. Stanford’s private-investment data is a separate country metric, with its own limitations.
- **Lisa Su / AMD:** a plausible supplier counterpart to Huang. Current financial/project source selection and portrait research remain to be done before inclusion.

**Bill Gates:** reserve for a founder-history or personal-fortune comparison. Use Nadella for Microsoft’s contemporary operational story. Do not assign Microsoft’s expenditure to Gates simply because he is recognizable.

## What still needs research before the build’s data lock

1. Choose the first complete chapter and its compatible reporting periods.
2. Verify current relationships and primary source figures for every visible character.
3. Select actual spending or current guidance deliberately; mark superseded forecasts.
4. Confirm funding/project amounts, disbursement status, overlapping partnerships, and range treatment.
5. Capture dated personal-fortune estimates only for people included in that lens. Leave unavailable estimates unavailable, particularly for political leaders.
6. Select an FX snapshot and a dated everyday benchmark.
7. Select the evidence behind the final “what do I get?” beat. No unsupported claims about jobs, taxes, energy bills, water, or public returns.
8. Research portraits from current visual references before illustration production. Every avatar must remain labeled.

## Design and technical references

- [Wealth, shown to scale](https://eattherichtextformat.github.io/1-pixel-wealth/): physical scrolling and legible financial comparison.
- [SOMO](https://www.somo.nl/): editorial reference and a possible source of corporate-power questions; no affiliation is implied.
- [Vue quick start](https://vuejs.org/guide/quick-start.html): proposed static application tooling.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): scroll-linked motion and pinned scene behavior.
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share): device-native sharing where supported; capability checks and download/copy fallbacks remain necessary.
