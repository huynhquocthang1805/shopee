import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function RegisterPage() {
    const [form, setForm] = useState({
        first_name:   '',
        last_name:    '',
        username:     '',
        password:     '',
        email:        '',
        phone_number: '',
        address:      '',
        sex:          'Không trả lời',
        birthday:     '2000-01-01',
        role:         'buyer',
        shop_name:    '',
    });
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const { show } = useToast();
    const nav = useNavigate();

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.username || !form.password || !form.email || !form.first_name) {
            show('Cần điền đủ các trường bắt buộc', 'warning');
            return;
        }
        setSubmitting(true);
        try {
            await register(form);
            show('Đăng ký thành công!', 'success');
            nav('/');
        } catch (err) {
            show('Đăng ký lỗi: ' + err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center py-4">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-shopee-500 mb-1 text-center">Đăng ký tài khoản</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Tạo tài khoản mới trên Shopee</p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Họ" value={form.first_name} onChange={v => update('first_name', v)} required />
                    <Field label="Tên" value={form.last_name} onChange={v => update('last_name', v)} required />
                    <Field label="Username" value={form.username} onChange={v => update('username', v)} required />
                    <Field label="Password" type="password" value={form.password} onChange={v => update('password', v)} required />
                    <Field label="Email" type="email" value={form.email} onChange={v => update('email', v)} required />
                    <Field label="SĐT" value={form.phone_number} onChange={v => update('phone_number', v)} />
                    <Field label="Ngày sinh" type="date" value={form.birthday} onChange={v => update('birthday', v)} />

                    <div>
                        <label className="text-xs text-gray-600 font-medium uppercase tracking-wide">Giới tính</label>
                        <select
                            value={form.sex}
                            onChange={e => update('sex', e.target.value)}
                            className="w-full mt-1 border rounded px-3 py-2.5 text-sm focus:border-shopee-500 outline-none"
                        >
                            <option>Nam</option>
                            <option>Nữ</option>
                            <option>Không trả lời</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <Field label="Địa chỉ" value={form.address} onChange={v => update('address', v)} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-600 font-medium uppercase tracking-wide">Vai trò</label>
                        <div className="flex gap-3 mt-1">
                            <label className={`flex-1 border rounded p-3 cursor-pointer ${form.role === 'buyer' ? 'border-shopee-500 bg-shopee-50' : 'border-gray-300'}`}>
                                <input type="radio" name="role" value="buyer" checked={form.role === 'buyer'} onChange={() => update('role', 'buyer')} className="mr-2"/>
                                <strong>Người mua</strong>
                                <div className="text-xs text-gray-500 mt-0.5">Mua sản phẩm trên sàn</div>
                            </label>
                            <label className={`flex-1 border rounded p-3 cursor-pointer ${form.role === 'seller' ? 'border-shopee-500 bg-shopee-50' : 'border-gray-300'}`}>
                                <input type="radio" name="role" value="seller" checked={form.role === 'seller'} onChange={() => update('role', 'seller')} className="mr-2"/>
                                <strong>Người bán</strong>
                                <div className="text-xs text-gray-500 mt-0.5">Mở shop, đăng sản phẩm</div>
                            </label>
                        </div>
                    </div>

                    {form.role === 'seller' && (
                        <div className="md:col-span-2">
                            <Field label="Tên Shop" value={form.shop_name} onChange={v => update('shop_name', v)} />
                        </div>
                    )}

                    <div className="md:col-span-2 mt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-shopee-500 hover:bg-shopee-600 text-white font-medium py-2.5 rounded disabled:opacity-50"
                        >
                            {submitting ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500 mt-4">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-shopee-500 hover:underline font-medium">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text', required }) {
    return (
        <div>
            <label className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full mt-1 border rounded px-3 py-2.5 text-sm focus:border-shopee-500 outline-none"
            />
        </div>
    );
}
