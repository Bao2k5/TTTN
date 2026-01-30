import os
import cv2
import threading
import queue
import time
import requests
import datetime
import numpy as np
import tkinter as tk
from tkinter import messagebox, simpledialog
from PIL import Image, ImageTk
from ultralytics import YOLO
import torch
from facenet_pytorch import InceptionResnetV1
from pymongo import MongoClient
from bson.binary import Binary
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Tắt cảnh báo OneDNN của TensorFlow
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

API_URL = "http://localhost:3000/api/security/log"

class FaceRecognitionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NCKH: Hybrid Cloud - Edge AI Face System")
        self.root.geometry("1280x800")
        self.root.configure(bg='#2c3e50')

        # 1. Khởi tạo Models (Edge AI)
        # Sử dụng YOLOv8-face để detect khuôn mặt cực nhanh
        print("Đang tải mô hình YOLOv8 & FaceNet...")
        self.detector = YOLO('yolov8n.pt')
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)

        # 2. Cấu hình Database & Local Storage
        self.mongo_uri = "mongodb://localhost:27017/"
        self.db_name = "face_recognition"
        self.setup_mongodb()
        
        self.knn_model_file = "edge_knn_model.pkl"
        self.label_encoder_file = "edge_label_encoder.pkl"
        self.embeddings = {}
        self.classifier = None
        self.encoder = None
        
        # Debounce logs (Tránh spam server)
        self.last_log_time = {} 

        # 3. Quản lý Luồng (Threading)
        self.frame_queue = queue.Queue(maxsize=1)
        self.result_queue = queue.Queue(maxsize=1)
        self.is_running = False
        
        self.load_known_faces()
        self.setup_ui()

    def setup_mongodb(self):
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client[self.db_name]
            self.collection = self.db['embeddings']
            print("Đã kết nối MongoDB thành công.")
        except Exception as e:
            print(f"Lỗi kết nối MongoDB: {e}")
            messagebox.showerror("Database Error", "Không thể kết nối MongoDB!")

    def setup_ui(self):
        # Layout chính (Sidebar + Main Display)
        self.side_bar = tk.Frame(self.root, bg='#34495e', width=250)
        self.side_bar.pack(side=tk.LEFT, fill=tk.Y)

        self.display_frame = tk.Frame(self.root, bg='#ecf0f1')
        self.display_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # Buttons
        btn_style = {'font': ('Arial', 11, 'bold'), 'bg': '#3498db', 'fg': 'white', 'pady': 10, 'width': 20}
        tk.Button(self.side_bar, text="START CAMERA", command=self.start_system, **btn_style).pack(pady=20)
        tk.Button(self.side_bar, text="STOP CAMERA", command=self.stop_system, **btn_style).pack(pady=5)
        tk.Button(self.side_bar, text="REGISTER NEW USER", command=self.register_user, **btn_style).pack(pady=5)
        
        # Display Area
        self.video_label = tk.Label(self.display_frame, bg='black')
        self.video_label.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

    def load_known_faces(self):
        """Tải dữ liệu từ MongoDB và train KNN tại biên (Edge)"""
        if self.collection is None: return
        docs = list(self.collection.find({}))
        X, y = [], []
        for doc in docs:
            name = doc['name']
            emb_arr = np.load(__import__('io').BytesIO(doc['embeddings']))
            for vec in emb_arr:
                X.append(vec)
                y.append(name)
        
        if len(X) > 0:
            self.encoder = LabelEncoder()
            y_encoded = self.encoder.fit_transform(y)
            self.classifier = KNeighborsClassifier(n_neighbors=min(5, len(set(y))), metric='euclidean')
            self.classifier.fit(X, y_encoded)
            print(f"Hệ thống đã sẵn sàng với {len(set(y))} người dùng.")

    # --- CORE AI LOGIC ---
    def video_worker(self):
        """Luồng chạy AI tách biệt hoàn toàn với UI"""
        cap = cv2.VideoCapture(0)
        while self.is_running:
            ret, frame = cap.read()
            if not ret: break

            # 1. Detection bằng YOLOv8
            results = self.detector(frame, verbose=False)[0]
            
            # 2. Xử lý từng khuôn mặt tìm được
            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                face_crop = frame[y1:y2, x1:x2]
                
                if face_crop.size > 0:
                    name = self.identify_face(face_crop)
                    color = (0, 255, 0) if "Unknown" not in name else (0, 0, 255)
                    
                    # Vẽ lên frame
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, name, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                    # Gửi cảnh báo (Log)
                    self.process_alert(name)

            # Đưa frame đã xử lý vào queue để UI hiển thị
            if not self.result_queue.full():
                self.result_queue.put(frame)
        
        cap.release()

    def identify_face(self, face_img):
        """Trích xuất embedding và so sánh KNN"""
        try:
            emb = self.get_embedding(face_img)
            if self.classifier and self.encoder:
                dist, idx = self.classifier.kneighbors([emb])
                # Công thức Euclidean: d < 0.6 là người quen
                if dist[0][0] < 0.65:
                    label = self.classifier.predict([emb])[0]
                    return self.encoder.inverse_transform([label])[0]
            return "Stranger (Unknown)"
        except:
            return "Processing..."

    def get_embedding(self, face_img):
        """Biến đổi ảnh mặt thành Vector 512 chiều"""
        face_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
        face_pil = Image.fromarray(face_rgb).resize((160, 160))
        img_t = (torch.tensor(np.array(face_pil)).permute(2,0,1).float() - 127.5) / 128.0
        with torch.no_grad():
            emb = self.resnet(img_t.unsqueeze(0).to(self.device))
        return emb.cpu().numpy().flatten()
        
    def process_alert(self, name):
        """Xử lý gửi cảnh báo có Debounce (tránh spam)"""
        now = time.time()
        # Chỉ gửi warning 15s/lần cho cùng 1 người
        if name in self.last_log_time and (now - self.last_log_time[name] < 15):
            return

        self.last_log_time[name] = now
        
        if "Unknown" in name:
            log_data = {
                "type": "WARNING",
                "title": "Phát hiện người lạ",
                "message": "Có người lạ xuất hiện trong khu vực giám sát.",
                "detectedName": "Unknown"
            }
        elif name != "Processing...":
            log_data = {
                "type": "INFO",
                "title": "Nhân viên Check-in",
                "message": f"{name} đã xuất hiện tại cửa hàng.",
                "detectedName": name
            }
        else:
            return

        # Gửi HTTP Request trong Thread riêng để không chặn AI
        threading.Thread(target=self.send_alert_to_server, args=(log_data,), daemon=True).start()

    def send_alert_to_server(self, data):
        try:
            requests.post(API_URL, json=data, timeout=3)
            print(f"[LOG SENT] {data['title']}")
        except Exception as e:
            print(f"[LOG ERROR] Không thể gửi về Server: {e}")

    # --- UI UPDATES ---
    def update_ui_loop(self):
        if self.is_running:
            try:
                frame = self.result_queue.get_nowait()
                img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                imgtk = ImageTk.PhotoImage(image=img)
                self.video_label.imgtk = imgtk
                self.video_label.configure(image=imgtk)
            except queue.Empty:
                pass
            self.root.after(10, self.update_ui_loop)

    def start_system(self):
        if not self.is_running:
            self.is_running = True
            threading.Thread(target=self.video_worker, daemon=True).start()
            self.update_ui_loop()

    def stop_system(self):
        self.is_running = False
        self.video_label.configure(image='', text="System Stopped")

    def register_user(self):
        name = simpledialog.askstring("Register", "Nhập tên người dùng mới:")
        if not name: return
        
        messagebox.showinfo("Hướng dẫn", "Hệ thống sẽ chụp 20 ảnh. Hãy nhìn vào camera.")
        cap = cv2.VideoCapture(0)
        collected_embs = []
        
        while len(collected_embs) < 20:
            ret, frame = cap.read()
            results = self.detector(frame, verbose=False)[0]
            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                face = frame[y1:y2, x1:x2]
                if face.size > 0:
                    collected_embs.append(self.get_embedding(face))
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
            
            cv2.imshow("Registering...", frame)
            cv2.waitKey(1)
            
        cap.release()
        cv2.destroyAllWindows()

        # Lưu vào MongoDB (Binary format)
        buf = __import__('io').BytesIO()
        np.save(buf, np.array(collected_embs))
        self.collection.replace_one({'name': name}, {'name': name, 'embeddings': Binary(buf.getvalue())}, upsert=True)
        
        messagebox.showinfo("Thành công", f"Đã đăng ký xong cho {name}!")
        self.load_known_faces()

if __name__ == "__main__":
    root = tk.Tk()
    app = FaceRecognitionApp(root)
    root.mainloop()