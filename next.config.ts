import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/productivity-dashboard' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/productivity-dashboard' : '',
};

export default nextConfig;
