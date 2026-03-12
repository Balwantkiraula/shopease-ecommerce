import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useStore } from './context/useStore.js'

function Search() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialQ = params.get('q') || ''
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { addToCart, cartCount, searchQuery, setSearchQuery } = useStore()

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setAuthLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    setSearchQuery(initialQ)
  }, [initialQ, setSearchQuery])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        const q = (initialQ || '').trim()
        const url = q ? `https://dummyjson.com/products/search?q=${encodeURIComponent(q)}&limit=32` : 'https://dummyjson.com/products?limit=32'
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch search results')
        const json = await res.json()
        const data = Array.isArray(json) ? json : (Array.isArray(json.products) ? json.products : [])
        setResults(data)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Unable to search products')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [initialQ])

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

  const handleSubmitSearch = (e) => {
    e.preventDefault()
    const q = (searchQuery || '').trim()
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  if (authLoading) {
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
          <div className="h-16 flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigate('/')} className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600" />
              <span className="text-xl font-bold text-gray-900">ShopEase</span>
            </div>
            <form onSubmit={handleSubmitSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                </svg>
              </div>
            </form>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search results for "{initialQ}"</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/2] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((p) => (
              <div
                key={p.id}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow cursor-pointer"
                onClick={() => navigate(`/product/${p.id}`, { state: { product: { ...p, source: 'dummyjson' } } })}
              >
                <div className="aspect-[3/2] bg-gray-100">
                  <img src={p.thumbnail || (Array.isArray(p.images) ? p.images[0] : undefined)} alt={p.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm text-gray-500 capitalize">{p.category}</div>
                  <div className="mt-1 font-medium text-gray-900 line-clamp-1">{p.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-blue-600 font-semibold">${Number(p.price).toFixed(2)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(p)
                      }}
                      className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Search


