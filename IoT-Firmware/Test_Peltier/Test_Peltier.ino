#include <DHT.h>

#define DHTPIN        4     // Chân data của cảm biến nhiệt DHT11
#define DHTTYPE       DHT11 // Loại cảm biến
#define PELTIER_PIN   2     // Chân gắn vào IN2 của Relay (Điều khiển Sò lạnh)

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(PELTIER_PIN, OUTPUT);
  digitalWrite(PELTIER_PIN, LOW); // Mặc định tắt sò lạnh
  
  Serial.println("\n--- BÀI TEST 3: ĐIỀU HÒA NHIỆT ĐỘ TỰ ĐỘNG ---");
  Serial.println("1. Đọc nhiệt độ từ DHT11.");
  Serial.println("2. Nếu Nhiệt Độ >= 28.0 C -> BẬT RƠ LE ĐÓNG MẠCH PELTIER.");
  Serial.println("3. Nếu Nhiệt Độ < 28.0 C -> TẮT RƠ LE.");
  Serial.println("----------------------------------------------\n");
}

void loop() {
  delay(3000); // Check nhiệt độ mỗi 3 giây
  
  float temp = dht.readTemperature();
  
  if (isnan(temp)) {
    Serial.println("Lỗi: Không đọc được dữ liệu DHT11. Kiểm tra lại dây cáp!");
    return;
  }
  
  Serial.print("Nhiệt độ hiện tại trong Tủ: ");
  Serial.print(temp);
  Serial.println(" *C");
  
  if (temp >= 28.0) {
    Serial.println("   [!] CẢNH BÁO NÓNG! Kích hoạt máy làm mát Peltier (Relay CH2 = ON)");
    digitalWrite(PELTIER_PIN, HIGH);
  } else {
    Serial.println("   [v] Mát mẻ ổn định. Ngắt máy làm mát (Relay CH2 = OFF)");
    digitalWrite(PELTIER_PIN, LOW);
  }
}
