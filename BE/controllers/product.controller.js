/**
 * product.controller.js
 * REST endpoints cho PRODUCT (CRUD + search).
 */
import Product from '../models/product.model.js';

class ProductController {
    // GET /api/products
    findAll = async (req, res) => {
        try {
            const data = await Product.getAll();
            res.send(data);
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/products/:id
    findOne = async (req, res) => {
        try {
            const data = await Product.findById(req.params.id);
            res.send(data);
        } catch (err) {
            if (err.kind === 'not_found') {
                return res.status(404).send({ message: 'Sản phẩm không tồn tại' });
            }
            res.status(500).send({ message: err.message });
        }
    };

    // POST /api/products (yêu cầu seller)
    create = async (req, res) => {
        try {
            // Lấy user_id từ JWT (req.user) hoặc body (cho test)
            const ownerId = req.user?.userId || req.body.user_id;
            if (!ownerId) return res.status(400).send({ message: 'Cần user_id' });

            const product = {
                user_id: ownerId,
                category_ids: req.body.category_ids || [],
                name: req.body.name,
                weight: req.body.weight || 0,
                size: req.body.size || '',
                origin: req.body.origin || '',
                brand: req.body.brand || '',
                description: req.body.description || '',
                price: req.body.price,
                stock_quantity: req.body.stock_quantity || 0,
                image_url: req.body.image_url || '',
                status: req.body.status || 'active',
            };

            const data = await Product.create(product);
            res.status(201).send(data);
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: err.message });
        }
    };

    // PUT /api/products/:id
    update = async (req, res) => {
        try {
            const data = await Product.updateById(req.params.id, {
                user_id: req.user?.userId || req.body.user_id,
                category_ids: req.body.category_ids,
                name: req.body.name,
                weight: req.body.weight,
                size: req.body.size,
                origin: req.body.origin,
                brand: req.body.brand,
                description: req.body.description,
                price: req.body.price,
                stock_quantity: req.body.stock_quantity,
                image_url: req.body.image_url,
                status: req.body.status,
            });
            res.send(data);
        } catch (err) {
            if (err.kind === 'not_found_or_unauthorized') {
                return res.status(404).send({ message: 'Không tìm thấy hoặc không có quyền' });
            }
            res.status(500).send({ message: err.message });
        }
    };

    // DELETE /api/products/:id
    delete = async (req, res) => {
        try {
            const userId = req.user?.userId || req.body.user_id;
            const data = await Product.remove(req.params.id, userId);
            res.send(data);
        } catch (err) {
            if (err.kind === 'not_found') return res.status(404).send({ message: 'Không tồn tại' });
            if (err.kind === 'cannot_delete_ordered') return res.status(400).send({ message: 'Sản phẩm đã có đơn hàng' });
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/products/seller/:sellerId
    findBySeller = async (req, res) => {
        try {
            const data = await Product.findBySeller(req.params.sellerId);
            res.send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    };

    // GET /api/products/search?keyword=&minPrice=&maxPrice=&categoryId=
    search = async (req, res) => {
        try {
            const data = await Product.search({
                keyword: req.query.keyword,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                categoryId: req.query.categoryId,
            });
            res.send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    };
}

export default new ProductController();
