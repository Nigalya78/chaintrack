/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow all local /public images to load without optimization restrictions
    unoptimized: true,
  },
};

export default nextConfig;
