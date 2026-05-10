import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const show = useCallback((message, type = 'info', duration = 2500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2">
                {toasts.map(t => {
                    const colors = {
                        success: 'bg-green-500',
                        error:   'bg-red-500',
                        info:    'bg-blue-500',
                        warning: 'bg-yellow-500',
                    };
                    return (
                        <div key={t.id} className={`${colors[t.type] || colors.info} text-white px-5 py-3 rounded-md shadow-lg animate-[fadeIn_.2s_ease] min-w-[260px]`}>
                            {t.message}
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
