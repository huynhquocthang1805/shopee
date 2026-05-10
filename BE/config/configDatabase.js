/**
 * configDatabase.js - Oracle version
 * Thay thế cho file MySQL gốc.
 * Yêu cầu: npm install oracledb
 *
 * Oracle Instant Client cần được cài đặt trên máy:
 *   - Download: https://www.oracle.com/database/technologies/instant-client.html
 *   - Set LD_LIBRARY_PATH (Linux) hoặc PATH (Windows) trỏ tới Instant Client
 */
import oracledb from 'oracledb';
import { config } from 'dotenv';
config();

// === Oracle config ===
oracledb.autoCommit = false;                       // explicit transaction (giống MySQL beginTransaction)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;   // trả về object thay vì array
oracledb.fetchAsString = [oracledb.CLOB];          // CLOB → string tự động

let pool = null;

/**
 * Khởi tạo connection pool. Gọi 1 lần khi server start.
 */
export async function initPool() {
    if (pool) return pool;

    try {
        pool = await oracledb.createPool({
            user:           process.env.DB_USER     || 'ecom_user',
            password:       process.env.DB_PASSWORD || 'StrongPass123',
            connectString:  process.env.DB_CONNECT  || 'localhost:1521/FREEPDB1',
            poolMin:        2,
            poolMax:        10,
            poolIncrement:  2,
            poolTimeout:    60,
            queueTimeout:   60000,
        });
        console.log('✅ Oracle connection pool initialized');
        console.log(`   → ${process.env.DB_CONNECT || 'localhost:1521/FREEPDB1'}`);
        return pool;
    } catch (err) {
        console.error('❌ Oracle pool init failed:', err.message);
        throw err;
    }
}

/**
 * Đóng pool khi shutdown server.
 */
export async function closePool() {
    if (pool) {
        await pool.close(10);
        console.log('Oracle pool closed');
    }
}

/**
 * Lấy connection từ pool. NHỚ release sau khi xong:
 *   const conn = await getConnection();
 *   try { ... } finally { await conn.close(); }
 */
export async function getConnection() {
    if (!pool) await initPool();
    return pool.getConnection();
}

/**
 * Helper: chạy 1 query và auto-release connection.
 * Dùng cho query đơn lẻ không cần transaction.
 */
export async function execute(sql, params = {}, options = {}) {
    const conn = await getConnection();
    try {
        const result = await conn.execute(sql, params, {
            autoCommit: true,
            ...options,
        });
        return result;
    } finally {
        await conn.close();
    }
}

// Default export tương thích với code cũ
export default {
    initPool,
    closePool,
    getConnection,
    execute,
};
