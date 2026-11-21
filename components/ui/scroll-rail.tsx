"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollRail({
  children,
  className = "",
  itemWidth = 202,
}: {
  children: React.ReactNode;
  className?: string;
  itemWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function update() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scrollBy(direction: number) {
    ref.current?.scrollBy({ left: direction * itemWidth * 2, behavior: "smooth" });
    window.setTimeout(update, 320);
  }

  const drag = useRef<{ x: number; left: number } | null>(null);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || event.pointerType === "touch") return;
    drag.current = { x: event.clientX, left: el.scrollLeft };
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !drag.current) return;
    el.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
  }

  function onPointerUp() {
    drag.current = null;
    update();
  }

  return (
    <div className="group/rail relative">
      <div
        ref={ref}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 ${className}`}
        style={{ cursor: "grab" }}
      >
        {children}
      </div>
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="scroll-rail-btn left-[-14px]"
          aria-label="向左滚动"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="scroll-rail-btn right-[-14px]"
          aria-label="向右滚动"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}