'use client'

import ProductCard from './ProductCard'

export default function ProductGrid({ products, light = false }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          No products found
        </p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          light={light}
        />
      ))}
    </div>
  )
}
