import React from 'react';
import Header from './Header';

export default function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-4">
                {children}
            </main>
            <footer className="bg-white border-t mt-8 py-6">
                <div className="container mx-auto px-4 text-center text-xs text-gray-500">
                    <div>© CO2013 BTL2 — E-Commerce Oracle Edition · Demo</div>
                    <div className="mt-1">Backend: Oracle Database 21c · Frontend: React 18 · API: Express</div>
                </div>
            </footer>
        </div>
    );
}
