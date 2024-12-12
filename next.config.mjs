/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/poem-analyzer',
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  }
  
  export default nextConfig