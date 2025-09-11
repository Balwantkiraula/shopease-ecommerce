import { useMemo, useState, useCallback } from 'react'
import { StoreContext } from './StoreContextOnly.js'

export function StoreProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState([])

  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) => p.id === item.id ? { ...p, qty: (p.qty || 1) + 1 } : p)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateQty = useCallback((id, qtyDelta) => {
    setCartItems((prev) => {
      return prev
        .map((p) => p.id === id ? { ...p, qty: Math.max(1, (p.qty || 1) + qtyDelta) } : p)
        .filter((p) => p.qty > 0)
    })
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const cartCount = useMemo(() => cartItems.reduce((sum, p) => sum + (p.qty || 1), 0), [cartItems])
  const cartTotal = useMemo(() => cartItems.reduce((sum, p) => sum + Number(p.price) * (p.qty || 1), 0), [cartItems])

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    cartItems,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    cartCount,
    cartTotal,
  }), [searchQuery, cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal])

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

// Hook moved to a separate file to keep fast refresh working for components


