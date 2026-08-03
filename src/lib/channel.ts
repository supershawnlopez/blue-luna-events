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
  if (host.includes('facebook.com')) return 'Facebook'
  if (host.includes('google.')) return 'Google'
  if (host.includes('bluelunaevents.com')) return 'Direct'
  return 'Other'
}
