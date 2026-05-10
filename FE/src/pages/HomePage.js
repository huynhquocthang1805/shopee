import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { productApi } from '../api/api';
import { ExclamationTriangle, ArrowClockwise } from 'react-bootstrap-icons';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [searchParams]          = useSearchParams();
    const [filters, setFilters]   = useState({
        keyword:  '',
        minPrice: '',
        maxPrice: '',
    });

    const keywordFromUrl = searchParams.get('keyword') || '';

    async function load() {
        setLoading(true); setError(null);
        try {
            let data;
            if (keywordFromUrl || filters.minPrice || filters.maxPrice) {
                data = await productApi.search({
                    keyword:  keywordFromUrl || filters.keyword,
                    minPrice: filters.minPrice || undefined,
                    maxPrice: filters.maxPrice || undefined,
                });
            } else {
                data = await productApi.getAll();
            }
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keywordFromUrl]);

    return (
        <div>
            {/* Banner */}
            <div className="bg-gradient-to-r from-shopee-500 to-orange-400 rounded-lg p-6 text-white mb-4">
                <h1 className="text-2xl font-bold">🎉 Shopee Sale Đỉnh Cao</h1>
                <p className="mt-1 text-sm opacity-90">Chào mừng đến với e-commerce demo · Backend Oracle Database</p>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded shadow-sm mb-3 flex flex-wrap items-center gap-2">
                <input
                    type="number"
                    placeholder="Giá từ"
                    value={filters.minPrice}
                    onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                    className="border px-3 py-1.5 rounded text-sm w-32"
                />
                <input
                    type="number"
                    placeholder="Giá đến"
                    value={filters.maxPrice}
                    onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="border px-3 py-1.5 rounded text-sm w-32"
                />
                <button
                    onClick={load}
                    className="bg-shopee-500 hover:bg-shopee-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                >Lọc</button>
                {keywordFromUrl && (
                    <span className="ml-2 text-sm text-gray-600">
                        Từ khóa: <strong>"{keywordFromUrl}"</strong>
                    </span>
                )}
            </div>

            <div className="bg-white p-4 border-b-4 border-shopee-500 rounded-t shadow-sm flex items-center justify-between">
                <h2 className="text-shopee-500 font-bold uppercase text-base">Sản phẩm gợi ý</h2>
                <button onClick={load} className="text-sm text-gray-500 hover:text-shopee-500 flex items-center gap-1">
                    <ArrowClockwise size={14}/> Tải lại
                </button>
            </div>

            {loading && (
                <div className="bg-white p-12 text-center text-gray-500 rounded-b shadow-sm">
                    Đang tải dữ liệu từ Oracle...
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 flex items-start gap-3">
                    <ExclamationTriangle size={20} className="mt-0.5"/>
                    <div>
                        <div className="font-semibold">Lỗi tải sản phẩm</div>
                        <div className="text-sm mt-1">{error}</div>
                        <button onClick={load} className="mt-2 text-sm underline">Thử lại</button>
                    </div>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="bg-white p-12 text-center text-gray-500 rounded-b shadow-sm">
                    Không có sản phẩm nào. {keywordFromUrl && 'Thử từ khóa khác.'}
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {products.map(p => (
                        <ProductCard key={p.PRODUCT_ID || p.product_id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
