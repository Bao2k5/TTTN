# 💎 HMJewelry - Hệ Thống Thương Mại Điện Tử Trang Sức

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Đồ án môn học: Thương Mại Điện Tử
**Học viện Hàng không Việt Nam**
**Khoa Công Nghệ Thông Tin - Nhóm 8**

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-hmjewelry.vercel.app-success?style=for-the-badge&logo=vercel&logoColor=white)](https://hmjewelry.vercel.app/)

</div>

---

## � Giới Thiệu

**HMJewelry** là nền tảng thương mại điện tử chuyên kinh doanh trang sức cao cấp (Bạc, Đá quý, Ngọc trai...). Dự án được xây dựng với mục tiêu cung cấp trải nghiệm mua sắm trực tuyến mượt mà, bảo mật và hiện đại.

Hệ thống áp dụng kiến trúc **MERN Stack** (MongoDB, Express, React, Node.js) kết hợp với các công nghệ tiên tiến như **OAuth 2.0**, **Payment Gateway (Stripe/VNPay)** và **Cloud Storage**.

---

## 👥 Thành Viên Nhóm 8

| STT | Họ và Tên           |  MSSV  | Vai Trò                   | Nhiệm vụ chính                                                                 |
| :-: | ------------------- | :----: | ------------------------- | ------------------------------------------------------------------------------ |
|  1  | **Lê Dương Bảo**    | 123456 | 👑 **Team Leader**        | Backend Architecture, Database Design, Payment Integration, DevOps.            |
|  2  | **Nguyễn Lê Hưng**  | 234567 | 💻 **Frontend Developer** | UI/UX Implementation, React Logic, State Management (Zustand).                 |
|  3  | **Phạm Thanh Tùng** | 345678 | 🎨 **UI/UX Designer**     | Design System, Mockups, Asset Management, Responsive Design.                   |
|  4  | **Trần Gia Nghĩa**  | 456789 | 📊 **QA & Tester**        | Manual Testing, Bug Tracking, Documentation, User Guide.                       |

---

## �️ Công Nghệ Sử Dụng (Tech Stack)

### 1. Frontend (Client-side)
*   **Core**: React 18, Vite (Build tool).
*   **Styling**: Tailwind CSS (Utility-first), Framer Motion (Animations).
*   **State Management**: Zustand (Global State), React Query (Server State).
*   **Routing**: React Router DOM v6.
*   **UI Components**: Swiper (Slider), React Icons, React Hot Toast (Notifications).
*   **Payment UI**: Stripe React JS.

### 2. Backend (Server-side)
*   **Runtime**: Node.js.
*   **Framework**: Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Authentication**: Passport.js (Google/Facebook OAuth), JWT (JSON Web Token).
*   **Security**: Helmet (Headers), Express Rate Limit (DDOS protection), Mongo Sanitize (Injection protection), HPP, XSS Clean.
*   **Services**:
    *   **Cloudinary**: Lưu trữ và tối ưu hóa hình ảnh/video.
    *   **Nodemailer**: Gửi email xác thực và thông báo đơn hàng.
    *   **Stripe & VNPay**: Tích hợp cổng thanh toán.

---

## ✨ Tính Năng Nổi Bật

### 👤 Khách hàng (User)
*   **Xác thực đa kênh**: Đăng ký/Đăng nhập qua Email (xác thực OTP) hoặc Google/Facebook.
*   **Trải nghiệm mua sắm**: Tìm kiếm thông minh, Lọc sản phẩm đa tiêu chí, Xem chi tiết (Zoom ảnh), Sản phẩm liên quan.
*   **Giỏ hàng & Thanh toán**:
    *   Giỏ hàng đồng bộ Real-time.
    *   Thanh toán đa phương thức: **COD**, **VNPay** (ATM/QR), **Stripe** (Visa/Master).
*   **Cá nhân hóa**: Quản lý hồ sơ, Sổ địa chỉ, Lịch sử đơn hàng, Yêu thích (Wishlist).
*   **Tương tác**: Đánh giá & Bình luận sản phẩm.

### 🛡️ Quản trị viên (Admin)
*   **Dashboard**: Biểu đồ thống kê doanh thu, đơn hàng, khách hàng mới.
*   **Quản lý Sản phẩm**: CRUD sản phẩm, Upload ảnh Cloudinary, Quản lý tồn kho.
*   **Quản lý Đơn hàng**: Quy trình xử lý đơn hàng (Chờ duyệt -> Đang giao -> Hoàn tất/Hủy).
*   **Hệ thống**: Quản lý Banner/Slider trang chủ, Quản lý Người dùng.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy (Local Development)

### Yêu cầu tiên quyết
*   **Node.js**: v18.0.0 trở lên.
*   **MongoDB**: Đã cài đặt MongoDB Compass hoặc có MongoDB Atlas URI.
*   **Git**: Để clone source code.

### Bước 1: Clone dự án
```bash
git clone https://github.com/Bao2k5/Thuongmaidientu.git
cd Thuongmaidientu
```

### ⚡ Cách Chạy Nhanh (Khuyên dùng)
Nhóm em đã cấu hình sẵn script để cài đặt và chạy cả Backend lẫn Frontend chỉ với 1 lệnh:

1.  **Cài đặt toàn bộ:**
    ```bash
    npm run install:all
    ```
2.  **Cấu hình môi trường:**
    *   Tạo file `.env` ở thư mục gốc (như hướng dẫn bên dưới).
    *   Tạo file `FE/.env` (như hướng dẫn bên dưới).
3.  **Chạy dự án:**
    ```bash
    npm run dev:all
    ```
    *Lệnh này sẽ mở cả Backend (Port 3000) và Frontend (Port 5173) cùng lúc.*,

---

### 🐢 Cách Chạy Thủ Công (Chi tiết từng phần)

Nếu thầy/bạn muốn chạy riêng lẻ để debug thì làm theo các bước sau:

### Bước 2: Cài đặt & Cấu hình Backend
1.  Di chuyển vào thư mục gốc (nơi chứa `BE`):
    ```bash
    npm install
    ```
2.  Tạo file `.env` tại thư mục gốc và cấu hình các biến môi trường sau:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/jewelry-db
    JWT_SECRET=your_super_secret_key_here
    NODE_ENV=development
    
    # Cấu hình Email (Gmail App Password)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-app-password

    # Cấu hình Cloudinary (Lưu ảnh)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Cấu hình OAuth (Google/Facebook)
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    FACEBOOK_APP_ID=...
    FACEBOOK_APP_SECRET=...

    # Cấu hình Thanh toán
    STRIPE_SECRET_KEY=...
    VNPAY_TMN_CODE=...
    VNPAY_HASH_SECRET=...
    
    # URL Frontend (để CORS và Redirect)
    CLIENT_URL=http://localhost:5173
    ```
3.  Khởi chạy Server:
    ```bash
    npm run dev
    ```
    *Server sẽ chạy tại: `http://localhost:3000`*

### Bước 3: Cài đặt & Cấu hình Frontend
1.  Mở terminal mới, di chuyển vào thư mục `FE`:
    ```bash
    cd FE
    npm install
    ```
2.  Tạo file `.env` trong thư mục `FE`:
    ```env
    VITE_API_URL=http://localhost:3000
    ```
3.  Khởi chạy Frontend:
    ```bash
    npm run dev
    ```
    *Website sẽ chạy tại: `http://localhost:5173`*

### Bước 4: Tạo dữ liệu mẫu (Seeding)
Để có dữ liệu test ngay lập tức (Sản phẩm, Review...), chạy lệnh sau tại thư mục gốc:
```bash
node BE/scripts/seedReviews.js
```

---

## 🌐 Hướng Dẫn Deploy (Production)

### 1. Deploy Frontend (Vercel)
Dự án đã được cấu hình sẵn cho Vercel (`vercel.json`).
1.  Push code lên GitHub.
2.  Vào [Vercel Dashboard](https://vercel.com) -> **Add New Project**.
3.  Import repository GitHub.
4.  Cấu hình:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `FE` (Quan trọng!)
    *   **Environment Variables**: Thêm `VITE_API_URL` (là URL của Backend sau khi deploy).
5.  Bấm **Deploy**.

### 2. Deploy Backend (Render / Railway)
1.  Tạo dịch vụ Web Service mới trên Render/Railway.
2.  Kết nối với GitHub Repo.
3.  Cấu hình:
    *   **Root Directory**: `.` (Thư mục gốc)
    *   **Build Command**: `npm install`
    *   **Start Command**: `node BE/server.js`
    *   **Environment Variables**: Copy toàn bộ nội dung file `.env` (Backend) vào đây.
4.  Bấm **Deploy**.

---

## 👤 Tài Khoản Demo

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **User** | `user@hmjewelry.com` | `user123` |

---

<div align="center">

**© 2024 HMJewelry - Học viện Hàng không Việt Nam**
*Đồ án được thực hiện bởi Nhóm 8 với tất cả tâm huyết ❤️*

</div>
