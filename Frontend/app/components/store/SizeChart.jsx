'use client'

import React, { useState } from 'react'

// Data exactly matching the reference image (provided in base cm/meters as shown)
const sizeData = [
  { size: 'S', acrossShoulder: 43.0, bottomOpening: 97.0, chest: 102.0, frontLength: 68.0, sleeveLength: 22.0 },
  { size: 'M', acrossShoulder: 45.0, bottomOpening: 102.0, chest: 107.0, frontLength: 70.0, sleeveLength: 23.0 },
  { size: 'L', acrossShoulder: 47.0, bottomOpening: 107.0, chest: 112.0, frontLength: 73.0, sleeveLength: 24.0 },
  { size: 'XL', acrossShoulder: 49.0, bottomOpening: 115.0, chest: 120.0, frontLength: 74.0, sleeveLength: 24.0 }
]

export default function SizeChart() {
  const [open, setOpen] = useState(false)
  const [isInch, setIsInch] = useState(false)
  const [selectedSize, setSelectedSize] = useState('S')

  // Convert centimeters to inches if toggled
  const formatValue = (val, field) => {
    const valueInCm = val;
    if (isInch) {
      return `${(valueInCm * 0.393701).toFixed(2)} in`
    }
    // Match the image formatting: Chest and certain lengths are displayed in meters when over 100cm
    if (valueInCm >= 100) {
      return `${(valueInCm / 100).toFixed(2)} m`
    }
    return `${valueInCm.toFixed(2)} cm`
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#666',
          textDecoration: 'underline',
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        View Size Chart
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'sans-serif'
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: '30px 40px',
              maxWidth: '1024px',
              width: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              position: 'relative',
              boxSizing: 'border-box'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 300, color: '#333' }}>Size Chart</h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#333' }}
              >
                ✕
              </button>
            </div>

            {/* Sub-Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
              <span style={{ color: '#b58e4f', fontSize: '14px' }}>Men Green Solid Stretch Fit Polo Neck T-Shirt</span>
              
              {/* Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <span style={{ color: !isInch ? '#000' : '#888', fontWeight: !isInch ? 'bold' : 'normal' }}>cm</span>
                <div 
                  onClick={() => setIsInch(!isInch)}
                  style={{
                    width: '40px',
                    height: '20px',
                    backgroundColor: '#e4d5b7',
                    borderRadius: '10px',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: isInch ? '22px' : '2px',
                    transition: 'left 0.2s ease'
                  }} />
                </div>
                <span style={{ color: isInch ? '#000' : '#888', fontWeight: isInch ? 'bold' : 'normal' }}>in</span>
              </div>
            </div>

            {/* Main Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '40px', alignItems: 'start' }}>
              
              {/* Left Column: Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px', fontSize: '13px', fontWeight: 400, color: '#666' }}>Size</th>
                      <th style={{ padding: '12px', fontSize: '13px', fontWeight: 400, color: '#666' }}>Across Shoulder</th>
                      <th style={{ padding: '12px', fontSize: '13px', fontWeight: 400, color: '#666' }}>Bottom Opening</th>
                      <th style={{ padding: '12px', fontSize: '13px', fontWeight: 400, color: '#666' }}>Chest</th>
                      <th style={{ padding: '12px', fontSize: '13px', fontWeight: 400, color: '#666' }}>Front Length</th>
                      <th style={{ padding: '12px', fontSize: '13px', fontWeight: 400, color: '#666' }}>Sleeve Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row) => {
                      const isSelected = selectedSize === row.size;
                      return (
                        <tr 
                          key={row.size} 
                          onClick={() => setSelectedSize(row.size)}
                          style={{ 
                            backgroundColor: isSelected ? '#f1f1f1' : 'transparent', 
                            cursor: 'pointer',
                            borderBottom: '1px solid #f5f5f5'
                          }}
                        >
                          {/* Radio Selector + Label */}
                          <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: '2px solid #cca43b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cca43b' }} />}
                            </div>
                            {row.size}
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#333' }}>{formatValue(row.acrossShoulder, 'acrossShoulder')}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#333' }}>{formatValue(row.bottomOpening, 'bottomOpening')}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#333' }}>{formatValue(row.chest, 'chest')}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#333' }}>{formatValue(row.frontLength, 'frontLength')}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#333' }}>{formatValue(row.sleeveLength, 'sleeveLength')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right Column: Visual Measurement Guide */}
              <div style={{ borderLeft: '1px solid #eee', paddingLeft: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 400, textDecoration: 'underline', width: '100%', textAlign: 'center' }}>Men T-Shirts</h3>
                
                {/* Front Diagram */}
                <div style={{ position: 'relative', width: '220px', height: '180px' }}>
                  <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" stroke="#333" strokeWidth="1">
                    {/* T Shirt Vector Silhouette */}
                    <path d="M 70 30 Q 100 42 130 30 L 170 55 L 150 90 L 135 80 L 135 170 L 65 170 L 65 80 L 50 90 L 30 55 Z" />
                    {/* Measurement Dashed Lines */}
                    <path d="M 33 53 L 167 53" strokeDasharray="3 3" />
                    <path d="M 65 95 L 135 95" strokeDasharray="3 3" />
                    <path d="M 65 168 L 135 168" strokeDasharray="3 3" />
                    <path d="M 115 37 L 115 168" strokeDasharray="3 3" />
                    <path d="M 33 53 L 50 90" strokeDasharray="3 3" />
                  </svg>
                  {/* Labels overlapping visual layout elements */}
                  <span style={{ position: 'absolute', top: '15%', right: '-10px', fontSize: '11px', textAlign: 'left' }}>Across<br/>shoulder</span>
                  <span style={{ position: 'absolute', top: '43%', right: '-5px', fontSize: '11px' }}>Chest</span>
                  <span style={{ position: 'absolute', top: '50%', left: '-15px', fontSize: '11px', textAlign: 'right' }}>Sleeve<br/>Length</span>
                  <span style={{ position: 'absolute', bottom: '25%', right: '-10px', fontSize: '11px', textAlign: 'left' }}>Front<br/>Length</span>
                  <span style={{ position: 'absolute', bottom: '5%', left: '-15px', fontSize: '11px', textAlign: 'right' }}>Bottom<br/>Opening</span>
                </div>

                {/* Back Diagram */}
                <div style={{ position: 'relative', width: '220px', height: '160px' }}>
                  <svg viewBox="0 0 200 180" width="100%" height="100%" fill="none" stroke="#333" strokeWidth="1">
                    <path d="M 70 32 Q 100 35 130 32 L 170 55 L 150 90 L 135 80 L 135 170 L 65 170 L 65 80 L 50 90 L 30 55 Z" />
                    <path d="M 100 34 L 100 170" strokeDasharray="3 3" />
                  </svg>
                  <span style={{ position: 'absolute', bottom: '40%', left: '-10px', fontSize: '11px', textAlign: 'right' }}>Centre<br/>Back<br/>Length</span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}