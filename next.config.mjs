/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/home', destination: '/' },
      { source: '/calculator', destination: '/' },
      { source: '/calculators', destination: '/' },
      { source: '/Assessment', destination: '/' },
      { source: '/assessment', destination: '/' },
      { source: '/scoreDashboard', destination: '/' },
      { source: '/dashboard', destination: '/' },
    ];
  },
};

export default nextConfig;
