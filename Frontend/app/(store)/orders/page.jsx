'use client'

import { useState, useEffect } from 'react'
import { useAuth, RedirectToSignIn } from '@clerk/nextjs'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import { getUserOrders } from '../../../lib/api'
import Link from 'next/link'

const statusColors = {
  pending: '#a0a0a0',
  confirmed: '#b8960c',
  processing: '#b8960c',
  shipped: '#4a9eff',
  delivered: '#4ade80',
  cancelled: '#ef4444',
  returned: '#ef4444'
}

export default function OrdersPage() {
  const { isSignedIn } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) return
    const fetch = async () => {
      try {
        const res = await getUserOrders()
        setOrders(res.data?.data || [])
      } catch { } finally { setLoading(false) }
    }
    fetch()
  }, [isSignedIn])

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '60px 24px', minHeight: '80vh' }}>
        <div className="container">
          <div style={{ marginBottom: '64px' }}>
            <p className="section-label" style={{ marginBottom: '16px' }}>Your</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              Orders
            </h1>
          </div>

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 300,
                color: 'var(--color-text-secondary)',
                marginBottom: '32px'
              }}>
                No orders yet
              </p>
              <Link href="/shop" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '24px',
                    padding: '28px 32px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    alignItems: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <div>
                    <p className="section-label" style={{ marginBottom: '8px' }}>
                      Order
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18px',
                      letterSpacing: '0.05em'
                    }}>
                      {order.orderNumber}
                    </p>
                  </div>

                  <div>
                    <p className="section-label" style={{ marginBottom: '8px' }}>
                      Date
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {new Date(order.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="section-label" style={{ marginBottom: '8px' }}>
                      Total
                    </p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                      ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <span style={{
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '6px 16px',
                    border: '1px solid',
                    borderColor: statusColors[order.status] || '#a0a0a0',
                    color: statusColors[order.status] || '#a0a0a0'
                  }}>
                    {order.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
