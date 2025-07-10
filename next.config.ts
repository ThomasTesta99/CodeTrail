import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint:{
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {hostname: 'lh3.googleusercontent.com', protocol:"https", port: "", pathname: '/**'},
      {hostname: 'jsmsnapcast.b-cdn.net', protocol:"https", port: "", pathname: '/**'}
    ]
  }
};

export default nextConfig;
