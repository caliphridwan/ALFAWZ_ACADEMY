"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Google Analytics. Only loads when NEXT_PUBLIC_GA_ID (G-XXXXXXXXXX) is set,
 * and stays off the admin and teacher areas so staff visits aren't counted.
 */
export function GoogleAnalytics({ id }: { id?: string }) {
  const pathname = usePathname() ?? "";
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/teacher")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
