import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // `/?filter=client|personal` is served from a prerendered variant of the home page, so the Work filter works without
  // JavaScript while `/` stays static. beforeFiles, because `/` is itself a page and afterFiles would never match it.
  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/',
        has: [{type: 'query', key: 'filter', value: '(?<filter>client|personal)'}],
        destination: '/work-filter/:filter',
      },
    ],
    afterFiles: [],
    fallback: [],
  }),
  // Admin, sign-in and draft previews never go in search results (also set as robots metadata on those pages)
  headers: async () => [
    {source: '/admin/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/admin', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/preview/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
  ],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
