import express from 'express';
import orderController from '../../controllers/order.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/',         requireAuth, orderController.create);
router.get('/me',        requireAuth, orderController.findMine);
router.get('/stats',     orderController.getStatistics);
router.get('/user/:userId', orderController.findByUser);
router.get('/:id',       orderController.findOne);
router.put('/:id/status',requireAuth, orderController.updateStatus);
router.get('/',          orderController.findAll);

export default router;
