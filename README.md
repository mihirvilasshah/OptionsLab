# Options Lab

An interactive, visual platform for learning options trading from first principles. It combines 28 structured lessons, payoff simulators, a 16-strategy lab, five calculators, a 103-term glossary, quizzes, a labelled option-chain explorer and a virtual paper-trading account.

The app is built for education. It does not place real orders, does not require an account, and never presents model output as live exchange data.

**Live demo:** <https://options-lab-sepia.vercel.app>

---

## Contents

- [Features](#features)
- [Data honesty: simulated vs live](#data-honesty-simulated-vs-live)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Learning content](#learning-content)
- [Tools](#tools)
- [Model assumptions](#model-assumptions)
- [Local persistence and privacy](#local-persistence-and-privacy)
- [Accessibility and SEO](#accessibility-and-seo)
- [Testing](#testing)
- [Deploying to Vercel](#deploying-to-vercel)
- [Adding content](#adding-content)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Disclaimer](#disclaimer)

---

## Features

### Learn

- **8 modules, 28 lessons**, each following the same eight-part format:
  1. A simple explanation
  2. A plain-English analogy
  3. A numerical example
  4. An interactive demo
  5. A chart or visual
  6. Common mistakes
  7. Key takeaways
  8. A two-question quiz
- Module progress, per-lesson completion, bookmarks of your place and lesson-to-lesson navigation.
- Searchable lesson index and module pages with estimated reading time.

### Practice

- **Playground** — long call, long put, buyer-vs-seller, what-if repricing, expiry table and P&L heatmap.
- **Strategy Lab** — 16 structures with model pricing, payoff diagrams, break-evens, max profit/loss, model probability of profit, expected value, a P&L surface, leg tables and failure modes.
- **Calculators** — option P&L and break-even, four vertical spreads, Black–Scholes with Greeks, position sizing and risk/reward.
- **Glossary** — 103 terms with definitions, examples, levels, categories and related-term navigation.
- **Quiz** — practice builder by difficulty/category/count, shuffled questions, explanations, best-score history and a date-based daily challenge.
- **Paper Trading** — ₹10,00,000 virtual capital, multi-leg INR option structures, Black–Scholes premiums, estimated margin, mark-to-market repricing, trade history and reset.
- **Market Lab** — an option-chain explorer with strikes, premiums, IV, open interest, a volatility smile, contract Greeks and a clearly labelled simulated data source.
- **Risk Playbook** — risk budgets, drawdown recovery, expectancy, a pre-mortem checklist, behavioural traps and short-premium risk.

### Platform

- Responsive layout from 320 px upward.
- Light, dark and system themes with persistence and no flash of the wrong theme.
- INR default with USD support in the Market Lab, calculators and strategy examples.
- Keyboard-accessible controls, visible focus states, skip link, semantic tables, chart alternatives and reduced-motion support.
- Metadata, canonical URLs, Open Graph image, JSON-LD, `sitemap.xml` and `robots.txt`.
- No backend required.

---

## Data honesty: simulated vs live

| Data | Default | If `MARKET_DATA_PROVIDER=finnhub` and a key is set |
| --- | --- | --- |
| Indian underlying quote | Deterministic simulated spot, labelled `SIMULATED` | Unchanged — simulated |
| US underlying quote | Deterministic simulated spot, labelled `SIMULATED` | Delayed Finnhub quote, labelled `DELAYED` |
| Option chain, premiums, IV, OI, volume | Model-generated with Black–Scholes and deterministic pseudo-random values | Still model-generated and labelled |
| Greeks | Local Black–Scholes estimates | Still local estimates |
| Paper-trading fills | Virtual, based on model premiums | Still virtual |
| Progress and portfolio | Browser local storage | Browser local storage |

The UI repeats these labels on the Market Lab, paper-trading page and disclaimer banners. No API key is ever sent to the browser: the optional Finnhub request happens only in the server route at `app/api/market/[symbol]/route.ts`.

**A model price is not a quote.** Strikes, implied volatilities and open interest in the simulated chain are generated for teaching. They are not an exchange order book, not a forecast and not suitable for trading decisions.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS v4 with CSS custom-property theme tokens |
| Components | Radix UI primitives with a local shadcn-style component layer |
| Icons | Lucide React |
| Charts | Hand-built accessible SVG components (no chart library) |
| Animation | Framer Motion, with reduced-motion handling |
| State | Zustand with `persist` and explicit hydration |
| Content | Typed local data modules |
| Tests | Vitest |
| Deployment | Vercel-compatible static/server output |

The charts are custom SVG so that colours follow the CSS theme, axes remain readable in both themes, and each chart has a text alternative. There is no client-side chart dependency.

---

## Quick start

### Prerequisites

- Node.js **20.9+** (Next.js 16 minimum). Node **22.12+** is recommended.
- npm 10+.

> Node 22.0–22.11 can hit a `require()` of an ES module error from Tailwind's CJS loader. This repository includes an npm override (`magic-string@0.30.21`) that keeps the build working on those versions. On Node 22.12+ the override is harmless.

### Install and run

```bash
npm install
cp .env.example .env.local   # optional; the app works with no environment variables
npm run dev
```

Open <http://localhost:3000>.

### Production build

```bash
npm run build
npm start
```

The build prerenders lessons, modules, strategies, glossary, playground, risk and the home page. `/markets`, `/quiz`, `/calculator` and the market API are rendered on demand so dates and daily challenges stay current.

---

## Environment variables

All variables are optional. Copy `.env.example` to `.env.local`.

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | No | Canonical URL base for metadata, `sitemap.xml`, `robots.txt` and Open Graph. Defaults to `https://options-lab-sepia.vercel.app`. Set this to your deployed URL. |
| `MARKET_DATA_PROVIDER` | Server | No | `simulated` (default) or `finnhub`. |
| `FINNHUB_API_KEY` | Server only | No | Enables delayed US stock quotes when the provider is `finnhub`. Never prefix with `NEXT_PUBLIC_`. |

No Supabase project, database, login or external service is required. If you add one later, keep secrets server-side and use Route Handlers or Server Actions.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack. |
| `npm run build` | Create an optimized production build. |
| `npm start` | Serve the production build. |
| `npm run typecheck` | Run `tsc --noEmit` in strict mode. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |

---

## Project structure

```text
app/
  api/market/[symbol]/route.ts   Server-only market snapshot endpoint
  calculator/                    Calculator hub and deep links
  glossary/                      Searchable glossary
  learn/                         Curriculum, modules and lessons
  markets/                       Option-chain explorer
  playground/                    Single-option payoff lab
  quiz/                          Practice builder and daily challenge
  risk/                          Risk playbook
  simulator/                     Paper trading
  strategies/                    Strategy list and detail pages
  error.tsx, loading.tsx, not-found.tsx
  sitemap.ts, robots.ts, opengraph-image.tsx

components/
  calculators/                   Five calculator implementations
  charts/                        Accessible SVG charts (line, payoff, heatmap, sparkline)
  demos/                         Interactive lesson demos
  glossary/                      Glossary explorer
  home/                          Home-page visuals
  layout/                        Navbar, footer, theme provider, store hydrator
  learn/                         Lesson renderer and progress UI
  market/                        Market Lab client
  quiz/                          Quiz runner and hub
  risk/                          Risk-budget demo
  simulator/                     Paper-trading UI
  strategies/                    Strategy explorer and lab
  ui/                            Design-system primitives

lib/
  content/                       Typed lesson content (eight modules)
  lessons.ts                     Module assembly and navigation
  options.ts                     Black–Scholes, Greeks, payoff and sizing math
  strategies.ts                  16 strategy definitions and analysis
  quizzes.ts                     Question banks and daily challenges
  glossary.ts                    103 glossary terms and search
  market/simulator.ts            Deterministic universe and chain generation
  market/providers.ts            Server-only provider abstraction
  utils.ts                       Currency, date and formatting helpers

store/
  progress.ts                    Completed lessons, quiz history, daily results
  simulator.ts                   Virtual cash, positions, margin and trades
```

---

## Learning content

| # | Module | Level | Lessons |
| --- | --- | --- | --- |
| 1 | Understanding the Basics | Beginner | 6 |
| 2 | Option Terminology | Beginner | 5 |
| 3 | How Call Options Work | Beginner | 4 |
| 4 | How Put Options Work | Beginner | 3 |
| 5 | Understanding Option Premium | Beginner/Intermediate | 3 |
| 6 | Option Greeks | Intermediate | 3 |
| 7 | Implied Volatility | Intermediate | 3 |
| 8 | Expiration & Option Lifecycle | Advanced | 3 |

Every lesson includes an interactive demo. Demo types include stock ownership versus options, leverage, contract building, strike ladders, buyer/seller mirror payoffs, premium anatomy, theta decay, a Greeks explorer, an IV simulator, a lifecycle timeline and scenario repricing.

---

## Tools

### Strategy Lab

The detail page for each strategy rebuilds every leg from the current spot, days to expiry and implied volatility using Black–Scholes. It shows:

- Model payoff at the nearest expiry
- Net debit or credit
- Maximum profit and loss (∞ where genuinely unbounded)
- Break-even points
- Model probability of profit, expected value and median payoff (not shown for calendars/diagonals)
- A P&L surface over spot and time
- A leg table with model premiums

All figures are **per unit**. Multiply by lot size for contract-level exposure. Fees, taxes, exchange charges, bid–ask spread and slippage are excluded.

### Paper Trading

- Virtual starting capital: ₹10,00,000.
- INR underlyings only, so the cash balance stays currency-consistent.
- Multi-leg order builder with call/put buy/sell legs, strikes, quantities and expiries.
- Premiums from Black–Scholes; margin estimated with a simplified educational formula, not broker SPAN.
- Positions are marked to market as the model day advances; close or settle positions and review trade history.
- State persists locally. The reset action clears the virtual account.

### Market Lab

- 11 underlyings: NIFTY, BANKNIFTY, FINNIFTY, SENSEX, RELIANCE, TCS, AAPL, MSFT, NVDA, SPY and QQQ.
- Expiry calendar selection, ATM highlighting, ITM shading, premium/change, IV and open interest.
- Contract inspector with model Greeks, intrinsic/extrinsic value, per-lot values and an expiry payoff.
- IV smile, put/call OI ratio, ATM straddle and an open-interest max-pain heuristic.
- Every chain is labelled as model-generated; the underlying quote is labelled `SIMULATED` or `DELAYED`.

---

## Model assumptions

### Black–Scholes–Merton

European option prices use:

- Spot `S`, strike `K`, time to expiry `T` in years
- Risk-free rate: 6.5% for Indian underlyings, 4.5% for US underlyings
- Dividend yield from the underlying metadata
- Volatility supplied as a decimal (0.20 = 20%)

The implementation is in `lib/options.ts` and is covered by put–call parity, reference-value, round-trip IV and boundary tests.

### Greeks

| Greek | Convention |
| --- | --- |
| Delta | Change per 1 unit of underlying |
| Gamma | Change in delta per 1 unit of underlying |
| Theta | Change per **calendar day** (usually negative for long options) |
| Vega | Change per **1 volatility point** (1%) |
| Rho | Change per **1 interest-rate percentage point** |

Greeks are local sensitivities. They are not constant and can change sharply near expiry, especially for at-the-money options.

### Probability of profit

`estimateProbability` samples a risk-neutral lognormal terminal distribution (1,200 points) and computes the share of sampled outcomes with positive payoff. It is a model estimate, not a forecast. Calendars and diagonals deliberately omit it because the long leg still has time value at the short expiry.

### Payoff evaluation

- Single-option and vertical payoffs are shown at expiry.
- Calendars and diagonals are evaluated at the **near-term** expiry, with the long leg repriced by Black–Scholes.
- Strategy analysis is per unit (multiplier 1). The UI states this next to the numbers.
- Covered calls include the stock leg's entry at spot.
- The max-pain strike in the Market Lab is an open-interest heuristic only.

### Excluded costs

No brokerage, STT, exchange transaction charges, GST, SEBI charges, stamp duty, bid–ask spread, market impact or slippage is modelled. Real outcomes differ.

---

## Local persistence and privacy

There is no account, backend or analytics tracker. The app stores two Zustand keys in `localStorage`:

| Key | Contents |
| --- | --- |
| `options-lab-progress-v1` | Completed lessons, quiz attempts, best scores, daily challenge results and last visited lesson |
| `options-lab-simulator-v1` | Virtual cash, open positions, reserved margin, model day and trade history |

Both stores use `skipHydration: true` and are rehydrated by `components/layout/store-hydrator.tsx` after mount, preventing server/client mismatches. Clearing site data resets progress. The paper-trading page also has an explicit reset control.

Optional Finnhub requests are made by the server route only. The key is read from `process.env` on the server and is never included in a client bundle.

---

## Accessibility and SEO

- Skip-to-content link and landmark structure.
- Semantic headings, tables with captions and scoped headers, form labels and field hints.
- Visible `focus-visible` rings on interactive controls.
- `aria-pressed`, `aria-expanded`, `aria-busy`, `aria-live` and `role="alert"` where state changes.
- Charts use `role="img"` with descriptive labels and include a visually hidden data table where appropriate.
- Colour is supplemented by text labels (ITM/ATM, profit/loss signs, badges).
- `prefers-reduced-motion` support in global styles.
- Light/dark contrast tokens designed for WCAG 2.2 AA targets. The deployed build was audited with axe-core (WCAG 2.0/2.1/2.2 A and AA rules) on the home, lesson, calculator, simulator, strategy, glossary and quiz pages with zero violations.
- Per-page metadata, canonical URLs and Open Graph tags.
- `app/sitemap.ts` covers the home page, all modules, all 28 lessons and all 16 strategy pages.
- `app/robots.ts` allows public pages and disallows `/api/`.
- `app/not-found.tsx` and `app/error.tsx` provide recovery paths.

---

## Testing

```bash
npm test
npm run typecheck
```

The Vitest suite covers:

- Black–Scholes reference values, put–call parity, expiry boundaries, Greeks signs and implied-volatility round trips
- Long call/put, vertical spreads, covered calls, break-evens and max profit/loss
- Position sizing, risk/reward and expiration tables
- All 16 strategy definitions, leg construction, defined/undefined risk, calendar evaluation and probability eligibility
- Quiz bank integrity, answer indices, explanations, daily determinism and shuffling
- Glossary uniqueness, required fields, related-term resolution and search filters
- Market universe metadata, deterministic spots, expiry calendars, local-date formatting, chain construction and snapshot labelling

The date-related tests also guard the local-date helper used by expiry calendars, which must not shift when the server is east of UTC.

---

## Deploying to Vercel

The project is deployed at <https://options-lab-sepia.vercel.app>. The steps below reproduce that setup from scratch.

### Option A — Dashboard

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset: **Next.js**. Build command: `npm run build`. Output: Next.js default.
4. Add `NEXT_PUBLIC_SITE_URL` with your production URL (for example `https://your-project.vercel.app`).
5. Optionally add `MARKET_DATA_PROVIDER` and `FINNHUB_API_KEY`.
6. Deploy.

### Option B — CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

Set environment variables in **Project → Settings → Environment Variables**, then redeploy.

### Notes

- The app runs without any environment variables. Missing keys fall back to the explicitly labelled simulated provider.
- `NEXT_PUBLIC_SITE_URL` only affects metadata and the sitemap; the app still works if it is wrong, but canonical links will be wrong.
- Keep `FINNHUB_API_KEY` server-side. Do not add it as `NEXT_PUBLIC_*`.
- No database migration or cron job is needed.

---

## Adding content

### Add a lesson

1. Add a `LessonSeed` to the appropriate file in `lib/content/`.
2. Follow the existing eight-part shape: `simple`, `analogy`, `example`, `demo`, `visual`, `mistakes`, `takeaways`, `quiz`.
3. Choose an existing `demo`/`visual` key, or add a renderer in `components/demos/`.
4. Run `npm test` and `npm run build`. The lesson is picked up automatically by module pages, navigation and the sitemap.

### Add a strategy

1. Add an object to `STRATEGIES` in `lib/strategies.ts`.
2. Use offsets relative to spot (for example `0.05` = 5% above spot), positive quantities and `action: "buy" | "sell"`.
3. Add related slugs that exist.
4. The strategy page, filters, comparison table and sitemap update automatically.

### Add a glossary term

1. Add a `GlossaryTerm` to `GLOSSARY` in `lib/glossary.ts`.
2. Use a unique slug and a `related` list of **exact existing term names** (the tests enforce this).
3. Terms are searchable by name, definition and example.

### Add a quiz question

Add a `QuizQuestion` to `EXTRA_QUESTIONS` in `lib/quizzes.ts`. Keep exactly four unique options, a valid zero-based `correct` index and an explanation that teaches the reasoning.

---

## Known limitations

- Progress and paper trades are local to one browser and are not synced across devices.
- There is no authentication, database, order execution or brokerage integration.
- The optional Finnhub integration provides delayed US **stock quotes only**; it does not provide an options chain. The chain remains model-generated.
- The simulated spot path is deterministic and smooth, not a stochastic process calibrated to history.
- Probability estimates are risk-neutral and can differ materially from real-world outcomes.
- Strategy analysis is per unit; lot size and contract value must be applied by the reader.
- Margin estimates are simplified and not broker SPAN/exchange margin.
- Fees, taxes, spreads and slippage are excluded.
- Indian and US expiry calendars are approximated for education; they do not account for every holiday or exchange rule change.
- The app is not a substitute for a brokerage risk-disclosure document or professional advice.

---

## Troubleshooting

### `require() of ES Module ... magic-string ... not supported`

This appears on older Node 22 releases when Tailwind's CommonJS loader requires an ESM-only dependency. The repository pins `magic-string@0.30.21` via npm `overrides`. Run `npm install` again and delete `.next` before rebuilding. Alternatively, upgrade to Node 22.12+ or Node 24.

### Build cache issues

```bash
rm -rf .next
npm run build
```

On PowerShell:

```powershell
Remove-Item -Recurse -Force .next
npm run build
```

### `npm` not found or wrapper errors

Use a working Node installation and confirm `node -v` and `npm -v`. If your machine has a broken global npm shim, run the npm CLI directly or repair the Node installation.

### Fonts look wrong in a restricted network

Fonts are installed locally from `@fontsource-variable/*` packages. No Google Fonts request is made at runtime. If the packages are missing, run `npm install`.

### Market Lab shows only simulated data

That is the default and intended behaviour. Set `MARKET_DATA_PROVIDER=finnhub` and `FINNHUB_API_KEY` **on the server** to enable delayed US underlying quotes. Indian underlyings and all option chains remain simulated.

---

## Disclaimer

This platform is for educational purposes only. It does not provide financial advice, investment recommendations or trading signals. Options trading involves substantial risk and can result in significant losses. All simulations and examples are hypothetical, do not guarantee future results, and are not live market data. The platform does not execute real trades. Calculated Greeks, probabilities and margins are theoretical estimates. Consult a qualified financial adviser and read the risk disclosure of your broker before trading.
