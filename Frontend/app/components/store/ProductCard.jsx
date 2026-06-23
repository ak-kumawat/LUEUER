'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useClerk } from '@clerk/nextjs'
import { useCart } from '../shared/CartContext'
import { getWishlist, addToWishlist, removeFromWishlist, setTokenFetcher, setAuthToken } from '../../../lib/api'

// Import Swiper React components and modules
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

export default function ProductCard({ product, onClick, light = false }) {
  const [hovered, setHovered] = useState(false)
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const { isSignedIn, getToken } = useAuth()
  const clerk = useClerk()
  const router = useRouter()

  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistId, setWishlistId] = useState(null)
  const clickTimeoutRef = useRef(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  // Extract all available images
  const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.thumbnailUrl
  const otherImages = product.images?.filter(img => !img.isPrimary).map(img => img.imageUrl) || []
  const allImages = primaryImage ? [primaryImage, ...otherImages] : ['/images/tshirt.webp']

  // Helper to check if size is out of stock
  const getVariantForSize = (sizeName) => {
    return product.variants?.find(v => v.size.toUpperCase() === sizeName.toUpperCase())
  }

  const isSizeOutOfStock = (sizeName) => {
    const v = getVariantForSize(sizeName)
    // If variant doesn't exist, treat as out of stock. If exists, check stock quantity.
    return v ? v.stockQuantity === 0 : true
  }

  // Extract unique sizes from variants and merge with default standard sizes
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const sizesList = [...defaultSizes]
  product.variants?.forEach(v => {
    if (v.size) {
      const upperSize = v.size.toUpperCase()
      if (!sizesList.includes(upperSize)) {
        sizesList.push(upperSize)
      }
    }
  })
  // Sort size list to follow standard order: XS -> XXL
  const orderMap = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 }
  sizesList.sort((a, b) => (orderMap[a] || 99) - (orderMap[b] || 99))

  // Find the first size that is in stock to select it initially
  const firstInStockSize = sizesList.find(s => !isSizeOutOfStock(s))
  const [selectedSize, setSelectedSize] = useState(firstInStockSize || sizesList[0])

  // Find matching variant based on selections
  const selectedVariant = getVariantForSize(selectedSize) || product.variants?.[0]
  const cartItem = cartItems?.find(item => item.variantId === selectedVariant?.id)

  // Calculate average rating
  const avgRating = product.ratings?.length > 0
    ? (product.ratings.reduce((sum, r) => sum + r.value, 0) / product.ratings.length).toFixed(1)
    : (product.defaultRating ? parseFloat(product.defaultRating).toFixed(1) : '4.8')

  const price = selectedVariant?.priceOverride
    ? parseFloat(selectedVariant.priceOverride)
    : parseFloat(product.basePrice)

  // Wishlist sync
  useEffect(() => {
    if (!isSignedIn) return
    const checkWishlist = async () => {
      try {
        setTokenFetcher(getToken)
        const token = await getToken()
        setAuthToken(token)

        const res = await getWishlist()
        const items = res.data?.data || []
        const found = items.find(item => item.productId === product.id)
        if (found) {
          setIsWishlisted(true)
          setWishlistId(found.id)
        }
      } catch {}
    }
    checkWishlist()
  }, [isSignedIn, product.id])

  const handleWishlistClick = async (e) => {
    e.stopPropagation()
    if (!isSignedIn) {
      clerk.openSignIn()
      return
    }

    try {
      if (isWishlisted) {
        setIsWishlisted(false)
        const currentWishlistId = wishlistId
        setWishlistId(null)
        if (currentWishlistId) {
          await removeFromWishlist(currentWishlistId)
        }
      } else {
        setIsWishlisted(true)
        const res = await addToWishlist({ productId: product.id })
        setWishlistId(res.data?.data?.id)
      }
    } catch (err) {
      setIsWishlisted(!isWishlisted)
    }
  }

  const handleAddToCartClick = (e) => {
    e.stopPropagation()
    if (!isSignedIn) {
      clerk.openSignIn()
      return
    }
    if (!selectedVariant) {
      alert("This product is currently out of stock.")
      return
    }
    addToCart(product, selectedVariant)
  }

  const handleBuyNowClick = async (e) => {
    e.stopPropagation()
    if (!isSignedIn) {
      clerk.openSignIn()
      return
    }
    if (!selectedVariant) {
      alert("This product is currently out of stock.")
      return
    }
    const existing = cartItems?.find(item => item.variantId === selectedVariant.id)
    if (!existing) {
      await addToCart(product, selectedVariant)
    }
    router.push('/checkout')
  }

  return (
    <div
      className={`premium-product-card ${light ? 'light' : ''} ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      {/* Product Image Well */}
      <div className="card-image-well" onClick={(e) => e.stopPropagation()}>
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation={true}
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={(swiper) => setActiveImgIndex(swiper.activeIndex)}
          style={{
            width: '100%',
            height: '100%',
            '--swiper-pagination-color': 'var(--color-accent)',
            '--swiper-pagination-bullet-inactive-color': 'rgba(255,255,255,0.3)',
            '--swiper-pagination-bullet-inactive-opacity': '1',
            '--swiper-pagination-bullet-size': '6px',
            '--swiper-pagination-bullet-horizontal-gap': '3px'
          }}
        >
          {allImages.map((imgUrl, idx) => (
            <SwiperSlide key={idx} style={{ width: '100%', height: '100%' }}>
              <div
                onClick={() => router.push(`/product/${product.slug}`)}
                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} - image ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Featured Tag */}
        {product.isFeatured && (
          <span className="card-badge-featured" style={{ zIndex: 12 }}>Featured</span>
        )}

        {/* Wishlist Heart Button floating in top-right */}
        <button
          className={`card-wishlist-float ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={handleWishlistClick}
          title="Wishlist"
          style={{ zIndex: 12 }}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>

        {/* Image index indicator */}
        <span className="card-badge-count" style={{ zIndex: 12 }}>
          {activeImgIndex + 1}/{allImages.length}
        </span>
      </div>

      {/* Upper Card Details Section (Dark Background) */}
      <div className="card-body-wrapper">
        <div className="card-meta-header-row" onClick={(e) => e.stopPropagation()}>
          <div className="card-collection-label" style={{ margin: 0 }}>
            {product.tagline || 'Signature Collection'}
          </div>
          <div className="card-rating">
            &#9733; {avgRating}
          </div>
        </div>

        <h3
          className="card-product-title"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/product/${product.slug}`)
          }}
        >
          {product.name}
        </h3>

        {/* Short description for premium look */}
        <p className="card-product-description">
          {product.description ? (product.description.slice(0, 80) + '...') : 'A study in texture and presence. Premium fabrics, tailored fit.'}
        </p>

        {/* Meta Price Row */}
        <div className="card-meta-row" style={{ borderTop: 'none', paddingTop: 0 }}>
          <span className="card-price">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* White Footer Action Buttons Panel */}
      <div className="card-footer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="card-actions-row-1">
          {/* Details Button */}
          <button
            className="card-btn-details"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/product/${product.slug}`)
            }}
          >
            <svg className="btn-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Details
          </button>

          {/* Add to Cart */}
          {cartItem ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#121212',
                color: '#ffffff',
                border: '1px solid #121212',
                borderRadius: '4px',
                height: '36px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const targetQty = cartItem.quantity - 1
                  if (targetQty < 1) {
                    removeFromCart(selectedVariant.id)
                  } else {
                    updateQuantity(selectedVariant.id, targetQty)
                  }
                }}
                style={{
                  width: '32px',
                  height: '100%',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#262626'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                -
              </button>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)' }}>
                {cartItem.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const targetQty = cartItem.quantity + 1
                  if (selectedVariant.stockQuantity < targetQty) {
                    alert(`Only ${selectedVariant.stockQuantity} items in stock.`)
                    return
                  }
                  updateQuantity(selectedVariant.id, targetQty)
                }}
                style={{
                  width: '32px',
                  height: '100%',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#262626'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="card-btn-add-cart"
              onClick={handleAddToCartClick}
              disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
            >
              <svg className="btn-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {!selectedVariant || selectedVariant.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>

        {/* Buy Now (Full Width) */}
        <div className="card-actions-row-2" style={{ display: 'block' }}>
          <button
            className="card-btn-buy-now"
            onClick={handleBuyNowClick}
            style={{ width: '100%', margin: 0 }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
