'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { brandImages } from '../../../lib/images'

export default function Hero() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a cinematic entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Animate background image zoom-out entrance
      tl.fromTo('.hero-cinematic-bg', 
        { scale: 1.15, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 2.2, ease: 'power2.out' }
      )

      // Stagger animate text content entries
      tl.fromTo('.hero-cinematic-logo', 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2 }, 
        '-=1.7'
      )

      tl.fromTo('.hero-cinematic-title', 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.4 }, 
        '-=1.4'
      )

      tl.fromTo('.hero-cinematic-tagline', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2 }, 
        '-=1.1'
      )

      tl.fromTo('.hero-cinematic-actions', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2 }, 
        '-=0.9'
      )
    }, containerRef)

    return () => ctx.revert() // Cleanup GSAP animations
  }, [])

  return (
    <section ref={containerRef} className="hero-cinematic">
      <div className="hero-cinematic-left" aria-hidden="true" />

      <img
        src={brandImages.heroBackground}
        alt=""
        className="hero-cinematic-bg"
        aria-hidden="true"
        style={{ opacity: 0 }}
      />

      <div className="hero-cinematic-seam" aria-hidden="true" />

      <div className="hero-cinematic-content">
        <img
          src={brandImages.logo}
          alt="LUEUER"
          className="hero-cinematic-logo"
          style={{ opacity: 0 }}
        />

        <h1 className="hero-cinematic-title" style={{ opacity: 0 }}>
          Built from <em>Silence</em>
        </h1>

        <p className="hero-cinematic-tagline" style={{ opacity: 0 }}>
          Not for everyone. Made for purpose.
        </p>

        <div className="hero-cinematic-actions" style={{ opacity: 0 }}>
          <Link href="/shop" className="btn-ghost">
            Explore Collection
          </Link>
          <Link href="/about" className="hero-ethos-link">
            The Ethos
          </Link>
        </div>
      </div>
    </section>
  )
}
