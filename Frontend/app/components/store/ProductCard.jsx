'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../shared/CartContext'

export default function ProductCard({ product, onClick, light = false }) {
  const [hovered, setHovered] = useState(false)
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const { addToCart } = useCart()

  // Extract all available images
  const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.thumbnailUrl
  const otherImages = product.images?.filter(img => !img.isPrimary).map(img => img.imageUrl) || []
  const allImages = primaryImage ? [primaryImage, ...otherImages] : ['/images/tshirt.webp']

  // Extract unique colors from variants, fallback to standard premium options if none exist
  const uniqueColors = []
  const colorMap = new Map()
  product.variants?.forEach(v => {
    if (v.color && !colorMap.has(v.color.toLowerCase())) {
      colorMap.set(v.color.toLowerCase(), v)
      uniqueColors.push({ name: v.color, hex: v.colorHex })
    }
  })
  const defaultColors = [
    { name: 'Black', hex: '#0a0a0a' },
    { name: 'Charcoal', hex: '#4a4a4a' },
    { name: 'Olive', hex: '#5b584e' },
    { name: 'Sand', hex: '#d9d2c5' }
  ]
  const colorsList = uniqueColors.length > 0 ? uniqueColors : defaultColors
  const [selectedColor, setSelectedColor] = useState(colorsList[0]?.name)

  // Extract unique sizes from variants, fallback to standard size options if none exist
  const uniqueSizes = []
  const sizeMap = new Set()
  product.variants?.forEach(v => {
    if (v.size && !sizeMap.has(v.size.toUpperCase())) {
      sizeMap.add(v.size.toUpperCase())
      uniqueSizes.push(v.size.toUpperCase())
    }
  })
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const sizesList = uniqueSizes.length > 0 ? uniqueSizes : defaultSizes
  const [selectedSize, setSelectedSize] = useState(sizesList[1] || sizesList[0]) // default to 'S' if present

  // Quantity selector state
  const [quantity, setQuantity] = useState(1)

  // Find matching variant based on selections, fallback to first variant
  const selectedVariant = product.variants?.find(v => 
    (selectedSize ? v.size.toUpperCase() === selectedSize.toUpperCase() : true) &&
    (selectedColor ? v.color.toLowerCase() === selectedColor.toLowerCase() : true)
  ) || product.variants?.[0]

  // Calculate average rating
  const avgRating = product.ratings?.length > 0
    ? (product.ratings.reduce((sum, r) => sum + r.value, 0) / product.ratings.length).toFixed(1)
    : '4.8' // Fallback to matching design aesthetic 4.8 default

  const price = selectedVariant?.priceOverride
    ? parseFloat(selectedVariant.priceOverride)
    : parseFloat(product.basePrice)

  // Carousel handlers
  const handlePrev = (e) => {
    e.stopPropagation()
    setActiveImgIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNext = (e) => {
    e.stopPropagation()
    setActiveImgIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div
      className={`premium-product-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(product)}
    >
      {/* Product Image Well */}
      <div className="card-image-well">
        <img
          src={allImages[activeImgIndex]}
          alt={product.name}
        />

        {/* Carousel controls shown on hover */}
        {hovered && allImages.length > 1 && (
          <>
            <button className="carousel-arrow left" onClick={handlePrev}>
              &#8249;
            </button>
            <button className="carousel-arrow right" onClick={handleNext}>
              &#8250;
            </button>
          </>
        )}

        {/* Carousel pagination dots shown on hover */}
        {hovered && allImages.length > 1 && (
          <div className="carousel-dots">
            {allImages.map((_, idx) => (
              <span
                key={idx}
                className={`carousel-dot ${idx === activeImgIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Featured Tag */}
        {product.isFeatured && (
          <span className="card-badge-featured">Featured</span>
        )}

        {/* Wishlist Hearts / Image index indicator */}
        <span className="card-badge-count">
          &#9825; {activeImgIndex + 1}/{allImages.length}
        </span>

        {/* Quick View Bar */}
        <div className="card-quick-view-bar">
          Quick View
        </div>
      </div>

      {/* Product Details Section */}
      <div className="card-collection-label">
        Signature Collection
      </div>

      <Link href={`/product/${product.slug}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="card-product-title">
          {product.name}
        </h3>
      </Link>

      <p className="card-product-desc" title={product.description}>
        {product.description || '360 GSM premium cotton construction.'}
      </p>

      {/* Selectors Row: Colors on Left, Sizes on Right */}
      <div className="card-selectors-row" onClick={(e) => e.stopPropagation()}>
        {/* Colors */}
        <div className="card-colors-container">
          {colorsList.map(c => (
            <button
              key={c.name}
              className={`card-color-swatch ${selectedColor === c.name ? 'active' : ''}`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
              onClick={() => setSelectedColor(c.name)}
            />
          ))}
        </div>

        {/* Ratings Star Badge */}
        <div className="card-rating">
          &#9733; {avgRating}
        </div>
      </div>

      {/* Sizes Selection */}
      <div className="card-selectors-row" style={{ marginTop: '-8px' }} onClick={(e) => e.stopPropagation()}>
        <div className="card-sizes-container">
          {sizesList.map(s => (
            <button
              key={s}
              className={`card-size-pill ${selectedSize === s ? 'active' : ''}`}
              onClick={() => setSelectedSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Price Row */}
      <div className="card-meta-row">
        <span className="card-price">
          ₹{price.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Action Buttons Grid */}
      <div className="card-actions-grid" onClick={(e) => e.stopPropagation()}>
        <div className="card-actions-row-1">
          {/* Details Button + Quantity Select Group */}
          <div className="card-qty-details-group">
            <Link href={`/product/${product.slug}`} className="card-btn-details">
              Details
            </Link>
            <input
              type="number"
              min="1"
              className="card-qty-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Add to Cart */}
          <button
            className="card-btn-add-cart"
            onClick={() => {
              if (selectedVariant) {
                addToCart(product, selectedVariant, quantity)
              }
            }}
          >
            Add To Cart
          </button>
        </div>

        {/* Buy Now */}
        <button
          className="card-btn-buy-now"
          onClick={() => {
            if (selectedVariant) {
              addToCart(product, selectedVariant, quantity)
              window.location.href = '/cart'
            }
          }}
        >
          Buy Now
        </button>
      </div>
    </div>
  )
}
