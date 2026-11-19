"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  code: string;
  nameCn: string;
  scientificName: string;
  groupLabel: string;
  oneLine: string;
  distribution: string;
  slogan: string;
  accent: string;
  imageUrl: string | null;
  className?: string;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function ShareCardButton(props: ShareCardProps) {
  const { code, nameCn, scientificName, groupLabel, oneLine, distribution, slogan, accent, imageUrl, className } = props;
  const [busy, setBusy] = useState(false);

  async function share() {
    if (busy) return;
    setBusy(true);
    try {
      const width = 1080;
      const height = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#f6f1e7";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, width, 22);

      const img = imageUrl ? await loadImage(imageUrl) : null;
      const imageTop = 60;
      if (img) {
        const boxH = 620;
        const scale = Math.max(width / img.width, boxH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(48, imageTop, width - 96, boxH);
        ctx.clip();
        ctx.drawImage(img, 48 + (width - 96 - drawW) / 2, imageTop + (boxH - drawH) / 2, drawW, drawH);
        ctx.restore();
        ctx.strokeStyle = "rgba(28,26,23,0.3)";
        ctx.strokeRect(48, imageTop, width - 96, boxH);
      }

      const textTop = imageTop + 620 + 56;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#6f675b";
      ctx.font = '500 26px "Noto Sans SC", "PingFang SC", sans-serif';
      ctx.fillText(`NO. ${code} · ${groupLabel}`, 52, textTop);

      ctx.fillStyle = "#1c1a17";
      ctx.font = '900 92px "Noto Sans SC", "PingFang SC", sans-serif';
      ctx.fillText(nameCn, 52, textTop + 42);

      ctx.fillStyle = "#6f675b";
      ctx.font = 'italic 32px Georgia, serif';
      ctx.fillText(scientificName, 52, textTop + 150);

      ctx.fillStyle = accent;
      ctx.fillRect(52, textTop + 206, 56, 6);

      ctx.fillStyle = "#1c1a17";
      ctx.font = '700 36px "Noto Sans SC", "PingFang SC", sans-serif';
      wrapText(ctx, oneLine, 52, textTop + 236, width - 104, 52, 3);

      ctx.fillStyle = "#45403a";
      ctx.font = '400 26px "Noto Sans SC", "PingFang SC", sans-serif';
      wrapText(ctx, distribution, 52, textTop + 400, width - 104, 40, 3);

      ctx.fillStyle = "#6f675b";
      ctx.font = '500 24px "Noto Sans SC", "PingFang SC", sans-serif';
      ctx.fillText(slogan, 52, height - 90);
      ctx.textAlign = "right";
      ctx.fillText("数据来源见 wild-world-museum.pages.dev", width - 52, height - 90);
      ctx.textAlign = "left";

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `wildchina-${code}-${nameCn}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      className={cn("hb-btn hb-btn-ghost text-[12px]", className)}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {busy ? "正在生成" : "存成分享卡"}
    </button>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const chars = Array.from(text);
  let line = "";
  let lineIndex = 0;
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      line = char;
      lineIndex += 1;
      if (lineIndex >= maxLines) return;
    } else {
      line = test;
    }
  }
  if (line && lineIndex < maxLines) ctx.fillText(line, x, y + lineIndex * lineHeight);
}