import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Home = () => {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, productsRes, featuredRes] = await Promise.all([
                    axios.get('/api/products/categories/list'),
                    axios.get('/api/products?limit=8'),
                    axios.get('/api/products/featured/list')
                ])
                setCategories(categoriesRes.data || [])
                setProducts(productsRes.data?.products || [])
                setFeaturedProducts(featuredRes.data || [])
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Discover Premium Quality</h1>
                    <p className="hero-subtitle">
                        Explore our curated collection of premium products at unbeatable prices
                    </p>
                    <Link to="/products" className="btn btn-secondary">
                        Shop Now
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories">
                <div className="container">
                    <h2 className="section-title">Shop by Category</h2>
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="categories-grid">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.id}`}
                                    className="category-card"
                                >
                                    <div className="category-icon">{category.icon}</div>
                                    <div className="category-name">{category.name}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="products">
                <div className="container">
                    <h2 className="section-title">Featured Deals</h2>
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* All Products Preview */}
            <section className="products" style={{ background: 'var(--background)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Latest Products</h2>
                        <Link to="/products" className="btn btn-outline">
                            View All
                        </Link>
                    </div>
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default Home
