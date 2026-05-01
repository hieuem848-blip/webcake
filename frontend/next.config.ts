import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http",  hostname: "localhost", port: "5001" },
      { protocol: "http",  hostname: "localhost", port: "3000" },
      { protocol: "http",  hostname: "localhost" },
    ],
  },
};

export default nextConfig;