# E-Commerce — Oracle Edition (Full Stack)

> Phiên bản hoàn chỉnh: **Frontend React** liên kết với **Backend Express + Oracle Database**.
> Demo đầy đủ các chức năng ảnh hưởng tới backend (đăng ký, đăng nhập, mua hàng, đặt đơn, quản lý sản phẩm).

---

## 📁 Cấu trúc

```
ecommerce_oracle/
├── BE/                              ← Backend Express + Oracle
│   ├── config/configDatabase.js
│   ├── controllers/
│   │   ├── auth.controller.js       (Login + Register + JWT)
│   │   ├── product.controller.js    (CRUD products)
│   │   └── order.controller.js      (Đặt hàng + JOIN/Aggregate)
│   ├── middleware/auth.js           (JWT verify + role check)
│   ├── models/
│   │   ├── product.model.js         (Oracle bind variables)
│   │   ├── user.model.js            (Procedure call)
│   │   └── order.model.js           (Transaction)
│   ├── routes/
│   │   ├── index.js
│   │   └── api/
│   │       ├── auth.js
│   │       ├── product.js
│   │       └── order.js
│   ├── database/seed_demo.sql       (Seed user + product mẫu)
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── FE/                              ← Frontend React
    ├── src/
    │   ├── api/api.js               (Service layer kết nối BE)
    │   ├── contexts/
    │   │   ├── AuthContext.js       (Login state)
    │   │   ├── CartContext.js       (Giỏ hàng)
    │   │   └── ToastContext.js      (Thông báo)
    │   ├── components/
    │   │   ├── layout/{Header.js, MainLayout.js}
    │   │   ├── products/ProductCard.js
    │   │   └── cart/CartItem.js
    │   ├── pages/
    │   │   ├── HomePage.js          (Danh sách + tìm kiếm)
    │   │   ├── ProductDetailPage.js (Chi tiết)
    │   │   ├── CartPage.js          (Giỏ hàng + Checkout)
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── MyOrdersPage.js      (Đơn hàng của tôi - JOIN demo)
    │   │   └── AdminProductsPage.js (CRUD products cho seller)
    │   ├── utils/format.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── public/index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env
```

---

## 🚀 Quick Start

### 1. Setup Oracle Database

```sh
# Tạo user schema
sqlplus SYSTEM/your_password@localhost:1521/FREEPDB1

CREATE USER ecom_user IDENTIFIED BY StrongPass123;
GRANT CONNECT, RESOURCE, CREATE SESSION TO ecom_user;
GRANT CREATE TABLE, CREATE SEQUENCE, CREATE PROCEDURE, CREATE TRIGGER, CREATE VIEW TO ecom_user;
ALTER USER ecom_user QUOTA UNLIMITED ON USERS;
EXIT;
```

### 2. Tạo schema + procedures

```sh
# Dùng setup_oracle.sql từ project gốc
cd BE
sqlplus ecom_user/StrongPass123@FREEPDB1 @database/setup_oracle.sql

# Seed dữ liệu demo (users + products)
sqlplus ecom_user/StrongPass123@FREEPDB1 @database/seed_demo.sql
```

### 3. Chạy Backend

```sh
cd BE
npm install
cp .env.example .env
# Sửa DB_PASSWORD nếu khác
npm start
```

Backend chạy tại `http://localhost:3000` với log:
```
✅ Oracle connection pool initialized
🚀 Server running on http://localhost:3000
```

### 4. Chạy Frontend

```sh
# Mở terminal mới
cd FE
npm install
npm start
```

Frontend chạy tại `http://localhost:3001` (React tự đề xuất khi 3000 đã bận).

---

## 🎬 Demo flow (cho video báo cáo)

### Kịch bản 1: Đăng ký + Mua hàng (BUYER flow)

1. Mở `http://localhost:3001` → trang chủ hiển thị 7 sản phẩm seed
2. Click "Đăng ký" → tạo tài khoản mới với role `buyer`
3. Click 1 sản phẩm → xem chi tiết → "Thêm vào giỏ"
4. Vào giỏ hàng → nhập địa chỉ → "Mua hàng"
5. Vào "Đơn hàng của tôi" → expand đơn vừa đặt để xem chi tiết

→ **Backend ảnh hưởng:**
- INSERT vào USERS, BUYER (qua procedure `insert_user`)
- INSERT vào ORDERS + ORDER_DETAIL (transaction)
- UPDATE PRODUCT.stock_quantity (giảm tồn kho)
- JOIN ORDERS + USERS + ORDER_DETAIL + PRODUCT khi xem chi tiết đơn

### Kịch bản 2: Quản lý sản phẩm (SELLER flow)

1. Đăng nhập với `seller01` / `123456`
2. Click avatar → "Quản lý sản phẩm"
3. Bấm "Thêm sản phẩm" → điền form → tạo
4. Click sửa 1 sản phẩm → đổi giá → cập nhật
5. Click xóa → confirm

→ **Backend ảnh hưởng:**
- INSERT INTO PRODUCT + BELONG (procedure `insert_product`)
- UPDATE PRODUCT (procedure `update_product`)
- DELETE FROM PRODUCT (procedure `delete_product`)
- Query SELECT * FROM PRODUCT WHERE user_id = ? (single condition)

### Kịch bản 3: Tìm kiếm (Composite condition)

1. Trang chủ → nhập keyword "iphone" → search
2. Hoặc dùng filter giá Min/Max + bấm "Lọc"

→ **Backend ảnh hưởng:**
- Composite WHERE: `LIKE` + `>=` + `<=` + JOIN với BELONG nếu có category

---

## ✅ 8 loại query đều có demo trong UI

| Loại | UI action | Endpoint | SQL |
|------|-----------|----------|-----|
| **a. INSERT** | Đăng ký, Tạo SP, Đặt hàng | POST /auth/register, /products, /orders | INSERT INTO USERS, PRODUCT, ORDERS |
| **b. DELETE** | Xóa sản phẩm trong Admin | DELETE /products/:id | DELETE FROM PRODUCT |
| **c. UPDATE** | Sửa sản phẩm, Cập nhật trạng thái đơn | PUT /products/:id | UPDATE PRODUCT |
| **d. Single condition** | Sản phẩm theo seller | GET /products/seller/:id | SELECT WHERE user_id = ? |
| **e. Composite** | Search keyword + giá | GET /products/search | LIKE + >= + <= |
| **f. JOIN** | Xem chi tiết đơn hàng | GET /orders/:id | ORDERS ⋈ USERS ⋈ ORDER_DETAIL ⋈ PRODUCT |
| **g. Subquery** | Đơn hàng của tôi | GET /orders/me | `(SELECT COUNT(*) FROM ORDER_DETAIL ...)` |
| **h. Aggregate** | Stats trang admin | GET /orders/stats | COUNT, SUM, AVG, MAX, GROUP BY |

---

## 🔑 Demo accounts (sau khi chạy seed_demo.sql)

| Username | Password | Role | Tác dụng |
|----------|----------|------|----------|
| `buyer01` | `123456` | buyer | Test mua hàng, đặt đơn |
| `buyer02` | `123456` | buyer | |
| `seller01` | `123456` | seller | Test CRUD products (Shop Phạm Cường) |
| `seller02` | `123456` | seller | (Shop Lê Dũng) |

---

## 🔌 API Endpoints (BE)

**Base URL:** `http://localhost:3000/api`

### Auth
- `POST /auth/register` — body: `{username, password, first_name, ...}`
- `POST /auth/login` — body: `{username, password}` → trả token
- `GET  /auth/me` — header: `Authorization: Bearer <token>`

### Products
- `GET    /products` — list all
- `GET    /products/:id`
- `GET    /products/search?keyword=&minPrice=&maxPrice=&categoryId=`
- `GET    /products/seller/:sellerId`
- `POST   /products` (auth + role=seller)
- `PUT    /products/:id` (auth + role=seller)
- `DELETE /products/:id` (auth + role=seller)

### Orders
- `POST /orders` — body: `{delivery_address, items: [{product_id, quantity}]}` (auth)
- `GET  /orders/me` — đơn hàng của user hiện tại (auth)
- `GET  /orders/:id` — chi tiết với JOIN
- `GET  /orders/stats` — aggregate
- `PUT  /orders/:id/status` — body: `{status}` (auth)

---

## 🐛 Troubleshooting

### Backend không kết nối được Oracle
```
❌ Oracle pool init failed: NJS-007: invalid value for "user"
```
→ Check `.env`, đảm bảo `DB_USER` / `DB_PASSWORD` đúng và user đã được tạo.

### Frontend báo "Không kết nối được Backend"
→ Kiểm tra:
1. Backend đã chạy chưa? `curl http://localhost:3000/api`
2. CORS có lỗi không? Check console browser
3. `.env` của FE có set `REACT_APP_API_URL` đúng?

### Login lỗi mặc dù password đúng
→ User chưa có trong DB. Chạy `seed_demo.sql` hoặc đăng ký account mới.

### "Sản phẩm không tồn tại" khi đặt hàng
→ Stock = 0 hoặc product_id sai. Check trong Admin Products xem có sản phẩm không.

### oracledb không cài được
```sh
# Cần Oracle Instant Client
# Linux: download từ oracle.com → unzip → set LD_LIBRARY_PATH
# macOS: brew install --cask oracle-instant-client
# Windows: tải basic_lite zip → thêm vào PATH
```

---

## 📊 Mapping FE feature → BE endpoint → SQL operation

| FE Feature | UI | API Call | DB Operation |
|------------|-----|----------|--------------|
| Hiển thị danh sách SP | HomePage | GET /products | `SELECT * FROM PRODUCT WHERE status='active'` |
| Tìm kiếm | HomePage filter | GET /products/search | `WHERE LOWER(name) LIKE ? AND price BETWEEN ?` |
| Chi tiết SP | ProductDetailPage | GET /products/:id | `SELECT ... LISTAGG(category_id) JOIN BELONG` |
| Thêm vào giỏ | ProductCard / Detail | (chỉ FE state) | localStorage |
| Đặt hàng | CartPage Checkout | POST /orders | Transaction: INSERT ORDERS + ORDER_DETAIL + UPDATE PRODUCT.stock |
| Đăng nhập | LoginPage | POST /auth/login | `SELECT FROM USERS WHERE username=?` + bcrypt compare |
| Đăng ký | RegisterPage | POST /auth/register | `CALL insert_user(...)` (procedure with OUT) |
| Đơn hàng của tôi | MyOrdersPage | GET /orders/me | `SELECT WITH SUBQUERY` |
| Chi tiết đơn | MyOrdersPage expand | GET /orders/:id | JOIN 4 bảng |
| Quản lý SP | AdminProductsPage | CRUD /products | INSERT/UPDATE/DELETE qua procedure |

---

## 🎓 Sử dụng cho báo cáo

1. **Section 4 (Application)**: Mô tả kiến trúc 3-tier React → Express → Oracle, kèm sơ đồ
2. **Section 5 (Demo)**: Quay video chạy 3 kịch bản trên + show 8 loại query
3. **Screenshots**: Bắt buộc có ảnh các trang Home / Detail / Cart / Orders / Admin
4. **Self-assessment**: Phần kết luận nên ghi rõ % completed cho mỗi yêu cầu

---

## 📝 Các file QUAN TRỌNG bạn có thể cần copy thêm từ project gốc

Folder này chỉ chứa các file đã được sửa/viết mới. Các file sau cần copy nguyên trạng từ project gốc:

```
BE/database/setup_oracle.sql           ← Schema + Sequences + Triggers + Procedures
```

Các model còn lại (cart, delivery, payment, voucher, review, category) — port theo pattern trong các model đã có (`product.model.js`, `user.model.js`, `order.model.js`).
