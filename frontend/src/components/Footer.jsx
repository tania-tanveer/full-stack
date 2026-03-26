import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3>ShopNova</h3>
                        <p style={{ color: '#999', fontSize: '0.9rem' }}>
                            Your premier destination for premium products. Quality meets style in every purchase.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h3>Shop</h3>
                        <ul>
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/products?category=1">Electronics</Link></li>
                            <li><Link to="/products?category=2">Fashion</Link></li>
                            <li><Link to="/products?category=3">Home & Living</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Customer Service</h3>
                        <ul>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Shipping Info</a></li>
                            <li><a href="#">Returns & Exchanges</a></li>
                            <li><a href="#">FAQ</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Connect</h3>
                        <ul>
                            <li><a href="#">Facebook</a></li>
                            <li><a href="#">Instagram</a></li>
                            <li><a href="#">Twitter</a></li>
                            <li><a href="#">Newsletter</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} ShopNova. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
