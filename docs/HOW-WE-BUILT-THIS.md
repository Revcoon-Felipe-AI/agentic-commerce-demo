# How we built this — the thinking behind Linden

> *"On day three of building Linden, the project clicked. Up to that point, the work felt like fifty technical decisions. After the click, it felt like four. This document is what happened between."*

---

<!-- IMAGE SLOT 0 — OPENING VISUAL (optional, brand-aligned)
  Concept: a simple visual representation of the "click" — fifty small dots scattered (the pre-click state),
  resolving into four clean horizontal bands (the post-click clarity).
  Felipe brand palette: cream background, terracota accent for the four bands, charcoal for the dots.
  Editorial minimalism. Could include Sigilo small in the corner.
  Caption: "Before the click. After the click."
-->

If the [README](../README.md) shows the artifact, this shows the method. The questions asked before any code was written. The trade-offs weighed. The mistake I'd warn the next person against. And the click on day three when fifty decisions resolved into four.

This document is for the kind of reader who wants to know *how* before they decide *whether*. If that's you, the next eleven sections are written for the next time you have to choose.

---

## 1. Why this exists

I'd been writing the same Upwork pitch for months — *"I ship production-grade Vercel AI SDK applications — agents with real tool calling, real RAG, real cost controls."* — and reading it back the way a CTO with thirty proposals would read it. It read the same as fifty others. Words don't differentiate at this layer of the market. **Demos do.**

So I gave myself two real constraints and built one:

- **Twenty hours of total build time, broken into five sessions of four hours each.** That's the budget I'd quote a real client. If I can't ship a portfolio piece in the same time I'd ship a paid project, the pitch is hollow.
- **Zero compromise on the patterns that matter in production.** Strict TypeScript with the two extra strictness flags most teams skip. Real database with real RLS. Edge runtime where it earns its keep. Brand-aware system prompt. Cost telemetry. Rate limiting. The kind of thing that should already exist in a private repo at a mid-stage SaaS company.

The artifact is in the repo. The method is here.

---

## 2. The unusual first question

Session zero, before any code, the question on the table was: **what does this brand sound like before the agent says a word?**

Most AI commerce demos answer that question with the model's default personality — friendly, helpful, mildly enthusiastic, mildly empty. The customer ends up talking to GPT-4 wearing a logo. I wanted the opposite: a brand that already had a voice when the agent showed up to use it.

So I designed a small multi-stage workflow to produce the brand artifacts before writing any UI. It went through a sequence of focused passes — strategy, archetype, design system, voice rules, narrative, equity audit — each consuming the output of the previous as locked context. The output was a 12,000-word brand identity document that became the load-bearing reference for everything that followed: the system prompt copied a section verbatim; the tool descriptions inherited brand-aware constraints; the page hierarchy followed the narrative structure; the microcopy passed through the NEVER list.

The triangulation from doing it this way was the unusual part. By the time five different angles (strategy, archetype, design, narrative, sticky-brand mechanics) had each independently arrived at the same conclusion — that the differentiator was a behavior called the Refusal Surface — I knew the position was load-bearing. **Without that triangulation, I'd have built another DTC chatbot.**

> *Identity preceded software. Every downstream decision had a single source of truth to defer to. That's the productivity multiplier most demos skip — and the reason most demos read interchangeably.*

---

## 3. Why furniture, deliberately

The brief could have been anything. Why move into a vertical with real complexity instead of picking something easier?

Three reasons came up in the brief, and one settled it:

- **A t-shirt store would have hidden a weak architecture.** Any LLM with a search index would have landed the demo. There's nothing about t-shirts that requires the agent to reason — size, color, price, done.
- **Furniture has dimension, ambient context, fit, light direction.** A good recommendation requires the agent to ask first, retrieve semantically, reason within the brand's voice. The vertical exposes whether the agent actually thinks or just looks like it does.
- **The Refusal Surface needed something to refuse.** "Don't buy this t-shirt" is meaningless. "Don't buy this $1,400 sofa for your 9-foot wall" is load-bearing. The vertical had to support the behavior the brand was built around.

The choice settled when I realized the brief was the architecture's stress test. **Easier briefs hide weak architectures. Harder ones expose them.** I picked the harder one.

---

## 4. Twenty hours, five sessions — and why the constraint mattered

Twenty hours wasn't about speed. It was about **making the calendar match the quote.**

If I tell a client *"I can build this in twenty hours,"* and then I take forty to ship a portfolio piece, the pitch isn't lying — it's just hollow. The constraint forced every nice-to-have to defend itself against the budget. Most didn't survive.

How the time actually broke down:

| Session | Focus | What got cut |
|---|---|---|
| 1 (4h) | Project scaffold + Supabase + migrations + asset pipeline | A more elaborate hero illustration; reverted to type |
| 2 (4h) | All five pages + global components + chat placeholder | Mobile-perfect responsive polish; shipped good-enough, documented as roadmap |
| 3 (4h) | `/api/chat` route + system prompt + six tools + telemetry class | Multi-shot product imagery; TODO comment in PDP |
| 4 (4h) | `ChatModal` real, `useChat` v6, message parts wiring, cost panel | Server-backed chat history; sessionStorage was the right scope anyway |
| 5 (4h) | QA gate, README, LICENSE, OG image, middleware, polish pass | A/B testing harness for sticky phrases; out of scope, documented |

The brand-first work paid off here. **I never stopped to debate microcopy or visual direction during implementation** — every decision had a referenceable source. That's the productivity multiplier of doing the brand work first, even when the brand is fictional.

> *The constraint isn't proof of speed. It's proof that the quote is honest.*

---

## 5. The click — four layers, not seventeen

On day three, the project clicked. Up to that point the architecture felt like seventeen interlocking technical choices — Tailwind v4 vs config file, Next.js 16 vs Pages, edge vs Node, RLS vs ignore-it-for-now, sessionStorage vs server, Zod vs raw types, the AI SDK transport abstraction vs hardcoding the provider, the catalog size, the system prompt voice, the cost panel, the rate limit, the OG image, the favicon, the lint rules.

Then the click. Every one of those decisions clustered into **four organizing layers:**

<!-- IMAGE SLOT 1 — THE FOUR LAYERS (the click, visualized)
  Same visual referenced in README SLOT 1 (or its companion):
  Four stacked horizontal layers, each with a label and one-line decision.
    Layer 1: BRAND VOICE — locked in code, not in fine-tuning
    Layer 2: DATABASE — designed for how an agent reads it
    Layer 3: TOOLS — contracts, not functions
    Layer 4: MODEL — swappable, never coupled
  Felipe brand palette: cream backdrop, terracota dividers, charcoal labels.
  Caption: "Day three. Fifty decisions resolved into four."
-->

- **Layer 1 — Brand voice as code.** The system prompt isn't a configuration knob; it's a behavioral specification. Replace the model and the brand still sounds like Linden.
- **Layer 2 — Database designed for how an agent reads it.** Column names carry semantic meaning. The schema was built knowing an agent would query it, not knowing a human would admin it.
- **Layer 3 — Tools as contracts.** Strict Zod schemas. The agent can never write SQL. Drift is impossible. The boundary doubles as a security layer against prompt injection.
- **Layer 4 — Model as a swappable layer.** Provider-agnostic transport from the start. Switch DeepSeek to Claude in one file.

Once those four layers were visible, every new decision had an obvious home. **The Refusal Surface** — the agent's willingness to say *"honestly, don't buy this one"* — wasn't a feature in the system prompt. It was a *property* of the four-layer organization. Small catalog (Layer 2 + brand decision) plus typed tools (Layer 3) plus locked voice (Layer 1) plus a brand that visioned long-term trust (the brief). Remove any one of those and the refusal stops feeling honest.

> *The brand and the system are the same thing if you build them right. That click — that organizing insight — is what travels to the next client. The artifact is the proof. The four layers are the method.*

---

## 6. Five trade-offs I made and why

I rejected as much as I chose. Five rejections worth showing — because the rejected option is usually the one a less careful team would have shipped.

### Trade-off 1 — Tailwind v4 `@theme inline` vs `tailwind.config.ts`

I considered keeping the JS config file. It's the pattern most teams know. Then I asked: what does the JS config buy that CSS variables don't? **Nothing, except a build step and a place for tokens to drift from production.** So tokens live in `globals.css` via `@theme inline`. One source of truth. Debuggable in dev tools, in production, in the documentation, in every component.

*Tradeoff:* anyone reading the codebase needs to know v4's `@theme inline` syntax. Worth one tooltip in the README.

### Trade-off 2 — AI SDK v6 transport abstraction vs hardcoded provider client

The shorter path was importing `@ai-sdk/google` and calling it directly from the chat hook. The longer path was building against `DefaultChatTransport` from the SDK — same end result, more lines.

I picked the longer path. **Two days later, when I had to migrate from Gemini to DeepSeek mid-build, the abstraction saved me about two hours and one file.** Every provider swap from there forward is a one-line change in `model-router.ts`.

*Tradeoff:* the v6 message-parts format (`message.parts[]` with typed parts) is more verbose than v5's flat content. Worth it for the typed tool results and the migration safety.

### Trade-off 3 — Twelve SKUs vs a richer demo catalog

A bigger catalog would have looked more "real" at first scroll. I rejected that for a brand reason: **the Linden brand merchandised with restraint, capped at fifty SKUs by design**, and a small catalog is what allows the agent to recommend with opinions instead of returning a search ranking.

*Tradeoff:* less visually impressive at the first scroll. Pays back the moment the customer asks for a recommendation and gets one tied to their context, not a results page.

### Trade-off 4 — `sessionStorage` vs server-side persistence

The cart and chat history live in `sessionStorage` and reset when the tab closes. I considered a server-side cart table (anonymous via cookie, attached to user ID after auth). Rejected because there's no auth, no checkout, and one-tab life is the right scope for a portfolio demo.

*Tradeoff:* customer can't open Linden on phone and continue on laptop. Acceptable here, easy to upgrade when the engagement is real.

### Trade-off 5 — Hand-rolled HTML vs `shadcn/ui` or Radix

Ten components. All under 250 lines. A component library would have cost more time than it saved at this scale. The brand also called for editorial restraint — Radix's primitives would have nudged the UI toward a generic SaaS aesthetic.

*Tradeoff:* less standardized vocabulary if a second engineer joins. Only matters at team size > 1.

> *Rejection is the design move that teaches. What you said no to is what shows what you understand. The chosen option only makes sense in the shadow of the rejected ones.*

---

## 7. Five observability moments

Five moments where the system told me something I didn't expect — and where the right instrumentation made the unexpected debuggable in minutes instead of days. The general lesson is at the bottom; each moment is short.

### Moment 1 — The em-dash that crashed the chat

Symptom: every chat turn returned 500. Server logs pointed to the `Headers` constructor at codepoint 8212. HTTP headers must be ByteString — bytes 0-255 only. My `X-Routing-Reason` header value contained `—` (em-dash) and `×` (multiplication sign), straight out of the brand voice.

Fix: kept `—` and `×` in customer-facing strings; replaced them with `--` and `x` in any string that could end up in a header. Documented the boundary in `model-router.ts` for the next person.

*Lesson: brand voice and HTTP encoding live at different layers. When data crosses layers, encoding constraints cross with it.*

### Moment 2 — AI SDK v6 broke three v5 signatures at once

Symptom: every example I started from compiled in v5 and failed under v6. `convertToCoreMessages` was renamed and now returns a Promise. `result.toDataStreamResponse({ headers })` became `toUIMessageStreamResponse`. `maxSteps: 5` became `stopWhen: stepCountIs(5)`. `messages.findLast(...)?.content` no longer typechecked because `UIMessage` has no `content` field.

Fix: read the installed `node_modules/ai/dist/index.d.ts` instead of any blog post. Wrote `extractLastUserText()` that handled both shapes.

*Lesson: trust the installed type defs over any tutorial. The AI SDK is an active codebase; tutorials lag.*

### Moment 3 — Gemini deprecated the embedding model mid-build

Symptom: first run of `npm run embeddings` failed with *"models/text-embedding-004 is not found for API version v1beta."*

Fix: migrated to `gemini-embedding-001` with `outputDimensionality: 768` (Matryoshka representation learning truncates the 3072-dim output without losing semantic validity).

*Lesson: pin model names in code (which I did) but build with a swappable embedding interface. Embedding models change names faster than chat models.*

### Moment 4 — Body scroll lock broke desktop UX

Symptom: with the chat modal open, the page underneath was frozen on desktop. Customers chatting about a sofa couldn't scroll the PDP photos at the same time.

Diagnosis: I'd applied scroll lock unconditionally for the mobile bottom-sheet pattern. On desktop, the chat is a 640px right drawer; most of the viewport is still the page.

Fix: wrapped the lock in `window.matchMedia('(max-width: 767px)').matches`.

*Lesson: modal patterns rarely transfer cleanly between mobile and desktop. Always test the same interaction on both.*

### Moment 5 — `react-hooks/set-state-in-effect` blocked legitimate patterns

Symptom: ESLint kept firing on `useEffect` flows that were correct (sessionStorage hydration, IntersectionObserver callbacks, event-driven setState).

Fix: inline `eslint-disable-next-line` with a one-line reason comment. The rule can't distinguish dangerous render-coupling from legitimate external-event-driven state.

*Lesson: lint rules are heuristics, not laws. When they fire on legitimate patterns, document the exception inline so the next reader knows it was intentional.*

> *Each of these moments was opaque without the system telling me what was wrong. Observability isn't a feature — it's the thing that makes a project debuggable in production. Building it before you need it is the discipline that separates "shipping" from "shipping responsibly."*

---

## 8. The mistake I'd warn the next person against

I started single-provider on Gemini because the `.env` was simpler — one API key, one fewer environment variable, one less thing to document. **It felt like the smart-simple choice at the moment I made it.**

Free tier on Gemini Flash Lite: 20 requests per day per model. I burned through it within an hour of integration testing. The migration to DeepSeek took two hours and one file — only because the AI SDK transport abstraction was already there from Trade-off 2.

The mistake wasn't the choice of Gemini. The mistake was **picking simplicity over future-proofing in a layer where future-proofing is cheap.** I'd already built the abstraction; I just hadn't honored it from the start.

> *The transport abstraction is the cheapest discipline to keep and the most expensive to skip. I won't skip it again — and if I'm advising anyone else, this is the discipline I'd put first.*

---

## 9. Three things I'd revise if this were the real engagement

Three things I left out that a real client would need. Documented, not hidden.

**Per-turn cost telemetry from the streaming meta event.** The cost panel currently shows turn count and average latency client-side; per-turn dollar cost is tracked only in server logs. The pattern (server emits a custom data part with model+cost+tokens, client consumes via `onData`) is documented as a TODO in `ChatModal.onFinish` but not yet implemented. ~2 hours of work.

**Authenticated session for chat history.** The "she remembered" moment is dramatically more powerful when it survives a return visit a week later. Server-side chat persistence attached to user ID would change the demo from "smart in this tab" to "smart across visits." Out of scope for portfolio; in scope for production.

**A/B testing harness for the brand voice.** Writing locked sticky phrases is great until you want to know which phrasing converts. A small A/B framework (probably via Vercel Edge Config) would swap in alternative phrasings for the locked greeting and measure outcome differences. The voice is a product surface — it deserves the same testing discipline as the buy button.

> *What's missing is documented, not hidden. A real engagement starts where this demo stops — and the roadmap above is what the first conversation would cover.*

---

## 10. What I'm exporting to the next client

What travels from this project isn't the code. It's **the way of choosing.**

The four-layer organization is the export:

- The next client's brand replaces Layer 1 (voice locked in their code, not mine).
- Their schema replaces Layer 2 (designed for how their agent will read it, not Linden's).
- Their tools list replaces Layer 3 (cart recovery, order status, vendor personality, the right ten for their business — same Zod-contract pattern).
- Their model preference replaces Layer 4 (DeepSeek, Claude, OpenAI, MCP — your choice, my router).

What also travels:

- **The discipline of asking the unusual first question** — *what does this brand sound like before the agent says a word?*
- **The discipline of rejecting**, not just choosing — every trade-off ADR-documented so the next engineer knows what we considered and why.
- **The discipline of building observability before features that need it** — debuggability is a precondition, not a polish step.
- **The discipline of treating the system prompt as code** — versioned, locked, peer-reviewed.
- **The discipline of making the calendar match the quote** — twenty hours quoted means twenty hours delivered, or the pitch is hollow.

> *The artifact is the proof. The method is the product.*

---

## 11. The next conversation

If any of this resonates with how you'd want your agent built — the layered organization, the brand-first sequence, the trade-offs documented, the observability shipped before launch — the conversation continues here:

- [Hire on Upwork →](https://upwork.com/freelancers/felipemoreira)
- [GitHub →](https://github.com/Revcoon-Felipe-AI/agentic-commerce-demo)

Words don't differentiate at this layer of the market. Demos do. **This was mine.**

---

*This document is part of the Linden agentic-commerce-demo repository.*
*For the artifact, see the [README](../README.md).*
*Live demo: [agentic-commerce-demo-xi.vercel.app](https://agentic-commerce-demo-xi.vercel.app)*
