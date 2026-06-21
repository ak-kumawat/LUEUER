'use client'

import { useState } from 'react'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import { submitContactForm } from '../../../lib/api'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields (Name, Email, Message)')
      return
    }
    setError('')
    setLoading(true)

    try {
      await submitContactForm(form)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthWrapper>
      <div style={{
        minHeight: '90vh',
        background: '#000',
        color: '#ffffff',
        fontFamily: 'var(--font-sans), sans-serif',
        padding: '80px 24px 120px 24px',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          maxWidth: '700px',
          margin: '0 auto 60px auto'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: '300',
            color: '#F5E7C6', // warm beige / coffee tone
            letterSpacing: '0.02em',
            margin: '0 0 16px 0',
            textTransform: 'none'
          }}>
            Get in Touch
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#F5E7C6',
            lineHeight: '1.6',
            fontWeight: '300',
            margin: '0 auto',
            maxWidth: '520px'
          }}>
            Have questions? We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px 80px',
          maxWidth: '1100px',
          margin: '0 auto',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Form */}
          <div style={{
            background: 'transparent',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#ffffff',
              marginBottom: '32px',
              fontFamily: 'var(--font-sans), sans-serif'
            }}>
              Send us a Message
            </h2>

            {sent ? (
              <div style={{
                padding: '40px 30px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px dashed rgba(179, 154, 130, 0.3)'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b39a82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3 style={{
                  fontFamily: 'var(--font-serif), serif',
                  fontSize: '24px',
                  fontWeight: '300',
                  color: '#F5E7C6',
                  margin: '0 0 12px 0'
                }}>
                  Message Sent
                </h3>
                <p style={{ color: '#F5E7C6', fontSize: '13px', margin: 0 }}>
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {error && (
                  <div style={{
                    color: '#ff6b6b',
                    fontSize: '13px',
                    background: 'rgba(255, 107, 107, 0.1)',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 107, 107, 0.2)'
                  }}>
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#c2b6a9',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#121212',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#c2b6a9',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#121212',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#c2b6a9',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#121212',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Message */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#c2b6a9',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Message</label>
                  <textarea
                    placeholder="Your message..."
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#121212',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      minHeight: '120px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#F5E7C6', // Premium ivory/cream color
                    color: '#1c1512',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(245, 231, 198, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e6d7b5'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5E7C6'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Contact Info & Follow Us */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px'
          }}>
            
            {/* Contact Info Group */}
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '32px',
                fontFamily: 'var(--font-sans), sans-serif'
              }}>
                Contact Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Phone Item */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#F5E7C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1512" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#c2b6a9' }}>+91 84410 20977</p>
                  </div>
                </div>

                {/* Email Item */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#F5E7C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1512" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#c2b6a9' }}>
                      <a href="mailto:lueuer.world@gmail.com" style={{ color: '#c2b6a9', textDecoration: 'none' }}>
                        lueuer.world@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Address Item */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#F5E7C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1512" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apna Hotel</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#c2b6a9', lineHeight: '1.5' }}>
                      Rameshwar Colony, Bikaner Bus Stand, Ringus, Sikar, Rajasthan, 332404
                    </p>
                  </div>
                </div>

                {/* Working Hours Item */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#F5E7C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1512" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Working Hours</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#c2b6a9' }}>Mon–Sat, 10AM–7PM</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Follow Us Group */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '20px',
                fontFamily: 'var(--font-sans), sans-serif'
              }}>
                Follow Us
              </h2>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                
                {/* Instagram */}
                <a
                  href="https://instagram.com/lueuer"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: '#F5E7C6',
                    color: '#1c1512',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6d7b5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F5E7C6'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  Instagram
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: '#F5E7C6',
                    color: '#1c1512',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6d7b5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F5E7C6'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
                  </svg>
                  YouTube
                </a>

                {/* Linkedin */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: '#F5E7C6',
                    color: '#1c1512',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6d7b5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F5E7C6'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  Linkedin
                </a>

              </div>
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
