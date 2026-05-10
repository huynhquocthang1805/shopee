import React, { useEffect, useState } from 'react';
import { StarFill, Star } from 'react-bootstrap-icons';
import { ratingApi } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, normalizeRating } from '../../utils/format';

export default function RatingSection({ productId }) {
    const { user } = useAuth();
    const { show } = useToast();

    const [ratings, setRatings] = useState([]);
    const [summary, setSummary] = useState({ avg_rating: 0, total_count: 0 });
    const [loading, setLoading] = useState(true);

    // Form state
    const [showForm, setShowForm]   = useState(false);
    const [stars, setStars]         = useState(5);
    const [comment, setComment]     = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!productId) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    async function load() {
        setLoading(true);
        try {
            const data = await ratingApi.listByProduct(productId);
            setRatings((data.ratings || []).map(normalizeRating));
            setSummary({
                avg_rating:  data.summary?.avg_rating || 0,
                total_count: data.summary?.total_count || 0,
            });
        } catch (err) {
            console.error('Lỗi tải đánh giá:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (stars < 1 || stars > 5) return;
        setSubmitting(true);
        try {
            await ratingApi.create(productId, { rating: stars, rating_comment: comment.trim() });
            show('Đã gửi đánh giá. Cảm ơn bạn!', 'success');
            setComment('');
            setStars(5);
            setShowForm(false);
            load();
        } catch (err) {
            show('Lỗi: ' + err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    }

    const myExisting = user ? ratings.find(r => r.user_id === user.user_id) : null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-3">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h2 className="font-bold text-base">Đánh giá sản phẩm</h2>
                <div className="flex items-center gap-2">
                    <RatingStars value={summary.avg_rating} size={16}/>
                    <span className="text-sm text-gray-700 font-medium">
                        {Number(summary.avg_rating).toFixed(1)}/5
                    </span>
                    <span className="text-xs text-gray-500">
                        ({summary.total_count} đánh giá)
                    </span>
                </div>
            </div>

            {/* Form đánh giá */}
            {user ? (
                showForm ? (
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm text-gray-600">Đánh giá của bạn:</span>
                            <RatingInput value={stars} onChange={setStars}/>
                        </div>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                            rows={3}
                            maxLength={1000}
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                        <div className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border rounded text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-shopee-500 hover:bg-shopee-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                            >
                                {submitting ? 'Đang gửi...' : (myExisting ? 'Cập nhật' : 'Gửi đánh giá')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => {
                            if (myExisting) {
                                setStars(myExisting.rating);
                                setComment(myExisting.rating_comment || '');
                            }
                            setShowForm(true);
                        }}
                        className="mb-4 bg-shopee-50 hover:bg-shopee-100 text-shopee-500 border border-shopee-500 px-4 py-2 rounded text-sm font-medium"
                    >
                        {myExisting ? '✏️ Sửa đánh giá của tôi' : '⭐ Viết đánh giá'}
                    </button>
                )
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm mb-4">
                    Bạn cần <a href="/login" className="text-shopee-500 underline font-medium">đăng nhập</a> để đánh giá sản phẩm.
                </div>
            )}

            {/* List đánh giá */}
            {loading ? (
                <div className="text-center text-gray-400 py-6 text-sm">Đang tải đánh giá...</div>
            ) : ratings.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
                </div>
            ) : (
                <div className="space-y-4">
                    {ratings.map(r => (
                        <div key={r.rating_id} className="border-b last:border-b-0 pb-4 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-shopee-100 text-shopee-500 rounded-full flex items-center justify-center text-sm font-bold">
                                        {(r.reviewer_name || r.reviewer_username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">
                                            {r.reviewer_name || r.reviewer_username}
                                            {user && r.user_id === user.user_id && (
                                                <span className="ml-2 text-xs text-shopee-500">(Bạn)</span>
                                            )}
                                        </div>
                                        <RatingStars value={r.rating} size={12}/>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">{formatDate(r.created_at)}</div>
                            </div>
                            {r.rating_comment && (
                                <p className="text-sm text-gray-700 mt-2 leading-relaxed pl-10">
                                    {r.rating_comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Hiển thị 5 sao theo điểm
function RatingStars({ value, size = 14 }) {
    const v = Number(value) || 0;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                n <= Math.round(v)
                    ? <StarFill key={n} className="text-yellow-400" size={size}/>
                    : <Star     key={n} className="text-gray-300"   size={size}/>
            ))}
        </div>
    );
}

// Component cho phép user click chọn số sao
function RatingInput({ value, onChange }) {
    const [hover, setHover] = useState(0);
    const display = hover || value;
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(n)}
                    className="hover:scale-110 transition"
                >
                    {n <= display
                        ? <StarFill className="text-yellow-400" size={22}/>
                        : <Star     className="text-gray-300"   size={22}/>}
                </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">{display}/5 sao</span>
        </div>
    );
}
