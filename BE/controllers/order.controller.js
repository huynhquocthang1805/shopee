/**
 * order.controller.js
 * Demo loại query: JOIN, subquery, aggregate.
 */
import Order from '../models/order.model.js';

class OrderController {
    // POST /api/orders - tạo order (transaction)
    create = async (req, res) => {
        try {
            const userId = req.user?.userId || req.body.user_id;
            if (!userId) return res.status(401).send({ message: 'Cần đăng nhập' });
            if (!req.body.items || req.body.items.length === 0) {
                return res.status(400).send({ message: 'Cần ít nhất 1 sản phẩm' });
            }

            const data = await Order.create(
                {
                    user_id: userId,
                    status: 'pending',
                    delivery_address: req.body.delivery_address || 'N/A',
                },
                req.body.items
            );
            res.status(201).send(data);
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/orders/:id (JOIN demo)
    findOne = async (req, res) => {
        try {
            const data = await Order.findById(req.params.id);
            res.send(data);
        } catch (err) {
            if (err.kind === 'not_found') return res.status(404).send({ message: 'Không tìm thấy' });
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/orders/user/:userId (subquery demo)
    findByUser = async (req, res) => {
        try {
            const userId = req.params.userId || req.user?.userId;
            const data = await Order.findByUser(userId);
            res.send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/orders/me (lấy đơn hàng của user hiện tại)
    findMine = async (req, res) => {
        try {
            const data = await Order.findByUser(req.user.userId);
            res.send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/orders/stats (aggregate demo)
    getStatistics = async (req, res) => {
        try {
            const data = await Order.getStatistics();
            res.send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/orders
    findAll = async (req, res) => {
        try {
            const data = await Order.getAll();
            res.send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    };

    // PUT /api/orders/:id/status
    updateStatus = async (req, res) => {
        try {
            const data = await Order.updateStatus(req.params.id, req.body.status);
            res.send(data);
        } catch (err) {
            if (err.kind === 'not_found') return res.status(404).send({ message: 'Không tìm thấy' });
            res.status(500).send({ message: err.message });
        }
    };
}

export default new OrderController();
