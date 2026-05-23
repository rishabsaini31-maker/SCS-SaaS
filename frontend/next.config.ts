import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination:
          process.env.API_SERVER_URL || "http://localhost:4000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
