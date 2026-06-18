'use client'

import { useUser } from '@clerk/nextjs'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()

  return (
    <AuthWrapper>
      <div style={{ padding: '60px 24px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ marginBottom: '64px' }}>
            <p className="section-label" style={{ marginBottom: '16px' }}>Your</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              Profile
            </h1>
          </div>

          {isLoaded && user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { label: 'Full Name', value: `${user.firstName || ''} ${user.lastName || ''}`.trim() },
                { label: 'Email', value: user.emailAddresses?.[0]?.emailAddress },
                { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) }
              ].map(item => (
                <div key={item.label} style={{
                  padding: '24px 32px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <p className="section-label">{item.label}</p>
                  <p style={{ fontSize: '14px' }}>{item.value || '—'}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '48px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/orders" className="btn-secondary">My Orders</Link>
            <Link href="/addresses" className="btn-secondary">Addresses</Link>
            <Link href="/wishlist" className="btn-secondary">Wishlist</Link>
          </div>
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
