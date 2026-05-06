-- 001_init.sql
-- Linden demo — initial schema (products + documents + RAG RPC + RLS)
-- Idempotent? No — this is the initial migration. Apply once on a fresh project.

-- Extensions
create extension if not exists vector;

-- =============================================================
-- PRODUCTS (Linden catalog — 12 SKUs, 50-SKU brand cap)
-- =============================================================
create table products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text not null,
  category        text not null check (category in (
    'living', 'bedroom', 'dining', 'workspace'
  )),
  price_usd       numeric(10,2) not null check (price_usd > 0),
  dimensions      text,
  material        text,
  lead_time_weeks int,
  in_stock        boolean default true not null,
  featured        boolean default false not null,
  image_url       text not null,
  -- "Final 4 — leaving the catalog this month" rotation flag (Linden does not run sales)
  rotating_out    boolean default false not null,
  created_at      timestamptz default now() not null
);

create index idx_products_category on products(category);
create index idx_products_featured on products(featured) where featured = true;
create index idx_products_in_stock on products(in_stock) where in_stock = true;
create index idx_products_rotating_out on products(rotating_out) where rotating_out = true;

-- =============================================================
-- DOCUMENTS (Linden FAQ for RAG — embeddings filled by scripts/generate-embeddings.ts)
-- =============================================================
create table documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  embedding   vector(768),                  -- gemini-embedding-001 truncated to 768 (Matryoshka)
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now() not null
);

create index documents_embedding_idx on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- =============================================================
-- RPC: semantic search over FAQ
-- Used by query_faq tool (lib/ai/tools/query-faq.ts)
-- =============================================================
create or replace function match_documents(
  query_embedding vector(768),
  match_count int default 3,
  similarity_threshold float default 0.7
)
returns table (
  id uuid,
  title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.title,
    d.content,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.embedding is not null
    and 1 - (d.embedding <=> query_embedding) > similarity_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- =============================================================
-- RLS: products + documents are publicly readable; writes are service-key only
-- =============================================================
alter table products enable row level security;
alter table documents enable row level security;

create policy "products_public_read" on products for select using (true);
create policy "documents_public_read" on documents for select using (true);
-- No insert/update/delete policies = default deny (only service key bypasses RLS)
