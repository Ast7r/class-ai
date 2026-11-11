/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configures the newer Turbopack compiler used by Next.js 16+
  turbopack: {
    rules: {
      canvas: { type: 'ecmascript' }
    }
  },
  // Keeps backward compatibility config in case it uses Webpack fallback
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
