'use client'

import { useAuth } from '@clerk/nextjs'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import { useCart } from '../../components/shared/CartContext'
import { useWishlist } from '../../components/shared/WishlistContext'
import Link from 'next/link'

export default function WishlistPage() {
  const { isSignedIn } = useAuth()
  const { addToCart } = useCart()
  const { wishlistItems, toggleWishlist, syncing: loading } = useWishlist()

  const handleRemove = (item) => {
    if (item?.product) {
      toggleWishlist(item.product)
    }
  }

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
              Wishlist
            </h1>
          </div>

          {!isSignedIn ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                Sign in to view your wishlist
              </p>
            </div>
          ) : loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          ) : wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 300,
                color: 'var(--color-text-secondary)',
                marginBottom: '32px'
              }}>
                Nothing saved yet
              </p>
              <Link href="/shop" className="btn-primary">Shop Now</Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {wishlistItems.map(item => {
                const product = item.product
                if (!product) return null
                const image = product.images?.find(i => i.isPrimary)?.imageUrl
                  || product.thumbnailUrl

                return (
                  <div key={item.id}>
                    <div style={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      background: 'var(--color-bg-secondary)',
                      marginBottom: '16px',
                      overflow: 'hidden'
                    }}>
                      {image && (
                        <img
                          src={image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      <button
                        onClick={() => handleRemove(item)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '16px',
                      fontWeight: 400,
                      marginBottom: '8px'
                    }}>
                      {product.name}
                    </h3>

                    <p style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '13px',
                      marginBottom: '16px'
                    }}>
                      ₹{parseFloat(product.basePrice).toLocaleString('en-IN')}
                    </p>

                    <Link
                      href={`/product/${product.slug}`}
                      className="btn-secondary"
                      style={{ display: 'block', textAlign: 'center' }}
                    >
                      View Product
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
