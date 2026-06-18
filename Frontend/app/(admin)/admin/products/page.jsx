'use client'

import { useState, useEffect } from 'react'
import { getProducts, adminCreateProduct, uploadImage } from '../../../../lib/api'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Notice we now match the backend schema exactly (basePrice, description, thumbnailUrl)
  const [form, setForm] = useState({ 
    name: '', slug: '', description: '', basePrice: 0, stock: 0, thumbnailUrl: '' 
  })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await getProducts()
      setProducts(res.data?.data?.products || [])
    } catch (err) {}
  }

  // Handle Image Upload to Cloudinary via your Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await uploadImage(formData)
      // Save the secure Cloudinary URL to the form
      setForm({ ...form, thumbnailUrl: res.data.data.url })
    } catch (err) {
      alert("Image upload failed. Have you added your Cloudinary keys to the Backend .env?")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      await adminCreateProduct(form)
      setShowForm(false)
      fetchProducts()
      setForm({ name: '', slug: '', description: '', basePrice: 0, stock: 0, thumbnailUrl: '' })
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add product")
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', letterSpacing: '1px' }}>Products</h1>
        <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #222', padding: '30px', marginBottom: '30px', background: '#0a0a0a', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '20px', color: '#888' }}>New Product</h3>
          
          <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ display: 'block', marginBottom: '15px', width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff' }} />
          <input placeholder="URL Slug (e.g. vintage-tee)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} style={{ display: 'block', marginBottom: '15px', width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff' }} />
          
          {/* New Description Field */}
          <textarea placeholder="Product Description..." rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ display: 'block', marginBottom: '15px', width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', resize: 'vertical' }} />

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input placeholder="Base Price" type="number" value={form.basePrice || ''} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value)})} style={{ flex: 1, padding: '12px', background: '#111', border: '1px solid #333', color: '#fff' }} />
            <input placeholder="Stock Quantity" type="number" value={form.stock || ''} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} style={{ flex: 1, padding: '12px', background: '#111', border: '1px solid #333', color: '#fff' }} />
          </div>

          {/* Image Upload Area */}
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px dashed #444', borderRadius: '4px' }}>
            <p style={{ color: '#888', marginBottom: '10px' }}>Product Image</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'block', marginBottom: '10px' }} />
            {uploading && <span style={{ color: '#00cc66' }}>Uploading to Cloudinary...</span>}
            {form.thumbnailUrl && !uploading && (
               <img src={form.thumbnailUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }} />
            )}
          </div>

          <button className="btn-primary" style={{ padding: '12px 30px' }} onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Uploading Image...' : 'Save Product'}
          </button>
        </div>
      )}

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ padding: '16px', color: '#777' }}>Image</th>
            <th style={{ padding: '16px', color: '#777' }}>Name</th>
            <th style={{ padding: '16px', color: '#777' }}>Price</th>
            <th style={{ padding: '16px', color: '#777' }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '16px' }}>
                <img src={p.thumbnailUrl || 'https://via.placeholder.com/50'} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
              </td>
              <td style={{ padding: '16px' }}>{p.name}</td>
              <td style={{ padding: '16px' }}>${p.basePrice}</td>
              <td style={{ padding: '16px' }}>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}