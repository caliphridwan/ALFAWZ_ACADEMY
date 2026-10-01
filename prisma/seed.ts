/**
 * Development/demo seed data — Section 58 of the spec.
 * All accounts below are clearly-marked seed/demo accounts.
 * NEVER run this against a production database.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AlFawz Academy demo data...");

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      sponsorshipPrice: 30000,
      currency: "NGN",
      currencySymbol: "₦",
      minSponsorStudents: 1,
      maxSponsorStudents: 100,
      whatsappNumber: "+2340000000000", // placeholder — set real number in /admin/settings
      contactEmail: "info@alfawzacademy.example",
      studentsCount: 0, // real counts should come from live data, not this seed
      countriesCount: 0,
      classesDelivered: 0,
    },
  });

  const adminPasswordHash = await bcrypt.hash("DemoAdmin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.alfawz.local" },
    update: {},
    create: {
      name: "Demo Admin (SEED ACCOUNT)",
      email: "admin@demo.alfawz.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      country: "Nigeria",
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { id: "seed-teacher-1" },
    update: {},
    create: {
      id: "seed-teacher-1",
      name: "[Teacher name placeholder]",
      qualification: "[Add real qualification]",
      specialization: "Tajweed & Qur'an Memorisation",
      biography: "[Add real biography — do not invent credentials.]",
      active: true,
    },
  });

  const courseData = [
    { slug: "beginners-quran", title: "Beginners' Level", shortDescription: "Qur'an recitation, writing and memorisation for new students.", level: "Beginner", duration: "12 weeks", ageGroup: "All ages", price: 15000 },
    { slug: "tahfeezul-quran", title: "Tahfeezul Qur'an", shortDescription: "Complete Qur'an memorisation with proper Tajweed.", level: "All levels", duration: "Ongoing", ageGroup: "All ages", price: 25000 },
    { slug: "intermediate-tajweed", title: "Intermediate Level", shortDescription: "Qur'an and Tajweed for advancing students.", level: "Intermediate", duration: "16 weeks", ageGroup: "Teens & Adults", price: 18000 },
    { slug: "under-9-program", title: "Under-9 Program", shortDescription: "Age-appropriate Islamic education for young learners.", level: "Foundational", duration: "12 weeks", ageGroup: "Under 9", price: 12000 },
    { slug: "advanced-studies", title: "Advanced Level", shortDescription: "Qur'an, Hadith, Fiqh and Tafseer.", level: "Advanced", duration: "24 weeks", ageGroup: "Adults", price: 30000 },
    { slug: "diaspora-program", title: "Diaspora Program", shortDescription: "Online Islamic education for students worldwide.", level: "All levels", duration: "Flexible", ageGroup: "All ages", price: 35000 },
  ];

  for (const c of courseData) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        description: `${c.shortDescription} [Expand with full curriculum details.]`,
        level: c.level,
        duration: c.duration,
        ageGroup: c.ageGroup,
        price: c.price,
        currency: "NGN",
        instructorId: teacher.id,
        active: true,
      },
    });
  }

  const studentPasswordHash = await bcrypt.hash("DemoStudent123!", 12);
  await prisma.user.upsert({
    where: { email: "student@demo.alfawz.local" },
    update: {},
    create: {
      name: "Demo Student (SEED ACCOUNT)",
      email: "student@demo.alfawz.local",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      country: "Nigeria",
    },
  });

  const sponsorPasswordHash = await bcrypt.hash("DemoSponsor123!", 12);
  await prisma.user.upsert({
    where: { email: "sponsor@demo.alfawz.local" },
    update: {},
    create: {
      name: "Demo Sponsor (SEED ACCOUNT)",
      email: "sponsor@demo.alfawz.local",
      passwordHash: sponsorPasswordHash,
      role: Role.SPONSOR,
      country: "United Kingdom",
    },
  });

  console.log("Seed complete. Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
