import React from 'react';
import { Link } from 'react-router-dom';
import { StarFill, BagPlus } from 'react-bootstrap-icons';
import { formatCurrency, normalizeProduct } from '../../utils/format';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

const FALLBACK_IMG = 'https://placehold.co/300x300/eeeeee/999999?text=No+Image';

export default function ProductCard({ product }) {
    const p = normalizeProduct(product);
    const { addItem } = useCart();
    const { show } = useToast();

    function handleAdd(e) {
        e.preventDefault();
        e.stopPropagation();
        addItem(p, 1);
        show(`Đã thêm "${p.name}" vào giỏ`, 'success');
    }

    return (
        <Link
            to={`/product/${p.product_id}`}
            className="bg-white shadow-sm hover:shadow-lg hover:border-shopee-500 border border-transparent transition rounded overflow-hidden group relative"
        >
            <div className="relative w-full pt-[100%] bg-gray-100">
                <img
                    src={p.image_url || FALLBACK_IMG}
                    alt={p.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onError={e => { e.target.src = FALLBACK_IMG; }}
                />
            </div>
            <div className="p-2">
                <h3 className="text-sm text-gray-700 line-clamp-2 min-h-[40px] mb-1 group-hover:text-shopee-500">
                    {p.name}
                </h3>
                <div className="text-lg text-shopee-500 font-bold mb-1">
                    {formatCurrency(p.price)}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-0.5">
                        <StarFill className="text-yellow-400" size={10} />
                        <span>4.8</span>
                    </div>
                    <span>Tồn kho: {p.stock_quantity}</span>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full mt-2 bg-shopee-50 hover:bg-shopee-500 hover:text-white text-shopee-500 text-xs font-semibold py-1.5 rounded flex items-center justify-center gap-1 transition"
                >
                    <BagPlus size={14} /> Thêm vào giỏ
                </button>
            </div>
        </Link>
    );
}
