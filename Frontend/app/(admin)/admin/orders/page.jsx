'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminGetAllOrders } from '../../../../lib/api'

const statusColors = {
  pending: '#a0a0a0',
  confirmed: '#b8960c',
  processing: '#b8960c',
  shipped: '#4a9eff',
  delivered: '#4ade80',
  cancelled: '#ef4444',
  returned: '#ef4444'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminGetAllOrders()
        setOrders(res.data?.data?.orders || [])
      } catch { } finally { setLoading(false) }
    }
    fetch()
  }, [])

  const filtered = filter
    ? orders.filter(o => o.status === filter)
    : orders

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '48px' }}>
        <p className="section-label" style={{ marginBottom: '12px' }}>Manage</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 300 }}>
          Orders
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '6px 16px',
              border: '1px solid',
              borderColor: filter === s ? 'white' : 'var(--color-border)',
              background: filter === s ? 'white' : 'transparent',
              color: filter === s ? 'black' : 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filtered.map(order => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 140px 120px auto',
                gap: '24px',
                padding: '20px 24px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>
                {order.orderNumber}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {order.user?.email}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {new Date(order.placedAt).toLocaleDateString('en-IN')}
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>
                ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
              </p>
              <span style={{
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                border: '1px solid',
                borderColor: statusColors[order.status] || '#a0a0a0',
                color: statusColors[order.status] || '#a0a0a0',
                whiteSpace: 'nowrap'
              }}>
                {order.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
