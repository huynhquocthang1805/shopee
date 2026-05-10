/**
 * order.model.js - Oracle version (FIXED v2)
 *
 * Sửa lỗi:
 *   1. ORA-01745: bind `:uid` → `:p_user_id`
 *   2. ORA-01747: items dùng `p.name` không tồn tại → đổi thành `p.product_name`
 *      (KHÔNG dùng alias để tránh xung đột với reserved word)
 */
import oracledb from 'oracledb';
import { getConnection } from '../config/configDatabase.js';

const Order = function (order) {
    this.user_id          = order.user_id;
    this.status           = order.status || 'pending';
    this.delivery_address = order.delivery_address;
};

Order.create = async (newOrder, items) => {
    const conn = await getConnection();
    try {
        const orderResult = await conn.execute(
            `INSERT INTO ORDERS (order_id, user_id, status, delivery_address, total_amount, created_at)
             VALUES ('O' || TO_CHAR(SYSDATE, 'YYMM') || LPAD(SEQ_ORDERS.NEXTVAL, 5, '0'),
                     :p_user_id, :p_status, :p_addr, 0, SYSTIMESTAMP)
             RETURNING order_id INTO :p_order_id`,
            {
                p_user_id:  newOrder.user_id,
                p_status:   newOrder.status,
                p_addr:     newOrder.delivery_address,
                p_order_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            }
        );

        const orderId = orderResult.outBinds.p_order_id[0];

        let totalAmount = 0;
        const detailRows = [];

        for (const item of items) {
            const priceResult = await conn.execute(
                `SELECT price, stock_quantity FROM PRODUCT
                 WHERE product_id = :p_pid FOR UPDATE`,
                { p_pid: item.product_id }
            );

            if (priceResult.rows.length === 0) {
                throw new Error(`Sản phẩm ${item.product_id} không tồn tại`);
            }

            const { PRICE: price, STOCK_QUANTITY: stock } = priceResult.rows[0];

            if (stock < item.quantity) {
                throw new Error(`Sản phẩm ${item.product_id} không đủ tồn kho (còn ${stock})`);
            }

            const subtotal = Number(price) * item.quantity;
            totalAmount += subtotal;

            detailRows.push({
                order_id:   orderId,
                product_id: item.product_id,
                quantity:   item.quantity,
                unit_price: price,
                subtotal:   subtotal,
            });

            await conn.execute(
                `UPDATE PRODUCT SET stock_quantity = stock_quantity - :p_qty
                 WHERE product_id = :p_pid`,
                { p_qty: item.quantity, p_pid: item.product_id }
            );
        }

        await conn.executeMany(
            `INSERT INTO ORDER_DETAIL (order_detail_id, order_id, product_id, quantity, unit_price, subtotal)
             VALUES ('OD' || LPAD(SEQ_ORDER_DETAIL.NEXTVAL, 7, '0'),
                     :order_id, :product_id, :quantity, :unit_price, :subtotal)`,
            detailRows
        );

        await conn.execute(
            `UPDATE ORDERS SET total_amount = :p_total WHERE order_id = :p_id`,
            { p_total: totalAmount, p_id: orderId }
        );

        await conn.commit();

        console.log(`✅ Order ${orderId} created with total ${totalAmount}`);
        return {
            order_id:     orderId,
            total_amount: totalAmount,
            items:        detailRows,
        };

    } catch (err) {
        await conn.rollback();
        console.error('Lỗi tạo order:', err.message);
        throw err;
    } finally {
        await conn.close();
    }
};

Order.findById = async (orderId) => {
    const conn = await getConnection();
    try {
        const headerResult = await conn.execute(
            `SELECT o.order_id, o.user_id, o.status, o.delivery_address,
                    o.total_amount, o.created_at,
                    u.first_name || ' ' || u.last_name AS customer_name,
                    u.email, u.phone_number
             FROM   ORDERS o
             JOIN   USERS u ON o.user_id = u.user_id
             WHERE  o.order_id = :p_id`,
            { p_id: orderId }
        );

        if (headerResult.rows.length === 0) throw { kind: 'not_found' };
        const order = headerResult.rows[0];

        // Items: dùng product_name (không alias) — FE format.js sẽ map về i.name
        const itemsResult = await conn.execute(
            `SELECT od.order_detail_id, od.product_id, od.quantity,
                    od.unit_price, od.subtotal,
                    p.product_name,
                    p.image_url
             FROM   ORDER_DETAIL od
             JOIN   PRODUCT p ON od.product_id = p.product_id
             WHERE  od.order_id = :p_id`,
            { p_id: orderId }
        );

        order.items = itemsResult.rows;
        return order;
    } finally {
        await conn.close();
    }
};

// findByUser: bind name `:p_user_id` (đã sửa từ :uid để tránh ORA-01745)
Order.findByUser = async (userId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT o.order_id, o.user_id, o.status, o.delivery_address,
                    o.total_amount, o.created_at, o.updated_at,
                    (SELECT COUNT(*) FROM ORDER_DETAIL od WHERE od.order_id = o.order_id)
                       AS item_count
             FROM   ORDERS o
             WHERE  o.user_id = :p_user_id
             ORDER BY o.created_at DESC`,
            { p_user_id: userId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

Order.getStatistics = async () => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT
                COUNT(*)                                   AS total_orders,
                SUM(total_amount)                          AS total_revenue,
                AVG(total_amount)                          AS avg_order_value,
                MAX(total_amount)                          AS largest_order,
                COUNT(DISTINCT user_id)                    AS unique_customers,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
                SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending_count
             FROM ORDERS`
        );
        return result.rows[0];
    } finally {
        await conn.close();
    }
};

Order.updateStatus = async (orderId, status) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `UPDATE ORDERS SET status = :p_status, updated_at = SYSTIMESTAMP
             WHERE order_id = :p_id`,
            { p_status: status, p_id: orderId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) throw { kind: 'not_found' };
        return { order_id: orderId, status };
    } finally {
        await conn.close();
    }
};

Order.getAll = async () => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT * FROM ORDERS ORDER BY created_at DESC`
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

export default Order;