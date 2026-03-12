import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useStore } from './context/useStore.js'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart, cartCount } = useStore()

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)

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

  // Whenever navigation state has a product (e.g. coming from Home or product list), use it immediately.
  useEffect(() => {
    const stateProduct = location.state?.product
    if (stateProduct) {
      setProduct(stateProduct)
      setLoading(false)
      setError('')
    }
  }, [location.state, location.key])

  // If product data was not passed via navigation state, fetch by id.
  useEffect(() => {
    if (location.state?.product) return
    if (!id) {
      setLoading(false)
      setError('No product ID')
      return
    }

    const controller = new AbortController()
    const load = async () => {
      try {
        setError('')
        setLoading(true)
        setProduct(null)

        // Try Fake Store API first (used on home featured grid); then DummyJSON (search/category).
        const fakeRes = await fetch(`https://fakestoreapi.com/products/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        })
        if (fakeRes.ok) {
          const data = await fakeRes.json()
          setProduct({ ...data, source: 'fakestore' })
          setLoading(false)
          return
        }

        const dummyRes = await fetch(`https://dummyjson.com/products/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        })
        if (dummyRes.ok) {
          const data = await dummyRes.json()
          setProduct({ ...data, source: 'dummyjson' })
          setLoading(false)
          return
        }

        throw new Error('Product not found')
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message || 'Unable to load product details')
        }
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [id, location.state])

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

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const productSafe = product || {}
  const images = (() => {
    if (!product) return []
    if (Array.isArray(product.images) && product.images.length > 0) return product.images
    if (product.thumbnail) return [product.thumbnail]
    if (product.image) return [product.image]
    return []
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/home')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 border border-gray-300 hover:border-blue-500 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition"
                aria-label="Back to Home"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back to Home</span>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600" />
                <span className="text-xl font-bold text-gray-900">ShopEase</span>
              </div>
            </div>
            <button
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-200 rounded w-40" />
            </div>
          </div>
        ) : !product ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-700 font-medium">Product not found</p>
            <p className="mt-1 text-sm text-gray-500">{error || 'This product may have been removed or the link is invalid.'}</p>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Back to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt={product.title || product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No image available</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.slice(1, 6).map((img, idx) => (
                    <div
                      key={idx}
                      className="h-16 w-16 rounded border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center"
                    >
                      <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {productSafe.brand ? `${productSafe.brand} • ` : ''}
                  {productSafe.category || ''}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                  {productSafe.title || productSafe.name || 'Product'}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-2xl font-semibold text-blue-600">
                  ${Number(productSafe.price ?? 0).toFixed(2)}
                </div>
                {productSafe.discountPercentage != null && (
                  <div className="text-sm text-green-600 font-medium">
                    {productSafe.discountPercentage}% off
                  </div>
                )}
                {productSafe.rating != null && Number(productSafe.rating) === productSafe.rating && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 border border-yellow-200">
                    <span>★</span>
                    <span>{Number(productSafe.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-medium">Product description</p>
                <p className="text-gray-600 leading-relaxed">
                  {productSafe.description || 'No description available for this product.'}
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-medium">Highlights</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Easy returns in 7 days</li>
                  <li>Secure payment and checkout</li>
                  <li>Carefully packed for safe delivery</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-3 items-center">
                {addedToCart && (
                  <p className="w-full text-sm font-medium text-green-600 flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                    Added to cart — view in Cart or continue shopping.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium shadow transition ${addedToCart ? 'bg-green-600 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {addedToCart ? 'Added to cart ✓' : 'Add to cart'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart()
                    navigate('/cart')
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-blue-600 text-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-50"
                >
                  Buy now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  View cart ({cartCount})
                </button>
                <p className="text-xs text-gray-500 w-full">
                  Free delivery on eligible orders. Taxes are calculated at checkout.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductDetail

