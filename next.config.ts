import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Prisma's generated client relies on native query-engine binaries that
  // Next.js's server bundler shouldn't try to trace/inline.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
