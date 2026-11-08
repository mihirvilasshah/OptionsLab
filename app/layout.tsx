import type { Metadata, Viewport } from "next";
import type * as React from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { ThemeProvider, themeScript } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StoreHydrator } from "@/components/layout/store-hydrator";
import { TooltipProvider } from "@/components/ui/tooltip";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://options-lab.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Options Lab — Learn Options Trading Interactively",
    template: "%s · Options Lab",
  },
  description:
    "Master options trading one concept at a time. Interactive lessons, live payoff charts, Greeks visualisers, strategy labs, calculators and a paper-trading simulator. No jargon, no sign-up.",
  applicationName: "Options Lab",
  keywords: [
    "options trading",
    "learn options",
    "call option",
    "put option",
    "option greeks",
    "implied volatility",
    "options strategies",
    "black scholes calculator",
    "options simulator",
    "NIFTY options",
    "paper trading",
  ],
  authors: [{ name: "Options Lab" }],
  creator: "Options Lab",
  publisher: "Options Lab",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Options Lab",
    title: "Options Lab — Learn Options Trading Interactively",
    description:
      "Interactive options-trading university: visual lessons, payoff simulators, Greeks, strategy lab, calculators and paper trading. Learn risk before reward.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Options Lab — Learn Options Trading Interactively",
    description:
      "Learn options visually and interactively. Payoff charts, Greeks, strategy lab and a paper-trading simulator.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#050810" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Options Lab",
  url: siteUrl,
  description:
    "An interactive educational platform for learning options trading, risk management and strategy construction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            <StoreHydrator />
            <a
              href="#main-content"
              className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
