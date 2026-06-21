'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setAuthToken, setTokenFetcher } from '../../../lib/api'
import Navbar from './Navbar'

export default function AuthWrapper({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    const fetchToken = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken()
        setAuthToken(token)
        setTokenFetcher(getToken)
      } else if (isLoaded && !isSignedIn) {
        setAuthToken(null)
        setTokenFetcher(null)
      }
    }
    fetchToken()
  }, [isLoaded, isSignedIn, getToken])

  return (
    <>
      <Navbar />
      <main className="site-main">
        {children}
      </main>
    </>
  )
}
