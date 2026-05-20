const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Load backend modules
const path = require('path');
const { initializeDatabase, seedDatabase } = require('../backend/database');

const productsRouter = require('../backend/routes/products');
const cartRouter = require('../backend/routes/cart');
const ordersRouter = require('../backend/routes/orders');
const authRouter = require('../backend/routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes under /api
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ShopNova API (serverless) is running' });
});

// Initialize DB on cold start
(async () => {
    try {
        await initializeDatabase();
        await seedDatabase();
        console.log('Database initialized for serverless function');
    } catch (err) {
        console.error('DB init error:', err);
    }
})();

module.exports = serverless(app);
