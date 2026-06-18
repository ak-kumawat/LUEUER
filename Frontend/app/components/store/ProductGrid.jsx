'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

export default function ProductGrid({ products, light = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null)

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
    <>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={setSelectedProduct}
            light={light}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
