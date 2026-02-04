/*
 * HM Jewelry Smart Security System - IoT Node (ESP32)
 * Connects to WiFi and Polls Backend Server for Intrusion Alerts.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- CẤU HÌNH WIFI ---
const char *ssid = "Nhatrashan-L2";     // Thay tên Wifi của bạn vào đây
const char *password = "Tiemtramatngu"; // Thay mật khẩu Wifi vào đây

// --- CẤU HÌNH SERVER ---
// LƯU Ý: Nếu dùng máy tính cá nhân làm Server (Localhost), bạn phải nhập IP tĩnh của máy tính
// Ví dụ: 192.168.1.5 (Xem bằng lệnh ipconfig)
String serverUrl = "http://10.50.1.182:3000/api/security/alert-status";

// --- CẤU HÌNH PHẦN CỨNG ---
#define LED_PIN 2    // Đèn báo hiệu (D2)
#define BUZZER_PIN 4 // Còi báo động (D4)

void setup()
{
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Kết nối WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    http.begin(serverUrl);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0)
    {
      String payload = http.getString();
      // Serial.println(payload); // Debug

      // Parse JSON
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error)
      {
        bool alert = doc["alert"]; // Lấy trạng thái báo động
        if (alert)
        {
          triggerAlarm();
        }
        else
        {
          stopAlarm();
        }
      }
      else
      {
        Serial.print("JSON Error: ");
        Serial.println(error.c_str());
      }
    }
    else
    {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
  else
  {
    Serial.println("WiFi Disconnected");
  }

  delay(1000); // Poll every 1 second
}

// Hàm Bật Báo Động (Còi kêu tít tít, Đèn chớp)
void triggerAlarm()
{
  Serial.println("!!! INTRUSION DETECTED !!!");
  digitalWrite(LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  delay(100);
}

// Hàm Tắt Báo Động
void stopAlarm()
{
  Serial.println("System Safe");
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}
