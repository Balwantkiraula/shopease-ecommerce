import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './Home.jsx'
import Category from './Category.jsx'
import Cart from './Cart.jsx'
import Search from './Search.jsx'
import Profile from './Profile.jsx'
import Address from './Address.jsx'
import Orders from './Orders.jsx'
import Support from './Support.jsx'
import { StoreProvider } from './context/StoreContext.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<App />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address" element={<Address />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
)
