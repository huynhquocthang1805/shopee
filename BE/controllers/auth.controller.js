/**
 * auth.controller.js
 * Login + Register endpoints (kết nối FE).
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

class AuthController {
    // POST /api/auth/register
    register = async (req, res) => {
        try {
            const { username, password, first_name, last_name, email, phone_number, address, role, shop_name } = req.body;

            if (!username || !password || !email || !first_name || !last_name) {
                return res.status(400).send({ message: 'Thiếu thông tin bắt buộc' });
            }

            // Hash password
            const hashed = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                first_name,
                last_name,
                username,
                password: hashed,
                birthday: req.body.birthday,
                sex: req.body.sex || 'Không trả lời',
                address: address || 'N/A',
                phone_number: phone_number || '0000000000',
                email,
                role: role || 'buyer',
                shop_name,
            });

            // Tạo token
            const token = jwt.sign(
                { userId: newUser.user_id, role: newUser.role, username: newUser.username },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES }
            );

            res.status(201).send({
                message: 'Đăng ký thành công',
                user: { user_id: newUser.user_id, username, email, role: newUser.role, first_name, last_name },
                token,
            });
        } catch (err) {
            if (err.kind === 'duplicate') {
                return res.status(409).send({ message: err.message });
            }
            console.error('Register error:', err);
            res.status(500).send({ message: err.message || 'Lỗi đăng ký' });
        }
    };

    // POST /api/auth/login
    login = async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).send({ message: 'Cần username và password' });
            }

            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).send({ message: 'Sai username hoặc password' });
            }

            // So sánh password (trong DB là hash)
            const ok = await bcrypt.compare(password, user.PASSWORD);
            if (!ok) {
                return res.status(401).send({ message: 'Sai username hoặc password' });
            }

            const token = jwt.sign(
                { userId: user.USER_ID, role: user.ROLE, username: user.USERNAME },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES }
            );

            res.send({
                message: 'Đăng nhập thành công',
                user: {
                    user_id: user.USER_ID,
                    username: user.USERNAME,
                    email: user.EMAIL,
                    role: user.ROLE,
                    first_name: user.FIRST_NAME,
                    last_name: user.LAST_NAME,
                },
                token,
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).send({ message: err.message || 'Lỗi đăng nhập' });
        }
    };

    // GET /api/auth/me - lấy thông tin user hiện tại từ token
    me = async (req, res) => {
        try {
            const user = await User.findById(req.user.userId);
            res.send({
                user_id: user.USER_ID,
                username: user.USERNAME,
                email: user.EMAIL,
                role: user.ROLE,
                first_name: user.FIRST_NAME,
                last_name: user.LAST_NAME,
            });
        } catch (err) {
            res.status(404).send({ message: 'User not found' });
        }
    };
}

export default new AuthController();
