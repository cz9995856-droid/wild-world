import Link from "next/link";
import { Compass } from "lucide-react";
import { BrandMark } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <span className="text-[var(--forest)]"><BrandMark /></span>
      <p className="label mt-6 text-[var(--muted)]">404 · Not in the collection</p>
      <h1 className="display mt-3 max-w-[22ch] text-[38px] sm:text-[52px]">这件标本不在馆藏中</h1>
      <p className="mt-3 max-w-md text-[12px] leading-relaxed text-[var(--muted)]">
        页面可能已被移动，或该物种尚未收录。我们不会用占位内容伪造一个不存在的条目。
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-primary">
          <Compass size={14} /> 返回首页
        </Link>
        <Link href="/encyclopedia" className="btn-outline">浏览动物百科</Link>
        <Link href="/search" className="btn-outline">搜索馆藏</Link>
      </div>
    </div>
  );
}