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
    ]
  },
}

export default nextConfig
