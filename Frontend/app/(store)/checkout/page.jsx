'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import AuthWrapper from '../../components/shared/AuthWrapper'
import { useCart } from '../../components/shared/CartContext'
import { getAddresses, createRazorpayOrder, placeOrder } from '../../../lib/api'

export default function CheckoutPage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { cartItems, total, clearCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    const fetch = async () => {
      try {
        const res = await getAddresses()
        const addrs = res.data?.data || []
        setAddresses(addrs)
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0]
        if (defaultAddr) setSelectedAddress(defaultAddr.id)
      } catch { }
    }
    fetch()
  }, [isSignedIn])

  const shippingFee = total > 999 ? 0 : 99
  const grandTotal = total + shippingFee

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    setLoading(true)

    try {
      const orderRes = await createRazorpayOrder({ amount: grandTotal })
      const razorpayOrder = orderRes.data?.data

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          amount: Math.round(grandTotal * 100),
          currency: 'INR',
          name: 'LUEUER',
          description: 'Built from Silence',
          order_id: razorpayOrder.id,
          theme: { color: '#ffffff' },
          handler: async (response) => {
            try {
              await placeOrder({
                shippingAddressId: selectedAddress,
                paymentMethod: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
              clearCart()
              router.push('/orders')
            } catch {
              alert('Order placement failed. Please contact support.')
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
      }
    } catch {
      setLoading(false)
      alert('Payment initialization failed. Please try again.')
    }
  }

  if (!isSignedIn) {
    return (
      <AuthWrapper>
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Please sign in to checkout
          </p>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '60px 24px' }}>
        <div className="container">
          <div style={{ marginBottom: '64px' }}>
            <p className="section-label" style={{ marginBottom: '16px' }}>Almost there</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              Checkout
            </h1>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '80px',
            alignItems: 'start'
          }}>
            <div>
              <div style={{ marginBottom: '48px' }}>
                <p className="section-label" style={{ marginBottom: '24px' }}>
                  Delivery Address
                </p>

                {addresses.length === 0 ? (
                  <div style={{
                    padding: '32px',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      marginBottom: '16px',
                      fontSize: '13px'
                    }}>
                      No addresses saved
                    </p>
                    <a href="/addresses" className="btn-secondary"
                      style={{ fontSize: '11px', padding: '8px 20px' }}>
                      Add Address
                    </a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        style={{
                          padding: '24px',
                          border: '1px solid',
                          borderColor: selectedAddress === addr.id
                            ? 'white'
                            : 'var(--color-border)',
                          cursor: 'pointer',
                          background: selectedAddress === addr.id
                            ? 'rgba(255,255,255,0.03)'
                            : 'transparent'
                        }}
                      >
                        <p style={{
                          fontSize: '12px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {addr.label}
                          {addr.isDefault && (
                            <span style={{ marginLeft: '8px', color: 'var(--color-accent)' }}>
                              Default
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text)' }}>
                          {addr.street}, {addr.city}, {addr.state} — {addr.postalCode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              position: 'sticky',
              top: '100px',
              padding: '40px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                fontWeight: 400,
                marginBottom: '32px'
              }}>
                Order Summary
              </h2>

              <div style={{ marginBottom: '24px' }}>
                {cartItems.map(item => (
                  <div key={item.variantId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {item.name} × {item.quantity}
                      <br />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {item.size} · {item.color}
                      </span>
                    </p>
                    <p style={{ fontSize: '12px' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Subtotal
                  </p>
                  <p style={{ fontSize: '13px' }}>₹{total.toLocaleString('en-IN')}</p>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Shipping
                  </p>
                  <p style={{ fontSize: '13px' }}>{total > 999 ? 'Free' : '₹99'}</p>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '32px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Total</p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  className="btn-primary"
                  onClick={handlePayment}
                  disabled={loading || cartItems.length === 0}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  )
}
