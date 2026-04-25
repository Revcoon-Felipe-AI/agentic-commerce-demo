# How I Built Linden

> The long-form behind the short README. How I thought about the problem, the
> premise, the stack, the brand, the bugs, and what I'd do differently next time.

---

## 1. Why I built this

I'm an AI agent engineer. The pitch I make to clients on Upwork is: *"I ship production-grade Vercel AI SDK applications — agents with real tool calling, real RAG, real cost controls, real brand discipline."* The problem is that pitch reads the same as fifty other freelancers'. Words don't differentiate. Demos do.

Specifically, I needed a demo that would let a technical CTO scroll past the elevator copy, click a link, brain-dump for sixty seconds, and walk away thinking *"this person is operating at a different tier."* Not a static screenshot deck. Not a YouTube tour. A live, working artifact she could break, study the code of, and form an opinion on without ever messaging me.

So I gave myself two real constraints:

- **Twenty hours of total build time, broken into five sessions of four hours each.** That's the budget I would charge a client. If I can't ship a portfolio piece in the same time I'd ship a paid project, the pitch is hollow.
- **Zero compromise on production patterns.** No tutorial-grade shortcuts. Strict TypeScript. Real database. Edge runtime. Brand-aware system prompt. Cost telemetry. Rate limiting. The kind of thing a CTO would expect to find in a private repo at a mid-stage SaaS company.

This document is the build journal. It is honest about tradeoffs, opinionated about decisions, and structured so a hiring manager can scan it in fifteen minutes or read it in thirty.

---

## 2. The premise: AI as the merchandising surface, not a help widget

Most AI integrations on e-commerce sites today are still pinned to the corner — a small chat bubble labeled "Need help?" that opens to a generic LLM with a fine-tuned system prompt. That is not where the value is. The customer who needs help with shipping is not the customer who is going to spend $1,500 on a sofa.

The customer who is going to spend $1,500 on a sofa is the one who has eleven browser tabs open, a partner who tunes out the shopping process, and a Pinterest board with three hundred and forty pins. That customer needs **a curatorial conversation**, not a search bar with autocomplete. The traditional response — "more options," "more filters," "guided quizzes" — is the wrong medicine. The actual remedy is fewer options, better-explained, with someone whose taste they can borrow.

That someone, in 2026, can be an AI. The premise of Linden is that the AI agent **is** the store — not an assistant to it. The customer doesn't browse a grid and then ask the bot for help. The customer opens a conversation and the bot does the merchandising. The product cards appear inside the chat, with the reasoning attached. The site exists primarily as a fallback for when the customer wants to deep-link to a specific piece they were already shown.

The Linden brand makes this premise visible in two design moves:

1. **The catalog is small.** Twelve SKUs in this demo, scaling to a hard cap of fifty. A small catalog is a precondition for the kind of intimate recommendation the agent makes. If the agent is recommending across ten thousand SKUs, it has no opinions — it has a search algorithm.
2. **The agent is willing to refuse.** When a piece doesn't fit the customer's room, the agent says *"honestly, don't buy this one."* This is the load-bearing differentiator. It is also the reason the rest of the agent's recommendations can be trusted.

These are not technical decisions. They are product decisions that constrain the technical surface. Every line of code in the repo serves them.

---

## 3. The brand-first approach

I made an unusual decision at the start: **build the brand before writing any code.** Not in the loose sense of "name it and pick a color palette" — in the rigorous sense of producing a complete brand identity document, a full design system, a twelve-SKU product catalog, a system prompt voice guide, and a set of NEVER rules, all before the first `npm install`.

The reason: every downstream decision needed a single source of truth to defer to. The system prompt needed a voice. The microcopy needed a tone. The page hierarchy needed a thesis. The tool descriptions needed brand-aware constraints (e.g., `compare_products` requires honest ranking — never "both are great"). If I waited to figure that out during implementation, I'd hand-wave half of it and ship inconsistencies I'd have to fix later.

I designed a small multi-stage workflow to produce the brand artifacts. It went through a sequence of focused passes — strategy, archetype, design system, voice rules, narrative, equity audit — each consuming the output of the previous as locked context. The output was a 12,000-word `BRAND-IDENTITY.md` that became the load-bearing reference for everything I shipped after.

The triangulation from this approach was unusual. By the time five different angles (strategy, archetype, design, narrative, sticky-brand mechanics) had each independently arrived at the same conclusion — that the differentiator was a single behavior called the Refusal Surface — I knew the position was load-bearing. Without that triangulation, I would have built another DTC chatbot.

I realize this is more brand effort than most "AI demo" repos contain. That is the point. The reason CTOs are skeptical of AI-on-commerce demos is that most of them are tech demonstrations grafted onto generic store templates. The agent is novel; the surface around it is a placeholder. Linden inverts that — the brand is bespoke, the catalog is a real catalog with character, and the agent is the natural extension of a coherent shop. **The technical novelty is the AI; the strategic novelty is making the AI feel like the store's identity, not a feature on top of it.**

---

## 4. Stack decisions and tradeoffs

I default to small stacks. Anything I add to `package.json` has to earn its keep.

**Next.js 16 (App Router).** Server Components let me query Supabase directly from a page without bundling the client to the browser. The PDP renders straight from a server query — no `/api/products` endpoint to maintain. The chat hook is the only client-stateful surface. Tradeoff: App Router quirks are real (async `params`, `convertToModelMessages` returns a Promise in v6, etc.). I documented every gotcha in the Lessons section below.

**TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.** Every freelancer says "I write strict TypeScript." Most don't run `noUncheckedIndexedAccess`. The flag turns `arr[i]` into `T | undefined` and forces explicit handling — which is what the runtime actually does. Same for `exactOptionalPropertyTypes`: it catches the `undefined`-vs-missing distinction that bites you in PATCH endpoints. Both flags raised the bar of every line I shipped.

**Tailwind v4 with `@theme inline`.** Design tokens live in CSS, not in a JS config. `--color-ink-primary: #2A2722` is the same in dev tools, in prod, and in the documentation. I refuse to maintain a separate `tailwind.config.ts` for theme values when the language already has CSS variables for that purpose.

**Vercel AI SDK v6 with `DefaultChatTransport`.** I built the chat hook against the SDK's transport abstraction, not against a specific provider. The chat doesn't know whether DeepSeek or OpenAI or Anthropic is on the other end of the wire. That decoupling is what saved me when I had to switch providers mid-build (more on that below). Tradeoff: the v6 message-parts format is more verbose than v5 — every message has a `parts[]` array of typed parts (`text`, `tool-search_products`, `tool-add_to_cart`, etc.). Worth it for the typed tool results.

**DeepSeek for chat, Gemini for embeddings.** I started single-provider on Gemini (one API key, simpler `.env.local`). Within an hour of integration testing, I burned through Gemini Flash Lite's free-tier quota of 20 requests/day per model. Rather than wait for billing to enable, I kept Gemini for the embedding workload (lower call rate, free tier sufficient at one embed per `query_faq`) and migrated the chat path to DeepSeek (full function-calling support, cheap, generous credits). The migration was a one-file change — `lib/ai/model-router.ts` — exactly the kind of thing the abstraction earns you.

**Supabase + pgvector.** Free tier, edge-friendly, RLS on every table, native vector column. I considered Postgres-on-Neon and Postgres-on-Railway; Supabase wins for the bundled pgvector setup and the SQL editor that just works. Tradeoff: I'm tied to one platform for hosting the DB, but the schema is portable (it's just SQL).

**Zod 4 for tool schemas.** The schemas are a contract with the model — they tell it what arguments are valid. Zod gives me type safety in the handler and runtime validation on the input. The model uses the `.describe()` strings to decide when to call each tool, so I treated those descriptions as system-prompt fragments and wrote them carefully.

**No `shadcn/ui`, no Radix, no Framer Motion.** The UI is small — about ten reusable components, all under 250 lines. Adding a component library would slow me down more than it would save me. Animations are intentionally calm (the Linden brand calls for editorial restraint, not motion-graphics theater). I use CSS transitions plus a tiny IntersectionObserver-driven `Reveal` component for fade-ins. Bundle stays under 200 KB.

**No Redux, no Zustand.** State is local where possible. Cart is `useState` plus a custom event for cross-component change notifications. Telemetry is a class instance with `useState` to trigger re-render. Nothing global that doesn't need to be.

**`sessionStorage` for cart and chat history.** No auth, no checkout, no server-side persistence. The cart and the chat conversation live in `sessionStorage` and reset when the tab closes. That's the realistic scope for the demo and respects privacy by default. Easy to upgrade to authenticated server persistence later when the product calls for it.

---

## 5. The Refusal Surface as load-bearing brand mechanic

The most important sentence in the Linden codebase is in the system prompt:

> When a piece won't fit (room too small, light direction wrong, scale off, customer's budget exceeded), say so directly. Use the locked phrase: *"Honestly, don't buy this one."* NEVER soften refusal into *"you might consider an alternative"* or *"this could be a stretch but..."*. When refusing, suggest an alternative that fits, OR suggest waiting until they have more information about their room. Refusal is not negative — it builds trust. Every refusal earns the next recommendation.

Three things to note about this paragraph:

**First**, it is a *behavior specification*, not a personality direction. I am not telling the model "be honest" — I am telling it the exact sentence to use, and the exact phrasings to forbid. The system-prompt language is precise because the cost of drift is the entire brand thesis collapsing.

**Second**, the locked phrase is *short*. *"Honestly, don't buy this one."* It is five words. It is memorable. It is the kind of line a customer will quote to a friend. (One of the brand's stickiness goals: the line that lands in a screenshot.) If I'd written *"I would actually recommend reconsidering this purchase based on your room dimensions"*, no one would remember it.

**Third**, the refusal is *paired*. The system prompt requires that a refusal be followed by either an alternative pick that fits, or by a recommendation to wait for more information. The agent never refuses and leaves the customer hanging. That pairing is what converts the refusal from a friction point into a trust-building moment.

I tested the Refusal Surface with a single prompt: *"Can the L-Shape Sofa fit in a 9-foot room?"* The L-Shape Sofa is 102 inches wide. A 9-foot wall is 108 inches. The agent should refuse — there's barely 6 inches of clearance and no room to walk around it. On every test run, the agent fired the locked phrase and pivoted to the lounge chair as a fit. That behavior is not an emergent property of the model — it is engineered.

---

## 6. Shipping in 5 sessions × 4 hours

The original plan was a 20-hour budget broken into five sessions. Here's how the time actually shook out:

- **Session 1 — Foundation (4h).** Project scaffold (Next.js 16, Tailwind v4, TypeScript strict, Google Fonts loading, design tokens populated). Supabase project creation, two migrations (`001_init.sql` for schema + RLS + the `match_documents` RPC, `002_seed.sql` for the 12 products and 5 FAQs). Asset pipeline (12 product `.webp` files plus 9 lifestyle shots, all WebP-converted and under 150 KB each).

- **Session 2 — UI surface (4h).** All five pages (home, PDP, cart, about, 404) plus the global components (Header, Footer, ProductCard, ChatBubble, ChatModalPlaceholder). The home was deliberately editorial — five sections, mostly typography, no JavaScript-heavy interactions. The chat bubble was a placeholder that opened a static modal shell.

- **Session 3 — Backend AI (4h).** The `/api/chat` route handler running on the edge. The system prompt (locked from the brand identity doc, copied verbatim into `lib/ai/system-prompt.ts`). The model router. The six tools, each in its own file with a Zod schema. The telemetry class. By the end of the session, `curl POST /api/chat` returned a streaming response with tool calls.

- **Session 4 — Chat UI integration (4h).** Replaced the modal placeholder with the real `ChatModal` component using `useChat` from `@ai-sdk/react`. Wired the typed message parts to render `ProductCardInline` for `search_products` results, `CompareTable` for `compare_products`, and a small italic confirmation strip for `add_to_cart`. Hooked the `add_to_cart` tool call interception to mutate the browser cart and pulse the header badge.

- **Session 5 — Polish + deploy prep (4h).** QA gate (typecheck, lint, brand audit against the NEVER list). README and LICENSE. Favicon, OG image, middleware. The visual polish pass on the home (numbered BrandScript section, hero gradient overlay, category hover affordance, drop cap on the editorial section). The chat teaser invitation widget that rotates above the pill.

Net: I came in close to budget. Some sessions ran a little over, others under. The discipline of writing the brand identity first paid off — I never stopped to debate microcopy or visual direction during implementation. Every decision had a referenceable source. **That's the productivity multiplier of doing the brand work upfront, even when the brand is fictional.**

---

## 7. Notable bugs and how I solved them

A short selection of the bugs that actually cost me time, and what I learned from each.

### Bug 1 — `TypeError: Cannot convert argument to a ByteString` from `/api/chat`

**Symptom.** Every chat turn returned 500. Server logs showed the error firing on `result.toUIMessageStreamResponse({ headers: { ... } })`.

**Diagnosis.** HTTP headers must be ByteString — bytes 0-255 only. My `X-Routing-Reason` header value contained `—` (em-dash, codepoint 8212) and `×` (multiplication sign, codepoint 215), straight out of the brand voice. The character at codepoint > 255 made the Headers constructor reject the entire object.

**Fix.** Two paths considered: encode the header values, or replace the offending characters at source. I chose the second — it's cleaner — and added a comment in `lib/ai/model-router.ts` reminding the next person to keep reason strings ASCII-safe. The customer-facing copy (system prompt, cards, microcopy) keeps the em-dashes; only the header strings dropped them.

**Lesson.** Brand voice and HTTP encoding live at different layers. When data crosses layers (a brand string ending up in a header), encoding constraints cross with it.

### Bug 2 — AI SDK v6 broke three signatures from the v5 examples

**Symptom.** Every example I started from compiled in v5 mode but failed under v6. Specifically:

- `convertToCoreMessages` was renamed to `convertToModelMessages` *and* its return became `Promise<ModelMessage[]>` (await it).
- `result.toDataStreamResponse({ headers })` became `result.toUIMessageStreamResponse({ headers })`.
- `maxSteps: 5` was replaced by `stopWhen: stepCountIs(5)` (with `stepCountIs` imported from `'ai'`).
- `usage.inputTokens` and `outputTokens` are now `number | undefined` — coalesce with `?? 0`.
- `messages.findLast(m => m.role === 'user')?.content` no longer typechecks because `UIMessage` has no `content` field — content lives in `message.parts[]` typed parts.

**Fix.** Wrote `extractLastUserText()` in `app/api/chat/route.ts` that handles both shapes (v6 parts + legacy fallback). Added all the renamed APIs to `lib/ai/system-prompt.ts` documentation block. Bumped the TypeScript `lib` from ES2022 to ES2023 to get `findLast` typed (it's a native method now, just the old `lib` setting hid it).

**Lesson.** The AI SDK is an active codebase. Trust the installed `node_modules/ai/dist/index.d.ts` over any blog post or example you find online. Read the type defs.

### Bug 3 — Gemini `text-embedding-004` was deprecated

**Symptom.** First run of `npm run embeddings` failed with *"models/text-embedding-004 is not found for API version v1beta."*

**Diagnosis.** The embedding model name in my script was outdated. The current production model is `gemini-embedding-001`, but it defaults to 3072-dim output — incompatible with my `vector(768)` schema column.

**Fix.** Switched to `gemini-embedding-001` and passed `outputDimensionality: 768` via `providerOptions.google` to the `embed` call. Matryoshka representation learning means the truncated embedding remains semantically valid, just at lower fidelity. The `query_faq` tool needed the same change (it embeds the query at request time).

**Lesson.** Embedding models change names faster than chat models. Always pin the exact model name in code (which I did) but don't trust that it'll still exist in six months. Build with a swap-able interface, even for embeddings.

### Bug 4 — Body scroll lock broke desktop UX

**Symptom.** On desktop, when the chat modal was open, the page underneath was frozen. A customer chatting about a sofa couldn't scroll the PDP photos at the same time.

**Diagnosis.** I'd implemented body scroll lock to prevent the page from scrolling on mobile (where the chat is a bottom sheet that leaves an 8% peek). The implementation locked unconditionally. On desktop, the chat is a 640px right drawer — most of the viewport remains visible page, and locking it made the experience feel broken.

**Fix.** Wrapped the lock in a `window.matchMedia('(max-width: 767px)').matches` check. Mobile only.

**Lesson.** Modal patterns that work on mobile often break on desktop, and vice versa. Always test the same interaction on both surfaces. The brand-correct behavior — scroll the PDP while talking about it — is exactly what was prevented.

### Bug 5 — `react-hooks/set-state-in-effect` lint rule blocked legitimate patterns

**Symptom.** ESLint kept throwing on patterns I knew were correct: `setState` calls inside `useEffect` for sessionStorage hydration, IntersectionObserver callbacks, and event-driven flows.

**Diagnosis.** The rule is conservative. It can't distinguish "synchronous render-coupling" (the dangerous pattern) from "external-event-driven setState" (the legitimate pattern).

**Fix.** Inline `eslint-disable-next-line react-hooks/set-state-in-effect` with a comment explaining the specific reason. For the entire `Reveal` effect (which exists *because* of external scroll events), I used a block-level disable with a clear rationale comment.

**Lesson.** Lint rules are heuristics, not laws. When they fire on legitimate patterns, document the reason inline so the next reader knows it was intentional, not lazy.

---

## 8. What I'd do differently in v2

Honest list of things I'd revisit if this were a real product, not a portfolio piece.

**Per-turn cost telemetry from the streaming meta event.** The cost panel currently shows turn count and average latency client-side, but the per-turn dollar cost is tracked only in server logs (visible in Vercel function logs). I haven't yet wired the AI SDK v6 streaming meta event for usage to surface it on the client. The pattern (server emits a custom data part with model+cost+tokens, client consumes via `onData`) is documented as a TODO in `ChatModal.onFinish` but not implemented. ~2 hours of work.

**Multi-shot product imagery.** Each PDP currently renders the same hero image three times in the contextual photos grid. I have a TODO comment in the code marking the spot. v2 would add an `images: string[]` column to the products table, generate the multi-shot images via the Nano Banana (Gemini Flash Image) prompt library I built, and render them in a real grid.

**Server-side cart persistence.** The `sessionStorage` cart is the right scope for a portfolio demo, but a real e-commerce site would need to survive the customer closing the tab. v2 would add a small server-side cart table (anonymous via cookie ID for guest checkout, attached to user ID after auth), and the cart UI would auto-sync.

**Authenticated session for the chat history.** Same logic as above. The "she remembered" moment is dramatically more powerful when it survives a return visit a week later.

**Streaming meta-event for routing decisions.** Right now `X-Routing-Reason` lives in the response header and is logged server-side. The cost panel could surface the routing decision per turn ("this turn went to deepseek-reasoner because the message contained 'compare'") — that transparency is the point of the panel.

**Mobile-first audit of the Reveal animations.** The IntersectionObserver-based fade-ins behave well on desktop. On older mobile browsers (iOS Safari 15-), the `rootMargin` calculation can be jittery. I'd test on a real iPhone SE and adjust the threshold if needed.

**Internationalization with route segments.** I added a Portuguese version of the `/about` page under `/about/pt`. For full i18n, I'd refactor the route tree to `app/[locale]/...` with a Next.js native i18n config. Out of scope for this demo, but the pattern is well-trodden.

**A/B testing harness for the brand voice.** Writing locked sticky phrases is great until you want to know which one converts. v2 would add a small A/B framework (probably via Vercel Edge Config) to swap in alternative phrasings for the locked greeting and measure outcome differences.

---

## 9. What this proves I can do

Hiring for AI engineering is hard because the surface is shallow but the depth varies wildly. Most candidates can wire up `streamText` with a tool. Few have shipped production-grade applications with brand-aware system prompts, cost-controlled model routing, RAG over a real schema, and a UX that respects the medium it sits on.

This repository is the existence proof for the second category. Specifically, it demonstrates:

- **AI SDK v6 in production patterns.** Tool-use loops with `stopWhen`. Typed message parts. Custom transports. Streaming with proper metadata. Server actions where they belong.
- **System prompt engineering as a product discipline.** The prompt is short, locked, and load-bearing. Behavioral constraints (the Refusal Surface), formatting constraints (max 3 picks per turn), and voice constraints (no emoji, no superlatives) are all enforced at the prompt layer — not via post-processing or model fine-tuning.
- **Cost-aware model routing.** Heuristic dispatch with deterministic logging. Single-line provider swap (DeepSeek → OpenAI is one file). Per-turn cost projections that match real billing.
- **RAG against a Postgres + pgvector schema.** Real semantic search via the `match_documents` RPC. Embedding model abstracted (Gemini today, OpenAI tomorrow if needed). Hard threshold on similarity to prevent the agent from quoting irrelevant matches.
- **Strict TypeScript at the level real teams should ship at.** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, zero `any`. The kind of strictness that catches real bugs before they ship.
- **Brand-first development.** A complete brand identity, design system, voice rules, and product catalog produced *before* code. The artifact is so coherent that a third party reading the brand doc and then opening the demo will see the brand realized, not gestured at.
- **Edge runtime for the chat path.** Sub-2s TTFB on a streamed response is the default. The customer never waits.
- **A multi-stage workflow design.** I designed and ran a small content-production pipeline to produce the brand identity itself. It's the kind of meta-tooling that lets a single engineer ship at the pace of a small studio. The pattern applies well beyond brand work.

If you've read this far, you have a fairly complete picture of how I think about a project, what I'm willing to spend time on, and what I refuse to compromise on. The next step — if any of this resonates — is to talk about your project.

[felipemoreira@upwork](https://upwork.com/freelancers/felipemoreira) / [github](https://github.com/Revcoon-Felipe-AI)

---

*This document is part of the Linden agentic-commerce-demo repository.
For the short tour, see [`README.md`](../README.md).
For the live demo, see the link in the README (populated after Vercel deploy).
For the source, [you are already here](https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo).*
