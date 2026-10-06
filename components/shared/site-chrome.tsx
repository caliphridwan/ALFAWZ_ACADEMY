"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar/navbar";
import { Logo } from "@/components/navbar/logo";
import { Footer } from "@/components/footer/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

// Auth pages (app/(auth)/*) get a clean, full-screen experience with
// nothing else competing for attention — no nav to click away through,
// no footer links, no WhatsApp bubble floating over the form.
const CHROME_HIDDEN_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function SiteChrome({
  children,
  logoUrl,
  whatsappNumber,
}: {
  children: React.ReactNode;
  logoUrl?: string | null;
  whatsappNumber?: string | null;
}) {
  const pathname = usePathname();
  const hideChrome = CHROME_HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (hideChrome) {
    return (
      <>
        <header
          className="sticky top-0 z-50 w-full bg-background border-b border-border"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="container flex h-16 items-center">
            <Logo logoUrl={logoUrl} />
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </>
  );
}
