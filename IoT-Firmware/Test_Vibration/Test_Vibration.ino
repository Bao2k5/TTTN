#define VIBRATION_PIN 32 // Chân kết nối DO của SW-420
#define BUZZER_PIN    27 // Chân kết nối Loa Buzzer

void setup() {
  Serial.begin(115200);
  pinMode(VIBRATION_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("\n--- BÀI TEST 1: CẢM BIẾN RUNG SW-420 ---");
  Serial.println("Đang chờ phát hiện rung...");
  delay(1000);
}

void loop() {
  // Đọc trạng thái cảm biến (Tùy loại SW-420 có thể là HIGH hoặc LOW khi rung)
  // Thường SW-420 xuất mức HIGH (1) khi có rung động
  int vibrationState = digitalRead(VIBRATION_PIN);
  
  if (vibrationState == HIGH) {
    Serial.println("! >>> PHÁT HIỆN RUNG ĐỘNG! <<< !");
    
    // Kêu còi 3 tiếng tít tít tít
    for(int i=0; i<3; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN, LOW);
      delay(100);
    }
    
    // Chờ 1 giây để tránh bị spam log liên tục
    delay(1000); 
    Serial.println("Đang chờ phát hiện rung...");
  }
  
  // Trễ một chút để ổn định vòng lặp
  delay(50);
}
