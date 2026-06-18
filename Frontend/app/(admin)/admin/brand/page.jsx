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
    <div style={{ padding: '40px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '48px' }}>
        <p className="section-label" style={{ marginBottom: '12px' }}>Manage</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 300 }}>
          Brand Content
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {[
          { key: 'tagline', label: 'Tagline', placeholder: 'Built from Silence' },
          { key: 'motto', label: 'Brand Motto', placeholder: 'Full motto text...' },
          { key: 'heroText', label: 'Hero Text', placeholder: 'Homepage hero text...' }
        ].map(field => (
          <div key={field.key}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              {field.label}
            </p>
            <textarea
              rows={3}
              placeholder={field.placeholder}
              value={content[field.key]}
              onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        ))}

        <button
          className="btn-primary"
          onClick={handleSave}
          style={{ alignSelf: 'flex-start', padding: '14px 40px' }}
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
