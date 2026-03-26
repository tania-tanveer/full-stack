import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    const category = searchParams.get('category')
    const search = searchParams.get('search')

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/products/categories/list')
                setCategories(res.data || [])
            } catch (error) {
                console.error('Failed to fetch categories:', error)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                let url = '/api/products'
                const params = new URLSearchParams()

                if (category) params.append('category', category)
                if (search) params.append('search', search)

                if (params.toString()) {
                    url += `?${params.toString()}`
                }

                const res = await axios.get(url)
                setProducts(res.data?.products || [])
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [category, search])

    const handleFilterClick = (catId) => {
        if (catId === 'all') {
            setSearchParams({})
        } else {
            setSearchParams({ category: catId })
        }
    }

    const currentCategory = searchParams.get('category')

    return (
        <section className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>
                        {search
                            ? `Search Results for "${search}"`
                            : currentCategory
                                ? categories.find(c => c.id === parseInt(currentCategory))?.name || 'Products'
                                : 'All Products'
                        }
                    </h1>

                    <div className="products-filters">
                        <button
                            className={`filter-btn ${!currentCategory ? 'active' : ''}`}
                            onClick={() => handleFilterClick('all')}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`filter-btn ${currentCategory === String(cat.id) ? 'active' : ''}`}
                                onClick={() => handleFilterClick(cat.id)}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Products
