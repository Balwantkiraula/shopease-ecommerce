import { useEffect, useRef, useState } from 'react'
import { auth } from './firebase'
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate, Navigate } from 'react-router-dom'
import { useStore } from './context/useStore.js'

function Home() {
  const [loading, setLoading] = useState(true)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authConfirmPassword, setAuthConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { searchQuery, setSearchQuery, addToCart, cartCount } = useStore()
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  
  const filteredProducts = products.filter(p => {
    const title = (p.title || '').toLowerCase()
    const category = (p.category || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return title.includes(q) || category.includes(q)
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setLoading(false)
      return
    }
    console.log("Setting up auth state listener in Home...");
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed in Home:", u ? u.email : "No user");
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Close menu on outside click / ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  // Live search from DummyJSON when there is a query
  useEffect(() => {
    const controller = new AbortController()
    const q = (searchQuery || '').trim()
    if (!q) {
      setSearchResults([])
      setSearchLoading(false)
      setSearchError('')
      return
    }
    let timeout = setTimeout(async () => {
      try {
        setSearchError('')
        setSearchLoading(true)
        const res = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(q)}&limit=32`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch search results')
        const json = await res.json()
        const data = Array.isArray(json) ? json : (Array.isArray(json.products) ? json.products : [])
        setSearchResults(data)
      } catch (e) {
        if (e.name !== 'AbortError') setSearchError(e.message || 'Unable to search products')
      } finally {
        setSearchLoading(false)
      }
    }, 350)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [searchQuery])

  // Fetch products from a public API (Fake Store API)
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        setProductsError('')
        setProductsLoading(true)
        const res = await fetch('https://fakestoreapi.com/products', { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (e) {
        if (e.name !== 'AbortError') setProductsError(e.message || 'Unable to load products')
      } finally {
        setProductsLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const handleSignOut = async () => {
    setError('')
    setSignOutLoading(true)
    try {
      await signOut(auth)
      // After signout, navigate to login
      navigate("/login")
    } catch (err) {
      setError(err.message)
    } finally {
      setSignOutLoading(false)
    }
  }

  const getFriendlyAuthError = (err) => {
    const code = err?.code || ''
    switch (code) {
      case 'auth/invalid-email':
        return 'Enter a valid email address.'
      case 'auth/missing-password':
        return 'Enter your password.'
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password.'
      case 'auth/email-already-in-use':
        return 'This email is already registered.'
      default:
        return err?.message || 'Something went wrong. Try again.'
    }
  }

  const validateAuthInputs = () => {
    const trimmedEmail = authEmail.trim()
    const trimmedPassword = authPassword.trim()
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/

    if (!emailRegex.test(trimmedEmail)) {
      return 'Enter a valid email address.'
    }
    if (trimmedPassword.length < 6) {
      return 'Password must be at least 6 characters.'
    }
    if (isSignUp && trimmedPassword !== authConfirmPassword.trim()) {
      return 'Passwords do not match.'
    }
    return ''
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    const validationError = validateAuthInputs()
    if (validationError) {
      setAuthError(validationError)
      return
    }
    if (!auth) {
      setAuthError('Authentication is not configured.')
      return
    }

    setAuthLoading(true)
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim())
        if (res?.user) {
          setIsSignUp(false)
          setAuthPassword('')
          setAuthConfirmPassword('')
        }
      } else {
        const res = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim())
        if (res?.user) {
          setAuthPassword('')
          setAuthConfirmPassword('')
        }
      }
    } catch (err) {
      setAuthError(getFriendlyAuthError(err))
    } finally {
      setAuthLoading(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 py-3 sm:py-0 sm:h-16">
              {/* Brand */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600" />
                <span className="text-xl font-bold text-gray-900">ShopEase</span>
              </div>
              {/* Search */}
              <div className="flex-1 min-w-[200px] w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(searchQuery)}`) }}
                    placeholder="Search for products, brands and more"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-3 ml-auto w-full justify-between sm:w-auto sm:justify-end" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 12.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  <span>Cart</span>
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs w-5 h-5">{cartCount}</span>
                </button>
                {user && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((s) => !s)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                    >
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                        {(user?.email?.[0] || 'U').toUpperCase()}
                      </div>
                      <span>Account</span>
                      <svg className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
                    </button>
                    {menuOpen && (
                      <div role="menu" className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-20">
                        <button onClick={() => { setMenuOpen(false); navigate('/profile') }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">My Profile</button>
                        <button onClick={() => { setMenuOpen(false); navigate('/address') }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Address for Delivery</button>
                        <button onClick={() => { setMenuOpen(false); navigate('/orders') }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Order History</button>
                        <button onClick={() => { setMenuOpen(false); navigate('/support') }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Support</button>
                        <div className="my-1 border-t border-gray-200" />
                        <button
                          onClick={async () => { setMenuOpen(false); await handleSignOut() }}
                          disabled={signOutLoading}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {signOutLoading ? 'Signing out…' : 'Sign Out'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {/* Greeting */}
          {user ? (
            <div className="mb-4 text-sm text-gray-600">
              Signed in as <span className="font-medium text-gray-800">{user.email}</span>
            </div>
          ) : (
            <div className="mb-4 text-sm text-gray-600">
              Welcome to <span className="font-medium text-gray-800">ShopEase</span>. Browse products and sign in to save your cart and orders.
            </div>
          )}

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

        {/* Hero banner */}
        <div className="rounded-none sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow">
          <h2 className="text-2xl sm:text-3xl font-semibold">Big Deals on Top Categories</h2>
          <p className="mt-1 text-blue-100">Discover latest products with amazing discounts</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="bg-white/15 px-3 py-1 rounded-full">Electronics</span>
            <span className="bg-white/15 px-3 py-1 rounded-full">Fashion</span>
            <span className="bg-white/15 px-3 py-1 rounded-full">Home</span>
            <span className="bg-white/15 px-3 py-1 rounded-full">Accessories</span>
          </div>
        </div>

        {/* Categories (quick links) with icons */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Mobiles', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            )},
            { label: 'Laptops', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M2 20h20" />
              </svg>
            )},
            { label: 'TVs', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="13" rx="2" />
                <polyline points="8 7 12 3 16 7" />
              </svg>
            )},
            { label: 'Appliances', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="14" rx="2" />
                <path d="M9 17v4h6v-4" />
              </svg>
            )},
            { label: 'Men', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 22a6.5 6.5 0 0113 0" />
              </svg>
            )},
            { label: 'Women', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M12 11v7M9 18h6" />
              </svg>
            )},
            { label: 'Kids', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="3" />
                <path d="M5 21a7 7 0 0114 0" />
              </svg>
            )},
            { label: 'Sports', icon: (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3v18M4.6 7.5l14.8 9M19.4 7.5L4.6 16.5" />
              </svg>
            )},
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => navigate(`/category/${c.label.toLowerCase()}`)}
              className="group bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow"
            >
              <div className="h-10 w-full rounded bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center text-gray-700">
                {c.icon}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-800">{c.label}</div>
            </button>
          ))}
        </div>

        {/* Search Results or Featured Products */}
        <div className="mt-8">
          {searchQuery ? (
            <>
              {searchError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm">{searchError}</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Search results</h3>
                <div className="text-sm text-gray-500">{searchResults.length} items</div>
              </div>
              {searchLoading ? (
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
                  {searchResults.map((p) => (
                    <div key={p.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow">
                      <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                        <img src={p.thumbnail || (Array.isArray(p.images) ? p.images[0] : p.image)} alt={p.title} className="max-h-full w-full object-contain object-center" />
                      </div>
                      <div className="p-3">
                        <div className="text-sm text-gray-500 capitalize">{p.category}</div>
                        <div className="mt-1 font-medium text-gray-900 line-clamp-1">{p.title || p.name}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-blue-600 font-semibold">${Number(p.price).toFixed(2)}</div>
                          <button onClick={() => addToCart(p)} className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Add</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Featured Products</h3>
                <div className="text-sm text-gray-500">{filteredProducts.length} items</div>
              </div>
              {productsLoading ? (
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
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow">
                      <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                        <img src={p.image} alt={p.title} className="max-h-full w-full object-contain object-center" />
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
            </>
          )}
        </div>
      </main>
      </div>

      {/* Auth side panel for guests */}
      {!user && (
        <aside className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-5">
              <div className="w-10 h-10 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-sm">
                🔒
              </div>
              <h2 className="text-xl font-semibold mt-2">
                {isSignUp ? 'Create your account' : 'Sign in to continue'}
              </h2>
              <p className="text-xs text-gray-500">
                {isSignUp ? 'Save your cart and track your orders.' : 'Sign in to access your cart and orders.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="home-auth-email" className="block text-xs font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="home-auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="home-auth-password" className="block text-xs font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="home-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-[11px] text-gray-500 mt-1">Use at least 6 characters.</p>
                )}
              </div>
              {isSignUp && (
                <div>
                  <label htmlFor="home-auth-confirm" className="block text-xs font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="home-auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {authError && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-2 py-1">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-blue-700 transition disabled:opacity-60"
              >
                {authLoading ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Create account' : 'Sign In')}
              </button>

              <div className="text-center text-xs text-gray-600">
                {isSignUp ? (
                  <>
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setAuthError('') }}
                      disabled={authLoading}
                      className="text-blue-600 hover:underline disabled:opacity-60"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    <span>New here? </span>
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setAuthError('') }}
                      disabled={authLoading}
                      className="text-blue-600 hover:underline disabled:opacity-60"
                    >
                      Create an account
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </aside>
      )}
    </div>
  )
}

export default Home;


