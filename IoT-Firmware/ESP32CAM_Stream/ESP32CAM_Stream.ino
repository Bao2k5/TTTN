#include <WiFiManager.h>
#include <strings_en.h>
#include <wm_consts_en.h>
#include <wm_strings_en.h>
#include <wm_strings_es.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include "esp_camera.h"

// ESP32-CAM AI-Thinker Pin Definitions
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

char AI_SERVICE_IP[40] = "192.168.1.37";
const int AI_SERVICE_PORT = 5001;

const char* BE_BASE_URL = "https://hm-vault.zapto.org/api/security";
const char* DEVICE_KEY = "IoT_Secure_Vault_2024";

Preferences prefs;

#define FLASH_LED_PIN      4

bool isProcessing = false;
unsigned long lastScanTime = 0;
unsigned long lastPollTime = 0;
#define SCAN_INTERVAL 3000
#define POLL_INTERVAL 1000


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
    config.frame_size   = FRAMESIZE_VGA;  // Giảm từ SVGA xuống VGA để tăng chất lượng
    config.jpeg_quality = 6;  // Giảm từ 8 xuống 6 (chất lượng cao hơn, 0=best, 63=worst)
    config.fb_count     = 2;
  } else {
    config.frame_size   = FRAMESIZE_VGA;
    config.jpeg_quality = 8;  // Giữ 8 cho trường hợp không có PSRAM
    config.fb_count     = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAM] Lỗi khởi tạo: 0x%x\n", err);
    return false;
  }

  sensor_t* s = esp_camera_sensor_get();
  
  // Cải thiện chất lượng ảnh cho Face Recognition
  s->set_brightness(s, 1);     // Tăng độ sáng (+1)
  s->set_contrast(s, 2);       // Tăng contrast (+2) để rõ nét hơn
  s->set_saturation(s, 0);     // Giữ màu tự nhiên
  s->set_sharpness(s, 2);      // Tăng độ sắc nét (+2)
  s->set_whitebal(s, 1);       // Bật white balance tự động
  s->set_awb_gain(s, 1);       // Bật auto white balance gain
  s->set_wb_mode(s, 0);        // Auto white balance mode
  s->set_exposure_ctrl(s, 1);  // Bật auto exposure
  s->set_aec2(s, 1);           // Bật AEC sensor
  s->set_ae_level(s, 1);       // Tăng exposure level (+1)
  s->set_aec_value(s, 400);    // Set exposure value (300-1200, 400 = balanced)
  s->set_gain_ctrl(s, 1);      // Bật auto gain
  s->set_agc_gain(s, 10);      // Set gain level (0-30, 10 = moderate)
  s->set_gainceiling(s, (gainceiling_t)6);  // Gain ceiling x128
  s->set_bpc(s, 1);            // Bật black pixel correction
  s->set_wpc(s, 1);            // Bật white pixel correction
  s->set_raw_gma(s, 1);        // Bật gamma correction
  s->set_lenc(s, 1);           // Bật lens correction
  s->set_hmirror(s, 0);        // Không mirror ngang
  s->set_vflip(s, 0);          // Không flip dọc
  s->set_dcw(s, 0);            // Tắt downsize (giữ resolution gốc)
  s->set_colorbar(s, 0);       // Tắt color bar test pattern

  Serial.println("[CAM] Khởi tạo OK! (Optimized for Face Recognition)");
  return true;
}


void scanFaceAndUnlock() {
  if (isProcessing) return; 
  isProcessing = true;

  Serial.println("\n[SCAN] Bat dau quet khuon mat...");

  int max_retries = 3;
  bool finalSuccess = false;
  String finalName = "Unknown";
  String finalMessage = "";
  
  for (int attempt = 1; attempt <= max_retries; attempt++) {
    Serial.printf("\n[SCAN] --- Lan chup thu %d ---\n", attempt);

    delay(1000); 

    camera_fb_t* stale = esp_camera_fb_get();
    if (stale) esp_camera_fb_return(stale);
    stale = esp_camera_fb_get();
    if (stale) esp_camera_fb_return(stale);
    Serial.printf("[SCAN] --- Lay anh moi thu %d ---\n", attempt);

    pinMode(4, OUTPUT);
    digitalWrite(4, HIGH);
    delay(600);  // Tăng từ 400ms lên 600ms để flash sáng lâu hơn

    camera_fb_t * fb = esp_camera_fb_get();

    digitalWrite(4, LOW);

    if (!fb) {
      Serial.println("[CAM] Loi: Khong the chup anh");
      delay(1000);
      continue;
    }

    Serial.printf("[CAM] Đã chụp ảnh: %d bytes (%dx%d)\n", fb->len, fb->width, fb->height);


    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[WIFI] Mất kết nối WiFi!");
      esp_camera_fb_return(fb);
      finalMessage = "WiFi disconnected";
      break;
    }

    HTTPClient http;
    String verifyUrl = "http://" + String(AI_SERVICE_IP) + ":" + String(AI_SERVICE_PORT) + "/face-verify";
    http.begin(verifyUrl);
    http.setTimeout(10000);
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("x-device-key", DEVICE_KEY);

    Serial.printf("[HTTP] POST đến AI-Service: %s\n", verifyUrl.c_str());
    int httpCode = http.POST(fb->buf, fb->len);
    esp_camera_fb_return(fb);


    if (httpCode == 200) {
      String response = http.getString();

      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, response);

      if (!error) {
        bool matched = doc["matched"] | false;
        String nameStr = doc["name"] | "Unknown";

        if (matched) {
          Serial.printf("[ACCESS] Nhan dien thanh cong: %s\n", nameStr.c_str());
          finalSuccess = true;
          finalName = nameStr;
          finalMessage = "Face ID verified successfully";
          http.end();
          break;
        } else {
          Serial.printf("[ACCESS] Tu choi truy cap: %s\n", nameStr.c_str());
          finalName = nameStr;
          
          if (nameStr == "No face detected" && attempt < max_retries) {
            Serial.println("[AI] Khong thay khuon mat, dang chup lai...");
            finalMessage = "No face detected, retrying...";
            continue;
          } else {
            Serial.println("[AI] Ket thuc luong quet.");
            finalMessage = "Face ID verification failed: " + nameStr;
            http.end();
            break;
          }
        }
      } else {
        Serial.printf("[JSON] Parse loi: %s\n", error.c_str());
        finalMessage = "JSON parse error";
      }
    } else {
      Serial.printf("[HTTP] Loi HTTP: %d\n", httpCode);
      finalMessage = "AI Service connection failed";
    }
    http.end();
  }

  // Report result to Backend
  Serial.println("\n[REPORT] Bao cao ket qua len Backend...");
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, String(BE_BASE_URL) + "/face-scan-result");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);
  http.setTimeout(5000);

  StaticJsonDocument<256> resultDoc;
  resultDoc["success"] = finalSuccess;
  resultDoc["name"] = finalName;
  resultDoc["message"] = finalMessage;

  String resultJson;
  serializeJson(resultDoc, resultJson);

  int reportCode = http.POST(resultJson);
  if (reportCode == 200) {
    Serial.printf("[REPORT] Thanh cong! Result: %s - %s\n", finalSuccess ? "SUCCESS" : "FAILED", finalName.c_str());
  } else {
    Serial.printf("[REPORT] Loi HTTP: %d\n", reportCode);
  }
  http.end();

  isProcessing = false;
  Serial.println("[SCAN] Ket thuc\n");
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32-CAM Face Verify - Smart Jewelry Vault ===");

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!initCamera()) {
    Serial.println("[ERROR] Camera init failed!");
    while (true) { 
      digitalWrite(FLASH_LED_PIN, HIGH); delay(100);
      digitalWrite(FLASH_LED_PIN, LOW);  delay(100);
    }
  }

  WiFiManagerParameter param_ai_ip("ai_ip", "AI-Service IP", AI_SERVICE_IP, 40);

  WiFiManager wm;
  wm.addParameter(&param_ai_ip);
  wm.setConfigPortalTimeout(120);

  prefs.begin("cam-cfg", false);
  prefs.remove("ai_ip"); 
  prefs.end();
  Serial.println("[CFG] Cache reset.");

  bool connected = wm.autoConnect("SmartVault_CAM");

  if (!connected) {
    Serial.println("[WIFI] Connection failed. Restarting...");
    ESP.restart();
  }

  String newIP = param_ai_ip.getValue();
  if (newIP.length() > 0 && newIP != String(AI_SERVICE_IP)) {
    newIP.toCharArray(AI_SERVICE_IP, sizeof(AI_SERVICE_IP));
    prefs.begin("cam-cfg", false);
    prefs.putString("ai_ip", newIP);
    prefs.end();
    Serial.printf("[CFG] Saved AI-Service IP: %s\n", AI_SERVICE_IP);
  }

  Serial.println();
  Serial.printf("[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.println("[INFO] Trigger GPIO13 to scan.");

  for (int i = 0; i < 3; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH); delay(200);
    digitalWrite(FLASH_LED_PIN, LOW);  delay(200);
  }
}

void loop() {
  unsigned long now = millis();

  if (!isProcessing && (now - lastPollTime >= POLL_INTERVAL)) {
    lastPollTime = now;
    
    Serial.print("[POLL] Checking BE... ");
    
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, String(BE_BASE_URL) + "/face-scan-status?t=" + String(now));
    http.addHeader("x-device-key", DEVICE_KEY);
    http.setTimeout(5000);
    
    int code = http.GET();
    if (code == 200) {
      String body = http.getString();
      StaticJsonDocument<128> doc;
      DeserializationError err = deserializeJson(doc, body);
      
      if (!err) {
        bool shouldScan = doc["shouldScan"] | false;
        Serial.printf("OK. shouldScan = %s\n", shouldScan ? "TRUE" : "FALSE");
        
        if (shouldScan) {
          Serial.println("[POLL] Yeu cau quet mat tu Web!");
          http.end();
          scanFaceAndUnlock();
          return;
        }
      } else {
        Serial.printf("JSON Lỗi: %s\n", err.c_str());
      }
    } else {
       Serial.printf("HTTP_GET_FAILED: %d\n", code);
    }
    http.end();
  }



  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Mất kết nối, đang kết nối lại...");
    WiFi.reconnect();
    delay(5000);
  }

  delay(50);
}

