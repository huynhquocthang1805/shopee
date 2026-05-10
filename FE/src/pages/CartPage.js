import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import { formatCurrency } from '../utils/format';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { orderApi } from '../api/api';

export default function CartPage() {
    const { items, totalAmount, totalCount, clear } = useCart();
    const { user }       = useAuth();
    const { show }       = useToast();
    const nav            = useNavigate();
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleCheckout() {
        if (!user) {
            show('Cần đăng nhập để đặt hàng', 'warning');
            nav('/login');
            return;
        }
        if (items.length === 0) {
            show('Giỏ hàng trống', 'warning');
            return;
        }
        if (!address.trim()) {
            show('Cần nhập địa chỉ giao hàng', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const result = await orderApi.create({
                delivery_address: address,
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity:   i.quantity,
                })),
            });
            show(`Đặt hàng thành công! Mã đơn: ${result.order_id}`, 'success', 4000);
            clear();
            nav('/orders');
        } catch (err) {
            show('Lỗi đặt hàng: ' + err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-5xl mb-3">🛒</div>
                <h2 className="text-lg font-medium text-gray-700 mb-2">Giỏ hàng trống</h2>
                <p className="text-sm text-gray-500 mb-4">Hãy chọn sản phẩm yêu thích để mua sắm nào!</p>
                <Link to="/" className="inline-block bg-shopee-500 hover:bg-shopee-600 text-white px-6 py-2 rounded font-medium">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-12 gap-4 bg-white py-3 px-4 rounded shadow-sm mb-3 text-gray-500 text-sm font-medium">
                <div className="col-span-5">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
                <div className="col-span-1 text-center">Xóa</div>
            </div>

            {items.map(item => <CartItem key={item.product_id} item={item} />)}

            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <h3 className="font-bold mb-2 text-sm">Địa chỉ giao hàng</h3>
                <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường, quận, thành phố..."
                    className="w-full border rounded px-3 py-2 text-sm"
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { if (window.confirm('Xóa toàn bộ giỏ hàng?')) clear(); }}
                        className="text-sm text-red-500 hover:underline"
                    >Xóa tất cả</button>
                </div>
                <div className="flex items-center gap-6">
                    <div>
                        <span className="text-base text-gray-700">Tổng ({totalCount} sản phẩm): </span>
                        <span className="text-2xl text-shopee-500 font-bold">{formatCurrency(totalAmount)}</span>
                    </div>
                    <button
                        disabled={submitting}
                        onClick={handleCheckout}
                        className="bg-shopee-500 text-white px-8 py-3 rounded font-medium hover:bg-shopee-600 disabled:opacity-50"
                    >
                        {submitting ? 'Đang đặt...' : 'Mua hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
}
