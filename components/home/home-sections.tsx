"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useUI } from "@/components/providers";

export interface HomeSectionItem {
  id: string;
  label: string;
  description: string;
  defaultVisible: boolean;
  node: React.ReactNode;
}

interface Pref {
  id: string;
  visible: boolean;
  order: number;
}

const PREF_KEY = "ww_home_sections";

function defaultPrefs(items: HomeSectionItem[]): Pref[] {
  return items.map((item, index) => ({ id: item.id, visible: item.defaultVisible, order: index }));
}

export function HomeSections({ items }: { items: HomeSectionItem[] }) {
  const { locale } = useUI();
  const [prefs, setPrefs] = useState<Pref[]>(() => defaultPrefs(items));
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Pref[];
      const merged: Pref[] = items.map((item, index) => {
        const found = saved.find((s) => s.id === item.id);
        return {
          id: item.id,
          visible: found ? Boolean(found.visible) : item.defaultVisible,
          order: typeof found?.order === "number" ? found.order : index,
        };
      });
      setPrefs(merged);
    } catch {
      // ignore malformed preferences
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: Pref[]) {
    setPrefs(next);
    window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
  }

  function toggle(id: string) {
    persist(prefs.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }

  function move(id: string, dir: -1 | 1) {
    const ordered = [...prefs].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((p) => p.id === id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    const a = ordered[index];
    const b = ordered[target];
    const next = prefs.map((p) => {
      if (p.id === a.id) return { ...p, order: b.order };
      if (p.id === b.id) return { ...p, order: a.order };
      return p;
    });
    persist(next);
  }

  function reset() {
    window.localStorage.removeItem(PREF_KEY);
    setPrefs(defaultPrefs(items));
  }

  const ordered = useMemo(
    () => [...prefs].sort((a, b) => a.order - b.order).map((p) => ({ ...p, item: items.find((i) => i.id === p.id)! })).filter((p) => p.item),
    [prefs, items]
  );

  return (
    <>
      <div className="sticky top-[68px] z-30 flex justify-end border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] py-2 backdrop-blur lg:top-[76px]">
        <div className="container-museum flex w-full items-center justify-between gap-4">
          <p className="hidden text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:block">
            {locale === "zh" ? "馆藏首页 · 12 个常设区域" : "Museum home · 12 sections"}
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <SlidersHorizontal size={13} />
            {locale === "zh" ? "自定义首页" : "Customize home"}
          </button>
        </div>
      </div>

      {ordered.map((p) => (p.visible ? <div key={p.id}>{p.item.node}</div> : null))}

      {mounted && prefs.every((p) => !p.visible) && (
        <div className="container-museum py-20 text-center text-[13px] text-[var(--muted)]">
          所有区域都被隐藏。点击右上角「自定义首页」重新开启。
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="自定义首页">
          <div className="absolute inset-0 bg-[rgba(8,23,17,0.5)] backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[var(--line)] bg-[var(--paper)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label text-[var(--muted)]">Personalize</p>
                <h2 className="display mt-2 text-[28px]">自定义首页</h2>
                <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                  选择显示哪些区域、调整顺序。偏好保存在本机浏览器，不会上传服务器。
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)]"
                aria-label="关闭自定义面板"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="mt-7 space-y-2">
              {ordered.map((p, index) => (
                <li
                  key={p.id}
                  className="flex items-start gap-3 border border-[var(--line)] bg-[var(--surface)] p-3"
                >
                  <span className="mt-0.5 font-mono text-[10px] text-[var(--muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12.5px] ${p.visible ? "" : "text-[var(--muted)] line-through"}`}>
                      {p.item.label}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-[var(--muted)]">
                      {p.item.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => move(p.id, -1)}
                      disabled={index === 0}
                      className="flex h-7 w-7 items-center justify-center border border-[var(--line)] disabled:opacity-30"
                      aria-label={`上移 ${p.item.label}`}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => move(p.id, 1)}
                      disabled={index === ordered.length - 1}
                      className="flex h-7 w-7 items-center justify-center border border-[var(--line)] disabled:opacity-30"
                      aria-label={`下移 ${p.item.label}`}
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => toggle(p.id)}
                      className="flex h-7 w-7 items-center justify-center border border-[var(--line)]"
                      aria-label={p.visible ? `隐藏 ${p.item.label}` : `显示 ${p.item.label}`}
                    >
                      {p.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-[var(--muted)]" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4">
              <button onClick={reset} className="btn-ghost">
                <RotateCcw size={12} /> 恢复默认
              </button>
              <button onClick={() => setOpen(false)} className="btn-primary">
                完成
              </button>
            </div>
            <p className="mt-5 text-[10px] leading-relaxed text-[var(--muted)]">
              管理员可在后台「推荐区管理」设置站点默认顺序；用户本机的偏好优先。
            </p>
          </div>
        </div>
      )}
    </>
  );
}