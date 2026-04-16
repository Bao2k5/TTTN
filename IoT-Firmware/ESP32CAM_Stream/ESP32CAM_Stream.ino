#include <WiFiManager.h>
#include <strings_en.h>
#include <wm_consts_en.h>
#include <wm_strings_en.h>
#include <wm_strings_es.h>

/**
 * ESP32-CAM - Face Verify to Unlock Door
 * Dự án: Smart Jewelry Vault
 * 
 * Luồng hoạt động:
 *   1. Phát hiện người đứng trước (nút nhấn hoặc PIR sensor)
 *   2. Chụp ảnh khuôn mặt
 *   3. POST ảnh JPEG lên BE: POST /api/security/face-verify
 *   4. Nhận kết quả JSON: { "matched": true, "name": "Nguyen Van A" }
 *   5. Nếu matched → gọi trigger-unlock để mở tủ
 * 
 * Board: AI Thinker ESP32-CAM
 * Thư viện cần cài:
 *   - esp32 by Espressif (Board Manager)
 *   - ArduinoJson by Benoit Blanchon
 *   - WiFiManager by tzapu (Library Manager)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>     // Kết nối WiFi thông minh qua điện thoại
#include <Preferences.h>     // Lưu cấu hình vào flash
#include "esp_camera.h"

// ==================== CẤU HÌNH ====================
// KHÔNG cần hardcode WiFi!
// Lần đầu bật lên: ESP32-CAM tạo hotspot "SmartVault_CAM"
// → Dùng điện thoại kết nối vào hotspot đó
// → Trình duyệt tự mở trang cấu hình
// → Nhập tên WiFi + mật khẩu + IP laptop AI-Service
// → Lưu xong, ESP32-CAM kết nối và nhớ mãi

// IP mặc định AI-Service (sẽ bị ghi đè bởi WiFiManager portal)
char AI_SERVICE_IP[40] = "192.168.1.37"; // IP laptop chay AI-Service
const int AI_SERVICE_PORT = 5001;

// Cloud BE để poll face-scan-status (Admin bấm nút mở tủ từ web)
const char* BE_BASE_URL = "https://hm-vault.zapto.org/api/security";
const char* DEVICE_KEY = "IoT_Secure_Vault_2024";

Preferences prefs; // Để lưu AI_SERVICE_IP vào flash
// =====================================================

// ==================== CHÂN PIN AI THINKER ESP32-CAM ====================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4  // Flash LED (nháy khi chụp)
// =======================================================

// Trạng thái
bool isProcessing = false;
unsigned long lastScanTime = 0;
unsigned long lastPollTime = 0;
#define SCAN_INTERVAL 3000  // Auto-scan mỗi 3 giây (giảm tải, đủ để nhận diện)
#define POLL_INTERVAL 1000  // Poll BE mỗi 1 giây xem Admin có bấm nút chưa


bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM; config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM; config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM; config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM; config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM; config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM; config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM; config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM; config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size   = FRAMESIZE_SVGA; // 800x600 - Tốt hơn cho nhận diện khuôn mặt
    config.jpeg_quality = 8;              // Chất lượng cao hơn (ảnh nét hơn, ít nhiễu hơn)
    config.fb_count     = 2;
  } else {
    config.frame_size   = FRAMESIZE_VGA;  // 640x480 fallback (đủ tốt)
    config.jpeg_quality = 10;
    config.fb_count     = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAM] Lỗi khởi tạo: 0x%x\n", err);
    return false;
  }

  // Tối ưu cho nhận diện mặt trong nhà (tủ kính)
  sensor_t* s = esp_camera_sensor_get();
  s->set_brightness(s, 1);    // Tăng độ sáng nhẹ
  s->set_contrast(s, 1);
  s->set_whitebal(s, 1);
  s->set_awb_gain(s, 1);
  s->set_exposure_ctrl(s, 1);
  s->set_aec2(s, 1);
  s->set_gain_ctrl(s, 1);
  s->set_hmirror(s, 0);       // Không lật (camera nhìn thẳng vào mặt)
  s->set_vflip(s, 0);

  Serial.println("[CAM] Khởi tạo OK!");
  return true;
}

// Chụp ảnh và gửi lên BE để nhận diện khuôn mặt
void scanFaceAndUnlock() {
  if (isProcessing) return; // Chống double-click
  isProcessing = true;

  Serial.println("\n[SCAN] === Bắt đầu quét khuôn mặt ===");

  // 1. Flash LED bật sớm để sensor kịp điều chỉnh độ sáng
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(500); // Tăng lên 500ms để AEC ổn định

  // 2. Xả frame cũ đang nằm trong buffer (tránh ảnh tối bị chụp sẵn từ trước)
  camera_fb_t* stale = esp_camera_fb_get();
  if (stale) esp_camera_fb_return(stale);
  stale = esp_camera_fb_get();
  if (stale) esp_camera_fb_return(stale);
  delay(50); // Để sensor ổn định thêm một nhịp

  // 3. Chụp ảnh tươi nhất
  camera_fb_t* fb = esp_camera_fb_get();
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!fb) {
    Serial.println("[CAM] Lỗi: Không chụp được ảnh!");
    isProcessing = false;
    return;
  }

  Serial.printf("[CAM] Đã chụp ảnh: %d bytes (%dx%d)\n", fb->len, fb->width, fb->height);

  // 3. POST ảnh lên BE
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Mất kết nối WiFi!");
    esp_camera_fb_return(fb);
    isProcessing = false;
    return;
  }

  HTTPClient http;
  String verifyUrl = "http://" + String(AI_SERVICE_IP) + ":" + String(AI_SERVICE_PORT) + "/face-verify";
  http.begin(verifyUrl);
  http.setTimeout(10000); // Timeout 10s (AI cần thời gian xử lý)
  http.addHeader("Content-Type", "image/jpeg");

  Serial.printf("[HTTP] POST đến AI-Service: %s\n", verifyUrl.c_str());
  int httpCode = http.POST(fb->buf, fb->len);
  esp_camera_fb_return(fb); // Giải phóng bộ nhớ camera ngay sau khi gửi

  // 4. Xử lý kết quả
  if (httpCode == 200) {
    String response = http.getString();
    Serial.printf("[HTTP] Response: %s\n", response.c_str());

    // Parse JSON: { "matched": true, "name": "Nguyen Van A" }
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      bool matched = doc["matched"] | false;
      const char* name = doc["name"] | "Unknown";

      if (matched) {
        Serial.printf("[ACCESS] ✅ NHẬN DIỆN THÀNH CÔNG: %s\n", name);
        Serial.println("[ACCESS] AI-Service đã tự động gửi lệnh mở khóa tủ!");
        // AI-Service đã tự gọi trigger-unlock lên cloud BE rồi
        // Chỉ cần nháy LED xanh báo thành công
        for (int i = 0; i < 3; i++) {
          digitalWrite(FLASH_LED_PIN, HIGH); delay(150);
          digitalWrite(FLASH_LED_PIN, LOW);  delay(150);
        }
      } else {
        Serial.printf("[ACCESS] ❌ KHÔNG NHẬN DIỆN ĐƯỢC! (Phát hiện: %s)\n", name);
        // Nháy LED nhanh 5 lần báo thất bại
        for (int i = 0; i < 5; i++) {
          digitalWrite(FLASH_LED_PIN, HIGH); delay(80);
          digitalWrite(FLASH_LED_PIN, LOW);  delay(80);
        }
      }
    } else {
      Serial.printf("[JSON] Parse lỗi: %s\n", error.c_str());
    }

  } else if (httpCode < 0) {
    Serial.printf("[HTTP] Lỗi kết nối AI-Service: %d\n", httpCode);
    Serial.printf("[HTTP] Kiểm tra IP: %s và port %d\n", AI_SERVICE_IP, AI_SERVICE_PORT);
  } else {
    Serial.printf("[HTTP] Lỗi HTTP: %d\n", httpCode);
  }

  http.end();
  
  // 5. Cooldown 1 giây trước khi cho quét lại
  delay(1000);
  isProcessing = false;
  Serial.println("[SCAN] === Sẵn sàng quét lại ===\n");
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32-CAM Face Verify - Smart Jewelry Vault ===");

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  // Không cần GPIO ngoài - tự quét theo chu kỳ

  // Khởi tạo camera
  if (!initCamera()) {
    Serial.println("[ERROR] Camera lỗi! Kiểm tra kết nối phần cứng.");
    while (true) { // Đứng yên nhấp nháy báo lỗi
      digitalWrite(FLASH_LED_PIN, HIGH); delay(100);
      digitalWrite(FLASH_LED_PIN, LOW);  delay(100);
    }
  }

  // ===== KẾT NỐI WIFI BẰNG WIFIMANAGER =====
  // Thêm custom parameter: IP của AI-Service
  WiFiManagerParameter param_ai_ip("ai_ip", "IP Laptop chay AI-Service", AI_SERVICE_IP, 40);

  WiFiManager wm;
  wm.addParameter(&param_ai_ip);
  wm.setConfigPortalTimeout(120);

  // Xóa cache IP cũ để dùng IP mới từ code
  prefs.begin("cam-cfg", false);
  prefs.remove("ai_ip"); // Xóa IP cũ (192.168.1.100)
  prefs.end();
  Serial.println("[CFG] Đã reset IP cache → dùng IP mặc định: 192.168.1.37");

  // Tên hotspot khi chưa có WiFi: "SmartVault_CAM"
  bool connected = wm.autoConnect("SmartVault_CAM");

  if (!connected) {
    Serial.println("[WIFI] Kết nối thất bại hoặc timeout! Restart...");
    ESP.restart();
  }

  // Lưu IP AI-Service vào flash nếu vừa được nhập qua portal
  String newIP = param_ai_ip.getValue();
  if (newIP.length() > 0 && newIP != String(AI_SERVICE_IP)) {
    newIP.toCharArray(AI_SERVICE_IP, sizeof(AI_SERVICE_IP));
    prefs.begin("cam-cfg", false);
    prefs.putString("ai_ip", newIP);
    prefs.end();
    Serial.printf("[CFG] Đã lưu AI-Service IP: %s\n", AI_SERVICE_IP);
  }

  Serial.println();
  Serial.printf("[WIFI] Đã kết nối! IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.println("[INFO] Nhấn nút GPIO13 để quét khuôn mặt mở tủ.");
  Serial.println("[INFO] (Hoặc tích hợp PIR sensor vào GPIO13)");

  // Nháy LED 3 lần báo ready
  for (int i = 0; i < 3; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH); delay(200);
    digitalWrite(FLASH_LED_PIN, LOW);  delay(200);
  }
}

void loop() {
  unsigned long now = millis();

  // === CHẾ ĐỘ 1: Admin bấm nút "Mở Tủ FaceID" trên web ===
  // Poll BE mỗi 2 giây xem có yêu cầu quét mặt từ Admin không
  if (!isProcessing && (now - lastPollTime >= POLL_INTERVAL)) {
    lastPollTime = now;
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, String(BE_BASE_URL) + "/face-scan-status");
    http.addHeader("x-device-key", DEVICE_KEY);
    http.setTimeout(3000);
    int code = http.GET();
    if (code == 200) {
      String body = http.getString();
      StaticJsonDocument<128> doc;
      if (!deserializeJson(doc, body) && doc["shouldScan"] == true) {
        Serial.println("[POLL] Admin yêu cầu quét mặt từ Web! Đang quét...");
        http.end();
        scanFaceAndUnlock();
        return;
      }
    }
    http.end();
  }

  // === CHẾ ĐỘ 2: Tự động quét ĐÃ TẮT ===
  // Chỉ scan khi Admin bấm nút trên web (Chế độ 1)
  // if (!isProcessing && (now - lastScanTime >= SCAN_INTERVAL)) {
  //   lastScanTime = now;
  //   scanFaceAndUnlock();
  // }

  // Giữ kết nối WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Mất kết nối, đang kết nối lại...");
    WiFi.reconnect();
    delay(5000);
  }

  delay(50);
}

