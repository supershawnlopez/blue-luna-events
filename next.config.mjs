import { execSync } from 'node:child_process'

// Build number for Studio's stay-current check (Shawn, 2026-11-17 — same
// idea as Spa Mambo). Baked into the client bundle AND the /api/version
// response at build time; when a phone's bundle no longer matches the live
// server, Studio refreshes itself at the next natural break.
// Must be identical every time this file is evaluated (Next loads it more
// than once per build) — so a git hash, never a timestamp.
function gitSha() {
  try { return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return '' }
}
const BUILD_SHA = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || gitSha() || 'dev'
const BUILD_DATE = new Date().toISOString().slice(0, 10).replace(/-/g, '.')

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_SHA,
    NEXT_PUBLIC_BUILD_DATE: BUILD_DATE,
  },
  async headers() {
    return [
      // The service worker and manifest must never be served from a stale
      // cache, or a phone can be stuck on an old app shell.
      { source: '/studio-sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/studio-manifest.json', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ]
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage — fill in your project ref once env vars are set
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/get-a-quote',
        destination: '/event-questionnaire',
        permanent: true,
      },
      // SEO/AEO/GEO audit 2026-07-30: these 4 paths were indexed by Google from an
      // older version of the site and returning real 404s to real search traffic.
      // Redirected to their closest live equivalent instead of leaving them dead.
      {
        source: '/services',
        destination: '/#packages',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/#about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/#contact',
        permanent: true,
      },
      {
        source: '/event-form',
        destination: '/event-questionnaire',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
