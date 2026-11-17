import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: process.env.CF_BUILD === "1",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "inaturalist-open-data.s3.amazonaws.com" },
      { protocol: "https", hostname: "api.gbif.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      { source: "/encyclopedia", destination: "/explore/encyclopedia", permanent: true },
      { source: "/encyclopedia/:slug", destination: "/explore/encyclopedia/:slug", permanent: true },
      { source: "/lab", destination: "/explore/lab", permanent: true },
      { source: "/map", destination: "/explore/map", permanent: true },
      { source: "/news", destination: "/explore/conservation", permanent: true },
      { source: "/news/:slug", destination: "/explore/conservation", permanent: true },
      { source: "/favorites", destination: "/explore/favorites", permanent: true },
      { source: "/conservation", destination: "/explore/conservation", permanent: true },
      { source: "/search", destination: "/explore/encyclopedia", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;