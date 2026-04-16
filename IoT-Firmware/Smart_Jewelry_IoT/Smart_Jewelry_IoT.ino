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


String baseUrl = "https://hm-vault.zapto.org/api/security";
String deviceKey = "IoT_Secure_Vault_2024";

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

DHT dht(DHT_PIN, DHT11);
Servo lockServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
BlynkTimer timer;
TaskHandle_t AlarmTaskHandle = NULL;
TaskHandle_t NetworkTaskHandle = NULL;

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

#define API_INTERVAL 300   
#define BUZZER_SPEED 50
#define SPOTLIGHT_TIME 15000

void unlockDoor();
void checkAlertStatus();
void checkUnlockStatus();
void alarmTask(void *pvParameters);
void networkTask(void *pvParameters);
void sendSensorData();

BLYNK_WRITE(V0)
{
  int value = param.asInt();
  if (value == 1 && !isUnlocking)
  {
    Serial.println("[BLYNK] >> MO KHOA tu dien thoai!");
    unlockDoor();
    Blynk.virtualWrite(V0, 0);
  }
}

BLYNK_WRITE(V1)
{
  int value = param.asInt();
  if (value == 1)
  {
    Serial.println("[BLYNK] >> YEU CAU TAT COI...");
    isAlarm = false;
    isVibration = false;
    buzzerState = false;
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED_RED, LOW);
    lcd.clear();
    lastVibrationReset = millis();
    Blynk.virtualWrite(V1, 0);

    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, baseUrl + "/reset-alarm");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);
    int code = http.POST("{\"pin\":\"1234\"}"); 
    http.end();
  }
}

BLYNK_WRITE(V4)
{
  manualCooling = param.asInt();
  Serial.print("[BLYNK] >> Manual Cooling: ");
  Serial.println(manualCooling ? "ON" : "OFF");
}

BLYNK_WRITE(V6)
{
  manualSpotlight = param.asInt();
  Serial.print("[BLYNK] >> Manual Spotlight: ");
  Serial.println(manualSpotlight ? "ON" : "OFF");
}

void sendSensorData()
{
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  if (!isnan(temp) && !isnan(humi))
  {
    Serial.printf("[DHT] %.1fC | %.0f%%\n", temp, humi);
    Blynk.virtualWrite(V2, temp);
    Blynk.virtualWrite(V3, humi);

    Blynk.virtualWrite(V5, isDoorOpen ? 255 : 0);


    if (WiFi.status() == WL_CONNECTED)
    {
      WiFiClientSecure client;
      client.setInsecure();
      HTTPClient http;
      http.setTimeout(3000);
      http.begin(client, baseUrl + "/temp-log");
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-device-key", deviceKey);
      String body = "{\"temp\":" + String(temp, 1) + ",\"humi\":" + String(humi, 1) + "}";
      int code = http.POST(body);
      if (code > 0)
        Serial.printf("[TEMP-LOG] POST -> %d\n", code);
      else
        Serial.printf("[TEMP-LOG] POST FAIL: %d\n", code);
      http.end();
    }

    if (temp >= 28.0 || manualCooling)
    {
      digitalWrite(PELTIER_PIN, LOW);
    }
    else
    {
      digitalWrite(PELTIER_PIN, HIGH);
    }

    if (!isAlarm && !isVibration)
    {
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


void setup()
{
  Serial.begin(115200);
  Serial.println("\n=== SMART JEWELRY VAULT + BLYNK ===");

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

  lockServo.attach(SERVO_PIN);
  lockServo.write(0);
  delay(500);
  lockServo.detach();

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Jewelry");
  lcd.setCursor(0, 1);
  lcd.print("Dang ket noi...");

  Serial.println("[WIFI] Khoi tao WiFiManager...");
  digitalWrite(LED_YELLOW, HIGH);

  WiFiManager wm;
  bool res = wm.autoConnect("Smart_Jewelry_Vault");

  digitalWrite(LED_YELLOW, LOW);

  if (!res)
  {
    Serial.println("[WIFI] KET NOI THAT BAI! Khoi dong lai ESP...");
    digitalWrite(LED_RED, HIGH);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Loi WiFi!");
    lcd.setCursor(0, 1);
    lcd.print("Reset ESP...");
    delay(3000);
    ESP.restart();
  }
  else
  {
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

  timer.setInterval(5000L, sendSensorData);

  xTaskCreatePinnedToCore(
      alarmTask,
      "AlarmTask",
      2048,
      NULL,
      1,
      &AlarmTaskHandle,
      0);

  xTaskCreatePinnedToCore(
      networkTask,
      "NetworkTask",
      4096,
      NULL,
      1,
      &NetworkTaskHandle,
      0);
}

void alarmTask(void *pvParameters)
{
  for (;;)
  {
    if (isAlarm || isVibration)
    {
      buzzerState = !buzzerState;
      digitalWrite(BUZZER, buzzerState);
      digitalWrite(LED_RED, buzzerState);
      vTaskDelay(BUZZER_SPEED / portTICK_PERIOD_MS);
    }
    else
    {
      digitalWrite(BUZZER, LOW);
      digitalWrite(LED_RED, LOW);
      vTaskDelay(100 / portTICK_PERIOD_MS);
    }
  }
}

void networkTask(void *pvParameters)
{
  for (;;)
  {
    if (WiFi.status() == WL_CONNECTED)
    {
      checkAlertStatus();
      checkUnlockStatus();
    }
    else
    {
      WiFi.reconnect();
    }
    vTaskDelay(API_INTERVAL / portTICK_PERIOD_MS);
  }
}

void loop()
{
  Blynk.run();
  timer.run();

  unsigned long now = millis();

  isDoorOpen = (digitalRead(REED_PIN) == HIGH);

  if (digitalRead(PIR_PIN) == HIGH)
  {
    if (!motionDetected)
    {
      motionDetected = true;
      lastMotionTime = now;
      digitalWrite(LED_WHITE, HIGH);
      Serial.println("[PIR] Chuyen dong!");
    }
  }
  if (motionDetected && (now - lastMotionTime > SPOTLIGHT_TIME) && !manualSpotlight)
  {
    motionDetected = false;
    digitalWrite(LED_WHITE, LOW);
  }

  if (manualSpotlight)
    digitalWrite(LED_WHITE, HIGH);


  if (millis() - lastVibrationReset > 5000)
  {
    bool curVibPin = digitalRead(VIBRATION_PIN);
    if (curVibPin != lastVibPin) 
    {
      if (vibrationCount == 0)
        vibrationWindowStart = millis();
      vibrationCount++;
      lastVibPin = curVibPin;

      Serial.printf("[VIB-DEBUG] Transitions=%d Time=%lums\n", vibrationCount, millis() - vibrationWindowStart);

      if (vibrationCount >= 6 && (millis() - vibrationWindowStart < 500))
      {
        if (!isVibration)
        {
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


  if (isVibration && !isAlarm && (millis() - vibrationAlarmTime > 30000))
  {
    isVibration = false;
    buzzerState = false;
    digitalWrite(BUZZER, LOW);
    vibrationCount = 0;
    Serial.println("[VIB] Tu reset sau 30s.");
  }

  if (isAlarm != lastAlarm || isVibration != lastVibration)
  {
    lcd.clear();
    if (isAlarm)
    {
      lcd.setCursor(0, 0);
      lcd.print("!! CANH BAO !! ");
      lcd.setCursor(0, 1);
      lcd.print("XAM NHAP!      ");
    }
    else if (isVibration)
    {
      lcd.setCursor(0, 0);
      lcd.print("!! CANH BAO !! ");
      lcd.setCursor(0, 1);
      lcd.print("RUNG DONG!     ");
    }
    else
    {
      lcd.setCursor(0, 0);
      lcd.print("He thong: OK   ");
      lcd.setCursor(0, 1);
      lcd.print("An toan...     ");
    }
    lastAlarm = isAlarm;
    lastVibration = isVibration;
  }

  if (!isAlarm && !isVibration)
  {
    if (WiFi.status() == WL_CONNECTED)
    {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_YELLOW, LOW);
    }
    else
    {
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, HIGH);
    }
  }

  delay(10);
}

void checkAlertStatus()
{
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.setTimeout(1500);
  http.begin(client, baseUrl + "/alert-status?t=" + String(millis()));
  http.addHeader("x-device-key", deviceKey);
  int code = http.GET();
  if (code > 0)
  {
    String payload = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    bool newAlarm = doc["shouldAlert"] == true || doc["alert"] == true;
    if (newAlarm != isAlarm)
    {
      Serial.println(newAlarm ? "[STATE] >>> BAO DONG!" : "[STATE] >>> AN TOAN");
      if (!newAlarm)
        isVibration = false;
    }
    isAlarm = newAlarm;
  }
  http.end();
}

void checkUnlockStatus()
{
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.setTimeout(1500);
  http.begin(client, baseUrl + "/unlock-status?t=" + String(millis()));
  http.addHeader("x-device-key", deviceKey);
  int code = http.GET();
  if (code > 0)
  {
    String payload = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    bool shouldUnlock = doc["shouldUnlock"] == true;
    if (shouldUnlock && !isUnlocking)
    {
      unlockDoor();
    }
  }
  http.end();
}

void unlockDoor()
{
  if (isUnlocking)
    return;
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
  for (int i = 0; i < 10; i++)
  {
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