import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;