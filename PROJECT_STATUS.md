# 🧠 AGENT_CONTEXT / PROJECT_STATUS (HỒ SƠ DỰ ÁN)

> **LƯU Ý QUAN TRỌNG CHO AI AGENT**: Đây là file "Sự thật duy nhất" (Single Source of Truth) về ngữ cảnh dự án. Hãy ĐỌC file này ĐẦU TIÊN khi bắt đầu phiên làm việc mới để hiểu ngay tình trạng dự án mà không cần hỏi lại user.

## 1. Thông Tin Đăng Ký Chính Thức (Official Registration)

_Theo Phiếu Đăng Ký Đề Tài Thực Tập Tốt Nghiệp - HK2 2025-2026 - HVHKVN_

- **Tên đề tài**: XÂY DỰNG HỆ THỐNG GIÁM SÁT AN NINH VÀ QUẢN LÝ CỬA HÀNG TRANG SỨC THÔNG MINH TÍCH HỢP EDGE AI, IOT VÀ ĐIỆN TOÁN ĐÁM MÂY.
- **Giảng viên hướng dẫn**: ThS. Huỳnh Thanh Sơn.
- **Nhóm sinh viên thực hiện**:
  1. **Lê Dương Bảo** (MSSV: 2331540071)
  2. **Đặng Cao Minh Anh** (MSSV: 2331540275)
  3. **Nguyễn Lê Hưng** (MSSV: 2331540323)

### Mục tiêu đạt được (5 Goals)

1. **Nghiên cứu và triển khai mô hình Hybrid Cloud - Edge AI**: Xây dựng hệ thống phân tán với AI xử lý tại biên (Laptop/Gateway) để đảm bảo cảnh báo thời gian thực và Web Server trên Cloud (Render/MongoDB) để quản lý tập trung.
2. **Phát triển Module AI nhận diện thông minh**: Ứng dụng thuật toán Deep Learning (YOLOv8 & MediaPipe) và phát hiện hành vi xâm nhập vùng cấm với độ trễ thấp.
3. **Xây dựng Dashboard quản lý trung tâm**: Thiết kế Website (NodeJS) hiển thị trực quan thông tin khách hàng, lịch sử cảnh báo an ninh và biểu đồ thống kê, hỗ trợ truy cập đa nền tảng (Mobile/PC).
4. **Tích hợp hệ thống điều khiển IoT (ESP32)**: Lập trình vi điều khiển ESP32 kết nối WiFi, tự động nhận tín hiệu từ AI Server để kích hoạt các thiết bị cảnh báo vật lý (còi, đèn) ngay lập tức.
5. **Đánh giá hiệu năng và bảo mật hệ thống**: Thông qua kịch bản kiểm thử thực tế để đánh giá độ trễ, độ chính xác của AI và đảm bảo an toàn dữ liệu người dùng trên môi trường mạng.

## 2. Tầm Nhìn & Phạm Vi (Scope)

- **Cốt lõi**: Một sàn E-commerce hoàn chỉnh cho trang sức (Bạc, Đá quý).
- **Nâng cao (Điểm nhấn)**: Chuyển đổi từ Web truyền thống sang mô hình **Hybrid Cloud-Edge AI & IoT**.
  - **IoT**: Thiết bị giám sát tại cửa hàng thực tế (Camera, Cảm biến) dùng ESP32/Camera.
  - **AI**: Nhận diện khuôn mặt khách hàng VIP, gợi ý sản phẩm thông minh.
  - **Cloud**: Render Backend xử lý logic, Cloudinary lưu trữ Video/Image, Web Socket Real-time.

### Phân tích Hệ thống (System Analysis Context)

_Cập nhật theo yêu cầu User (Chi tiết 2 Phân hệ & Tác nhân)_

#### 1. Phân hệ Thương mại Điện tử (E-commerce System)

_Mục đích: Phục vụ kinh doanh O2O (Online-to-Offline)._

- **Tác nhân tham gia**: Khách hàng (Customer), Nhân viên (Staff), Quản trị viên (Admin).
- **Các nhóm chức năng chính (Use Cases)**:
  - **Quản lý tài khoản & xác thực**: Đăng ký, Đăng nhập, Quên mật khẩu.
  - **Mua sắm trực tuyến**: Xem sản phẩm, Giỏ hàng, Thanh toán, Tích điểm.
  - **Quản lý đơn hàng O2O**: User đặt online -> Staff nhận và xử lý tại cửa hàng.
  - **Quản trị Dashboard**: Admin quản lý sản phẩm, xem báo cáo doanh thu.

#### 2. Phân hệ An ninh & Giám sát Thông minh (Smart Security System)

_Mục đích: Điểm nhấn công nghệ (Edge AI + IoT) - Active Defense._

- **Tác nhân tham gia**: Admin, Hệ thống (System AI/IoT), Staff.
- **Các nhóm chức năng chính (Use Cases)**:
  - **Giám sát thời gian thực**: Camera stream hình ảnh về App/Web.
  - **Phát hiện xâm nhập (AI)**: Nhận diện người lạ/hành vi khả nghi (System tự động).
  - **Cảnh báo & Phản ứng tự động**: Kích hoạt còi/đèn, gửi thông báo cho Admin/Staff.
  - **Nhận diện khách VIP**: Camera nhận diện khuôn mặt -> Báo Staff chuẩn bị đón tiếp.

## 3. Tech Stack (Công Nghệ)

### Web Application (Đã triển khai ✅)

- **Frontend**: ReactJS (Vite), TailwindCSS, Zustand, React Query, Socket.IO Client.
  - _Deploy_: Vercel.
- **Backend**: Node.js, Express.js, Socket.IO.
  - _Database_: MongoDB Atlas.
  - _Deploy_: Render.
- **Auth**: JWT, Passport (Google/Facebook).
- **Payment**: Stripe, SePay (BIDV VietQR động), COD.
- **AI Chatbot**: Mô hình Kép (Google Gemini 1.5 Flash + Local Ollama Llama/Mistral).

### AI/Edge AI Service (Đã triển khai ✅)

- **Ngôn ngữ**: Python 3.
- **Face Detection & Tracking**: YOLO11n (Ultralytics) + ByteTrack.
- **Face Recognition**: InsightFace (ArcFace, pretrained buffalo_l).
- **Hand Intrusion**: MediaPipe Hands (phát hiện tay xâm nhập vùng cấm).
- **GUI**: Tkinter (chạy local trên laptop/gateway).
- **Giao tiếp**: Gửi cảnh báo real-time qua REST API → Backend → Socket.IO → Admin Dashboard.

### IoT Firmware (Đã triển khai ✅)

- **Vi điều khiển**: ESP32 (Arduino IDE, C/C++).
- **Kết nối**: WiFi + Blynk IoT Platform.
- **Cảm biến & Actuator**: PIR (chuyển động), DHT11 (nhiệt độ/độ ẩm), Servo (khóa cửa), Buzzer, LED x4, Relay, LCD I2C, Reed Switch (cảm biến cửa).
- **Kiến trúc**: FreeRTOS multi-task (alarm task chạy song song).
- **Giao tiếp**: Poll API từ Render Backend (`/api/security/alert-status`, `/api/security/unlock-status`).

## 4. Trạng Thái Hiện Tại (Progress Log)

- [x] **Core E-commerce**: Đăng ký/đăng nhập, Giỏ hàng, Thanh toán (Stripe/VNPay/SePay), Admin Dashboard (9 trang).
- [x] **Deployment**: Frontend (Vercel) + Backend (Render) đã chạy online.
- [x] **AI Integration**: Chatbot Gemini AI (Function Calling/Tools) + Edge AI Face Recognition (YOLO11 + ByteTrack + InsightFace + MediaPipe).
- [x] **IoT Integration**: ESP32 firmware hoàn chỉnh với Blynk, PIR, DHT11, Servo, Buzzer, LCD, Relay, Reed Switch.
- [x] **Security System**: Real-time alert (Socket.IO), auto-alarm, face-based unlock, admin dashboard giám sát.
- [x] **Tài liệu**: `PROJECT_STATUS.md` đã cập nhật.

## 5. Các Tài Nguyên Quan Trọng

- **Local URL**: `http://localhost:5173` (FE), `http://localhost:3000` (BE).
- **Live Demo**: [hmjewelry.vercel.app](https://hmjewelry.vercel.app/) (Frontend).
- **Tài khoản test**:
  - Admin: `admin@example.com` / `admin123`
  - User: `user@hmjewelry.com` / `user123`

## 6. Lịch Sử Yêu Cầu Gần Nhất (Context Ngắn Hạn)

- Đã hoàn thiện AI Face Recognition V4 (InsightFace + YOLO11 Tracking, multi-pose registration).
- Đã hoàn thiện IoT firmware ESP32 (340 dòng, tích hợp Blynk).
- Đã tích hợp Chatbot AI (Gemini 1.5 Flash) với multi-turn history.
- Đang fix các vấn đề chưa hoàn chỉnh: chat history, unlock state persistence.
- User sử dụng tiếng Việt.
