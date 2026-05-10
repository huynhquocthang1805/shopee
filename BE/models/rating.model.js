/**
 * rating.model.js — Quản lý đánh giá / bình luận sản phẩm
 */
import oracledb from 'oracledb';
import { getConnection } from '../config/configDatabase.js';

const Rating = {};

// Lấy tất cả rating của 1 sản phẩm + thông tin người đánh giá
Rating.findByProduct = async (productId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT r.rating_id,
                    r.user_id,
                    r.product_id,
                    r.rating,
                    r.rating_comment,
                    r.created_at,
                    u.first_name || ' ' || u.last_name AS reviewer_name,
                    u.username                          AS reviewer_username
             FROM   RATING r
             JOIN   USERS u ON r.user_id = u.user_id
             WHERE  r.product_id = :p_pid
             ORDER  BY r.created_at DESC`,
            { p_pid: productId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

// Tổng hợp: số sao trung bình + tổng số lượt đánh giá
Rating.getSummary = async (productId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT NVL(AVG(rating), 0) AS avg_rating,
                    COUNT(*)            AS total_count
             FROM RATING
             WHERE product_id = :p_pid`,
            { p_pid: productId }
        );
        return result.rows[0];
    } finally {
        await conn.close();
    }
};

// Tạo rating mới (1 user chỉ được đánh giá 1 sản phẩm 1 lần — sẽ update nếu đã có)
Rating.create = async ({ user_id, product_id, rating, rating_comment }) => {
    const conn = await getConnection();
    try {
        // Check đã đánh giá chưa
        const existing = await conn.execute(
            `SELECT rating_id FROM RATING
             WHERE user_id = :p_uid AND product_id = :p_pid`,
            { p_uid: user_id, p_pid: product_id }
        );

        if (existing.rows.length > 0) {
            // Update rating hiện có
            const ratingId = existing.rows[0].RATING_ID;
            await conn.execute(
                `UPDATE RATING
                 SET rating = :p_rating,
                     rating_comment = :p_comment,
                     created_at = SYSTIMESTAMP
                 WHERE rating_id = :p_id`,
                { p_rating: rating, p_comment: rating_comment, p_id: ratingId },
                { autoCommit: true }
            );
            return { rating_id: ratingId, updated: true };
        }

        // Insert mới
        const result = await conn.execute(
            `INSERT INTO RATING (user_id, product_id, rating, rating_comment)
             VALUES (:p_uid, :p_pid, :p_rating, :p_comment)
             RETURNING rating_id INTO :p_new_id`,
            {
                p_uid:     user_id,
                p_pid:     product_id,
                p_rating:  rating,
                p_comment: rating_comment,
                p_new_id:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            },
            { autoCommit: true }
        );
        return { rating_id: result.outBinds.p_new_id[0], updated: false };
    } finally {
        await conn.close();
    }
};

Rating.remove = async (ratingId, userId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `DELETE FROM RATING
             WHERE rating_id = :p_id AND user_id = :p_uid`,
            { p_id: ratingId, p_uid: userId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) throw { kind: 'not_found_or_unauthorized' };
        return { deleted: true };
    } finally {
        await conn.close();
    }
};

export default Rating;
