import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/shared/site-chrome";
import { JsonLd } from "@/components/shared/json-ld";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import { iconUrl } from "@/lib/pwa-icons";
import { prisma } from "@/lib/db/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Using Amiri via next/font/google would also work; kept as a placeholder
// local font slot in case the institution supplies a licensed Arabic font.
const arabicFallback = Inter({ subsets: ["latin"], variable: "--font-arabic", display: "swap" });

// Pages read the database (settings, courses, teachers...). Rendering them
// per request instead of at build time means a slow or sleeping database can
// never make a deploy fail again.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  applicationName: "AlFawz Academy",
  appleWebApp: { capable: true, title: "AlFawz", statusBarStyle: "default" },
  icons: {
    icon: iconUrl(null, 192),
    apple: iconUrl(null, 180),
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "AlFawz Academy — Learn the Qur'an. Understand Your Deen.",
    template: "%s | AlFawz Academy",
  },
  description:
    "AlFawz Academy provides structured online Qur'an and Islamic education for children, youth and adults, wherever they are in the world.",
  openGraph: {
    type: "website",
    siteName: "AlFawz Academy",
    title: "AlFawz Academy — Online Islamic Education",
    description:
      "Structured online Qur'an and Islamic education for children, youth and adults, worldwide.",
    images: [
      {
        // 1200x630 crop of the homepage hero, served from Cloudinary.
        url: "https://res.cloudinary.com/tpkzrkj7/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/D4D4D98A-261B-4963-A4E0-5A5383F3DE7A.jpg",
        width: 1200,
        height: 630,
        alt: "AlFawz Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlFawz Academy",
    description:
      "Structured online Qur'an and Islamic education for children, youth and adults, worldwide.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read once at the layout level so every page can rely on it (WhatsApp
  // button, and eventually contact details in the footer) without each page
  // re-querying SiteSettings itself.
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <html lang="en" className={`${inter.variable} ${arabicFallback.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "AlFawz Academy",
            url: appUrl,
            description:
              "Online Islamic education platform offering structured Qur'an and Islamic studies courses.",
            ...(settings?.contactEmail ? { email: settings.contactEmail } : {}),
            ...(settings?.phoneNumber ? { telephone: settings.phoneNumber } : {}),
          }}
        />
        <ServiceWorkerRegister />
        <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA_ID?.trim()} />
        <Providers>
          <SiteChrome logoUrl={settings?.logoUrl} whatsappNumber={settings?.whatsappNumber}>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
