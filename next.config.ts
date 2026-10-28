import type {NextConfig} from 'next';

// Covers uploaded to R2 go through the image optimizer. Read at build time, so R2_PUBLIC_URL must be a build variable too.
const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {remotePatterns: r2PublicUrl ? [new URL(`${r2PublicUrl}/**`)] : []},
  partialPrefetching: true,
  // Admin, sign-in and draft previews never go in search results (also set as robots metadata on those pages)
  headers: async () => [
    {source: '/admin/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/admin', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/preview/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
  ],
  turbopack: {
    rules: {
      '*.css': {
        // Plain CSS modules must retain their module identity and scoped class exports.
        condition: {not: {path: '*.module.css'}},
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
