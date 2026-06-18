'use client'

import { useEffect, useRef } from 'react'
import { Diamond, Crown, ShieldCheck, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

const values = [
  {
    icon: <Diamond size={28} strokeWidth={1.2} />,
    title: 'Premium Quality',
    description: 'Every piece crafted with the finest materials for lasting wear.'
  },
  {
    icon: <Crown size={28} strokeWidth={1.2} />,
    title: 'Timeless Design',
    description: 'Beyond trends. Built for those who define their own aesthetic.'
  },
  {
    icon: <ShieldCheck size={28} strokeWidth={1.2} />,
    title: 'Built to Last',
    description: 'Durability is not a feature. It is our foundation.'
  },
  {
    icon: <Sparkles size={28} strokeWidth={1.2} />,
    title: 'Made to Stand Out',
    description: 'Quietly. Confidently. Without explanation.'
  }
]

export default function BentoCards() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the headers on scroll
      gsap.fromTo('.bento-header-anim', 
        { opacity: 0, y: 30 },
        {
          scrollTrigger: {
            trigger: '.bento-header-anim',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out'
        }
      )

      // Stagger fade-in + lift for the bento grid cards on scroll
      gsap.fromTo('.bento-card', 
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.2,
          ease: 'power3.out'
        }
      )
    }, containerRef)

    return () => ctx.revert() // Cleanup on unmount
  }, [])

  return (
    <section ref={containerRef} className="surface-dark section-padding">
      <div className="container">
        <div className="bento-header-anim" style={{ marginBottom: '60px', textAlign: 'center', opacity: 0 }}>
          <p className="section-label">Our Standards</p>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            letterSpacing: '0.04em',
          }}>
            No Compromises.
          </h2>
          <div className="divider" style={{ margin: '24px auto' }} />
        </div>

        <div className="bento-grid">
          {values.map((val, idx) => (
            <div key={idx} className="bento-card" style={{ opacity: 0 }}>
              <div className="bento-icon">{val.icon}</div>
              <h3 className="bento-title">{val.title}</h3>
              <p className="bento-desc">{val.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
