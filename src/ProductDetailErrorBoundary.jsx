import { Component } from 'react'

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
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ProductDetailErrorBoundary
