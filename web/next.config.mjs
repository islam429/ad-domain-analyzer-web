/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
};

// Optional: enable Sentry by wrapping the config.
// import { withSentryConfig } from '@sentry/nextjs';
// export default withSentryConfig(nextConfig);

export default nextConfig;
