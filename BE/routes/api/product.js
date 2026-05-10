import express from 'express';
import productController from '../../controllers/product.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/',         productController.findAll);
router.get('/search',   productController.search);
router.get('/seller/:sellerId', productController.findBySeller);
router.get('/:id',      productController.findOne);

// Yêu cầu seller (đăng nhập + role=seller)
router.post('/',        requireAuth, requireRole('seller'),  productController.create);
router.put('/:id',      requireAuth, requireRole('seller'),  productController.update);
router.delete('/:id',   requireAuth, requireRole('seller'),  productController.delete);

export default router;
