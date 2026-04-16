# CÁC VẤN ĐỀ TỒN ĐỌNG VÀ HƯỚNG PHÁT TRIỂN NÂNG CẤP HỆ THỐNG AI KHUÔN MẶT
*(Tài liệu tham khảo tham luận phát triển Đồ án TTTN bảo mật Tiệm vàng)*

## 1. Presentation Attacks (Tấn Công Giả Mạo Bằng Vật Phẩm - Spoofing)
Đây là điểm yếu "chí mạng" nhất của các thuật toán nhận diện khuôn mặt qua Camera 2D truyền thống (như InsightFace hay FaceNet).
- **Vấn đề:** Trộm có thể sử dụng dữ liệu public (ẩn danh) lấy ảnh nén từ MXH của tài khoản quản lý, in ra bằng mặt nạ 3D hoặc hiển thị ảnh/video qua màn hình iPad đưa sát Camera tiệm vàng. Thuật toán AI hiện hành chủ yếu chỉ tập trung trích xuất "vector cấu trúc khuôn mặt", nên nó sẽ xử lý và cấp quyền mở khóa do sai lầm coi màn hình là quản lý thực sự (Spoofing Attack).
- **Ý tưởng nâng cấp giải pháp:** Yêu cầu tích hợp thêm module **Liveness Detection (Phát hiện Thực thể sống)** vào pipeline của AI.
  - *Active Liveness:* Hệ thống đòi hỏi người dùng chớp mắt hoặc xoay đầu để tạo luồng xác thực (Challenge-Response authentication).
  - *Passive Liveness:* Triển khai các mạng Deep Learning siêu nhẹ (ví dụ `Silent-Face-Anti-Spoofing`) thực thi phân tích quang sai. Nó phân biệt bề mặt khúc xạ ánh sáng cong của làn da thật (khối 3D) so với bề mặt phẳng lỳ phản quang của màn hình điện tử (phẳng 2D).

## 2. Adversarial Attacks (Tấn Công Bằng Nhiễu Đối Nghịch)
Một rủi ro tiềm ẩn đang được cộng đồng trí tuệ nhân tạo (Def Con) thảo luận gắt gao.
- **Vấn đề:** Tội phạm khi đi lừa đảo không cần dùng công cụ che lấp toàn bộ mặt. Họ chỉ cần thay đổi hình chiếu quang học, ví dụ dán các miếng vá kỳ lạ (Adversarial Patch) hoặc đeo cặp kính chứa nhiễu (Adversarial Glasses). Các họa tiết bất thường này tạo ra thông số ma trận nhiễu độc hại tấn công lớp tích chập (Convolutional Layers) của YOLO11/InsightFace. Nó đánh lừa mô hình nhận dạng từ đúng danh tính một nhân viên thành một nhân vật khác, hoặc hoàn toàn triệt tiêu chức năng định vị (Bounding box).
- **Ý tưởng nâng cấp giải pháp:** Tổ chức phương pháp **Adversarial Training (Huấn luyện Đối nghịch)**. Tích nhồi định kỳ các tập dữ liệu có làm nhiễu/bóp méo thuật toán vào thư viện dạy học mô hình để nó nâng cao khả năng miễn nhiễm với tiểu xảo hack ma trận hình ảnh.

## 3. Biometric Template Privacy (Bảo Mật Biến Đổi Sinh Trắc Học)
Bài toán bảo đảo an toàn tại bộ lưu trữ cơ sở dữ liệu khuôn mặt.
- **Vấn đề rủi ro:** Dữ liệu khuôn mặt đã được mã hóa ngầm dưới dạng Binary array (`embeddings`) lưu thẳng vào MongoDB. Khác biệt với việc mất mật khẩu (có thể tạo Password mới dễ dàng), Sinh trắc học là một hằng số Không Thể Phục Hồi. Nếu Server bị xâm nhập lộ Database, kẻ xấu có thể đảo ngược dịch thông số `embeddings` thành dữ liệu 3D gương mặt, đánh cắp danh tính. Dữ liệu này không phẫu thuật thẩm mỹ để thay đổi được.
- **Ý tưởng nâng cấp giải pháp:** Đọc thêm và trình bày về mô hình **Cancelable Biometrics (Mã hóa sinh trắc hủy ngang)**. Khi trích xuất ra một mảng `embeddings` (ví dụ [0.1, 0.4, 0.5...]), hệ thống sẽ không lưu trực tiếp mà yêu cầu băm (Hashing) chuỗi nơ-ron này với một Random Salt Key trên nền tảng Server (thành mảng [0.8, -0.2, 0.9...]). Kể cả khi rò rỉ DB, Hacker không thể giải mã ngược lại gương mặt ban đầu mà không có Secret Salt Của thiết bị biên. Khi cần bãi bỏ, ta dễ dàng cấp cho nạn nhân một Salt Key mới dùng chung với khuôn mặt cũ mà không phải đi chụp quét lưu trữ lại.

## 4. Hardware Constraints (Thách thức Quang học và Môi trường chạy thực địa)
- **Vấn đề vật lý:** Khu vực sảnh trưng bày trang sức có cường độ đèn LED đan chéo phức tạp hắt ánh sáng (Glare) và làm chói mặt. Khi đêm tới phải tắt đèn, tín hiệu hình ảnh bị nhiễu hạt đen đục. Hệ thống 2D mất hẳn độ chính xác khi thiếu sáng (Low light) hoặc do mái tóc che khuất vách định danh mắt (Occulusion).
- **Ý tưởng nâng cấp giải pháp:** Mở rộng tích hợp theo Kiến trúc phần cứng lai (Hybrid Architecture):
  - *Phần Cứng:* Nâng cấp giải pháp sử dụng Camera Hồng Ngoại (IR – Infrared Sensor). Cảm biến bắn các điểm tia sáng để đo trực tiếp độ sâu biểu đồ khuôn mặt xuyên qua bóng tối mù hoàn toàn (Tương tự Apple FaceID).
  - *Phần Mềm:* Bổ sung các tầng Tiền xử lý (Image Pre-processing Pipeline) kết hợp thuật toán *CLAHE* (Cân bằng phân phối biểu đồ) và làm rõ độ nét, giúp AI làm nét đường viền mờ ảo trong các luồng dữ liệu trước khi nạp vào AI.

## 5. Demographic Bias (Khuynh Hướng Thiên Lệch Nhân Khẩu Học & Đạo Đức AI)
Một khía cạnh công nghệ thường hay bị bỏ qua nhưng lại cực kỳ quan trọng đối với các hệ thống AI thương mại.
- **Vấn đề toàn cầu báo cáo:** Các tập dữ liệu huấn luyện (Dataset) thường được lấy từ phương Tây (âm bản dồi dào ảnh nam giới và da trắng sáng). Do đó, khi đưa vào môi trường khu vực Á Đông thực tế, độ chính xác của AI có thể giảm sút nghiêm trọng đối với những cá nhân là nữ giới, người già, hoặc có nước da tối sạm.
- **Ý tưởng nâng cấp giải pháp:** Trình bày về quá trình "Retraining / Fine-Tuning" (Huấn luyện tối ưu lại). Cần áp dụng quy trình kiểm định cân bằng tập dữ liệu (Dataset Balancing) bằng thuật toán FairFace để đảm bảo tính công bằng (AI Fairness), giúp hệ thống hoạt động chính xác đồng đều cho mọi sắc tộc, giới tính độ tuổi đang mua sắm tại Tiệm Vàng.

## 6. Face Morphing & Generative Spoofing (Tấn Công Lai Tạo & Hoán Đổi Bằng DeepFake)
Hình thức tấn công Tinh vi nhất sử dụng AI để đánh bại AI (AI vs AI) theo chuẩn tài liệu NIST FRVT.
- **Vấn đề:** Nếu hệ thống Camera IP của Tiệm vàng bị thao túng vật lý, tội phạm có thể qua mặt bằng cách truyền thẳng luồng Video DeepFake được hoán đổi khuôn mặt (Face-Swapping) thời gian thực của Quản lý.
- **Nguy hiểm hơn (Face Morphing Attack):** Kẻ gian trộn lẫn ảnh của chúng tỷ lệ 50-50 với ảnh Sếp quản lý để tạo ra một sinh trắc học lai. Khi đứng trước màn hình, hệ thống có thể bị nhầm lẫn và nhận ra đặc điểm phụ của Sếp, từ đó vô tình mở khóa két an toàn. 
- **Ý tưởng nâng cấp giải pháp:** Đưa ra phương pháp giải quyết bằng **DeepFake Detection**. Phát hiện bất đồng bộ các tín hiệu quang học (Ví dụ nhịp tim vi biểu mô mạch máu trên khuôn mặt - rPPG) hoặc bóc tách Tần số không gian (Frequency Domain Analysis) để phát hiện ra vùng viền mờ ảnh (Artifacts) do AI GAN (Generative Adversarial Networks) sinh ra, từ chối mọi hình ảnh giả mạo ma thuật.
