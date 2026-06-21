'use client'

import { useState } from 'react'

export default function AdminBrandPage() {
  const [content, setContent] = useState({
    tagline: 'Built from Silence',
    motto: 'Not for everyone. For those who move in silence and let their presence speak. Premium streetwear, built different.',
    heroText: 'Silence speaks. So does the fabric.'
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="admin-page-title">Brand Content</h1>
        <p className="admin-page-subtitle">Manage LUEUER core motto and tagline messaging.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[
          { key: 'tagline', label: 'Tagline', placeholder: 'Built from Silence' },
          { key: 'motto', label: 'Brand Motto', placeholder: 'Full motto text...' },
          { key: 'heroText', label: 'Hero Text', placeholder: 'Homepage hero text...' }
        ].map(field => (
          <div key={field.key} className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">
              {field.label}
            </label>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder={field.placeholder}
              value={content[field.key]}
              onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        ))}

        <button
          className="admin-btn-primary"
          onClick={handleSave}
          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
