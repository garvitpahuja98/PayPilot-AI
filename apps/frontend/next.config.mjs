/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Automatically proxy /api calls to backend Express server during development
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
