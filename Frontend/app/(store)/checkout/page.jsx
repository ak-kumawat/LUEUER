'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import AuthWrapper from '../../components/shared/AuthWrapper'
import { useCart } from '../../components/shared/CartContext'
import { getAddresses, createRazorpayOrder, placeOrder, checkServiceability } from '../../../lib/api'

export default function CheckoutPage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { cartItems, total, clearCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)

  const [shippingFee, setShippingFee] = useState(0)
  const [serviceable, setServiceable] = useState(null)
  const [codAvailable, setCodAvailable] = useState(null)
  const [checkingServiceability, setCheckingServiceability] = useState(false)
  const [serviceabilityError, setServiceabilityError] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')

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

  useEffect(() => {
    if (!selectedAddress || addresses.length === 0) return

    const addr = addresses.find(a => a.id === selectedAddress)
    if (!addr || !addr.postalCode) return

    const fetchServiceability = async () => {
      setCheckingServiceability(true)
      setServiceabilityError(null)
      try {
        const res = await checkServiceability({
          delivery_postcode: addr.postalCode,
          cod: 1
        })
        const data = res.data?.data
        if (data) {
          setServiceable(data.serviceable)
          setCodAvailable(data.cod_available)
          if (!data.cod_available) {
            setPaymentMethod('razorpay')
          }
          if (data.serviceable) {
            setShippingFee(data.cheapest_rate || 0)
          } else {
            setShippingFee(0)
          }
        } else {
          throw new Error("No data returned")
        }
      } catch (err) {
        console.error("Failed to check shipping serviceability:", err)
        setServiceabilityError("Could not retrieve shipping details. Please select another address.")
        setServiceable(false)
        setCodAvailable(false)
        setPaymentMethod('razorpay')
        setShippingFee(0)
      } finally {
        setCheckingServiceability(false)
      }
    }
    fetchServiceability()
  }, [selectedAddress, addresses])

  const grandTotal = total + shippingFee

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    setLoading(true)

    if (paymentMethod === 'cod') {
      try {
        await placeOrder({
          shippingAddressId: selectedAddress,
          paymentMethod: 'cod'
        })
        clearCart()
        router.push('/orders')
      } catch (err) {
        alert(err?.response?.data?.message || 'Order placement failed. Please contact support.')
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      const orderRes = await createRazorpayOrder({ shippingAddressId: selectedAddress })
      const razorpayOrder = orderRes.data?.data

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
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
        <div style={{ textAlign: 'center', padding: '160px 24px', background: 'var(--color-bg)', minHeight: '80vh' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Please sign in to checkout
          </p>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '80px 24px', minHeight: '80vh', background: 'var(--color-bg)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
            <p className="section-label" style={{ marginBottom: '8px', color: 'var(--color-accent)' }}>Secure Checkout</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 300,
              letterSpacing: '0.05em',
              color: '#ffffff'
            }}>
              Checkout
            </h1>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '64px',
            alignItems: 'start'
          }}>
            
            {/* Delivery address selectors on the left */}
            <div>
              <div style={{ marginBottom: '48px' }}>
                <h3 className="section-label" style={{ marginBottom: '24px', color: 'var(--color-accent)' }}>
                  Select Delivery Address
                </h3>

                {addresses.length === 0 ? (
                  <div style={{
                    padding: '40px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    textAlign: 'center',
                    borderRadius: '2px'
                  }}>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      marginBottom: '24px',
                      fontSize: '13px'
                    }}>
                      No saved addresses found
                    </p>
                    <a href="/addresses" className="btn-secondary" style={{ fontSize: '11px', padding: '12px 24px' }}>
                      Add New Address
                    </a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {addresses.map(addr => {
                      const isSelected = selectedAddress === addr.id
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr.id)}
                          style={{
                            padding: '24px 32px',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            background: 'var(--color-bg-secondary)',
                            transition: 'border-color 0.3s ease'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              letterSpacing: '0.15em',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              color: isSelected ? 'var(--color-accent)' : '#ffffff'
                            }}>
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span style={{
                                fontSize: '9px',
                                padding: '2px 8px',
                                border: '1px solid var(--color-border-light)',
                                borderRadius: '2px',
                                color: 'var(--color-text-muted)',
                                fontWeight: 500
                              }}>
                                Default
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-secondary)', fontWeight: 300 }}>
                            {addr.street}, {addr.city}, {addr.state} — {addr.postalCode}
                          </p>

                          {isSelected && (
                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                              {checkingServiceability ? (
                                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  ⏳ Checking delivery serviceability...
                                </p>
                              ) : serviceable === true ? (
                                <p style={{
                                  fontSize: '11px',
                                  color: codAvailable ? '#4ade80' : 'var(--color-accent)',
                                  letterSpacing: '0.05em',
                                  fontWeight: 500
                                }}>
                                  {codAvailable ? '✓ Cash on Delivery (COD) available' : '✓ Prepaid payment available (COD unavailable)'}
                                </p>
                              ) : serviceable === false ? (
                                <p style={{ fontSize: '11px', color: '#ef4444', letterSpacing: '0.05em', fontWeight: 500 }}>
                                  ❌ Undeliverable to this pincode location
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {serviceable === false && (
                  <div style={{
                    marginTop: '24px',
                    padding: '20px 24px',
                    border: '1px solid #ef4444',
                    background: 'rgba(239,68,68,0.02)',
                    color: '#ef4444',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    borderRadius: '2px'
                  }}>
                    ⚠️ We cannot deliver to this address pincode. Please select or add a different shipping address.
                  </div>
                )}
              </div>
            </div>

            {/* Order summary panel on the right */}
            <div style={{
              position: 'sticky',
              top: '100px',
              padding: '40px 32px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              borderRadius: '2px'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                fontWeight: 400,
                marginBottom: '32px',
                color: '#ffffff',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '16px',
                letterSpacing: '0.05em'
              }}>
                Summary
              </h2>

              {/* Cart Items Summary */}
              <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map(item => (
                  <div key={item.variantId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: 400, margin: 0 }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0', letterSpacing: '0.05em' }}>
                        Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals & Fees */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '14px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Subtotal
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>₹{total.toLocaleString('en-IN')}</p>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Shipping
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>
                    {checkingServiceability ? (
                      <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Calculating...</span>
                    ) : serviceable === true ? (
                      shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`
                    ) : serviceable === false ? (
                      <span style={{ color: '#ef4444' }}>Unavailable</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Select address</span>
                    )}
                  </p>
                </div>

                {/* Payment Method Radio Selection */}
                {serviceable === true && (
                  <div style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '20px',
                    marginBottom: '24px'
                  }}>
                    <p style={{ color: 'var(--color-accent)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', fontWeight: 600 }}>
                      Payment Method
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text-secondary)', width: 'fit-content' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          style={{ accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                        />
                        Online Payment (Razorpay)
                      </label>
                      {codAvailable && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text-secondary)', width: 'fit-content' }}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            style={{ accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                          />
                          Cash on Delivery (COD)
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Grand Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '32px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#ffffff' }}>Total</p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-accent)', fontWeight: 600 }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Action button */}
                <button
                  className="btn-primary"
                  onClick={handlePayment}
                  disabled={loading || cartItems.length === 0 || checkingServiceability || serviceable === false || selectedAddress === null}
                  style={{ width: '100%', padding: '16px 32px', fontSize: '11px', letterSpacing: '0.2em' }}
                >
                  {loading ? 'Processing...' : 
                   checkingServiceability ? 'Checking details...' :
                   selectedAddress === null ? 'Select shipping address' :
                   serviceable === false ? 'Delivery unavailable' :
                   paymentMethod === 'cod' ? 'Place Order (COD)' :
                   `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  )
}
