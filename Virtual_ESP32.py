import requests
import time
import tkinter as tk
import threading
import winsound

# CẤU HÌNHpython Virtual_ESP32.py
API_URL = "https://hm-jewelry-api.onrender.com/api/security/alert-status"
POLL_INTERVAL = 2.0

class VirtualIoTDevice:
    def __init__(self, root):
        self.root = root
        self.root.title("VIRTUAL IOT DEVICE (ESP32 SIMULATOR)")
        self.root.geometry("400x300")
        self.root.configure(bg="#2c3e50")
        
        self.is_alarm_active = False
        self.status = "SAFE"
        
        self.lbl_title = tk.Label(root, text="ESP32 SIMULATOR", font=("Arial", 16, "bold"), bg="#2c3e50", fg="white")
        self.lbl_title.pack(pady=20)
        
        self.lbl_status = tk.Label(root, text="CONNECTING...", font=("Arial", 24, "bold"), bg="#2c3e50", fg="#f39c12")
        self.lbl_status.pack(expand=True)
        
        self.lbl_info = tk.Label(root, text="Dang ket noi den Server...", bg="#2c3e50", fg="#95a5a6")
        self.lbl_info.pack(side=tk.BOTTOM, pady=10)
        
        threading.Thread(target=self.poll_server, daemon=True).start()
        
    def poll_server(self):
        first_connect = True
        while True:
            try:
                response = requests.get(API_URL, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if first_connect:
                        first_connect = False
                        self.root.after(0, lambda: self.lbl_info.config(text="Da ket noi thanh cong!"))
                    if data.get("shouldAlert") == True or data.get("status") == "ALARM":
                        self.trigger_alarm()
                    else:
                        self.stop_alarm()
                else:
                    self.root.after(0, lambda: self.lbl_info.config(text=f"Loi Server: {response.status_code}"))
            except requests.exceptions.Timeout:
                self.root.after(0, lambda: self.lbl_info.config(text="Timeout - Server cham"))
            except requests.exceptions.ConnectionError:
                self.root.after(0, lambda: self.lbl_info.config(text="Khong ket noi duoc Server"))
            except Exception as e:
                self.root.after(0, lambda: self.lbl_info.config(text=f"Loi: {str(e)[:30]}"))
            time.sleep(POLL_INTERVAL)

    def trigger_alarm(self):
        if self.status != "ALARM":
            self.status = "ALARM"
            self.root.configure(bg="#c0392b")
            self.lbl_title.configure(bg="#c0392b")
            self.lbl_status.configure(text="!!! INTRUSION !!!", bg="#c0392b", fg="white")
            self.lbl_info.configure(bg="#c0392b", text="ACTION: SIREN ON | LED BLINK")
            self.beep_loop()

    def stop_alarm(self):
        if self.status != "SAFE":
            self.status = "SAFE"
            self.root.configure(bg="#2c3e50")
            self.lbl_title.configure(bg="#2c3e50")
            self.lbl_status.configure(text="SYSTEM SAFE", bg="#2c3e50", fg="#2ecc71")
            self.lbl_info.configure(bg="#2c3e50", text="Status: Monitoring...")

    def beep_loop(self):
        def run():
            while self.status == "ALARM":
                winsound.Beep(1000, 300)
                time.sleep(0.2)
        threading.Thread(target=run, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = VirtualIoTDevice(root)
    root.mainloop()
