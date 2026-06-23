'use client'

import { useState, useEffect } from 'react'
import { adminGetAllOrders, getProducts } from '../../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          adminGetAllOrders({ limit: 1000 }),
          getProducts({ limit: 1 })
        ])

        const orders = ordersRes.data?.data?.orders || []
        const totalOrders = ordersRes.data?.data?.total || orders.length

        // Sum up total Amount for non-cancelled/non-refunded orders
        const totalSales = orders
          .filter(order => order.status !== 'cancelled' && order.status !== 'refunded')
          .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0)

        const activeProducts = productsRes.data?.data?.total || 0

        setStats({
          totalSales,
          totalOrders,
          activeProducts
        })
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val)
  }

  return (
    <div>
      <h1 className="admin-page-title">Admin Dashboard</h1>
      <p className="admin-page-subtitle">Welcome to the LUEUER control center.</p>
      
      {loading ? (
        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', marginTop: '20px' }}>Loading statistics...</p>
      ) : (
        <div className="admin-grid-3">
          <div className="admin-card">
            <h3 className="admin-card-title">Total Sales</h3>
            <p className="admin-card-value">{formatCurrency(stats.totalSales)}</p>
          </div>
          
          <div className="admin-card">
            <h3 className="admin-card-title">Total Orders</h3>
            <p className="admin-card-value">{stats.totalOrders}</p>
          </div>
          
          <div className="admin-card">
            <h3 className="admin-card-title">Active Products</h3>
            <p className="admin-card-value">{stats.activeProducts}</p>
          </div>
        </div>
      )}
    </div>
  )
}