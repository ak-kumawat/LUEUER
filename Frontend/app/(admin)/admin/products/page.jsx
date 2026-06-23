'use client'

import { useState, useEffect } from 'react'
import { getProducts, adminCreateProduct, uploadImage, getCategories, adminUpdateProduct, adminDeleteProduct } from '../../../../lib/api'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingVariantId, setEditingVariantId] = useState(null)

  // New advanced form states
  const [form, setForm] = useState({ 
    name: '', slug: '', description: '', basePrice: 0, sku: ''
  })
  const [tagline, setTagline] = useState('')
  const [defaultRating, setDefaultRating] = useState(4.8)
  const [imagesList, setImagesList] = useState([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  
  // Single Variant States
  const [size, setSize] = useState('M')
  const [color, setColor] = useState('Carbon Black')
  const [colorHex, setColorHex] = useState('#121212')
  const [stockQuantity, setStockQuantity] = useState(0)

  const handleEditProduct = (p) => {
    const firstVariant = p.variants?.[0]
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      basePrice: p.basePrice || 0,
      sku: firstVariant?.sku || ''
    })
    setTagline(p.tagline || '')
    setDefaultRating(p.defaultRating || 4.8)
    setImagesList(p.images?.map(img => img.imageUrl) || [])
    setSelectedCategoryIds(p.categories?.map(c => c.categoryId || c.category?.id) || [])
    setSize(firstVariant?.size || 'M')
    setColor(firstVariant?.color || 'Carbon Black')
    setColorHex(firstVariant?.colorHex || '#121212')
    setStockQuantity(firstVariant?.stockQuantity || 0)
    setEditingProductId(p.id)
    setEditingVariantId(firstVariant?.id || null)
    setShowForm(true)
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ all: true })
      setProducts(res.data?.data?.products || [])
    } catch (err) {}
  }

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res.data?.data || [])
    } catch (err) {}
  }

  const handleToggleActive = async (product) => {
    try {
      await adminUpdateProduct(product.id, { isActive: !product.isActive })
      fetchProducts()
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update product status")
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await adminDeleteProduct(productId)
      fetchProducts()
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete product")
    }
  }

  // Handle uploading multiple image files to Cloudinary sequentially
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (imagesList.length + files.length > 7) {
      alert(`Upload rejected. Adding ${files.length} more images would exceed the maximum limit of 7 images (currently uploaded: ${imagesList.length}).`)
      return
    }

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await uploadImage(formData)
        uploadedUrls.push(res.data.data.url)
      } catch (err) {
        alert(`Failed to upload image: ${file.name}`)
      }
    }

    setImagesList(prev => [...prev, ...uploadedUrls])
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.slug || !form.description || !form.basePrice) {
      alert("Name, slug, description and base price are required")
      return
    }

    if (!size) {
      alert("Please select a size")
      return
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      tagline: tagline || undefined,
      basePrice: parseFloat(form.basePrice),
      defaultRating: parseFloat(defaultRating) || 4.8,
      categoryIds: selectedCategoryIds,
      variants: [{
        id: editingVariantId || undefined,
        size,
        color: color || "Carbon Black",
        colorHex: colorHex || "#121212",
        stockQuantity: parseInt(stockQuantity) || 0,
        sku: form.sku || undefined
      }],
      imageUrls: imagesList
    }

    try {
      if (editingProductId) {
        await adminUpdateProduct(editingProductId, payload)
      } else {
        await adminCreateProduct(payload)
      }
      setShowForm(false)
      fetchProducts()
      
      // Reset form states
      setForm({ name: '', slug: '', description: '', basePrice: 0, sku: '' })
      setTagline('')
      setDefaultRating(4.8)
      setImagesList([])
      setSelectedCategoryIds([])
      setSize('M')
      setColor('Carbon Black')
      setColorHex('#121212')
      setStockQuantity(0)
      setEditingProductId(null)
      setEditingVariantId(null)
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save product")
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">Manage LUEUER inventory items, variants, and media.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => {
          if (showForm) {
            setForm({ name: '', slug: '', description: '', basePrice: 0, sku: '' })
            setTagline('')
            setDefaultRating(4.8)
            setImagesList([])
            setSelectedCategoryIds([])
            setSize('M')
            setColor('Carbon Black')
            setColorHex('#121212')
            setStockQuantity(0)
            setEditingProductId(null)
            setEditingVariantId(null)
          }
          setShowForm(!showForm)
        }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--admin-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {editingProductId ? 'Edit Product' : 'New Product'}
          </h3>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Product Name</label>
            <input className="admin-input" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">URL Slug</label>
            <input className="admin-input" placeholder="URL Slug (e.g. vintage-tee)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Tagline</label>
            <input className="admin-input" placeholder="Tagline (e.g. Silence speaks. So does the fabric.)" value={tagline} onChange={e => setTagline(e.target.value)} />
          </div>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Product Description</label>
            <textarea className="admin-textarea" placeholder="Product Description..." rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Base Price (INR)</label>
              <input className="admin-input" placeholder="Base Price" type="number" value={form.basePrice || ''} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value)})} />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Default Rating</label>
              <input className="admin-input" placeholder="Default Rating (1.0 to 5.0)" type="number" step="0.1" min="1" max="5" value={defaultRating} onChange={e => setDefaultRating(parseFloat(e.target.value))} />
            </div>
          </div>

          {/* Category Dropdown/Checkboxes Selection */}
          <div style={{ marginBottom: '24px', border: '1px solid var(--admin-border)', padding: '20px', background: '#050505', borderRadius: '4px' }}>
            <p className="admin-form-label" style={{ marginBottom: '16px' }}>Categories</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedCategoryIds([...selectedCategoryIds, cat.id])
                      } else {
                        setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id))
                      }
                    }}
                    style={{ accentColor: 'var(--admin-accent)' }}
                  />
                  {cat.name} <span style={{ color: 'var(--admin-text-secondary)', fontSize: '11px' }}>({cat.type})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Variant Specifications (Size, Color, Stock, SKU) */}
          <div style={{ marginBottom: '24px', border: '1px solid var(--admin-border)', padding: '20px', background: '#050505', borderRadius: '4px' }}>
            <p className="admin-form-label" style={{ marginBottom: '16px' }}>Product Variant Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Size</label>
                <select 
                  className="admin-input" 
                  value={size} 
                  onChange={e => setSize(e.target.value)}
                  style={{ background: '#000', color: '#fff', border: '1px solid var(--admin-border)', height: '40px' }}
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Color Name</label>
                <input 
                  className="admin-input" 
                  placeholder="e.g. Carbon Black" 
                  value={color} 
                  onChange={e => setColor(e.target.value)} 
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Color Hex Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className="admin-input" 
                    type="color" 
                    value={colorHex} 
                    onChange={e => setColorHex(e.target.value)} 
                    style={{ width: '40px', padding: 0, height: '40px', border: 'none', cursor: 'pointer' }}
                  />
                  <input 
                    className="admin-input" 
                    placeholder="#121212" 
                    value={colorHex} 
                    onChange={e => setColorHex(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Stock Quantity</label>
                <input 
                  className="admin-input" 
                  type="number" 
                  placeholder="Stock quantity" 
                  value={stockQuantity} 
                  onChange={e => setStockQuantity(parseInt(e.target.value) || 0)} 
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">SKU (Optional)</label>
                <input 
                  className="admin-input" 
                  placeholder="Auto-generated if empty" 
                  value={form.sku} 
                  onChange={e => setForm({ ...form, sku: e.target.value })} 
                />
              </div>

            </div>
          </div>

          {/* Image Upload Area */}
          <div style={{ marginBottom: '30px', padding: '24px', border: '1px dashed var(--admin-border-light)', borderRadius: '4px', background: '#050505' }}>
            <p className="admin-form-label" style={{ marginBottom: '12px' }}>Product Images (Upload Multiple — Max 7, current: {imagesList.length}/7)</p>
            <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} disabled={imagesList.length >= 7} style={{ display: 'block', marginBottom: '16px', fontSize: '12px', color: 'var(--admin-text-secondary)' }} />
            {uploading && <span style={{ color: 'var(--admin-accent)', fontSize: '12px', display: 'block', marginBottom: '12px' }}>Uploading to Cloudinary...</span>}
            {imagesList.length >= 7 && <span style={{ color: 'var(--admin-accent)', fontSize: '11px', display: 'block', marginBottom: '12px' }}>Maximum limit of 7 images reached. Delete some to add new ones.</span>}
            
            {imagesList.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                {imagesList.map((url, idx) => (
                  <div key={url} style={{ position: 'relative', border: '1px solid var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={url} alt={`Preview ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setImagesList(imagesList.filter(item => item !== url))
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      title="Delete image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="admin-btn-primary" onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Uploading Images...' : (editingProductId ? 'Update Product' : 'Save Product')}
          </button>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Size</th>
              <th>Color</th>
              <th style={{ width: '100px' }}>Stock</th>
              <th style={{ width: '110px' }}>Status</th>
              <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const firstVariant = p.variants?.[0]
              return (
                <tr key={p.id}>
                  <td>
                    <img src={p.thumbnailUrl || 'https://via.placeholder.com/50'} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--admin-border)' }} alt="" />
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>{firstVariant?.sku || 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '2px 6px',
                      border: '1px solid var(--admin-border)',
                      fontSize: '11px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '2px'
                    }}>
                      {firstVariant?.size || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {firstVariant?.colorHex && (
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: firstVariant.colorHex,
                          border: '1px solid var(--admin-border)',
                          display: 'inline-block'
                        }} />
                      )}
                      <span>{firstVariant?.color || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{firstVariant?.stockQuantity || 0}</td>
                <td>
                  <span className="admin-badge" style={{
                    borderColor: p.isActive ? 'var(--admin-accent)' : 'var(--admin-border-light)',
                    color: p.isActive ? '#000000' : 'var(--admin-text-secondary)',
                    backgroundColor: p.isActive ? 'var(--admin-accent)' : 'transparent',
                    padding: '2px 8px',
                    fontSize: '9px',
                    width: '80px',
                    textAlign: 'center',
                    justifyContent: 'center',
                    display: 'block'
                  }}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => handleToggleActive(p)}
                    className="admin-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '10px', marginRight: '8px' }}
                  >
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEditProduct(p)}
                    className="admin-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '10px', marginRight: '8px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="admin-btn-danger"
                    style={{ padding: '6px 12px', fontSize: '10px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}