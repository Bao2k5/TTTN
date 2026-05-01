/*
 * Smart Jewelry Vault - ESP32 Firmware (HYBRID MODE)
 * Version: 3.0 - Optimized with Local LAN + Cloud Fallback
 * 
 * KIẾN TRÚC:
 * - Luồng 1 (Priority): Local LAN → AI Service (Độ trễ ~10-50ms)
 * - Luồng 2 (Fallback): Cloud → AWS EC2 (Độ trễ ~300-500ms)
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. ESP32 thử gọi AI Service qua LAN trước (nhanh)
 * 2. Nếu fail → Fallback sang Cloud (ổn định)
 * 3. Upload logs/temp vẫn lên Cloud (background)
 */

#define BLYNK_TEMPLATE_ID "TMPL6fHFvtffq"
#define BLYNK_TEMPLATE_NAME "Smart Jewelry Vault"
#define BLYNK_AUTH_TOKEN "MRDp9rUCHgg2Pb3Vbyyn0mhnksrrd22h"
#define BLYNK_PRINT Serial

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#include <BlynkSimpleEsp32.h>
#include <WiFiManager.h>

// ============ CONFIGURATION ============
// IP laptop chạy AI Service
String localAIUrl = "http://192.168.1.31:5001";  // ✅ Đã cấu hình cho laptop của bạn
String cloudUrl = "https://hm-vault.zapto.org/api/security";
String deviceKey = "IoT_Secure_Vault_2024";

// Mode selection
bool useLocalFirst = true;  // true = Ưu tiên Local, false = Chỉ dùng Cloud
bool localAvailable = false;  // Track local AI availability
unsigned long lastLocalCheck = 0;
unsigned long localCheckInterval = 10000;  // Check local health mỗi 10s

// ============ PIN DEFINITIONS ============
#define LED_RED 13
#define LED_YELLOW 12
#define LED_GREEN 14
#define LED_WHITE 25
#define BUZZER 27
#define SERVO_PIN 26
#define PIR_PIN 34
#define DHT_PIN 4
#define RELAY_PIN 33
#define PELTIER_PIN 19
#define REED_PIN 35
#define VIBRATION_PIN 32

// ============ OBJECTS ============
DHT dht(DHT_PIN, DHT11);
Servo lockServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
BlynkTimer timer;
TaskHandle_t AlarmTaskHandle = NULL;
TaskHandle_t NetworkTaskHandle = NULL;

// ============ STATE VARIABLES ============
bool isAlarm = false;
bool isDoorOpen = false;
bool motionDetected = false;
bool isUnlocking = false;
bool isVibration = false;
bool buzzerState = false;
bool manualCooling = false;
bool manualSpotlight = false;
bool lastAlarm = false;
bool lastVibration = false;
unsigned long lastDisplayUpdate = 0;
unsigned long lastApiCall = 0;
unsigned long lastBuzzerToggle = 0;
unsigned long lastMotionTime = 0;
unsigned long lastVibrationReset = 0;
int vibrationCount = 0;
unsigned long vibrationWindowStart = 0;
unsigned long vibrationAlarmTime = 0;
bool lastVibPin = HIGH;

// ============ TIMING CONSTANTS ============
#define API_INTERVAL 200   // Giảm từ 300ms → 200ms (nhanh hơn)
#define BUZZER_SPEED 50
#define SPOTLIGHT_TIME 15000

// ============ FUNCTION DECLARATIONS ============
void unlockDoor();
void checkAlertStatus();
void checkAlertStatusLocal();
void checkAlertStatusCloud();
void checkUnlockStatus();
void checkLocalAIHealth();
void alarmTask(void *pvParameters);
void networkTask(void *pvParameters);
void sendSensorData();

// ============ BLYNK HANDLERS ============
BLYNK_WRITE(V0) {
  int value = param.asInt();
  if (value == 1 && !isUnlocking) {
    Serial.println("[BLYNK] >> MO KHOA tu dien thoai!");
    unlockDoor();
    Blynk.virtualWrite(V0, 0);
  }
}

BLYNK_WRITE(V1) {
  int value = param.asInt();
  if (value == 1) {
    Serial.println("[BLYNK] >> YEU CAU TAT COI...");
    isAlarm = false;
    isVibration = false;
    buzzerState = false;
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED_RED, LOW);
    lcd.clear();
    lastVibrationReset = millis();
    Blynk.virtualWrite(V1, 0);

    // Reset alarm trên cloud
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, cloudUrl + "/reset-alarm");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);
    int code = http.POST("{\"pin\":\"1234\"}");
    http.end();
  }
}

BLYNK_WRITE(V4) {
  manualCooling = param.asInt();
  Serial.print("[BLYNK] >> Manual Cooling: ");
  Serial.println(manualCooling ? "ON" : "OFF");
}

BLYNK_WRITE(V6) {
  manualSpotlight = param.asInt();
  Serial.print("[BLYNK] >> Manual Spotlight: ");
  Serial.println(manualSpotlight ? "ON" : "OFF");
}

// ============ SENSOR DATA ============
void sendSensorData() {
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  if (!isnan(temp) && !isnan(humi)) {
    Serial.printf("[DHT] %.1fC | %.0f%%\n", temp, humi);
    Blynk.virtualWrite(V2, temp);
    Blynk.virtualWrite(V3, humi);
    Blynk.virtualWrite(V5, isDoorOpen ? 255 : 0);

    // Upload temp log lên cloud (background)
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClientSecure client;
      client.setInsecure();
      HTTPClient http;
      http.setTimeout(3000);
      http.begin(client, cloudUrl + "/temp-log");
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-device-key", deviceKey);
      String body = "{\"temp\":" + String(temp, 1) + ",\"humi\":" + String(humi, 1) + "}";
      int code = http.POST(body);
      http.end();
    }

    // Cooling control
    if (temp >= 28.0 || manualCooling) {
      digitalWrite(PELTIER_PIN, LOW);
    } else {
      digitalWrite(PELTIER_PIN, HIGH);
    }

    // LCD display
    if (!isAlarm && !isVibration) {
      lcd.setCursor(0, 0);
      lcd.print("T:");
      lcd.print(temp, 1);
      lcd.print("C H:");
      lcd.print(humi, 0);
      lcd.print("%   ");
      lcd.setCursor(0, 1);
      lcd.print(isDoorOpen ? "Cua: MO       " : "Cua: DONG  OK ");
    }
  }
}

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SMART JEWELRY VAULT (HYBRID MODE v3.0) ===");

  // Pin setup
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_WHITE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(PELTIER_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(REED_PIN, INPUT_PULLUP);
  pinMode(VIBRATION_PIN, INPUT_PULLUP);

  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_WHITE, LOW);
  digitalWrite(BUZZER, LOW);
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(PELTIER_PIN, HIGH);

  dht.begin();

  // Servo setup
  lockServo.attach(SERVO_PIN);
  lockServo.write(0);
  delay(500);
  lockServo.detach();

  // LCD setup
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Jewelry");
  lcd.setCursor(0, 1);
  lcd.print("Hybrid Mode...");

  // WiFi setup
  Serial.println("[WIFI] Khoi tao WiFiManager...");
  digitalWrite(LED_YELLOW, HIGH);

  WiFiManager wm;
  bool res = wm.autoConnect("Smart_Jewelry_Vault");

  digitalWrite(LED_YELLOW, LOW);

  if (!res) {
    Serial.println("[WIFI] KET NOI THAT BAI! Khoi dong lai ESP...");
    digitalWrite(LED_RED, HIGH);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Loi WiFi!");
    lcd.setCursor(0, 1);
    lcd.print("Reset ESP...");
    delay(3000);
    ESP.restart();
  } else {
    Serial.println("\n[WIFI] Da ket noi!");
    Serial.print("[WIFI] IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_GREEN, HIGH);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi OK");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());

    Blynk.config(BLYNK_AUTH_TOKEN);
    Blynk.connect();
  }

  delay(2000);

  // Check local AI availability
  checkLocalAIHealth();

  timer.setInterval(5000L, sendSensorData);

  // Create tasks
  xTaskCreatePinnedToCore(alarmTask, "AlarmTask", 2048, NULL, 1, &AlarmTaskHandle, 0);
  xTaskCreatePinnedToCore(networkTask, "NetworkTask", 4096, NULL, 1, &NetworkTaskHandle, 0);

  Serial.println("[SETUP] Hoan thanh! Che do: " + String(useLocalFirst ? "LOCAL-FIRST" : "CLOUD-ONLY"));
}

// ============ ALARM TASK ============
void alarmTask(void *pvParameters) {
  for (;;) {
    if (isAlarm || isVibration) {
      buzzerState = !buzzerState;
      digitalWrite(BUZZER, buzzerState);
      digitalWrite(LED_RED, buzzerState);
      vTaskDelay(BUZZER_SPEED / portTICK_PERIOD_MS);
    } else {
      digitalWrite(BUZZER, LOW);
      digitalWrite(LED_RED, LOW);
      vTaskDelay(100 / portTICK_PERIOD_MS);
    }
  }
}

// ============ NETWORK TASK ============
void networkTask(void *pvParameters) {
  for (;;) {
    if (WiFi.status() == WL_CONNECTED) {
      checkAlertStatus();  // Hybrid: Local first, then cloud
      checkUnlockStatus();
      
      // Check local AI health định kỳ
      if (millis() - lastLocalCheck > localCheckInterval) {
        checkLocalAIHealth();
        lastLocalCheck = millis();
      }
    } else {
      WiFi.reconnect();
    }
    vTaskDelay(API_INTERVAL / portTICK_PERIOD_MS);
  }
}

// ============ CHECK LOCAL AI HEALTH ============
void checkLocalAIHealth() {
  WiFiClient client;
  HTTPClient http;
  http.setTimeout(500);
  http.begin(client, localAIUrl + "/health");
  int code = http.GET();
  
  if (code == 200) {
    localAvailable = true;
    Serial.println("[HEALTH] Local AI: ONLINE ✅");
  } else {
    localAvailable = false;
    Serial.println("[HEALTH] Local AI: OFFLINE ❌ (Fallback to Cloud)");
  }
  http.end();
}

// ============ CHECK ALERT STATUS (HYBRID) ============
void checkAlertStatus() {
  bool alertChecked = false;
  
  // Try LOCAL first (nhanh)
  if (useLocalFirst && localAvailable) {
    alertChecked = checkAlertStatusLocal();
  }
  
  // Fallback to CLOUD nếu local fail
  if (!alertChecked) {
    checkAlertStatusCloud();
  }
}

// ============ CHECK ALERT STATUS LOCAL ============
bool checkAlertStatusLocal() {
  WiFiClient client;
  HTTPClient http;
  http.setTimeout(500);  // Timeout ngắn vì local nhanh
  http.begin(client, localAIUrl + "/local-alert-status");
  http.addHeader("x-device-key", deviceKey);
  
  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    bool newAlarm = doc["shouldAlert"] == true;
    
    if (newAlarm != isAlarm) {
      Serial.println(newAlarm ? "[LOCAL] >>> BAO DONG! ⚡" : "[LOCAL] >>> AN TOAN");
      if (!newAlarm) isVibration = false;
    }
    isAlarm = newAlarm;
    http.end();
    return true;  // Success
  }
  
  http.end();
  localAvailable = false;  // Mark as unavailable
  Serial.println("[LOCAL] FAIL → Fallback to Cloud");
  return false;  // Failed
}

// ============ CHECK ALERT STATUS CLOUD ============
void checkAlertStatusCloud() {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.setTimeout(1500);
  http.begin(client, cloudUrl + "/alert-status?t=" + String(millis()));
  http.addHeader("x-device-key", deviceKey);
  
  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    bool newAlarm = doc["shouldAlert"] == true || doc["alert"] == true;
    
    if (newAlarm != isAlarm) {
      Serial.println(newAlarm ? "[CLOUD] >>> BAO DONG!" : "[CLOUD] >>> AN TOAN");
      if (!newAlarm) isVibration = false;
    }
    isAlarm = newAlarm;
  }
  http.end();
}

// ============ CHECK UNLOCK STATUS ============
void checkUnlockStatus() {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.setTimeout(1500);
  http.begin(client, cloudUrl + "/unlock-status?t=" + String(millis()));
  http.addHeader("x-device-key", deviceKey);
  
  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    bool shouldUnlock = doc["shouldUnlock"] == true;
    if (shouldUnlock && !isUnlocking) {
      unlockDoor();
    }
  }
  http.end();
}

// ============ UNLOCK DOOR ============
void unlockDoor() {
  if (isUnlocking) return;
  isUnlocking = true;
  Serial.println("[LOCK] >> MO KHOA!");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("DA XAC THUC!");
  lcd.setCursor(0, 1);
  lcd.print("Mo khoa 5 giay");

  lockServo.attach(SERVO_PIN);
  lockServo.write(90);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_GREEN, LOW);
  for (int i = 0; i < 10; i++) {
    digitalWrite(LED_GREEN, !digitalRead(LED_GREEN));
    delay(500);
  }
  lockServo.write(0);
  digitalWrite(RELAY_PIN, HIGH);
  delay(500);
  lockServo.detach();
  Serial.println("[LOCK] >> DA DONG KHOA");
  digitalWrite(LED_GREEN, HIGH);
  lcd.clear();
  isUnlocking = false;
}

// ============ MAIN LOOP ============
void loop() {
  Blynk.run();
  timer.run();

  unsigned long now = millis();

  // Door sensor
  isDoorOpen = (digitalRead(REED_PIN) == HIGH);

  // PIR motion detection
  if (digitalRead(PIR_PIN) == HIGH) {
    if (!motionDetected) {
      motionDetected = true;
      lastMotionTime = now;
      digitalWrite(LED_WHITE, HIGH);
      Serial.println("[PIR] Chuyen dong!");
    }
  }
  if (motionDetected && (now - lastMotionTime > SPOTLIGHT_TIME) && !manualSpotlight) {
    motionDetected = false;
    digitalWrite(LED_WHITE, LOW);
  }
  if (manualSpotlight) digitalWrite(LED_WHITE, HIGH);

  // Vibration detection
  if (millis() - lastVibrationReset > 5000) {
    bool curVibPin = digitalRead(VIBRATION_PIN);
    if (curVibPin != lastVibPin) {
      if (vibrationCount == 0) vibrationWindowStart = millis();
      vibrationCount++;
      lastVibPin = curVibPin;

      if (vibrationCount >= 6 && (millis() - vibrationWindowStart < 500)) {
        if (!isVibration) {
          isVibration = true;
          vibrationAlarmTime = millis();
          lastVibrationReset = millis();
          vibrationCount = 0;
          Serial.println("[VIB] BAO DONG! Rung manh phat hien!");
        }
      }
    }
    if (vibrationCount > 0 && (millis() - vibrationWindowStart >= 600))
      vibrationCount = 0;
  }

  // Auto-reset vibration alarm
  if (isVibration && !isAlarm && (millis() - vibrationAlarmTime > 30000)) {
    isVibration = false;
    buzzerState = false;
    digitalWrite(BUZZER, LOW);
    vibrationCount = 0;
    Serial.println("[VIB] Tu reset sau 30s.");
  }

  // LCD update
  if (isAlarm != lastAlarm || isVibration != lastVibration) {
    lcd.clear();
    if (isAlarm) {
      lcd.setCursor(0, 0);
      lcd.print("!! CANH BAO !! ");
      lcd.setCursor(0, 1);
      lcd.print("XAM NHAP!      ");
    } else if (isVibration) {
      lcd.setCursor(0, 0);
      lcd.print("!! CANH BAO !! ");
      lcd.setCursor(0, 1);
      lcd.print("RUNG DONG!     ");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("He thong: OK   ");
      lcd.setCursor(0, 1);
      lcd.print("An toan...     ");
    }
    lastAlarm = isAlarm;
    lastVibration = isVibration;
  }

  // Status LED
  if (!isAlarm && !isVibration) {
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_YELLOW, LOW);
    } else {
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, HIGH);
    }
  }

  delay(10);
}
