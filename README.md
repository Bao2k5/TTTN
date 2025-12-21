# 🦅 Hệ thống Giám sát An ninh & Quản lý Cửa hàng Trang sức Thông minh
> **Đồ án Thực tập Tốt nghiệp (Graduation Project) - Học viện Hàng không Việt Nam (VAA)**
> *Chủ đề: Tích hợp Edge AI, IoT và Điện toán Đám mây (Hybrid Cloud Model)*

---

## 📖 Giới thiệu (Overview)
Dự án phát triển một hệ thống quản lý bán lẻ O2O (Online-to-Offline) toàn diện, tích hợp các công nghệ tiên tiến nhất hiện nay để giải quyết bài toán an ninh và tự động hóa cho các Cửa hàng Trang sức/Tiệm vàng.

**Điểm đột phá (Key Innovations):**
*   **Hybrid Cloud Architecture:** Kết hợp sức mạnh xử lý tức thời tại biên (**Edge AI**) và khả năng lưu trữ vô hạn trên đám mây (**AWS Cloud**).
*   **Active Defense (Phòng vệ chủ động):** Không chỉ giám sát bị động, hệ thống tự động kích hoạt loa/còi/khóa cửa ngay khi AI phát hiện hành vi khả nghi.

---

## 🏗️ Kiến trúc Hệ thống (System Architecture)

![Architecture Diagram](https://mermaid.ink/img/pako:eNqVVE1v2zAM_SuEzsmwDfa066XosA3YdnOw7WGHQZcTm4otd5KcpFmK_verlO0k3aLoJBL58fGRj1QoK41Sofxe82I0-lYw9sR-Wc_F6UmsTqJTiq4U_dZ0G8OtH770_ss_b79v_779_fXr9_evP9-_vS9TylQ4U_5MhfsKdyucl_8l4b3CnQoX5f_w9_3Pjy9vv74tU8yUM6b8hTIzJ2aWTH9l5kKZo8wsmf6QmQczc2QWTH_IrIaZNTIrpj_gR59i1mGmnTH9gR99hpkJMxNmnDH9gR99hpl3Zt6Zecf0B370WWYemHlg5oGZ90x_4EefZuaRmUdmHpl5z_QHfvRZZp6YeWLmiZn3TH_gR59l5pmZZ2aemXnP9Ad-9DlmPjHzKS7_lJmPTH_4Qd-F4tUqFcvVatUqXq9Sdb5eJdVulSrLVat4s0qV5btVqiz_rVJluVml2nK7SrXlTyy3q1RZbqN_t0y15XaZassfWW6XqbbcrtNsuf2A5XadZsvtOs2W2w9YbtZpttxs0my5Pcxyu06z5Wadast_sNyk2XKTZstNmi03aba8SrPVKu23q1RbrtJ-u0q15Srt96tUW67Sfr9KteUq7f-vUrWl)

Hệ thống hoạt động dựa trên mô hình **3-Layer**:
1.  **Edge Layer (Tại cửa hàng):**
    *   **Camera AI:** Chạy model YOLOv8/MediaPipe để nhận diện khuôn mặt và hành vi xâm nhập.
    *   **IoT Controller (ESP32):** Điều khiển thiết bị vật lý (Còi, Đèn, Khóa từ) qua giao thức MQTT.
2.  **Cloud Layer (AWS):**
    *   **AWS IoT Core:** Broker trung gian nhận tín hiệu từ Edge.
    *   **AWS Lambda & Rule Engine:** Xử lý logic nghiệp vụ serverless.
    *   **DynamoDB:** Lưu trữ Log cảm biến tốc độ cao.
3.  **Application Layer:**
    *   **Web Dashboard:** Giao diện quản lý tập trung cho chủ cửa hàng.
    *   **MongoDB:** Lưu trữ thông tin khách hàng, sản phẩm, đơn hàng.

---

## � Công nghệ Sử dụng (Tech Stack)

| Lĩnh vực | Công nghệ chính | Ghi chú |
| :--- | :--- | :--- |
| **Backend** | **NodeJS, ExpressJS** | Xây dựng RESTful API hiệu năng cao |
| **Frontend** | **ReactJS, TailwindCSS** | Web Dashboard Responsive & Chart.js |
| **Database** | **MongoDB & DynamoDB** | Mô hình Hybrid Database (SQL + NoSQL) |
| **PaaS/Cloud** | **AWS (IoT Core, S3, EC2)** | Hạ tầng Cloud chuẩn công nghiệp |
| **AI/ML** | **Python, YOLOv8** | Xử lý ảnh và Computer Vision |
| **Hardware** | **ESP32, Sensors** | Lập trình nhúng C/C++ |

---

## � Cài đặt & Triển khai (Installation)

### Yêu cầu tiên quyết (Prerequisites)
*   Node.js >= 18.x
*   Python >= 3.9
*   Arduino IDE (cho ESP32)
*   Tài khoản AWS (được cấp quyền IoT Core & DynamoDB)

### Bước 1: Khởi chạy Web Server
```bash
git clone https://github.com/Bao2k5/Smart-Jewelry-Store.git
cd Web-App
npm install
npm run start
```
*Server sẽ chạy tại: `http://localhost:3000`*

### Bước 2: Kích hoạt AI Module
```bash
cd AI-Service
pip install -r requirements.txt
python detection_service.py
```

### Bước 3: Nạp Firmware cho ESP32
1. Mở `IoT-Firmware/SmartStore_ESP32.ino` bằng Arduino IDE.
2. Cập nhật `AWS_CERT_CA`, `AWS_CERT_CRT`, `AWS_CERT_PRIVATE` trong file `secrets.h`.
3. Nhấn **Upload** để nạp code.

---

## 👥 Đội ngũ Phát triển (Development Team)

Dự án được thực hiện bởi nhóm sinh viên Khoa CNTT - Học viện Hàng không Việt Nam:

1.  **Lê Dương Bảo (Team Leader)**
    *   Vai trò: **Backend Lead, System Architect**.
    *   Trách nhiệm: Thiết kế hệ thống, Code Backend API, Tích hợp AWS & Web Dashboard.
2.  **Đặng Cao Minh Anh**
    *   Vai trò: **Cloud Engineer**.
    *   Trách nhiệm: Cấu hình AWS IoT Core, DynamoDB, Lambda Functions.
3.  **Nguyễn Lê Hưng**
    *   Vai trò: **IoT Engineer**.
    *   Trách nhiệm: Lập trình firmware ESP32, thiết kế mạch phần cứng.

---
*© 2025 Smart Jewelry Store Project - All Rights Reserved.*
