import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders')
                setOrders(response.data || [])
            } catch (error) {
                console.error('Failed to fetch orders:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [isAuthenticated, navigate])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'pending'
            case 'processing':
                return 'processing'
            case 'completed':
                return 'completed'
            case 'cancelled':
                return 'cancelled'
            default:
                return ''
        }
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <section className="orders-page">
            <div className="container">
                <h1 style={{ marginBottom: 'var(--spacing-xl)', marginTop: 'var(--spacing-xl)' }}>My Orders</h1>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your orders here</p>
                        <Link to="/products" className="btn btn-primary">
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <span className="order-id">Order #{order.id}</span>
                                        <span className={`order-status ${getStatusClass(order.status)}`} style={{ marginLeft: 'var(--spacing-sm)' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <span className="order-date">{formatDate(order.created_at)}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Payment: </span>
                                        <span>{order.payment_method}</span>
                                    </div>
                                    <span className="order-total">${parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>

                                {order.shipping_address && typeof order.shipping_address === 'object' && (
                                    <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <strong>Shipping to:</strong> {order.shipping_address.name}, {order.shipping_address.address}, {order.shipping_address.city} {order.shipping_address.zipCode}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Orders
