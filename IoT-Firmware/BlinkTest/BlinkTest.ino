/*
  Blink Test for ESP32
  Turns an LED on for one second, then off for one second, repeatedly.
  Most ESP32 boards have a built-in LED on GPIO 2.
*/

#define LED_PIN 2 // Built-in LED on most ESP32 DevKits

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("ESP32 Blink Test Started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // Turn the LED on
  Serial.println("LED ON");
  delay(1000);                  // Wait for a second
  digitalWrite(LED_PIN, LOW);   // Turn the LED off
  Serial.println("LED OFF");
  delay(1000);                  // Wait for a second
}
