'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Images, FolderOpen, FileText } from 'lucide-react'

const TABS = [
  { label: 'Home',      href: '/studio',           icon: Home },
  { label: 'My Work',   href: '/studio/media',      icon: Images },
  { label: 'Galleries', href: '/studio/galleries',  icon: FolderOpen },
  { label: 'Estimates', href: '/studio/estimates',  icon: FileText },
]

export default function StudioNav() {
  const pathname = usePathname()
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(13,15,15,0.98)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex' }}>
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = href === '/studio'
            ? pathname === '/studio'
            : pathname?.startsWith(href) ?? false
          return (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px 0', textDecoration: 'none' }}>
              <div style={{ width: '44px', height: '28px', borderRadius: '14px', background: active ? 'rgba(91,191,191,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                <Icon size={18} color={active ? '#5BBFBF' : 'rgba(255,255,255,0.35)'} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: active ? '#5BBFBF' : 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
