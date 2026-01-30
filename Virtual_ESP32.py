import requests
import time
import tkinter as tk
from tkinter import font
import threading
import winsound  # Win only

# CẤU HÌNH
API_URL = "http://localhost:3000/api/security/alert-status"
POLL_INTERVAL = 0.5  # Giây - Giam xuong 0.5s de phan hoi nhanh hon

class VirtualIoTDevice:
    def __init__(self, root):
        self.root = root
        self.root.title("VIRTUAL IOT DEVICE (ESP32 SIMULATOR)")
        self.root.geometry("400x300")
        self.root.configure(bg="#2c3e50")
        
        self.is_alarm_active = False
        self.status = "SAFE"
        
        # UI
        self.lbl_title = tk.Label(root, text="ESP32 SIMULATOR", font=("Arial", 16, "bold"), bg="#2c3e50", fg="white")
        self.lbl_title.pack(pady=20)
        
        self.lbl_status = tk.Label(root, text="SYSTEM SAFE", font=("Arial", 24, "bold"), bg="#2c3e50", fg="#2ecc71")
        self.lbl_status.pack(expand=True)
        
        self.lbl_info = tk.Label(root, text="Status: Connected to Server", bg="#2c3e50", fg="#95a5a6")
        self.lbl_info.pack(side=tk.BOTTOM, pady=10)
        
        # Start Worker
        threading.Thread(target=self.poll_server, daemon=True).start()
        
    def poll_server(self):
        while True:
            try:
                # 1. Gọi API như ESP32 thật
                response = requests.get(API_URL)
                if response.status_code == 200:
                    data = response.json()
                    # Cấu trúc JSON trả về: { "status": "ALARM" } hoặc { "status": "SAFE" } giả định
                    # Nhưng theo code Backend bạn gửi trước đó, API trả về trạng thái
                    
                    # Logic kiểm tra báo động từ Server
                    # Backend trả về "shouldAlert": true/false
                    if data.get("shouldAlert") == True or data.get("status") == "ALARM":
                        self.trigger_alarm()
                    else:
                        self.stop_alarm()
                else:
                    self.lbl_info.config(text="Status: Server Error")
            except Exception as e:
                self.lbl_info.config(text="Status: Disconnected")
                # print(e)
            
            time.sleep(POLL_INTERVAL)

    def trigger_alarm(self):
        if self.status != "ALARM":
            self.status = "ALARM"
            self.root.configure(bg="#c0392b") # Đỏ
            self.lbl_title.configure(bg="#c0392b")
            self.lbl_status.configure(text="!!! INTRUSION !!!", bg="#c0392b", fg="white")
            self.lbl_info.configure(bg="#c0392b", text="ACTION: SIREN ON | LED BLINK")
            # Hú còi (Win Sound)
            self.beep_loop()

    def stop_alarm(self):
        if self.status != "SAFE":
            self.status = "SAFE"
            self.root.configure(bg="#2c3e50") # Xanh
            self.lbl_title.configure(bg="#2c3e50")
            self.lbl_status.configure(text="SYSTEM SAFE", bg="#2c3e50", fg="#2ecc71")
            self.lbl_info.configure(bg="#2c3e50", text="Status: Monitoring...")

    def beep_loop(self):
        def run():
            # Kêu liên tục cho đến khi tắt alarm
            while self.status == "ALARM":
                winsound.Beep(1000, 300)  # Tần số 1000Hz, 300ms
                time.sleep(0.2)  # Nghỉ 200ms giữa các tiếng bíp
        threading.Thread(target=run, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = VirtualIoTDevice(root)
    root.mainloop()
