-- =================================================================
-- seed_demo.sql — Phiên bản phong phú v2
-- 10 ngành hàng, 4 seller, ~30 sản phẩm đa dạng
-- Password mọi tài khoản demo: 123456 (đã được verify với bcrypt)
--
-- ⚠️ CẤU HÌNH TIẾNG VIỆT (BẮT BUỘC trước khi chạy file này):
--   Windows CMD:        chcp 65001 && set NLS_LANG=.AL32UTF8
--   Windows PowerShell: chcp 65001; $env:NLS_LANG=".AL32UTF8"
--   Linux/macOS:        export NLS_LANG=.AL32UTF8
--
-- Sau đó chạy:
--   sqlplus ecom_user/StrongPass123@//localhost:1521/orcl @seed_demo.sql
--
-- Xem chi tiết hướng dẫn ở: BE/database/README_VIETNAMESE.md
-- =================================================================

SET DEFINE OFF;

DELETE FROM ORDER_DETAIL;
DELETE FROM ORDERS;
DELETE FROM BELONG;
DELETE FROM RATING;
DELETE FROM PRODUCT;
DELETE FROM SELLER;
DELETE FROM BUYER;
DELETE FROM USERS;
DELETE FROM CATEGORY;
COMMIT;

-- =================================================================
-- 1. CATEGORIES (10 ngành hàng)
-- =================================================================
INSERT INTO CATEGORY (category_id, name) VALUES ('G0001', 'Điện thoại');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0002', 'Laptop & Máy tính');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0003', 'Phụ kiện điện tử');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0004', 'Thời trang nam');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0005', 'Thời trang nữ');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0006', 'Sách & Văn phòng phẩm');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0007', 'Đồ gia dụng');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0008', 'Mỹ phẩm & Làm đẹp');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0009', 'Thực phẩm');
INSERT INTO CATEGORY (category_id, name) VALUES ('G0010', 'Thể thao & Du lịch');
COMMIT;

-- =================================================================
-- 2. USERS — Hash bcrypt MỚI ĐÃ ĐƯỢC VERIFY cho password "123456"
-- =================================================================
INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Nguyễn', 'An', 'buyer01',
        '$2b$10$E4Q1PrpBXDOpsJYuxFQzDur72rFcMT1bay6M/msY9tMw4fCg65oF6',
        DATE '2000-05-15', 'Nam', '123 Nguyễn Văn Cừ, Q.5, TPHCM', '0901234567',
        'buyer01@example.com', 'buyer', SYSTIMESTAMP);

INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Trần', 'Bình', 'buyer02',
        '$2b$10$E4Q1PrpBXDOpsJYuxFQzDur72rFcMT1bay6M/msY9tMw4fCg65oF6',
        DATE '1998-08-22', 'Nữ', '456 Lê Lợi, Q.1, TPHCM', '0908765432',
        'buyer02@example.com', 'buyer', SYSTIMESTAMP);

INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Phạm', 'Cường', 'seller01',
        '$2b$10$E4Q1PrpBXDOpsJYuxFQzDur72rFcMT1bay6M/msY9tMw4fCg65oF6',
        DATE '1995-03-10', 'Nam', '789 Hai Bà Trưng, Q.3, TPHCM', '0911223344',
        'seller01@example.com', 'seller', SYSTIMESTAMP);

INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Lê', 'Dũng', 'seller02',
        '$2b$10$E4Q1PrpBXDOpsJYuxFQzDur72rFcMT1bay6M/msY9tMw4fCg65oF6',
        DATE '1992-12-01', 'Nam', '321 CMT8, Q.10, TPHCM', '0922334455',
        'seller02@example.com', 'seller', SYSTIMESTAMP);

INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Vũ', 'Hương', 'seller03',
        '$2b$10$E4Q1PrpBXDOpsJYuxFQzDur72rFcMT1bay6M/msY9tMw4fCg65oF6',
        DATE '1990-07-20', 'Nữ', '12 Pasteur, Q.1, TPHCM', '0933445566',
        'seller03@example.com', 'seller', SYSTIMESTAMP);

INSERT INTO USERS (first_name, last_name, username, password, birthday, sex,
                   address, phone_number, email, role, created_at)
VALUES ('Hoàng', 'Minh', 'seller04',
        '$2b$10$E4Q1PrpBXDOpsJYuxFQzDur72rFcMT1bay6M/msY9tMw4fCg65oF6',
        DATE '1988-11-05', 'Nam', '88 Nguyễn Trãi, Q.5, TPHCM', '0944556677',
        'seller04@example.com', 'seller', SYSTIMESTAMP);

COMMIT;

-- =================================================================
-- 3. SELLER + BUYER + PRODUCTS
-- =================================================================
DECLARE
  v_buyer1   VARCHAR2(20);
  v_buyer2   VARCHAR2(20);
  v_seller1  VARCHAR2(20);
  v_seller2  VARCHAR2(20);
  v_seller3  VARCHAR2(20);
  v_seller4  VARCHAR2(20);
BEGIN
  SELECT user_id INTO v_buyer1  FROM USERS WHERE username = 'buyer01';
  SELECT user_id INTO v_buyer2  FROM USERS WHERE username = 'buyer02';
  SELECT user_id INTO v_seller1 FROM USERS WHERE username = 'seller01';
  SELECT user_id INTO v_seller2 FROM USERS WHERE username = 'seller02';
  SELECT user_id INTO v_seller3 FROM USERS WHERE username = 'seller03';
  SELECT user_id INTO v_seller4 FROM USERS WHERE username = 'seller04';

  INSERT INTO BUYER  (user_id) VALUES (v_buyer1);
  INSERT INTO BUYER  (user_id) VALUES (v_buyer2);
  INSERT INTO SELLER (user_id, shop_name) VALUES (v_seller1, 'TechZone Phạm Cường');
  INSERT INTO SELLER (user_id, shop_name) VALUES (v_seller2, 'AudioPro Lê Dũng');
  INSERT INTO SELLER (user_id, shop_name) VALUES (v_seller3, 'Beauty & Fashion Hương');
  INSERT INTO SELLER (user_id, shop_name) VALUES (v_seller4, 'Home & Sports Minh');
  COMMIT;

  -- ===== Seller 1: Điện thoại + Laptop =====
  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', 221, '16.0x7.7x0.83cm', 'USA', 'Apple',
    'Flagship Apple với chip A17 Pro, camera 48MP với zoom quang 5x, khung Titan nhẹ nhất. Màn hình Super Retina XDR ProMotion 120Hz.',
    29990000, 50,
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max-blue-titanium.png',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'Samsung Galaxy S24 Ultra 512GB', 233, '16.3x7.9x0.86cm', 'Vietnam', 'Samsung',
    'Phablet cao cấp với S Pen tích hợp, camera 200MP, AI Galaxy thông minh. Chip Snapdragon 8 Gen 3 for Galaxy.',
    27990000, 35,
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/a/galaxy-s24-ultra-titan-violet.png',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'Xiaomi 14 Pro 5G 256GB', 223, '16.1x7.5x0.85cm', 'China', 'Xiaomi',
    'Snapdragon 8 Gen 3, camera Leica 50MP, sạc nhanh 120W. Pin 4880mAh siêu trâu.',
    18990000, 60,
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-den.png',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'OPPO Reno11 F 5G 256GB', 177, '16.1x7.4x0.78cm', 'Vietnam', 'OPPO',
    'Camera 64MP với khung viền siêu mỏng, màn AMOLED 120Hz, pin 5000mAh.',
    7990000, 100,
    'https://cdn.tgdd.vn/Products/Images/42/318829/oppo-reno11-f-5g-xanh-thumb-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'MacBook Air M3 13" 256GB Starlight', 1240, '30.4x21.5x1.13cm', 'China', 'Apple',
    'Laptop ultraportable với chip M3 8-core CPU + 8-core GPU, RAM 8GB, pin 18 giờ. Màn hình Liquid Retina 13.6 inch.',
    26990000, 25,
    'https://cdn.tgdd.vn/Products/Images/44/305658/macbook-air-13-inch-m3-2024-starlight.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'ASUS ROG Strix G16 Gaming i7 RTX 4060', 2500, '35.4x26.4x2.26cm', 'China', 'ASUS',
    'Laptop gaming i7-13650HX, RTX 4060 8GB, RAM 16GB DDR5, SSD 512GB. Màn hình 16 inch QHD+ 240Hz.',
    34990000, 18,
    'https://cdn.tgdd.vn/Products/Images/44/313533/asus-rog-strix-g16-g614jv-i7-n3110w-thumb-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller1, 'Dell XPS 13 Plus 9320 i7 1360P', 1240, '29.5x19.9x1.5cm', 'Malaysia', 'Dell',
    'Ultrabook cao cấp với i7-1360P, RAM 16GB LPDDR5, SSD 512GB. Màn hình OLED 13.4" 3.5K cảm ứng.',
    36990000, 12,
    'https://cdn.tgdd.vn/Products/Images/44/289922/dell-xps-13-plus-9320-i7-71017789-bac-thumb-600x600.jpg',
    'active');

  -- ===== Seller 2: Tai nghe + Phụ kiện =====
  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Tai nghe Sony WH-1000XM5 Bluetooth', 250, 'Headphone over-ear', 'Japan', 'Sony',
    'Tai nghe chống ồn flagship, pin 30 giờ, codec LDAC, kết nối Bluetooth 5.2 Multipoint. 8 micro chống ồn.',
    7990000, 100,
    'https://cdn.tgdd.vn/Products/Images/54/253556/tai-nghe-bluetooth-chup-tai-sony-wh-1000xm5-bac-1.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Apple AirPods Pro 2 USB-C', 50, '4.5x6cm', 'China', 'Apple',
    'AirPods Pro thế hệ 2 với chip H2, ANC nâng cao gấp đôi, sạc USB-C, hỗ trợ Find My, âm thanh không gian Adaptive.',
    5490000, 80,
    'https://cdn.tgdd.vn/Products/Images/54/315014/airpods-pro-2nd-generation-usbc-1.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Tai nghe Bose QuietComfort Ultra', 254, 'Headphone over-ear', 'Mexico', 'Bose',
    'Chống ồn chủ động đỉnh nhất Bose, âm thanh Immersive Audio, pin 24h. Da bò pha mềm mại.',
    9490000, 40,
    'https://cdn.tgdd.vn/Products/Images/54/318055/tai-nghe-bluetooth-chup-tai-bose-quietcomfort-ultra-headphones-den-thumb-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Đồng hồ Apple Watch Series 9 GPS 45mm', 39, 'Vòng đeo S/M', 'USA', 'Apple',
    'Chip S9 SiP mới, màn hình Always-On siêu sáng 2000 nits, hỗ trợ Double Tap. Đo SpO2 và ECG.',
    9990000, 55,
    'https://cdn.tgdd.vn/Products/Images/7077/289035/apple-watch-s9-gps-45mm-vien-nhom-day-cao-su-thumb-1-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Bàn phím cơ Logitech MX Mechanical', 828, '43.3x13.2x2.6cm', 'China', 'Logitech',
    'Bàn phím cơ Tactile Quiet, đèn nền thông minh, kết nối Bluetooth + Logi Bolt USB. Pin 15 ngày.',
    3690000, 70,
    'https://cdn.tgdd.vn/Products/Images/4742/237923/ban-phim-co-khong-day-bluetooth-logitech-mx-mechanical-1-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Chuột Logitech MX Master 3S', 141, '12.5x8.4x5.1cm', 'China', 'Logitech',
    'Chuột năng suất hàng đầu, cảm biến 8000 DPI, click siêu yên. Kết nối 3 thiết bị cùng lúc.',
    2490000, 90,
    'https://cdn.tgdd.vn/Products/Images/2148/241353/chuot-khong-day-bluetooth-logitech-mx-master-3s-than-1-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller2, 'Sạc dự phòng Anker MagGo 10000mAh PD 27W', 200, '10.6x6.6x1.6cm', 'China', 'Anker',
    'Sạc không dây MagSafe 15W, cổng USB-C PD 27W, dung lượng 10000mAh. Có chân chống xem video.',
    1490000, 150,
    'https://cdn.tgdd.vn/Products/Images/57/315553/pin-sac-du-phong-magsafe-10000mah-anker-maggo-a1652-trang-thumb-600x600.jpg',
    'active');

  -- ===== Seller 3: Thời trang + Mỹ phẩm =====
  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Áo thun Polo Nam Couple TX cao cấp', 250, 'L', 'Vietnam', 'Couple TX',
    'Áo polo cotton co giãn 4 chiều, thấm hút mồ hôi tốt. Phù hợp công sở và dạo phố. Có 5 màu.',
    299000, 200,
    'https://cdn.tgdd.vn/Products/Images/9408/313022/ao-polo-nam-couple-tx-mpv4029-trang-1.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Quần Jeans Nam Slim Fit Levi 511', 600, '32', 'Vietnam', 'Levi''s',
    'Jeans Levi 511 chính hãng, dáng slim ôm vừa. Cotton denim 12oz bền đẹp, lên màu chuẩn.',
    1290000, 80,
    'https://product.hstatic.net/200000642007/product/levi_s_511_29507-0866_5_3a4d9e10b84541bf8a0b69e61b9b34e0_master.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Đầm Maxi Hoa Mùa Hè', 400, 'M', 'Vietnam', 'IVY moda',
    'Đầm maxi voan hoa nhí, thiết kế cổ V quyến rũ, tay phồng nhẹ nhàng. Phù hợp đi biển, dã ngoại.',
    690000, 60,
    'https://product.hstatic.net/1000088785/product/edw211004-tha-001_3f3d9bcce71d49da8f3c6c4d9a91e9b3_master.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Túi xách nữ Charles & Keith Quilted', 350, '22x16x8cm', 'Singapore', 'Charles & Keith',
    'Túi xách thiết kế chần bông, dây xích vàng sang trọng. Chất liệu PU cao cấp, đi kèm strap.',
    1890000, 45,
    'https://www.charleskeith.com/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-ck-products/default/dw1f3e1f3e/images/hi-res/2024-L1-CK2-30151362-44-1.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Son Dior Rouge 999 Velvet', 35, '3.5g', 'France', 'Dior',
    'Son Dior 999 Velvet đỏ huyền thoại, lì lâu trôi 12 giờ. Công thức dưỡng môi từ tinh chất hoa hồng.',
    1090000, 120,
    'https://media.hcdn.vn/catalog/product/s/o/son-li-dior-rouge-velvet-mau-999-velvet-do-thuan-3-5g_img_500x500_d3d8ef_fit_center.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Nước hoa Chanel Coco Mademoiselle EDP 100ml', 350, '100ml', 'France', 'Chanel',
    'Nước hoa nữ Chanel Coco Mademoiselle, hương cam bergamot quyến rũ. Lưu hương 8-10 giờ.',
    3990000, 30,
    'https://media.hcdn.vn/catalog/product/c/h/chanel-coco-mademoiselle-edp-100ml-1_img_500x500_e0ac4c_fit_center.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Kem chống nắng Anessa Perfect UV SPF50+ 60ml', 80, '60ml', 'Japan', 'Anessa',
    'Kem chống nắng Anessa Perfect UV chống thấm nước 16 giờ, không gây bí da. SPF50+/PA++++.',
    520000, 200,
    'https://media.hcdn.vn/catalog/product/a/n/anessa-kem-chong-nang-bao-ve-hoan-hao-anessa-perfect-uv-sunscreen-skincare-milk-spf-50-60ml_img_500x500_03f5e8_fit_center.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller3, 'Sữa rửa mặt Cetaphil Gentle Skin 250ml', 280, '250ml', 'Canada', 'Cetaphil',
    'Sữa rửa mặt dịu nhẹ Cetaphil cho mọi loại da, kể cả da nhạy cảm. Không xà phòng, không hương liệu.',
    295000, 250,
    'https://media.hcdn.vn/catalog/product/c/e/cetaphil-sua-rua-mat-gentle-skin-cleanser-250ml_img_500x500_dc25c0_fit_center.jpg',
    'active');

  -- ===== Seller 4: Gia dụng + Sách + Thể thao + Thực phẩm =====
  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Nồi cơm điện Cuckoo CRP-G1015F 1.8L', 5800, '32x28x25cm', 'Korea', 'Cuckoo',
    'Nồi cơm điện cao tần Cuckoo Hàn Quốc, 12 chế độ nấu. Lòng nồi gang phủ kim cương 11 lớp.',
    8990000, 25,
    'https://cdn.tgdd.vn/Products/Images/1922/271080/noi-com-dien-cao-tan-cuckoo-1-8-lit-crp-jhsr1009f-1-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Máy lọc nước Karofi KAQ-U95 10 cấp', 14000, '40x29x52cm', 'Vietnam', 'Karofi',
    'Máy lọc nước Karofi 10 cấp lọc, tích hợp Hydrogen + Mineral. Lọc nước RO tinh khiết, dung tích 10L/h.',
    7990000, 35,
    'https://cdn.tgdd.vn/Products/Images/1985/239775/may-loc-nuoc-rok-karofi-10-cap-loc-kaq-u95-thumb-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Nồi chiên không dầu Philips HD9252 4.1L', 4700, '32.5x32.5x29cm', 'Indonesia', 'Philips',
    'Nồi chiên không dầu Philips Essential 4.1L, công nghệ Rapid Air, ít dầu hơn 90%. Dễ vệ sinh.',
    2890000, 80,
    'https://cdn.tgdd.vn/Products/Images/1962/235843/noi-chien-khong-dau-philips-4-1-lit-hd9252-90-1-600x600.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Sách Lập trình Cơ sở Dữ liệu Oracle', 500, '24x16cm', 'Vietnam', 'NXB Bách Khoa',
    'Giáo trình Oracle dành cho sinh viên CNTT. Đầy đủ về SQL, PL/SQL, Stored Procedures, Triggers, NoSQL cơ bản.',
    150000, 500,
    'https://salt.tikicdn.com/cache/280x280/ts/product/4f/68/f8/f10b3a9be76b0e1ca60bc3066bb73a76.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Sách Đắc Nhân Tâm bìa cứng', 450, '20.5x14.5cm', 'Vietnam', 'NXB Tổng hợp',
    'Sách bestseller "How to Win Friends and Influence People" bản dịch tiếng Việt của Dale Carnegie. Bìa cứng cao cấp.',
    99000, 999,
    'https://salt.tikicdn.com/cache/750x750/ts/product/97/c7/97/99c20fb7cba0bfc9f6f9dfe5a48ea940.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Giày chạy bộ Nike Air Zoom Pegasus 40', 270, '42 EU', 'Vietnam', 'Nike',
    'Giày chạy bộ Nike Pegasus 40 với đệm Air Zoom êm ái, upper Mesh thoáng khí. Lý tưởng cho road runner.',
    3290000, 100,
    'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/8e2ea9f0-ed5a-4a82-9e65-cda1cab2eec8/air-zoom-pegasus-40-running-shoes-rRrk4r.png',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Vali kéo Mia Toro Italy 24 inch chống va đập', 4200, '67x44x28cm', 'Italy', 'Mia Toro',
    'Vali kéo Mia Toro 24 inch, vỏ PC chống va đập, 4 bánh xe 360°, khóa TSA. Phù hợp chuyến đi 5-7 ngày.',
    3490000, 50,
    'https://salt.tikicdn.com/cache/750x750/ts/product/f6/9f/3a/eea8f8e3a2d3c70a6b7e68f9d37c2c1f.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Trà Lipton Yellow Label hộp 100 túi lọc', 200, '100 túi 2g', 'Vietnam', 'Lipton',
    'Trà đen Lipton Yellow Label nhập khẩu Sri Lanka, hộp 100 gói lọc 2g. Pha trà sữa, trà chanh, trà đào.',
    79000, 500,
    'https://cdn.tgdd.vn/Products/Images/2670/86344/bhx/tra-lipton-nhan-vang-hop-200g-202301160949099892.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Cà phê hòa tan G7 3in1 hộp 21 gói', 350, '21 gói 16g', 'Vietnam', 'Trung Nguyên',
    'Cà phê hòa tan G7 3in1 đậm đà hương vị Việt. Pha nóng/lạnh đều ngon, tiện lợi cho dân văn phòng.',
    65000, 999,
    'https://cdn.tgdd.vn/Products/Images/2384/76817/bhx/ca-phe-sua-hoa-tan-trung-nguyen-g7-3in1-bich-21-goi-x-16g-202105241414001787.jpg',
    'active');

  INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand, description, price, stock_quantity, image_url, status)
  VALUES (v_seller4, 'Bộ tạ tay Adjustable 2x10kg điều chỉnh', 20000, '40x20x20cm', 'China', 'Generic',
    'Bộ tạ tay điều chỉnh 2-10kg/bên, thanh tạ chuyển sang tạ đòn 20kg. Đĩa tạ bọc cao su an toàn.',
    1290000, 60,
    'https://salt.tikicdn.com/cache/750x750/ts/product/5b/a0/82/1aa5e3bfd3a1c8e3f3c6e1c3d3e4f5a6.jpg',
    'active');

  COMMIT;

  -- BELONG mapping
  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0001' FROM PRODUCT
   WHERE product_name LIKE 'iPhone%' OR product_name LIKE 'Samsung%'
      OR product_name LIKE 'Xiaomi%' OR product_name LIKE 'OPPO%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0002' FROM PRODUCT
   WHERE product_name LIKE 'MacBook%' OR product_name LIKE 'ASUS%'
      OR product_name LIKE 'Dell%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0003' FROM PRODUCT
   WHERE product_name LIKE 'Tai nghe%' OR product_name LIKE 'Apple AirPods%'
      OR product_name LIKE 'Đồng hồ%' OR product_name LIKE 'Bàn phím%'
      OR product_name LIKE 'Chuột%'   OR product_name LIKE 'Sạc dự phòng%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0004' FROM PRODUCT
   WHERE product_name LIKE 'Áo thun%' OR product_name LIKE 'Quần Jeans%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0005' FROM PRODUCT
   WHERE product_name LIKE 'Đầm%' OR product_name LIKE 'Túi xách%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0006' FROM PRODUCT
   WHERE product_name LIKE 'Sách%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0007' FROM PRODUCT
   WHERE product_name LIKE 'Nồi cơm%' OR product_name LIKE 'Máy lọc nước%'
      OR product_name LIKE 'Nồi chiên%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0008' FROM PRODUCT
   WHERE product_name LIKE 'Son%' OR product_name LIKE 'Nước hoa%'
      OR product_name LIKE 'Kem chống nắng%' OR product_name LIKE 'Sữa rửa mặt%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0009' FROM PRODUCT
   WHERE product_name LIKE 'Trà%' OR product_name LIKE 'Cà phê%';

  INSERT INTO BELONG (product_id, category_id)
  SELECT product_id, 'G0010' FROM PRODUCT
   WHERE product_name LIKE 'Giày%' OR product_name LIKE 'Vali%' OR product_name LIKE 'Bộ tạ%';

  COMMIT;

  -- RATINGS demo
  INSERT INTO RATING (user_id, product_id, rating, rating_comment)
  SELECT v_buyer1, product_id, 5, 'Sản phẩm tuyệt vời, đóng gói cẩn thận, giao hàng nhanh!'
  FROM PRODUCT WHERE ROWNUM <= 5;

  INSERT INTO RATING (user_id, product_id, rating, rating_comment)
  SELECT v_buyer2, product_id, 4.5, 'Hài lòng với chất lượng, đúng như mô tả. Sẽ ủng hộ shop tiếp.'
  FROM PRODUCT WHERE ROWNUM <= 3;

  COMMIT;

  DBMS_OUTPUT.PUT_LINE('==========================================');
  DBMS_OUTPUT.PUT_LINE('Seed data complete!');
  DBMS_OUTPUT.PUT_LINE('   Buyers : buyer01 / buyer02 (mat khau: 123456)');
  DBMS_OUTPUT.PUT_LINE('   Sellers: seller01 ... seller04 (mat khau: 123456)');
  DBMS_OUTPUT.PUT_LINE('   Products: ~30 san pham');
  DBMS_OUTPUT.PUT_LINE('==========================================');
END;
/

EXIT;
