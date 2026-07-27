import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR WebSocket connections from local network IPs during development.
  // Next.js 16+ blocks cross-origin dev resources by default for safety.
  allowedDevOrigins: [
    "192.168.1.109",  // local network IP — update if your IP changes
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
