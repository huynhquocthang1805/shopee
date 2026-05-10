import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Cart3, BoxArrowRight, ArrowLeft, StarFill } from 'react-bootstrap-icons';
import { productApi } from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, normalizeProduct } from '../utils/format';

const FALLBACK = 'https://placehold.co/450x450/eeeeee/999999?text=No+Image';

export default function ProductDetailPage() {
    const { id } = useParams();
    const nav    = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [quantity, setQuantity] = useState(1);

    const { addItem } = useCart();
    const { show }    = useToast();
    const { user }    = useAuth();

    useEffect(() => {
        setLoading(true); setError(null);
        productApi.getById(id)
            .then(data => setProduct(normalizeProduct(data)))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    function handleAddToCart() {
        addItem(product, quantity);
        show(`Đã thêm ${quantity} ${product.name} vào giỏ`, 'success');
    }

    function handleBuyNow() {
        if (!user) {
            show('Cần đăng nhập để mua hàng', 'warning');
            nav('/login');
            return;
        }
        addItem(product, quantity);
        nav('/cart');
    }

    if (loading) return <div className="bg-white p-12 text-center text-gray-500 rounded">Đang tải sản phẩm...</div>;
    if (error)   return <div className="bg-red-50 p-6 rounded text-red-700">Lỗi: {error}</div>;
    if (!product) return null;

    const inStock = product.stock_quantity > 0;

    return (
        <div>
            <Link to="/" className="inline-flex items-center gap-1 text-shopee-500 hover:underline text-sm mb-3">
                <ArrowLeft size={14}/> Trở về
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5">
                    <img
                        src={product.image_url || FALLBACK}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-lg border"
                        onError={e => { e.target.src = FALLBACK; }}
                    />
                </div>

                <div className="md:col-span-7">
                    <h1 className="text-xl font-medium text-gray-800 leading-snug">{product.name}</h1>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1 text-shopee-500">
                            <StarFill size={14}/>
                            <span>4.8</span>
                        </div>
                        <span>|</span>
                        <span>Đã bán: 99+</span>
                        <span>|</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{product.product_id}</span>
                    </div>

                    <div className="bg-shopee-50 px-4 py-3 mt-3 rounded">
                        <span className="text-3xl font-bold text-shopee-500">
                            {formatCurrency(product.price)}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                        {product.brand && (
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500">Thương hiệu</span>
                                <span className="col-span-2">{product.brand}</span>
                            </div>
                        )}
                        {product.origin && (
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500">Xuất xứ</span>
                                <span className="col-span-2">{product.origin}</span>
                            </div>
                        )}
                        {product.weight && (
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500">Khối lượng</span>
                                <span className="col-span-2">{product.weight}g</span>
                            </div>
                        )}
                        {product.size && (
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500">Kích thước</span>
                                <span className="col-span-2">{product.size}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <span className="text-gray-500">Số lượng</span>
                            <div className="col-span-2 flex items-center gap-3">
                                <div className="flex items-center border rounded">
                                    <button
                                        className="px-3 py-1 hover:bg-gray-100 border-r"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >−</button>
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-12 text-center outline-none"
                                    />
                                    <button
                                        className="px-3 py-1 hover:bg-gray-100 border-l"
                                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                    >+</button>
                                </div>
                                <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                                    {inStock ? `Còn ${product.stock_quantity} sản phẩm` : 'Hết hàng'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            disabled={!inStock}
                            onClick={handleAddToCart}
                            className="flex-1 bg-shopee-50 hover:bg-shopee-100 text-shopee-500 border border-shopee-500 px-6 py-3 rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Cart3 size={18}/> Thêm vào giỏ
                        </button>
                        <button
                            disabled={!inStock}
                            onClick={handleBuyNow}
                            className="flex-1 bg-shopee-500 hover:bg-shopee-600 text-white px-6 py-3 rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BoxArrowRight size={18}/> Mua ngay
                        </button>
                    </div>
                </div>
            </div>

            {product.description && (
                <div className="bg-white rounded-lg shadow-sm p-6 mt-3">
                    <h2 className="font-bold text-base border-b pb-2 mb-3">Mô tả sản phẩm</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
                </div>
            )}
        </div>
    );
}
