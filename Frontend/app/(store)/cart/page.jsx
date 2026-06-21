'use client'

import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import { useCart } from '../../components/shared/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart()

  return (
    <AuthWrapper>
      <div style={{ padding: '80px 24px', minHeight: '80vh', background: 'var(--color-bg)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
            <p className="section-label" style={{ marginBottom: '8px', color: 'var(--color-accent)' }}>Your Curated</p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 300,
              letterSpacing: '0.05em',
              color: '#ffffff'
            }}>
              Cart
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 24px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '2px' }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 300,
                marginBottom: '16px',
                color: 'var(--color-accent)'
              }}>
                Your cart is empty
              </p>
              <p style={{
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                marginBottom: '40px',
                letterSpacing: '0.05em'
              }}>
                Move in silence. Build your collection.
              </p>
              <Link href="/shop" className="btn-primary" style={{ padding: '16px 40px' }}>
                Shop Now
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '64px',
              alignItems: 'start'
            }}>
              
              {/* Cart Items List */}
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {cartItems.map(item => (
                    <div key={item.variantId} style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: '24px',
                      padding: '24px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '2px',
                      transition: 'border-color 0.3s ease',
                      position: 'relative'
                    }}>
                      {/* Product Thumbnail */}
                      <div style={{
                        aspectRatio: '3/4',
                        background: 'var(--color-bg-tertiary)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border-light)'
                      }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        )}
                      </div>

                      {/* Item Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '6px'
                          }}>
                            <h3 style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '20px',
                              fontWeight: 400,
                              letterSpacing: '0.02em',
                              color: '#ffffff'
                            }}>
                              <Link href={`/product/${item.slug}`} style={{ hover: { color: 'var(--color-accent)' } }}>
                                {item.name}
                              </Link>
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.variantId)}
                              style={{
                                color: 'var(--color-text-muted)',
                                fontSize: '14px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s ease',
                                padding: '4px'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>

                          <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '11px',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>Size: <strong style={{ color: '#fff' }}>{item.size}</strong></span>
                            <span style={{ color: 'var(--color-border-light)' }}>|</span>
                            <span>Color: <strong style={{ color: '#fff' }}>{item.color}</strong></span>
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'auto'
                        }}>
                          {/* Price */}
                          <p style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '18px',
                            color: 'var(--color-accent)'
                          }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>

                          {/* Quantity Selector */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--color-border-light)',
                            borderRadius: '2px',
                            background: 'var(--color-bg)'
                          }}>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                background: 'none',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                              onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                            >
                              −
                            </button>
                            <span style={{ fontSize: '12px', minWidth: '24px', textAlign: 'center', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                background: 'none',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                              onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                <button
                  onClick={clearCart}
                  style={{
                    marginTop: '28px',
                    fontSize: '10px',
                    letterSpacing: '0.25em',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  Clear Collection
                </button>
              </div>

              {/* Order Summary Sticky Panel */}
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
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '16px'
                }}>
                  Summary
                </h2>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '18px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Subtotal
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>
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
                  <p style={{ fontSize: '13px', color: total > 999 ? '#4ade80' : 'var(--color-text)', fontWeight: 500 }}>
                    {total > 999 ? 'Complimentary' : '₹99'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--color-border)',
                  marginBottom: '36px'
                }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#ffffff' }}>
                    Total
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-accent)', fontWeight: 600 }}>
                    ₹{(total + (total > 999 ? 0 : 99)).toLocaleString('en-IN')}
                  </p>
                </div>

                <Link href="/checkout" className="btn-primary" style={{
                  display: 'block',
                  textAlign: 'center',
                  width: '100%',
                  padding: '16px 32px',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.2em'
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
