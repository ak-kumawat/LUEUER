'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setAuthToken, setTokenFetcher } from '../../../lib/api'
import Navbar from './Navbar'
import gsap from 'gsap'

export default function AuthWrapper({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [tokenLoaded, setTokenLoaded] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    const fetchToken = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken()
        setAuthToken(token)
        setTokenFetcher(getToken)
        setTokenLoaded(true)
      } else if (isLoaded && !isSignedIn) {
        setAuthToken(null)
        setTokenFetcher(null)
        setTokenLoaded(true)
      }
    }
    fetchToken()
  }, [isLoaded, isSignedIn, getToken])

  useEffect(() => {
    if (!tokenLoaded || !mainRef.current) return

    // Set initial state
    gsap.set(mainRef.current, { opacity: 0, y: 12 })

    // Animate in
    gsap.to(mainRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.05
    })
  }, [tokenLoaded])

  return (
    <>
      <Navbar />
      <main ref={mainRef} className="site-main" style={{ opacity: 0 }}>
        {tokenLoaded && children}
      </main>
    </>
  )
}
