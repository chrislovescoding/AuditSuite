/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Use production API URL when deployed, localhost for development
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'https://auditsuite-api.vercel.app'
      : 'http://localhost:5000';
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig