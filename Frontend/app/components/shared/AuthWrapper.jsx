'use client'

import Navbar from './Navbar'

export default function AuthWrapper({ children }) {
  return (
    <>
      <Navbar />
      <main className="site-main">
        {children}
      </main>
    </>
  )
}
