'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../shared/CartContext'
import Link from 'next/link'

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  if (!product) return null

  const images = product.images || []
  const primaryImage = images.find(img => img.isPrimary)?.imageUrl || product.thumbnailUrl

  const sizes = [...new Set(product.variants?.map(v => v.size))]
  const colors = [...new Map(product.variants?.map(v => [v.color, v])).values()]

  const selectedVariant = product.variants?.find(v =>
    v.size === selectedSize && v.color === selectedColor
  )

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addToCart(product, selectedVariant)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const price = selectedVariant?.priceOverride || product.basePrice

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={images[selectedImage]?.imageUrl || primaryImage}
            alt={product.name}
            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
          />
          {images.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              overflowX: 'auto'
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
                      ? '1px solid white'
                      : '1px solid transparent',
                    opacity: selectedImage === i ? 1 : 0.5
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '40px' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              color: 'var(--color-text-secondary)',
              fontSize: '20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>

          <p className="section-label" style={{ marginBottom: '12px' }}>
            LUEUER CLOTHING
          </p>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 400,
            marginBottom: '16px',
            letterSpacing: '0.05em'
          }}>
            {product.name}
          </h2>

          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            marginBottom: '32px'
          }}>
            ₹{parseFloat(price).toLocaleString('en-IN')}
          </p>

          <div style={{ marginBottom: '28px' }}>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              color: 'var(--color-text-secondary)'
            }}>
              Size
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '10px 16px',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    border: selectedSize === size
                      ? '1px solid white'
                      : '1px solid var(--color-border)',
                    background: selectedSize === size
                      ? 'white'
                      : 'transparent',
                    color: selectedSize === size ? 'black' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              color: 'var(--color-text-secondary)'
            }}>
              Color — {selectedColor || 'Select'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {colors.map(c => (
                <button
                  key={c.color}
                  title={c.color}
                  onClick={() => setSelectedColor(c.color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c.colorHex,
                    border: selectedColor === c.color
                      ? '2px solid white'
                      : '2px solid transparent',
                    outline: selectedColor === c.color
                      ? '1px solid white'
                      : '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
            onClick={handleAddToCart}
            disabled={!selectedVariant}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>

          <Link
            href={`/product/${product.slug}`}
            className="btn-secondary"
            style={{ display: 'block', textAlign: 'center', width: '100%' }}
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  )
}
