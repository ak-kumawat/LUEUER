'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../shared/CartContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProductModal({ product, onClose }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  if (!product) return null

  const images = product.images || []
  const primaryImage = images.find(img => img.isPrimary)?.imageUrl || product.thumbnailUrl

  const selectedVariant = product.variants?.[0]
  const cartItem = cartItems?.find(item => item.variantId === selectedVariant?.id)
  const selectedSize = selectedVariant?.size
  const selectedColor = selectedVariant?.color
  const selectedColorHex = selectedVariant?.colorHex
  const price = selectedVariant?.priceOverride || product.basePrice

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("This product is currently out of stock.")
      return
    }

    const existingCartItem = cartItems?.find(item => item.variantId === selectedVariant.id)
    const existingQty = existingCartItem?.quantity || 0
    const targetQty = existingQty + 1

    if (selectedVariant.stockQuantity < targetQty) {
      alert(`You cannot add more items. Only ${selectedVariant.stockQuantity} items are available in stock.`)
      return
    }

    addToCart(product, selectedVariant)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: '2px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Left Column: Images */}
        <div style={{ position: 'relative', background: 'var(--color-bg-tertiary)' }}>
          <div style={{ aspectRatio: '1', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
            <img
              src={images[selectedImage]?.imageUrl || primaryImage}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {images.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '16px',
              overflowX: 'auto',
              borderTop: '1px solid var(--color-border)'
            }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.imageUrl}
                  alt=""
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === i
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border-light)',
                    opacity: selectedImage === i ? 1 : 0.4,
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Action */}
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              color: 'var(--color-text-muted)',
              fontSize: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
              zIndex: 10
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            ✕
          </button>

          <p className="section-label" style={{ marginBottom: '8px', color: 'var(--color-accent)' }}>
            LURUER SIGNATURE
          </p>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '32px',
            fontWeight: 300,
            marginBottom: '12px',
            letterSpacing: '0.05em',
            color: '#ffffff',
            lineHeight: '1.2'
          }}>
            {product.name}
          </h2>

          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            color: 'var(--color-accent)',
            marginBottom: '32px',
            fontWeight: 400
          }}>
            ₹{parseFloat(price).toLocaleString('en-IN')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            
            {/* Size static indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="section-label" style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                Size:
              </span>
              <span style={{
                padding: '6px 16px',
                fontSize: '12px',
                letterSpacing: '0.1em',
                border: '1px solid var(--color-border-light)',
                background: 'rgba(255,255,255,0.02)',
                color: '#ffffff',
                borderRadius: '2px',
                fontWeight: 500
              }}>
                {selectedSize || 'N/A'}
              </span>
            </div>

            {/* Color static indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="section-label" style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                Color:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedColorHex && (
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: selectedColorHex,
                    border: '1px solid var(--color-border-light)',
                    display: 'inline-block'
                  }} />
                )}
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                  {selectedColor || 'N/A'}
                </span>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cartItem ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-accent)',
                borderRadius: '2px',
                height: '48px',
                width: '100%'
              }}>
                <button
                  onClick={() => {
                    const targetQty = cartItem.quantity - 1
                    if (targetQty < 1) {
                      removeFromCart(selectedVariant.id)
                    } else {
                      updateQuantity(selectedVariant.id, targetQty)
                    }
                  }}
                  style={{
                    width: '48px',
                    height: '100%',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'transparent'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)' }}>
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => {
                    const targetQty = cartItem.quantity + 1
                    if (selectedVariant.stockQuantity < targetQty) {
                      alert(`Only ${selectedVariant.stockQuantity} items in stock.`)
                      return
                    }
                    updateQuantity(selectedVariant.id, targetQty)
                  }}
                  style={{
                    width: '48px',
                    height: '100%',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'transparent'
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '16px 32px', fontSize: '11px', letterSpacing: '0.2em' }}
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
              >
                {!selectedVariant || selectedVariant.stockQuantity === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            )}

            <Link
              href={`/product/${product.slug}`}
              className="btn-secondary"
              style={{ display: 'block', textAlign: 'center', width: '100%', padding: '14px 32px', fontSize: '11px', letterSpacing: '0.2em' }}
              onClick={onClose}
            >
              View Full Details
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
