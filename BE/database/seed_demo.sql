-- =================================================================
-- seed_demo.sql
-- Seed dữ liệu demo cho E-Commerce Oracle Edition
-- Chạy file này SAU KHI đã chạy setup_oracle.sql của project gốc.
--
-- Sử dụng: sqlplus ecom_user/StrongPass123@FREEPDB1 @seed_demo.sql
-- =================================================================

SET DEFINE OFF;

-- Xóa dữ liệu cũ
DELETE FROM ORDER_DETAIL;
DELETE FROM ORDERS;
DELETE FROM BELONG;
DELETE FROM PRODUCT;
DELETE FROM SELLER;
DELETE FROM BUYER;
DELETE FROM USERS;
DELETE FROM CATEGORY;
COMMIT;

-- =================================================================
-- 1. CATEGORIES (sách & văn phòng phẩm)
-- =================================================================
INSERT INTO CATEGORY (category_id, name) VALUES ('G0001', 'Điện thoại');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0002', 'Laptop');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0003', 'Phụ kiện điện tử');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0004', 'Thời trang');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0005', 'Sách');

-- =================================================================
-- 2. USERS — Demo accounts
-- Password: 123456 (đã hash bằng bcrypt với cost 10)
-- Hash: $2a$10$dKwjcXfvBhxw3TjxGqH3I.TlGNCwsuNJXcRqAhPYFPxhGqOHlT9p2
-- =================================================================

-- Buyer 1
INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Nguyễn', 'An', 'buyer01',
        '$2a$10$dKwjcXfvBhxw3TjxGqH3I.TlGNCwsuNJXcRqAhPYFPxhGqOHlT9p2',
        DATE '2000-05-15', 'Nam',
        '123 Nguyễn Văn Cừ, Quận 5, TPHCM', '0901234567',
        'buyer01@example.com', 'buyer', SYSTIMESTAMP);

-- Buyer 2
INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Trần', 'Bình', 'buyer02',
        '$2a$10$dKwjcXfvBhxw3TjxGqH3I.TlGNCwsuNJXcRqAhPYFPxhGqOHlT9p2',
        DATE '1998-08-22', 'Nữ',
        '456 Lê Lợi, Quận 1, TPHCM', '0908765432',
        'buyer02@example.com', 'buyer', SYSTIMESTAMP);

-- Seller 1
INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Phạm', 'Cường', 'seller01',
        '$2a$10$dKwjcXfvBhxw3TjxGqH3I.TlGNCwsuNJXcRqAhPYFPxhGqOHlT9p2',
        DATE '1995-03-10', 'Nam',
        '789 Hai Bà Trưng, Quận 3, TPHCM', '0911223344',
        'seller01@example.com', 'seller', SYSTIMESTAMP);

-- Seller 2
INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Lê', 'Dũng', 'seller02',
        '$2a$10$dKwjcXfvBhxw3TjxGqH3I.TlGNCwsuNJXcRqAhPYFPxhGqOHlT9p2',
        DATE '1992-12-01', 'Nam',
        '321 CMT8, Quận 10, TPHCM', '0922334455',
        'seller02@example.com', 'seller', SYSTIMESTAMP);

COMMIT;

-- Lấy user_id (vì là sequence)
DECLARE
  v_buyer1_id  VARCHAR2(20);
  v_buyer2_id  VARCHAR2(20);
  v_seller1_id VARCHAR2(20);
  v_seller2_id VARCHAR2(20);
BEGIN
  SELECT user_id INTO v_buyer1_id  FROM USERS WHERE username = 'buyer01';
  SELECT user_id INTO v_buyer2_id  FROM USERS WHERE username = 'buyer02';
  SELECT user_id INTO v_seller1_id FROM USERS WHERE username = 'seller01';
  SELECT user_id INTO v_seller2_id FROM USERS WHERE username = 'seller02';

  -- Subtable
  INSERT INTO BUYER  (user_id) VALUES (v_buyer1_id);
  INSERT INTO BUYER  (user_id) VALUES (v_buyer2_id);
  INSERT INTO SELLER (user_id, shop_name) VALUES (v_seller1_id, 'Shop Phạm Cường');
  INSERT INTO SELLER (user_id, shop_name) VALUES (v_seller2_id, 'Shop Lê Dũng');

  COMMIT;

  -- =================================================================
  -- 3. PRODUCTS - Mỗi seller bán vài sản phẩm
  -- =================================================================
  -- Seller 1: Điện thoại + Laptop
  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller1_id, 'iPhone 15 Pro Max 256GB', 221, '17x7.7x0.83cm',
          'USA', 'Apple',
          'Flagship của Apple với chip A17 Pro, camera 48MP, khung titanium siêu bền nhẹ.',
          29990000, 50,
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:80/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max-blue-titanium.png',
          'active', SYSTIMESTAMP);

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller1_id, 'Samsung Galaxy S24 Ultra 512GB', 233, '16.3x7.9x0.86cm',
          'Vietnam', 'Samsung',
          'Phablet cao cấp với S Pen tích hợp, camera 200MP, AI Galaxy.',
          27990000, 35,
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:80/plain/https://cellphones.com.vn/media/catalog/product/g/a/galaxy-s24-ultra-titan-violet.png',
          'active', SYSTIMESTAMP);

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller1_id, 'MacBook Air M3 13" 256GB', 1240, '30.4x21.5x1.13cm',
          'China', 'Apple',
          'Laptop ultraportable với chip M3, pin 18 giờ, màn hình Liquid Retina.',
          26990000, 25,
          'https://cdn.tgdd.vn/Products/Images/44/305658/macbook-air-13-inch-m3-2024-starlight.jpg',
          'active', SYSTIMESTAMP);

  -- Seller 2: Phụ kiện + Thời trang
  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller2_id, 'Tai nghe Sony WH-1000XM5', 250, 'Headphone',
          'Japan', 'Sony',
          'Tai nghe chống ồn flagship, pin 30 giờ, codec LDAC, kết nối Bluetooth 5.2.',
          7990000, 100,
          'https://cdn.tgdd.vn/Products/Images/54/253556/tai-nghe-bluetooth-chup-tai-sony-wh-1000xm5-bac-1.jpg',
          'active', SYSTIMESTAMP);

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller2_id, 'Apple AirPods Pro 2 USB-C', 50, '4.5x6cm',
          'China', 'Apple',
          'AirPods Pro thế hệ 2 với chip H2, ANC nâng cao, sạc USB-C.',
          5490000, 80,
          'https://cdn.tgdd.vn/Products/Images/54/315014/airpods-pro-2nd-generation-usbc-1.jpg',
          'active', SYSTIMESTAMP);

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller2_id, 'Áo thun Polo Nam', 250, 'L',
          'Vietnam', 'Couple TX',
          'Áo polo cotton co giãn 4 chiều, thấm hút mồ hôi tốt, phù hợp công sở và dạo phố.',
          299000, 200,
          'https://cdn.tgdd.vn/Products/Images/9408/313022/ao-polo-nam-couple-tx-mpv4029-trang-1.jpg',
          'active', SYSTIMESTAMP);

  INSERT INTO PRODUCT (user_id,product_name, weight, product_size, origin, brand, description,
                       price, stock_quantity, image_url, status, created_at)
  VALUES (v_seller2_id, 'Sách Lập trình Cơ sở Dữ liệu', 500, '24x16cm',
          'Vietnam', 'NXB Bách Khoa',
          'Giáo trình DBMS dành cho sinh viên chuyên ngành CNTT. Nội dung đầy đủ về SQL, PL/SQL, NoSQL.',
          150000, 500,
          'https://placehold.co/300x300/6366f1/ffffff?text=DBMS+Book',
          'active', SYSTIMESTAMP);

  COMMIT;

  -- =================================================================
  -- 4. PRODUCT-CATEGORY mapping (BELONG)
  -- =================================================================
  -- Lấy product_id (cách dễ nhất là theo name vì product_id auto-gen)
  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0001' FROM PRODUCT
   WHERE product_name LIKE 'iPhone%' OR product_name LIKE 'Samsung%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0002' FROM PRODUCT
   WHERE product_name LIKE 'MacBook%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0003' FROM PRODUCT
   WHERE product_name LIKE 'Tai nghe%' OR product_name LIKE 'Apple AirPods%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0004' FROM PRODUCT
   WHERE product_name LIKE 'Áo thun%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0005' FROM PRODUCT
   WHERE product_name LIKE 'Sách%';

  COMMIT;

  DBMS_OUTPUT.PUT_LINE('✅ Seed data complete!');
  DBMS_OUTPUT.PUT_LINE('   Buyer accounts: buyer01 / buyer02 (password: 123456)');
  DBMS_OUTPUT.PUT_LINE('   Seller accounts: seller01 / seller02 (password: 123456)');
END;
/

EXIT;
