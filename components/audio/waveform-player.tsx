"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import type { AudioEntry } from "@/lib/types";

export function WaveformPlayer({ audio }: { audio: AudioEntry }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    const onMeta = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      setReady(true);
    };
    const onEnd = () => setPlaying(false);
    const onErr = () => setError(true);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onErr);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onErr);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  function draw(analyser: AnalyserNode) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buffer);
    analyser.getByteFrequencyData(freq);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, w, h);

    const barW = w / 64;
    for (let i = 0; i < 64; i += 1) {
      const v = freq[Math.floor((i / 64) * freq.length * 0.7)] / 255;
      const barH = Math.max(1, v * h * 0.72);
      ctx.fillStyle = `rgba(194,155,74,${0.18 + v * 0.5})`;
      ctx.fillRect(i * barW + 1, h - barH, Math.max(1, barW - 2), barH);
    }

    ctx.strokeStyle = "rgba(42,107,81,0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < buffer.length; i += 1) {
      const x = (i / (buffer.length - 1)) * w;
      const y = (buffer[i] / 255) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    rafRef.current = requestAnimationFrame(() => draw(analyser));
  }

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const source = ctx.createMediaElementSource(el);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
      await audioCtxRef.current.resume();
      await el.play();
      setPlaying(true);
      if (analyserRef.current) draw(analyserRef.current);
    } catch {
      setError(true);
    }
  }

  function seek(value: number) {
    if (audioRef.current) audioRef.current.currentTime = value;
  }

  function fmt(sec: number) {
    if (!Number.isFinite(sec)) return "0:00";
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  }

  return (
    <div className="border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--line)] p-4">
        <button
          onClick={toggle}
          disabled={error}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[#F5F1E7] transition-transform hover:scale-105 disabled:opacity-40"
          aria-label={playing ? "暂停录音" : "播放录音"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Headphones size={12} className="text-[var(--muted)]" />
            <p className="truncate text-[12.5px] font-medium">{audio.title}</p>
          </div>
          <p className="mt-1 truncate text-[10px] text-[var(--muted)]">
            {audio.recordist} · {audio.location} · {audio.sound_type} · {audio.license}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--muted)]">
          <span>{fmt(time)}</span>
          <span>/</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="relative px-4 pt-4">
        <canvas ref={canvasRef} className="h-24 w-full" aria-hidden="true" />
        <div className="flex items-center gap-2 pb-3">
          <Volume2 size={12} className="text-[var(--muted)]" />
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={time}
            step={0.1}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 w-full accent-[var(--forest)]"
            aria-label="录音进度"
          />
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            className="p-1 text-[var(--muted)] hover:text-[var(--ink)]"
            aria-label="回到开头"
          >
            <RotateCcw size={12} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--line)] py-3 text-[9.5px] text-[var(--muted)]">
          <span>来源：{audio.source_name}</span>
          <a href={audio.source_url} target="_blank" rel="noreferrer" className="link-underline">
            原始记录 ↗
          </a>
          <span>录制：{audio.recorded_at || "日期未公开"}</span>
          <span>获取：{audio.retrieved_at.slice(0, 10)}</span>
          <span>{audio.commercial_use ? "许可允许商业使用" : "仅限非商业使用"}</span>
        </div>
        {error && (
          <p className="pb-3 text-[10px] text-[var(--clay)]">
            音频加载失败。本站不提供替代的模拟声音，请前往来源页试听。
          </p>
        )}
        {!ready && !error && (
          <p className="pb-3 text-[10px] text-[var(--muted)]">正在加载录音元数据…</p>
        )}
      </div>
      <audio ref={audioRef} src={audio.url} preload="metadata" crossOrigin="anonymous" />
    </div>
  );
}