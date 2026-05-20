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

// Lazy DB initialization - only initialize once on first request
let dbInitialized = false;
let dbInitPromise = null;

const ensureDBInit = async () => {
    if (dbInitialized) return;
    if (dbInitPromise) {
        await dbInitPromise;
        return;
    }

    dbInitPromise = (async () => {
        try {
            await initializeDatabase();
            await seedDatabase();
            console.log('Database initialized for serverless function');
            dbInitialized = true;
        } catch (err) {
            console.error('DB init error:', err);
            throw err;
        }
    })();

    await dbInitPromise;
};

// Middleware to ensure DB is initialized before handling API routes
app.use('/api/', async (req, res, next) => {
    try {
        await ensureDBInit();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database initialization failed', message: err.message });
    }
});

// Mount routes under /api
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ShopNova API (serverless) is running' });
});

module.exports = serverless(app);
