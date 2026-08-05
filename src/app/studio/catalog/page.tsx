'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, Pencil, X, Check, Tag } from 'lucide-react'
import { CATALOG_UNITS } from '@/lib/config'

type CatalogItem = {
  id: string
  label: string
  description: string | null
  pricing_type: 'flat' | 'per_unit'
  price: number
  unit: string | null
  active: boolean
}

const EMPTY = { label: '', description: '', pricing_type: 'flat' as 'flat' | 'per_unit', price: '', unit: CATALOG_UNITS[0] as string }

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

export default function StudioCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch('/api/studio/catalog')
      .then(r => r.ok ? r.json() : [])
      .then(data => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY)
    setCreating(true)
    setEditingId(null)
  }

  function openEdit(item: CatalogItem) {
    setForm({
      label: item.label,
      description: item.description ?? '',
      pricing_type: item.pricing_type,
      price: String(item.price),
      unit: item.unit ?? CATALOG_UNITS[0],
    })
    setEditingId(item.id)
    setCreating(false)
  }

  function closeForm() {
    setCreating(false)
    setEditingId(null)
    setForm(EMPTY)
  }

  async function handleSave() {
    const price = parseFloat(form.price)
    if (!form.label.trim() || !price || price <= 0) return
    setSaving(true)
    const body = {
      label: form.label.trim(),
      description: form.description.trim() || null,
      pricing_type: form.pricing_type,
      price,
      unit: form.pricing_type === 'per_unit' ? form.unit : null,
    }
    if (editingId) {
      await fetch(`/api/studio/catalog/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/studio/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    closeForm()
    setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    setSaving(true)
    await fetch(`/api/studio/catalog/${id}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    setSaving(false)
    load()
  }

  const showForm = creating || !!editingId

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '60px' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/studio/estimates" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna</p>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0 }}>Price List</h1>
            </div>
          </div>
          {!showForm && (
            <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#5BBFBF', color: '#0D0F0F', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 24px 0' }}>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', lineHeight: 1.6 }}>
          Items you add here show up when you&apos;re building an estimate — pick one and it fills in the name, description, and price for you. Editing or removing something here never changes an estimate you already sent.
        </p>

        {showForm && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#5BBFBF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{editingId ? 'Edit Item' : 'New Item'}</p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Name</label>
              <input
                type="text" placeholder="e.g. Balloon Garland" value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Description (optional)</label>
              <input
                type="text" placeholder="What this includes" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Pricing</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setForm(f => ({ ...f, pricing_type: 'flat' }))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: form.pricing_type === 'flat' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: form.pricing_type === 'flat' ? 'rgba(91,191,191,0.1)' : 'transparent', color: form.pricing_type === 'flat' ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Flat Price</button>
                <button onClick={() => setForm(f => ({ ...f, pricing_type: 'per_unit' }))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: form.pricing_type === 'per_unit' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: form.pricing_type === 'per_unit' ? 'rgba(91,191,191,0.1)' : 'transparent', color: form.pricing_type === 'per_unit' ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Per Unit</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ flex: form.pricing_type === 'per_unit' ? 1 : undefined, width: form.pricing_type === 'flat' ? '100%' : undefined }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  {form.pricing_type === 'per_unit' ? 'Price per unit' : 'Price'}
                </label>
                <input
                  type="number" inputMode="decimal" placeholder="$" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              {form.pricing_type === 'per_unit' && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Unit</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  >
                    {CATALOG_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={closeForm} style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', cursor: 'pointer' }}>
                <X size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.label.trim() || !form.price} style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                <Check size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Save
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
          </div>
        ) : items.length === 0 && !showForm ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Tag size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>No items yet</p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.2)' }}>Add your first priced item to start building your price list</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
            {items.map((item, i) => (
              <div key={item.id} style={{ padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: 0 }}>{item.label}</p>
                    {item.description && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{item.description}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5BBFBF', margin: 0, whiteSpace: 'nowrap' }}>
                      {fmt(item.price)}{item.pricing_type === 'per_unit' ? `/${item.unit}` : ''}
                    </p>
                    <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {confirmDeleteId === item.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0, flex: 1 }}>Remove this from your price list?</p>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => handleDelete(item.id)} disabled={saving} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '6px 10px', borderRadius: '6px' }}>Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
