'use client'

import { useState, useEffect, use } from 'react'
import { getOrderById, adminUpdateOrderStatus, createShipment, cancelShipment, adminMarkAsRefunded } from '../../../../../lib/api'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']

function ShiprocketSection({ order, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [shipmentData, setShipmentData] = useState(null)
  const [error, setError] = useState(null)

  const handleCreateShipment = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await createShipment(order.id)
      setShipmentData(res.data?.data)
      onUpdate()
    } catch (err) {
      setError(err.response?.data?.message || 'Shipment creation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this shipment?')) return
    setLoading(true)
    setError(null)

    try {
      await cancelShipment(order.id)
      setShipmentData(null)
      onUpdate()
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed')
    } finally {
      setLoading(false)
    }
  }

  const canShip = ['confirmed', 'processing', 'pending'].includes(order.status) && !order.awbCode
  const canCancel = order.status === 'shipped' || order.awbCode
  const hasDetails = order.awbCode || shipmentData?.awbCode

  return (
    <div className="admin-card" style={{ marginBottom: '24px' }}>
      <p className="admin-form-label" style={{ marginBottom: '20px' }}>
        Shiprocket Delivery
      </p>

      {error && (
        <p style={{
          color: '#ef4444',
          fontSize: '12px',
          marginBottom: '16px',
          padding: '10px 16px',
          border: '1px solid #ef4444',
          background: 'rgba(239,68,68,0.05)',
          borderRadius: '4px'
        }}>
          {error}
        </p>
      )}

      {hasDetails && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--admin-border)',
          borderRadius: '4px'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--admin-accent)', marginBottom: '12px', fontWeight: 600 }}>
            ✓ Shipment Active
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {[
              { label: 'AWB Code', value: order.awbCode || shipmentData?.awbCode },
              { label: 'Courier', value: order.courierName || shipmentData?.courierName },
              { label: 'Shiprocket ID', value: order.shiprocketOrderId || shipmentData?.shiprocketOrderId }
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <p style={{ color: 'var(--admin-text-secondary)' }}>
                  {item.label}
                </p>
                <p style={{ color: '#fff', fontWeight: 500 }}>
                  {item.value || '—'}
                </p>
              </div>
            ))}
          </div>

          {(order.awbCode || shipmentData?.awbCode) && (
            <button
              className="admin-btn-secondary"
              onClick={() => window.open(`https://shiprocket.co/tracking/${order.awbCode || shipmentData?.awbCode}`, '_blank')}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px 0',
                fontSize: '11px'
              }}
            >
              🔍 Track Package
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {canShip && (
          <button
            className="admin-btn-primary"
            onClick={handleCreateShipment}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Shipment...' : '🚚 Create Shipment in Shiprocket'}
          </button>
        )}

        {canCancel && (
          <button
            className="admin-btn-danger"
            onClick={handleCancel}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Cancelling...' : 'Cancel Shipment'}
          </button>
        )}

        {!canShip && !canCancel && !hasDetails && (
          <p style={{
            fontSize: '12px',
            color: 'var(--admin-text-muted)',
            textAlign: 'center'
          }}>
            {order.status === 'delivered'
              ? 'Order delivered successfully'
              : 'No actions available'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminOrderDetailPage({ params }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [refunding, setRefunding] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await getOrderById(id)
      const o = res.data?.data
      setOrder(o)
      setNewStatus(o.status)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async () => {
    setUpdating(true)
    try {
      await adminUpdateOrderStatus(id, { status: newStatus, note })
      await fetchOrder()
      setNote('')
    } catch { } finally { setUpdating(false) }
  }

  const handleMarkRefunded = async () => {
    if (!confirm('Mark this cancelled order as refunded? Ensure you have processed the refund manually in your Razorpay dashboard.')) return
    setRefunding(true)
    try {
      await adminMarkAsRefunded(id)
      await fetchOrder()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as refunded')
    } finally {
      setRefunding(false)
    }
  }

  if (loading || !order) {
    return (
      <div>
        <p style={{ color: 'var(--admin-text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="admin-page-title">{order.orderNumber}</h1>
        <p className="admin-page-subtitle">Detailed order logs, Shiprocket configurations, and fulfillment status.</p>
      </div>

      <div className="order-details-grid">
        <div>
          {/* Update Status Section */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <p className="admin-form-label" style={{ marginBottom: '20px' }}>Update Status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <select
                  className="admin-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <input
                  className="admin-input"
                  placeholder="Status update note (optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <button
                className="admin-btn-primary"
                onClick={handleUpdateStatus}
                disabled={updating}
                style={{ alignSelf: 'flex-start' }}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Shiprocket Section */}
          <ShiprocketSection order={order} onUpdate={fetchOrder} />

          {/* Items Section */}
          <div className="admin-card">
            <p className="admin-form-label" style={{ marginBottom: '20px' }}>Items</p>
            {order.items?.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: '1px solid var(--admin-border)',
                fontSize: '13px'
              }}>
                <div>
                  <p style={{ marginBottom: '4px', fontWeight: 500, color: '#fff' }}>{item.variant?.product?.name}</p>
                  <p style={{ color: 'var(--admin-text-secondary)', fontSize: '12px' }}>
                    Size {item.variant?.size} · {item.variant?.color} · Qty {item.quantity}
                  </p>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '15px' }}>₹{parseFloat(item.totalPrice).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-card">
            <p className="admin-form-label" style={{ marginBottom: '20px' }}>Customer</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{order.user?.email}</p>
          </div>

          <div className="admin-card">
            <p className="admin-form-label" style={{ marginBottom: '20px' }}>Delivery Address</p>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--admin-text-secondary)' }}>
              <span style={{ fontWeight: 600, color: '#fff', display: 'block', marginBottom: '8px' }}>{order.shippingAddress?.label}</span>
              {order.shippingAddress?.street},<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
              Postal Code: {order.shippingAddress?.postalCode}
            </p>
          </div>

          <div className="admin-card">
            <p className="admin-form-label" style={{ marginBottom: '20px' }}>Status History</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {order.statusHistory?.map((h, i) => (
                <div key={h.id} style={{
                  padding: '12px 0',
                  borderBottom: i === order.statusHistory.length - 1 ? 'none' : '1px solid var(--admin-border)',
                  fontSize: '12px'
                }}>
                  <p style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    color: h.status === 'confirmed' || h.status === 'processing' || h.status === 'delivered' ? 'var(--admin-accent)' : '#fff',
                    marginBottom: '4px'
                  }}>
                    {h.status}
                  </p>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '11px' }}>
                    {new Date(h.changedAt).toLocaleString('en-IN')}
                  </p>
                  {h.note && (
                    <p style={{ color: 'var(--admin-text-secondary)', marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                      "{h.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <p className="admin-form-label" style={{ marginBottom: '20px' }}>Payment</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Subtotal', value: `₹${parseFloat(order.subtotal).toLocaleString('en-IN')}` },
                { label: 'Shipping', value: parseFloat(order.shippingFee) === 0 ? 'Free' : `₹${parseFloat(order.shippingFee).toLocaleString('en-IN')}` },
                { label: 'Total', value: `₹${parseFloat(order.totalAmount).toLocaleString('en-IN')}`, isBold: true },
                { label: 'Payment Status', value: order.paymentStatus, isBadge: true }
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}>
                  <p style={{ color: 'var(--admin-text-secondary)' }}>{item.label}</p>
                  {item.isBadge ? (
                    <span className="admin-badge" style={{
                      borderColor: item.value === 'paid' ? 'var(--admin-accent)' : 
                                   item.value === 'refund_pending' ? '#f59e0b' : 
                                   item.value === 'refunded' ? '#10b981' : 
                                   'var(--admin-border-light)',
                      color: item.value === 'paid' ? '#000000' : 
                             item.value === 'refund_pending' ? '#f59e0b' : 
                             item.value === 'refunded' ? '#10b981' : 
                             'var(--admin-text-secondary)',
                      backgroundColor: item.value === 'paid' ? 'var(--admin-accent)' : 'transparent',
                      padding: '2px 8px',
                      fontSize: '10px'
                    }}>
                      {item.value}
                    </span>
                  ) : (
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: item.isBold ? '16px' : '14px',
                      fontWeight: item.isBold ? 600 : 400,
                      color: item.isBold ? 'var(--admin-accent)' : '#fff'
                    }}>{item.value}</p>
                  )}
                </div>
              ))}

              {order.status === 'cancelled' && order.paymentStatus === 'refund_pending' && (
                <button
                  className="admin-btn-primary"
                  onClick={handleMarkRefunded}
                  disabled={refunding}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px 0',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {refunding ? 'Processing...' : '💰 Mark as Refunded'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .order-details-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  )
}
