-- WILD WORLD · Supabase / PostgreSQL 初始化迁移
-- 版本 0001_init。执行后请再执行 supabase/seed.sql。
-- 说明：本迁移使用 Supabase auth schema；纯 PostgreSQL 需先提供 auth.users / auth.jwt / auth.uid。

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$ begin create type conservation_status as enum ('LC','NT','VU','EN','CR','EW','EX','DD','NE'); exception when duplicate_object then null; end $$;
do $$ begin create type population_trend as enum ('decreasing','stable','increasing','unknown'); exception when duplicate_object then null; end $$;
do $$ begin create type review_status as enum ('verified','editorial','pending_review','sample'); exception when duplicate_object then null; end $$;
do $$ begin create type data_status as enum ('live','curated','pending','unconfigured'); exception when duplicate_object then null; end $$;
do $$ begin create type admin_role as enum ('admin','editor','viewer','public'); exception when duplicate_object then null; end $$;
do $$ begin create type news_category as enum ('new_species','conservation','research','environment','incident','zoo'); exception when duplicate_object then null; end $$;
do $$ begin create type media_kind as enum ('photo','video','audio','model'); exception when duplicate_object then null; end $$;

create table if not exists source_registry (
  id text primary key,
  name text not null,
  homepage text not null,
  purpose text not null,
  access_mode text not null check (access_mode in ('no_key','api_key','oauth','manual','permission')),
  configured boolean not null default false,
  live boolean not null default false,
  license_note text not null default '',
  env_vars text[] not null default '{}',
  adapter text,
  status_note text not null default '',
  commercial_restriction text not null default '',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  role admin_role not null default 'public',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists taxonomies (
  id uuid primary key default gen_random_uuid(),
  kingdom text not null,
  phylum text not null,
  class_name text not null,
  order_name text not null,
  family text not null,
  genus text not null,
  source_name text not null default 'GBIF Backbone Taxonomy',
  source_url text not null default 'https://www.gbif.org/',
  source_record_id text,
  license text not null default 'CC BY 4.0',
  retrieved_at timestamptz not null default now(),
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  unique (kingdom, phylum, class_name, order_name, family, genus)
);

create table if not exists species (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_cn text not null,
  name_en text not null,
  scientific_name text not null,
  aliases text[] not null default '{}',
  group_key text not null,
  group_label text not null,
  tagline text not null default '',
  summary text not null default '',
  appearance text not null default '',
  behavior text not null default '',
  diet text not null default '',
  diet_type text[] not null default '{}',
  habitat text not null default '',
  reproduction text not null default '',
  size_length_min_cm numeric,
  size_length_max_cm numeric,
  size_height_min_cm numeric,
  size_height_max_cm numeric,
  weight_min_kg numeric,
  weight_max_kg numeric,
  lifespan_min_years numeric,
  lifespan_max_years numeric,
  speed_kmh numeric,
  fun_facts text[] not null default '{}',
  palette jsonb not null default '{}',
  artwork text not null default 'bear',
  taxonomy_id uuid references taxonomies(id) on delete set null,
  conservation_status conservation_status not null default 'NE',
  conservation_trend population_trend not null default 'unknown',
  assessment_year int,
  population_note text not null default '',
  threats text[] not null default '{}',
  measures text[] not null default '{}',
  distribution_regions text[] not null default '{}',
  distribution_countries text[] not null default '{}',
  distribution_biomes text[] not null default '{}',
  distribution_note text not null default '',
  gbif_taxon_key bigint,
  inat_taxon_id bigint,
  featured boolean not null default false,
  data_status data_status not null default 'curated',
  review_status review_status not null default 'editorial',
  verified boolean not null default false,
  source_name text,
  source_url text,
  source_record_id text,
  license text,
  retrieved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists species_name_cn_trgm on species using gin (name_cn gin_trgm_ops);
create index if not exists species_name_en_trgm on species using gin (name_en gin_trgm_ops);
create index if not exists species_scientific_trgm on species using gin (scientific_name gin_trgm_ops);
create index if not exists species_group_idx on species (group_key);
create index if not exists species_status_idx on species (conservation_status);
create index if not exists species_featured_idx on species (featured) where featured = true;
create index if not exists species_gbif_idx on species (gbif_taxon_key);

create table if not exists species_facts (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  kind text not null,
  label text not null,
  value text not null,
  note text,
  source_name text,
  source_url text,
  source_record_id text,
  license text,
  retrieved_at timestamptz,
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);
create index if not exists species_facts_species_idx on species_facts (species_id, kind);

create table if not exists conservation_assessments (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  authority text not null default 'IUCN',
  status conservation_status not null,
  trend population_trend not null default 'unknown',
  assessment_year int not null,
  population_note text not null default '',
  threats text[] not null default '{}',
  measures text[] not null default '{}',
  source_name text not null default 'IUCN Red List',
  source_url text not null,
  source_record_id text,
  license text,
  retrieved_at timestamptz not null default now(),
  published_at timestamptz,
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);
create index if not exists conservation_species_idx on conservation_assessments (species_id, assessment_year desc);

create table if not exists media_assets (
  id text primary key,
  species_id uuid references species(id) on delete set null,
  kind media_kind not null default 'photo',
  title text not null,
  url text not null,
  thumbnail_url text,
  width int,
  height int,
  author text not null default '',
  source_name text not null,
  source_url text not null,
  source_record_id text not null,
  license text not null,
  license_url text,
  attribution text not null default '',
  commercial_use boolean not null default false,
  derivatives_allowed boolean not null default false,
  download_allowed boolean not null default false,
  location text,
  captured_at timestamptz,
  retrieved_at timestamptz not null default now(),
  verified boolean not null default false,
  review_status review_status not null default 'pending_review',
  category text,
  created_at timestamptz not null default now(),
  unique (source_name, source_record_id, kind)
);
create index if not exists media_species_idx on media_assets (species_id, kind);
create index if not exists media_license_idx on media_assets (commercial_use, download_allowed);

create table if not exists media_licenses (
  id uuid primary key default gen_random_uuid(),
  media_id text not null references media_assets(id) on delete cascade,
  license_code text not null,
  license_url text,
  attribution_required boolean not null default true,
  commercial_allowed boolean not null default false,
  derivatives_allowed boolean not null default false,
  redistribution_allowed boolean not null default false,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists media_licenses_media_idx on media_licenses (media_id);

create table if not exists audio_assets (
  id text primary key,
  species_id uuid references species(id) on delete set null,
  title text not null,
  url text not null,
  duration_seconds numeric,
  recordist text not null default '',
  source_name text not null,
  source_url text not null,
  source_record_id text not null,
  license text not null,
  license_url text,
  location text,
  recorded_at timestamptz,
  sound_type text,
  commercial_use boolean not null default false,
  retrieved_at timestamptz not null default now(),
  verified boolean not null default false,
  review_status review_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  unique (source_name, source_record_id)
);
create index if not exists audio_species_idx on audio_assets (species_id);

create table if not exists occurrence_records (
  id text primary key,
  species_id uuid references species(id) on delete cascade,
  source_name text not null,
  source_record_id text not null,
  decimal_latitude double precision not null,
  decimal_longitude double precision not null,
  country text,
  locality text,
  event_date date,
  basis_of_record text,
  recorded_by text,
  dataset_key text,
  dataset_title text,
  license text,
  source_url text not null,
  retrieved_at timestamptz not null default now(),
  verified boolean not null default false,
  review_status review_status not null default 'pending_review',
  unique (source_name, source_record_id)
);
create index if not exists occurrence_species_idx on occurrence_records (species_id);
create index if not exists occurrence_geo_idx on occurrence_records (decimal_latitude, decimal_longitude);

create table if not exists news_articles (
  id text primary key,
  slug text not null unique,
  title_original text not null,
  title_cn text,
  excerpt_original text not null default '',
  summary_cn text,
  summary_status text not null default 'pending_ai' check (summary_status in ('pending_ai','generated','manual')),
  keywords text[] not null default '{}',
  category news_category not null default 'research',
  source_name text not null,
  source_id text not null default 'manual',
  source_url text not null,
  original_url text not null,
  image_url text,
  language text not null default 'en',
  published_at timestamptz not null,
  retrieved_at timestamptz not null default now(),
  license_note text not null default '',
  review_status review_status not null default 'pending_review',
  verified boolean not null default false,
  ai_generated boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists news_published_idx on news_articles (published_at desc);
create index if not exists news_category_idx on news_articles (category, published_at desc);
create index if not exists news_review_idx on news_articles (review_status);
create index if not exists news_title_trgm on news_articles using gin (title_original gin_trgm_ops);

create table if not exists videos (
  id text primary key,
  slug text not null unique,
  title_cn text not null,
  title_en text not null,
  description text not null default '',
  producer text not null,
  producer_url text,
  official_url text not null,
  duration text,
  year int,
  species_slugs text[] not null default '{}',
  cover_url text,
  embed_allowed boolean not null default false,
  license_note text not null default '',
  region text,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);

create table if not exists "3d_models" (
  id uuid primary key default gen_random_uuid(),
  species_id uuid references species(id) on delete cascade,
  title text not null,
  model_url text,
  preview_url text,
  source_name text not null,
  source_url text,
  source_record_id text,
  license text not null,
  author text,
  commercial_use boolean not null default false,
  is_procedural boolean not null default false,
  retrieved_at timestamptz,
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);

create table if not exists anatomy_parts (
  id uuid primary key default gen_random_uuid(),
  species_slug text not null,
  label text not null,
  layer text not null check (layer in ('surface','skeleton','muscle')),
  hotspot_x numeric,
  hotspot_y numeric,
  summary text not null default '',
  detail text not null default '',
  source_name text,
  source_url text,
  license text,
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);
create index if not exists anatomy_species_idx on anatomy_parts (species_slug, layer);

create table if not exists quiz_questions (
  id text primary key,
  question text not null,
  options text[] not null,
  answer_index int not null check (answer_index >= 0),
  explanation text not null,
  difficulty int not null check (difficulty between 1 and 3),
  category text not null,
  source_name text not null,
  source_url text not null,
  license text,
  retrieved_at timestamptz not null default now(),
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);

create table if not exists evolution_records (
  id text primary key,
  title text not null,
  range_label text not null,
  mya_start numeric not null,
  mya_end numeric not null,
  description text not null default '',
  highlights text[] not null default '{}',
  species_slugs text[] not null default '{}',
  node_kind text not null default 'era',
  source_name text not null,
  source_url text not null,
  license text,
  retrieved_at timestamptz not null default now(),
  verified boolean not null default false,
  review_status review_status not null default 'editorial',
  created_at timestamptz not null default now()
);

create table if not exists home_sections (
  id text primary key,
  label text not null,
  href text not null,
  description text not null default '',
  default_visible boolean not null default true,
  sort_order int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  status text not null check (status in ('success','partial','failed')),
  message text not null default '',
  items int not null default 0,
  actor text,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sync_logs_started_idx on sync_logs (started_at desc);

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  species_id uuid not null references species(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, species_id)
);
create index if not exists favorites_user_idx on favorites (user_id, created_at desc);

create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'zh' check (locale in ('zh','en')),
  theme text not null default 'light' check (theme in ('light','dark')),
  home_sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists species_updated_at on species;
create trigger species_updated_at before update on species for each row execute function set_updated_at();
drop trigger if exists news_updated_at on news_articles;
create trigger news_updated_at before update on news_articles for each row execute function set_updated_at();
drop trigger if exists source_updated_at on source_registry;
create trigger source_updated_at before update on source_registry for each row execute function set_updated_at();
drop trigger if exists sections_updated_at on home_sections;
create trigger sections_updated_at before update on home_sections for each row execute function set_updated_at();

alter table source_registry enable row level security;
alter table taxonomies enable row level security;
alter table species enable row level security;
alter table species_facts enable row level security;
alter table conservation_assessments enable row level security;
alter table media_assets enable row level security;
alter table media_licenses enable row level security;
alter table audio_assets enable row level security;
alter table occurrence_records enable row level security;
alter table news_articles enable row level security;
alter table videos enable row level security;
alter table "3d_models" enable row level security;
alter table anatomy_parts enable row level security;
alter table quiz_questions enable row level security;
alter table evolution_records enable row level security;
alter table home_sections enable row level security;
alter table site_settings enable row level security;
alter table sync_logs enable row level security;
alter table users enable row level security;
alter table favorites enable row level security;
alter table user_preferences enable row level security;

do $$
declare t text;
begin
  foreach t in array array['source_registry','taxonomies','species','species_facts','conservation_assessments','media_assets','media_licenses','audio_assets','occurrence_records','videos','anatomy_parts','quiz_questions','evolution_records','home_sections','site_settings']
  loop
    execute format('drop policy if exists "public read %1$s" on %1$s', t);
    execute format('create policy "public read %1$s" on %1$s for select using (true)', t);
  end loop;
end $$;

drop policy if exists "public read published news" on news_articles;
create policy "public read published news" on news_articles for select using (review_status in ('verified','editorial'));

drop policy if exists "public read 3d models" on "3d_models";
create policy "public read 3d models" on "3d_models" for select using (true);

drop policy if exists "user reads own profile" on users;
create policy "user reads own profile" on users for select using (auth.uid() = id);

drop policy if exists "user reads own favorites" on favorites;
create policy "user reads own favorites" on favorites for select using (auth.uid() = user_id);
drop policy if exists "user inserts own favorites" on favorites;
create policy "user inserts own favorites" on favorites for insert with check (auth.uid() = user_id);
drop policy if exists "user deletes own favorites" on favorites;
create policy "user deletes own favorites" on favorites for delete using (auth.uid() = user_id);

drop policy if exists "user reads own preferences" on user_preferences;
create policy "user reads own preferences" on user_preferences for select using (auth.uid() = user_id);
drop policy if exists "user upserts own preferences" on user_preferences;
create policy "user upserts own preferences" on user_preferences for insert with check (auth.uid() = user_id);
drop policy if exists "user updates own preferences" on user_preferences;
create policy "user updates own preferences" on user_preferences for update using (auth.uid() = user_id);

create or replace function is_admin() returns boolean language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

do $$
declare t text;
begin
  foreach t in array array['source_registry','taxonomies','species','species_facts','conservation_assessments','media_assets','media_licenses','audio_assets','occurrence_records','news_articles','videos','3d_models','anatomy_parts','quiz_questions','evolution_records','home_sections','site_settings','sync_logs']
  loop
    execute format('drop policy if exists "admin write %1$s" on %1$s', t);
    execute format('create policy "admin write %1$s" on %1$s for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

create or replace view species_public as
select s.id, s.slug, s.name_cn, s.name_en, s.scientific_name, s.group_key, s.group_label,
  s.conservation_status, s.conservation_trend, s.assessment_year, s.featured, s.review_status, s.updated_at,
  (select count(*) from media_assets m where m.species_id = s.id and m.kind = 'photo') as photo_count
from species s
where s.review_status in ('verified','editorial');

comment on table species is '馆藏物种档案；editorial 表示编辑整理，未逐条核验原始文献。';
comment on table news_articles is '新闻仅保存标题、摘要与链接，不保存外部全文与图片。';
comment on table media_assets is '媒体许可逐条记录；commercial_use=false 的素材不得用于商业用途。';
comment on table occurrence_records is '观测点，不代表完整自然分布范围。';