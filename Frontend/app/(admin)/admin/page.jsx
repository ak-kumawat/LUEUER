'use client'

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '10px', letterSpacing: '1px' }}>Admin Dashboard</h1>
      <p style={{ color: '#888', marginBottom: '40px' }}>Welcome to the LUEUER control center.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div style={{ padding: '30px', border: '1px solid #222', borderRadius: '4px', background: '#0a0a0a' }}>
          <h3 style={{ color: '#777', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Sales</h3>
          <p style={{ fontSize: '32px', fontWeight: '500' }}>$0.00</p>
        </div>
        
        <div style={{ padding: '30px', border: '1px solid #222', borderRadius: '4px', background: '#0a0a0a' }}>
          <h3 style={{ color: '#777', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Orders</h3>
          <p style={{ fontSize: '32px', fontWeight: '500' }}>0</p>
        </div>
        
        <div style={{ padding: '30px', border: '1px solid #222', borderRadius: '4px', background: '#0a0a0a' }}>
          <h3 style={{ color: '#777', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Products</h3>
          <p style={{ fontSize: '32px', fontWeight: '500' }}>0</p>
        </div>
      </div>
    </div>
  )
}