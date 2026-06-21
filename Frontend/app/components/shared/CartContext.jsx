'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../../../lib/api'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()

  const mapBackendItem = (item) => ({
    id: item.id, // Database CartItem id
    variantId: item.variantId,
    productId: item.variant.product.id,
    name: item.variant.product.name,
    slug: item.variant.product.slug,
    price: parseFloat(item.variant.priceOverride || item.variant.product.basePrice),
    size: item.variant.size,
    color: item.variant.color,
    colorHex: item.variant.colorHex,
    image: item.variant.product.images?.[0]?.imageUrl || item.variant.product.thumbnailUrl,
    quantity: item.quantity,
    dbId: item.id
  })

  // Synchronize cart with the database on load or when authentication state changes
  useEffect(() => {
    if (!isLoaded) return

    const sync = async () => {
      setSyncing(true)
      try {
        if (isSignedIn) {
          // If we have items in localStorage (guest cart), merge them to the backend database
          const saved = localStorage.getItem('lueuer_cart')
          const guestItems = saved ? JSON.parse(saved) : []

          if (guestItems.length > 0) {
            for (const item of guestItems) {
              await apiAddToCart({ variantId: item.variantId, quantity: item.quantity })
            }
            localStorage.removeItem('lueuer_cart')
          }

          // Fetch the consolidated database cart
          const res = await getCart()
          const dbCartItems = res.data?.data?.items || []
          setCartItems(dbCartItems.map(mapBackendItem))
        } else {
          // Not logged in: load guest cart from localStorage
          const saved = localStorage.getItem('lueuer_cart')
          if (saved) setCartItems(JSON.parse(saved))
        }
      } catch (err) {
        console.error("Cart synchronization failed:", err)
      } finally {
        setSyncing(false)
      }
    }

    sync()
  }, [isSignedIn, isLoaded])

  // Persist guest cart to localStorage when not signed in
  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      localStorage.setItem('lueuer_cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isSignedIn, isLoaded])

  const addToCart = async (product, variant, quantity = 1) => {
    const previousItems = [...cartItems]

    // Optimistic Update
    let newItems
    const existing = cartItems.find(item => item.variantId === variant.id)
    if (existing) {
      newItems = cartItems.map(item =>
        item.variantId === variant.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      const newItem = {
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
      }
      newItems = [...cartItems, newItem]
    }
    setCartItems(newItems)

    // Silent Background Synchronization
    if (isSignedIn) {
      try {
        await apiAddToCart({ variantId: variant.id, quantity })
        // Fetch cart to get database IDs
        const res = await getCart()
        const dbCartItems = res.data?.data?.items || []
        setCartItems(dbCartItems.map(mapBackendItem))
      } catch (err) {
        console.error("Background addToCart failed, rolling back:", err)
        setCartItems(previousItems)
        alert(err?.response?.data?.message || "Failed to add item to server cart. Reverting.")
      }
    }
  }

  const removeFromCart = async (variantId) => {
    const previousItems = [...cartItems]
    
    // Optimistic Update
    setCartItems(prev => prev.filter(item => item.variantId !== variantId))

    if (isSignedIn) {
      const targetItem = previousItems.find(item => item.variantId === variantId)
      if (targetItem && targetItem.dbId) {
        try {
          await apiRemoveFromCart(targetItem.dbId)
        } catch (err) {
          console.error("Background removeFromCart failed, rolling back:", err)
          setCartItems(previousItems)
          alert(err?.response?.data?.message || "Failed to remove item from server cart. Reverting.")
        }
      }
    }
  }

  const updateQuantity = async (variantId, quantity) => {
    if (quantity < 1) return removeFromCart(variantId)

    const previousItems = [...cartItems]

    // Optimistic Update
    setCartItems(prev =>
      prev.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    )

    if (isSignedIn) {
      const targetItem = previousItems.find(item => item.variantId === variantId)
      if (targetItem && targetItem.dbId) {
        try {
          await apiUpdateCartItem(targetItem.dbId, { quantity })
        } catch (err) {
          console.error("Background updateQuantity failed, rolling back:", err)
          setCartItems(previousItems)
          alert(err?.response?.data?.message || "Failed to update quantity on server. Reverting.")
        }
      }
    }
  }

  const clearCart = async () => {
    const previousItems = [...cartItems]
    setCartItems([])

    if (isSignedIn) {
      try {
        await apiClearCart()
      } catch (err) {
        console.error("Background clearCart failed, rolling back:", err)
        setCartItems(previousItems)
        alert(err?.response?.data?.message || "Failed to clear server cart. Reverting.")
      }
    }
  }

  const total = cartItems.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0
    const itemQty = parseInt(item.quantity) || 0
    return sum + (itemPrice * itemQty)
  }, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      syncing,
      isMiniCartOpen,
      setIsMiniCartOpen
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
