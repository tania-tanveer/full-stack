import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Checkout = () => {
  const { isAuthenticated, user } = useAuth()
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United States'
  })
  
  const [paymentMethod, setPaymentMethod] = useState('card')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/orders', {
        shippingAddress,
        paymentMethod
      })
      
      setOrderId(response.data.orderId)
      setOrderComplete(true)
      clearCart()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (orderComplete) {
    return (
      <section className="checkout-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto var(--spacing-lg)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            Your order #{orderId} has been placed successfully.
          </p>
          <Link to="/orders" className="btn btn-primary">
            View Orders
          </Link>
        </div>
      </section>
    )
  }

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Your cart is empty</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Continue Shopping
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--spacing-xl)', marginTop: 'var(--spacing-xl)' }}>Checkout</h1>

        <div className="checkout-grid">
          <div className="checkout-form">
            {/* Step 1: Shipping Address */}
            <div className="checkout-section">
              <h3>1. Shipping Address</h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={shippingAddress.email}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="checkout-section">
              <h3>2. Payment Method</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Credit/Debit Card
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  PayPal
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: 'var(--spacing-md)' }}
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Place Order - $${cartTotal.toFixed(2)}`}
            </button>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Order Summary</h3>
            
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.product_id || item.id} className="summary-item">
                  <div className="summary-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="summary-item-details">
                    <div className="summary-item-title">{item.name}</div>
                    <div className="summary-item-price">
                      ${((item.current_price || item.sale_price || item.price) * item.quantity).toFixed(2)}
                    </div>
                    <div className="summary-item-qty">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${(cartTotal * 1.08).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout
