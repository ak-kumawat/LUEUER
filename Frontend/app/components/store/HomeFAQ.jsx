'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    q: 'What sizes do you offer?',
    a: 'LUEUER clothing is available in XS, S, M, L, XL, and XXL. Refer to our size guide on each product page for exact measurements.'
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
    q: 'Are the products limited edition?',
    a: 'Yes. LUEUER operates on a limited drop model. Each collection is produced in limited quantities. Limited drop. Timeless impact.'
  },
  {
    q: 'What fabric is used?',
    a: 'All LUEUER pieces use premium quality fabrics selected for comfort, durability, and premium finish. Details are listed on each product page.'
  }
]

export default function HomeFAQ() {
  const [open, setOpen] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo('.faq-header-anim',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.faq-header-anim',
            start: 'top 85%'
          }
        }
      )

      // Accordion Items staggered entry
      gsap.fromTo('.faq-item-anim',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.faq-list-anim',
            start: 'top 80%'
          }
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="surface-dark section-padding" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        
        {/* Header */}
        <div className="faq-header-anim" style={{ marginBottom: '60px', textAlign: 'center', opacity: 0 }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: '#ffffff'
          }}>
            Frequently Asked Questions
          </h2>
          <p className="section-label">Everything you need to know, 
nothing you don't.</p>
          <div className="divider" style={{ margin: '24px auto' }} />
        </div>

        {/* FAQ List */}
        <div className="faq-list-anim" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="faq-item-anim"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                opacity: 0
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
                  fontWeight: 400,
                  margin: 0
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

              {/* Accordion panel slide-down feel */}
              <div style={{
                maxHeight: open === i ? '200px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                borderTop: open === i ? '1px solid var(--color-border)' : 'none'
              }}>
                <div style={{ padding: '24px 32px' }}>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.8',
                    color: 'var(--color-text-secondary)',
                    margin: 0
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
