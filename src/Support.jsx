import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

function Support() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

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
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Support</span>
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
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600">We usually reply within a day.</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {submitted && <div className="p-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded">Thanks! We received your message.</div>}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Subject</label>
                <input required className="w-full border rounded-md px-3 py-2" placeholder="Issue with my order" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea required className="w-full border rounded-md px-3 py-2 min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail" />
              </div>
              <div>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Send</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Support


