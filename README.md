# Linden — Agentic Commerce Demo

> A small modern furniture studio where the AI agent will tell you not to buy.

I built Linden as a portfolio piece to make a single argument: **AI agents belong on the merchandising surface of e-commerce, not pinned to a corner as a help widget.** The catalog is small on purpose. The homepage opens with a question, not a filter sidebar. The chat agent — also called Linden — is willing to lose the sale: when a piece does not fit your room, it says *"honestly, don't buy this one,"* and explains why. The store is fictional. The pattern is real.

I designed Linden top to bottom: the brand, the catalog, the visual system, the tool surface, the model routing, the chat behavior, the deploy pipeline. This README is the fast tour. For the slower one — how I thought about this and why each decision landed where it did — see [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md).

---

## Table of contents

1. [What this demonstrates](#what-this-demonstrates)
2. [The Refusal Surface](#the-refusal-surface)
3. [Stack](#stack)
4. [Architecture decisions (ADR-lite)](#architecture-decisions-adr-lite)
5. [Project structure](#project-structure)
6. [Code conventions](#code-conventions)
7. [The 6 tools (+ 1 easter egg)](#the-6-tools--1-easter-egg)
8. [Model routing](#model-routing)
9. [RAG pipeline](#rag-pipeline)
10. [Lessons learned](#lessons-learned)
11. [Cost analysis](#cost-analysis)
12. [How to extend](#how-to-extend)
13. [Anti-patterns I avoided](#anti-patterns-i-avoided)
14. [Try it / Run locally](#try-it--run-locally)
15. [Built by](#built-by)
16. [Acknowledgments](#acknowledgments)
17. [License](#license)

---

## What this demonstrates

- **Tool-use with reasoning attached.** Six AI tools — `search_products`, `get_product_details`, `compare_products`, `add_to_cart`, `query_faq`, `get_promotions` — each producing a card or action paired with a one-sentence reason tied to the customer's stated context. Cards never appear on their own. The reason is the product.
- **Cost-aware model routing.** A small heuristic router classifies each turn and dispatches to `deepseek-chat` (default) or `deepseek-reasoner` (when the turn needs multi-constraint reasoning). The router is deterministic and its decision is logged to the cost panel and the response headers.
- **RAG over a small FAQ.** Five FAQ documents, embedded with `gemini-embedding-001` (truncated to 768 dimensions via Matryoshka representation learning to match the schema), retrieved via pgvector. The agent answers shipping, returns, warranty, payment, and "why we will tell you not to buy" questions from real text — never from training data.
- **Refusal as a load-bearing behavior.** The agent has explicit permission — and a system-prompt obligation — to refuse a sale when the math does not work. The refusal is the Zag.
- **Memory across turns.** Mention south-facing windows on turn two; on turn seven the agent will reference *"the walnut would warm up nicely against your south light."* No vector stores, no agent frameworks, no memory layer — just message history honored and a system prompt that knows what to look for.
- **Catalog discipline as merchandising principle.** Twelve SKUs in this demo, scaling to a hard cap of fifty. Subtraction over addition. Curation over filters. The agent surfaces at most three picks per turn — usually two.
- **Cost telemetry visible to the customer.** A collapsible panel shows turns, model breakdown, average latency. Production-grade transparency, not theater.
- **Chat history that survives navigation.** Open the chat on the home, click into a product page, come back to the home — your conversation is intact. `sessionStorage`-backed, no server persistence, resets at end of session.
- **A rotating invitation teaser** that rises above the chat pill with a typing animation and rotating prompts — drawn from a small in-house pattern I'd been refining elsewhere.

---

## The Refusal Surface

Most furniture sites are measured on conversion rate per session. To ship a feature where the AI says *"don't buy"*, those sites would have to rebuild their merchandising stack against their own incentives. Linden does not have that constraint, because Linden does not have to make rent. So the agent is allowed to refuse — and that refusal is what makes the rest of the conversation trustworthy.

The Refusal Surface is one of five sticky phrases the agent is trained to deploy: *"Honestly, don't buy this one."* It fires when the room dimensions don't accommodate the piece, when the user's stated taste contradicts the SKU, when a $1,400 sofa is being chosen for a temporary apartment. The refusal is direct, never softened — *"you might consider..."* is forbidden in the system prompt. After the refusal, the agent suggests an alternative that fits, or recommends not buying anything yet. Either path is acceptable. The sale is not the goal. The fit is.

> ![Refusal Surface in action](docs/screenshots/refusal-moment.png)
> *TODO: live screenshot — captured after first deploy.*

---

## Stack

| Layer | Choice | Why (one line) |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components by default keep the bundle small; edge runtime where it helps. |
| Language | **TypeScript 5 strict** | `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` catch the bugs the rest of the team would file. |
| Styling | **Tailwind CSS v4** with `@theme inline` | Design tokens live in CSS, not in a JS config — single source of truth, zero round-trips. |
| AI SDK | **Vercel AI SDK v6** (`streamText`, `tool`, `useChat`, `DefaultChatTransport`) | Provider-agnostic; the only AI SDK I trust to ship in 2026. |
| Chat model | **DeepSeek** (`deepseek-chat`) | Cheapest tier with full function-calling support; ~$0.27/$1.10 per 1M tokens. |
| Embeddings | **Gemini** `gemini-embedding-001` (768-dim Matryoshka) | Best price/quality at 768 dims; one API call per FAQ search. |
| Database | **Supabase** (Postgres + pgvector) | Free tier covers the demo; RLS on every table. |
| Validation | **Zod 4** | Tool input schemas are a contract with the model — Zod makes that contract first-class. |
| Rate limiting | **Vercel KV** (no-op when unconfigured) | Lazy-loaded so local dev runs unconstrained. |
| Deploy | **Vercel Edge** where it helps, Node where it doesn't | `/api/chat` is edge for sub-2s TTFB; static pages prerender. |

I made one provider switch midway: started on Gemini for everything, hit the 20-request/day free tier ceiling within an hour of testing, and migrated the chat path to DeepSeek. Embeddings stayed on Gemini because the call rate is much lower and the embedding model quality is excellent at 768 dims.

---

## Architecture decisions (ADR-lite)

I keep architecture decisions short and written. Here are the five that matter.

### ADR-1 — Next.js 16 App Router (not Pages router)

**Context.** Next.js 16 ships Server Components as the default and the App Router as the recommended primitive.

**Choice.** App Router everywhere; pages live in `app/`, server components by default, client components opted-in via `'use client'`.

**Why.** Server Components let me fetch products from Supabase server-side without bundling the database client to the browser. The PDP renders directly from a server query, no API endpoint needed. The cart page is the one client island because it's genuinely client-stateful (sessionStorage-backed).

**Trade-off.** App Router quirks are still real (async `params` in dynamic routes, the `convertToModelMessages` returning a Promise in v6, etc.). I documented each gotcha in [Lessons learned](#lessons-learned).

### ADR-2 — Tailwind v4 with `@theme inline` (not config-file)

**Context.** Tailwind v4 moves design tokens into CSS via `@theme inline`. The classic `tailwind.config.ts` is no longer the recommended pattern.

**Choice.** `app/globals.css` owns every token. No JS config for theme.

**Why.** A single CSS source of truth means `--color-ink-primary: #2A2722` is the same value at runtime, in dev tools, in the documentation, and in every component. No build step magic. CSS variables are debuggable.

**Trade-off.** Anyone reading the codebase needs to know Tailwind v4's `@theme inline` syntax. I kept all tokens grouped at the top of `globals.css` with comments.

### ADR-3 — AI SDK v6 with `DefaultChatTransport` (not the SDK's direct provider client)

**Context.** AI SDK v6 changed the `useChat` hook to take a `transport` instead of an `api` URL.

**Choice.** Memoized `DefaultChatTransport` instance per `ChatModal`. The route handles model routing internally; the transport is provider-agnostic.

**Why.** I can swap providers (DeepSeek → OpenAI → Anthropic) by editing one file (`lib/ai/model-router.ts`). The chat hook never sees the provider. The route owns routing, telemetry, and tool dispatch.

**Trade-off.** The v6 message-parts format (`message.parts[]` with typed parts like `tool-search_products`) is more verbose than v5's flat `content` string. Worth it for typed tool results.

### ADR-4 — DeepSeek for chat, Gemini for embeddings (not single-provider)

**Context.** I started single-provider (Gemini). Free-tier quota is 20 chat requests/day; I exhausted it within the first hour of testing.

**Choice.** Switch chat to DeepSeek (one provider, one key); keep embeddings on Gemini (the embed call rate is low; one per FAQ search; well under quota).

**Why.** DeepSeek has full function-calling support and cheaper pricing than Gemini Flash. Gemini's `gemini-embedding-001` with `outputDimensionality: 768` (Matryoshka representation learning) is best-in-class at the dimensionality the schema expects.

**Trade-off.** Two providers, two API keys to manage. Documented in `.env.example` with explicit notes on what each one is for.

### ADR-5 — `sessionStorage` for cart and chat history (not `localStorage`, not server-side)

**Context.** This is a portfolio demo, not a real e-commerce. There's no auth and no checkout. But the chat session needs to survive navigation between PDP and home.

**Choice.** `sessionStorage` for both cart and chat history. Resets when the tab closes. Never persisted server-side.

**Why.** Privacy-respecting (no cookies, no tracking). Realistic-feeling demo (cart and chat behave as the customer expects). Zero infrastructure (no DB tables for sessions).

**Trade-off.** Customer can't open Linden on phone and continue on laptop. Acceptable for the demo's scope; easy to upgrade to authenticated server persistence later.

---

## Project structure

```
linden/
├── app/                              Next.js App Router pages
│   ├── layout.tsx                    Root: fonts, header, footer, ChatBubble, ChatTeaser
│   ├── page.tsx                      Home: hero, brand strip, 4 categories, editorial, BrandScript
│   ├── globals.css                   Tailwind v4 tokens + the t-* typography classes + keyframes
│   ├── about/
│   │   ├── page.tsx                  About in English (default)
│   │   └── pt/page.tsx               About in Portuguese (BR)
│   ├── product/[slug]/
│   │   ├── page.tsx                  PDP — server component, fetches by slug
│   │   └── ProductActions.tsx        Client island for the two CTAs
│   ├── cart/page.tsx                 Cart — client, sessionStorage-backed
│   ├── not-found.tsx                 404
│   └── api/chat/route.ts             Edge runtime chat endpoint (streamText + tools)
│
├── components/                       Reusable UI
│   ├── Header.tsx                    Sticky wordmark + cart badge with one-shot pulse
│   ├── Footer.tsx                    Counter + manifesto + language toggle
│   ├── ProductCard.tsx               Grid + list variants (with rotating-out badge)
│   ├── ProductCardInline.tsx         75% chat-width card rendered inside the chat
│   ├── CompareTable.tsx              Inline comparison table for the compare_products tool
│   ├── ChatBubble.tsx                Persistent terracotta pill (Cmd+K and "/" shortcuts)
│   ├── ChatModal.tsx                 The real chat drawer (useChat v6, persistence, ESC, etc.)
│   ├── ChatModalPlaceholder.tsx      Visual shell, kept for QA reference
│   ├── ChatTeaser.tsx                Rotating invitation bubble above the pill
│   ├── CostPanel.tsx                 Collapsible telemetry strip
│   ├── Toast.tsx                     Shared toast (cart adds, removals, demo-only place-order)
│   ├── Reveal.tsx                    IntersectionObserver fade+lift for sections
│   └── LanguageToggle.tsx            EN | PT toggle (header + footer variants)
│
├── lib/                              Pure logic, no React
│   ├── ai/
│   │   ├── tools/                    The six tools + bonus route_decision
│   │   │   ├── index.ts              Exports allTools (Record<string, Tool>)
│   │   │   ├── search-products.ts    max 3 picks per turn (Linden Zag)
│   │   │   ├── get-product-details.ts
│   │   │   ├── compare-products.ts   Honest ranking required by description
│   │   │   ├── add-to-cart.ts        Returns intent; client intercepts to update cart
│   │   │   ├── get-promotions.ts     "Final 4 — leaving the catalog" rotation only
│   │   │   ├── query-faq.ts          Embed + semantic search via match_documents RPC
│   │   │   └── route-decision.ts     Easter egg: surfaces routing metadata
│   │   ├── system-prompt.ts          The Sage+Caregiver system prompt verbatim
│   │   ├── model-router.ts           Cost-aware model selection
│   │   └── telemetry.ts              TelemetryStore: turns, total cost, breakdown, avg latency
│   │
│   ├── supabase/{server,client}.ts   Cached clients (service-role server, anon browser)
│   ├── products.ts                   Typed accessors + CATEGORY_LABELS
│   ├── cart.ts                       sessionStorage helpers + onCartChange event
│   ├── format.ts                     formatUSD with maximumFractionDigits: 0
│   └── utils.ts                      cn() helper (clsx + tailwind-merge)
│
├── public/                           Static assets, no build step
│   ├── products/                     12 .webp at ~1200px max, < 150KB each
│   ├── lifestyle/                    9 .webp (heroes, category headers, about, 404)
│   ├── og-image.png                  1200×630 brand-aligned
│   └── favicon.{ico,svg}, apple-touch-icon.png
│
├── supabase/                         DB source of truth
│   ├── migrations/001_init.sql       Tables + RPC + RLS
│   └── migrations/002_seed.sql       12 products + 5 FAQs
│
├── scripts/
│   └── generate-embeddings.ts        Run once to populate documents.embedding
│
├── middleware.ts                     KV-backed rate limit, no-ops without KV env
├── next.config.ts
├── tsconfig.json                     strict + the two extra strictness flags
├── postcss.config.mjs
├── eslint.config.mjs
├── package.json
├── README.md                         (you are here)
├── LICENSE                           MIT
└── docs/HOW-WE-BUILT-THIS.md         Long-form: process, tradeoffs, what I'd do differently
```

The mental model: **`app/` is delivery, `components/` is presentation, `lib/` is logic.** Anything you'd test in isolation lives in `lib/`. Anything that touches the DOM lives in `components/` or `app/`. The boundary is enforced by convention, not by lint.

---

## Code conventions

A short cheat-sheet so anyone can extend the project in five minutes.

**Naming.**
- Components: `PascalCase` files and exports (`ProductCard.tsx`).
- Hooks: `useFoo` (camelCase, `use` prefix).
- Tool files: `kebab-case.ts` (matches the function-calling name surface to the model).
- Type names: `PascalCase` interfaces and types; suffix with intent (`Props`, `Result`, `Config`).
- Booleans: `is`/`has`/`can`/`should` prefix.
- Event handlers: `on*` for props, `handle*` for internal handlers.
- Constants: `UPPER_SNAKE_CASE` for module-level immutables.

**Imports.** Always absolute via `@/` alias. Order: types, React/core, third-party, internal (`@/components`, `@/lib`), relative (`./*`).

**TypeScript.** Zero `any`. Use `unknown` + a type guard if you must. Strict null checks. `noUncheckedIndexedAccess` is on, so `arr[i]` is `T | undefined` — handle it. `exactOptionalPropertyTypes` catches the `undefined`-vs-missing distinction. `as` casts only after a Zod parse.

**Server vs client.** Default: server. Add `'use client'` only when the file uses hooks, browser APIs, or interactivity. Never put a server query in a client component — call it from the page and pass data down.

**Errors.** Throw with context: `throw new Error(\`tool_name failed: \${msg}\`)`. Errors at the tool boundary surface to the model via the SDK; clean error messages help the model recover. At the user boundary, never expose raw stack traces.

**Comments.** Default to none. Only comment WHY when non-obvious — a constraint, a workaround, a brand-locked invariant. Never comment WHAT (the code already says it). JSDoc on exported functions where the name alone isn't enough.

**Brand voice.** Every customer-facing string is checked against the NEVER list (no superlatives, no "we believe", no emoji in agent messages, no "Powered by AI"). The system prompt enforces this for the AI; humans (me) enforce it for the rest.

---

## The 6 tools (+ 1 easter egg)

Every tool has: a **strict Zod schema** for inputs, a **single-purpose handler** with no side effects beyond the database query, and a **description in plain English** that the model uses to decide when to call it. The model decides which to call; the SDK loop runs up to a small `stopWhen: stepCountIs(5)` ceiling.

| Tool | Purpose | Hard limit |
|---|---|---|
| `search_products` | Filter by category, keyword, price band. | Max 3 results per call (the Linden Zag — never an 8-result dump). Default 2. |
| `get_product_details` | Lookup by id or slug. | Returns the full SKU. |
| `compare_products` | Side-by-side over 2-3 ids. | Description requires honest ranking — never "both are great." |
| `add_to_cart` | Returns intent. | Client intercepts via `onToolCall` to mutate `sessionStorage` and pulse the header badge. |
| `query_faq` | Embed + semantic search. | `match_count: 2`, `similarity_threshold: 0.6`. |
| `get_promotions` | "Final 4 — leaving the catalog" rotation. | If empty, returns the message that Linden doesn't run sales. |

The bonus tool, `route_decision`, returns metadata about which model handled the turn and why. The system prompt instructs the agent to call it only when the customer explicitly asks ("which model are you using?") — never volunteer it. Linden doesn't advertise the medium.

---

## Model routing

The router is a short heuristic over the most recent user message. As of today it always returns `deepseek-chat` (the cheapest tier with full function calling). The routing infrastructure remains in place for future tier promotion — the keyword list and the message-length check are kept so promoting `deepseek-reasoner` for complex turns is a one-line change.

```ts
// lib/ai/model-router.ts (excerpt)
const COMPLEX_KEYWORDS = ['compare', 'recommend', 'why', 'explain', 'fit in my room', ...]

export function routeModel(userMessage: string, hasMultipleTools = false): ModelChoice {
  return {
    ...MODELS.chat,
    reason: 'deepseek-chat - cheapest tier with function calling',
  }
}
```

The model decision is set on the response as `X-Model-Used` and `X-Routing-Reason` headers, and surfaced in the cost panel.

---

## RAG pipeline

FAQ documents are embedded once via `npm run embeddings` and stored in Supabase with a `vector(768)` column. At query time, `query_faq` embeds the customer question via Gemini's `gemini-embedding-001` model with `outputDimensionality: 768` (Matryoshka representation learning lets us cap the output without re-training), then calls a Postgres RPC `match_documents` that returns the top-k nearest neighbors above a similarity threshold. The agent narrates the excerpt verbatim — never paraphrases policy.

```sql
-- supabase/migrations/001_init.sql (excerpt)
create or replace function match_documents(
  query_embedding vector(768),
  match_count int default 3,
  similarity_threshold float default 0.7
) returns table (id uuid, title text, content text, similarity float)
language sql stable as $$
  select d.id, d.title, d.content,
         1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.embedding is not null
    and 1 - (d.embedding <=> query_embedding) > similarity_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;
```

---

## Lessons learned

A short selection of bugs I hit and decisions I made — the ones worth writing down.

### Bug — em-dash in HTTP response headers crashed `/api/chat` with 500

The first time I shipped the `X-Routing-Reason` header, my reason strings included `—` (em-dash) and `×` (multiplication sign), straight out of the Linden brand voice. HTTP headers must be ByteString (bytes 0-255). The first request crashed with `TypeError: Cannot convert argument to a ByteString because the character at index 13 has a value of 8212 which is greater than 255.`

Fix: kept the `—` and `×` in customer-facing strings, but replaced them with `--` and `x` in any string that could end up in a header. Documented in `lib/ai/model-router.ts` so the next person who edits the reasons doesn't trip.

### Bug — AI SDK v6 broke three signatures from the v5 spec

The official examples I started from used v5 patterns that no longer compile in v6:
- `convertToCoreMessages` was renamed to `convertToModelMessages` and now returns `Promise<ModelMessage[]>` (await it).
- `result.toDataStreamResponse({ headers })` became `result.toUIMessageStreamResponse({ headers })`.
- `maxSteps: 5` is now `stopWhen: stepCountIs(5)` (with `stepCountIs` imported from `'ai'`).
- `usage.inputTokens` and `outputTokens` are now `number | undefined` — coalesce with `?? 0`.
- `messages.findLast(m => m.role === 'user')?.content` no longer typechecks because `UIMessage` has no `content` field — content lives in `message.parts[]` typed parts. I wrote a small `extractLastUserText()` helper that handles both shapes (v6 parts + legacy fallback).

### Bug — Gemini `text-embedding-004` was deprecated

The first run of `npm run embeddings` failed with *"models/text-embedding-004 is not found for API version v1beta."* The replacement, `gemini-embedding-001`, defaults to 3072-dim output — incompatible with my `vector(768)` schema column. The fix: pass `outputDimensionality: 768` via `providerOptions.google` to the `embed` call. Matryoshka representation learning means the truncated embedding is still semantically valid, just lower fidelity. Worth it for a free embedding model that ships consistent quality.

### Bug — body scroll lock broke desktop UX

When I shipped the chat modal's body scroll lock (so the page underneath wouldn't scroll on mobile bottom-sheet mode), I applied it everywhere. On desktop the modal is a 640px right drawer — most of the viewport is still the page, and locking it made the PDP feel broken when the customer wanted to scroll the photos while chatting. Fix: scroll lock now fires only when `window.matchMedia('(max-width: 767px)').matches` is true.

### Decision — chat persistence via sessionStorage

The "she remembered" moment is the brand love trigger — but only if the conversation survives the customer clicking into a product. I considered a server-backed session table; rejected because (a) no auth, (b) one-tab-life is the right scope for a portfolio demo. So I serialize `messages[]` to `sessionStorage` on every `messages` change in `ChatModal`, hydrate on first mount via `setMessages()`, and let the natural session-end (closed tab) be the reset trigger.

### Decision — provider migration mid-build (Gemini → DeepSeek for chat)

Gemini Flash Lite free tier is 20 requests/day per model. I burned through that within the first hour of integration testing. Rather than block on getting billing enabled, I migrated the chat path to DeepSeek (the existing tool architecture made this a one-file change in `lib/ai/model-router.ts`, plus one `.env.local` line). Embeddings stayed on Gemini (lower call rate, free tier sufficient). The decoupling between chat and embedding providers is exactly the kind of thing the AI SDK abstraction earns you.

---

## Cost analysis

| Provider | Model | Input ($/1M tokens) | Output ($/1M tokens) | Used for |
|---|---|---|---|---|
| DeepSeek | `deepseek-chat` | $0.27 | $1.10 | Every chat turn (default tier) |
| DeepSeek | `deepseek-reasoner` | $0.55 | $2.19 | Reserved for future complex-turn promotion |
| Gemini | `gemini-embedding-001` | Free tier (sufficient) | n/a | One embed per `query_faq` call |

**Per-turn cost at typical traffic.**
- Average user message: ~30 tokens in, ~150 tokens out.
- System prompt + tool definitions: ~1,800 tokens in (cached after first call).
- Average tool roundtrip: 1-2 calls per turn, each ~100 tokens of output.
- **Cost per turn: ~$0.0006-0.0010.**

**Projection at 100 visitors/day, 5 turns each.**
- 500 turns × $0.001 = **$0.50/day**, ~$15/month.
- Vercel KV rate limit (10 turns/IP/hour) caps the bill at ~$25/month worst case before throttling kicks in.
- Supabase free tier covers the read traffic comfortably (50k requests/month).

**The cost panel in the chat shows real per-turn data** for latency and turns-by-model. Token counts and dollar cost are currently logged server-side (visible in Vercel function logs); the in-app surface is wired and waiting for the AI SDK v6 streaming meta-event for per-turn usage to land — a clean solution that doesn't require a second roundtrip.

---

## How to extend

### Add a new product

1. Append the row to `supabase/migrations/002_seed.sql` (or run an `INSERT` against the live DB).
2. Drop a `<slug>.webp` into `public/products/` (max 1200px, < 150KB).
3. Done. The `search_products` tool will surface it on next call.

### Add a new tool

1. Create `lib/ai/tools/<my-tool>.ts`. Export a single `tool({ description, inputSchema, execute })` factory.
2. Register it in `lib/ai/tools/index.ts` under the `allTools` map.
3. Update the system prompt if the tool needs to be used in a specific way (e.g., "always call X before Y").

### Swap the chat provider

1. `npm install @ai-sdk/openai` (or anthropic, mistral, etc.).
2. Edit `lib/ai/model-router.ts` — replace the `MODELS.chat` model with `openai('gpt-4o-mini')` (or whichever).
3. Update `costPer1M*` constants to match the new rate card.
4. Add the new API key to `.env.local` and `.env.example`.
5. The route, the tools, the chat hook — everything else is provider-agnostic.

### Add a new page

1. `app/<my-page>/page.tsx`. Server component by default.
2. Add to `Header.tsx` nav if it should be primary.
3. Run `npm run typecheck` to verify.

---

## Anti-patterns I avoided

- **No `shadcn/ui`, no Radix.** The UI surface is small enough that hand-rolled HTML + Tailwind ships faster than configuring a component library. Every component is < 250 lines.
- **No Framer Motion, no GSAP.** The brand calls for editorial restraint. I use CSS transitions and a tiny IntersectionObserver-driven `Reveal` component for fade-ins. Bundle stays small, animations stay calm.
- **No Redux, no Zustand.** State is local where possible (cart `useState` plus a custom event for cross-component changes). One `TelemetryStore` class for the cost panel. Nothing global that doesn't need to be.
- **No React Query.** The chat hook (`useChat`) handles its own state. Server components fetch directly. Nothing to cache that React Query would help with.
- **No "Powered by AI" anywhere.** The medium is invisible. The agent is *Linden*, never "the chatbot," never "the AI assistant."
- **No founder photo, no "Our Story" manifesto.** The brand is depersonalized on purpose — the catalog is the receipt.
- **No urgency badges, no countdown timers, no abandoned-cart guilt emails.** The Refusal Surface is the merchandising principle; FOMO would betray it.
- **No upsell at cart.** No "frequently bought together," no "you might also like," no add-on pillows. The cart is the bag, not the funnel.
- **No struck-through pricing, no "from $X" range pricing, no MSRP justification.** Honest pricing, displayed in JetBrains Mono, full stop.
- **No emoji in any agent message.** Linden is a Sage + Caregiver, not a millennial brand.

---

## Try it / Run locally

**Live demo.** TODO — populate after Vercel deploy.

**Source.** This repo.

### Local setup

```bash
git clone https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo.git
cd agentic-commerce-demo
npm install
cp .env.example .env.local
```

Fill `.env.local` with:

1. **DeepSeek** — primary chat key. Get one at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).
2. **Google AI** — embedding key. Get one at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). Free tier covers the demo.
3. **Supabase** — create a new project at [supabase.com/dashboard](https://supabase.com/dashboard); copy the project URL, the anon key, and the service-role key.
4. **Vercel KV** *(optional)* — only needed for production rate limiting. Without it, the middleware no-ops and local dev runs unconstrained.

Run the migrations. In the Supabase SQL editor:

```bash
supabase/migrations/001_init.sql   # schema + extensions + RPC + RLS
supabase/migrations/002_seed.sql   # 12 products + 5 FAQ rows
```

Generate the FAQ embeddings, then start the dev server:

```bash
npm run embeddings
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The hero asks *"What room are you working on?"*. The terracotta pill in the bottom-right opens the agent. After 5 seconds of inactivity, a small invitation teaser will rotate above the pill — dismissable.

---

## Built by

**Felipe Moreira** — AI Agent Engineer specializing in production-grade applications of the Vercel AI SDK.

- Source: [github.com/Revcoon-Felipe-AI/agentic-commerce-demo](https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo)
- Hire on Upwork: [upwork.com/freelancers/felipemoreira](https://upwork.com/freelancers/felipemoreira)

Open source under MIT. Clone, study, ship your own.

---

## Acknowledgments

I designed a small multi-stage workflow to generate the brand identity, voice, color tokens, photography prompts, and twelve-SKU catalog before writing the first line of UI code. Working brand-first turned out to be the right call: every downstream decision (tool descriptions, system prompt, microcopy, page hierarchy) had a single source of truth to defer to. The discipline paid off when the implementation went smoother than usual. The brand artifacts that survived the cull live (selectively) under [`docs/`](docs/).

---

## License

MIT — see [`LICENSE`](LICENSE).
