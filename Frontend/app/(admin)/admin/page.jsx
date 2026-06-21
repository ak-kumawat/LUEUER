'use client'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="admin-page-title">Admin Dashboard</h1>
      <p className="admin-page-subtitle">Welcome to the LUEUER control center.</p>
      
      <div className="admin-grid-3">
        <div className="admin-card">
          <h3 className="admin-card-title">Total Sales</h3>
          <p className="admin-card-value">$0.00</p>
        </div>
        
        <div className="admin-card">
          <h3 className="admin-card-title">Total Orders</h3>
          <p className="admin-card-value">0</p>
        </div>
        
        <div className="admin-card">
          <h3 className="admin-card-title">Active Products</h3>
          <p className="admin-card-value">0</p>
        </div>
      </div>
    </div>
  )
}