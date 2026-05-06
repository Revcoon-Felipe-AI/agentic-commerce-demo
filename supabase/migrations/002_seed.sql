-- 002_seed.sql
-- Linden demo — seed data: 12 products + 5 FAQ documents
-- Source of truth: docs/.brand-research/12-product-catalog.md
-- Embeddings populated separately via `npm run embeddings` (scripts/generate-embeddings.ts)

insert into products (slug, name, description, category, price_usd, dimensions, material, lead_time_weeks, featured, image_url) values

-- LIVING (6)
('l-shape-sofa',
 'L-Shape Sofa',
 'Built for the long Sunday — the kind where you finish a book and don''t move for an hour. The L-shape works in 11-foot rooms but earns its scale at 13. Returnable side, so it fits the apartment you have, not the showroom you saw.',
 'living', 1499.00, '102" W x 64" D x 32" H', 'Kiln-dried oak frame, 8-way hand-tied springs, oat boucle upholstery', 8, true,
 '/products/l-shape-sofa.webp'),

('easy-sunday-lounge',
 'Easy Sunday Lounge',
 'A lounge chair that earns the name — designed for the chair you actually sit in, not the one you walk past. Walnut shows fingerprints on day one and grain on year ten. The cushion needs a fluff once a month; we''ll send a note.',
 'living', 849.00, '30" W x 34" D x 30" H', 'Solid walnut frame, oat boucle seat, feather-down cushion', 6, false,
 '/products/easy-sunday-lounge.webp'),

('walnut-round-coffee-table',
 'Walnut Round Coffee Table',
 'Round because you''ll walk around it twenty times a day. Walnut because it earns the scratches honestly — a year in, the table tells your story without us putting it on Instagram.',
 'living', 649.00, '38" diameter x 16" H', 'Solid kiln-dried walnut, single-piece top, hand-finished oil', 5, false,
 '/products/walnut-round-coffee-table.webp'),

('the-credenza',
 'The Credenza',
 'Holds the things that don''t belong in the kitchen. Holds them at chest height so you don''t bend down. Pairs with a TV on top, but earns its keep without one.',
 'living', 1199.00, '72" W x 18" D x 30" H', 'Oak case, blackened-steel hairpin legs, four soft-close doors', 7, false,
 '/products/the-credenza.webp'),

('open-stack-bookshelf',
 'Open Stack Bookshelf',
 'Five shelves at human heights. Open back so the wall behind it stays part of the room. Holds 80 pounds per shelf — yes, that''s tested, not estimated.',
 'living', 549.00, '36" W x 12" D x 72" H', 'Solid oak shelves, blackened-steel verticals, anti-tip wall anchor included', 5, false,
 '/products/open-stack-bookshelf.webp'),

('long-light-floor-lamp',
 'Long Light Floor Lamp',
 'Lights the corner of the room your overhead light forgot. The arc reaches 64 inches, so it sits behind the sofa and illuminates the page, not the ceiling.',
 'living', 389.00, '18" W x 64" arc reach x 72" H', 'Brushed-brass arc, oak base, dimmable LED (E26)', 4, false,
 '/products/long-light-floor-lamp.webp'),

-- BEDROOM (2)
('low-frame-bed-queen',
 'Low Frame Bed (Queen)',
 'The frame sits 12 inches off the floor — low enough to feel grounded, high enough to vacuum under. Joinery is intentionally visible. We don''t sell mattresses; we''ll point you to three good ones if you ask.',
 'bedroom', 1299.00, '65" W x 84" L x 12" H', 'Solid white oak slats, japanese-style joinery, no metal hardware visible', 8, true,
 '/products/low-frame-bed-queen.webp'),

('two-drawer-bedside',
 'Two Drawer Bedside',
 'Holds a lamp, a book, a glass of water, and the things you don''t want to think about during the day. Drawers slide quietly enough to open at 3am.',
 'bedroom', 429.00, '18" W x 16" D x 24" H', 'Solid walnut, soft-close drawers, brass-pull hardware', 5, false,
 '/products/two-drawer-bedside.webp'),

-- DINING (2)
('long-table-6-seat',
 'Long Table (6-Seat)',
 '84 inches gives six people elbow room and eight people friendship. Trestle base means there''s no center leg to kick. The beeswax finish forgives water rings — rub it back in once a year.',
 'dining', 1449.00, '84" L x 36" D x 30" H', 'Solid white-oak top, blackened-steel trestle base, beeswax finish', 9, true,
 '/products/long-table-6-seat.webp'),

('spindle-chair',
 'Spindle Chair',
 'Designed for a long dinner, not a quick one. The spindles hit your back where it actually needs support. Sold individually — buy four to start, add two later when you make new friends.',
 'dining', 329.00, '18" W x 20" D x 34" H (seat 18")', 'Kiln-dried ash spindles, hand-shaped seat, natural oil finish', 6, false,
 '/products/spindle-chair.webp'),

-- WORKSPACE (2)
('considered-desk',
 'Considered Desk',
 'No drawers — they collect things you''ll never look at again. One cable grommet, one trough underneath. The desk you''ll keep when you change jobs three times.',
 'workspace', 899.00, '60" W x 28" D x 30" H', 'Solid white-oak top, blackened-steel frame, integrated cable trough', 6, false,
 '/products/considered-desk.webp'),

('steady-chair',
 'Steady Chair',
 'Built for eight-hour days but doesn''t look like an office chair. Lumbar support is engineered, not advertised. We won''t tell you it''s ergonomic — try it for sixty days, send it back if your back disagrees.',
 'workspace', 549.00, '25" W x 25" D x 38-42" H (gas-lift)', 'Walnut-veneer back, oat boucle seat, polished aluminum 5-star base, BIFMA-tested', 5, false,
 '/products/steady-chair.webp');

-- =============================================================
-- 5 FAQ documents (Linden voice — embeddings populated separately via Gemini)
-- =============================================================

insert into documents (title, content, metadata) values

('Lead Times & Shipping',
 'Every Linden piece is made to order. Lead times vary by piece — typically 4 to 9 weeks from order confirmation. We will email you when production starts and again when it ships. Shipping within the continental US is free on orders over $500. White-glove delivery (in-room placement, packaging removal) is available for $200 on furniture-sized items. International shipping is not currently offered. We do not do rush orders — the lead time is the lead time, and it is honest.',
 '{"category": "shipping"}'::jsonb),

('Returns & Refunds',
 'You have 30 days from delivery to return any piece for any reason. We will arrange pickup at no cost to you within the continental US, refund your card within 7 days of receiving the piece back, and never ask why. The piece needs to be in the same condition you received it — minor signs of life are fine, structural damage is not. We do not do partial refunds or store credit nudges. The Refusal Surface starts before you buy, but it does not end there.',
 '{"category": "returns"}'::jsonb),

('Warranty',
 'Every Linden piece is warranted against manufacturing defects for 5 years. The warranty covers structural integrity (frames, joinery, hardware) and finish failures (peeling, cracking) under normal use. It does not cover surface scratches from your dog''s nails, water rings from the glass you forgot, or fading from the south-facing window we had told you about. If something fails on us, we replace or repair — your choice. Email us a photo and we will start the process within one business day.',
 '{"category": "warranty"}'::jsonb),

('Payment',
 'We accept all major credit cards, debit cards, and Apple Pay. Payment is processed at order confirmation, not at shipping — same as every other furniture company, but we are saying so plainly. Prices are in US dollars. Sales tax applies to states where we have nexus (currently NY, CA, TX, IL). We do not offer financing through a third party — if you need to spread the payment, that conversation belongs with your own bank, not with us. We do not run promotional pricing or discount codes.',
 '{"category": "payment"}'::jsonb),

('Why we will tell you not to buy',
 'Most furniture sites are optimized to make a sale on every visit. We are optimized to make a sale that does not come back to us in 30 days as a return. That means our AI agent is allowed to look at your room measurements and say: honestly, this will not fit — let us look at something else, or let us wait. Our 50-SKU cap means we know each piece well enough to make that call. The Refusal Surface is the load-bearing behavior of this brand — it is the difference between a furniture store and a friend who happens to know furniture.',
 '{"category": "philosophy"}'::jsonb);
