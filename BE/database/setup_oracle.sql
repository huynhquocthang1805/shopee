-- ===========================================================================
--  setup_oracle.sql — Phiên bản đã sửa
--
--  Thay đổi chính so với bản cũ:
--    - image_url: VARCHAR2(500) → VARCHAR2(2000) (chứa link ảnh dài hơn)
--    - description: vẫn CLOB (mô tả không giới hạn độ dài)
--    - Thêm CATEGORY mở rộng (10 ngành hàng thay vì 5)
--
--  Cách chạy:
--    sqlplus ecom_user/StrongPass123@//127.0.0.1:1521/FREEPDB1 @setup_oracle.sql
-- ===========================================================================

SET SERVEROUTPUT ON;
SET DEFINE OFF;

-- ===========================================================================
-- PHẦN 1: DỌN DẸP
-- ===========================================================================
BEGIN EXECUTE IMMEDIATE 'DROP TABLE RATING CASCADE CONSTRAINTS';      EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ORDER_DETAIL CASCADE CONSTRAINTS';EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ORDERS CASCADE CONSTRAINTS';      EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE BELONG CASCADE CONSTRAINTS';      EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE PRODUCT CASCADE CONSTRAINTS';     EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CATEGORY CASCADE CONSTRAINTS';    EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SELLER CASCADE CONSTRAINTS';      EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE BUYER CASCADE CONSTRAINTS';       EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE USERS CASCADE CONSTRAINTS';       EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_USERS';        EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_PRODUCT';      EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_ORDERS';       EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_ORDER_DETAIL'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_CATEGORY';     EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_RATING';       EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ===========================================================================
-- PHẦN 2: SEQUENCES
-- ===========================================================================
CREATE SEQUENCE SEQ_USERS        START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SEQ_PRODUCT      START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SEQ_ORDERS       START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SEQ_ORDER_DETAIL START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SEQ_CATEGORY     START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SEQ_RATING       START WITH 1 INCREMENT BY 1 NOCACHE;

-- ===========================================================================
-- PHẦN 3: TẠO BẢNG
-- ===========================================================================

CREATE TABLE USERS (
    user_id      VARCHAR2(20)  PRIMARY KEY,
    first_name   VARCHAR2(100) NOT NULL,
    last_name    VARCHAR2(100) NOT NULL,
    username     VARCHAR2(50)  NOT NULL UNIQUE,
    password     VARCHAR2(255) NOT NULL,
    birthday     DATE,
    sex          VARCHAR2(20)  CHECK (sex IN ('Nam', 'Nữ', 'Không trả lời')),
    address      VARCHAR2(255),
    phone_number VARCHAR2(20),
    email        VARCHAR2(100) NOT NULL UNIQUE,
    role         VARCHAR2(10)  NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    created_at   TIMESTAMP     DEFAULT SYSTIMESTAMP
);

CREATE TABLE BUYER (
    user_id VARCHAR2(20) PRIMARY KEY,
    CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE TABLE SELLER (
    user_id   VARCHAR2(20) PRIMARY KEY,
    shop_name VARCHAR2(100),
    CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE TABLE CATEGORY (
    category_id VARCHAR2(10)  PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL UNIQUE
);

-- PRODUCT — image_url mở rộng lên 2000 ký tự
CREATE TABLE PRODUCT (
    product_id     VARCHAR2(20)  PRIMARY KEY,
    user_id        VARCHAR2(20)  NOT NULL,
    product_name   VARCHAR2(255) NOT NULL,
    weight         NUMBER(10),
    product_size   VARCHAR2(50),
    origin         VARCHAR2(100),
    brand          VARCHAR2(100),
    description    CLOB,
    price          NUMBER(15,2)  NOT NULL CHECK (price >= 0),
    stock_quantity NUMBER(10)    DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url      VARCHAR2(2000),                        -- TĂNG TỪ 500 → 2000
    status         VARCHAR2(10)  DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    created_at     TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_product_seller FOREIGN KEY (user_id) REFERENCES SELLER(user_id)
)
LOB (description) STORE AS SECUREFILE (CACHE);

CREATE TABLE BELONG (
    product_id  VARCHAR2(20),
    category_id VARCHAR2(10),
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_belong_product  FOREIGN KEY (product_id)  REFERENCES PRODUCT(product_id)  ON DELETE CASCADE,
    CONSTRAINT fk_belong_category FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id) ON DELETE CASCADE
);

CREATE TABLE ORDERS (
    order_id         VARCHAR2(20)  PRIMARY KEY,
    user_id          VARCHAR2(20)  NOT NULL,
    status           VARCHAR2(20)  DEFAULT 'pending'
                       CHECK (status IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled')),
    delivery_address VARCHAR2(500) NOT NULL,
    total_amount     NUMBER(15,2)  DEFAULT 0,
    created_at       TIMESTAMP     DEFAULT SYSTIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

CREATE TABLE ORDER_DETAIL (
    order_detail_id VARCHAR2(20)  PRIMARY KEY,
    order_id        VARCHAR2(20)  NOT NULL,
    product_id      VARCHAR2(20)  NOT NULL,
    quantity        NUMBER(10)    NOT NULL CHECK (quantity > 0),
    unit_price      NUMBER(15,2)  NOT NULL,
    subtotal        NUMBER(15,2)  NOT NULL,
    CONSTRAINT fk_od_order   FOREIGN KEY (order_id)   REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_od_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

CREATE TABLE RATING (
    rating_id      VARCHAR2(20)  PRIMARY KEY,
    user_id        VARCHAR2(20)  NOT NULL,
    product_id     VARCHAR2(20)  NOT NULL,
    rating         NUMBER(2,1)   NOT NULL CHECK (rating BETWEEN 1 AND 5),
    rating_comment VARCHAR2(1000),
    created_at     TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_rating_user    FOREIGN KEY (user_id)    REFERENCES USERS(user_id)    ON DELETE CASCADE,
    CONSTRAINT fk_rating_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
);

CREATE INDEX idx_product_status   ON PRODUCT(status);
CREATE INDEX idx_product_seller   ON PRODUCT(user_id);
CREATE INDEX idx_orders_user      ON ORDERS(user_id);
CREATE INDEX idx_orders_status    ON ORDERS(status);
CREATE INDEX idx_orders_created   ON ORDERS(created_at);
CREATE INDEX idx_od_order         ON ORDER_DETAIL(order_id);

-- ===========================================================================
-- PHẦN 4: TRIGGERS
-- ===========================================================================

CREATE OR REPLACE TRIGGER trg_users_auto_id
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
    IF :NEW.user_id IS NULL THEN
        :NEW.user_id := 'U' || TO_CHAR(SYSDATE, 'YY') || LPAD(SEQ_USERS.NEXTVAL, 5, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_product_auto_id
BEFORE INSERT ON PRODUCT
FOR EACH ROW
BEGIN
    IF :NEW.product_id IS NULL THEN
        :NEW.product_id := 'P' || LPAD(SEQ_PRODUCT.NEXTVAL, 7, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_category_auto_id
BEFORE INSERT ON CATEGORY
FOR EACH ROW
BEGIN
    IF :NEW.category_id IS NULL THEN
        :NEW.category_id := 'G' || LPAD(SEQ_CATEGORY.NEXTVAL, 4, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_rating_auto_id
BEFORE INSERT ON RATING
FOR EACH ROW
BEGIN
    IF :NEW.rating_id IS NULL THEN
        :NEW.rating_id := 'R' || LPAD(SEQ_RATING.NEXTVAL, 7, '0');
    END IF;
END;
/

-- ===========================================================================
-- PHẦN 5: STORED PROCEDURES
-- ===========================================================================

CREATE OR REPLACE PROCEDURE insert_user (
    p_first_name    IN VARCHAR2,
    p_last_name     IN VARCHAR2,
    p_username      IN VARCHAR2,
    p_password      IN VARCHAR2,
    p_birthday      IN DATE,
    p_sex           IN VARCHAR2,
    p_address       IN VARCHAR2,
    p_phone_number  IN VARCHAR2,
    p_email         IN VARCHAR2,
    p_role          IN VARCHAR2,
    p_shop_name     IN VARCHAR2,
    p_new_user_id   OUT VARCHAR2
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM USERS WHERE username = p_username;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Username đã tồn tại');
    END IF;

    SELECT COUNT(*) INTO v_count FROM USERS WHERE email = p_email;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Email đã được sử dụng');
    END IF;

    INSERT INTO USERS (first_name, last_name, username, password,
                       birthday, sex, address, phone_number, email, role)
    VALUES (p_first_name, p_last_name, p_username, p_password,
            p_birthday, p_sex, p_address, p_phone_number, p_email, p_role)
    RETURNING user_id INTO p_new_user_id;

    IF p_role = 'buyer' THEN
        INSERT INTO BUYER (user_id) VALUES (p_new_user_id);
    ELSIF p_role = 'seller' THEN
        INSERT INTO SELLER (user_id, shop_name) VALUES (p_new_user_id, p_shop_name);
    END IF;

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE update_user (
    p_user_id      IN VARCHAR2,
    p_first_name   IN VARCHAR2,
    p_last_name    IN VARCHAR2,
    p_username     IN VARCHAR2,
    p_password     IN VARCHAR2,
    p_birthday     IN DATE,
    p_sex          IN VARCHAR2,
    p_address      IN VARCHAR2,
    p_phone_number IN VARCHAR2,
    p_email        IN VARCHAR2
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM USERS WHERE user_id = p_user_id;
    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'User không tồn tại');
    END IF;

    UPDATE USERS
       SET first_name   = p_first_name,
           last_name    = p_last_name,
           username     = p_username,
           password     = NVL(p_password, password),
           birthday     = p_birthday,
           sex          = p_sex,
           address      = p_address,
           phone_number = p_phone_number,
           email        = p_email
     WHERE user_id = p_user_id;

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE delete_user (p_user_id IN VARCHAR2) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM USERS WHERE user_id = p_user_id;
    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'User không tồn tại');
    END IF;

    DELETE FROM USERS WHERE user_id = p_user_id;
    COMMIT;
END;
/

-- insert_product với image_url VARCHAR2(2000)
CREATE OR REPLACE PROCEDURE insert_product (
    p_user_id        IN VARCHAR2,
    p_name           IN VARCHAR2,
    p_weight         IN NUMBER,
    p_size           IN VARCHAR2,
    p_origin         IN VARCHAR2,
    p_brand          IN VARCHAR2,
    p_description    IN CLOB,
    p_price          IN NUMBER,
    p_stock          IN NUMBER,
    p_image_url      IN VARCHAR2,
    p_new_product_id OUT VARCHAR2
) AS
    v_is_seller NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_is_seller FROM SELLER WHERE user_id = p_user_id;
    IF v_is_seller = 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'User không phải là seller');
    END IF;

    INSERT INTO PRODUCT (user_id, product_name, weight, product_size, origin, brand,
                         description, price, stock_quantity, image_url, status)
    VALUES (p_user_id, p_name, p_weight, p_size, p_origin, p_brand,
            p_description, p_price, NVL(p_stock, 0), p_image_url, 'active')
    RETURNING product_id INTO p_new_product_id;

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE update_product (
    p_id          IN VARCHAR2,
    p_user_id     IN VARCHAR2,
    p_name        IN VARCHAR2,
    p_weight      IN NUMBER,
    p_size        IN VARCHAR2,
    p_origin      IN VARCHAR2,
    p_brand       IN VARCHAR2,
    p_description IN CLOB,
    p_price       IN NUMBER,
    p_stock       IN NUMBER,
    p_image_url   IN VARCHAR2,
    p_status      IN VARCHAR2
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
      FROM PRODUCT
     WHERE product_id = p_id AND user_id = p_user_id;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20011, 'Sản phẩm không tồn tại hoặc không thuộc seller này');
    END IF;

    UPDATE PRODUCT
       SET product_name   = p_name,
           weight         = NVL(p_weight, weight),
           product_size   = p_size,
           origin         = p_origin,
           brand          = p_brand,
           description    = p_description,
           price          = p_price,
           stock_quantity = NVL(p_stock, stock_quantity),
           image_url      = p_image_url,
           status         = NVL(p_status, status)
     WHERE product_id = p_id;

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE delete_product (
    p_id      IN VARCHAR2,
    p_user_id IN VARCHAR2
) AS
    v_count   NUMBER;
    v_ordered NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
      FROM PRODUCT
     WHERE product_id = p_id AND user_id = p_user_id;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20012, 'Sản phẩm không tồn tại hoặc không thuộc seller này');
    END IF;

    SELECT COUNT(*) INTO v_ordered FROM ORDER_DETAIL WHERE product_id = p_id;
    IF v_ordered > 0 THEN
        UPDATE PRODUCT SET status = 'deleted' WHERE product_id = p_id;
    ELSE
        DELETE FROM BELONG  WHERE product_id = p_id;
        DELETE FROM RATING  WHERE product_id = p_id;
        DELETE FROM PRODUCT WHERE product_id = p_id;
    END IF;

    COMMIT;
END;
/

-- ===========================================================================
-- PHẦN 6: KIỂM TRA
-- ===========================================================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('==========================================');
    DBMS_OUTPUT.PUT_LINE('✅ Setup Oracle hoàn tất');
    DBMS_OUTPUT.PUT_LINE('   image_url: VARCHAR2(2000) — link ảnh dài hơn');
    DBMS_OUTPUT.PUT_LINE('==========================================');
    DBMS_OUTPUT.PUT_LINE('Bước tiếp theo: chạy seed_demo.sql');
    DBMS_OUTPUT.PUT_LINE('==========================================');
END;
/

EXIT;