'use client'

import { useState } from 'react'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return
    setLoading(true)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setSent(true)
    } catch { } finally { setLoading(false) }
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '80px 24px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ marginBottom: '80px' }}>
            <p className="section-label" style={{ marginBottom: '16px' }}>Get in Touch</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              Contact
            </h1>
            <div className="divider" />
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 300,
                marginBottom: '16px'
              }}>
                Message Sent.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                We will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p className="section-label" style={{ marginBottom: '10px' }}>Name</p>
                <input
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <p className="section-label" style={{ marginBottom: '10px' }}>Email</p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <p className="section-label" style={{ marginBottom: '10px' }}>Message</p>
                <textarea
                  placeholder="Your message..."
                  rows={6}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              <div style={{
                marginTop: '40px',
                paddingTop: '40px',
                borderTop: '1px solid var(--color-border)'
              }}>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '13px',
                  lineHeight: '1.8'
                }}>
                  For order issues, returns, or general queries — we typically respond within 24 hours.
                  <br /><br />
                  Instagram:{" "}
                  <a
                    href="https://instagram.com/lueuer"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-text)', textDecoration: 'underline' }}
                  >
                    @lueuer
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
