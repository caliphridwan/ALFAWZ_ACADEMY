/**
 * Builds square PNG icons for the web-app manifest from the academy logo.
 * The logo lives on Cloudinary (Admin → Settings → Branding), so sizes are
 * produced by Cloudinary's URL transformations rather than stored files.
 */

// Same file the site header uses, in case no logo is set in Settings.
const DEFAULT_LOGO =
  "https://res.cloudinary.com/tpkzrkj7/image/upload/f_auto/q_auto/alfawz1.jpg";

const MARKER = "/image/upload/";

function transform(logoUrl: string | null | undefined, transformation: string): string {
  const url = logoUrl && logoUrl.includes("res.cloudinary.com") && logoUrl.includes(MARKER) ? logoUrl : DEFAULT_LOGO;
  const i = url.indexOf(MARKER) + MARKER.length;
  const head = url.slice(0, i);
  // Drop any transformation segments already in the URL (f_auto, q_auto, ...)
  // but keep the version (v123...) and the file path.
  const rest = url
    .slice(i)
    .split("/")
    .filter((seg, idx, all) => idx === all.length - 1 || /^v\d+$/.test(seg) || !/^[a-z]{1,3}_[^/]*$/i.test(seg))
    .join("/");
  return `${head}${transformation}/${rest.replace(/\.[a-z0-9]+$/i, "")}.png`;
}

/** Fills the whole square (the normal "any" icon). */
export const iconUrl = (logo: string | null | undefined, size: number) =>
  transform(logo, `c_fill,g_auto,w_${size},h_${size}`);

/**
 * Maskable icons are cropped to a circle/rounded square by the phone, so the
 * logo is shrunk to the safe centre (~70%) and padded with its own colour.
 */
export const maskableIconUrl = (logo: string | null | undefined, size: number) =>
  transform(logo, `c_pad,b_auto,w_${Math.round(size * 0.7)},h_${Math.round(size * 0.7)}/c_pad,b_auto,w_${size},h_${size}`);
