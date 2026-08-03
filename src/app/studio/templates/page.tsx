'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Send, Copy, Trash2, X, Check } from 'lucide-react'

type Template = { id: string; name: string; subject: string; body: string; updated_at: string }
type Contact = { id: string; name: string; email: string | null; unsubscribed: boolean }

const EMPTY = { name: '', subject: '', body: '' }

export default function StudioTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [sendTemplate, setSendTemplate] = useState<Template | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/studio/templates').then(r => r.ok ? r.json() : []),
      fetch('/api/studio/contacts').then(r => r.ok ? r.json() : []),
    ]).then(([t, c]) => {
      setTemplates(Array.isArray(t) ? t : [])
      setContacts(Array.isArray(c) ? c : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const emailable = useMemo(() => contacts.filter(c => c.email && !c.unsubscribed), [contacts])

  function openCreate() {
    setForm(EMPTY)
    setCreating(true)
  }

  function openEdit(t: Template) {
    setForm({ name: t.name, subject: t.subject, body: t.body })
    setEditing(t)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return
    setSaving(true)
    if (editing) {
      await fetch(`/api/studio/templates/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/studio/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDuplicate(t: Template) {
    await fetch('/api/studio/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${t.name} (Copy)`, subject: t.subject, body: t.body }),
    })
    load()
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null)
    setEditing(null)
    setTemplates(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/studio/templates/${id}`, { method: 'DELETE' })
  }

  function openSend(t: Template) {
    setSendTemplate(t)
    setSelectedContacts(new Set(emailable.map(c => c.id)))
  }

  function toggleContact(id: string) {
    setSelectedContacts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSend() {
    if (!sendTemplate || selectedContacts.size === 0) return
    setSending(true)
    const res = await fetch('/api/studio/campaigns/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: sendTemplate.id, contact_ids: Array.from(selectedContacts) }),
    })
    setSending(false)
    setSendTemplate(null)
    if (res.ok) {
      const data = await res.json()
      showToast(`Sent to ${data.sent}${data.failed ? `, ${data.failed} failed` : ''}${data.skipped ? `, ${data.skipped} skipped (unsubscribed/no email)` : ''}.`)
    } else {
      showToast('Something went wrong sending this campaign.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '60px' }}>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/studio/contacts" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna Studio</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0 }}>Email Templates</h1>
            </div>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '9px 14px', color: '#0D0F0F', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 20px 0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : templates.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '60px 0', fontSize: '0.88rem' }}>No templates yet — create one to start sending campaigns.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {templates.map(t => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                <button onClick={() => openEdit(t)} style={{ background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: '12px' }}>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>{t.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</p>
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openSend(t)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(91,191,191,0.12)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '10px', padding: '10px', color: '#5BBFBF', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    <Send size={13} /> Send Campaign
                  </button>
                  <button onClick={() => handleDuplicate(t)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                    <Copy size={13} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(t.id)} style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: '10px', padding: '10px 12px', color: '#EF4444', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit sheet */}
      {(creating || editing) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => { setCreating(false); setEditing(null) }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)', maxHeight: '88vh', overflowY: 'auto' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 20px' }}>{editing ? 'Edit Template' : 'New Template'}</p>

            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Template Name (just for you)</label>
            <input placeholder="Spring Promo 2027" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '14px' }} />

            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Subject Line</label>
            <input placeholder="Spring is here — book your event 🌸" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '14px' }} />

            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Message</label>
            <textarea
              placeholder={'Hi {{name}},\n\nSpring is one of our busiest seasons — if you\'re planning something, let\'s talk before dates fill up!'}
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              rows={6}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '8px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>Use <code>{'{{name}}'}</code> anywhere you want the client's first name.</p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setCreating(false); setEditing(null) }} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.subject.trim() || !form.body.trim()} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none', background: '#5BBFBF', color: '#0D0F0F', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', opacity: saving || !form.name.trim() || !form.subject.trim() || !form.body.trim() ? 0.5 : 1 }}>
                {saving ? 'Saving…' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send campaign sheet */}
      {sendTemplate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setSendTemplate(null)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>Send &ldquo;{sendTemplate.name}&rdquo;</p>
              <button onClick={() => setSendTemplate(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="rgba(255,255,255,0.5)" />
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
              {emailable.length} contact{emailable.length === 1 ? '' : 's'} can receive email (unsubscribed or missing-email contacts are hidden here).
            </p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {emailable.map(c => {
                const checked = selectedContacts.has(c.id)
                return (
                  <button key={c.id} onClick={() => toggleContact(c.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', background: checked ? 'rgba(91,191,191,0.08)' : 'rgba(255,255,255,0.03)', border: checked ? '1px solid rgba(91,191,191,0.3)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '11px 14px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, background: checked ? '#5BBFBF' : 'rgba(255,255,255,0.08)', border: checked ? 'none' : '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {checked && <Check size={12} color="#0D0F0F" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'white', margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{c.email}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <button onClick={handleSend} disabled={sending || selectedContacts.size === 0}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#5BBFBF', border: 'none', borderRadius: '12px', padding: '15px', color: '#0D0F0F', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: sending || selectedContacts.size === 0 ? 0.5 : 1 }}>
              <Send size={15} /> {sending ? 'Sending…' : `Send to ${selectedContacts.size}`}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setConfirmDeleteId(null)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '28px 24px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 24px' }}>Delete this template?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none', background: '#EF4444', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 80, maxWidth: '340px', width: 'calc(100% - 40px)' }}>
          <div style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5BBFBF', flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>{toast}</p>
          </div>
        </div>
      )}
    </div>
  )
}
