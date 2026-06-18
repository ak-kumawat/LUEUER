'use client'

import { useState, useEffect } from 'react'
import AuthWrapper from '../../components/shared/AuthWrapper'
import ProductGrid from '../../components/store/ProductGrid'
import Footer from '../../components/store/Footer'
import { getProducts, getCategories } from '../../../lib/api'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ gender: '', clothType: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          getCategories()
        ])
        setProducts(productsRes.data?.data?.products || [])
        setCategories(categoriesRes.data?.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const genderCategories = categories.filter(c => c.type === 'gender')
  const clothTypeCategories = categories.filter(c => c.type === 'cloth_type')

  const filteredProducts = products.filter(product => {
    const productCategories = product.categories?.map(pc => pc.category?.slug) || []
    if (filters.gender && !productCategories.includes(filters.gender)) return false
    if (filters.clothType && !productCategories.includes(filters.clothType)) return false
    return true
  })

  return (
    <AuthWrapper>
      <div style={{ padding: '60px 24px' }}>
        <div className="container">
          <div style={{ marginBottom: '64px' }}>
            <p className="section-label" style={{ marginBottom: '16px' }}>
              Collection
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              Shop LUEUER
            </h1>
          </div>

          <div style={{
            display: 'flex',
            gap: '48px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px'
          }}>
            <div>
              <p className="section-label" style={{ marginBottom: '12px' }}>Shop For</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilters(f => ({ ...f, gender: '' }))}
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    padding: '6px 16px',
                    border: '1px solid',
                    borderColor: !filters.gender ? 'white' : 'var(--color-border)',
                    background: !filters.gender ? 'white' : 'transparent',
                    color: !filters.gender ? 'black' : 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  All
                </button>
                {genderCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(f => ({ ...f, gender: cat.slug }))}
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      padding: '6px 16px',
                      border: '1px solid',
                      borderColor: filters.gender === cat.slug ? 'white' : 'var(--color-border)',
                      background: filters.gender === cat.slug ? 'white' : 'transparent',
                      color: filters.gender === cat.slug ? 'black' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label" style={{ marginBottom: '12px' }}>Category</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilters(f => ({ ...f, clothType: '' }))}
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    padding: '6px 16px',
                    border: '1px solid',
                    borderColor: !filters.clothType ? 'white' : 'var(--color-border)',
                    background: !filters.clothType ? 'white' : 'transparent',
                    color: !filters.clothType ? 'black' : 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  All
                </button>
                {clothTypeCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(f => ({ ...f, clothType: cat.slug }))}
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      padding: '6px 16px',
                      border: '1px solid',
                      borderColor: filters.clothType === cat.slug ? 'white' : 'var(--color-border)',
                      background: filters.clothType === cat.slug ? 'white' : 'transparent',
                      color: filters.clothType === cat.slug ? 'black' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            marginBottom: '40px'
          }}>
            {filteredProducts.length} products
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
