'use client'

import AuthWrapper from '../shared/AuthWrapper'

export default function Navbar({ children }) {
  return <AuthWrapper>{children}</AuthWrapper>
}
