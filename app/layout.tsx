import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchOverlay } from "@/components/search-overlay";
import { SITE } from "@/lib/site-config";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "WILD WORLD · 全球数字动物自然博物馆",
    template: "%s · WILD WORLD",
  },
  description: SITE.description,
  keywords: ["动物百科", "野生动物", "自然博物馆", "动物保护", "生物多样性", "WILD WORLD"],
  openGraph: {
    title: "WILD WORLD · 全球数字动物自然博物馆",
    description: SITE.description,
    type: "website",
    locale: "zh_CN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1E7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1510" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = cookieLocale === "en" ? "en" : "zh";

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers initialLocale={locale}>
          <SiteHeader initialLocale={locale} />
          <SearchOverlay />
          <main id="main">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}