'use client'

import { useEffect, useRef } from 'react'
import { useCart } from './CartContext'
import { useRouter } from 'next/navigation'
import { X, ShoppingBag } from 'lucide-react'

export default function MiniCart() {
  const { cartItems, total, isMiniCartOpen, setIsMiniCartOpen, removeFromCart } = useCart()
  const router = useRouter()
  const autoCloseTimer = useRef(null)

  // Auto-close after 4 seconds of inactivity
  useEffect(() => {
    if (isMiniCartOpen) {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
      
      autoCloseTimer.current = setTimeout(() => {
        setIsMiniCartOpen(false)
      }, 4000)
    }

    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
    }
  }, [isMiniCartOpen, cartItems])

  const handleMouseEnter = () => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
  }

  const handleMouseLeave = () => {
    if (isMiniCartOpen) {
      autoCloseTimer.current = setTimeout(() => {
        setIsMiniCartOpen(false)
      }, 4000)
    }
  }

  if (!isMiniCartOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={() => setIsMiniCartOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          background: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s ease-out'
        }}
        onClick={e => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              Shopping Bag ({cartItems.length})
            </h3>
          </div>
          <button
            onClick={() => setIsMiniCartOpen(false)}
            style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cartItems.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)', strokeWidth: 1 }} />
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
                Your bag is empty.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {cartItems.map(item => (
                <div key={item.variantId} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '80px', aspectRatio: '3/4', background: 'var(--color-bg-tertiary)', overflow: 'hidden' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--color-text)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Size: {item.size} · Color: {item.color}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.01)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>Subtotal</span>
              <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => {
                  setIsMiniCartOpen(false)
                  router.push('/checkout')
                }}
              >
                Checkout
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--color-border)' }}
                onClick={() => {
                  setIsMiniCartOpen(false)
                  router.push('/cart')
                }}
              >
                View Bag
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
