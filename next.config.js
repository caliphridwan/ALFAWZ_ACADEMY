/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add your real image host(s) here, e.g.:
      // { protocol: "https", hostname: "your-bucket.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
