'use client'

import { useState, useEffect, use } from 'react'
import { getOrderById, adminUpdateOrderStatus } from '../../../../../lib/api'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']

export default function AdminOrderDetailPage({ params }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getOrderById(id)
        const o = res.data?.data
        setOrder(o)
        setNewStatus(o.status)
      } catch { } finally { setLoading(false) }
    }
    fetch()
  }, [id])

  const handleUpdateStatus = async () => {
    setUpdating(true)
    try {
      await adminUpdateOrderStatus(id, { status: newStatus, note })
      const res = await getOrderById(id)
      setOrder(res.data?.data)
      setNote('')
    } catch { } finally { setUpdating(false) }
  }

  if (loading || !order) {
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '48px' }}>
        <p className="section-label" style={{ marginBottom: '12px' }}>Order Detail</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', fontWeight: 300 }}>
          {order.orderNumber}
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '48px',
        alignItems: 'start'
      }}>
        <div>
          <div style={{
            padding: '32px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
            marginBottom: '24px'
          }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Update Status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <input
                placeholder="Note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={handleUpdateStatus}
                disabled={updating}
                style={{ alignSelf: 'flex-start', padding: '12px 32px' }}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          <div style={{
            padding: '32px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Items</p>
            {order.items?.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '13px'
              }}>
                <div>
                  <p style={{ marginBottom: '4px' }}>{item.variant?.product?.name}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    {item.variant?.size} · {item.variant?.color} · Qty {item.quantity}
                  </p>
                </div>
                <p>₹{parseFloat(item.totalPrice).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '32px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Customer</p>
            <p style={{ fontSize: '13px', marginBottom: '8px' }}>{order.user?.email}</p>
          </div>

          <div style={{
            padding: '32px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Delivery Address</p>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
              {order.shippingAddress?.label}<br />
              {order.shippingAddress?.street},<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
              {order.shippingAddress?.postalCode}
            </p>
          </div>

          <div style={{
            padding: '32px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Status History</p>
            {order.statusHistory?.map((h, i) => (
              <div key={h.id} style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '12px'
              }}>
                <p style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '4px'
                }}>
                  {h.status}
                </p>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(h.changedAt).toLocaleString('en-IN')}
                </p>
                {h.note && (
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {h.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{
            padding: '32px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Payment</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Subtotal', value: `₹${parseFloat(order.subtotal).toLocaleString('en-IN')}` },
                { label: 'Shipping', value: parseFloat(order.shippingFee) === 0 ? 'Free' : `₹${parseFloat(order.shippingFee).toLocaleString('en-IN')}` },
                { label: 'Total', value: `₹${parseFloat(order.totalAmount).toLocaleString('en-IN')}` },
                { label: 'Payment Status', value: order.paymentStatus }
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>{item.label}</p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
