/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    },
  ],
  
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    // Ignore problematic TypeScript definition files during build
    config.resolve.alias = {
      ...config.resolve.alias,
      '../types/@algorandfoundation/algorand-typescript': false,
    };
    
    if (!isServer) {
      config.module.rules.push({
        test: /\.d\.ts$/,
        type: 'asset/source',
      });
    }
    return config;
  },
}

export default nextConfig
