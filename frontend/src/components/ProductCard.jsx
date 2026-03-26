import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
    const { addToCart } = useCart()

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product.id)
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i}>★</span>)
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i}>★</span>)
            } else {
                stars.push(<span key={i} style={{ opacity: 0.3 }}>★</span>)
            }
        }
        return stars
    }

    const displayPrice = product.sale_price || product.price

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            <div className="product-image">
                <img src={product.image} alt={product.name} loading="lazy" />

                <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                <div className="quick-add">
                    <button onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                </div>
            </div>

            <div className="product-info">
                <h3 className="product-title">{product.name}</h3>

                <div className="product-rating">
                    <div className="stars">
                        {renderStars(product.rating)}
                    </div>
                    <span className="rating-count">({product.reviews || 0})</span>
                </div>

                <div className="product-price">
                    {product.sale_price && (
                        <span className="original-price">${product.price.toFixed(2)}</span>
                    )}
                    <span className={product.sale_price ? 'sale-price' : 'current-price'}>
                        ${displayPrice.toFixed(2)}
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
