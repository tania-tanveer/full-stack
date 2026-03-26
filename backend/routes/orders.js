const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Create new order
router.post('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
        return res.status(400).json({ error: 'Shipping address and payment method required' });
    }

    // Get cart items
    db.all(`
    SELECT ci.*, p.name, p.price, p.sale_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `, [userId], (err, cartItems) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => {
            const price = item.sale_price || item.price;
            return sum + (price * item.quantity);
        }, 0);

        // Create order
        db.run(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method)
      VALUES (?, ?, 'processing', ?, ?)
    `, [userId, total.toFixed(2), JSON.stringify(shippingAddress), paymentMethod],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const orderId = this.lastID;

                // Create order items
                const orderItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

                cartItems.forEach(item => {
                    const price = item.sale_price || item.price;
                    orderItemStmt.run(orderId, item.product_id, item.quantity, price);
                });
                orderItemStmt.finalize();

                // Clear cart
                db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                    if (err) {
                        console.error('Error clearing cart:', err);
                    }
                });

                res.json({
                    message: 'Order placed successfully',
                    orderId,
                    total: total.toFixed(2)
                });
            });
    });
});

// Get user's orders
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `, [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(orders);
    });
});

// Get single order details
router.get('/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    db.get(`
    SELECT * FROM orders WHERE id = ? AND user_id = ?
  `, [id, userId], (err, order) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        db.all(`
      SELECT oi.*, p.name, p.image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id], (err, items) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            order.items = items;
            order.shipping_address = JSON.parse(order.shipping_address || '{}');

            res.json(order);
        });
    });
});

module.exports = router;
