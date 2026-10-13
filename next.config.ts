import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {hostname: 'lh3.googleusercontent.com', protocol:"https", port: "", pathname: '/**'},
      {hostname: 'jsmsnapcast.b-cdn.net', protocol:"https", port: "", pathname: '/**'},
      {protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**"},
    ]
  }
};

export default nextConfig;
