import React from 'react';
import { Trash, Dash, Plus } from 'react-bootstrap-icons';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../contexts/CartContext';

const FALLBACK = 'https://placehold.co/100x100/eeeeee/999999?text=No+Image';

export default function CartItem({ item }) {
    const { updateQty, removeItem } = useCart();

    return (
        <div className="bg-white p-4 rounded shadow-sm mb-3 grid grid-cols-12 items-center gap-4">
            <div className="col-span-5 flex items-center gap-3">
                <img
                    src={item.image_url || FALLBACK}
                    alt={item.name}
                    className="w-20 h-20 object-cover border rounded"
                    onError={e => { e.target.src = FALLBACK; }}
                />
                <h3 className="text-sm font-medium line-clamp-2 text-gray-800">{item.name}</h3>
            </div>
            <div className="col-span-2 text-center text-gray-800">
                {formatCurrency(item.price)}
            </div>
            <div className="col-span-2 flex justify-center">
                <div className="flex items-center border rounded">
                    <button
                        onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100 border-r"
                    ><Dash size={12} /></button>
                    <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-10 text-center text-sm outline-none"
                    />
                    <button
                        onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100 border-l"
                    ><Plus size={12} /></button>
                </div>
            </div>
            <div className="col-span-2 text-center text-shopee-500 font-bold">
                {formatCurrency(item.price * item.quantity)}
            </div>
            <div className="col-span-1 text-center">
                <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-gray-400 hover:text-red-500"
                ><Trash size={18} /></button>
            </div>
        </div>
    );
}
