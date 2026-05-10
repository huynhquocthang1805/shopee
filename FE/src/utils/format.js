export function formatCurrency(amount) {
    if (amount == null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

// Bridge giữa Oracle (UPPERCASE keys) và normal JS (lowercase)
// Hỗ trợ cả PRODUCT_NAME / PRODUCT_SIZE (tên cột thật trong DB)
// vì BE không thể alias `AS size` (SIZE là reserved word của Oracle gây ORA-00923)
export function normalizeProduct(p) {
    if (!p) return null;
    return {
        product_id:     p.PRODUCT_ID     || p.product_id,
        user_id:        p.USER_ID        || p.user_id,
        name:           p.PRODUCT_NAME   || p.product_name || p.NAME || p.name,
        weight:         p.WEIGHT         || p.weight,
        size:           p.PRODUCT_SIZE   || p.product_size || p.SIZE || p.size,
        origin:         p.ORIGIN         || p.origin,
        brand:          p.BRAND          || p.brand,
        description:    p.DESCRIPTION    || p.description,
        price:          Number(p.PRICE   || p.price || 0),
        stock_quantity: Number(p.STOCK_QUANTITY || p.stock_quantity || 0),
        image_url:      p.IMAGE_URL      || p.image_url,
        status:         p.STATUS         || p.status,
        created_at:     p.CREATED_AT     || p.created_at,
        category_ids:   p.category_ids   || [],
    };
}

export function normalizeOrder(o) {
    if (!o) return null;
    return {
        order_id:         o.ORDER_ID         || o.order_id,
        user_id:          o.USER_ID          || o.user_id,
        status:           o.STATUS           || o.status,
        delivery_address: o.DELIVERY_ADDRESS || o.delivery_address,
        total_amount:     Number(o.TOTAL_AMOUNT || o.total_amount || 0),
        created_at:       o.CREATED_AT       || o.created_at,
        item_count:       o.ITEM_COUNT       || o.item_count,
        items:            (o.items || []).map(i => ({
            product_id: i.PRODUCT_ID || i.product_id,
            name:       i.PRODUCT_NAME || i.product_name || i.NAME || i.name,
            quantity:   i.QUANTITY   || i.quantity,
            unit_price: Number(i.UNIT_PRICE || i.unit_price || 0),
            subtotal:   Number(i.SUBTOTAL || i.subtotal || 0),
            image_url:  i.IMAGE_URL || i.image_url,
        })),
        customer_name: o.CUSTOMER_NAME || o.customer_name,
        email:         o.EMAIL         || o.email,
    };
}

export function normalizeRating(r) {
    if (!r) return null;
    return {
        rating_id:        r.RATING_ID         || r.rating_id,
        user_id:          r.USER_ID           || r.user_id,
        product_id:       r.PRODUCT_ID        || r.product_id,
        rating:           Number(r.RATING     || r.rating || 0),
        rating_comment:   r.RATING_COMMENT    || r.rating_comment,
        created_at:       r.CREATED_AT        || r.created_at,
        reviewer_name:    r.REVIEWER_NAME     || r.reviewer_name,
        reviewer_username: r.REVIEWER_USERNAME || r.reviewer_username,
    };
}
