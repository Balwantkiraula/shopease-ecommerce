import { Component } from 'react'
import { Link } from 'react-router-dom'

export class ProductDetailErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-md w-full text-center">
            <p className="text-red-600 font-medium">Something went wrong loading this product.</p>
            <p className="mt-2 text-sm text-gray-500">{this.state.error?.message || 'Unknown error'}</p>
            <div className="mt-4 flex justify-center">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ProductDetailErrorBoundary
