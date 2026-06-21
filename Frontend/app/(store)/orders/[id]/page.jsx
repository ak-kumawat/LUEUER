'use client'

import { useState, useEffect, use } from 'react'
import AuthWrapper from '../../../components/shared/AuthWrapper'
import Footer from '../../../components/store/Footer'
import { getOrderById, cancelOrder } from '../../../../lib/api'

const statusColors = {
  pending: '#a0a0a0',
  confirmed: '#b8960c',
  processing: '#b8960c',
  shipped: '#4a9eff',
  delivered: '#4ade80',
  cancelled: '#ef4444',
  returned: '#ef4444'
}

export default function OrderDetailPage({ params }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await getOrderById(id)
      setOrder(res.data?.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <AuthWrapper>
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </AuthWrapper>
    )
  }

  if (!order) return null

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return
    setCancelling(true)
    try {
      await cancelOrder(id)
      await fetchOrder()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '60px 24px' }}>
        <div className="container">
          <div style={{
            marginBottom: '64px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px'
          }}>
            <div>
              <p className="section-label" style={{ marginBottom: '16px' }}>
                Order Details
              </p>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 4vw, 56px)',
                fontWeight: 300,
                margin: 0,
                letterSpacing: '0.05em'
              }}>
                {order.orderNumber}
              </h1>
            </div>

            {order.status === 'pending' && !order.shiprocketOrderId && !order.awbCode && (
              <button
                className="btn-secondary"
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  fontSize: '11px',
                  padding: '12px 24px',
                  letterSpacing: '0.15em',
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>

          {order.status === 'cancelled' && order.paymentStatus === 'refund_pending' && (
            <div style={{
              padding: '20px 24px',
              background: 'rgba(245,231,198,0.03)',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)',
              fontSize: '13px',
              lineHeight: '1.6',
              marginBottom: '40px',
              letterSpacing: '0.03em',
              borderRadius: '2px'
            }}>
              💰 <strong>Refund Notice:</strong> This order has been cancelled. Your refund is being processed and will be credited to your account within 24 hours.
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '80px',
            alignItems: 'start'
          }}>
            <div>
              <div style={{ marginBottom: '48px' }}>
                <p className="section-label" style={{ marginBottom: '24px' }}>
                  Status Timeline
                </p>
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '6px',
                    top: '8px',
                    bottom: '8px',
                    width: '1px',
                    background: 'var(--color-border)'
                  }} />
                  {order.statusHistory?.map((history, i) => (
                    <div key={history.id} style={{
                      position: 'relative',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-21px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: i === order.statusHistory.length - 1
                          ? 'white'
                          : 'var(--color-border)',
                        border: '1px solid var(--color-border-light)'
                      }} />
                      <p style={{
                        fontSize: '11px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: statusColors[history.status] || 'var(--color-text-secondary)',
                        marginBottom: '4px'
                      }}>
                        {history.status}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)'
                      }}>
                        {new Date(history.changedAt).toLocaleString('en-IN')}
                      </p>
                      {history.note && (
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          marginTop: '4px'
                        }}>
                          {history.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-label" style={{ marginBottom: '24px' }}>Items</p>
                {order.items?.map(item => {
                  const product = item.variant?.product
                  const image = product?.images?.[0]?.imageUrl
                  return (
                    <div key={item.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr',
                      gap: '20px',
                      padding: '20px 0',
                      borderBottom: '1px solid var(--color-border)'
                    }}>
                      <div style={{
                        aspectRatio: '1',
                        background: 'var(--color-bg-secondary)',
                        overflow: 'hidden'
                      }}>
                        {image && (
                          <img
                            src={image}
                            alt={product?.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div>
                        <p style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '16px',
                          marginBottom: '6px'
                        }}>
                          {product?.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '8px'
                        }}>
                          {item.variant?.size} · {item.variant?.color} · Qty {item.quantity}
                        </p>
                        <p style={{ fontSize: '13px' }}>
                          ₹{parseFloat(item.totalPrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div style={{
                padding: '32px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
                marginBottom: '24px'
              }}>
                <p className="section-label" style={{ marginBottom: '20px' }}>
                  Delivery Address
                </p>
                <p style={{
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '8px'
                }}>
                  {order.shippingAddress?.label}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text)',
                  lineHeight: '1.6'
                }}>
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
                <p className="section-label" style={{ marginBottom: '20px' }}>
                  Payment Summary
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Subtotal</p>
                  <p style={{ fontSize: '13px' }}>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Shipping</p>
                  <p style={{ fontSize: '13px' }}>
                    {parseFloat(order.shippingFee) === 0 ? 'Free' : `₹${parseFloat(order.shippingFee).toLocaleString('en-IN')}`}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Total</p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>
                    ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
