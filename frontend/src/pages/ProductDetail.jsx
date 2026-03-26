import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const { addToCart } = useCart()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/api/products/${id}`)
                setProduct(res.data)
            } catch (error) {
                console.error('Failed to fetch product:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    const handleAddToCart = () => {
        addToCart(product.id, quantity)
    }

    const renderStars = (rating) => {
        const stars = []
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} style={{ color: i < Math.floor(rating) ? '#d4a574' : '#ccc' }}>★</span>
            )
        }
        return stars
    }

    if (loading) {
        return (
            <div className="loading" style={{ marginTop: '100px' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h2>Product not found</h2>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Back to Products
                </Link>
            </div>
        )
    }

    const displayPrice = product.sale_price || product.price

    return (
        <section className="product-detail">
            <div className="container">
                <div style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                    <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {product.name}
                </div>

                <div className="product-detail-grid">
                    <div className="product-detail-image">
                        <img src={product.image} alt={product.name} />
                    </div>

                    <div className="product-detail-info">
                        <h1>{product.name}</h1>

                        <div className="product-detail-rating">
                            <div style={{ color: '#d4a574' }}>
                                {renderStars(product.rating)}
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {product.rating} ({product.reviews || 0} reviews)
                            </span>
                        </div>

                        <div className="product-detail-price">
                            {product.sale_price && (
                                <span className="original-price" style={{ marginRight: '10px' }}>
                                    ${product.price.toFixed(2)}
                                </span>
                            )}
                            <span className="sale-price">${displayPrice.toFixed(2)}</span>
                        </div>

                        <p className="product-description">{product.description}</p>

                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="product-actions">
                            <button className="btn btn-primary" onClick={handleAddToCart}>
                                Add to Cart
                            </button>
                            <button className="btn btn-outline">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                Add to Wishlist
                            </button>
                        </div>

                        <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', fontSize: '0.9rem' }}>
                                <div>
                                    <strong>Category:</strong> {product.category_name}
                                </div>
                                <div>
                                    <strong>Stock:</strong> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductDetail
