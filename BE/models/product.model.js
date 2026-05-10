/**
 * product.model.js - Oracle version (FIXED v2)
 *
 * Sửa lỗi:
 *   1. ORA-01745: bind `:uid` → `:p_user_id` (UID là hàm dựng sẵn của Oracle)
 *   2. ORA-01747: cột `name`/`size` không tồn tại → dùng `product_name`/`product_size`
 *   3. ORA-00923: bỏ alias `AS size` (vì SIZE là từ khóa dự phòng/reserved trong Oracle)
 *      → SELECT trả về cột gốc PRODUCT_NAME, PRODUCT_SIZE
 *      → FE format.js đã được cập nhật để map về name/size
 */
import oracledb from 'oracledb';
import { getConnection } from '../config/configDatabase.js';

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

Product.create = async (newProduct) => {
    const conn = await getConnection();
    try {
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
                p_new_product_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            }
        );

        const productId = result.outBinds.p_new_product_id;
        if (!productId) throw new Error('Không thể tạo sản phẩm.');

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

Product.findById = async (productId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT p.product_id,
                    p.user_id,
                    p.product_name,
                    p.weight,
                    p.product_size,
                    p.origin,
                    p.brand,
                    p.description,
                    p.price,
                    p.stock_quantity,
                    p.image_url,
                    p.status,
                    p.created_at,
                    LISTAGG(b.category_id, ',') WITHIN GROUP (ORDER BY b.category_id) AS category_ids
             FROM   PRODUCT p
             LEFT JOIN BELONG b ON p.product_id = b.product_id
             WHERE  p.product_id = :p_id
             GROUP BY p.product_id, p.user_id, p.product_name, p.weight, p.product_size,
                      p.origin, p.brand, p.description, p.price,
                      p.stock_quantity, p.image_url, p.status, p.created_at`,
            { p_id: productId }
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

Product.getAll = async () => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT p.product_id, p.user_id, p.product_name, p.weight, p.product_size,
                    p.origin, p.brand, p.description, p.price,
                    p.stock_quantity, p.image_url, p.status, p.created_at
             FROM PRODUCT p
             WHERE p.status = 'active'
             ORDER BY p.created_at DESC`
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

Product.findByCategory = async (categoryId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT p.product_id, p.user_id, p.product_name, p.weight, p.product_size,
                    p.origin, p.brand, p.description, p.price,
                    p.stock_quantity, p.image_url, p.status, p.created_at
             FROM   PRODUCT p
             JOIN   BELONG b ON p.product_id = b.product_id
             WHERE  b.category_id = :p_cat_id
               AND  p.status = 'active'`,
            { p_cat_id: categoryId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

Product.findBySeller = async (sellerId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT p.product_id, p.user_id, p.product_name, p.weight, p.product_size,
                    p.origin, p.brand, p.description, p.price,
                    p.stock_quantity, p.image_url, p.status, p.created_at
             FROM PRODUCT p
             WHERE p.user_id = :p_user_id
             ORDER BY p.created_at DESC`,
            { p_user_id: sellerId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

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

        if (product.category_ids) {
            await conn.execute(
                `DELETE FROM BELONG WHERE product_id = :p_id`,
                { p_id: productId }
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
        if (err.errorNum === 20011 || /không tồn tại|không thuộc/.test(err.message)) {
            throw { kind: 'not_found_or_unauthorized' };
        }
        throw err;
    } finally {
        await conn.close();
    }
};

Product.remove = async (productId, userId) => {
    const conn = await getConnection();
    try {
        await conn.execute(
            `BEGIN delete_product(:p_id, :p_user_id); END;`,
            { p_id: productId, p_user_id: userId },
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

Product.search = async ({ keyword, minPrice, maxPrice, categoryId }) => {
    const conn = await getConnection();
    try {
        let sql = `
            SELECT p.product_id,
                   p.product_name,
                   p.price,
                   p.stock_quantity,
                   p.image_url,
                   p.product_size,
                   p.brand,
                   p.origin,
                   COUNT(r.rating_id) AS review_count,
                   AVG(r.rating)      AS avg_rating
            FROM   PRODUCT p
            LEFT JOIN RATING r ON p.product_id = r.product_id
            WHERE  p.status = 'active'`;
        const params = {};

        if (keyword) {
            sql += ` AND LOWER(p.product_name) LIKE LOWER(:p_kw)`;
            params.p_kw = `%${keyword}%`;
        }
        if (minPrice !== undefined) {
            sql += ` AND p.price >= :p_min`;
            params.p_min = minPrice;
        }
        if (maxPrice !== undefined) {
            sql += ` AND p.price <= :p_max`;
            params.p_max = maxPrice;
        }
        if (categoryId) {
            sql += ` AND p.product_id IN (
                       SELECT product_id FROM BELONG WHERE category_id = :p_cat_id
                     )`;
            params.p_cat_id = categoryId;
        }

        sql += ` GROUP BY p.product_id, p.product_name, p.price, p.stock_quantity,
                          p.image_url, p.product_size, p.brand, p.origin, p.created_at
                 ORDER BY p.created_at DESC`;

        const result = await conn.execute(sql, params);
        return result.rows;
    } finally {
        await conn.close();
    }
};

export default Product;