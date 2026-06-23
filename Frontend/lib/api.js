import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
})

let tokenFetcher = null

export const setTokenFetcher = (fetcher) => {
  tokenFetcher = fetcher
}

API.interceptors.request.use(async (config) => {
  if (tokenFetcher) {
    try {
      const token = await tokenFetcher()
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch (err) {
      console.error("Failed to fetch Clerk token dynamically:", err)
    }
  }
  return config
})

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete API.defaults.headers.common['Authorization']
  }
}

export const getCategories = () => API.get('/categories')
export const getCategoryBySlug = (slug) => API.get(`/categories/${slug}`)

export const getProducts = (params) => API.get('/products', { params })
export const getFeaturedProducts = () => API.get('/products/featured')
export const getProductBySlug = (slug) => API.get(`/products/${slug}`)

export const getCart = () => API.get('/cart')
export const addToCart = (data) => API.post('/cart/add', data)
export const updateCartItem = (id, data) => API.put(`/cart/update/${id}`, data)
export const removeFromCart = (id) => API.delete(`/cart/remove/${id}`)
export const clearCart = () => API.delete('/cart/clear')

export const getWishlist = () => API.get('/wishlist')
export const addToWishlist = (data) => API.post('/wishlist/add', data)
export const removeFromWishlist = (id) => API.delete(`/wishlist/remove/${id}`)

export const getAddresses = () => API.get('/addresses')
export const createAddress = (data) => API.post('/addresses', data)
export const updateAddress = (id, data) => API.put(`/addresses/${id}`, data)
export const deleteAddress = (id) => API.delete(`/addresses/${id}`)
export const setDefaultAddress = (id) => API.put(`/addresses/${id}/default`)

export const createRazorpayOrder = (data) => API.post('/orders/razorpay', data)
export const placeOrder = (data) => API.post('/orders', data)
export const getUserOrders = () => API.get('/orders')
export const getOrderById = (id) => API.get(`/orders/${id}`)

export const getRatingsByProduct = (productId) => API.get(`/ratings/product/${productId}`)
export const addRating = (data) => API.post('/ratings', data)

export const uploadImage = (formData) => API.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

export const adminGetAllOrders = (params) => API.get('/orders/admin/all', { params })
export const adminUpdateOrderStatus = (id, data) => API.put(`/orders/admin/${id}/status`, data)
export const adminCreateCategory = (data) => API.post('/categories', data)
export const adminUpdateCategory = (id, data) => API.put(`/categories/${id}`, data)
export const adminCreateProduct = (data) => API.post('/products', data)
export const adminUpdateProduct = (id, data) => API.put(`/products/${id}`, data)
export const adminDeleteProduct = (id) => API.delete(`/products/${id}`)
export const adminAddProductImage = (id, data) => API.post(`/products/${id}/images`, data)

// Shiprocket
export const createShipment = (orderId) => API.post(`/shiprocket/create/${orderId}`)
export const trackOrder = (orderId) => API.get(`/shiprocket/track/${orderId}`)
export const cancelShipment = (orderId) => API.post(`/shiprocket/cancel/${orderId}`)
export const checkServiceability = (data) => API.post('/shiprocket/serviceability', data)

// Contact
export const submitContactForm = (data) => API.post('/contact', data)

// Cancel & Refund
export const cancelOrder = (id) => API.post(`/orders/${id}/cancel`)
export const adminMarkAsRefunded = (id) => API.put(`/orders/admin/${id}/refund`)


