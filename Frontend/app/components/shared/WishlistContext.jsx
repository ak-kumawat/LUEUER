'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist, setTokenFetcher, setAuthToken } from '../../../lib/api'

const WishlistContext = createContext(null)

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [syncing, setSyncing] = useState(false)
  const { isSignedIn, isLoaded, getToken } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    const sync = async () => {
      setSyncing(true)
      try {
        if (isSignedIn) {
          setTokenFetcher(getToken)
          const token = await getToken()
          setAuthToken(token)

          const res = await getWishlist()
          setWishlistItems(res.data?.data || [])
        } else {
          // Not logged in: load guest wishlist from localStorage
          const saved = localStorage.getItem('lueuer_wishlist')
          if (saved) setWishlistItems(JSON.parse(saved))
        }
      } catch (err) {
        console.error("Wishlist sync failed:", err)
      } finally {
        setSyncing(false)
      }
    }

    sync()
  }, [isSignedIn, isLoaded])

  // Persist guest wishlist to localStorage when not signed in
  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      localStorage.setItem('lueuer_wishlist', JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, isSignedIn, isLoaded])

  const toggleWishlist = async (product) => {
    const isItemWishlisted = wishlistItems.some(item => item.productId === product.id)
    const previousItems = [...wishlistItems]

    if (isItemWishlisted) {
      // Remove
      const itemToRemove = wishlistItems.find(item => item.productId === product.id)
      setWishlistItems(prev => prev.filter(item => item.productId !== product.id))

      if (isSignedIn) {
        try {
          if (itemToRemove?.id) {
            await apiRemoveFromWishlist(itemToRemove.id)
          }
        } catch (err) {
          console.error("removeFromWishlist failed, rolling back:", err)
          setWishlistItems(previousItems)
        }
      }
    } else {
      // Add
      const tempId = `temp-${Date.now()}`
      const newItem = {
        id: tempId,
        productId: product.id,
        product: product
      }
      setWishlistItems(prev => [...prev, newItem])

      if (isSignedIn) {
        try {
          const res = await apiAddToWishlist({ productId: product.id })
          // Replace temp item with real backend item (with real db ID)
          setWishlistItems(prev => 
            prev.map(item => item.id === tempId ? res.data?.data : item)
          )
        } catch (err) {
          console.error("addToWishlist failed, rolling back:", err)
          setWishlistItems(previousItems)
        }
      }
    }
  }

  const isWishlisted = (productId) => {
    return wishlistItems.some(item => item.productId === productId)
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      toggleWishlist,
      isWishlisted,
      wishlistCount,
      syncing
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
