'use client'

import { useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import gsap from 'gsap'

export default function ProductGrid({ products, light = false }) {
  const gridRef = useRef(null)

  useEffect(() => {
    if (!gridRef.current) return

    const cards = gridRef.current.querySelectorAll('.premium-product-card')
    if (cards.length === 0) return

    // Set initial state
    gsap.set(cards, { opacity: 0, y: 20 })

    // Animate with a stagger effect
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
      overwrite: 'auto'
    })
  }, [products])

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
    <div ref={gridRef} className="product-grid">
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
