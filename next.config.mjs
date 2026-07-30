/** @type {import('next').NextConfig} */
const nextConfig = {
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
