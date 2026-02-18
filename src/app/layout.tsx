import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteName = "Rendivia";
const title = "Rendivia - Programmatic video generation for SaaS products";
const description =
  "Generate deterministic, branded videos from structured data using a simple API.";
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL ||
  "https://rendivia.com";
const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: origin,
    siteName,
    title,
    description,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.svg"],
  },
  alternates: { canonical: origin },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: siteName,
      url: origin,
      description,
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: origin,
      name: siteName,
      description,
      publisher: { "@id": `${origin}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased bg-white text-zinc-900`}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <a
            href="#main-content"
            className="sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:m-0 focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:whitespace-normal focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
          >
            Skip to main content
          </a>
          <Header />
          <div id="main-content">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
