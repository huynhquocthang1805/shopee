/**
 * api.js — Service layer kết nối với BE Oracle
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth || getToken()) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(API_URL + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (err) {
        throw new Error('Không kết nối được Backend. Bạn đã chạy "npm start" trong thư mục BE chưa?');
    }

    let data;
    try {
        data = await response.json();
    } catch (_) {
        data = {};
    }

    if (!response.ok) {
        const err = new Error(data.message || `HTTP ${response.status}`);
        err.status = response.status;
        err.data = data;
        throw err;
    }
    return data;
}

// ═══ Auth ═══
export const authApi = {
    register: (data)               => request('/auth/register', { method: 'POST', body: data }),
    login:    (username, password) => request('/auth/login',    { method: 'POST', body: { username, password } }),
    me:       ()                   => request('/auth/me',       { auth: true }),
};

// ═══ Products ═══
export const productApi = {
    getAll:    ()              => request('/products'),
    getById:   (id)            => request(`/products/${id}`),
    search:    (params)        => {
        const qs = new URLSearchParams();
        if (params.keyword)    qs.set('keyword',    params.keyword);
        if (params.minPrice)   qs.set('minPrice',   params.minPrice);
        if (params.maxPrice)   qs.set('maxPrice',   params.maxPrice);
        if (params.categoryId) qs.set('categoryId', params.categoryId);
        return request('/products/search?' + qs.toString());
    },
    bySeller:  (sellerId)      => request(`/products/seller/${sellerId}`),
    create:    (data)          => request('/products',          { method: 'POST',   body: data, auth: true }),
    update:    (id, data)      => request(`/products/${id}`,    { method: 'PUT',    body: data, auth: true }),
    remove:    (id)            => request(`/products/${id}`,    { method: 'DELETE', auth: true }),
};

// ═══ Ratings ═══
export const ratingApi = {
    listByProduct: (productId)            => request(`/products/${productId}/ratings`),
    create:        (productId, data)      => request(`/products/${productId}/ratings`, { method: 'POST', body: data, auth: true }),
};

// ═══ Orders ═══
export const orderApi = {
    create:        (data)        => request('/orders',                 { method: 'POST', body: data, auth: true }),
    getMine:       ()            => request('/orders/me',              { auth: true }),
    getById:       (id)          => request(`/orders/${id}`),
    getStatistics: ()            => request('/orders/stats'),
    updateStatus:  (id, status)  => request(`/orders/${id}/status`,    { method: 'PUT', body: { status }, auth: true }),
};

// === Token storage ===
export const auth = {
    setToken: (token) => localStorage.setItem('token', token),
    setUser:  (user)  => localStorage.setItem('user', JSON.stringify(user)),
    getUser:  ()      => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    },
    clear:    () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    isLoggedIn: () => !!localStorage.getItem('token'),
};
