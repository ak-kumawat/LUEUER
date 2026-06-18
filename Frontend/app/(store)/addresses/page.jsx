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
      <div style={{ padding: '60px 24px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '64px'
          }}>
            <div>
              <p className="section-label" style={{ marginBottom: '16px' }}>Your</p>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                letterSpacing: '0.05em'
              }}>
                Addresses
              </h1>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
              style={{ padding: '12px 24px' }}
            >
              {showForm ? 'Cancel' : 'Add New'}
            </button>
          </div>

          {showForm && (
            <div style={{
              padding: '40px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              marginBottom: '32px'
            }}>
              <p className="section-label" style={{ marginBottom: '24px' }}>New Address</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { key: 'label', placeholder: 'Label (e.g. Home, Office)' },
                  { key: 'street', placeholder: 'Street address' },
                  { key: 'city', placeholder: 'City' },
                  { key: 'state', placeholder: 'State' },
                  { key: 'postalCode', placeholder: 'Postal code' }
                ].map(field => (
                  <input
                    key={field.key}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  />
                ))}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                    style={{ width: 'auto' }}
                  />
                  Set as default address
                </label>
                <button className="btn-primary" onClick={handleSubmit}>
                  Save Address
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          ) : addresses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                No addresses saved yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {addresses.map(addr => (
                <div key={addr.id} style={{
                  padding: '28px 32px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      {addr.label}
                      {addr.isDefault && (
                        <span style={{
                          fontSize: '9px',
                          padding: '2px 8px',
                          border: '1px solid var(--color-accent)',
                          color: 'var(--color-accent)'
                        }}>
                          Default
                        </span>
                      )}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6'
                    }}>
                      {addr.street}, {addr.city}, {addr.state} — {addr.postalCode}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        style={{
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          color: 'var(--color-text-secondary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      style={{
                        fontSize: '11px',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
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
