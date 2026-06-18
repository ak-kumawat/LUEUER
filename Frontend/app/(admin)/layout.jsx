'use client'

import Link from 'next/link'
import { UserButton, useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthToken } from '../../lib/api'

export default function AdminLayout({ children }) {

  
  const { getToken, isLoaded, isSignedIn } = useAuth()
  
  useEffect(() => {
    const fetchToken = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken()
        setAuthToken(token)
      } else if (isLoaded && !isSignedIn) {
        setAuthToken(null)
      }
    }
    fetchToken()
  }, [isLoaded, isSignedIn, getToken])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', borderRight: '1px solid #222', padding: '30px' }}>
        <h2 style={{ marginBottom: '40px', fontSize: '22px', letterSpacing: '3px' }}>LUEUER ADMIN</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Link href="/admin" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>Dashboard</Link>
          <Link href="/admin/categories" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>Categories</Link>
          <Link href="/admin/products" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>Products</Link>
          <Link href="/admin/orders" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>Orders</Link>
          <Link href="/admin/brand" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>Brand Assets</Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>â†  Back to Store</Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 40px', borderBottom: '1px solid #111' }}>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}