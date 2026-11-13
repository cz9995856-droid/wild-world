import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { VideoBrowser } from "@/components/videos/video-browser";
import { getSiteSettings, getVideos } from "@/lib/repository";

export const metadata: Metadata = {
  title: "纪录片专区",
  description: "BBC Earth、PBS Nature、National Geographic、Smithsonian 等机构的官方观看入口，不转载完整影片。",
};

export default async function VideosPage() {
  const videos = getVideos();
  const settings = await getSiteSettings();
  const credits: Record<string, { author: string; license: string; source_url: string }> = {};
  settings.hero_images.forEach((url, index) => {
    const credit = settings.hero_credits[index];
    if (credit) credits[url] = { author: credit.author, license: credit.license, source_url: credit.source_url };
  });
  return (
    <>
      <PageHeader
        kicker="Films · 纪录片专区"
        title="授权边界内的自然影像"
        description="本馆仅整理制作机构、节目主题与官方观看地址。没有获得嵌入或转载授权的内容，不会以“已上线”的播放器伪装完整。"
        breadcrumbs={[{ label: "纪录片" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{videos.length} 个官方条目</span>
            <span className="chip">0 个内嵌片源</span>
            <span className="chip">仅外链</span>
          </div>
        }
      />
      <div className="container-museum pb-20 pt-8">
        <VideoBrowser videos={videos} credits={credits} />
      </div>
    </>
  );
}