# Nhật ký thay đổi (Changelog)

Tài liệu này lưu lại các thay đổi quan trọng trong quá trình phát triển dự án Smart Jewelry Vault.

## [2026-04-01] - Cấu hình hệ thống và Sửa lỗi kết nối IoT

### Cấu trúc triển khai (Deployment Architecture)
- **Cơ sở dữ liệu (Database):** Sử dụng **MongoDB Atlas** (Cloud Database) để lưu trữ Log an ninh, thông tin khách hàng và trạng thái hệ thống.
- **Backend (BE):** Chạy trên **AWS EC2** (Ubuntu) sử dụng **Node.js** và **PM2** để duy trì dịch vụ.
- **Frontend (FE):** Triển khai trên nền tảng **Vercel**, kết nối tới Backend qua API Endpoint trên AWS.
- **Tên miền (Domain):** Sử dụng `hm-vault.zapto.org` trỏ về IP công cộng của AWS EC2 để phục vụ API cho Frontend và IoT.

### Công nghệ sử dụng (Tech Stack)
#### 1. Web & Application
- **Frontend:** ReactJS (Vite), TailwindCSS, Zustand (State Management), React Query, Socket.IO Client.
- **Backend:** Node.js, Express.js, Socket.IO (Real-time), JWT, Passport.js (OAuth Google/Facebook).
- **Payment:** Stripe (Quốc tế), SePay (VietQR động - BIDV).
- **AI Chatbot:** Google Gemini 1.5 Flash API tích hợp trực tiếp trên Dashboard.

#### 2. AI & Edge Computing
- **Ngôn ngữ:** Python 3.
- **Object Detection:** YOLO11 (Ultralytics) - Phát hiện người và vật thể.
- **Face Recognition:** InsightFace (Model buffalo_l) - Nhận diện khuôn mặt độ chính xác cao.
- **Hand Tracking:** MediaPipe (Phát hiện tay xâm nhập vùng cấm).
- **Video Storage:** Cloudinary SDK (Tự động ghi hình và upload video bằng chứng).

#### 3. IoT & Hardware
- **Vi điều khiển:** ESP32 (Chip lõi kép), ESP32-CAM.
- **Firmware:** C/C++ (Arduino framework), FreeRTOS (Xử lý đa luồng).
- **Platform:** Blynk IoT (Điều khiển Mobile), WiFiManager (Cấu hình WiFi thông minh).
- **Hardware:** PIR Sensor, DHT11, Servo MG90S, Buzzer, Reed Switch, Vibration Sensor, LCD I2C.

#### 4. Cơ sở dữ liệu & Cloud
- **Database:** MongoDB Atlas (NoSQL Cloud).
- **Image/Video Hosting:** Cloudinary.
- **Infrastructure:** AWS EC2, Vercel, Zapto DDNS.

### Đã thay đổi (Changed) - Phần IoT & Security
- **Backend (BE):**
    - `src/middleware/auth.middleware.js`: Thêm middleware `verifyDeviceKey` để xác thực thiết bị IoT bằng mã khóa tĩnh thay vì JWT.
    - `src/routes/security.routes.js`: Cấu trúc lại các route, tách nhóm IoT (`temp-log`, `alert-status`, `unlock-status`, `reset-alarm`, `face-scan-status`) ra khỏi nhóm Admin để thiết bị có thể truy cập qua Device Key.
- **IoT Firmware (Smart_Jewelry_IoT):**
    - Nâng cấp `HTTPClient` lên `WiFiClientSecure` để hỗ trợ HTTPS (AWS/Zapto).
    - Sử dụng `setInsecure()` để bỏ qua việc kiểm chứng certificate (phù hợp cho domain Zapto/Render).
    - Thống nhất Base URL về `https://hm-vault.zapto.org/api/security`.
    - Thêm Header `x-device-key` để thực hiện xác thực với Backend.
    - Sửa logic gửi PIN trong lệnh `reset-alarm` từ ESP32.
- **ESP32-CAM (Stream):**
    - Cập nhật cơ chế poll `face-scan-status` sang HTTPS và sử dụng Device Key header tương tự firmware chính.
- **AI-Service (Python Edge AI):**
    - Cập nhật các lệnh gọi API (`/log`, `/trigger-unlock`) để đính kèm header `x-device-key`, đảm bảo tương thích với chuẩn bảo mật mới của Backend.

### Bảo mật (Security)
- Sử dụng mã khóa thiết bị: `IoT_Secure_Vault_2024` (Vui lòng thay đổi trong `.env` của BE và Code ESP32 nếu cần tăng tính bảo mật).
- Cô lập các route IoT để tránh ảnh hưởng đến các route Admin nhạy cảm khác.

---
*Ghi chú: Các thay đổi này giúp hệ thống hoạt động ổn định trên hạ tầng AWS và xử lý lỗi handshake SSL thường gặp trên ESP32.*
