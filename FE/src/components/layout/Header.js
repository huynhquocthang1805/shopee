import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cart3, Search, PersonCircle, BoxArrowRight, ListUl, Shop } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function Header() {
    const { user, logout } = useAuth();
    const { totalCount }   = useCart();
    const [showMenu, setShowMenu] = useState(false);
    const [keyword, setKeyword]   = useState('');
    const nav = useNavigate();

    function onSearch(e) {
        e.preventDefault();
        if (keyword.trim()) nav(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    }

    function handleLogout() {
        logout();
        setShowMenu(false);
        nav('/');
    }

    return (
        <header className="bg-shopee-500 sticky top-0 z-50 shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold italic tracking-tighter">
                    <span className="bg-white text-shopee-500 rounded px-2 py-0.5 text-xl">S</span>
                    Shopee
                </Link>

                <form onSubmit={onSearch} className="flex-1 max-w-2xl bg-white rounded-md p-1 flex items-center shadow-sm">
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        className="w-full px-3 py-2 outline-none text-gray-700 rounded-l-md text-sm"
                    />
                    <button type="submit" className="bg-shopee-500 hover:bg-shopee-600 text-white px-5 py-2 rounded-md flex items-center">
                        <Search size={18} />
                    </button>
                </form>

                <Link to="/cart" className="relative text-white hover:opacity-80">
                    <Cart3 size={28} />
                    {totalCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-shopee-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-shopee-500">
                            {totalCount}
                        </span>
                    )}
                </Link>

                {user ? (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 text-white text-sm">
                            <PersonCircle size={20} />
                            <span className="hidden sm:inline">{user.username}</span>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-lg w-52 py-1 border">
                                <div className="px-4 py-2 border-b text-xs text-gray-500">
                                    Đăng nhập với:<br/>
                                    <span className="text-gray-800 font-medium">{user.first_name} {user.last_name}</span>
                                    <span className="block text-[10px] mt-1 px-2 py-0.5 rounded bg-shopee-50 text-shopee-500 w-fit font-semibold uppercase">{user.role}</span>
                                </div>
                                <Link to="/orders" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <ListUl size={16}/> Đơn hàng của tôi
                                </Link>
                                {user.role === 'seller' && (
                                    <Link to="/admin/products" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <Shop size={16}/> Quản lý sản phẩm
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <BoxArrowRight size={16}/> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-white text-sm flex items-center gap-3">
                        <Link to="/login" className="hover:underline">Đăng nhập</Link>
                        <span className="h-4 border-l border-white/50"></span>
                        <Link to="/register" className="hover:underline">Đăng ký</Link>
                    </div>
                )}
            </div>
        </header>
    );
}
