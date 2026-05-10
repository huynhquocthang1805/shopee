/**
 * order.model.js - Oracle version
 *
 * Demo phức tạp hơn: tạo order CÓ TRANSACTION với nhiều bảng:
 *   1. ORDERS    (header)
 *   2. ORDER_DETAIL (line items)
 *   3. PAYMENT, DELIVERY (sub-info)
 * Tất cả nằm trong cùng 1 transaction → COMMIT một lần.
 */
import oracledb from 'oracledb';
import { getConnection } from '../config/configDatabase.js';

const Order = function (order) {
    this.user_id          = order.user_id;
    this.status           = order.status || 'pending';
    this.delivery_address = order.delivery_address;
};

// =============================================================
// 1. CREATE ORDER + DETAILS (Transaction quan trọng nhất)
// =============================================================
Order.create = async (newOrder, items) => {
    const conn = await getConnection();
    try {
        // -- 1.1 Tạo ORDER header → lấy order_id từ sequence --
        const orderResult = await conn.execute(
            `INSERT INTO ORDERS (order_id, user_id, status, delivery_address, total_amount, created_at)
             VALUES ('O' || TO_CHAR(SYSDATE, 'YYMM') || LPAD(SEQ_ORDERS.NEXTVAL, 5, '0'),
                     :user_id, :status, :addr, 0, SYSTIMESTAMP)
             RETURNING order_id INTO :p_order_id`,
            {
                user_id:    newOrder.user_id,
                status:     newOrder.status,
                addr:       newOrder.delivery_address,
                p_order_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            }
        );

        const orderId = orderResult.outBinds.p_order_id[0];

        // -- 1.2 Insert ORDER_DETAIL cho từng item --
        let totalAmount = 0;
        const detailRows = [];

        for (const item of items) {
            // Lấy giá hiện tại của sản phẩm (snapshot tại thời điểm đặt hàng)
            const priceResult = await conn.execute(
                `SELECT price, stock_quantity FROM PRODUCT
                 WHERE product_id = :pid FOR UPDATE`,  // FOR UPDATE = lock row cho concurrency
                { pid: item.product_id }
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

            // Trừ tồn kho
            await conn.execute(
                `UPDATE PRODUCT SET stock_quantity = stock_quantity - :q
                 WHERE product_id = :pid`,
                { q: item.quantity, pid: item.product_id }
            );
        }

        // Bulk insert ORDER_DETAIL
        await conn.executeMany(
            `INSERT INTO ORDER_DETAIL (order_detail_id, order_id, product_id, quantity, unit_price, subtotal)
             VALUES ('OD' || LPAD(SEQ_ORDER_DETAIL.NEXTVAL, 7, '0'),
                     :order_id, :product_id, :quantity, :unit_price, :subtotal)`,
            detailRows
        );

        // -- 1.3 Cập nhật total_amount của ORDERS --
        await conn.execute(
            `UPDATE ORDERS SET total_amount = :total WHERE order_id = :id`,
            { total: totalAmount, id: orderId }
        );

        // -- COMMIT toàn bộ transaction --
        await conn.commit();

        console.log(`✅ Order ${orderId} created with total ${totalAmount}`);
        return {
            order_id:     orderId,
            total_amount: totalAmount,
            items:        detailRows,
        };

    } catch (err) {
        await conn.rollback();   // → rollback tất cả nếu có lỗi
        console.error('Lỗi tạo order:', err.message);
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 2. FIND BY ID (JOIN nhiều bảng - Query loại f)
// =============================================================
Order.findById = async (orderId) => {
    const conn = await getConnection();
    try {
        // Header
        const headerResult = await conn.execute(
            `SELECT o.order_id, o.user_id, o.status, o.delivery_address,
                    o.total_amount, o.created_at,
                    u.first_name || ' ' || u.last_name AS customer_name,
                    u.email, u.phone_number
             FROM   ORDERS o
             JOIN   USERS u ON o.user_id = u.user_id
             WHERE  o.order_id = :id`,
            { id: orderId }
        );

        if (headerResult.rows.length === 0) throw { kind: 'not_found' };
        const order = headerResult.rows[0];

        // Items
        const itemsResult = await conn.execute(
            `SELECT od.order_detail_id, od.product_id, od.quantity,
                    od.unit_price, od.subtotal, p.name, p.image_url
             FROM   ORDER_DETAIL od
             JOIN   PRODUCT p ON od.product_id = p.product_id
             WHERE  od.order_id = :id`,
            { id: orderId }
        );

        order.items = itemsResult.rows;
        return order;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 3. GET ORDERS BY USER (Query với subquery - loại g)
// =============================================================
Order.findByUser = async (userId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT o.*,
                    (SELECT COUNT(*) FROM ORDER_DETAIL od WHERE od.order_id = o.order_id)
                       AS item_count
             FROM   ORDERS o
             WHERE  o.user_id = :uid
             ORDER BY o.created_at DESC`,
            { uid: userId }
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 4. STATISTICS (Aggregate functions - loại h)
// =============================================================
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

// =============================================================
// 5. UPDATE STATUS
// =============================================================
Order.updateStatus = async (orderId, status) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `UPDATE ORDERS SET status = :s, updated_at = SYSTIMESTAMP
             WHERE order_id = :id`,
            { s: status, id: orderId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) throw { kind: 'not_found' };
        return { order_id: orderId, status };
    } finally {
        await conn.close();
    }
};

// =============================================================
// 6. GET ALL
// =============================================================
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
