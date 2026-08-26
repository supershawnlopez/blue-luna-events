// Categorizes a raw document.referrer into a plain-English channel label.
// Shared by traffic analytics (/api/studio/analytics) and lead-source
// attribution (leads.referrer_channel) so both use the exact same buckets —
// two independent copies of this logic drifting apart would make the two
// numbers quietly disagree with each other.

export function channelFor(referrer: string | null | undefined): string {
  if (!referrer) return 'Direct'
  let host = ''
  try {
    host = new URL(referrer).hostname.replace(/^www\.|^l\.|^lm\./, '')
  } catch {
    return 'Other'
  }
  if (host.includes('instagram.com')) return 'Instagram'
  if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook'
  if (host.includes('google.')) return 'Google'
  if (host.includes('yelp.com')) return 'Yelp'
  if (host.includes('bing.com')) return 'Bing'
  if (host.includes('nextdoor.com')) return 'Nextdoor'
  if (host.includes('apple.com') || host.includes('maps.apple.com')) return 'Apple Maps'
  if (host.includes('bluelunaevents.com')) return 'Direct'
  return 'Other'
}

export function channelForSource(source: string | null | undefined): string | null {
  if (!source) return null
  const s = source.trim().toLowerCase()
  if (!s) return null
  if (s.includes('instagram') || s === 'ig') return 'Instagram'
  if (s.includes('facebook') || s === 'fb' || s.includes('meta')) return 'Facebook'
  if (s.includes('google')) return 'Google'
  if (s.includes('bing')) return 'Bing'
  if (s.includes('yelp')) return 'Yelp'
  if (s.includes('nextdoor')) return 'Nextdoor'
  if (s.includes('apple')) return 'Apple Maps'
  if (s.includes('referral') || s.includes('friend') || s.includes('family')) return 'Referral'
  if (s.includes('saw her work')) return 'Saw Her Work'
  if (s === 'other') return 'Other'
  if (s === 'direct' || s === 'unknown') return 'Direct'
  return source.trim()
}

export function channelForAttribution(utmSource: string | null | undefined, referrer: string | null | undefined): string {
  return channelForSource(utmSource) ?? channelFor(referrer)
}
