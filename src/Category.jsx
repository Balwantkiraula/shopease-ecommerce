import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useStore } from './context/useStore.js'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

function Category() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [error, setError] = useState('')

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const { addToCart, cartCount } = useStore()

  // Map friendly slugs to DummyJSON categories or search queries
  const apiTarget = useMemo(() => {
    const s = slug?.toLowerCase?.() || ''
    // Prefer precise category when available; otherwise use a search query
    const map = {
      mobiles: { type: 'category', value: 'smartphones' },
      laptops: { type: 'category', value: 'laptops' },
      tvs: { type: 'search', value: 'tv' },
      appliances: { type: 'search', value: 'appliance' },
      men: { type: 'category', value: 'mens-shirts' },
      women: { type: 'category', value: 'womens-dresses' },
      kids: { type: 'search', value: 'kids' },
      sports: { type: 'search', value: 'sports' },
    }
    return map[s] || { type: 'search', value: s || 'all' }
  }, [slug])

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
    const controller = new AbortController()
    const load = async () => {
      try {
        setProductsError('')
        setLoading(true)
        let url = ''
        if (apiTarget.type === 'category') {
          url = `https://dummyjson.com/products/category/${encodeURIComponent(apiTarget.value)}?limit=24`
        } else if (apiTarget.type === 'search') {
          const q = apiTarget.value === 'all' ? '' : `?q=${encodeURIComponent(apiTarget.value)}&limit=24`
          url = `https://dummyjson.com/products/search${q}`
        }
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch products')
        const json = await res.json()
        const data = Array.isArray(json) ? json : (Array.isArray(json.products) ? json.products : [])
        setProducts(data)
      } catch (e) {
        if (e.name !== 'AbortError') setProductsError(e.message || 'Unable to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [apiTarget])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50">Home</button>
              <span className="text-xl font-bold text-gray-900 capitalize">{slug}</span>
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
        {productsError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">{productsError}</p>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">{slug}</h2>
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
            {products.map((p) => (
              <div key={p.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow">
                <div className="aspect-[3/2] bg-gray-100">
                  <img src={p.thumbnail || (Array.isArray(p.images) ? p.images[0] : undefined)} alt={p.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm text-gray-500 capitalize">{p.category}</div>
                  <div className="mt-1 font-medium text-gray-900 line-clamp-1">{p.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-blue-600 font-semibold">${Number(p.price).toFixed(2)}</div>
                    <button onClick={() => addToCart(p)} className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Add</button>
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

export default Category


