"use client";

import { useState } from "react";
import { Bone, Eye, Info, Layers } from "lucide-react";

type Layer = "surface" | "skeleton" | "muscle";
type Mode = "elephant" | "bird";

interface Part {
  id: string;
  label: string;
  x: number;
  y: number;
  summary: string;
  detail: string;
  layer: Layer;
}

const ELEPHANT_PARTS: Part[] = [
  {
    id: "trunk",
    label: "象鼻",
    x: 79,
    y: 56,
    summary: "约 4 万束肌肉，无骨骼",
    detail:
      "象鼻由大量肌肉束组成，没有骨骼，可完成吸水、抓握、吹沙、发声与社交触碰。鼻端有两个指状突起（非洲象），能精细夹取小物体。",
    layer: "surface",
  },
  {
    id: "tusk",
    label: "象牙",
    x: 85,
    y: 66,
    summary: "上颌门齿，终生生长",
    detail:
      "象牙是特化的上颌门齿，终生缓慢生长。象牙贸易是非洲象与亚洲象面临的主要威胁之一。象牙不是“獠牙”。",
    layer: "surface",
  },
  {
    id: "ear",
    label: "大耳",
    x: 63,
    y: 35,
    summary: "散热与社交信号",
    detail:
      "非洲象的大耳面积大、血管丰富，扇动可帮助散热。耳朵姿态也参与社交交流与威吓展示。",
    layer: "surface",
  },
  {
    id: "eye",
    label: "眼睛",
    x: 73,
    y: 40,
    summary: "视力较弱，依赖嗅觉与听觉",
    detail:
      "象的视力相对有限，但在弱光下仍可使用。它们更依赖灵敏的嗅觉、低频听觉与触觉来感知环境。",
    layer: "surface",
  },
  {
    id: "leg",
    label: "四肢",
    x: 45,
    y: 74,
    summary: "柱状支撑，足垫缓冲",
    detail:
      "四肢粗壮呈柱状，骨骼排列接近垂直，适合长时间承重行走。足部有弹性脂肪垫，可缓冲体重并降低行走噪声。",
    layer: "surface",
  },
  {
    id: "tail",
    label: "尾部",
    x: 17,
    y: 60,
    summary: "驱赶昆虫",
    detail: "尾部用于驱赶蚊蝇等昆虫，尾端有粗硬的毛束。",
    layer: "surface",
  },
  {
    id: "skin",
    label: "皮肤",
    x: 45,
    y: 48,
    summary: "厚但敏感，泥浴防晒",
    detail:
      "皮肤厚且褶皱多，可储存水分并帮助散热。大象常进行泥浴与沙浴，形成防晒与防虫的保护层。",
    layer: "surface",
  },
  {
    id: "skull",
    label: "颅骨与气腔",
    x: 69,
    y: 30,
    summary: "颅骨含大量气腔",
    detail:
      "象的颅骨体积大但重量相对轻，内部具有气腔结构。颅骨需要支撑象牙与强大的咀嚼肌，同时容纳大型脑。",
    layer: "skeleton",
  },
  {
    id: "ribs",
    label: "肋骨与胸腔",
    x: 45,
    y: 42,
    summary: "保护心肺与大型胸腔",
    detail:
      "肋骨构成宽大的胸腔。象的肺部与心脏体积大，支持长时间行走与低频发声所需的气流。",
    layer: "skeleton",
  },
  {
    id: "limbbone",
    label: "四肢骨骼",
    x: 45,
    y: 80,
    summary: "重而稳定的承重结构",
    detail:
      "四肢长骨粗壮，关节排列使体重沿骨柱传导。厚实的足垫与骨骼共同承担数吨体重。",
    layer: "skeleton",
  },
  {
    id: "masseter",
    label: "咀嚼肌",
    x: 73,
    y: 50,
    summary: "支持强力咀嚼",
    detail:
      "象的咀嚼肌发达，配合宽大的臼齿研磨植物纤维。臼齿会依次替换，生命周期内可更换数次。",
    layer: "muscle",
  },
  {
    id: "trunkmuscle",
    label: "鼻部肌群",
    x: 80,
    y: 54,
    summary: "复杂肌群协同",
    detail:
      "鼻部肌群呈复杂的纵向与环向排列，可完成伸展、卷曲、吸水和精确抓握。它是动物界最复杂的肌肉结构之一。",
    layer: "muscle",
  },
  {
    id: "legmuscle",
    label: "四肢肌群",
    x: 42,
    y: 72,
    summary: "支撑与推进",
    detail:
      "四肢肌群负责支撑体重与推进。大象不能奔跑，但可以快速行走，步态中常保留至少两足着地。",
    layer: "muscle",
  },
];

const BIRD_PARTS: Part[] = [
  {
    id: "wing",
    label: "翅膀",
    x: 45,
    y: 40,
    summary: "由羽毛构成升力面",
    detail:
      "鸟翼的飞羽排列形成升力面。初级飞羽负责推进，次级飞羽提供升力。羽毛的微观结构使其轻而坚韧。",
    layer: "surface",
  },
  {
    id: "beak",
    label: "喙",
    x: 82,
    y: 38,
    summary: "角质喙，无齿",
    detail:
      "现代鸟类没有牙齿，取食与处理食物依靠角质喙与肌胃。喙形与食性高度相关，但外形相似不一定代表亲缘关系近。",
    layer: "surface",
  },
  {
    id: "feather",
    label: "羽毛",
    x: 55,
    y: 58,
    summary: "保温、飞行与展示",
    detail:
      "羽毛由角蛋白构成，具有保温、防水、飞行与信号展示等功能。羽毛颜色来自色素与结构色。",
    layer: "surface",
  },
  {
    id: "keel",
    label: "龙骨突",
    x: 50,
    y: 66,
    summary: "飞行肌附着点",
    detail:
      "胸骨腹侧的龙骨突为胸肌提供大面积附着点。飞行能力强的鸟类龙骨突通常更发达；不会飞的鸟类可能退化。",
    layer: "skeleton",
  },
  {
    id: "hollow",
    label: "中空骨骼",
    x: 40,
    y: 52,
    summary: "轻量化骨架",
    detail:
      "许多鸟类骨骼具有气腔或中空结构，在保持强度的同时降低体重。这是飞行适应的一部分，但不是所有鸟类都同样程度地中空。",
    layer: "skeleton",
  },
  {
    id: "pec",
    label: "胸肌",
    x: 47,
    y: 62,
    summary: "驱动下扑",
    detail: "胸肌是飞行主要动力来源，附着于龙骨突，收缩时带动翅膀下扑。",
    layer: "muscle",
  },
];

export function AnatomyExplorer() {
  const [mode, setMode] = useState<Mode>("elephant");
  const [layer, setLayer] = useState<Layer>("surface");
  const [activeId, setActiveId] = useState("trunk");
  const parts = mode === "elephant" ? ELEPHANT_PARTS : BIRD_PARTS;
  const visible = parts.filter((p) => p.layer === layer);
  const active = parts.find((p) => p.id === activeId) ?? parts[0];

  function switchMode(next: Mode) {
    setMode(next);
    setLayer("surface");
    setActiveId(next === "elephant" ? "trunk" : "wing");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] p-3">
          <div className="flex gap-1">
            {(["elephant", "bird"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`border px-3 py-1.5 text-[11px] ${
                  mode === m ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]" : "border-[var(--line)]"
                }`}
              >
                {m === "elephant" ? "非洲象" : "鸟类"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
            <Layers size={12} /> 图层
          </div>
        </div>
        <div className="flex flex-wrap gap-1 border-b border-[var(--line)] px-3 py-2">
          {(["surface", "skeleton", "muscle"] as Layer[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLayer(l);
                const first = parts.find((p) => p.layer === l);
                if (first) setActiveId(first.id);
              }}
              className={`rounded-full px-3 py-1 text-[10px] ${
                layer === l ? "bg-[var(--surface-2)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {l === "surface" ? "外部形态" : l === "skeleton" ? "骨骼" : "肌肉"}
            </button>
          ))}
        </div>

        <div className="relative aspect-[4/3] bg-[#0F2E22]">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-label={mode === "elephant" ? "大象身体结构示意图" : "鸟类身体结构示意图"} role="img">
            <defs>
              <linearGradient id="anatomy-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#123526" />
                <stop offset="100%" stopColor="#081711" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#anatomy-bg)" />
            <g stroke="#A9BFA8" strokeOpacity="0.12" strokeWidth="0.2">
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
              ))}
            </g>

            {mode === "elephant" ? (
              <g>
                <ellipse cx="44" cy="48" rx="27" ry="20" fill="#8C8A80" fillOpacity="0.85" stroke="#EDE8DC" strokeWidth="0.5" />
                <circle cx="70" cy="38" r="12" fill="#8C8A80" stroke="#EDE8DC" strokeWidth="0.5" />
                <path d="M78 43c4 10 6 18 4 27-1 4-5 4-6 0-2-9-3-15-6-22Z" fill="#8C8A80" stroke="#EDE8DC" strokeWidth="0.5" />
                <path d="M62 33c-8-9-13-1-11 10 1 7 5 12 9 12Z" fill="#7E7C72" stroke="#EDE8DC" strokeWidth="0.4" />
                <path d="M79 50l2 13" stroke="#E9E2D3" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="75" cy="35" r="1.1" fill="#141C18" />
                <rect x="31" y="62" width="5" height="17" rx="2" fill="#7E7C72" />
                <rect x="43" y="63" width="5" height="17" rx="2" fill="#7E7C72" />
                <rect x="55" y="62" width="5" height="16" rx="2" fill="#7E7C72" />
                <path d="M19 44c-2 6-2 12 1 16" stroke="#8C8A80" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <g>
                <ellipse cx="43" cy="48" rx="20" ry="13" fill="#7C8994" stroke="#EDE8DC" strokeWidth="0.5" />
                <circle cx="64" cy="40" r="7.5" fill="#EDE8DC" stroke="#7C8994" strokeWidth="0.4" />
                <path d="M71 39l9 2-9 3Z" fill="#C29B4A" />
                <path d="M44 40c12-4 22 2 27 10-12 2-22 0-30-4Z" fill="#5D6B74" stroke="#EDE8DC" strokeWidth="0.4" />
                <path d="M25 44c-6-2-10 1-12 5 6 2 11 1 15-1Z" fill="#5D6B74" />
                <circle cx="66" cy="38" r="0.9" fill="#141C18" />
                <path d="M36 60l-1 10M40 60l1 10" stroke="#C29B4A" strokeWidth="0.9" />
              </g>
            )}

            {layer === "skeleton" && (
              <g stroke="#E9E2D3" strokeWidth="0.7" fill="none" opacity="0.9">
                {mode === "elephant" ? (
                  <>
                    <path d="M68 32c6 0 8 4 8 8s-4 7-8 6" />
                    <path d="M38 40c8-6 20-6 26 0M37 48c9-5 20-5 27 0M39 56c8-4 18-4 25 0" />
                    <path d="M34 62v15M47 62v15M56 62v15" strokeWidth="1.6" />
                    <path d="M66 44c4 6 4 12 2 18" strokeWidth="1.2" />
                  </>
                ) : (
                  <>
                    <path d="M42 60c6 5 14 6 20 1" strokeWidth="1.5" />
                    <path d="M36 52c6-5 16-5 22 0M38 44c6-4 14-4 19 0" />
                    <path d="M44 39c8-3 16 0 20 6" strokeWidth="1.1" />
                  </>
                )}
              </g>
            )}

            {layer === "muscle" && (
              <g stroke="#C29B4A" strokeWidth="0.6" fill="none" opacity="0.85">
                {mode === "elephant" ? (
                  <>
                    <path d="M36 40c8 4 18 4 26 0M36 50c9 4 19 4 27 0" />
                    <path d="M46 61v14M56 61v13M34 61v14" strokeWidth="1.4" />
                    <path d="M76 40c3 8 3 16 1 22" strokeWidth="1.2" />
                  </>
                ) : (
                  <>
                    <path d="M40 42c8 4 18 5 24 3M41 52c9 4 18 3 22 0" />
                    <path d="M43 36c6-3 13-2 17 2" />
                  </>
                )}
              </g>
            )}

            <g fill="#EDE8DC" fontFamily="monospace" fontSize="1.6" opacity="0.5">
              <text x="4" y="95">FIG. {mode === "elephant" ? "01" : "02"} · {layer.toUpperCase()}</text>
              <text x="78" y="95">WILD WORLD</text>
            </g>
          </svg>

          {visible.map((part, index) => {
            const isActive = part.id === activeId;
            return (
              <button
                key={part.id}
                onClick={() => setActiveId(part.id)}
                style={{ left: `${part.x}%`, top: `${part.y}%` }}
                className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[9px] transition-all ${
                  isActive
                    ? "border-[#C29B4A] bg-[#C29B4A] text-[#0B2118] shadow-lg"
                    : "border-[#EDE8DC]/50 bg-black/40 text-[#EDE8DC]/80 hover:border-[#EDE8DC]"
                }`}
                aria-label={`查看 ${part.label} 的结构说明`}
                aria-pressed={isActive}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="label text-[var(--muted)]">
            {layer === "surface" ? "Surface anatomy" : layer === "skeleton" ? "Skeletal system" : "Muscular system"}
          </p>
          <h3 className="display mt-2 text-[28px]">{active.label}</h3>
          <p className="mt-1 text-[12px] text-[var(--clay)]">{active.summary}</p>
          <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)]">{active.detail}</p>
        </div>

        <div className="mt-3 flex-1 border border-[var(--line)] bg-[var(--surface-2)] p-4">
          <p className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
            {layer === "skeleton" ? <Bone size={12} /> : <Eye size={12} />}
            本层热点
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`chip ${p.id === activeId ? "border-[var(--ink)] text-[var(--ink)]" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 border border-[var(--line)] p-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
          <Info size={12} className="mt-0.5 shrink-0 text-[var(--clay)]" />
          解剖示意图为馆方原创教学图，采用简化比例，不是医学或兽医学图谱。文字说明为编辑整理，参考 ADW 与博物馆公开资料。
        </div>
      </div>
    </div>
  );
}