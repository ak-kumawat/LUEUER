'use client'

import { useState } from 'react'
import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'

const faqs = [
  {
    q: 'What sizes do you offer?',
    a: 'LUEUER clothing is available in XS, S, M, L, XL, and XXL. Refer to our size guide on each product page for exact measurements in inches.'
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 5 to 7 business days across India. Express delivery options may be available at checkout.'
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 7 days of delivery for unworn, unwashed items with original tags intact. Contact us to initiate a return.'
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is shipped, you can track it through your Orders page. We update the status at every stage from confirmed to delivered.'
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Currently we accept online payments via Razorpay only. We support UPI, cards, net banking, and wallets.'
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach us through our Contact page or on Instagram @lueuer. We respond within 24 hours.'
  },
  {
    q: 'Are the products limited edition?',
    a: 'Yes. LUEUER operates on a limited drop model. Each collection is produced in limited quantities. Limited drop. Timeless impact.'
  },
  {
    q: 'What fabric is used?',
    a: 'All LUEUER pieces use premium quality fabrics selected for comfort, durability, and premium finish. Details are listed on each product page.'
  }
]

export default function FAQPage() {
  const [open, setOpen] = useState(null)

  return (
    <AuthWrapper>
      <div style={{ padding: '80px 24px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: '80px' }}>
            <p className="section-label" style={{ marginBottom: '16px' }}>
              Questions
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              FAQ
            </h1>
            <div className="divider" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '24px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <p style={{
                    fontSize: '14px',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text)',
                    fontWeight: 400
                  }}>
                    {faq.q}
                  </p>
                  <span style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '18px',
                    flexShrink: 0,
                    marginLeft: '16px',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease',
                    display: 'inline-block'
                  }}>
                    +
                  </span>
                </button>

                {open === i && (
                  <div style={{
                    padding: '0 32px 24px',
                    borderTop: '1px solid var(--color-border)'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      lineHeight: '1.8',
                      color: 'var(--color-text-secondary)',
                      paddingTop: '20px'
                    }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
