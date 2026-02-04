# 🚀 Kế hoạch Phát triển & Hướng dẫn Vận hành Hệ thống

> **Phiên bản**: v1.0 - Final Integration  
> **Ngày cập nhật**: 04/02/2026

## 1. Tổng quan Kiến trúc

Hệ thống hoạt động theo mô hình **Hybrid Cloud-Edge AI**:

1.  **Edge AI (Python)**: Chạy trên Laptop, xử lý Camera & AI (YOLO + FaceNet + MediaPipe).
2.  **Cloud Backend (NodeJS)**: Nhận tín hiệu từ Edge, lưu DB và phát Socket Real-time.
3.  **IoT Node (ESP32)**: Hỏi Server liên tục (Polling), nếu có báo động -> Hú còi.
4.  **Frontend (ReactJS)**: Dashboard quản lý, nhận Socket để hiện cảnh báo đỏ ngay lập tức.

---

## 2. Các Thay đổi Đã Thực hiện (Changelog)

### ✅ Backend (NodeJS)

- **Cài đặt Socket.IO**: Giúp Dashboard nhận cảnh báo ngay lập tức (Real-time).
- **Nâng cấp Database**: Thêm trường `status` ('active' / 'resolved') vào bảng `SecurityLog`.
- **Refactor API**: Tách logic sang `security.controller.js`.
- **Cơ chế Tắt còi (Soft Resolve)**: API `/reset-alarm` giờ sẽ chuyển trạng thái log sang `resolved` thay vì xóa mất.

### ✅ AI Service (Python)

- **Bug Fix**: Sửa lỗi logic `HAS_MEDIAPIPE` khiến tính năng bắt tay bị tắt.
- **Endpoint**: Đã cấu hình trỏ về `http://localhost:3000/api/security/log`.

### ✅ IoT Firmware (ESP32)

- **Cập nhật IP**: Đã đổi IP Server từ localhost sang IP LAN `10.50.1.182` để ESP32 kết nối được.
- **Logic**: Chỉ hú còi khi Server trả về `alert: true` và loại là `DANGER/WARNING`.

### ✅ Frontend (ReactJS)

- **Real-time Monitor**: Trang `/admin/security` giờ TỰ ĐỘNG hiện màn hình đỏ và phát tiếng kêu khi có trộm.
- **Tắt còi từ xa**: Nút bấm trên Web có thể tắt còi ESP32 ngay lập tức.

---

## 3. Hướng dẫn Chạy Hệ thống (Demo Script)

Hãy mở 3 Terminal riêng biệt để chạy từng thành phần:

### 🟢 Bước 1: Khởi động Backend (Trung tâm)

```powershell
cd "Web-App/BE"
npm start
# Server sẽ chạy tại: http://localhost:3000
```

_Lưu ý: Nếu cài mới, chạy `npm install` trước._

### 🔵 Bước 2: Khởi động Frontend (Dashboard)

```powershell
cd "Web-App/FE"
npm run dev
# Web chạy tại: http://localhost:5173
```

👉 Truy cập `http://localhost:5173/admin/security` để xem màn hình giám sát.

### 🟠 Bước 3: Khởi động AI (Camera)

```powershell
cd "AI-Service"
# Cài thư viện nếu chưa có: pip install -r requirements.txt
python Hybrid_EdgeAI_FaceRecognition.py
```

_Lúc này Camera sẽ bật lên._

### 🔴 Bước 4: Khởi động IoT (ESP32)

- Nạp code `IoT-Firmware/Smart_Jewelry_IoT/Smart_Jewelry_IoT.ino` vào mạch.
- Cấp nguồn cho ESP32.

---

## 4. Kịch bản Demo Hội đồng

1.  **Trạng thái bình thường**:
    - Camera thấy Nhân viên (đã đăng ký) -> Khung xanh -> Web báo "System Safe".
    - ESP32 im lặng.

2.  **Tình huống Xâm nhập (Trộm)**:
    - Nhờ bạn (người lạ) đưa tay vào vùng ảo trên Camera.
    - **AI**: Khung đỏ, hiện chữ "INTRUDER".
    - **Web**: Màn hình chớp đỏ, hiện "CẢNH BÁO XÂM NHẬP", phát tiếng kêu `alarm.mp3`.
    - **ESP32**: Đèn nháy, Còi hú inh ỏi.

3.  **Xử lý (Tắt còi)**:
    - **Cách 1 (Thủ công)**: Admin bấm nút "TẮT CÒI NGAY" trên Web -> Còi tắt, màn hình Web trở lại bình thường.
    - **Cách 2 (Tự động)**: Nhân viên (đã đăng ký) bước vào khung hình -> AI nhận diện -> Tự động gửi lệnh tắt còi.

---

## 5. Troubleshooting (Sửa lỗi nhanh)

- **ESP32 không kết nối được?**
  - Kiểm tra lại IP máy tính (`ipconfig`) xem có thay đổi không. Nếu đổi, cập nhật lại vào file `.ino`.
  - Đảm bảo ESP32 và Laptop chung mạng WiFi.

- **Web không nhận cảnh báo?**
  - F12 trên trình duyệt xem Console có dòng `✅ Connected to Security Socket` chưa.
  - Kiểm tra `SOCKET_URL` trong `AdminSecurity.jsx`.

- **AI báo lỗi MediaPipe?**
  - Chạy `pip install mediapipe` lại.
  - Đảm bảo Python phiên bản < 3.11 (tốt nhất là 3.9 hoặc 3.10) vì 3.11+ hay kén thư viện này.
