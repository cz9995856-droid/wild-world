import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./wildchina.css";
import { Providers } from "@/components/providers";
import { WC } from "@/lib/wildchina/site";

export const metadata: Metadata = {
  metadataBase: new URL(WC.url),
  title: {
    default: "WildChina · 中国特有脊椎动物探索",
    template: "%s · WildChina",
  },
  description: WC.description,
  keywords: ["中国特有动物", "野生动物", "自然科普", "物种图鉴", "生态保护", "WildChina"],
  openGraph: {
    title: "WildChina · 中国特有脊椎动物探索",
    description: WC.description,
    type: "website",
    locale: "zh_CN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3EDE1" },
    { media: "(prefers-color-scheme: dark)", color: "#0B2016" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://inaturalist-open-data.s3.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://inaturalist-open-data.s3.amazonaws.com" />
        <link rel="preconnect" href="https://api.gbif.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.gbif.org" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers initialLocale="zh">
          <main id="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}