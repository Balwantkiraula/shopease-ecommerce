import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

function Address() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal: '',
  })
  const [saved, setSaved] = useState(false)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress((a) => ({ ...a, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Delivery Address</span>
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
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            {saved && <div className="p-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded">Address saved locally.</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input name="fullName" value={address.fullName} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input name="phone" value={address.phone} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Address Line 1</label>
                <input name="line1" value={address.line1} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Address Line 2</label>
                <input name="line2" value={address.line2} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input name="city" value={address.city} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">State</label>
                <input name="state" value={address.state} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                <input name="postal" value={address.postal} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save Address</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Address


