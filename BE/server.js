/**
 * server.js - Main entry point cho E-Commerce Backend (Oracle).
 * Khởi động Oracle pool TRƯỚC khi mở port để tránh request rớt do DB chưa sẵn sàng.
 */
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

import { initPool, closePool } from './config/configDatabase.js';
import routes from './routes/index.js';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Logger nho nhỏ ===
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// === Routes ===
app.use('/api', routes);

app.get('/', (_req, res) => res.json({
    status: 'ok',
    message: 'E-Commerce API (Oracle Edition) is running',
    docs: '/api',
}));

// === Error handler ===
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
});

// === Bootstrap ===
async function start() {
    try {
        await initPool();                       // Oracle pool sẵn sàng trước
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`   API base: http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await closePool();
    process.exit(0);
});

start();
