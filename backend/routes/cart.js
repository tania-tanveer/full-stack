const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get cart items (for logged in user or session)
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT ci.*, p.name, p.description, p.image, p.price, p.sale_price, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `, [userId], (err, items) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Calculate totals
    const cartItems = items.map(item => ({
      ...item,
      current_price: item.sale_price || item.price
    }));

    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.current_price * item.quantity), 0
    );

    res.json({
      items: cartItems,
      subtotal: subtotal.toFixed(2),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  });
});

// Add item to cart
router.post('/add', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  // Check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', 
      [userId, productId], 
      (err, existingItem) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', 
            [newQuantity, existingItem.id], 
            (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.json({ message: 'Cart updated', quantity: newQuantity });
            }
          );
        } else {
          // Add new item
          db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', 
            [userId, productId, quantity], 
            (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.json({ message: 'Added to cart', quantity });
            }
          );
        }
      }
    );
  });
});

// Update cart item quantity
router.put('/update', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ error: 'Product ID and quantity required' });
  }

  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', 
    [quantity, userId, productId], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      res.json({ message: 'Cart updated' });
    }
  );
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', 
    [userId, productId], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      res.json({ message: 'Item removed from cart' });
    }
  );
});

// Clear cart
router.delete('/clear', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Cart cleared' });
  });
});

module.exports = router;
