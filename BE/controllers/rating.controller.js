/**
 * rating.controller.js
 */
import Rating from '../models/rating.model.js';

class RatingController {
    // GET /api/products/:id/ratings
    listByProduct = async (req, res) => {
        try {
            const productId = req.params.id;
            const [ratings, summary] = await Promise.all([
                Rating.findByProduct(productId),
                Rating.getSummary(productId),
            ]);
            res.send({
                summary: {
                    avg_rating:  Number(summary.AVG_RATING) || 0,
                    total_count: Number(summary.TOTAL_COUNT) || 0,
                },
                ratings,
            });
        } catch (err) {
            console.error('Lỗi list ratings:', err);
            res.status(500).send({ message: err.message });
        }
    };

    // POST /api/products/:id/ratings  (auth required)
    create = async (req, res) => {
        try {
            const productId = req.params.id;
            const { rating, rating_comment } = req.body;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).send({ message: 'Số sao phải từ 1 đến 5' });
            }

            const result = await Rating.create({
                user_id:        req.user.userId,
                product_id:     productId,
                rating:         Number(rating),
                rating_comment: rating_comment || null,
            });

            res.status(result.updated ? 200 : 201).send({
                message: result.updated ? 'Đã cập nhật đánh giá' : 'Đã tạo đánh giá',
                ...result,
            });
        } catch (err) {
            console.error('Lỗi tạo rating:', err);
            res.status(500).send({ message: err.message });
        }
    };

    // DELETE /api/ratings/:ratingId  (auth required, chỉ owner)
    remove = async (req, res) => {
        try {
            await Rating.remove(req.params.ratingId, req.user.userId);
            res.send({ message: 'Đã xóa đánh giá' });
        } catch (err) {
            if (err.kind === 'not_found_or_unauthorized') {
                return res.status(404).send({ message: 'Không tìm thấy hoặc không phải của bạn' });
            }
            res.status(500).send({ message: err.message });
        }
    };
}

export default new RatingController();
