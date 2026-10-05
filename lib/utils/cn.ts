import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN", symbol = "₦"): string {
  return `${symbol}${amount.toLocaleString("en-NG")}`;
}

/**
 * The HTML `download` attribute is ignored by browsers for cross-origin
 * links (which Cloudinary always is), so clicking a plain link just opens
 * the PDF/doc in a new tab instead of downloading it. Cloudinary supports a
 * `fl_attachment` flag that makes it send a real download response — this
 * inserts that flag automatically for Cloudinary URLs, and leaves any other
 * URL untouched as a safe fallback.
 */
export function toForceDownloadUrl(url: string): string {
  if (!url.includes("res.cloudinary.com") || url.includes("fl_attachment")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}
