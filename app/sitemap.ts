import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

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

  const [courses, events] = await Promise.all([
    prisma.course.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.event.findMany({ where: { published: true }, select: { slug: true, date: true } }),
  ]);

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: e.date,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...courseRoutes, ...eventRoutes];
}
