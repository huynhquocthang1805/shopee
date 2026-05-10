/**
 * product.model.js - Oracle version
 *
 * Khác biệt chính so với MySQL:
 *   1. Bind parameters: dùng :name thay vì ?
 *   2. Procedure output: dùng oracledb.BIND_OUT thay vì @user_var
 *   3. Không có conn.beginTransaction() - tự động trong session
 *   4. conn.commit() / conn.rollback() rõ ràng
 *   5. conn.close() thay vì conn.release()
 *   6. CLOB cho mô tả dài → tự động convert string nhờ fetchAsString config
 */
import oracledb from 'oracledb';
import { getConnection } from '../config/configDatabase.js';

// Constructor giữ nguyên API
const Product = function (product) {
    this.user_id        = product.user_id;
    this.category_ids   = product.category_ids || [];
    this.name           = product.name;
    this.weight         = product.weight;
    this.size           = product.size;
    this.origin         = product.origin;
    this.brand          = product.brand;
    this.description    = product.description;
    this.price          = product.price;
    this.stock_quantity = product.stock_quantity;
    this.image_url      = product.image_url;
    this.status         = product.status || 'active';
};

// =============================================================
// 1. CREATE - Gọi PROCEDURE insert_product với OUT parameter
// =============================================================
Product.create = async (newProduct) => {
    const conn = await getConnection();
    try {
        // Gọi procedure: insert_product(IN... , OUT p_new_product_id)
        const result = await conn.execute(
            `BEGIN
                insert_product(
                    :p_user_id, :p_name, :p_weight, :p_size,
                    :p_origin, :p_brand, :p_description,
                    :p_price, :p_stock, :p_image_url,
                    :p_new_product_id
                );
             END;`,
            {
                p_user_id:        newProduct.user_id,
                p_name:           newProduct.name,
                p_weight:         newProduct.weight,
                p_size:           newProduct.size,
                p_origin:         newProduct.origin,
                p_brand:          newProduct.brand,
                p_description:    newProduct.description,
                p_price:          newProduct.price,
                p_stock:          newProduct.stock_quantity,
                p_image_url:      newProduct.image_url,
                // OUT parameter - nhận về product_id mới
                p_new_product_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            }
        );

        const productId = result.outBinds.p_new_product_id;
        if (!productId) throw new Error('Không thể tạo sản phẩm.');

        // Insert vào bảng BELONG (product ↔ category)
        if (newProduct.category_ids && newProduct.category_ids.length > 0) {
            const belongRows = newProduct.category_ids.map(catId => ({
                p_id: productId,
                c_id: catId,
            }));
            await conn.executeMany(
                `INSERT INTO BELONG (product_id, category_id) VALUES (:p_id, :c_id)`,
                belongRows
            );
        }

        await conn.commit();
        console.log('✅ Product created:', productId);
        return { product_id: productId, ...newProduct };

    } catch (err) {
        await conn.rollback();
        console.error('Lỗi tạo sản phẩm:', err);
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 2. FIND BY ID - Query đơn với LISTAGG để gộp category_ids
// =============================================================
Product.findById = async (productId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT p.*, 
                    LISTAGG(b.category_id, ',') WITHIN GROUP (ORDER BY b.category_id) AS category_ids
             FROM   PRODUCT p
             LEFT JOIN BELONG b ON p.product_id = b.product_id
             WHERE  p.product_id = :id
             GROUP BY p.product_id, p.user_id, p.name, p.weight, p.size,
                      p.origin, p.brand, p.description, p.price,
                      p.stock_quantity, p.image_url, p.status, p.created_at`,
            { id: productId }
        );

        if (result.rows.length === 0) throw { kind: 'not_found' };

        const product = result.rows[0];
        product.category_ids = product.CATEGORY_IDS
            ? product.CATEGORY_IDS.split(',')
            : [];
        return product;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 3. GET ALL
// =============================================================
Product.getAll = async () => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT * FROM PRODUCT WHERE status = 'active' ORDER BY created_at DESC`
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 4. FIND BY CATEGORY (JOIN query)
// =============================================================
Product.findByCategory = async (categoryId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT p.*
             FROM   PRODUCT p
             JOIN   BELONG b ON p.product_id = b.product_id
             WHERE  b.category_id = :cid
               AND  p.status = 'active'`,
            { cid: categoryId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 5. FIND BY SELLER (single condition)
// =============================================================
Product.findBySeller = async (sellerId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT * FROM PRODUCT WHERE user_id = :uid`,
            { uid: sellerId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 6. UPDATE - Gọi PROCEDURE update_product
// =============================================================
Product.updateById = async (productId, product) => {
    const conn = await getConnection();
    try {
        await conn.execute(
            `BEGIN
                update_product(
                    :p_id, :p_user_id, :p_name, :p_weight, :p_size,
                    :p_origin, :p_brand, :p_description,
                    :p_price, :p_stock, :p_image_url, :p_status
                );
             END;`,
            {
                p_id:          productId,
                p_user_id:     product.user_id,
                p_name:        product.name,
                p_weight:      product.weight,
                p_size:        product.size,
                p_origin:      product.origin,
                p_brand:       product.brand,
                p_description: product.description,
                p_price:       product.price,
                p_stock:       product.stock_quantity,
                p_image_url:   product.image_url,
                p_status:      product.status,
            }
        );

        // Cập nhật BELONG nếu có category_ids
        if (product.category_ids) {
            await conn.execute(
                `DELETE FROM BELONG WHERE product_id = :id`,
                { id: productId }
            );
            if (product.category_ids.length > 0) {
                const belongRows = product.category_ids.map(catId => ({
                    p_id: productId,
                    c_id: catId,
                }));
                await conn.executeMany(
                    `INSERT INTO BELONG (product_id, category_id) VALUES (:p_id, :c_id)`,
                    belongRows
                );
            }
        }

        await conn.commit();
        return { product_id: productId, ...product };

    } catch (err) {
        await conn.rollback();
        // Map Oracle error message → kind code
        if (err.errorNum === 20001 || /không tồn tại|không thuộc/.test(err.message)) {
            throw { kind: 'not_found_or_unauthorized' };
        }
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 7. DELETE
// =============================================================
Product.remove = async (productId, userId) => {
    const conn = await getConnection();
    try {
        await conn.execute(
            `BEGIN delete_product(:p_id, :p_uid); END;`,
            { p_id: productId, p_uid: userId },
            { autoCommit: true }
        );
        return { message: 'Product deleted successfully' };
    } catch (err) {
        if (/không tồn tại/.test(err.message)) throw { kind: 'not_found' };
        if (/đã có đơn hàng/.test(err.message)) throw { kind: 'cannot_delete_ordered' };
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 8. DELETE ALL
// =============================================================
Product.removeAll = async () => {
    const conn = await getConnection();
    try {
        await conn.execute(`DELETE FROM BELONG`);
        const result = await conn.execute(`DELETE FROM PRODUCT`);
        await conn.commit();
        return { affectedRows: result.rowsAffected };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 9. SEARCH (composite condition + aggregate)
// =============================================================
Product.search = async ({ keyword, minPrice, maxPrice, categoryId }) => {
    const conn = await getConnection();
    try {
        let sql = `
            SELECT p.product_id, p.name, p.price, p.stock_quantity,
                   COUNT(r.rating_id) AS review_count,
                   AVG(r.rating)      AS avg_rating
            FROM   PRODUCT p
            LEFT JOIN RATING r ON p.product_id = r.product_id
            WHERE  p.status = 'active'`;
        const params = {};

        if (keyword) {
            sql += ` AND LOWER(p.name) LIKE LOWER(:kw)`;
            params.kw = `%${keyword}%`;
        }
        if (minPrice !== undefined) {
            sql += ` AND p.price >= :minP`;
            params.minP = minPrice;
        }
        if (maxPrice !== undefined) {
            sql += ` AND p.price <= :maxP`;
            params.maxP = maxPrice;
        }
        if (categoryId) {
            sql += ` AND p.product_id IN (
                       SELECT product_id FROM BELONG WHERE category_id = :cid
                     )`;
            params.cid = categoryId;
        }

        sql += ` GROUP BY p.product_id, p.name, p.price, p.stock_quantity
                 ORDER BY p.created_at DESC`;

        const result = await conn.execute(sql, params);
        return result.rows;
    } finally {
        await conn.close();
    }
};

export default Product;
