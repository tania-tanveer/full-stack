import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Cart = () => {
    const { cartItems, cartTotal, isCartOpen, closeCart, updateQuantity, removeItem } = useCart()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleCheckout = () => {
        closeCart()
        if (isAuthenticated) {
            navigate('/checkout')
        } else {
            navigate('/login')
        }
    }

    const handleQuantityChange = (productId, delta, currentQty) => {
        const newQty = currentQty + delta
        if (newQty < 1) {
            removeItem(productId)
        } else {
            updateQuantity(productId, newQty)
        }
    }

    return (
        <>
            <div
                className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
                onClick={closeCart}
            />

            <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    <button className="close-cart" onClick={closeCart}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <p>Your cart is empty</p>
                            <Link to="/products" className="btn btn-primary" onClick={closeCart}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.product_id || item.id} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <h4 className="cart-item-title">{item.name}</h4>
                                    <div className="cart-item-price">
                                        ${(item.current_price || item.sale_price || item.price).toFixed(2)}
                                    </div>
                                    <div className="cart-item-actions">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item.product_id || item.id, -1, item.quantity)}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item.product_id || item.id, 1, item.quantity)}
                                        >
                                            +
                                        </button>
                                        <button
                                            className="remove-item"
                                            onClick={() => removeItem(item.product_id || item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-subtotal">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Cart
