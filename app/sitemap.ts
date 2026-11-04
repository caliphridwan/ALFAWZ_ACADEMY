import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/sponsor`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/sponsors`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/teachers`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/events`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/testimonials`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/register`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const courses = await prisma.course.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Events have a listing page only (no /events/<slug> detail route), so just the list is indexed.
  return [...staticRoutes, ...courseRoutes];
}
