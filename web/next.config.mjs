/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
};

// Optional: enable Sentry by wrapping the config.
// import { withSentryConfig } from '@sentry/nextjs';
// export default withSentryConfig(nextConfig);

export default nextConfig;
