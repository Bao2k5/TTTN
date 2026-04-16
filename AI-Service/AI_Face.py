import os
import cv2
import threading
import queue
import time
import requests
import numpy as np
import tkinter as tk
from tkinter import messagebox, simpledialog, ttk
from PIL import Image, ImageTk
from ultralytics import YOLO
from pymongo import MongoClient
from bson.binary import Binary
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader


try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    print("[ERROR] Please install: 'pip install insightface onnxruntime'")

import os
import sys


current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

cloudinary.config( 
  cloud_name = "drqowqzr6", 
  api_key = "197156983396473", 
  api_secret = "v9wfVhbBoZAKVXxYJgRhKtqptWE"
)

CLOUD_BACKEND = "https://hm-vault.zapto.org"
API_URL = CLOUD_BACKEND + "/api/security/log"
UNLOCK_URL = CLOUD_BACKEND + "/api/security/trigger-unlock"
RESET_ALARM_URL = CLOUD_BACKEND + "/api/security/reset-alarm"
HEADER_AUTH = {"x-device-key": "IoT_Secure_Vault_2024"}

CAMERA_SOURCE = "webcam"
CAMERA_URL = 0
print("[CAM] CCTV: Webcam Laptop (index 0)")



class FaceRegistrationWindow:
    def __init__(self, parent, name, detector, callback):
        self.window = tk.Toplevel(parent)
        self.window.title(f"Đăng ký VIP: {name}")
        self.window.geometry("800x600")
        self.name = name
        self.detector = detector
        self.callback = callback
        if CAMERA_SOURCE == "esp32cam":
            self.cap = None
        else:

            self.cap = cv2.VideoCapture(CAMERA_URL, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(CAMERA_URL, cv2.CAP_MSMF)
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(CAMERA_URL)
        self.is_running = True
        self.images_captured = 0
        self.total_needed = 20
        self.last_capture_time = 0
        self.frame_queue = queue.Queue(maxsize=1)
        
        self.setup_ui()
        threading.Thread(target=self.camera_worker, daemon=True).start()
        self.update_ui_loop()

    def setup_ui(self):
        self.lbl = tk.Label(self.window, text="Quay măt vào oval và cử động nhẹ...", font=('Arial', 14))
        self.lbl.pack(pady=10)
        self.canvas = tk.Canvas(self.window, width=640, height=480)
        self.canvas.pack()
        self.progress = tk.Label(self.window, text="0/20", font=('Arial', 14))
        self.progress.pack()

    def camera_worker(self):
        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape
            

            cv2.ellipse(frame, (w//2, h//2), (120, 160), 0, 0, 360, (0, 255, 0), 2)
            

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) > 0:
                x, y, fw, fh = faces[0]
                x1, y1, x2, y2 = x, y, x+fw, y+fh
                

                cv2.rectangle(frame, (max(0, x1), max(0, y1)), (min(w, x2), min(h, y2)), (255, 255, 0), 2)
                
                cx = x + fw//2
                cy = y + fh//2
                if (w//2 - 120 < cx < w//2 + 120):
                    now = time.time()
                    if now - self.last_capture_time > 0.5:
                        os.makedirs(f"dataset/train/{self.name}", exist_ok=True)

                        cv2.imwrite(f"dataset/train/{self.name}/{self.images_captured}.jpg", frame)
                        self.images_captured += 1
                        self.last_capture_time = now
            
            if not self.frame_queue.full():
                self.frame_queue.put(frame)

            if self.images_captured >= self.total_needed:
                self.is_running = False
                break
                
        if self.cap is not None:
            self.cap.release()

    def update_ui_loop(self):
        if not self.is_running:
            if self.images_captured >= self.total_needed:
                parent = self.window.master
                self.window.destroy()
                parent.after(100, lambda: self.callback(self.name))
            return
            
        try:
            frame = self.frame_queue.get_nowait()
            img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            self.imgtk = ImageTk.PhotoImage(image=img)
            self.canvas.create_image(0, 0, anchor=tk.NW, image=self.imgtk)
            self.progress.config(text=f"{self.images_captured}/20")
        except:
            pass
            
        self.window.after(15, self.update_ui_loop)

class FaceRecognitionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NCKH: Smart Jewelry Security (v4.0 - YOLO11 + Tracking)")
        self.root.geometry("1000x800")
        

        print("[INFO] Loading YOLO11...")
        self.detector = YOLO('yolo11n.pt') 
        
        print("[INFO] Loading InsightFace...")
        if INSIGHTFACE_AVAILABLE:
            self.face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
            self.face_app.prepare(ctx_id=0, det_size=(640, 640))
        
        
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=2000)
        self.db = self.client['face_recognition']
        self.collection = self.db['embeddings']
        
        self.classifier = None
        self.encoder = None
        self.is_running = False
        self.frame_queue = queue.Queue(maxsize=1)
        
        self.tracked_identities = {}
        self.authorized_users = set()
        
        self.is_recording_event = False
        self.active_event_frames = []
        self.post_roll_count = 0
        self.MAX_FRAMES = 150
        self.current_alert_name = "Stranger"
        self.trigger_image = None
        
        self.last_alert_time = 0
        self.last_unlock_time = 0 
        self.alert_cooldown = 30 
        self.unlock_cooldown = 60 
        self.frame_buffer = [] 
        self.current_frame = None 
        self.setup_ui()
        self.load_known_faces()

    def load_known_faces(self):
        try:
            self.authorized_users = set()
            docs = list(self.collection.find({}))
            X, y = [], []
            for doc in docs:
                name = doc['name']
                if doc.get('is_authorized', False):
                    self.authorized_users.add(name)
                    
                emb_arr = np.load(__import__('io').BytesIO(doc['embeddings']))
                for vec in emb_arr:
                    X.append(vec)
                    y.append(name)
            if len(X) > 0:
                self.encoder = LabelEncoder()
                y_encoded = self.encoder.fit_transform(y)

                self.classifier = KNeighborsClassifier(n_neighbors=min(5, len(set(y))), metric='euclidean')
                self.classifier.fit(X, y_encoded)
                print(f"[INFO] Loaded {len(set(y))} users from DB.")
            else:
                self.classifier = None
                self.encoder = None
                self.tracked_identities = {}
                print(f"[INFO] No users found in DB. AI Reset.")
        except Exception as e:
            print(f"[ERROR] Failed to load known faces: {e}")

    def setup_ui(self):
        self.side_bar = tk.Frame(self.root, bg='#34495e', width=260)
        self.side_bar.pack(side=tk.LEFT, fill=tk.Y)
        self.display_frame = tk.Frame(self.root, bg='#ecf0f1')
        self.display_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        tk.Button(self.side_bar, text="▶ START MONITORING", command=self.start_system).pack(pady=10)
        tk.Button(self.side_bar, text="⏹ STOP SYSTEM", command=self.stop_system).pack(pady=10)
        tk.Button(self.side_bar, text="👤 REGISTER STAFF", command=self.register_user).pack(pady=10)
        tk.Button(self.side_bar, text="🗑️ DELETE STAFF", command=self.delete_staff, bg='#e67e22', fg='white', font=('Segoe UI', 10, 'bold')).pack(pady=10)
        self.video_label = tk.Label(self.display_frame, bg='black')
        self.video_label.pack(fill=tk.BOTH, expand=True)

    def process_and_upload_event(self, frames_to_upload, name, alert_img):
        now = time.time()
        
        print(f"[ALERT] Phat hien xam nhap! Gui canh bao...")
        
        try:

            _, img_encoded = cv2.imencode('.jpg', alert_img)
            img_bytes = img_encoded.tobytes()
            img_res = cloudinary.uploader.upload(img_bytes, folder="security_alerts")
            img_url = img_res.get('secure_url')
            
            payload = {
                "type": "DANGER",
                "title": "CẢNH BÁO XÂM NHẬP!",
                "message": f"Phát hiện {name} đang tiếp cận quầy trang sức!",
                "detectedName": name,
                "imageUrl": img_url,
                "videoUrl": None,
                "videoPublicId": None
            }
            res = requests.post(API_URL, json=payload, headers=HEADER_AUTH, timeout=5)
            log_id = None
            if res.status_code == 201:
                log_id = res.json().get('data', {}).get('_id')
                print(f"[SUCCESS] Chuông đã kêu! Log ID: {log_id}")
        except Exception as e:
            print(f"[ERROR] Immediate alert failed: {e}")
            log_id = None

        def task():
            if not log_id: return
            
            try:
                print(f"[INFO] Rendering {len(frames_to_upload)} frames...")
                

                video_filename = f"alert_{int(now)}.mp4"
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                h, w, _ = frames_to_upload[0].shape
                out = cv2.VideoWriter(video_filename, fourcc, 10.0, (w, h))
                
                for f in frames_to_upload:
                    out.write(f)
                out.release()
                
                if not os.path.exists(video_filename) or os.path.getsize(video_filename) < 1000:
                    print(f"[ERROR] Video file is missing or too small.")
                    return
                
                print(f"[INFO] Uploading evidence video...")
                vid_res = cloudinary.uploader.upload(video_filename, folder="security_alerts", resource_type="video")
                vid_url = vid_res.get('secure_url')
                vid_id = vid_res.get('public_id')
                

                if vid_url: 
                    vid_url = vid_url.replace('/upload/', '/upload/f_mp4,vc_auto/')
                
                if os.path.exists(video_filename): os.remove(video_filename)
                
                if vid_url:

                    put_url = f"{API_URL}/{log_id}"
                    put_payload = {
                        "videoUrl": vid_url,
                        "videoPublicId": vid_id
                    }
                    update_res = requests.put(put_url, json=put_payload, headers=HEADER_AUTH, timeout=10)
                    if update_res.status_code == 200:
                        print(f"[SUCCESS] Video attached to alert {log_id}")
                    
            except Exception as e:
                print(f"[ERROR] Background video task failed: {e}")

        threading.Thread(target=task, daemon=True).start()

    def handle_face_unlock(self, name):
        now = time.time()
        if now - self.last_unlock_time < self.unlock_cooldown:
            return
        
        if name in self.authorized_users:
            self.last_unlock_time = now
            print(f"[ACCESS] Authorized User detected: {name}. Unlocking...")
            try:

                requests.post(UNLOCK_URL, json={"reason": f"FaceID recognized: {name}"}, headers=HEADER_AUTH, timeout=5)

            except Exception as e:
                print(f"[ERROR] Unlock failed: {e}")

    def video_worker(self):
        cap = None
        for backend in [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]:
            print(f"[CAM] Trying camera index {CAMERA_URL} with backend {backend}...")
            cap = cv2.VideoCapture(CAMERA_URL, backend)
            if cap.isOpened():
                print(f"[CAM] Camera opened successfully with backend {backend}")
                break
            cap.release()
            cap = None
        
        if cap is None or not cap.isOpened():
            print("[ERROR] Cannot open camera! Trying all indices 0-3...")
            for idx in range(4):
                cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
                if cap.isOpened():
                    print(f"[CAM] Camera opened at index {idx}")
                    break
                cap.release()
                cap = None
        
        if cap is None or not cap.isOpened():
            print("[ERROR] No camera available! Please check your webcam.")
            self.is_running = False
            return

        fence_box = (500, 50, 750, 300)
        fail_count = 0

        while self.is_running:
            ret, frame = cap.read()
            if not ret:
                fail_count += 1
                if fail_count > 30:
                    print("[ERROR] Camera read failed 30 times. Stopping.")
                    break
                time.sleep(0.1)
                continue
            fail_count = 0
            frame = cv2.flip(frame, 1)
            self.current_frame = frame.copy() 
            
            self.frame_buffer.append(frame.copy())
            if len(self.frame_buffer) > 50:
                self.frame_buffer.pop(0)


            results = self.detector.track(frame, classes=[0], persist=True, tracker="bytetrack.yaml", verbose=False)[0]
            
            is_stranger_in_fence = False
            is_staff_in_fence = False
            self.is_staff_present = False

            if results.boxes.id is not None:
                boxes = results.boxes.xyxy.int().cpu().tolist()
                track_ids = results.boxes.id.int().cpu().tolist()
                
                for box, track_id in zip(boxes, track_ids):
                    x1, y1, x2, y2 = box
                    
                    if track_id not in self.tracked_identities:
                        self.tracked_identities[track_id] = "Stranger"
                        

                        if self.classifier is not None:
                            body_crop = frame[max(0, y1):y2, max(0, x1):x2]
                            if body_crop.size > 0 and INSIGHTFACE_AVAILABLE:
                                faces = self.face_app.get(body_crop)
                                if len(faces) > 0:
                                    face = faces[0]
                                    emb = face.embedding
                                    emb = emb / np.linalg.norm(emb)
                                    
                                    distances, indices = self.classifier.kneighbors([emb])
                                    dist = distances[0][0]
                                    label_idx = self.classifier.predict([emb])[0]
                                    pred_name = self.encoder.inverse_transform([label_idx])[0]
                                    print(f"[CCTV-DEBUG] dist={dist:.3f} → pred={pred_name} ({'MATCH' if dist < 1.55 else 'STRANGER'})")
                                    if dist < 1.55: 
                                        self.tracked_identities[track_id] = pred_name
                    
                    name = self.tracked_identities.get(track_id, "Stranger")
                    

                    in_fence = not (x2 < fence_box[0] or x1 > fence_box[2] or y2 < fence_box[1] or y1 > fence_box[3])
                    
                    if "Stranger" in name:
                        color = (0, 0, 255)
                        if in_fence: is_stranger_in_fence = True
                    else:
                        color = (0, 255, 0)
                        self.is_staff_present = True
                        if in_fence: is_staff_in_fence = True
                        if name in self.authorized_users:
                            pass


                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"ID:{track_id} {name}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            should_alert = is_stranger_in_fence and not is_staff_in_fence
            if should_alert:
                if not self.is_recording_event:
                    now = time.time()
                    if now - self.last_alert_time >= self.alert_cooldown:
                        print("[EVENT] Intrusion detected! Recording...")
                        self.is_recording_event = True
                        self.active_event_frames = list(self.frame_buffer)
                        self.post_roll_count = 0
                        self.current_alert_name = "Stranger"

                        self.trigger_image = frame.copy()
                else:
                    self.active_event_frames.append(frame.copy())
                    self.post_roll_count = 0
                    if len(self.active_event_frames) >= self.MAX_FRAMES:
                        self.process_and_upload_event(self.active_event_frames, self.current_alert_name, self.trigger_image)
                        self.is_recording_event = False
                        self.last_alert_time = time.time()
                        self.active_event_frames = []
            else:
                if self.is_recording_event:
                    self.active_event_frames.append(frame.copy())
                    self.post_roll_count += 1
                    if self.post_roll_count >= 50 or len(self.active_event_frames) >= self.MAX_FRAMES:
                        self.process_and_upload_event(self.active_event_frames, self.current_alert_name, self.trigger_image)
                        self.is_recording_event = False
                        self.last_alert_time = time.time()
                        self.active_event_frames = []


            color_fence = (0, 0, 255) if should_alert else (0, 255, 0)
            cv2.rectangle(frame, (fence_box[0], fence_box[1]), (fence_box[2], fence_box[3]), color_fence, 2)
            status_text = "JEWELRY ZONE"
            if is_staff_in_fence:
                status_text = "JEWELRY ZONE [STAFF]"
            elif is_stranger_in_fence:
                status_text = "JEWELRY ZONE [ALERT]"
            cv2.putText(frame, status_text, (fence_box[0], fence_box[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_fence, 2)

            if not self.frame_queue.full():
                self.frame_queue.put(frame)

        cap.release()

    def update_ui_loop(self):
        if self.is_running:
            try:
                if not self.frame_queue.empty():
                    frame = self.frame_queue.get_nowait()
                    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                    imgtk = ImageTk.PhotoImage(image=img)
                    self.video_label.imgtk = imgtk
                    self.video_label.configure(image=imgtk)
            except Exception as e:
                print(f"[UI ERROR] {e}")
            self.root.after(20, self.update_ui_loop)

    def start_system(self):
        if not self.is_running:
            self.is_running = True
            threading.Thread(target=self.video_worker, daemon=True).start()
            self.update_ui_loop()

    def stop_system(self): 
        self.is_running = False
        black_img = Image.new('RGB', (800, 600), color='black')
        self.root.after(0, self._set_black_screen, black_img)

    def _set_black_screen(self, black_img):
        try:
            self.black_imgtk = ImageTk.PhotoImage(image=black_img)
            self.video_label.imgtk = self.black_imgtk
            self.video_label.configure(image=self.black_imgtk)
        except Exception as e:
            pass

    def get_embedding_only(self, face_img):
        if not INSIGHTFACE_AVAILABLE: return []
        faces = self.face_app.get(face_img)
        if len(faces) > 0: return faces[0].embedding
        return []

    def register_user(self):
        self.stop_system()
        self.root.after(500, self._show_register_dialog)

    def _show_register_dialog(self):
        name = simpledialog.askstring("Register", "Nhập tên nhân viên mới:")
        if not name: 
            self.start_system()
            return
        
        is_auth = messagebox.askyesno("Quyền hạn", f"Cho phép '{name}' được tự động mở khóa tủ bằng khuôn mặt?")
            
        def process_embeddings(staff_name, is_authorized):
            loading_win = tk.Toplevel(self.root)
            loading_win.title("AI Đang Xử Lý...")
            loading_win.geometry("350x150")
            tk.Label(loading_win, text=f"Đang trích xuất đặc trưng AI: {staff_name}", font=('Arial', 11)).pack(pady=15)
            progress_bar = ttk.Progressbar(loading_win, orient=tk.HORIZONTAL, length=280, mode='determinate')
            progress_bar.pack(pady=5)
            percent_lbl = tk.Label(loading_win, text="0/0", font=('Arial', 10))
            percent_lbl.pack()

            def worker():
                def degrade_to_esp32cam(img):
                    h, w = img.shape[:2]
                    small = cv2.resize(img, (320, 240), interpolation=cv2.INTER_AREA)
                    _, encoded = cv2.imencode('.jpg', small, [cv2.IMWRITE_JPEG_QUALITY, 10])
                    degraded = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
                    degraded = cv2.resize(degraded, (w, h), interpolation=cv2.INTER_CUBIC)
                    degraded = degraded.astype(np.float32)
                    degraded[:,:,0] *= 1.05
                    degraded[:,:,2] *= 0.92
                    degraded = np.clip(degraded, 0, 255).astype(np.uint8)
                    return degraded

                embs = []
                folder = f"dataset/train/{staff_name}"
                try:
                    files = os.listdir(folder)
                except:
                    files = []
                total_files = len(files)
                
                for idx, img_name in enumerate(files):
                    img = cv2.imread(os.path.join(folder, img_name))
                    if img is not None:

                        faces = self.face_app.get(img)
                        if len(faces) > 0:
                            emb = faces[0].embedding
                            emb = emb / np.linalg.norm(emb)
                            embs.append(emb)


                            degraded = degrade_to_esp32cam(img)
                            faces_deg = self.face_app.get(degraded)
                            if len(faces_deg) > 0:
                                emb_deg = faces_deg[0].embedding
                                emb_deg = emb_deg / np.linalg.norm(emb_deg)
                                embs.append(emb_deg)
                    

                    def update_ui(current=idx+1, total=total_files):
                        if total > 0:
                            progress_bar['value'] = (current / total) * 100
                            percent_lbl.config(text=f"{current}/{total} bức ảnh (webcam + ESP32-CAM sim)")
                    self.root.after(0, update_ui)
                
                if embs:
                    is_duplicated = False
                    duplicated_name = ""
                    if self.classifier is not None and len(embs) > 0:
                        avg_emb = np.mean(embs, axis=0) 
                        avg_emb = avg_emb / np.linalg.norm(avg_emb)
                        distances, _ = self.classifier.kneighbors([avg_emb])
                        

                        if distances[0][0] < 1.4: 
                            label_idx = self.classifier.predict([avg_emb])[0]
                            exist_name = self.encoder.inverse_transform([label_idx])[0]

                            if exist_name.lower() != staff_name.lower():
                                is_duplicated = True
                                duplicated_name = exist_name

                    if is_duplicated:
                        self.root.after(0, lambda: loading_win.destroy())
                        msg = f"PHÁT HIỆN TRÙNG LẶP DỮ LIỆU!\n\nKhuôn mặt này thực chất trùng khớp với nhân viên: [{duplicated_name}].\nHệ thống từ chối đăng ký tài khoản nhân bản ảo!"
                        self.root.after(0, lambda: messagebox.showerror("Cảnh báo An Ninh", msg))
                    else:
                        buf = __import__('io').BytesIO()
                        np.save(buf, np.array(embs))
                        payload = {
                            'name': staff_name, 
                            'embeddings': Binary(buf.getvalue()),
                            'is_authorized': is_authorized
                        }
                        self.collection.replace_one({'name': staff_name}, payload, upsert=True)
                        
                        self.tracked_identities = {} 
                        self.load_known_faces()
                        self.root.after(0, lambda: loading_win.destroy())
                        self.root.after(0, lambda: messagebox.showinfo("Hoàn thành", "Đăng ký thành công!"))
                else:
                    self.root.after(0, lambda: loading_win.destroy())
                    self.root.after(0, lambda: messagebox.showerror("Lỗi", "Không tìm thấy khuôn mặt! Vui lòng thử lại."))
                    

                if not self.is_running:
                    self.root.after(0, self.start_system)
            
            threading.Thread(target=worker, daemon=True).start()
                

        FaceRegistrationWindow(self.root, name, self.detector, lambda n: process_embeddings(n, is_auth))

    def delete_staff(self):
        try:
            docs = list(self.collection.find({}, {'name': 1}))
            staff_list = [doc['name'] for doc in docs if 'name' in doc]
        except:
            messagebox.showerror("Lỗi", "Không thể kết nối MongoDB")
            return
        
        if not staff_list:
            messagebox.showinfo("Thông báo", "Chưa có nhân viên nào được đăng ký")
            return
            
        delete_window = tk.Toplevel(self.root)
        delete_window.title("Quản lý Nhân Viên")
        delete_window.geometry("400x500")
        delete_window.configure(bg='#34495e')
        
        tk.Label(delete_window, text="DANH SÁCH NHÂN VIÊN", bg='#34495e', fg='white', font=('Arial', 14, 'bold')).pack(pady=20)
        
        list_frame = tk.Frame(delete_window, bg='#34495e')
        list_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, font=('Segoe UI', 11), bg='#ecf0f1', selectmode=tk.SINGLE)
        listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=listbox.yview)
        
        for staff in staff_list:
            listbox.insert(tk.END, staff)
            
        def confirm_delete():
            selection = listbox.curselection()
            if not selection:
                messagebox.showwarning("Cảnh báo", "Vui lòng chọn nhân viên cần xóa")
                return
            
            staff_name = listbox.get(selection[0])
            confirm = messagebox.askyesno("Xác nhận", f"Bạn có chắc chắn muốn xóa '{staff_name}'?\nHành động này không thể hoàn tác!")
            
            if confirm:
                try:
                    self.collection.delete_one({'name': staff_name})
                    import shutil
                    folder_path = f"dataset/train/{staff_name}"
                    if os.path.exists(folder_path):
                        shutil.rmtree(folder_path)
                    
                    messagebox.showinfo("Thành công", f"Đã xóa nhân viên '{staff_name}'")
                    delete_window.destroy()
                    self.tracked_identities = {}
                    self.load_known_faces()
                except Exception as e:
                    messagebox.showerror("Lỗi", f"Không thể xóa: {str(e)}")
        
        btn_frame = tk.Frame(delete_window, bg='#34495e')
        btn_frame.pack(pady=20)
        tk.Button(btn_frame, text="XÓA NHÂN VIÊN", command=confirm_delete, bg='#c0392b', fg='white', font=('Segoe UI', 12, 'bold'), width=15, pady=10).pack(side=tk.LEFT, padx=10)
        tk.Button(btn_frame, text="HỦY", command=delete_window.destroy, bg='#95a5a6', fg='white', font=('Segoe UI', 12, 'bold'), width=10, pady=10).pack(side=tk.LEFT, padx=10)

if __name__ == "__main__":
    root = tk.Tk()
    app = FaceRecognitionApp(root)


    try:
        from flask import Flask, request, jsonify
        flask_app = Flask(__name__)

        @flask_app.route('/face-verify', methods=['POST'])
        def face_verify():
            try:
                img_data = request.get_data()
                if not img_data:
                    return jsonify({"matched": False, "name": "No image", "error": "Empty body"}), 400

                img_array = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

                if frame is None:
                    return jsonify({"matched": False, "name": "Unknown", "error": "Cannot decode image"}), 400

                print(f"[FACE-VERIFY] Received: {frame.shape}")

                if app.classifier is None or not INSIGHTFACE_AVAILABLE:
                    return jsonify({"matched": False, "name": "Chưa đăng ký nhân viên nào"}), 200


                h_img, w_img = frame.shape[:2]
                if h_img < 480 or w_img < 640:
                    scale = max(640/w_img, 480/h_img)
                    frame = cv2.resize(frame, (int(w_img*scale), int(h_img*scale)), interpolation=cv2.INTER_CUBIC)
                    print(f"[FACE-VERIFY] Image resized: {frame.shape}")

                cv2.imwrite("esp32_debug.jpg", frame)

                frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=20) 

                cv2.imwrite("esp32_debug_ai_enhanced.jpg", frame)

                faces = app.face_app.get(frame)
                if len(faces) == 0:
                    print("[FACE-VERIFY] Khong phat hien khuon mat trong anh!")
                    return jsonify({"matched": False, "name": "No face detected"}), 200

                face = faces[0]
                emb = face.embedding
                emb = emb / np.linalg.norm(emb)

                distances, _ = app.classifier.kneighbors([emb])
                dist = distances[0][0]

                if dist < 1.65: 
                    label_idx = app.classifier.predict([emb])[0]
                    name = app.encoder.inverse_transform([label_idx])[0]
                    is_authorized = name in app.authorized_users

                    print(f"[FACE-VERIFY] Nhan dien thanh cong: {name} (dist={dist:.3f}, authorized={is_authorized})")

                    if is_authorized:
                        def do_unlock():
                            try:
                                requests.post(UNLOCK_URL, json={"reason": f"FaceID ESP32CAM: {name}"}, headers=HEADER_AUTH, timeout=5)
                                print(f"[FACE-VERIFY] Da gui lenh mo khoa cho: {name}")
                            except Exception as e:
                                print(f"[FACE-VERIFY] Loi gui trigger-unlock: {e}")
                        threading.Thread(target=do_unlock, daemon=True).start()

                    return jsonify({"matched": is_authorized, "name": name, "distance": round(dist, 3)}), 200
                else:
                    print(f"[FACE-VERIFY] Khong nhan dien duoc (dist={dist:.3f} > 1.65)")
                    return jsonify({"matched": False, "name": "Stranger", "distance": round(dist, 3)}), 200

            except Exception as e:
                print(f"[FACE-VERIFY] Lỗi: {e}")
                return jsonify({"matched": False, "name": "Error", "error": str(e)}), 500

        @flask_app.route('/health', methods=['GET'])
        def health():
            return jsonify({"status": "ok", "classifier_ready": app.classifier is not None}), 200

        def run_flask():
            import logging
            log = logging.getLogger('werkzeug')
            log.setLevel(logging.ERROR)
            flask_app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)

        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        print("=" * 50)
        print("[FACE-VERIFY] HTTP Server khởi động tại port 5001")
        print("[FACE-VERIFY] ESP32-CAM POST ảnh đến: http://<IP_LAPTOP>:5001/face-verify")
        print("[FACE-VERIFY] Kiểm tra: http://<IP_LAPTOP>:5001/health")
        print("=" * 50)

    except ImportError:
        print("[WARNING] Flask chưa được cài. Face-Verify server không khởi động.")
        print("[WARNING] Cài đặt: pip install flask")

    root.mainloop()

