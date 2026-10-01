/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Server-side image optimization requires the `sharp` package's native
    // binary to build correctly for the host's exact OS/architecture. On
    // some hosts (Render included) that isn't reliable, and a failure there
    // makes every next/image <Image> silently break while plain <img> tags
    // and CSS background-images keep working fine — exactly the symptom
    // this was added to fix. Unoptimized means images are served as-is,
    // without resizing/format conversion, which is a fine tradeoff for a
    // site this size.
    unoptimized: true,
    remotePatterns: [
      // Cloudinary's standard delivery domain. If your account uses a
      // custom CNAME instead, add that hostname here too.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;
