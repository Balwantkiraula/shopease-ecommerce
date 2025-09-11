import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useStore } from './context/useStore.js'

function Cart() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [error, setError] = useState('')
  const { cartItems, cartCount, cartTotal, updateQty, removeFromCart, clearCart } = useStore()

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleSignOut = async () => {
    setError('')
    setSignOutLoading(true)
    try {
      await signOut(auth)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setSignOutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50">Home</button>
              <span className="text-xl font-bold text-gray-900">Cart</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/cart')} className="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 12.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                <span>Cart</span>
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs w-5 h-5">{cartCount}</span>
              </button>
              <button
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {signOutLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Your cart is empty.</p>
            <button onClick={() => navigate('/')} className="mt-4 inline-flex items-center rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">Start shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4">
                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                    <img src={item.thumbnail || item.image || (Array.isArray(item.images) ? item.images[0] : undefined)} alt={item.title || item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-2">{item.title || item.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{item.category}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-600 hover:underline">Remove</button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded border hover:bg-gray-50">-</button>
                        <span className="w-8 text-center">{item.qty || 1}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded border hover:bg-gray-50">+</button>
                      </div>
                      <div className="font-semibold text-gray-900">${(Number(item.price) * (item.qty || 1)).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="bg-white border border-gray-200 rounded-lg p-4 h-fit">
              <h3 className="text-lg font-semibold text-gray-900">Price details</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Items</span><span>{cartCount}</span></div>
                <div className="flex justify-between"><span>Total</span><span className="font-semibold">${cartTotal.toFixed(2)}</span></div>
              </div>
              <button className="mt-4 w-full inline-flex items-center justify-center rounded bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700">Checkout</button>
              <button onClick={clearCart} className="mt-2 w-full inline-flex items-center justify-center rounded bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200">Clear cart</button>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

export default Cart


