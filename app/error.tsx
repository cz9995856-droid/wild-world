"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <TriangleAlert size={28} className="text-[var(--clay)]" />
      <p className="label mt-5 text-[var(--muted)]">Runtime error</p>
      <h1 className="display mt-3 text-[36px] sm:text-[46px]">页面暂时无法加载</h1>
      <p className="mt-3 max-w-lg text-[12px] leading-relaxed text-[var(--muted)]">
        这不是伪造的空状态。错误详情已记录在服务端日志中；如果是外部接口失败，相关页面会显示具体的未连接原因。
      </p>
      {error.digest && <p className="mt-2 font-mono text-[10px] text-[var(--muted)]">digest: {error.digest}</p>}
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <button onClick={reset} className="btn-primary">
          <RotateCcw size={14} /> 重试
        </button>
        <Link href="/" className="btn-outline">返回首页</Link>
      </div>
    </div>
  );
}