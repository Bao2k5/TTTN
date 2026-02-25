# HƯỚNG DẪN BẢO VỆ ĐỒ ÁN (Smart Jewelry Vault)

Tài liệu này giúp bạn chuẩn bị trả lời các câu hỏi "hóc búa" từ Thầy Cô khi chấm đồ án.

## 1. Các câu hỏi về Công nghệ (Technical)
- **Hỏi:** Tại sao lại dùng Edge AI (nhận diện trên máy tính) mà không dùng ESP32-CAM luôn cho gọn?
  - **Trả lời:** Dùng ESP32-CAM chỉ nhận diện được khuôn mặt đơn giản. Hệ thống của em dùng YOLOv8 chạy ở Edge (Máy tính) giúp nhận diện nhanh hơn, chính xác hơn và có thể xử lý nhiều bài toán phức tạp (nhận diện nhiều người, hành vi lạ) mà ESP32 không đủ RAM để làm.
- **Hỏi:** Cơ chế bảo mật khi mất kết nối Internet là gì?
  - **Trả lời:** Hệ thống có cơ chế Offline. Dù mất mạng, cảm biến cửa và báo động tại chỗ (Loa/Buzzer) vẫn hoạt động nhờ logic trong firmware ESP32. Chỉ có phần báo báo về App là bị trì hoãn cho đến khi có mạng lại.
- **Hỏi:** Chatbot AI (Gemini) đóng vai trò gì, không có nó thì hệ thống có chạy được không?
  - **Trả lời:** Chatbot là trợ lý quản trị. Không có nó hệ thống vẫn chạy tốt, nhưng có nó thì việc truy xuất dữ liệu an ninh/doanh thu trở nên tự nhiên (NLP). Nó giúp quản trị viên nắm bắt tình hình cửa hàng nhanh chóng bằng ngôn ngữ tự nhiên.

## 2. Các kịch bản Demo (Showcase)
1. **Mở cửa an toàn:** Bạn đưa mặt mình vào camera → Web báo "Welcome [Tên bạn]" → Cửa mở → LCD hiện "Cua: MO".
2. **Kịch bản Trộm:** Bạn đeo khẩu trang hoặc nhờ người lạ vào camera → Còi hú vang → Led đỏ nháy → Điện thoại nhận thông báo báo động (Blynk).
3. **Quản lý thông minh:** Mở Chatbot hỏi: "Hôm nay có vụ đột nhập nào không?" → AI sẽ đọc log và trả lời chi tiết.

## 3. Các điểm nhấn (Bonus Points)
- Tích hợp **Cloud Computing** (Render/Vercel) để quản lý mọi lúc mọi nơi.
- Sử dụng **FreeRTOS** trong ESP32 để xử lý đa nhiệm (Còi hú không làm treo máy).
- Kết hợp **Generative AI** (Gemini) để tư vấn sản phẩm và báo cáo an ninh.

Chúc bạn bảo vệ đồ án thật tốt! 💎🚀
