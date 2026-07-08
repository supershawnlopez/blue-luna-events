import type { MetadataRoute } from 'next'

const BASE_URL = 'https://bluelunaevents.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/', '/q/', '/booking-confirmed'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
