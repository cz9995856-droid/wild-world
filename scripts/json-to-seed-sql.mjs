import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const input = process.argv[2] || "/tmp/seed-data.json";
const output = process.argv[3] || path.join(ROOT, "supabase/seed.sql");
const data = JSON.parse(await readFile(input, "utf8"));

const q = (v) => {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const n = (v) => (typeof v === "number" && Number.isFinite(v) ? String(v) : "NULL");
const arr = (v) => (Array.isArray(v) && v.length ? `ARRAY[${v.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const json = (v) => `${q(JSON.stringify(v ?? {}))}::jsonb`;
const bool = (v) => (v ? "true" : "false");
const ts = (v) => {
  if (!v) return "NULL";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "NULL" : q(d.toISOString());
};
const sp = (slug) => `(select id from species where slug=${q(slug)})`;
const lines = [];

lines.push("-- WILD WORLD · Supabase 种子数据（自动生成）");
lines.push(`-- 生成时间：${new Date().toISOString()}`);
lines.push(`-- 内容：${data.species.length} 物种 / ${data.media.length} 影像 / ${data.sounds.length} 录音 / ${data.news.length} 新闻`);
lines.push("begin;");
lines.push("");

lines.push("-- source_registry");
for (const s of data.sources) {
  lines.push(
    `insert into source_registry (id,name,homepage,purpose,access_mode,configured,live,license_note,env_vars,adapter,status_note,commercial_restriction,last_checked_at) values (${q(s.id)},${q(s.name)},${q(s.homepage)},${q(s.purpose)},${q(s.access)},${bool(s.configured)},${bool(s.live)},${q(s.license_note)},${arr(s.env_vars)},${q(s.adapter)},${q(s.status_note)},${q(s.commercial_restriction)},${ts(s.last_checked_at)}) on conflict (id) do update set name=excluded.name,configured=excluded.configured,live=excluded.live,status_note=excluded.status_note,license_note=excluded.license_note;`
  );
}
lines.push("");

lines.push("-- taxonomies");
const taxa = new Map();
for (const s of data.species) {
  const t = s.taxonomy;
  taxa.set([t.kingdom, t.phylum, t.class, t.order, t.family, t.genus].join("|"), t);
}
for (const t of taxa.values()) {
  lines.push(
    `insert into taxonomies (kingdom,phylum,class_name,order_name,family,genus,source_name,source_url,license,review_status) values (${q(t.kingdom)},${q(t.phylum)},${q(t.class)},${q(t.order)},${q(t.family)},${q(t.genus)},'GBIF Backbone Taxonomy','https://www.gbif.org/','CC BY 4.0','editorial') on conflict (kingdom,phylum,class_name,order_name,family,genus) do nothing;`
  );
}
lines.push("");

lines.push("-- species");
for (const s of data.species) {
  const t = s.taxonomy;
  const c = s.conservation;
  lines.push(
    `insert into species (id,slug,name_cn,name_en,scientific_name,aliases,group_key,group_label,tagline,summary,appearance,behavior,diet,diet_type,habitat,reproduction,size_length_min_cm,size_length_max_cm,size_height_min_cm,size_height_max_cm,weight_min_kg,weight_max_kg,lifespan_min_years,lifespan_max_years,speed_kmh,fun_facts,palette,artwork,taxonomy_id,conservation_status,conservation_trend,assessment_year,population_note,threats,measures,distribution_regions,distribution_countries,distribution_biomes,distribution_note,gbif_taxon_key,featured,data_status,review_status,verified,source_name,source_url,license,retrieved_at,updated_at) values (` +
      `md5(${q(s.slug)})::uuid,${q(s.slug)},${q(s.name_cn)},${q(s.name_en)},${q(s.scientific_name)},${arr(s.aliases)},${q(s.group)},${q(s.group_label)},${q(s.tagline)},${q(s.summary)},${q(s.appearance)},${q(s.behavior)},${q(s.diet)},${arr(s.diet_type)},${q(s.habitat)},${q(s.reproduction)},${n(s.size?.length_cm?.[0])},${n(s.size?.length_cm?.[1])},${n(s.size?.height_cm?.[0])},${n(s.size?.height_cm?.[1])},${n(s.weight?.min_kg)},${n(s.weight?.max_kg)},${n(s.lifespan_years?.[0])},${n(s.lifespan_years?.[1])},${n(s.speed_kmh)},${arr(s.fun_facts)},${json(s.palette)},${q(s.artwork)},(select id from taxonomies where kingdom=${q(t.kingdom)} and phylum=${q(t.phylum)} and class_name=${q(t.class)} and order_name=${q(t.order)} and family=${q(t.family)} and genus=${q(t.genus)} limit 1),${q(c.status)}::conservation_status,${q(c.trend)}::population_trend,${n(c.assessment_year)},${q(c.population_note)},${arr(c.threats)},${arr(c.measures)},${arr(s.distribution.regions)},${arr(s.distribution.countries)},${arr(s.distribution.biomes)},${q(s.distribution.note)},${n(data.external?.[s.slug]?.gbif_key)},${bool(s.featured)},${q(s.data_status)}::data_status,${q(s.review_status)}::review_status,${bool(s.verified)},${q(s.sources?.[0]?.source_name)},${q(s.sources?.[0]?.source_url)},${q(s.sources?.[0]?.license)},${ts(s.sources?.[0]?.retrieved_at)},${ts(s.updated_at)}) on conflict (slug) do update set name_cn=excluded.name_cn,summary=excluded.summary,updated_at=now();`
  );
  for (const [i, fact] of (s.fun_facts || []).entries()) {
    lines.push(
      `insert into species_facts (species_id,kind,label,value,source_name,source_url,license,retrieved_at,verified,review_status) values (${sp(s.slug)},'fun_fact',${q(`趣闻 ${i + 1}`)},${q(fact)},${q(s.sources?.[0]?.source_name)},${q(s.sources?.[0]?.source_url)},${q(s.sources?.[0]?.license)},${ts(s.sources?.[0]?.retrieved_at)},false,'editorial');`
    );
  }
  lines.push(
    `insert into conservation_assessments (species_id,authority,status,trend,assessment_year,population_note,threats,measures,source_name,source_url,license,retrieved_at,verified,review_status) values (${sp(s.slug)},'IUCN',${q(c.status)}::conservation_status,${q(c.trend)}::population_trend,${n(c.assessment_year)},${q(c.population_note)},${arr(c.threats)},${arr(c.measures)},${q(c.source.source_name)},${q(c.source.source_url)},${q(c.source.license)},${ts(c.source.retrieved_at)},${bool(c.source.verified)},${q(c.source.review_status)}::review_status);`
  );
}
lines.push("");

lines.push("-- media_assets / media_licenses");
for (const m of data.media) {
  lines.push(
    `insert into media_assets (id,species_id,kind,title,url,width,height,author,source_name,source_url,source_record_id,license,license_url,attribution,commercial_use,derivatives_allowed,download_allowed,retrieved_at,verified,review_status,category) values (${q(m.id)},${sp(m.species_slug)},'photo',${q(`${m.species_slug} · 野外影像`)},${q(m.url)},${n(m.width)},${n(m.height)},${q(m.author)},${q(m.source_name)},${q(m.source_url)},${q(m.source_record_id)},${q(m.license)},${q(m.license_url)},${q(m.attribution)},${bool(m.commercial_use)},${bool(m.derivatives_allowed)},${bool(m.download_allowed)},${ts(m.retrieved_at)},${bool(m.verified)},${q(m.review_status)}::review_status,'photo') on conflict (id) do nothing;`
  );
  lines.push(
    `insert into media_licenses (media_id,license_code,license_url,attribution_required,commercial_allowed,derivatives_allowed,redistribution_allowed,verified_at) values (${q(m.id)},${q(m.license)},${q(m.license_url)},true,${bool(m.commercial_use)},${bool(m.derivatives_allowed)},${bool(m.download_allowed)},${ts(m.retrieved_at)}) on conflict do nothing;`
  );
}
lines.push("");

lines.push("-- audio_assets");
for (const a of data.sounds) {
  lines.push(
    `insert into audio_assets (id,species_id,title,url,recordist,source_name,source_url,source_record_id,license,license_url,location,recorded_at,sound_type,commercial_use,retrieved_at,verified,review_status) values (${q(a.id)},${sp(a.species_slug)},${q(a.title)},${q(a.url)},${q(a.recordist)},${q(a.source_name)},${q(a.source_url)},${q(a.source_record_id)},${q(a.license)},${q(a.license_url)},${q(a.location)},${ts(a.recorded_at)},${q(a.sound_type)},${bool(a.commercial_use)},${ts(a.retrieved_at)},${bool(a.verified)},${q(a.review_status)}::review_status) on conflict (id) do nothing;`
  );
}
lines.push("");

lines.push("-- news_articles");
for (const a of data.news) {
  lines.push(
    `insert into news_articles (id,slug,title_original,title_cn,excerpt_original,summary_cn,summary_status,keywords,category,source_name,source_id,source_url,original_url,image_url,language,published_at,retrieved_at,license_note,review_status,verified,ai_generated,featured) values (${q(a.id)},${q(a.slug)},${q(a.title_original)},${q(a.title_cn)},${q(a.excerpt_original)},${q(a.summary_cn)},${q(a.summary_status)},${arr(a.keywords)},${q(a.category)}::news_category,${q(a.source_name)},${q(a.source_id)},${q(a.source_url)},${q(a.original_url)},${q(a.image_url)},${q(a.language)},${ts(a.published_at)},${ts(a.retrieved_at)},${q(a.license_note)},${q(a.review_status)}::review_status,${bool(a.verified)},${bool(a.ai_generated)},${bool(a.featured)}) on conflict (id) do nothing;`
  );
}
lines.push("");

lines.push("-- videos");
for (const v of data.videos) {
  lines.push(
    `insert into videos (id,slug,title_cn,title_en,description,producer,producer_url,official_url,duration,year,species_slugs,cover_url,embed_allowed,license_note,region,review_status) values (${q(v.id)},${q(v.slug)},${q(v.title_cn)},${q(v.title_en)},${q(v.description)},${q(v.producer)},${q(v.producer_url)},${q(v.official_url)},${q(v.duration)},${n(v.year)},${arr(v.species_slugs)},${q(v.cover_url)},${bool(v.embed_allowed)},${q(v.license_note)},${q(v.region)},${q(v.review_status)}::review_status) on conflict (id) do nothing;`
  );
}
lines.push("");

lines.push("-- quiz_questions");
for (const x of data.quiz) {
  lines.push(
    `insert into quiz_questions (id,question,options,answer_index,explanation,difficulty,category,source_name,source_url,review_status) values (${q(x.id)},${q(x.question)},${arr(x.options)},${n(x.answer_index)},${q(x.explanation)},${n(x.difficulty)},${q(x.category)},${q(x.source_name)},${q(x.source_url)},'editorial') on conflict (id) do nothing;`
  );
}
lines.push("");

lines.push("-- evolution_records");
for (const e of data.timeline) {
  lines.push(
    `insert into evolution_records (id,title,range_label,mya_start,mya_end,description,highlights,species_slugs,node_kind,source_name,source_url,review_status) values (${q(e.id)},${q(e.title)},${q(e.range_label)},${n(e.mya_start)},${n(e.mya_end)},${q(e.description)},${arr(e.highlights)},${arr(e.species_slugs)},${q(e.node_kind)},${q(e.source_name)},${q(e.source_url)},'editorial') on conflict (id) do nothing;`
  );
}
lines.push("");

lines.push("-- home_sections");
for (const [i, s] of data.sections.entries()) {
  lines.push(
    `insert into home_sections (id,label,href,description,default_visible,sort_order) values (${q(s.id)},${q(s.label)},${q(s.href)},${q(s.description)},${bool(s.default_visible)},${n(i + 1)}) on conflict (id) do update set label=excluded.label,sort_order=excluded.sort_order,default_visible=excluded.default_visible;`
  );
}
lines.push("");

lines.push("-- procedural 3D models & anatomy notes");
lines.push(`insert into "3d_models" (species_id,title,source_name,license,author,is_procedural,verified,review_status) values (${sp("african-elephant")},'非洲草原象 · 程序化教学模型','WILD WORLD','CC0（馆方原创）','WILD WORLD',true,true,'editorial');`);
for (const [slug, label, layer, x, y, summary, detail] of [
  ["african-elephant", "象鼻", "surface", 79, 56, "约 4 万束肌肉，无骨骼", "象鼻由大量肌肉束组成，没有骨骼，可完成吸水、抓握、发声与社交触碰。"],
  ["african-elephant", "象牙", "surface", 85, 66, "上颌门齿，终生生长", "象牙是特化的上颌门齿，终生缓慢生长。"],
  ["african-elephant", "大耳", "surface", 63, 35, "散热与社交信号", "非洲象的大耳血管丰富，扇动可帮助散热。"],
  ["african-elephant", "四肢", "surface", 45, 74, "柱状支撑，足垫缓冲", "四肢粗壮呈柱状，适合长时间承重行走。"],
  ["african-elephant", "颅骨与气腔", "skeleton", 69, 30, "颅骨含大量气腔", "象的颅骨体积大但重量相对轻。"],
  ["african-elephant", "咀嚼肌", "muscle", 73, 50, "支持强力咀嚼", "咀嚼肌发达，配合宽大的臼齿研磨植物纤维。"],
]) {
  lines.push(`insert into anatomy_parts (species_slug,label,layer,hotspot_x,hotspot_y,summary,detail,source_name,source_url,verified,review_status) values (${q(slug)},${q(label)},${q(layer)},${n(x)},${n(y)},${q(summary)},${q(detail)},'WILD WORLD 原创示意','https://animaldiversity.org/',false,'editorial');`);
}
lines.push("");

lines.push(
  `insert into site_settings (key,value) values ('hero',${json({ video_url: "", poster: data.hero?.[0] ?? "/media/hero/hero-01.jpg", credit: "", images: data.hero ?? [] })}) on conflict (key) do update set value=excluded.value;`
);
lines.push(
  `insert into site_settings (key,value) values ('daily',${json({ species_slug: null, mode: "deterministic-date" })}) on conflict (key) do update set value=excluded.value;`
);

lines.push("commit;");
lines.push("");
lines.push("-- 数据说明：");
lines.push("-- 1) 物种资料为馆方编辑整理（editorial），未逐条核验原始文献。");
lines.push("-- 2) 媒体许可逐条来自 iNaturalist 元数据；NC 素材 commercial_use=false。");
lines.push("-- 3) 新闻仅保存标题、摘要、链接与日期，不保存外部全文与图片。");
lines.push("-- 4) 保护等级需在接入 IUCN API 后复核版本号与分类单元。");

await writeFile(output, lines.join("\n"), "utf8");
console.log(`wrote ${output}`);