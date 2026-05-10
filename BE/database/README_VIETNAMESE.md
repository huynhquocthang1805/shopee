# Hướng dẫn cấu hình tiếng Việt cho Oracle

Khi seed dữ liệu tiếng Việt qua **sqlplus** mặc định trên Windows, các ký tự có dấu sẽ bị lưu sai (chữ `??`, ô vuông, `Ä‘á»‹nh dáº¡ng`...). Nguyên nhân: encoding mặc định của shell là CP1252 hoặc CP1258 — không phải UTF-8.

Cần làm **2 bước** trước khi chạy `sqlplus @seed_demo.sql`:

## Bước 1: Đảm bảo Database character set là UTF-8

Vào sqlplus với tài khoản admin, kiểm tra:

```sql
SELECT * FROM nls_database_parameters
WHERE parameter LIKE '%CHARACTERSET%';
```

Nếu thấy `NLS_CHARACTERSET = AL32UTF8` → OK, sang Bước 2.

Nếu KHÔNG phải `AL32UTF8` (ví dụ `WE8MSWIN1252`) → cần re-create DB hoặc PDB. Với Oracle XE/Free, tốt nhất uninstall rồi cài lại và chọn UTF-8.

## Bước 2: Cấu hình client (sqlplus) trước khi chạy seed

### 🪟 Windows CMD (Command Prompt)

```cmd
chcp 65001
set NLS_LANG=.AL32UTF8
cd D:\path\to\BE\database
sqlplus ecom_user/StrongPass123@//localhost:1521/orcl @seed_demo.sql
```

- `chcp 65001` — đổi code page console sang UTF-8
- `set NLS_LANG=.AL32UTF8` — bảo client gửi UTF-8 cho server

### 🪟 Windows PowerShell

```powershell
chcp 65001
$env:NLS_LANG = ".AL32UTF8"
cd D:\path\to\BE\database
sqlplus ecom_user/StrongPass123@//localhost:1521/orcl '@seed_demo.sql'
```

### 🐧 Linux / 🍎 macOS

```bash
export NLS_LANG=.AL32UTF8
cd /path/to/BE/database
sqlplus ecom_user/StrongPass123@//localhost:1521/orcl @seed_demo.sql
```

## Bước 3: File `.sql` PHẢI lưu encoding UTF-8 (không BOM)

- **VS Code**: bottom-right → click chỗ encoding (UTF-8 / Windows 1252) → chọn **Reopen with Encoding** → **UTF-8** → rồi **Save with Encoding** → **UTF-8**
- **Notepad++**: Encoding menu → **Convert to UTF-8** (KHÔNG chọn "with BOM")

## Cách kiểm tra sau khi seed

```sql
SELECT first_name, last_name, address FROM USERS WHERE username = 'buyer01';
```

Phải thấy: `Nguyễn   An   123 Nguyễn Văn Cừ, Q.5, TPHCM` (đầy đủ dấu).

Nếu thấy `Nguy?n` hoặc `NguyÅ¯n` → bước 2 chưa thành công, set lại `NLS_LANG`.

## Plan B: Dùng Node.js script (luôn UTF-8 chuẩn)

Nếu sqlplus vẫn không chạy được tiếng Việt sau khi đã làm các bước trên, hãy cân nhắc viết file `seed_demo.js` chạy bằng Node.js — `oracledb` driver gửi UTF-8 native và **không phụ thuộc vào shell encoding**.

## Tóm tắt nhanh (Windows CMD)

```cmd
chcp 65001
set NLS_LANG=.AL32UTF8
sqlplus ecom_user/StrongPass123@//localhost:1521/orcl @setup_oracle.sql
sqlplus ecom_user/StrongPass123@//localhost:1521/orcl @seed_demo.sql
```

Sau khi seed xong, **restart BE** (`npm start` lại) rồi reload trang FE — tên sản phẩm sẽ hiển thị tiếng Việt đúng.
