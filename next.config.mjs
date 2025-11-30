/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Permitir importação de módulos node: no servidor
  serverExternalPackages: ['mongoose', 'mongodb'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignorar dependências opcionais do MongoDB
      config.externals.push({
        'kerberos': 'commonjs kerberos',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers',
        'snappy': 'commonjs snappy',
        'socks': 'commonjs socks',
        'aws4': 'commonjs aws4',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      });
    }

    // Resolver módulos node: corretamente
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'node:process': false,
      'node:buffer': false,
      'node:crypto': false,
      'node:stream': false,
      'node:util': false,
      'node:url': false,
      'node:os': false,
    };

    return config;
  },
};

export default nextConfig;
