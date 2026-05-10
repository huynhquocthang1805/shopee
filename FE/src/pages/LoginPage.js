import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const { show } = useToast();
    const nav = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!username.trim() || !password) {
            show('Cần nhập đầy đủ thông tin', 'warning');
            return;
        }
        setSubmitting(true);
        try {
            const u = await login(username, password);
            show(`Chào mừng ${u.first_name}!`, 'success');
            nav('/');
        } catch (err) {
            show('Đăng nhập thất bại: ' + err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-shopee-500 mb-1 text-center">Đăng nhập</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Vào tài khoản Shopee của bạn</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-600 font-medium uppercase tracking-wide">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Nhập username"
                            className="w-full mt-1 border rounded px-3 py-2.5 text-sm focus:border-shopee-500 outline-none"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 font-medium uppercase tracking-wide">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Nhập password"
                            className="w-full mt-1 border rounded px-3 py-2.5 text-sm focus:border-shopee-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-shopee-500 hover:bg-shopee-600 text-white font-medium py-2.5 rounded mt-4 disabled:opacity-50"
                    >
                        {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500 mt-5">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-shopee-500 hover:underline font-medium">Đăng ký ngay</Link>
                </div>

                <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                    <strong>💡 Demo accounts</strong> (sau khi chạy seed data):<br />
                    Buyer: <code>buyer01</code> / <code>123456</code><br />
                    Seller: <code>seller01</code> / <code>123456</code>
                </div>
            </div>
        </div>
    );
}
