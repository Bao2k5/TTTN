HỌC VIỆN HÀNG KHÔNG VIỆT NAM
KHOA CÔNG NGHỆ THÔNG TIN

BÁO CÁO
Internet vạn vật (IoT)
TỦ BẢO QUẢN TÀI SẢN THÔNG MINH AIOT 
(SMART PRESERVATION VAULT)

Giảng viên hướng dẫn: Ths. Nguyễn Thái Sơn
Sinh viên/ Nhóm sinh viên thực hiện: Nhóm 02
Lớp: 010100087002

TP. Hồ Chí Minh, tháng 4/2026

Danh sách Nhóm:
- 1. Lê Dương Bảo - 2331540071 - 23ĐHTT02 - Nhóm Trưởng
- 2. Nguyễn Lê Hưng - 2331540323 - 23ĐHTT05 - Thành viên
- 3. Giang Vạn Lộc - 2331540002 - 23ĐHTT01 - Thành Viên
- 4. Nguyễn Thành Vinh - 2331540016 - 23ĐHTT01 - Thành Viên
- 5. Dương Gia Quốc Bảo - 2331540017 - 23ĐHTT01 - Thành Viên

DANH MỤC CÁC KÝ HIỆU, CHỮ VIẾT TẮT
AC: Dòng điện xoay chiều
AI: Trí tuệ nhân tạo
API: Thư viện lập trình
DC: Nguồn điện một chiều
GPIO: Chân cắm (General Purpose Input/Output)
HMI: Giao diện Người - Máy
IoT: Internet vạn vật
LAN: Local Area Network (Mạng cục bộ)
LCD: Liquid Crystal Display
NoSQL: Cơ sở dữ liệu phi quan hệ
OOP: Lập trình hướng đối tượng
PaaS: Platform as a Service (Dịch vụ đám mây)
PIR: Passive Infrared Sensor (Cảm biến người)
SoC: Hệ thống trên chip (System on a Chip)
SSID: Tên Wi-Fi
WAN: Mạng diện rộng

# CHƯƠNG 1. GIỚI THIỆU

## 1.1. Lý do chọn đề tài
Bảo vệ và lưu trữ tài sản giá trị đang trở thành nhu cầu thiết yếu trong đời sống hiện đại, trong đó mô hình tủ bảo quản thông minh đóng vai trò quan trọng giúp nâng cao mức độ an toàn và kéo dài tuổi thọ cho các vật phẩm như trang sức, giấy tờ hay thiết bị điện tử nhạy cảm. Tuy nhiên, việc bảo quản bằng các loại két sắt truyền thống hiện nay phần lớn vẫn chỉ tập trung vào khả năng chống cạy phá vật lý. Các loại két cố định này thường bị giới hạn về khả năng giám sát chủ động, trong khi môi trường bên trong rỗng, kín dễ dẫn đến tình trạng ẩm mốc, nhiệt độ cao gây hư hại tài sản. Sự thiếu hụt một công cụ bảo quản có khả năng tự động hóa và điều hòa môi trường dẫn đến bài toán cần phải xây dựng một không gian lưu trữ có khả năng tự nhận thức và tương tác. Nếu vấn đề này được giải quyết, người dùng cá nhân sẽ sở hữu một giải pháp bảo mật toàn diện, theo thời gian thực về tình trạng tài sản, từ đó ngăn chặn rủi ro mất mát và giảm thiểu hư hỏng do tác nhân thời tiết. Giải pháp tủ thông minh này không chỉ mang lại giá trị to lớn cho nhu cầu dân dụng mà còn mở ra tiềm năng ứng dụng trong các lĩnh vực khác như trưng bày bảo tàng, lưu trữ mẫu vật y tế hoặc quản lý hồ sơ mật.

## 1.2. Mục tiêu đề tài
Mục tiêu cốt lõi của đề tài là nghiên cứu, thiết kế và chế tạo thành công một sản phẩm Tủ bảo quản thông minh (Smart Vault) tích hợp công nghệ AIoT đóng vai trò như một không gian lưu trữ an toàn tuyệt đối phục vụ cho người dùng cá nhân. Về mặt hệ thống ứng dụng, kết quả cần đạt được là một mô hình tủ vật lý có khả năng tự động nhận diện khuôn mặt để mở khóa, thực hiện điều hòa nhiệt độ, hút ẩm tự động và gửi cảnh báo cạy phá tức thời qua ứng dụng di động. Về mặt công nghệ ứng dụng, đề tài hướng tới việc làm chủ và tích hợp thành công các module cảm biến môi trường, hệ thống cơ cấu chấp hành công suất lớn (sò nóng lạnh, khóa từ), kết hợp với công nghệ AI (FaceID) và nền tựng IoT để truyền tải dữ liệu giám sát từ thiết bị về điện thoại người dùng nhằm phục vụ công tác quản lý từ xa.

## 1.3. Phạm vi đề tài
Đề tài được thực hiện trong không gian ứng dụng là mô hình lưu trữ và trưng bày thông minh cỡ nhỏ, cụ thể là tủ mica có kích thước 30x18x24cm được phân chia thành ngăn kỹ thuật và ngăn trưng bày. Về mặt thời gian và khối lượng công việc, do đây là sản phẩm được phát triển để phục vụ cho việc báo cáo đánh giá, phạm vi nghiên cứu chủ yếu tập trung vào việc hoàn thiện khung vỏ thử nghiệm (prototype) bằng Formex/Mica và xây dựng luồng xử lý tín hiệu cơ bản giữa cảm biến và rơ-le. Đề tài giới hạn trong việc tủ tự động thu thập thông số môi trường, xử lý hình ảnh tại chỗ hoặc qua server nội bộ và điều khiển cơ cấu đóng cắt, không bao gồm việc chế tạo các lớp vỏ thép đúc chống đạn hay triển khai hệ thống an ninh liên kết trực tiếp với cơ quan chức năng.

## 1.4. Đối tượng nghiên cứu
Để hiện thực hóa hệ thống trên, đề tài tập trung nghiên cứu các đối tượng chính bao gồm kiến trúc phần cứng của vi điều khiển trung tâm đa nhân, có khả năng xử lý mạng và hình ảnh. Kế tiếp, đề tài đi sâu vào các cơ cấu chấp hành đặc thù đòi hỏi dòng điện lớn như khóa điện từ (Solenoid) và linh kiện bán dẫn thay đổi nhiệt độ (Sò Peltier). Đối tượng nghiên cứu quan trọng khác là các chuẩn giao tiếp mạng và nền tảng đám mây trong IoT để đảm bảo quá trình liên lạc ổn định, lưu trữ lịch sử truy cập và hình ảnh kẻ gian giữa thiết bị vật lý và ứng dụng giám sát của người dùng.

## 1.5. Phương pháp nghiên cứu
Đề tài áp dụng phương pháp thu thập thông tin thông qua việc tổng hợp, tham khảo các tài liệu kỹ thuật (datasheet) của linh kiện điện tử, các bài báo khoa học về IoT và diễn đàn mã nguồn mở về AI (nhận diện khuôn mặt) để xây dựng nền tảng lý thuyết vững chắc. Đối với phương pháp xử lý thông tin, đề tài áp dụng các kỹ thuật tính toán định lượng để thiết kế khối nguồn, đo đạc dòng điện tiêu thụ của mạch hạ áp LM2596 và cơ cấu chấp hành sao cho tối ưu nhất, không gây quá tải cho Adapter 12V-5A. Trọng tâm của quá trình thực hiện là phương pháp thực nghiệm, trong đó nhóm phát triển sẽ trực tiếp lắp ráp linh kiện, phân chia không gian tủ, lập trình vi điều khiển ESP32 và tổ chức các buổi kiểm thử thực tế với các kịch bản như cạy phá, thay đổi nhiệt độ nhằm đánh giá tính an toàn của sản phẩm trước khi nghiệm thu.

## 1.6. Bố cục đề tài
Phần còn lại của báo cáo được tổ chức như sau. Chương 2 trình bày các cơ sở lý thuyết nền tảng về hệ thống vi điều khiển nhúng, các thành phần cấu tạo, nguyên lý hoạt động của các cơ cấu điện từ và nhiệt điện, cùng với tổng quan về hệ sinh thái Internet vạn vật. Trong Chương 3, báo cáo giới thiệu chi tiết về quá trình phân tích và thiết kế hệ thống, bao gồm kiến trúc tổng thể, sơ đồ khối phần cứng, thiết kế luồng xử lý phần mềm cho các tính năng nhận diện khuôn mặt, kiểm soát nhiệt/ẩm và cảnh báo. Chương 4 tập trung trình bày quá trình hiện thực hóa sản phẩm, các bước thi công khung vỏ mica, cùng với kết quả thử nghiệm thực tế của Tủ thông minh tại các kịch bản môi trường khác nhau để đánh giá mức độ đáp ứng mục tiêu ban đầu. Cuối cùng, Chương 5 tổng kết lại những kết quả đã đạt được, chỉ ra những hạn chế còn tồn đọng và đề xuất các hướng phát triển hệ thống trong tương lai.

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

## 2.1. Cơ sở lý thuyết về vi điều khiển ESP32
Vi điều khiển ESP32 được công ty Espressif Systems chính thức tung ra thị trường vào năm 2016, đánh dấu một bước tiến lớn trong việc cung cấp giải pháp xử lý mạnh mẽ cho các thiết bị IoT. Về khái niệm, đây là một hệ thống trên chip (SoC) giá rẻ, tiêu thụ năng lượng thấp, nổi bật với bộ vi xử lý lõi kép và được tích hợp sẵn kết nối mạng không dây Wi-Fi, Bluetooth. Điểm mạnh vượt trội của thiết bị này là tốc độ xung nhịp cao, số lượng chân cắm (GPIO) phong phú hỗ trợ nhiều chuẩn giao tiếp. Tuy nhiên, thiết bị này tiêu thụ dòng điện tĩnh cao, đòi hỏi hệ thống cấp nguồn 3.3V/5V phải thực sự ổn định.

## 2.2. Cơ sở lý thuyết về module xử lý hình ảnh ESP32-CAM
ESP32-CAM là một phiên bản mở rộng dựa trên nền tảng ESP32, được thiết kế chuyên biệt cho các bài toán thị giác máy tính cỡ nhỏ. Về khái niệm, nó là bo mạch tích hợp sẵn camera chuyên dụng (OV2640 2 Megapixel) và khe thẻ nhớ MicroSD. Điểm mạnh là giá thành dễ tiếp cận, kích thước siêu nhỏ, truyền phát video trực tiếp qua mạng nội bộ. Khuyết điểm là năng lực đồ họa hạn chế và dễ bị quá nhiệt khi hoạt động dài.

## 2.3. Cơ sở lý thuyết về Cảm biến Nhiệt ẩm DHT11/DHT22
Dòng cảm biến DHT11/DHT22 phổ biến nhờ khả năng đo nhiệt độ và độ ẩm, xuất tín hiệu số trực tiếp tới vi điều khiển. Ưu điểm là giá rẻ, dễ sử dụng. Hạn chế là tốc độ phản hồi chậm (khoảng 2 giây mỗi lần cập nhật). Dù vậy, với những không gian nhỏ như hộp mica, cảm biến DHT vẫn tối ưu.

## 2.4. Cơ sở lý thuyết về Sò nóng lạnh Peltier (TEC1-12706)
Công nghệ làm lạnh bán dẫn dựa trên hiệu ứng Peltier (1834). Sò Peltier hoạt động hoàn toàn tĩnh lặng và rất nhỏ gọn. Nhược điểm là tiêu thụ dòng điện cực lớn (lên tới 5A - 6A ở 12V) và bắt buộc có tản nhiệt tốt, nếu không sẽ hỏng.

## 2.5. Cơ sở lý thuyết về Quạt tản nhiệt (DC Fan)
Quạt tản nhiệt chuyển đổi điện năng thành cơ năng tạo luồng khí cưỡng bức. Giúp bảo vệ hệ thống khỏi quá nhiệt.

## 2.6. Cơ sở lý thuyết về Khóa điện từ Solenoid 12V
Solenoid có cuộn dây đồng quấn quanh lõi kim loại. Khi cấp điện 12V, cuộn dây sinh từ trường hút chốt mở khóa, ngắt điện lò xo đẩy chốt khóa cửa. Ưu điểm phản hồi tức thì. Yếu điểm tiêu tốn dòng điện tức thời lớn, dễ sinh nhiệt.

## 2.7. Cơ sở lý thuyết về Cảm biến rung SW-420
Phát hiện các tác động ngoại lực (rung, cạy phá). Rất nhạy bén nhưng dễ gây báo động giả nếu môi trường xung quanh rung động nền quá lớn.

## 2.8. Cơ sở lý thuyết về Cảm biến từ tính (Reed Switch) - Giám sát cửa
Gồm 2 tiếp điểm trong ống thủy tinh, hoạt động nguyên lý lực từ của nam châm. Chức năng giám sát phần hở mạch khi cửa két bị mở tung trái phép.

## 2.9. Cơ sở lý thuyết về Cảm biến người (PIR)
Phát hiện vật thể có nhiệt độ di chuyển, xuất ra tín hiệu High. Tiết kiệm hiệu năng hệ thống khi đánh thức chế độ FaceID.

## 2.10. Cơ sở lý thuyết về Mạch giảm áp LM2596
DC-DC step-down buck converter hạ điện áp đầu vào 12V thành ổn định 5.0V để nuôi vi điều khiển ESP32.

## 2.11. Cơ sở lý thuyết về Hệ thống Đèn cảnh báo
Giao diện thông báo: Màu trắng (khởi động), Xanh (An toàn), Vàng (Nghi vấn), Đỏ (Báo động cạy phá khẩn cấp).

## 2.12. Cơ sở lý thuyết về Loa/Còi báo động
Còi báo (Active Buzzer) phát đi âm thanh tần số lớn để đe dọa truy nhập vật lý hoặc cạy phá thiết bị.

## 2.13. Cơ sở lý thuyết về Module Relay (Rơ-le)
Công tắc điện từ, làm trung gian điện áp nhỏ (3.3V) từ vi điều khiển đóng/ngắt thiết bị tiêu thụ công suất 12V-5A (khóa Solenoid, Peltier).

## 2.14. Cơ sở lý thuyết Màn LCD I2C
Màn hiển thị tinh thể lỏng, giao tiếp chuẩn I2C tối giản hóa đường dây tiết kiệm GPIO của vi điều khiển, hiển thị nhiệt ẩm thời gian thực.

## 2.15. Cơ sở lý thuyết về Nguồn tổ ong 12V-5A
Switching Power Supply chuyển nguồn AC 220V xuống DC 12V, đảm bảo hệ thống có 5A nuôi mạch cảm biến dòng cao.

## 2.16. Cơ sở lý thuyết về C++
Ngôn ngữ thủ tục hướng đối tượng tiêu chuẩn trong lập trình nhúng, biên dịch trực tiếp ra mã máy giúp độ trễ giảm tối đa.

## 2.17. Cơ sở lý thuyết về Nền tảng Blynk IoT
Nền tảng Cloud (PaaS) giúp xây dựng App điều khiển, giao diện trực quan và thu nhận Push API.

## 2.18. Cơ sở lý thuyết về Wifimanager
Thư viện quản lý kết nối, mang lại chuẩn Plug-and-Play (Captive Portal), không cần hardcode SSID mật khẩu vào vi điều khiển.

## 2.19. Cơ sở lý thuyết về Xử lý đa luồng (FreeRTOS)
Tránh nghẽn lệnh (single-thread), giúp điều khiển thiết bị song song phân tán (Core 0 và Core 1).

## 2.20. Cơ sở lý thuyết về Non-blocking với Timer (millis)
Thay thế hàm `delay()` gây treo vi xử lý, tạo ra hoạt động đa nhiệm đồng thời.

## 2.21. Cơ sở lý thuyết về Phát hiện đối tượng (YOLOv11)
Nhận diện vị trí không gian với độ trễ thấp (Bounding Box).

## 2.22. Cơ sở lý thuyết về Trích xuất đặc trưng (InsightFace)
Sử dụng ArcFace triệt tiêu lỗi góc mặt, mã hoá Vector nhận diện và đưa ra quyền mở khoá.

## 2.23. Cơ sở lý thuyết về Web Server & MongoDB Atlas
Cloud Server giúp lưu lại Lịch sử (Log Access) qua API JSON thời gian thực.

# CHƯƠNG 3. PHÂN TÍCH HỆ THỐNG VÀ XÂY DỰNG SẢN PHẨM

## 3.1. Phân tích hệ thống
### 3.1.1. Tổng quan hệ thống
Tích hợp Điện toán biên (Edge Computing) và nền tảng đám mây IoT (SaaS). 
1. Trạm Node IoT (Tủ ESP32).
2. Máy chủ AI Biên (Edge AI Gateway) (< 1.5 giây).
3. Hệ sinh thái Đám mây (Blynk/MongoDB).

### 3.1.2 Yêu cầu chức năng
- Thu thập & Điều hòa khí hậu (Peltier, Quạt, DHT22).
- Bảo mật Sinh trắc học (FaceID, Solenoid Lock).
- Cảnh báo Xâm nhập (Buzzer, SW-420, PIR, Cửa từ).
- Giao tiếp mạng đẩy log (Blynk, MongoDB).

### 3.1.3. Yêu cầu phi chức năng
- Tính thời gian thực & Đa luồng (FreeRTOS).
- Độ tin cậy phần cứng (LM2596 an toàn chống sụt áp Sò Nhiệt).
- Băng thông ESP32-CAM ổn định.

(Các mục Sơ đồ Use Case, Flowchart, Giao diện đã được thiết kế hoàn thiện ở tài liệu gốc)

# KẾT LUẬN
Đề tài "Tủ Bảo Quản Tài Sản Thông Minh AIoT" được phát triển thành công. Làm chủ được phần cứng (Tủ phân tầng), lập trình hệ nhúng thời gian thực (FreeRTOS, Non-Blocking, WiFiManager) để vận hành sò làm lạnh mà không tụt áp. Thuật toán nhận diện đã xử lý vượt bậc (YOLOv11, InsightFace) nâng bảo mật. Vẫn khắc phục nhược điểm về sinh nhiệt ở sò Peltier và camera thiếu sáng ban đêm.

Định hướng tích hợp thêm vi mạch BMS (quản lý Pin) tránh mất điện, và Edge AI bằng TinyML siêu nhỏ.
