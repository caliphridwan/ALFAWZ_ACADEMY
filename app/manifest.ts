import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { iconUrl, maskableIconUrl } from "@/lib/pwa-icons";

// Read per request so a logo changed in Admin → Settings is picked up.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" }, select: { logoUrl: true } })
    .catch(() => null);
  const logo = settings?.logoUrl;

  return {
    id: "/",
    name: "AlFawz Academy",
    short_name: "AlFawz",
    description:
      "Structured online Qur'an and Islamic education for children, youth and adults, worldwide.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    categories: ["education"],
    icons: [
      { src: iconUrl(logo, 192), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: iconUrl(logo, 512), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: maskableIconUrl(logo, 512), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My Classes", short_name: "Classes", url: "/dashboard" },
      { name: "Courses", short_name: "Courses", url: "/courses" },
    ],
  };
}
