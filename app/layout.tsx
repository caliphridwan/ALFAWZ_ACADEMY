import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/shared/site-chrome";
import { JsonLd } from "@/components/shared/json-ld";
import { prisma } from "@/lib/db/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Using Amiri via next/font/google would also work; kept as a placeholder
// local font slot in case the institution supplies a licensed Arabic font.
const arabicFallback = Inter({ subsets: ["latin"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
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
    images: ["/images/og-default.jpg"],
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
        <Providers>
          <SiteChrome logoUrl={settings?.logoUrl} whatsappNumber={settings?.whatsappNumber}>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
