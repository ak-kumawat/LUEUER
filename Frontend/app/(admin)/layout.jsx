'use client'

import Link from 'next/link'
import { UserButton, useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { setAuthToken, setTokenFetcher } from '../../lib/api'

export default function AdminLayout({ children }) {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthLoaded && isSignedIn) {
        const token = await getToken()
        setAuthToken(token)
        setTokenFetcher(getToken)
      } else if (isAuthLoaded && !isSignedIn) {
        setAuthToken(null)
        setTokenFetcher(null)
      }
    }
    fetchToken()
  }, [isAuthLoaded, isSignedIn, getToken])

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded) {
      if (isSignedIn && user?.publicMetadata?.role === 'admin') {
        setIsAuthorized(true)
      } else {
        router.push('/')
      }
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router])

  if (!isAuthLoaded || !isUserLoaded || !isAuthorized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#0a0a0a', 
        color: '#fff',
        fontFamily: 'sans-serif',
        fontSize: '16px',
        letterSpacing: '0.05em'
      }}>
        <div>Verifying Admin Privileges...</div>
      </div>
    )
  }


  const isActive = (path) => pathname === path

  return (
    <div className="admin-layout-wrapper">
      {/* Mobile Top Header */}
      <div className="admin-mobile-header">
        <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
          <svg viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Link href="/admin" className="admin-mobile-brand">
          LUEUER ADMIN
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Sidebar Overlay Backdrop */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 className="admin-sidebar-logo" style={{ marginBottom: 0 }}>LUEUER ADMIN</h2>
          {/* Close button inside sidebar on mobile */}
          <button 
            className="admin-menu-toggle admin-menu-close-btn" 
            onClick={() => setSidebarOpen(false)}
            style={{ padding: 4 }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: '#888' }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <nav className="admin-sidebar-nav">
          <Link 
            href="/admin" 
            className={`admin-sidebar-link ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/categories" 
            className={`admin-sidebar-link ${isActive('/admin/categories') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            Categories
          </Link>
          <Link 
            href="/admin/products" 
            className={`admin-sidebar-link ${isActive('/admin/products') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            Products
          </Link>
          <Link 
            href="/admin/orders" 
            className={`admin-sidebar-link ${isActive('/admin/orders') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            Orders
          </Link>
          <Link 
            href="/admin/brand" 
            className={`admin-sidebar-link ${isActive('/admin/brand') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            Brand Assets
          </Link>
        </nav>
        
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-backlink">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content-area">
        <header className="admin-header">
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="admin-container">
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (min-width: 1025px) {
          .admin-menu-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 1024px) {
          .admin-menu-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}