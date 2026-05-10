import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    function addItem(product, qty = 1) {
        setItems(prev => {
            const existing = prev.find(i => i.product_id === product.product_id);
            if (existing) {
                return prev.map(i => i.product_id === product.product_id
                    ? { ...i, quantity: i.quantity + qty }
                    : i);
            }
            return [...prev, {
                product_id: product.product_id || product.PRODUCT_ID,
                name:       product.name       || product.NAME,
                price:      Number(product.price || product.PRICE),
                image_url:  product.image_url  || product.IMAGE_URL,
                quantity:   qty,
            }];
        });
    }

    function updateQty(productId, qty) {
        if (qty < 1) return removeItem(productId);
        setItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i));
    }

    function removeItem(productId) {
        setItems(prev => prev.filter(i => i.product_id !== productId));
    }

    function clear() { setItems([]); }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalCount  = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, totalAmount, totalCount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
