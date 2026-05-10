/**
 * user.model.js - Oracle version
 *
 * Lưu ý:
 *   - Procedure insert_user nhận đủ các tham số IN và 1 OUT (p_new_user_id)
 *   - Khác với MySQL: dùng oracledb.BIND_OUT thay vì SELECT @var sau khi CALL
 *   - VARCHAR2 size phải khai báo cho cả OUT param qua maxSize
 */
import oracledb from 'oracledb';
import { getConnection } from '../config/configDatabase.js';

const User = function (user) {
    this.user_id      = user.user_id;
    this.first_name   = user.first_name;
    this.last_name    = user.last_name;
    this.username     = user.username;
    this.password     = user.password;
    this.birthday     = user.birthday;
    this.sex          = user.sex;
    this.address      = user.address;
    this.phone_number = user.phone_number;
    this.email        = user.email;
    this.role         = user.role;
    this.shop_name    = user.shop_name;
};

// =============================================================
// 1. CREATE - PROCEDURE insert_user với OUT parameter
// =============================================================
User.create = async (newUser) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `BEGIN
                insert_user(
                    :p_first_name, :p_last_name, :p_username, :p_password,
                    :p_birthday,   :p_sex,       :p_address,
                    :p_phone_number, :p_email,   :p_role, :p_shop_name,
                    :p_new_user_id
                );
             END;`,
            {
                p_first_name:   newUser.first_name,
                p_last_name:    newUser.last_name,
                p_username:     newUser.username,
                p_password:     newUser.password,
                p_birthday:     newUser.birthday ? new Date(newUser.birthday) : null,
                p_sex:          newUser.sex,
                p_address:      newUser.address,
                p_phone_number: newUser.phone_number,
                p_email:        newUser.email,
                p_role:         newUser.role,
                p_shop_name:    newUser.shop_name || null,
                // OUT param - nhận user_id mới
                p_new_user_id:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            },
            { autoCommit: true }
        );

        const userId = result.outBinds.p_new_user_id;
        if (!userId) throw new Error('Không thể tạo user.');

        return { user_id: userId, ...newUser };

    } catch (err) {
        // Oracle ném ORA-20001 với MESSAGE_TEXT
        if (/đã tồn tại|đã được sử dụng/.test(err.message)) {
            throw { kind: 'duplicate', message: err.message };
        }
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 2. FIND BY ID
// =============================================================
User.findById = async (userId) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT * FROM USERS WHERE user_id = :id`,
            { id: userId }
        );
        if (result.rows.length === 0) throw { kind: 'not_found' };
        return result.rows[0];
    } finally {
        await conn.close();
    }
};

// =============================================================
// 3. FIND BY USERNAME (dùng cho login)
// =============================================================
User.findByUsername = async (username) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT * FROM USERS WHERE username = :u`,
            { u: username }
        );
        return result.rows.length ? result.rows[0] : null;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 4. FIND BY EMAIL
// =============================================================
User.findByEmail = async (email) => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT * FROM USERS WHERE email = :e`,
            { e: email }
        );
        return result.rows.length ? result.rows[0] : null;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 5. GET ALL
// =============================================================
User.getAll = async () => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(
            `SELECT user_id, first_name, last_name, username, email, role, created_at
             FROM USERS ORDER BY created_at DESC`
        );
        return result.rows;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 6. UPDATE
// =============================================================
User.updateById = async (id, user) => {
    const conn = await getConnection();
    try {
        await conn.execute(
            `BEGIN
                update_user(
                    :p_user_id, :p_first_name, :p_last_name,
                    :p_username, :p_password, :p_birthday, :p_sex,
                    :p_address, :p_phone_number, :p_email
                );
             END;`,
            {
                p_user_id:      id,
                p_first_name:   user.first_name,
                p_last_name:    user.last_name,
                p_username:     user.username,
                p_password:     user.password || null,
                p_birthday:     user.birthday ? new Date(user.birthday) : null,
                p_sex:          user.sex,
                p_address:      user.address,
                p_phone_number: user.phone_number,
                p_email:        user.email,
            },
            { autoCommit: true }
        );
        return { user_id: id, ...user };
    } catch (err) {
        if (/không tồn tại/.test(err.message)) throw { kind: 'not_found' };
        throw err;
    } finally {
        await conn.close();
    }
};

// =============================================================
// 7. REMOVE
// =============================================================
User.remove = async (id) => {
    const conn = await getConnection();
    try {
        await conn.execute(
            `BEGIN delete_user(:p_user_id); END;`,
            { p_user_id: id },
            { autoCommit: true }
        );
        return { message: 'Deleted successfully' };
    } catch (err) {
        if (/không tồn tại/.test(err.message)) throw { kind: 'not_found' };
        throw err;
    } finally {
        await conn.close();
    }
};

User.removeAll = async () => {
    const conn = await getConnection();
    try {
        const result = await conn.execute(`DELETE FROM USERS`);
        await conn.commit();
        return { affectedRows: result.rowsAffected };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        await conn.close();
    }
};

export default User;
