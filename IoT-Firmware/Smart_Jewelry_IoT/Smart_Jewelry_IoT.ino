// =====================================================================
// SMART JEWELRY VAULT - FIRMWARE HOAN CHINH
// Tich hop: WiFi, API, LED x4, Buzzer, Servo, PIR, DHT11, Relay, LCD
// =====================================================================
// LOGIC HE THONG:
// 1. Khoi dong -> LCD hien "Smart Jewelry" -> Ket noi WiFi (den vang nhay)
// 2. WiFi OK -> Den xanh sang -> LCD hien nhiet do/do am + trang thai cua
// 3. PIR phat hien chuyen dong -> Bat den trang (spotlight) cho camera
// 4. API bao dong (shouldAlert=true) -> Coi hu + den do nhay + den trang bat
// 5. API mo khoa (shouldUnlock=true) -> Servo quay 90do + Relay dong -> 5s -> Khoa lai
// 6. Reed Switch -> Hien thi trang thai cua tren LCD
// =====================================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>

// --- WIFI ---
const char *ssid = "Quan Le";
const char *password = "0386291654";

// --- API ---
String alertUrl = "https://hm-jewelry-api.onrender.com/api/security/alert-status";
String unlockUrl = "https://hm-jewelry-api.onrender.com/api/security/unlock-status";

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

// --- TRANG THAI ---
bool isAlarm = false;
bool isDoorOpen = false;
bool motionDetected = false;
bool buzzerState = false;
unsigned long lastApiCall = 0;
unsigned long lastDHTRead = 0;
unsigned long lastBuzzerToggle = 0;
unsigned long lastMotionTime = 0;

// --- THOI GIAN ---
#define API_INTERVAL   3000   // Poll API moi 3 giay
#define DHT_INTERVAL   5000   // Doc nhiet do moi 5 giay
#define BUZZER_SPEED   50     // Toc do nhay coi (ms)
#define SPOTLIGHT_TIME 15000  // Den trang sang 15 giay sau khi phat hien chuyen dong
#define UNLOCK_TIME    5000   // Khoa mo 5 giay

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SMART JEWELRY VAULT ===");

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

  // --- WIFI ---
  Serial.print("[WIFI] Connecting...");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_YELLOW, !digitalRead(LED_YELLOW));
    attempts++;
  }
  digitalWrite(LED_YELLOW, LOW);

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Da ket noi!");
    Serial.print("[WIFI] IP: ");
    Serial.println(WiFi.localIP());
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi OK!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());
    digitalWrite(LED_GREEN, HIGH);
    delay(2000);
  } else {
    Serial.println("\n[WIFI] KHONG THE KET NOI!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi THAT BAI!");
    digitalWrite(LED_YELLOW, HIGH);
  }
}

void loop() {
  unsigned long now = millis();

  // ========== 1. DOC CAM BIEN ==========

  // Reed Switch: Trang thai cua
  isDoorOpen = (digitalRead(REED_PIN) == HIGH);

  // PIR: Phat hien chuyen dong
  if (digitalRead(PIR_PIN) == HIGH) {
    if (!motionDetected) {
      motionDetected = true;
      lastMotionTime = now;
      Serial.println("[PIR] Phat hien chuyen dong!");
    }
  }
  // Tat spotlight sau 15 giay khong co chuyen dong
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
      // Thu ket noi lai
      Serial.println("[WIFI] Mat ket noi, thu lai...");
      WiFi.begin(ssid, password);
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, HIGH);
    }
  }

  // ========== 3. XU LY BAO DONG ==========
  if (isAlarm) {
    // --- CHE DO BAO DONG ---
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_WHITE, HIGH); // Bat spotlight
    // Nhay coi + den do
    if (now - lastBuzzerToggle >= BUZZER_SPEED) {
      lastBuzzerToggle = now;
      buzzerState = !buzzerState;
      digitalWrite(BUZZER, buzzerState);
      digitalWrite(LED_RED, buzzerState);
    }
    // LCD hien canh bao
    lcd.setCursor(0, 0);
    lcd.print("!! CANH BAO !! ");
    lcd.setCursor(0, 1);
    lcd.print("XAM NHAP!      ");
  } else {
    // --- CHE DO AN TOAN ---
    if (buzzerState) {
      buzzerState = false;
      digitalWrite(BUZZER, LOW);
      digitalWrite(LED_RED, LOW);
    }
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_YELLOW, LOW);
    }

    // Spotlight theo PIR (chi khi khong bao dong)
    if (motionDetected) {
      digitalWrite(LED_WHITE, HIGH);
    } else {
      digitalWrite(LED_WHITE, LOW);
    }
  }

  // ========== 4. DOC NHIET DO MOI 5 GIAY ==========
  if (now - lastDHTRead >= DHT_INTERVAL) {
    lastDHTRead = now;
    float temp = dht.readTemperature();
    float humi = dht.readHumidity();
    if (!isnan(temp) && !isnan(humi)) {
      Serial.printf("[DHT] %.1fC | %.0f%%\n", temp, humi);
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
    if (shouldUnlock) {
      unlockDoor();
    }
  }
  http.end();
}

// ========== HAM MO KHOA ==========
void unlockDoor() {
  Serial.println("[LOCK] >> MO KHOA!");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("DA XAC THUC!");
  lcd.setCursor(0, 1);
  lcd.print("Mo khoa 5 giay");

  // Mo servo + relay
  lockServo.attach(SERVO_PIN);
  lockServo.write(90);
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(LED_GREEN, LOW);
  // Nhay den xanh bao hieu
  for (int i = 0; i < 10; i++) {
    digitalWrite(LED_GREEN, !digitalRead(LED_GREEN));
    delay(500);
  }
  // Dong lai
  lockServo.write(0);
  digitalWrite(RELAY_PIN, LOW);
  delay(500);
  lockServo.detach();
  Serial.println("[LOCK] >> DA DONG KHOA");
  digitalWrite(LED_GREEN, HIGH);
  lcd.clear();
}