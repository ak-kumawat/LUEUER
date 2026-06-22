'use client'

import { useState, useEffect, useRef } from 'react'
import AuthWrapper from '../../../components/shared/AuthWrapper'
import Footer from '../../../components/store/Footer'
import SizeChart from '../../../components/store/SizeChart'
import { useCart } from '../../../components/shared/CartContext'
import { getProductBySlug, getRatingsByProduct } from '../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

export default function ProductDetailPage({ params }) {
  const slug = params.slug
  const router = useRouter()

  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const [product, setProduct] = useState(null)
  const [rating, setRating] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)

  const galleryRef = useRef(null)
  const detailsRef = useRef(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductBySlug(slug)
        const p = res.data?.data
        setProduct(p)

        const ratingRes = await getRatingsByProduct(p.id)
        setRating(ratingRes.data?.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (loading || !product) return

    const ctx = gsap.context(() => {
      if (galleryRef.current) {
        gsap.fromTo(galleryRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
        )
      }

      if (detailsRef.current) {
        gsap.fromTo(detailsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.08 }
        )
      }
    })

    return () => ctx.revert()
  }, [loading, product])

  if (loading) {
    return (
      <AuthWrapper>
        <div style={{ textAlign: 'center', padding: '160px 24px', background: 'var(--color-bg)', minHeight: '80vh' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', letterSpacing: '0.1em' }}>Loading collection...</p>
        </div>
      </AuthWrapper>
    )
  }

  if (!product) {
    return (
      <AuthWrapper>
        <div style={{ textAlign: 'center', padding: '160px 24px', background: 'var(--color-bg)', minHeight: '80vh' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Product not found</p>
        </div>
      </AuthWrapper>
    )
  }

  const images = product.images || []
  const selectedVariant = product.variants?.[0]
  const cartItem = cartItems?.find(item => item.variantId === selectedVariant?.id)
  const selectedSize = selectedVariant?.size
  const selectedColor = selectedVariant?.color
  const selectedColorHex = selectedVariant?.colorHex
  const price = selectedVariant?.priceOverride || product.basePrice
  const categories = product.categories?.map(pc => pc.category) || []

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

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert("This product is currently out of stock.")
      return
    }

    if (selectedVariant.stockQuantity < 1) {
      alert("This item is currently out of stock.")
      return
    }

    addToCart(product, selectedVariant)
    router.push('/checkout')
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '80px 24px', background: 'var(--color-bg)', minHeight: '90vh' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          {/* Breadcrumbs */}
          <p style={{
            fontSize: '10px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '48px'
          }}>
            <Link href="/" style={{ hover: { color: '#fff' } }}>LURUER</Link>
            {categories.map(cat => (
              <span key={cat?.id}>
                {' › '}
                <Link href={`/shop?category=${cat?.slug}`} style={{ hover: { color: '#fff' } }}>{cat?.name}</Link>
              </span>
            ))}
            {' › '}
            <span style={{ color: 'var(--color-accent)' }}>{product.name}</span>
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '64px',
            alignItems: 'start'
          }}>
            
            {/* Images Well */}
            <div ref={galleryRef} style={{ opacity: 0 }}>
              <div style={{
                aspectRatio: '3/4',
                overflow: 'hidden',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                marginBottom: '16px'
              }}>
                <img
                  src={images[selectedImage]?.imageUrl || product.thumbnailUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img.imageUrl}
                      alt=""
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: '76px',
                        height: '76px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImage === i
                          ? '1px solid var(--color-accent)'
                          : '1px solid var(--color-border-light)',
                        opacity: selectedImage === i ? 1 : 0.4,
                        transition: 'all 0.3s',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Content Details */}
            <div ref={detailsRef} style={{ position: 'sticky', top: '100px', opacity: 0 }}>
              <p className="section-label" style={{ marginBottom: '12px', color: 'var(--color-accent)' }}>
                {product.tagline || 'LURUER CLOTHING'}
              </p>

              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px, 4vw, 56px)',
                fontWeight: 300,
                letterSpacing: '0.05em',
                marginBottom: '16px',
                lineHeight: '1.15',
                color: '#ffffff'
              }}>
                {product.name}
              </h1>

              {rating && rating.count > 0 && (
                <p style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '24px',
                  letterSpacing: '0.05em'
                }}>
                  ★ {rating.average} · {rating.count} ratings
                </p>
              )}

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                marginBottom: '36px',
                color: 'var(--color-accent)',
                fontWeight: 400
              }}>
                ₹{parseFloat(price).toLocaleString('en-IN')}
              </p>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '28px' }}>
                
                {/* Size static row */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p className="section-label" style={{ margin: 0, color: 'var(--color-text-muted)' }}>Size:</p>
                  <span style={{
                    padding: '8px 20px',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    border: '1px solid var(--color-border-light)',
                    background: 'var(--color-bg-secondary)',
                    color: '#ffffff',
                    borderRadius: '2px',
                    fontWeight: 500
                  }}>
                    {selectedSize || 'N/A'}
                  </span>
                  <SizeChart />
                </div>

                {/* Color static row */}
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p className="section-label" style={{ margin: 0, color: 'var(--color-text-muted)' }}>Color:</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedColorHex && (
                      <span style={{
                        width: '18px',
                        height: '18px',
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

                {/* Stock Indicator */}
                {selectedVariant && (
                  <p style={{
                    fontSize: '12px',
                    color: selectedVariant.stockQuantity > 0
                      ? 'var(--color-text-secondary)'
                      : '#ef4444',
                    marginBottom: '28px',
                    fontWeight: 400
                  }}>
                    {selectedVariant.stockQuantity > 0
                      ? `${selectedVariant.stockQuantity} items in stock`
                      : 'Currently out of stock'}
                  </p>
                )}

                {/* Actions */}
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
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                      style={{ width: '100%', padding: '16px 32px', fontSize: '11px', letterSpacing: '0.2em' }}
                    >
                      {!selectedVariant || selectedVariant.stockQuantity === 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                  )}

                  <button
                    className="btn-secondary"
                    onClick={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      width: '100%',
                      padding: '16px 32px',
                      fontSize: '11px',
                      letterSpacing: '0.2em'
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Description Panel */}
              <div style={{
                marginTop: '56px',
                paddingTop: '36px',
                borderTop: '1px solid var(--color-border)'
              }}>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  fontWeight: 300
                }}>
                  {product.description}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
