import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { FavoritesList } from "@/components/favorites-list";
import { getAllSpecies, getMediaAssets } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "我的收藏" };

export default async function FavoritesPage() {
  const [species, media] = await Promise.all([getAllSpecies(), getMediaAssets()]);
  const covers: Record<string, string> = {};
  for (const asset of media) {
    const sp = species.find((s) => s.id === asset.species_id);
    if (sp && !covers[sp.slug]) covers[sp.slug] = asset.url;
  }
  return (
    <>
      <PageHeader
        kicker="Collection · 我的收藏"
        title="你的私人馆藏抽屉"
        description="收藏保存在本机浏览器，不需要登录，也不会上传或用于推荐画像。清理浏览器数据会移除收藏。"
        breadcrumbs={[{ label: "我的收藏" }]}
      />
      <div className="container-museum pb-20">
        <FavoritesList species={species} covers={covers} />
      </div>
    </>
  );
}