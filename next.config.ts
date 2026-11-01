import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [/node_modules/, /\.next/],
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
