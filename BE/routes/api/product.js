import express from 'express';
import productController from '../../controllers/product.controller.js';
import ratingController from '../../controllers/rating.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// ===== PRODUCT =====
// Public
router.get('/',         productController.findAll);
router.get('/search',   productController.search);
router.get('/seller/:sellerId', productController.findBySeller);

// Ratings của 1 sản phẩm — phải đặt TRƯỚC '/:id' để Express không bắt nhầm
router.get('/:id/ratings',  ratingController.listByProduct);
router.post('/:id/ratings', requireAuth, ratingController.create);

router.get('/:id',      productController.findOne);

// Yêu cầu seller (đăng nhập + role=seller)
router.post('/',        requireAuth, requireRole('seller'),  productController.create);
router.put('/:id',      requireAuth, requireRole('seller'),  productController.update);
router.delete('/:id',   requireAuth, requireRole('seller'),  productController.delete);

export default router;
