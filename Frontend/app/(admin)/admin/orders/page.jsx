'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminGetAllOrders } from '../../../../lib/api'

const statusColors = {
  pending: '#a0a0a0',
  confirmed: '#F5E7C6',
  processing: '#F5E7C6',
  shipped: '#81b29a',
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
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-subtitle">Track and fulfill customer orders and Shiprocket delivery status.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => {
          const isSelected = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="admin-btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '10px',
                backgroundColor: isSelected ? 'var(--admin-accent)' : 'transparent',
                color: isSelected ? '#000000' : 'var(--admin-text)',
                borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border-light)'
              }}
            >
              {s || 'All'}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p style={{ color: 'var(--admin-text-secondary)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="admin-card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '20px 24px',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none'
              }}
            >
              <div style={{ flex: '1 1 180px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--admin-accent)', fontWeight: 500, marginBottom: '4px' }}>
                  {order.orderNumber}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                  {order.user?.email}
                </p>
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                  {new Date(order.placedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500 }}>
                  ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                </p>
              </div>
              <div style={{ flex: '0 0 120px', display: 'flex', justifyContent: 'flex-end' }}>
                <span className="admin-badge" style={{
                  borderColor: statusColors[order.status] || '#a0a0a0',
                  color: order.status === 'confirmed' || order.status === 'processing' ? '#000000' : (statusColors[order.status] || '#a0a0a0'),
                  backgroundColor: order.status === 'confirmed' || order.status === 'processing' ? 'var(--admin-accent)' : 'transparent',
                  textAlign: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  display: 'block'
                }}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
