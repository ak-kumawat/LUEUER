'use client'

import { useState, useEffect } from 'react'
import { SignInButton, UserButton, useAuth, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from './CartContext'
import { brandImages } from '../../../lib/images'

// SVG Icons for Navigation
const HomeIcon = () => (
  <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ShopIcon = () => (
  <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" x2="21" y1="6" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const OrdersIcon = () => (
  <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" rx="1" />
    <line x1="10" x2="14" y1="12" y2="12" />
  </svg>
)

const ContactIcon = () => (
  <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const FAQIcon = () => (
  <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)

const WishlistIcon = () => (
  <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const CartIcon = () => (
  <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
)

const getLinkIcon = (label) => {
  switch (label) {
    case 'Home': return <HomeIcon />
    case 'Shop': return <ShopIcon />
    case 'My Orders': return <OrdersIcon />
    case 'Contact': return <ContactIcon />
    case 'FAQ': return <FAQIcon />
    case 'Wishlist': return <WishlistIcon />
    case 'Cart': return <CartIcon />
    default: return null
  }
}

const centerLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/orders', label: 'My Orders' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
]

const rightLinks = [
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/cart', label: 'Cart', showBadge: true },
]

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { itemCount } = useCart()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isAdmin = user?.publicMetadata?.role === 'admin'

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    if (path === '/shop') return pathname === '/shop' || pathname.startsWith('/product/')
    return pathname.startsWith(path)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const allMobileLinks = [...centerLinks, ...rightLinks]

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <nav className="site-nav" aria-label="Main navigation">
          {/* Left — Logo */}
          <Link href="/" className="site-nav-brand">
            <img src={brandImages.logo} alt="LURUER" className="site-nav-logo" />
            <div className="site-nav-brand-text">
              <span className="site-nav-name">LURUER</span>
              <span className="site-nav-tagline">LUXURY ESSENTIALS</span>
            </div>
          </Link>

          {/* Center — Main links (desktop) */}
          <div className="site-nav-center">
            {centerLinks.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {getLinkIcon(item.label)}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right — Actions (desktop) */}
          <div className="site-nav-right">
            {rightLinks.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav-link ${isActive(item.href) ? 'active' : ''}`}
                title={item.label}
              >
                {getLinkIcon(item.label)}
                {item.showBadge && itemCount > 0 && (
                  <span className="nav-cart-badge">{itemCount}</span>
                )}
              </Link>
            ))}

            {mounted && (
              isSignedIn ? (
                <div className="site-nav-auth">
                  {isAdmin && (
                    <Link href="/admin" className="site-nav-admin">
                      Admin
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="site-nav-login" type="button">
                    Login
                  </button>
                </SignInButton>
              )
            )}
          </div>

          {/* Mobile — cart + hamburger */}
          <div className="site-nav-mobile-actions">
            <Link href="/cart" className="site-nav-cart-mobile" title="Cart">
              {getLinkIcon('Cart')}
              {itemCount > 0 && <span className="nav-cart-badge">{itemCount}</span>}
            </Link>
            <button
              type="button"
              className={`site-nav-toggle ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`site-nav-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`site-nav-drawer ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        <div className="site-nav-drawer-header">
          <img src={brandImages.logo} alt="" className="site-nav-drawer-logo" />
          <div className="site-nav-brand-text">
            <span className="site-nav-name">LURUER</span>
            <span className="site-nav-tagline">Built from Silence</span>
          </div>
        </div>

        {allMobileLinks.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`site-nav-drawer-link ${isActive(item.href) ? 'active' : ''}`}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getLinkIcon(item.label)}
              <span>{item.label}</span>
            </span>
            {item.showBadge && itemCount > 0 && (
              <span className="nav-cart-badge">{itemCount}</span>
            )}
          </Link>
        ))}

        <div className="site-nav-drawer-footer">
          {mounted && (
            isSignedIn ? (
              <div className="site-nav-drawer-auth">
                {isAdmin && (
                  <Link href="/admin" className="site-nav-admin">
                    Admin Panel
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="btn-primary site-nav-drawer-login" type="button">
                  Login / Sign Up
                </button>
              </SignInButton>
            )
          )}
        </div>
      </aside>
    </>
  )
}
