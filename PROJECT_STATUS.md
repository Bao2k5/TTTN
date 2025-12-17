# 🧠 AGENT_CONTEXT / PROJECT_STATUS (HỒ SƠ DỰ ÁN)

> **LƯU Ý QUAN TRỌNG CHO AI AGENT**: Đây là file "Sự thật duy nhất" (Single Source of Truth) về ngữ cảnh dự án. Hãy ĐỌC file này ĐẦU TIÊN khi bắt đầu phiên làm việc mới để hiểu ngay tình trạng dự án mà không cần hỏi lại user.

## 1. Định Danh Dự Án
- **Tên dự án**: HMJewelry (Hệ thống Thương mại Điện tử Trang sức Thông minh)
- **Mục tiêu**: Đồ án Thực tập Tốt nghiệp / Capstone Project.
- **Tác giả**: Nhóm 3 người - Lê Dương Bảo, Nguyễn Lê Hưng, Đặng Cao Minh Anh.
- **Trạng thái**: Đang phát triển tích cực (Active Development).

## 2. Tầm Nhìn & Phạm Vi (Scope)
- **Cốt lõi**: Một sàn E-commerce hoàn chỉnh cho trang sức (Bạc, Đá quý).
- **Nâng cao (Điểm nhấn)**: Chuyển đổi từ Web truyền thống sang mô hình **Hybrid Cloud-Edge AI & IoT**.
  - **IoT**: Thiết bị giám sát tại cửa hàng thực tế (Camera, Cảm biến) dùng ESP32/Camera.
  - **AI**: Nhận diện khuôn mặt khách hàng VIP, gợi ý sản phẩm thông minh.
  - **Cloud**: AWS IoT Core (Dự kiến), lưu trữ dữ liệu lớn, xử lý serverless.

## 3. Tech Stack (Công Nghệ)
### Hiện tại (Đã triển khai)
- **Frontend**: ReactJS (Vite), TailwindCSS, Zustand, React Query.
  - *Deploy*: Vercel.
- **Backend**: Node.js, Express.js.
  - *Database*: MongoDB Atlas.
  - *Deploy*: Render.
- **Auth**: JWT, Passport (Google/Facebook).
- **Payment**: Stripe, VNPay, COD.

### Tương lai (Đang/Sẽ làm)
- **AI/ML**: Python (FastAPI/Flask) cho mô hình nhận diện.
- **IoT**: C/C++ (Arduino IDE) cho ESP32.
- **Infrastructure**: AWS (Lambda, IoT Core, S3, SNS).

## 4. Trạng Thái Hiện Tại (Progress Log)
- [x] **Core E-commerce**: Đăng ký/đăng nhập, Giỏ hàng, Thanh toán, Admin Dashboard.
- [x] **Deployment**: Frontend và Backend đã chạy online.
- [ ] **AI Integration**: Chưa bắt đầu (Cần lên plan).
- [ ] **IoT Integration**: Chưa bắt đầu.
- [ ] **Tài liệu**: Đang cập nhật `PROJECT_STATUS.md` làm bộ nhớ cho Agent.

## 5. Các Tài Nguyên Quan Trọng
- **Local URL**: `http://localhost:5173` (FE), `http://localhost:3000` (BE).
- **Live Demo**: [hmjewelry.vercel.app](https://hmjewelry.vercel.app/) (Frontend).
- **Tài khoản test**:
  - Admin: `admin@example.com` / `admin123`
  - User: `user@hmjewelry.com` / `user123`

## 6. Lịch Sử Yêu Cầu Gần Nhất (Context Ngắn Hạn)
- User muốn tạo file này để lưu trữ ngữ cảnh.
- User đang quan tâm đến việc tích hợp "Hybrid Cloud-Edge AI" vào đồ án.
- User sử dụng tiếng Việt.
