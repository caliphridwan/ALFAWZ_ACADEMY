import { z } from "zod";

/**
 * All server-side validation lives here (Section 57). These schemas are the
 * source of truth — the frontend may mirror them for UX, but the server
 * always re-validates. Never trust client-only checks (e.g. age-based
 * guardian requirements, Section 11).
 */

/**
 * Images are files you place in public/images/ and reference by path, e.g.
 * /images/courses/beginners.jpg. Restricting to local paths keeps the site
 * from loading arbitrary remote images (and avoids next/image host errors).
 * An empty string is allowed and means "no image".
 */
export const imagePathSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value === "") return true;

      // Allow local images from public/images
      if (value.startsWith("/images/")) {
        return /^\/images\/[A-Za-z0-9_\-./]+\.(jpe?g|png|webp|avif|gif|svg)$/i.test(
          value
        ) && !value.includes("..");
      }

      // Allow Cloudinary images
      try {
        const url = new URL(value);

        return (
          url.protocol === "https:" &&
          url.hostname === "res.cloudinary.com"
           );
      } catch {
        return false;
      }
    },
    "Use a valid local image path or a Cloudinary HTTPS URL"
  )
  .optional()
  .or(z.literal(""));

const MIN_STUDENT_AGE_REQUIRING_GUARDIAN = 18;

export const guardianSchema = z.object({
  name: z.string().min(2, "Guardian name is required"),
  email: z.string().email("Enter a valid guardian email"),
  phone: z.string().min(7, "Enter a valid guardian phone number"),
  relationship: z.string().min(2, "Relationship is required"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    dateOfBirth: z.coerce.date({ errorMap: () => ({ message: "Enter a valid date of birth" }) }),
    gender: z.enum(["MALE", "FEMALE", "UNSPECIFIED"]).default("UNSPECIFIED"),
    country: z.string().min(2, "Country is required"),
    phone: z.string().min(7, "Enter a valid phone number"),
    address: z.string().optional(),

    previousQuranKnowledge: z.string().optional(),
    currentLevel: z.string().optional(),
    desiredCourseSlug: z.string().optional(),
    preferredClassTime: z.string().optional(),
    preferredLearningFormat: z.enum(["ONE_ON_ONE", "GROUP", "SELF_PACED"]).optional(),

    email: z
      .string()
      .email("Enter a valid email address")
      .transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),

    guardian: guardianSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    const age = calculateAge(data.dateOfBirth);
    if (age < MIN_STUDENT_AGE_REQUIRING_GUARDIAN && !data.guardian) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian information is required for students under 18",
        path: ["guardian"],
      });
    }
  });

export function calculateAge(dob: Date): number {
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const courseSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only"),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  price: z.coerce.number().positive("Price must be greater than zero"),
  currency: z.string().default("NGN"),
  duration: z.string().min(1),
  schedule: z.string().optional(),
  level: z.string().min(1),
  ageGroup: z.string().min(1),
  category: z.string().optional(),
  instructorId: z.string().optional(),
  image: imagePathSchema,
  active: z.boolean().default(true),
  enrollmentOpen: z.boolean().default(true),
});

export const enrollmentInitSchema = z.object({
  courseId: z.string().min(1),
});

export const sponsorshipCreateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  country: z.string().min(2),
  numberOfStudents: z.coerce.number().int().min(1).max(1000),
  duration: z.string().min(1),
  message: z.string().max(1000).optional(),
  showPublicly: z.boolean().default(false),
  publicName: z.string().max(120).optional(),
});

export const paymentVerifySchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z
    .string()
    .email("Enter a valid email address")
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  currentPasswordForEmailChange: z.string().optional(),
  phone: z.string().min(7).optional(),
  country: z.string().min(2).optional(),
  address: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export const siteSettingsSchema = z.object({
  sponsorshipPrice: z.coerce.number().positive(),
  currency: z.string().min(1),
  currencySymbol: z.string().min(1),
  minSponsorStudents: z.coerce.number().int().min(1),
  maxSponsorStudents: z.coerce.number().int().min(1),
  whatsappNumber: z.string().optional(),
  contactEmail: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});
