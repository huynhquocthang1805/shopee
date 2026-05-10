import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { productApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, normalizeProduct } from '../utils/format';
import { Plus, Pencil, Trash, X } from 'react-bootstrap-icons';

const EMPTY_FORM = {
    name: '', price: '', stock_quantity: '', weight: '', size: '',
    origin: '', brand: '', description: '', image_url: '',
};

export default function AdminProductsPage() {
    const { user } = useAuth();
    const { show } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!user) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    async function load() {
        setLoading(true);
        try {
            const data = await productApi.bySeller(user.user_id);
            setProducts(data.map(normalizeProduct));
        } catch (err) {
            show('Lỗi tải: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    if (!user) return <Navigate to="/login"/>;
    if (user.role !== 'seller') {
        return (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-yellow-800">
                <strong>Truy cập bị từ chối</strong>
                <p className="mt-1 text-sm">Chỉ tài khoản role <code>seller</code> mới có thể quản lý sản phẩm. Bạn đang đăng nhập với role <code>{user.role}</code>.</p>
            </div>
        );
    }

    function openAdd() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    }

    function openEdit(p) {
        setEditingId(p.product_id);
        setForm({
            name: p.name || '',
            price: p.price || '',
            stock_quantity: p.stock_quantity || '',
            weight: p.weight || '',
            size: p.size || '',
            origin: p.origin || '',
            brand: p.brand || '',
            description: p.description || '',
            image_url: p.image_url || '',
        });
        setShowForm(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.price) {
            show('Cần nhập tên và giá', 'warning');
            return;
        }
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                stock_quantity: Number(form.stock_quantity) || 0,
                weight: Number(form.weight) || 0,
            };
            if (editingId) {
                await productApi.update(editingId, payload);
                show('Cập nhật thành công', 'success');
            } else {
                await productApi.create(payload);
                show('Tạo sản phẩm thành công', 'success');
            }
            setShowForm(false);
            load();
        } catch (err) {
            show('Lỗi: ' + err.message, 'error');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm(`Xóa sản phẩm ${id}?`)) return;
        try {
            await productApi.remove(id);
            show('Đã xóa', 'success');
            load();
        } catch (err) {
            show('Lỗi xóa: ' + err.message, 'error');
        }
    }

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">Quản lý sản phẩm</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Demo: INSERT, UPDATE, DELETE, query by seller (single condition)</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-shopee-500 hover:bg-shopee-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1"
                >
                    <Plus size={16}/> Thêm sản phẩm
                </button>
            </div>

            {loading ? (
                <div className="bg-white p-8 text-center text-gray-500 rounded">Đang tải...</div>
            ) : products.length === 0 ? (
                <div className="bg-white p-12 text-center text-gray-500 rounded">Chưa có sản phẩm. Bấm "Thêm sản phẩm" để bắt đầu.</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Sản phẩm</th>
                                <th className="px-4 py-3 text-right">Giá</th>
                                <th className="px-4 py-3 text-right">Tồn kho</th>
                                <th className="px-4 py-3 text-center">Trạng thái</th>
                                <th className="px-4 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.product_id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-shopee-500">{p.product_id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {p.image_url && (
                                                <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded"
                                                     onError={e => { e.target.style.display = 'none'; }}/>
                                            )}
                                            <span className="line-clamp-1">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-shopee-500 font-medium">{formatCurrency(p.price)}</td>
                                    <td className="px-4 py-3 text-right">{p.stock_quantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs px-2 py-1 rounded ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 mr-2" title="Sửa">
                                            <Pencil size={16}/>
                                        </button>
                                        <button onClick={() => handleDelete(p.product_id)} className="text-red-500 hover:text-red-700" title="Xóa">
                                            <Trash size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                            <h2 className="font-bold">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                            <button onClick={() => setShowForm(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField label="Tên sản phẩm *" full>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Giá (VND) *">
                                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Tồn kho">
                                <input type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Brand">
                                <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Origin (xuất xứ)">
                                <input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Khối lượng (g)">
                                <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Kích thước">
                                <input value={form.size} onChange={e => setForm({...form, size: e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Image URL" full>
                                <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <FormField label="Mô tả" full>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full border rounded px-3 py-2 text-sm"/>
                            </FormField>
                            <div className="md:col-span-2 flex gap-2 justify-end pt-2 border-t mt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Hủy</button>
                                <button type="submit" className="bg-shopee-500 hover:bg-shopee-600 text-white px-4 py-2 rounded text-sm font-medium">
                                    {editingId ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormField({ label, children, full }) {
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <label className="text-xs text-gray-600 font-medium block mb-1">{label}</label>
            {children}
        </div>
    );
}
