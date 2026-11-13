import type { MetadataRoute } from "next";
import { getAllSpecies, getNews } from "@/lib/repository";
import { SITE } from "@/lib/site-config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [species, news] = await Promise.all([getAllSpecies(), getNews()]);
  const base = SITE.url.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/encyclopedia",
    "/explore",
    "/news",
    "/map",
    "/photography",
    "/videos",
    "/conservation",
    "/lab",
    "/ai",
    "/compare",
    "/rankings",
    "/timeline",
    "/sources",
    "/about",
    "/search",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" || path === "/news" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...species.map((s) => ({
      url: `${base}/encyclopedia/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...news.map((n) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: new Date(n.retrieved_at),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}