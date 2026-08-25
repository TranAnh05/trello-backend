# Trello API

Backend API RESTful được thiết kế cho ứng dụng quản lý công việc theo phong cách Trello. Hệ thống cung cấp các chức năng cốt lõi như quản lý bảng, cột, thẻ, xác thực người dùng và cập nhật thời gian thực.

## Công nghệ

| Danh mục | Công nghệ / Thư viện |
| :--- | :--- |
| **Runtime** | Node.js (>= 18.x) |
| **Framework** | **Express.js** |
| **Database** | **MongoDB** |
| **Real-time** | **Socket.io** |
| **Authentication**| **JSON Web Tokens (JWT)**, bcryptjs |
| **Validation** | **Joi** |
| **Processing** | **Babel** (ES6+), **Multer** |
| **File Upload** | **Cloudinary** |
| **Email** | **Resend** |
| **Utilities** | dotenv, lodash, uuid, async-exit-hook |

## Các tính năng chính
- **Quản lý tài nguyên:** CRUD toàn diện cho Bảng (Board), Cột (Column), Thẻ (Card).
- **Xác thực:** Đăng ký, đăng nhập, làm mới Token (Access/Refresh Token).
- **Phân quyền:** Kiểm soát truy cập dựa trên JWT.
- **Thời gian thực:** Socket.io hỗ trợ thông báo cập nhật bảng, mời người dùng vào bảng.
- **Xử lý ảnh:** Multer kết hợp Cloudinary để upload và quản lý ảnh đính kèm.
- **Thông báo:** Gửi email xác nhận/mời tham gia qua Resend.
- **Validation:** Kiểm tra dữ liệu đầu vào chặt chẽ bằng Joi.

## Hướng dẫn cài đặt & Cấu hình

### 1. Yêu cầu hệ thống
* Node.js (>= 18.x)
* MongoDB (Local hoặc MongoDB Atlas)

### 2. Thiết lập dự án
1. Clone dự án và cài đặt dependencies:
   ```bash
   npm install
   ```
2. Tạo file `.env` ở thư mục gốc dựa trên các key cần thiết (xem tại `src/config/environment.js`):
   ```text
   MONGODB_URI=...
   DATABASE_NAME=...
   APP_HOST=...
   APP_PORT=...
   ACCESS_TOKEN_SECRET_SIGNATURE=...
   ...
   ```

### 3. Lệnh chạy dự án

* **Chế độ phát triển:**
  ```bash
  npm run dev
  ```
* **Chế độ Production:**
  ```bash
  npm run build
  npm run production
  ```
* **Kiểm tra mã nguồn:**
  ```bash
  npm run lint
  ```

## Cấu trúc dự án (MVC Pattern)
* `src/controllers`: Xử lý HTTP requests/responses.
* `src/services`: Business logic, xử lý nghiệp vụ chính.
* `src/models`: Định nghĩa Schema và tương tác dữ liệu MongoDB.
* `src/routes`: Định nghĩa các API endpoints (phiên bản v1).
* `src/validations`: Validation schemas (Joi) cho dữ liệu đầu vào.
* `src/middlewares`: Xử lý lỗi tập trung, xác thực JWT, upload file.
* `src/sockets`: Xử lý logic Socket.io.
