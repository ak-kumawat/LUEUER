import Link from 'next/link'
import { brandImages } from '../../../lib/images'

// SVG Icons for Footer Link Categories
const HomeIcon = () => (
  <svg className="footer-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ShopIcon = () => (
  <svg className="footer-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" x2="21" y1="6" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const OrdersIcon = () => (
  <svg className="footer-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" rx="1" />
    <line x1="10" x2="14" y1="12" y2="12" />
  </svg>
)

const HelpIcon = () => (
  <svg className="footer-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)

// Contact Info Icons
const PhoneIcon = () => (
  <svg className="footer-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg className="footer-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const ClockIcon = () => (
  <svg className="footer-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// Social Media Icons
const InstagramIcon = () => (
  <svg className="footer-social-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const YoutubeIcon = () => (
  <svg className="footer-social-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.7 15 9.7 9 14.5 12 9.7 15" />
  </svg>
)

const LinkedinIcon = () => (
  <svg className="footer-social-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="surface-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <img
              src={brandImages.logo}
              alt="LUEUER"
              className="footer-brand-logo"
            />
            <h3 className="footer-brand-name">LUEUER</h3>
            <p className="footer-brand-desc">
              Built from Silence. Not for everyone. For those who move in silence and let their presence speak.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="footer-section-label">QUICK LINKS</p>
            <div className="footer-links-container">
              <Link href="/" className="footer-link">
                <HomeIcon />
                <span>Home</span>
              </Link>
              <Link href="/shop" className="footer-link">
                <ShopIcon />
                <span>Shop</span>
              </Link>
              <Link href="/orders" className="footer-link">
                <OrdersIcon />
                <span>My Orders</span>
              </Link>
              <Link href="/contact" className="footer-link">
                <HelpIcon />
                <span>Support</span>
              </Link>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <p className="footer-section-label">CONTACT</p>
            <div className="footer-contact-container">
              <div className="footer-contact-item">
                <PhoneIcon />
                <span>+91 8441020977</span>
              </div>
              <div className="footer-contact-item">
                <MailIcon />
                <span>luerer.world@gmail.com</span>
              </div>
              <div className="footer-contact-item">
                <ClockIcon />
                <span>Open 24 HR</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p className="footer-section-label">FOLLOW US</p>
            <div className="footer-links-container">
              <a href="https://www.instagram.com/lueuer.world/" target="_blank" rel="noopener noreferrer" className="footer-link">
                <InstagramIcon />
                <span>Instagram</span>
              </a>
              <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="footer-link">
                <YoutubeIcon />
                <span>YouTube</span>
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="footer-link">
                <LinkedinIcon />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="footer-bottom-wrapper">
          <div className="footer-bottom">
            <p>© 2026 LUEUER . All rights reserved.</p>
            <p className="footer-taglines">Made in India</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
