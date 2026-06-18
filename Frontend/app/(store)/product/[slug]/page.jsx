'use client'

import { useState, useEffect } from 'react'
import AuthWrapper from '../../../components/shared/AuthWrapper'
import Footer from '../../../components/store/Footer'
import SizeChart from '../../../components/store/SizeChart'
import { useCart } from '../../../components/shared/CartContext'
import { getProductBySlug, getRatingsByProduct } from '../../../../lib/api'
import Link from 'next/link'

export default function ProductDetailPage({ params }) {
  const slug = params.slug

  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [rating, setRating] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <AuthWrapper>
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </AuthWrapper>
    )
  }

  if (!product) {
    return (
      <AuthWrapper>
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Product not found</p>
        </div>
      </AuthWrapper>
    )
  }

  const images = product.images || []
  const sizes = [...new Set(product.variants?.map(v => v.size))]
  const colors = [...new Map(product.variants?.map(v => [v.color, v])).values()]
  const selectedVariant = product.variants?.find(v =>
    v.size === selectedSize && v.color === selectedColor
  )
  const price = selectedVariant?.priceOverride || product.basePrice
  const categories = product.categories?.map(pc => pc.category) || []

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addToCart(product, selectedVariant)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <AuthWrapper>
      <div style={{ padding: '40px 24px' }}>
        <div className="container">
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.1em',
            marginBottom: '48px'
          }}>
            <Link href="/">LUEUER</Link>
            {categories.map(cat => (
              <span key={cat?.id}>
                {' › '}
                <Link href={`/shop?category=${cat?.slug}`}>{cat?.name}</Link>
              </span>
            ))}
            {' › '}
            {product.name}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '80px',
            alignItems: 'start'
          }}>
            <div>
              <div style={{
                aspectRatio: '3/4',
                overflow: 'hidden',
                background: 'var(--color-bg-secondary)',
                marginBottom: '12px'
              }}>
                <img
                  src={images[selectedImage]?.imageUrl || product.thumbnailUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img.imageUrl}
                      alt=""
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImage === i
                          ? '1px solid white'
                          : '1px solid transparent',
                        opacity: selectedImage === i ? 1 : 0.5,
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', top: '100px' }}>
              <p className="section-label" style={{ marginBottom: '16px' }}>
                LUEUER CLOTHING
              </p>

              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 300,
                letterSpacing: '0.05em',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                {product.name}
              </h1>

              {rating && rating.count > 0 && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '24px'
                }}>
                  ★ {rating.average} · {rating.count} ratings
                </p>
              )}

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                marginBottom: '32px'
              }}>
                ₹{parseFloat(price).toLocaleString('en-IN')}
              </p>

              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <p className="section-label">Size</p>
                  <SizeChart />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '12px 20px',
                        fontSize: '12px',
                        letterSpacing: '0.1em',
                        border: selectedSize === size
                          ? '1px solid white'
                          : '1px solid var(--color-border)',
                        background: selectedSize === size ? 'white' : 'transparent',
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
                <p className="section-label" style={{ marginBottom: '12px' }}>
                  Color — {selectedColor || 'Select'}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {colors.map(c => (
                    <button
                      key={c.color}
                      title={c.color}
                      onClick={() => setSelectedColor(c.color)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: c.colorHex,
                        border: selectedColor === c.color
                          ? '2px solid white'
                          : '2px solid transparent',
                        outline: selectedColor === c.color
                          ? '2px solid white'
                          : '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              {selectedVariant && (
                <p style={{
                  fontSize: '12px',
                  color: selectedVariant.stockQuantity > 0
                    ? 'var(--color-text-secondary)'
                    : 'red',
                  marginBottom: '24px'
                }}>
                  {selectedVariant.stockQuantity > 0
                    ? `${selectedVariant.stockQuantity} in stock`
                    : 'Out of stock'}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className="btn-primary"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant?.stockQuantity === 0}
                  style={{ width: '100%' }}
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>

                <Link href="/checkout" className="btn-secondary" style={{
                  display: 'block',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  Buy Now
                </Link>
              </div>

              <div style={{
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid var(--color-border)'
              }}>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '13px',
                  lineHeight: '1.8'
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
