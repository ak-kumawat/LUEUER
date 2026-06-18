import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { CartProvider } from './components/shared/CartContext'

export const metadata = {
  title: 'LUEUER — Built from Silence',
  description: 'Not for everyone. For those who move in silence and let their presence speak. Premium streetwear, built different.',
  keywords: 'LUEUER, premium streetwear, luxury clothing, built from silence',
  icons: {
    icon: [
      { url: '/favicon.jpg', type: 'image/jpeg' },
    ],
    apple: '/images/brand.jpg',
  },
  openGraph: {
    title: 'LUEUER — Built from Silence',
    description: 'Premium streetwear. Built different.',
    url: 'https://lueuer.world',
    siteName: 'LUEUER',
    type: 'website'
  }
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CartProvider>
            {children}
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
