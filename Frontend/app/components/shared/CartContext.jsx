'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('lueuer_cart')
    if (saved) setCartItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('lueuer_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, variant, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.variantId === variant.id)
      if (existing) {
        return prev.map(item =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        id: Date.now(),
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: parseFloat(variant.priceOverride || product.basePrice),
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        image: product.images?.[0]?.imageUrl || product.thumbnailUrl,
        quantity
      }]
    })
  }

  const removeFromCart = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId))
  }

  const updateQuantity = (variantId, quantity) => {
    if (quantity < 1) return removeFromCart(variantId)
    setCartItems(prev =>
      prev.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setCartItems([])

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
