const express = require('express');
const cors = require('cors');
const path = require('path');

const { initializeDatabase, seedDatabase } = require('./database');

// Import routes
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ShopNova API is running' });
});
// Initialize database and start server
const startServer = async () => {
    try {
        await initializeDatabase();
        await seedDatabase();

        app.listen(PORT, () => {
            console.log(`ShopNova API running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
