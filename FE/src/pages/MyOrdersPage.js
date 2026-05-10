import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { orderApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate, normalizeOrder } from '../utils/format';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';

const STATUS_COLORS = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    shipping:   'bg-indigo-100 text-indigo-700',
    completed:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
};

export default function MyOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [expanded, setExpanded] = useState({});
    const [expandedDetails, setExpandedDetails] = useState({});

    useEffect(() => {
        if (!user) return;
        orderApi.getMine()
            .then(data => setOrders(data.map(normalizeOrder)))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return <Navigate to="/login" />;

    async function toggleDetail(orderId) {
        const isOpen = expanded[orderId];
        setExpanded(prev => ({ ...prev, [orderId]: !isOpen }));
        if (!isOpen && !expandedDetails[orderId]) {
            try {
                const detail = await orderApi.getById(orderId);
                setExpandedDetails(prev => ({ ...prev, [orderId]: normalizeOrder(detail) }));
            } catch (e) { /* ignore */ }
        }
    }

    if (loading) return <div className="bg-white p-8 text-center text-gray-500 rounded">Đang tải...</div>;

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h1 className="text-lg font-bold">Đơn hàng của tôi</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Demo query: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">JOIN ORDERS + ORDER_DETAIL + PRODUCT</code> với <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">subquery</code> đếm items
                </p>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded text-red-700">Lỗi: {error}</div>
            )}

            {orders.length === 0 && !error && (
                <div className="bg-white p-12 text-center text-gray-500 rounded">
                    Chưa có đơn hàng nào.{' '}
                    <Link to="/" className="text-shopee-500 hover:underline">Mua sắm ngay</Link>
                </div>
            )}

            <div className="space-y-3">
                {orders.map(o => {
                    const isOpen = expanded[o.order_id];
                    const detail = expandedDetails[o.order_id];
                    return (
                        <div key={o.order_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleDetail(o.order_id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div>
                                        <div className="font-mono text-sm text-shopee-500">{o.order_id}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{formatDate(o.created_at)}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-medium uppercase ${STATUS_COLORS[o.status] || 'bg-gray-100'}`}>
                                        {o.status}
                                    </span>
                                    <span className="text-xs text-gray-500">{o.item_count} sản phẩm</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-shopee-500 font-bold">{formatCurrency(o.total_amount)}</span>
                                    {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="border-t bg-gray-50 px-4 py-3">
                                    {!detail ? (
                                        <div className="text-sm text-gray-500">Đang tải chi tiết...</div>
                                    ) : (
                                        <>
                                            <div className="text-xs text-gray-500 mb-2">
                                                Giao tới: <span className="text-gray-800">{detail.delivery_address}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {detail.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded">
                                                        <img
                                                            src={item.image_url || 'https://placehold.co/60x60'}
                                                            alt=""
                                                            className="w-12 h-12 object-cover rounded"
                                                            onError={e => { e.target.src = 'https://placehold.co/60x60'; }}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {item.quantity} × {formatCurrency(item.unit_price)}
                                                            </div>
                                                        </div>
                                                        <div className="text-shopee-500 font-bold text-sm">
                                                            {formatCurrency(item.subtotal)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
