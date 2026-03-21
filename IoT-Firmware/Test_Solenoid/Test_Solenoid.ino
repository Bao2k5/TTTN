#include <ESP32Servo.h>

#define SOLENOID_PIN  33  // Chân điều khiển Relay (Solenoid)
#define SERVO_PIN     26  // Chân điều khiển Servo

Servo lockServo;

void setup() {
  Serial.begin(115200);
  
  // Thiết lập Solenoid
  pinMode(SOLENOID_PIN, OUTPUT);
  digitalWrite(SOLENOID_PIN, HIGH); // Mặc định Đóng khóa Solenoid (HIGH = Tắt relay)

  // Thiết lập Servo
  lockServo.attach(SERVO_PIN);
  lockServo.write(0); // Đóng khóa Servo (Góc 0 độ)

  Serial.println("\n--- BÀI TEST 2: KÍCH HOẠT KHÓA KÉP (SOLENOID + SERVO) ---");
  Serial.println("Gõ phím '1' + Enter: MỞ TOÀN BỘ KHÓA.");
  Serial.println("Gõ phím '0' + Enter: ĐÓNG TOÀN BỘ KHÓA.");
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    
    if (cmd == '1') {
      Serial.println("\n>>> MỞ KHÓA KÉP...");
      digitalWrite(SOLENOID_PIN, LOW); // Kích Relay CH1 (LOW = Bật relay)
      lockServo.write(90);              // Quay Servo 90 độ
      Serial.println("Trạng thái: ĐÃ MỞ (Relay Bật, Servo 90o)");
    } 
    else if (cmd == '0') {
      Serial.println("\n>>> ĐÓNG KHÓA KÉP...");
      digitalWrite(SOLENOID_PIN, HIGH);  // Ngắt Relay CH1 (HIGH = Tắt relay)
      lockServo.write(0);               // Quay Servo về 0 độ
      Serial.println("Trạng thái: ĐÃ ĐÓNG (Relay Tắt, Servo 0o)");
    }
  }
}
