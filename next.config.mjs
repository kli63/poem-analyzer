/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/poem-analyzer',
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          fs: false,
          net: false,
          tls: false,
        }
      }
      return config
    },
  }
  
  export default nextConfig