'use client'

import { useState, useEffect } from 'react'
import { getCategories, adminCreateCategory, adminUpdateCategory } from '../../../../lib/api'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', type: 'gender', description: '', displayOrder: 0
  })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res.data?.data || [])
    } catch { } finally { setLoading(false) }
  }

  const generateSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()

  const handleSubmit = async () => {
    try {
      await adminCreateCategory({
        ...form,
        slug: form.slug || generateSlug(form.name)
      })
      setForm({ name: '', slug: '', type: 'gender', description: '', displayOrder: 0 })
      setShowForm(false)
      fetchCategories()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  const toggleActive = async (cat) => {
    try {
      await adminUpdateCategory(cat.id, { isActive: !cat.isActive })
      fetchCategories()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '48px'
      }}>
        <div>
          <p className="section-label" style={{ marginBottom: '12px' }}>Manage</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 300 }}>
            Categories
          </h1>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div style={{
          padding: '32px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '560px'
        }}>
          <input
            placeholder="Category name"
            value={form.name}
            onChange={e => setForm(f => ({
              ...f,
              name: e.target.value,
              slug: generateSlug(e.target.value)
            }))}
          />
          <input
            placeholder="Slug"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          />
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <option value="gender">Gender (Men, Women, Boys, Girls)</option>
            <option value="cloth_type">Cloth Type (T-shirt, Shirt, Trouser)</option>
          </select>
          <input
            placeholder="Description (SEO)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Display order"
            value={form.displayOrder}
            onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
          />
          <button className="btn-primary" onClick={handleSubmit}>
            Save Category
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 80px auto',
              gap: '24px',
              padding: '20px 24px',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px' }}>{cat.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {cat.slug} · {cat.type}
                </p>
              </div>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)'
              }}>
                {cat.type}
              </p>
              <button
                onClick={() => toggleActive(cat)}
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  border: '1px solid',
                  borderColor: cat.isActive ? '#4ade80' : 'var(--color-border)',
                  color: cat.isActive ? '#4ade80' : 'var(--color-text-muted)',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                {cat.isActive ? 'Active' : 'Off'}
              </button>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                #{cat.displayOrder}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
