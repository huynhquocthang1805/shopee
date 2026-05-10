/**
 * auth.js - JWT middleware
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Bắt buộc token
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Thiếu token' });
    }
    const token = header.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).send({ message: 'Token không hợp lệ' });
    }
}

// Tùy chọn token (nếu có thì gắn req.user, không có thì cho qua)
export function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        try {
            req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
        } catch (_) { /* ignore */ }
    }
    next();
}

// Yêu cầu role cụ thể
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).send({ message: 'Cần đăng nhập' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ message: 'Không đủ quyền' });
        }
        next();
    };
}

export default requireAuth;
