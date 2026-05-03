# 🏆 Hệ thống Giám sát An ninh & Quản lý Cửa hàng Trang sức Thông minh

> **Đồ án Thực tập Tốt nghiệp (Graduation Project) - Học viện Hàng không Việt Nam (VAA)**  
> _Chủ đề: Tích hợp Edge AI, IoT và Điện toán Đám mây (Hybrid Cloud Model)_
>
> **Giảng viên hướng dẫn:** ThS. Huỳnh Thanh Sơn  
> **Nhóm sinh viên:**
>
> - Lê Dương Bảo (2331540071)
> - Đặng Cao Minh Anh (2331540275)
> - Nguyễn Lê Hưng (2331540323)

---

## 📖 Giới thiệu (Overview)

Dự án phát triển một **hệ thống quản lý bán lẻ O2O (Online-to-Offline)** toàn diện, tích hợp các công nghệ tiên tiến nhất hiện nay để giải quyết bài toán an ninh và tự động hóa cho các Cửa hàng Trang sức Bạc.

**Điểm đột phá (Key Innovations):**

- **Hybrid Cloud-Edge AI Architecture:** Kết hợp xử lý AI tại biên (Edge) với quản lý tập trung trên Cloud (AWS EC2 + MongoDB Atlas)
- **Active Defense (Phòng vệ chủ động):** Tự động phát hiện xâm nhập và kích hoạt cảnh báo vật lý (còi, đèn, khóa cửa) ngay lập tức
- **Face Recognition với InsightFace:** Nhận diện nhân viên VIP để tự động mở khóa, phát hiện người lạ xâm nhập vùng cấm
- **Real-time Video Recording:** Ghi lại video bằng chứng và upload lên Cloudinary tự động khi có cảnh báo
- **E-commerce Platform:** Sàn thương mại điện tử hoàn chỉnh với thanh toán Stripe, SePay (VietQR), COD
- **AI Chatbot:** Tích hợp Gemini 1.5 Flash + Ollama local để tư vấn khách hàng và hỗ trợ admin

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Real-time:** Socket.IO 4.8
- **Database:** MongoDB Atlas (Mongoose 8.x)
- **Authentication:** JWT + Passport (Google/Facebook OAuth)
- **Payment:** Stripe, SePay (VietQR động), COD
- **Security:** Helmet, CORS, Rate Limiting, XSS Protection, HPP, Mongo Sanitize
- **Email:** SendGrid (OTP verification)
- **AI Chatbot:** Google Gemini 1.5 Flash + Ollama (Gemma 3:4b local)
- **Deploy:** AWS EC2

### **Frontend**
- **Framework:** React 18.3 + Vite 5.x
- **Styling:** TailwindCSS 3.4
- **State Management:** Zustand 4.5
- **Data Fetching:** React Query (TanStack Query 5.x)
- **Forms:** React Hook Form 7.x
- **UI Components:** Framer Motion, React Icons, Swiper
- **Charts:** Recharts 3.8
- **Deploy:** Vercel

### **AI/Edge AI Service**
- **Language:** Python 3.9+
- **Face Detection:** YOLO11n (Ultralytics 8.0+)
- **Face Tracking:** ByteTrack
- **Face Recognition:** InsightFace 0.7+ (ArcFace, buffalo_l model)
- **Hand Detection:** MediaPipe 0.10+
- **Deep Learning:** PyTorch 2.0+, ONNX Runtime 1.16+
- **Computer Vision:** OpenCV 4.8+
- **API Server:** Flask 3.0
- **Database:** MongoDB (PyMongo 4.3+)
- **Media Upload:** Cloudinary SDK

### **IoT Firmware**
- **Microcontroller:** ESP32 (Arduino IDE)
- **Language:** C/C++
- **RTOS:** FreeRTOS (multi-task)
- **IoT Platform:** Blynk
- **Sensors:** PIR, DHT11, Reed Switch
- **Actuators:** Servo Motor, Buzzer, LED x4, Relay
- **Display:** LCD I2C 16x2
- **Communication:** WiFi, HTTPS (WiFiClientSecure)

### **Cloud Infrastructure**
- **Compute:** AWS EC2 (Backend API)
- **Hosting:** Vercel (Frontend SPA)
- **Database:** MongoDB Atlas (M0 Free Tier)
- **CDN/Storage:** Cloudinary (Video/Image)
- **Domain:** Zapto.org (Dynamic DNS)

---

## 🚀 Cài đặt & Triển khai (Installation)

### Yêu cầu tiên quyết (Prerequisites)

- **Node.js** >= 18.0.0
- **Python** >= 3.9
- **Arduino IDE** (cho ESP32)
- **MongoDB Atlas** account
- **Cloudinary** account
- **Blynk** account (cho IoT)

### Bước 1: Clone Repository

```bash
git clone https://github.com/Bao2k5/DoAn_TTTN.git
cd DoAn_TTTN
```

### Bước 2: Setup Backend (Node.js)

```bash
cd Web-App/BE
npm install
cp .env.example .env
# Chỉnh sửa .env với MongoDB URI, JWT Secret, Cloudinary credentials...
npm run dev  # Development mode
npm start    # Production mode
```

Backend sẽ chạy tại: `http://localhost:3000`

### Bước 3: Setup Frontend (React)

```bash
cd Web-App/FE
npm install
cp .env.example .env
# Chỉnh sửa VITE_API_URL trỏ đến backend
npm run dev  # Development mode (port 3001)
npm run build  # Production build
```

Frontend sẽ chạy tại: `http://localhost:3001`

### Bước 4: Setup AI Service (Python)

```bash
cd AI-Service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Tải YOLO11 model
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolo11n.pt

# Chạy AI Service
python AI_Face.py
```

AI Service sẽ:
- Mở GUI Tkinter để quản lý
- Khởi động Flask API tại `http://0.0.0.0:5001`

### Bước 5: Nạp Firmware cho ESP32

1. Mở Arduino IDE
2. Cài đặt ESP32 board support: `https://dl.espressif.com/dl/package_esp32_index.json`
3. Cài đặt thư viện: Blynk, DHT sensor library, LiquidCrystal I2C
4. Mở `IoT-Firmware/Smart_Jewelry_IoT/Smart_Jewelry_IoT.ino`
5. Cập nhật WiFi credentials và Blynk auth token
6. Chọn board: **ESP32 Dev Module**
7. Upload firmware

---

## 📊 Tính năng Chính (Key Features)

### **1. E-commerce Platform**
- ✅ Đăng ký/Đăng nhập (Email + OAuth Google/Facebook)
- ✅ Quản lý sản phẩm (CRUD với upload ảnh Cloudinary)
- ✅ Giỏ hàng + Wishlist
- ✅ Thanh toán đa kênh (Stripe, SePay VietQR, COD)
- ✅ Quản lý đơn hàng (Order tracking)
- ✅ Hệ thống coupon/discount
- ✅ Review & Rating sản phẩm
- ✅ Admin Dashboard (9 trang quản trị)

### **2. Smart Security System**
- ✅ Face Detection + Tracking (YOLO11 + ByteTrack)
- ✅ Face Recognition (InsightFace ArcFace)
- ✅ Hand Intrusion Detection (MediaPipe)
- ✅ Real-time Video Recording (pre-roll + post-roll buffer)
- ✅ Auto Upload to Cloudinary khi có cảnh báo
- ✅ Socket.IO real-time alerts đến Admin Dashboard
- ✅ Face-based Door Unlock (nhận diện nhân viên VIP)
- ✅ ESP32 IoT Controller (Buzzer, LED, Servo Lock)

### **3. AI Chatbot**
- ✅ Dual AI Model (Gemini 1.5 Flash + Ollama Gemma 3:4b)
- ✅ Context-aware (biết thông tin sản phẩm, đơn hàng, cảm biến)
- ✅ Multi-turn conversation history
- ✅ Admin mode (truy vấn logs, nhiệt độ, trạng thái hệ thống)
- ✅ Customer mode (tư vấn sản phẩm trang sức bạc)

### **4. IoT Monitoring**
- ✅ Temperature & Humidity logging (DHT11)
- ✅ Motion detection (PIR sensor)
- ✅ Door status (Reed switch)
- ✅ Remote door unlock (Servo motor)
- ✅ Alarm system (Buzzer + LED)
- ✅ LCD display (status messages)
- ✅ Blynk mobile app integration

---

## 🎯 Demo & Live URLs

- **Frontend (Vercel):** [https://hmjewelry.vercel.app](https://hmjewelry.vercel.app)
- **Backend (AWS EC2):** `https://hm-vault.zapto.org/api`
- **AI Service:** Local only (Flask port 5001)

> **Lưu ý:** Để truy cập demo, vui lòng liên hệ với đội ngũ phát triển.

---

## 👥 Đội ngũ Phát triển (Development Team)

1.  **Lê Dương Bảo (Team Leader)**
    - Vai trò: **Full-stack Developer, System Architect**
    - Trách nhiệm: Backend API, Database Design, System Integration, Deployment
2.  **Đặng Cao Minh Anh**
    - Vai trò: **AI Engineer, Cloud Engineer**
    - Trách nhiệm: Edge AI (YOLO11, InsightFace, MediaPipe), Cloudinary Integration, Socket.IO
3.  **Nguyễn Lê Hưng**
    - Vai trò: **IoT Engineer, Hardware Engineer**
    - Trách nhiệm: ESP32 Firmware, Circuit Design, Sensor Integration, Blynk Platform

---

## 🔒 Bảo mật (Security)

### ⚠️ QUAN TRỌNG - Trước khi Deploy

Dự án này sử dụng file `.env` để lưu trữ thông tin nhạy cảm. **KHÔNG BAO GIỜ** commit file `.env` lên Git/GitHub.

**Các file cần bảo vệ:**
- `Web-App/BE/.env` - Backend credentials
- `AI-Service/.env` - AI Service credentials
- `.env` (root) - Shared credentials

**Checklist bảo mật:**
- ✅ File `.gitignore` đã có `**/.env`
- ✅ Chỉ commit file `.env.example` (không chứa thông tin thật)
- ✅ Thay đổi tất cả passwords/secrets khi deploy production
- ✅ Sử dụng biến môi trường thay vì hardcode trong code

### Cấu hình `.env`

Mỗi service cần file `.env` riêng:

```bash
# Backend
cp Web-App/BE/.env.example Web-App/BE/.env

# AI Service
cp AI-Service/.env.example AI-Service/.env
```

Sau đó chỉnh sửa các giá trị trong file `.env` với thông tin thực tế.

### Thông tin nhạy cảm cần bảo vệ

| Loại | Ví dụ | Rủi ro nếu lộ |
|------|-------|---------------|
| Database URI | `mongodb+srv://...` | Truy cập toàn bộ database |
| JWT Secret | `supersecret_key` | Giả mạo token, chiếm tài khoản |
| API Keys | Cloudinary, Gemini | Sử dụng dịch vụ trái phép |
| OAuth Secrets | Google, Facebook | Chiếm quyền đăng nhập |
| Device Keys | `IoT_Secure_Vault_2024` | Điều khiển IoT trái phép |

---

## 📄 License

© 2025 Smart Jewelry Store Project - All Rights Reserved.

**Học viện Hàng không Việt Nam (Vietnam Aviation Academy)**
