'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import { getAddresses, createAddress, deleteAddress, setDefaultAddress } from '../../../lib/api'

export default function AddressesPage() {
  const { isSignedIn } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    label: '', street: '', city: '',
    state: '', postalCode: '', country: 'India', isDefault: false
  })

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    fetchAddresses()
  }, [isSignedIn])

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses()
      setAddresses(res.data?.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    try {
      await createAddress(form)
      setForm({ label: '', street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false })
      setShowForm(false)
      fetchAddresses()
    } catch { }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch { }
  }

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id)
      fetchAddresses()
    } catch { }
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '80px 24px', minHeight: '80vh', background: 'var(--color-bg)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          {/* Header row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '56px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px'
          }}>
            <div>
              <p className="section-label" style={{ marginBottom: '8px', color: 'var(--color-accent)' }}>Your Saved</p>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                letterSpacing: '0.05em',
                color: '#ffffff'
              }}>
                Addresses
              </h1>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setShowForm(!showForm)}
              style={{ padding: '10px 20px', fontSize: '11px' }}
            >
              {showForm ? 'Cancel' : 'Add New'}
            </button>
          </div>

          {/* New Address Form */}
          {showForm && (
            <div style={{
              padding: '40px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              marginBottom: '40px',
              borderRadius: '2px'
            }}>
              <p className="section-label" style={{ marginBottom: '24px', color: 'var(--color-accent)' }}>New Delivery Address</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { key: 'label', placeholder: 'Label (e.g. Home, Office)' },
                  { key: 'street', placeholder: 'Street Address' },
                  { key: 'city', placeholder: 'City' },
                  { key: 'state', placeholder: 'State' },
                  { key: 'postalCode', placeholder: 'Postal Code' }
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      className="admin-input"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: '2px',
                        padding: '14px 18px',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                ))}
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  marginTop: '4px',
                  width: 'fit-content'
                }}>
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                    style={{ width: 'auto', accentColor: 'var(--color-accent)' }}
                  />
                  Set as default address
                </label>
                
                <button 
                  className="btn-primary" 
                  onClick={handleSubmit}
                  style={{ marginTop: '8px', padding: '16px 32px' }}
                >
                  Save Address
                </button>
              </div>
            </div>
          )}

          {/* Addresses List */}
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                No addresses saved yet
              </p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                Add First Address
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {addresses.map(addr => (
                <div key={addr.id} style={{
                  padding: '32px',
                  background: 'var(--color-bg-secondary)',
                  border: addr.isDefault ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  borderRadius: '2px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.3s ease'
                }}>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{addr.label}</span>
                      {addr.isDefault && (
                        <span style={{
                          fontSize: '9px',
                          padding: '2px 8px',
                          border: '1px solid var(--color-accent)',
                          color: 'var(--color-accent)',
                          background: 'rgba(245,231,198,0.05)',
                          borderRadius: '2px',
                          fontWeight: 500
                        }}>
                          Default
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                      fontWeight: 300
                    }}>
                      {addr.street}, {addr.city}, {addr.state} — {addr.postalCode}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        style={{
                          fontSize: '11px',
                          letterSpacing: '0.05em',
                          color: 'var(--color-accent)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
