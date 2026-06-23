'use client'

import { useState, useEffect } from 'react'
import { getCategories, adminCreateCategory, adminUpdateCategory } from '../../../../lib/api'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [form, setForm] = useState({
    name: '', slug: '', type: 'cloth_type', description: '', displayOrder: 0, baseWeight: 0.2
  })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories((res.data?.data || []).filter(c => c.type === 'cloth_type'))
    } catch { } finally { setLoading(false) }
  }

  const generateSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()

  const handleEditCategory = (cat) => {
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      type: cat.type || 'cloth_type',
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      baseWeight: cat.baseWeight || 0.2
    })
    setEditingCategoryId(cat.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name)
      }

      if (editingCategoryId) {
        await adminUpdateCategory(editingCategoryId, payload)
      } else {
        await adminCreateCategory(payload)
      }

      setForm({ name: '', slug: '', type: 'cloth_type', description: '', displayOrder: 0, baseWeight: 0.2 })
      setEditingCategoryId(null)
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
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">Manage LUEUER product classifications.</p>
        </div>
        <button
          className="admin-btn-primary"
          onClick={() => {
            if (showForm) {
              setForm({ name: '', slug: '', type: 'cloth_type', description: '', displayOrder: 0, baseWeight: 0.2 })
              setEditingCategoryId(null)
            }
            setShowForm(!showForm)
          }}
        >
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '560px'
        }}>
          <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--admin-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {editingCategoryId ? 'Edit Category' : 'New Category'}
          </h3>
          
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Category Name</label>
            <input
              className="admin-input"
              placeholder="Category name"
              value={form.name}
              onChange={e => setForm(f => ({
                ...f,
                name: e.target.value,
                slug: generateSlug(e.target.value)
              }))}
            />
          </div>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Slug</label>
            <input
              className="admin-input"
              placeholder="Slug"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Description (SEO)</label>
            <input
              className="admin-input"
              placeholder="Description (SEO)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Base Weight (kg)</label>
            <input
              className="admin-input"
              type="number"
              step="0.01"
              placeholder="0.2"
              value={form.baseWeight}
              onChange={e => setForm(f => ({ ...f, baseWeight: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Display Order</label>
            <input
              className="admin-input"
              type="number"
              placeholder="Display order"
              value={form.displayOrder}
              onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <button className="admin-btn-primary" onClick={handleSubmit} style={{ marginTop: '8px' }}>
            {editingCategoryId ? 'Update Category' : 'Save Category'}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--admin-text-secondary)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '20px 24px',
              background: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '4px'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px', color: '#fff' }}>{cat.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                  {cat.slug} {cat.baseWeight !== undefined && cat.baseWeight !== null ? `· ${cat.baseWeight} kg` : ''}
                </p>
              </div>
              <div style={{ flex: '0 0 120px' }}>
                <span className="admin-badge" style={{ borderColor: 'var(--admin-border-light)', color: 'var(--admin-text-secondary)', display: 'inline-block', textAlign: 'center', width: '100%' }}>
                  {cat.type}
                </span>
              </div>
              <div style={{ flex: '0 0 180px', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  onClick={() => toggleActive(cat)}
                  className="admin-badge"
                  style={{
                    borderColor: cat.isActive ? '#F5E7C6' : 'var(--admin-border-light)',
                    color: cat.isActive ? '#000000' : 'var(--admin-text-secondary)',
                    backgroundColor: cat.isActive ? '#F5E7C6' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    display: 'block'
                  }}
                >
                  {cat.isActive ? 'Active' : 'Off'}
                </button>
                <button
                  onClick={() => handleEditCategory(cat)}
                  className="admin-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '10px' }}
                >
                  Edit
                </button>
              </div>
              <div style={{ flex: '0 0 40px', textAlign: 'right' }}>
                <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                  #{cat.displayOrder}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
