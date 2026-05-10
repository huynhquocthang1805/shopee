import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <CartProvider>
                    <BrowserRouter>
                        <MainLayout>
                            <Routes>
                                <Route path="/"             element={<HomePage />} />
                                <Route path="/product/:id"  element={<ProductDetailPage />} />
                                <Route path="/cart"         element={<CartPage />} />
                                <Route path="/login"        element={<LoginPage />} />
                                <Route path="/register"     element={<RegisterPage />} />
                                <Route path="/orders"       element={<MyOrdersPage />} />
                                <Route path="/admin/products" element={<AdminProductsPage />} />
                                <Route path="*"             element={<NotFound />} />
                            </Routes>
                        </MainLayout>
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

function NotFound() {
    return (
        <div className="bg-white p-12 text-center rounded">
            <div className="text-5xl mb-3">🤔</div>
            <h2 className="text-lg font-bold">404 — Không tìm thấy trang</h2>
        </div>
    );
}
