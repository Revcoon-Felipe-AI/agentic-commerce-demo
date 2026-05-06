# Linden — agentic commerce, organization first

[![Live demo](https://img.shields.io/website?url=https%3A%2F%2Fagentic-commerce-demo-xi.vercel.app&label=live%20demo&style=flat-square)](https://agentic-commerce-demo-xi.vercel.app) [![Built with Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org) [![AI SDK v6](https://img.shields.io/badge/AI%20SDK-v6-FF6F00?style=flat-square)](https://sdk.vercel.ai) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> *"Linden is a fictional furniture store. The choice wasn't accidental — furniture has dimension, ambient context, fit. We studied the brand first. Then we built the agent it needed.*
>
> *Most AI agents underperform because that step gets skipped. By 'organization,' here, we mean four concrete things: **brand voice locked in code, a database designed for how an agent reads it, tools with strict contracts, and a model layer that's swappable.** Linden is one example. The method behind it travels."*

[**Live demo →**](https://agentic-commerce-demo-xi.vercel.app) · [**GitHub →**](https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo) · [**Hire me on Upwork →**](https://upwork.com/freelancers/felipemoreira)

![Linden — chat with cost telemetry](docs/screenshots/refusal-moment.png)

This demo proves:

- **AI SDK v6 tool-use** — 6 typed tools with Zod input contracts and reasoning attached to every result
- **pgvector RAG** with `gemini-embedding-001` truncated to 768 dims (Matryoshka), retrieved via SQL RPC
- **Cost telemetry per turn** — input/output tokens, USD math, latency, model used, streamed to the UI
- **Edge runtime + KV rate limiting** with documented fail-open behavior
- **Refusal-by-design system prompt** — the agent has explicit permission to lose the sale when the math doesn't work

---

<!-- IMAGE SLOT 0 — HERO BANNER (optional, high-impact)
  Brand-aligned visual. Felipe brand palette: cream, terracota, teal, monochrome editorial.
  Concept candidates:
    (a) Sigilo Operator (the ant mark) discreet on the right, wordmark "Linden" on the left, terracota accent line
    (b) Minimal editorial composition: a single furniture silhouette + the locked phrase "honestly, don't buy this one." in monospace
    (c) Four stacked horizontal layers (visual representation of the four organization layers) — cream backdrop, terracota dividers
  No surreal. No tech-art. Editorial restraint.
  Aspect: 16:9 or 3:1 banner.
-->

## Why this exists

We built the brand before writing the first line of code. Identity first because identity is what makes scale possible — every downstream decision (system prompt, tool description, page hierarchy, microcopy, even the `discount_pct` column name) had a single source of truth to defer to. The full reasoning is in [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md).

This README is the fast tour. It's organized around four concrete layers — brand, database, tools, model. Each layer is where "organization" stops being an abstract word and starts being a decision you can read in the code.

---

## The client we built for

Linden is fictional but deliberate. We needed a brief that exposed the real complexity of agentic commerce — not a t-shirt store where any LLM with a search index would land. **Furniture has dimension, room context, light direction, fit.** A good recommendation requires the agent to ask first, retrieve semantically, and reason within the brand's voice.

So we wrote a brand. We picked a position (long-term relationships over transactional volume). We chose a tone (Sage with a Caregiver's patience). We locked five sticky phrases. We capped the catalog at twelve SKUs because the brand merchandised that way — not because the model couldn't handle more.

Another client, another shape. **The constant is the method, not the artifact.**

---

## What "organization" means in this build

<!-- IMAGE SLOT 1 — THE FOUR LAYERS (high-impact, sells the whole README)
  Brand-aligned visual showing four stacked horizontal layers, each with an icon + label:
    Layer 1: BRAND VOICE — locked in code (cream + Sigilo silhouette)
    Layer 2: DATABASE — designed for an agent (terracota accent)
    Layer 3: TOOLS — contracts, not functions (teal accent)
    Layer 4: MODEL — swappable, never coupled (charcoal accent)
  Each layer separated by a thin terracota line. Minimal editorial style.
  Caption: "Four layers. Each layer is a decision. Each decision is replicable."
  This is THE image to commission with care — it's the spine of the document.
-->

When we say a system is "organized," we mean specifically these four layers — built so that each one stays in place even when the others change.

### Layer 1 — Brand voice as code

The most important file in `lib/ai/` isn't a tool. It's `system-prompt.ts`. Voice constraints (no emoji, no superlatives, no softening of refusals, max 3 picks per turn, the locked phrase *"honestly, don't buy this one"*) live there as load-bearing rules — not stylistic suggestions, not prompt-knob tweaks. **Behavioral specifications.**

Replace the model and the brand still sounds like Linden. Hand the codebase to another developer and the voice survives, because it's not in their head — it's in a file with version control.

> *This stays even if we swap the model.*

### Layer 2 — Database designed for how an agent reads it

The schema isn't generic. Column names carry semantic meaning the LLM uses without explanation: `discount_pct`, `featured`, `in_stock`, `dimensions`, `material`. A `generated` column computes the discount at the database level — application code can never have it wrong. A constraint refuses any product where `price_sale >= price_original`. RLS lives on every table from the first migration. Indexes match the queries `search_products`, `get_promotions`, and `compare_products` actually issue.

The schema was built knowing an agent would read it. **That's a different design than building it for a human admin panel.**

> *This stays even if the catalog grows.*

### Layer 3 — Tools as contracts

The agent never reads the database directly. It calls one of six tools, each with a strict Zod schema and a plain-English description. The schema is a contract; drift is impossible. The model can hallucinate an argument that doesn't exist — the call will fail at the boundary, never reach the database, never leak a column.

This is also the security boundary. Even if a malicious user tries prompt injection to coerce the agent into leaking customer data, the tools won't let them. The agent can only ask things the tools were designed to answer.

> *This is how you sleep at night when traffic spikes.*

### Layer 4 — Model as a swappable layer

We built the chat hook against Vercel AI SDK's `DefaultChatTransport` — provider-agnostic by construction. The chat doesn't know whether DeepSeek or Gemini or Claude or GPT-4 is on the other end of the wire. Switch the model in `model-router.ts`, one line, the agent keeps performing.

We've already demonstrated the swap: Linden was built on Gemini, migrated to DeepSeek mid-build (one file, two hours, identical agent behavior the next morning). MCP-compatible too — your agent can connect to external tool servers without rebuilding its core.

> *This stays even when a better model ships next quarter.*

---

## Architecture you can see

<!-- IMAGE SLOT 2 — SYSTEM ARCHITECTURE
  Mermaid baseline (always renders in GitHub):
    flowchart LR
      User[Customer] -->|messages| API[/api/chat — Edge Runtime]
      API --> Router[Model Router]
      Router --> Models{Model Layer}
      Models -.swap-able.-> DS[DeepSeek]
      Models -.swap-able.-> GM[Gemini]
      Models -.swap-able.-> CL[Claude]
      Models -.swap-able.-> GP[OpenAI]
      Router --> Tools[Six Tools — Zod schemas]
      Tools --> DB[(Supabase Postgres)]
      DB --> RLS[Row-Level Security]
      DB --> Vec[pgvector — embeddings]
  Optional polished SVG version: same flow, but in Felipe brand palette (cream + terracota + teal),
    with Sigilo small in the corner. Editorial style, not tech-doc style.
  Caption: "Edge runtime. Provider-agnostic. RLS-protected. Each box is a decision, not a default."
-->

The browser sends messages to a single edge endpoint. A model router classifies the turn. Tools execute against Postgres with row-level security. Embeddings live in pgvector. The agent never reads the database directly — tools do.

The model is replaceable. The schema is portable. The brand is locked in code, not in fine-tuning. Each layer above is a decision documented in this README.

---

## The database — built for THIS client, designed to grow

<!-- IMAGE SLOT 3 — DATABASE SCHEMA (high-impact, sells "thought-through" at first glance)
  Mermaid ER baseline:
    erDiagram
      products {
        uuid id PK
        text slug UK
        text name
        text category
        numeric price_original
        numeric price_sale
        numeric discount_pct "GENERATED — never out of sync"
        text dimensions
        text material
        boolean in_stock
        boolean featured
      }
      documents {
        uuid id PK
        text title
        text content
        vector embedding "768-dim, Matryoshka-truncated"
        jsonb metadata
      }
  Optional polished version: clean schema visual in Felipe palette, almost circuit-board minimalism.
    Annotations alongside boxes:
      - "discount_pct: generated column — DB enforces correctness"
      - "RLS: read public, write service-role"
      - "constraint: price_sale < price_original"
      - "vector(768): truncated for cost, semantically valid"
  Caption: "Two tables. Five decisions. Designed for the agent that would read it."
-->

Two tables. Five decisions worth explaining — each one chosen because **a furniture store with an AI agent has different needs than a generic admin panel.**

**1. `discount_pct` is generated by the database.** The schema computes it from `price_original` and `price_sale`. The agent reads it, the UI reads it, the FAQ retrieval reads it — all from the same source of truth. Application code can never lie.

**2. A constraint enforces `price_sale < price_original`.** A bad seed or a careless migration can't ship a product with negative discount. The database refuses. *Documenting before automating starts here.*

**3. Indexes match the queries the tools actually issue.** `idx_products_category` for filtered browsing, `idx_products_discount DESC` for promotions, `idx_products_in_stock` as a partial index. We didn't index everything — we indexed what the agent asks for.

**4. `vector(768)` with Matryoshka truncation.** Gemini's embedding model defaults to 3072 dimensions. We cap it at 768 via `outputDimensionality: 768`. The truncated embedding stays semantically valid (Matryoshka representation learning) — and we get 4× faster nearest-neighbor search and 4× lower vector storage. Cost-aware by construction.

**5. RLS on every table from day one.** Anonymous read on `products` and `documents`, service-role required for write. Even in a portfolio demo with no auth, the policy lives in the migration. **Security isn't bolted on — it ships with the first commit.**

### Built to grow without being rebuilt

| Scale | What changes | What stays |
|---|---|---|
| 12 → 50 SKUs | Nothing. Indexes already handle this | All schema, all tools, all queries |
| 50 → 500 SKUs | Add an `attributes JSONB` column for filtering, FTS index on description | Schema is additive; existing rows untouched |
| 500 → 5,000 SKUs | Higher-dim vector index (HNSW), category-based partition if reads skew | Tools stay identical; only the RPC tunes |
| 5,000 → 50,000+ SKUs | The agent's reasoning approach evolves — more aggressive initial questions, tighter retrieval, brand-trained pruning | Database keeps holding; logic adapts |

**The schema was designed to grow, not to be replaced.** That's the whole point of layer-2 organization.

---

## Six tools for this brand. Twelve more for yours.

| Tool | Purpose | Hard limit |
|---|---|---|
| `search_products` | Filter by category, keyword, price band | **Max 3 results per call** — never an 8-result dump |
| `get_product_details` | Lookup by id or slug | Returns the full SKU |
| `compare_products` | Side-by-side over 2-3 ids | **Honest ranking required** — never "both are great" |
| `add_to_cart` | Returns intent | Client intercepts via `onToolCall` to mutate `sessionStorage` |
| `query_faq` | Embed + semantic search | `match_count: 2`, `similarity_threshold: 0.6` |
| `get_promotions` | "Final 4 — leaving the catalog" rotation | If empty, returns the message that Linden doesn't run sales |

A bonus tool, `route_decision`, returns metadata about which model handled the turn and why. The system prompt instructs the agent to call it **only** when explicitly asked.

The model decides which tool to call. The SDK runs the tool loop up to `stopWhen: stepCountIs(5)`. **Limits are how you keep an agent honest** — without them, models overthink (call tools they don't need) or under-curate (return 12 results when 2 would land).

### What this becomes — extensibility map

<!-- IMAGE SLOT 4 — TOOL CAPABILITY MAP (orbital diagram, brand-aligned)
  Concept: an orbital map with two rings, in Felipe palette.
    INNER RING (BUILT — solid, terracota): 
      search_products · get_product_details · compare_products
      add_to_cart · query_faq · get_promotions · route_decision
    OUTER RING (EXTENSIBLE — dashed, cream): 
      cart_recovery · order_status · shipping_eta · route_check
      discount_negotiator · vendor_personality_swap · inventory_check
      cross_sell_reasoned · return_processor · loyalty_lookup
      reorder_assist · abandoned_checkout_followup
  Sigilo small at the center. Minimal editorial style.
  Caption: "Linden ships the molde. Your store adds the orbit."
-->

The six tools shipped in Linden are a **deliberately minimal** merchandising agent — what this brand needed, no more. A real store needs more. Each of these follows the same pattern (strict Zod schema, single-purpose handler, plain-English description) and slots in without touching the rest of the system:

- **Cart recovery** — agent re-engages a customer who left items behind, refusal-aware tone ("you didn't check out — fit issue, or just timing?")
- **Order status** — "where is my order" via order ID, returns carrier + tracking link, never invents a status
- **Shipping ETA** — pre-purchase: "if I order this today, when does it land?" — pulls from carrier API, accounts for warehouse cutoffs
- **Route check** — for fast-shipping configs, validates whether destination is in the same-day or next-day zone before promising it
- **Discount negotiator** — agent has a defined budget per session and can offer code-gated discounts when the conversation justifies it (not on demand)
- **Vendor personality swap** — multiple agents with distinct voices for different product categories (sleek for office, warm for living, technical for materials)
- **Inventory check** — "is this in stock" with reservation hold for the chat session — agent can soft-lock a SKU while the customer decides
- **Cross-sell reasoned** — only suggests pairings when the math holds ("this bookshelf needs an anchor for safety with this height — here are two")
- **Return processor** — initiates a return with reason classification, surfaces policy from FAQ first, never circumvents
- **Loyalty lookup** — pulls a returning customer's profile, references past purchases ("the walnut shelf you got — this lamp matches that finish")
- **Reorder assist** — for consumables-adjacent categories (linens, candles), "want me to reorder what you got last time?"
- **Abandoned-checkout follow-up** — fires after N hours, surfaces the cart, asks one question, never sends three reminders

**Linden is the molde. Your store is the implementation.** Same pattern, your tools.

---

## The agent — voice serves the brand, not the other way around

### The Linden brand asked for refusal. So we built it.

The Linden brand visioned a **long-term, fit-first relationship** with its customers — not transactional volume. That's a position the brand chose. The agent reflects that position: when the math doesn't work — wrong room dimensions, wrong light direction, wrong budget for the use case — it says *"honestly, don't buy this one,"* and pivots to either an alternative that fits or a recommendation to wait.

This is **Pareto applied to merchandising**: refuse the wrong-fit purchases to win the right-fit trust. A customer who has been told *"this isn't right for you"* once trusts every recommendation that follows.

### This isn't the right agent for every brand.

A fast-fashion store visions volume and turnover — and would want an agent that surfaces coupons, creates urgency, generates quotes on the fly, suggests size-ups for return-ability. **Same architecture, different voice configuration.** The four-layer organization survives the swap.

> **The agent serves the brand. The brand decides what kind of agent.**

### Anti-patterns Linden refuses (because the brand asked it to)

A short list of choices that match this brand's voice. None of them are universal "right answers" — they're decisions Linden made because of its position:

- No "Powered by AI" anywhere — the medium is invisible. The agent is *Linden*, never "the chatbot."
- No urgency badges, no countdown timers, no abandoned-cart guilt — the brand visions long-term trust.
- No upsell at cart — the cart is the bag, not the funnel.
- No struck-through pricing as theatrics — honest prices, displayed in monospace.
- No emoji in agent messages — Linden's voice is editorial.

Different brand, different list. The architecture stays the same.

---

## Provider flexibility — DeepSeek today, your choice tomorrow

You don't run Linden on DeepSeek because we said so. You run it on whatever model fits your cost, latency, and reasoning budget. The model layer is provider-agnostic by construction:

| Provider | Why you'd pick it |
|---|---|
| **DeepSeek** (`deepseek-chat`) | Cheapest tier with full function calling — the default in this build |
| **Google Gemini** | Generous free tier viable for embeddings; Flash tier competitive for chat |
| **Anthropic Claude** | Premium reasoning, strongest tool-use behavior on complex multi-constraint turns |
| **OpenAI** (`gpt-4o`, `gpt-4o-mini`) | Most familiar to your existing stack, broadest ecosystem |
| **MCP** (Model Context Protocol) | Connect your agent to external tool servers without rebuilding its core |

One line in `model-router.ts`. That's the swap. The routing seam (keyword/length signals) is already wired in the file — promoting `deepseek-reasoner` for multi-constraint turns is a one-line change once traffic justifies it. Today every turn goes to `deepseek-chat`.

---

## Cost as a managed surface, not a customer-facing one

In this demo, the cost panel inside the chat is **visible** — that's the demo's promise of transparency. **In production, your customer never sees this. You do.**

What you actually get when this becomes a real engagement:

- **A weekly dashboard** — per-channel cost, model breakdown, latency distribution, optimization recommendations.
- **Real-time alerting** — anomalies (a stuck conversation, a tool returning empty, a cost spike) page you, not your customer.
- **Per-turn telemetry** — every conversation logged with model, tokens, latency, tool calls. You can replay any session, audit any decision.
- **Cost projections** — at typical traffic (100 visitors/day, 5 turns each), Linden runs at ~$15/month. Your numbers will differ; the projection model travels.

| Provider | Model | Input ($/1M) | Output ($/1M) |
|---|---|---|---|
| DeepSeek | `deepseek-chat` | $0.27 | $1.10 |
| DeepSeek | `deepseek-reasoner` | $0.55 | $2.19 |
| Gemini | `gemini-embedding-001` | Free tier | n/a |

**Observability isn't a feature. It's a precondition.** You don't ship an agent into production without the ability to see what it's doing.

---

## Code that any senior dev reads in 10 minutes

The mental model: **`app/` is delivery, `components/` is presentation, `lib/` is logic.** Anything you'd test in isolation lives in `lib/`. Anything that touches the DOM lives in `components/` or `app/`.

Five conventions that compound:

- **Zero `any`, zero shortcuts.** Strict TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. `arr[i]` is `T | undefined` and gets handled.
- **Imports are absolute.** Always `@/`, never `../../`. The path alias is the canonical way to refer to anything outside the current file.
- **Server-by-default, client-by-opt-in.** `'use client'` exists only where hooks, browser APIs, or interactivity demand it.
- **Errors throw with context.** Error messages are part of the contract with the model — clean ones help recovery.
- **Comments default to none.** Only the *why* is documented when the *what* is in the code.

Full naming, type strictness, error handling, and the server/client boundary are documented in [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md). **Consistency is what makes a codebase legible to the next person.**

---

## What this becomes for your business

A note on this demo's scope before we get to your store:

We built the database from scratch because **there was no existing store to integrate with** — the entire stack is the artifact. Your real engagement starts where you already are. Existing Shopify, Magento, custom Postgres, headless CMS — we read into your infrastructure, identify what's missing, build what's needed. **You're not buying this repo. You're buying the way of thinking that produced it.**

What changes when this becomes a real engagement:

- **Brand voice** — we study your brand, write your `system-prompt.ts`, lock your NEVER list. One file, deliberate.
- **Catalog** — we connect to your existing inventory or design merchandising logic that surfaces a curated subset from a larger catalog.
- **Tools** — we build the five-to-ten tools your business actually needs (from the [extensibility map](#what-this-becomes--extensibility-map)). Each one in the same pattern.
- **Model** — your choice from the provider table above. Or a router that picks per-turn.
- **Schema** — we extend your existing tables or design new ones. Migrations versioned, RLS shipped.
- **Observability** — we pipe the per-turn telemetry into your Datadog or Sentry. Hooks already there.
- **Brand visuals** — design tokens in CSS variables. Restyle without touching component logic.

### And the agent doesn't have to be a sales agent.

This demo shows a commerce agent because that's what the Linden brief asked for. The same four-layer organization applies to other agents your business might need:

- **HR agents** — screen candidates against role-specific organization knowledge, brand-aligned voice for first contact.
- **Inventory agents** — forecast restocks against sales velocity, image recognition on shelf photos, alert on anomalies.
- **Cross-sell agents (visual)** — pair products by visual + semantic similarity, brand-aware reasoning ("this matches the walnut you bought").
- **Margin / analytics agents** — surface profit patterns no human would notice, recommend pricing or sourcing changes.
- **Internal-knowledge agents** — let your team query the brand book, the playbook, the customer database, with brand voice intact.

**Different vertical, same architecture.** The agent is the medium. The method is the product.

If your business needs an agent that performs because the system performs, the conversation starts here: [**hire on Upwork →**](https://upwork.com/freelancers/felipemoreira)

---

## Try it / Run locally

**Live demo.** [agentic-commerce-demo-xi.vercel.app](https://agentic-commerce-demo-xi.vercel.app)

**Source.** This repo.

### Local setup

```bash
# 1. Clone and install (~1 min on a fresh machine)
git clone https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo.git
cd agentic-commerce-demo
npm install

# 2. Configure environment
cp .env.example .env.local
# fill .env.local with DeepSeek + Google AI + Supabase keys

# 3. Apply migrations against a fresh Supabase project (in the SQL Editor)
#    supabase/migrations/001_init.sql   — schema + extensions + RPC + RLS
#    supabase/migrations/002_seed.sql   — 12 products + 5 FAQ rows

# 4. Generate FAQ embeddings (idempotent — only embeds rows missing one)
npm run embeddings

# 5. Run dev server
npm run dev
```

Each environment variable is documented in [`.env.example`](.env.example) with notes on what it's for. The `DEEPSEEK_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY` are read by the AI SDK provider packages directly, so they don't appear in the codebase as `process.env.*` references — but both are required.

---

## Built by

**Felipe Moreira** — I read the client's situation before proposing the solution. Then I organize what needs organizing. Then I build — for the short, medium, and long term.

- Source — [github.com/Revcoon-Felipe-AI/agentic-commerce-demo](https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo)
- Hire on Upwork — [upwork.com/freelancers/felipemoreira](https://upwork.com/freelancers/felipemoreira)

Open source under MIT. Clone, study, ship your own.

---

## Long-form

This README is the fast tour. The companion document goes deeper:

- [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md) — the builder's diary: how I thought through each decision, what I'd revise, and the bugs that taught me what observability is for.

---

## License

MIT — see [`LICENSE`](LICENSE).
