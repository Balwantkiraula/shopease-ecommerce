import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

function Orders() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

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

  useEffect(() => {
    // Mock realistic orders list
    setOrders([
      { id: 'ORD-1001', date: '2025-09-01', status: 'Delivered', total: 149.99, items: 2 },
      { id: 'ORD-1002', date: '2025-09-05', status: 'Shipped', total: 89.5, items: 1 },
      { id: 'ORD-1003', date: '2025-09-10', status: 'Processing', total: 239.0, items: 3 },
    ])
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Orders</span>
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
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="divide-y">
            {orders.map((o) => (
              <div key={o.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-gray-900 font-medium">{o.id}</div>
                  <div className="text-sm text-gray-500">{o.date}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <span className="text-gray-500">Status:</span> <span className="font-medium">{o.status}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Items:</span> <span className="font-medium">{o.items}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Total:</span> <span className="font-semibold">${o.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Orders


