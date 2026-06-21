import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/config'
import GalleryView from './GalleryView'

type Props = { params: { slug: string } }

async function fetchGallery(slug: string) {
  const db = serverClient()
  const { data: gallery } = await db
    .from('client_galleries')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!gallery) return null

  if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) return null

  const { data: assignments } = await db
    .from('gallery_assignments')
    .select('gallery_media(id, url, thumbnail_url, type, file_name)')
    .eq('gallery_id', gallery.id)
    .order('added_at', { ascending: true })

  const media = (assignments ?? [])
    .map((a: any) => a.gallery_media)
    .filter(Boolean)

  return { ...gallery, media }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gallery = await fetchGallery(params.slug)
  if (!gallery) return { title: 'Gallery Not Found' }

  const cover = gallery.media.find((m: any) => m.type === 'photo')
  const title = `${gallery.display_name} — ${SITE_CONFIG.name}`
  const description = `View the gallery from ${gallery.display_name}, styled by ${SITE_CONFIG.name} in ${SITE_CONFIG.location}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bluelunaevents.com/gallery/${params.slug}`,
      siteName: SITE_CONFIG.name,
      images: cover ? [{ url: cover.url, width: 1200, height: 630, alt: gallery.display_name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cover ? [cover.url] : [],
    },
  }
}

export default async function GalleryPage({ params }: Props) {
  const gallery = await fetchGallery(params.slug)
  if (!gallery) notFound()
  return <GalleryView gallery={gallery} />
}
