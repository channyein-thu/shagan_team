import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened via this machine's LAN IP (it changes with
  // DHCP) instead of only localhost; without it dev assets are blocked, the
  // login form never hydrates, and sign-in silently does nothing.
  allowedDevOrigins: ["192.168.1.*"],
};

export default nextConfig;
