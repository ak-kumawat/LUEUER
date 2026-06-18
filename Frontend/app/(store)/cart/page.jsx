'use client'

import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import { useCart } from '../../components/shared/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart()

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
              Cart
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                fontWeight: 300,
                marginBottom: '16px',
                color: 'var(--color-text-secondary)'
              }}>
                Your cart is empty
              </p>
              <p style={{
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                marginBottom: '40px'
              }}>
                Move in silence. Build your cart.
              </p>
              <Link href="/shop" className="btn-primary">
                Shop Now
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '80px',
              alignItems: 'start'
            }}>
              <div>
                {cartItems.map(item => (
                  <div key={item.variantId} style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    gap: '24px',
                    padding: '32px 0',
                    borderBottom: '1px solid var(--color-border)'
                  }}>
                    <div style={{
                      aspectRatio: '3/4',
                      background: 'var(--color-bg-secondary)',
                      overflow: 'hidden'
                    }}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '18px',
                          fontWeight: 400
                        }}>
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '18px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        letterSpacing: '0.1em',
                        marginBottom: '16px'
                      }}>
                        {item.size} · {item.color}
                      </p>

                      <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '18px',
                        marginBottom: '20px'
                      }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid var(--color-border)',
                            background: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid var(--color-border)',
                            background: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  style={{
                    marginTop: '24px',
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear Cart
                </button>
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
                  marginBottom: '32px',
                  letterSpacing: '0.05em'
                }}>
                  Order Summary
                </h2>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Subtotal
                  </p>
                  <p style={{ fontSize: '13px' }}>
                    ₹{total.toLocaleString('en-IN')}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '32px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Shipping
                  </p>
                  <p style={{ fontSize: '13px' }}>
                    {total > 999 ? 'Free' : '₹99'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--color-border)',
                  marginBottom: '32px'
                }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                    Total
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                    ₹{(total + (total > 999 ? 0 : 99)).toLocaleString('en-IN')}
                  </p>
                </div>

                <Link href="/checkout" className="btn-primary" style={{
                  display: 'block',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
