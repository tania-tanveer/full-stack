const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all products with pagination and filtering
router.get('/', (req, res) => {
    const { page = 1, limit = 20, category, search, featured } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as category_name, c.icon as category_icon FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND p.category_id = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
        query += ' AND p.featured = 1';
    }

    query += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
        const countParams = [];
        if (category) {
            countQuery += ' AND p.category_id = ?';
            countParams.push(category);
        }
        if (search) {
            countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Get single product
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT p.*, c.name as category_name, c.icon as category_icon FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    });
});

// Get all categories
router.get('/categories/list', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY id', [], (err, categories) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(categories);
    });
});

// Search products
router.get('/search', (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Search query required' });
    }

    db.all('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name LIKE ? OR p.description LIKE ? LIMIT 20',
        [`%${q}%`, `%${q}%`],
        (err, products) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(products);
        }
    );
});

// Get featured products
router.get('/featured/list', (req, res) => {
    db.all('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.sale_price IS NOT NULL ORDER BY p.sale_price DESC LIMIT 8',
        [],
        (err, products) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(products);
        }
    );
});

module.exports = router;
