import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, auth } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(auth.getUser());
    const [loading, setLoading] = useState(false);

    // Verify token on load
    useEffect(() => {
        if (auth.isLoggedIn() && !user) {
            authApi.me().then(u => { setUser(u); auth.setUser(u); }).catch(() => auth.clear());
        }
    }, []);

    async function login(username, password) {
        setLoading(true);
        try {
            const res = await authApi.login(username, password);
            auth.setToken(res.token);
            auth.setUser(res.user);
            setUser(res.user);
            return res.user;
        } finally {
            setLoading(false);
        }
    }

    async function register(data) {
        setLoading(true);
        try {
            const res = await authApi.register(data);
            auth.setToken(res.token);
            auth.setUser(res.user);
            setUser(res.user);
            return res.user;
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        auth.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
