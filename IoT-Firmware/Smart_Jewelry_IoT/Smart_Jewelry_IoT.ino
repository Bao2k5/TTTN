// =====================================================================
// SMART JEWELRY VAULT - FIRMWARE HOAN CHINH + BLYNK
// Tich hop: WiFi, API, Blynk, LED x4, Buzzer, Servo, PIR, DHT11, Relay, LCD
// =====================================================================

// --- BLYNK (PHAI DAT TRUOC MOI INCLUDE) ---
#define BLYNK_TEMPLATE_ID "TMPL6fHFvtffq"
#define BLYNK_TEMPLATE_NAME "Smart Jewelry Vault"
#define BLYNK_AUTH_TOKEN "MRDp9rUCHgg2Pb3Vbyyn0mhnksrrd22h"
#define BLYNK_PRINT Serial

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#include <BlynkSimpleEsp32.h>

// --- WIFI ---
const char *ssid = "Quan Le";
const char *password = "0386291654";

// --- API ---
String alertUrl = "https://hm-jewelry-api.onrender.com/api/security/alert-status";
String unlockUrl = "https://hm-jewelry-api.onrender.com/api/security/unlock-status";
String resetUrl = "https://hm-jewelry-api.onrender.com/api/security/reset-alarm";

// --- CHAN CAM ---
#define LED_RED    13
#define LED_YELLOW 12
#define LED_GREEN  14
#define LED_WHITE  25
#define BUZZER     27
#define SERVO_PIN  26
#define PIR_PIN    34
#define DHT_PIN    4
#define RELAY_PIN  33
#define REED_PIN   35

// --- KHOI TAO ---
DHT dht(DHT_PIN, DHT11);
Servo lockServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
BlynkTimer timer;
TaskHandle_t AlarmTaskHandle = NULL;

// --- TRANG THAI ---
bool isAlarm = false;
bool isDoorOpen = false;
bool motionDetected = false;
bool isUnlocking = false;
bool buzzerState = false;
unsigned long lastApiCall = 0;
unsigned long lastBuzzerToggle = 0;
unsigned long lastMotionTime = 0;

// --- THOI GIAN ---
#define API_INTERVAL   3000
#define BUZZER_SPEED   50
#define SPOTLIGHT_TIME 15000

// ========== BLYNK: Nut MO KHOA tu dien thoai (V0) ==========
BLYNK_WRITE(V0) {
  int value = param.asInt();
  if (value == 1 && !isUnlocking) {
    Serial.println("[BLYNK] >> MO KHOA tu dien thoai!");
    unlockDoor();
    // Reset nut ve 0 sau khi mo
    Blynk.virtualWrite(V0, 0);
  }
}

// ========== BLYNK: Nut TAT COI tu dien thoai (V1) ==========
BLYNK_WRITE(V1) {
  int value = param.asInt();
  if (value == 1) {
    Serial.println("[BLYNK] >> DANG TAT COI VA RESET SERVER...");
    
    // 1. Goi API Reset Alarm tren Server
    HTTPClient http;
    http.begin(resetUrl);
    int code = http.POST("{}"); // Gui body rong
    if (code > 0) {
      Serial.println("[API] Da reset bao dong tren Server!");
    }
    http.end();

    // 2. Tat cuc bo tren ESP32
    isAlarm = false;
    buzzerState = false;
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED_RED, LOW);
    lcd.clear();
    
    // 3. Reset nut tren App ve 0
    Blynk.virtualWrite(V1, 0);
  }
}

// ========== GUI NHIET DO/DO AM LEN BLYNK MOI 5 GIAY ==========
void sendSensorData() {
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  if (!isnan(temp) && !isnan(humi)) {
    Serial.printf("[DHT] %.1fC | %.0f%%\n", temp, humi);
    // Gui len Blynk
    Blynk.virtualWrite(V2, temp);
    Blynk.virtualWrite(V3, humi);
    // Cap nhat LCD (chi khi khong bao dong)
    if (!isAlarm) {
      lcd.setCursor(0, 0);
      lcd.print("T:");
      lcd.print(temp, 1);
      lcd.print("C H:");
      lcd.print(humi, 0);
      lcd.print("%   ");
      lcd.setCursor(0, 1);
      if (isDoorOpen) {
        lcd.print("Cua: MO       ");
      } else {
        lcd.print("Cua: DONG  OK ");
      }
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SMART JEWELRY VAULT + BLYNK ===");

  // --- GPIO ---
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_WHITE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(REED_PIN, INPUT_PULLUP);

  // Tat het
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_WHITE, LOW);
  digitalWrite(BUZZER, LOW);
  digitalWrite(RELAY_PIN, LOW);

  // --- DHT ---
  dht.begin();

  // --- SERVO: Khoa cua ---
  lockServo.attach(SERVO_PIN);
  lockServo.write(0);
  delay(500);
  lockServo.detach();

  // --- LCD ---
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Jewelry");
  lcd.setCursor(0, 1);
  lcd.print("Dang ket noi...");

  // --- BLYNK + WIFI (Blynk.begin tu dong ket noi WiFi) ---
  Serial.println("[BLYNK] Connecting...");
  digitalWrite(LED_YELLOW, HIGH);
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, password);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_GREEN, HIGH);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi + Blynk OK");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP().toString());
  Serial.println("[BLYNK] Da ket noi!");
  Serial.print("[WIFI] IP: ");
  Serial.println(WiFi.localIP());
  delay(2000);

  // --- BLYNK TIMER: Gui nhiet do moi 5 giay ---
  timer.setInterval(5000L, sendSensorData);

  // --- FREERTOS: Create Alarm Task (Core 0) ---
  xTaskCreatePinnedToCore(
    alarmTask,
    "AlarmTask",
    2048,
    NULL,
    1,
    &AlarmTaskHandle,
    0
  );
}

// ========== TASK RIENG CHO BAO DONG (CHAY SONG SONG) ==========
void alarmTask(void * pvParameters) {
  for(;;) {
    if (isAlarm) {
      buzzerState = !buzzerState;
      digitalWrite(BUZZER, buzzerState);
      digitalWrite(LED_RED, buzzerState);
      vTaskDelay(BUZZER_SPEED / portTICK_PERIOD_MS);
    } else {
      digitalWrite(BUZZER, LOW);
      digitalWrite(LED_RED, LOW);
      vTaskDelay(100 / portTICK_PERIOD_MS); // Cho 100ms roi check lai
    }
  }
}

void loop() {
  Blynk.run();
  timer.run();

  unsigned long now = millis();

  // ========== 1. DOC CAM BIEN ==========
  isDoorOpen = (digitalRead(REED_PIN) == HIGH);

  // PIR: Phat hien chuyen dong
  if (digitalRead(PIR_PIN) == HIGH) {
    if (!motionDetected) {
      motionDetected = true;
      lastMotionTime = now;
      Serial.println("[PIR] Phat hien chuyen dong!");
    }
  }
  if (motionDetected && (now - lastMotionTime > SPOTLIGHT_TIME)) {
    motionDetected = false;
  }

  // ========== 2. POLL API MOI 3 GIAY ==========
  if (now - lastApiCall >= API_INTERVAL) {
    lastApiCall = now;
    if (WiFi.status() == WL_CONNECTED) {
      checkAlertStatus();
      checkUnlockStatus();
    } else {
      Serial.println("[WIFI] Mat ket noi, thu lai...");
      WiFi.begin(ssid, password);
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, HIGH);
    }
  }

  // ========== 3. XU LY BAO DONG (Logic hien thi) ==========
  if (isAlarm) {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_WHITE, HIGH);
    // LCD hien canh bao
    lcd.setCursor(0, 0);
    lcd.print("!! CANH BAO !! ");
    lcd.setCursor(0, 1);
    lcd.print("XAM NHAP!      ");
  } else {
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_YELLOW, LOW);
    }
    if (motionDetected) {
      digitalWrite(LED_WHITE, HIGH);
    } else {
      digitalWrite(LED_WHITE, LOW);
    }
  }
}

// ========== HAM KIEM TRA BAO DONG ==========
void checkAlertStatus() {
  HTTPClient http;
  http.setTimeout(3000);
  http.begin(alertUrl);
  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    Serial.print("[API] Alert: ");
    Serial.println(payload);
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    bool newAlarm = doc["shouldAlert"] == true;
    if (newAlarm != isAlarm) {
      Serial.println(newAlarm ? "[STATE] >>> BAO DONG!" : "[STATE] >>> AN TOAN");
    }
    isAlarm = newAlarm;
  } else {
    Serial.printf("[API] Loi HTTP: %d\n", code);
  }
  http.end();
}

// ========== HAM KIEM TRA MO KHOA ==========
void checkUnlockStatus() {
  HTTPClient http;
  http.setTimeout(3000);
  http.begin(unlockUrl);
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

// ========== HAM MO KHOA ==========
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
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(LED_GREEN, LOW);
  for (int i = 0; i < 10; i++) {
    digitalWrite(LED_GREEN, !digitalRead(LED_GREEN));
    delay(500);
  }
  lockServo.write(0);
  digitalWrite(RELAY_PIN, LOW);
  delay(500);
  lockServo.detach();
  Serial.println("[LOCK] >> DA DONG KHOA");
  digitalWrite(LED_GREEN, HIGH);
  lcd.clear();
  isUnlocking = false;
}