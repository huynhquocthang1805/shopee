import express from 'express';
import authRoutes from './api/auth.js';
import productRoutes from './api/product.js';
import orderRoutes from './api/order.js';

const routes = express.Router();

routes.use('/auth', authRoutes);
routes.use('/products', productRoutes);
routes.use('/orders', orderRoutes);

routes.get('/', (_req, res) => {
    res.json({
        name: 'E-Commerce API (Oracle)',
        endpoints: {
            auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
            products: [
                'GET /products',
                'GET /products/:id',
                'GET /products/search?keyword=...',
                'POST /products',
                'PUT /products/:id',
                'DELETE /products/:id',
                'GET /products/seller/:sellerId',
            ],
            orders: [
                'GET /orders',
                'GET /orders/me',
                'GET /orders/:id',
                'POST /orders',
                'PUT /orders/:id/status',
                'GET /orders/stats',
            ],
        },
    });
});

export default routes;
