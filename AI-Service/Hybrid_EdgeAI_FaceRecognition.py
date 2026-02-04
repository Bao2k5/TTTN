import os
import cv2
import threading
import queue
import time
import requests
import datetime
import numpy as np
import tkinter as tk
from tkinter import messagebox, simpledialog, ttk
from PIL import Image, ImageTk
from ultralytics import YOLO
import torch
from facenet_pytorch import InceptionResnetV1
from pymongo import MongoClient
from bson.binary import Binary
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import mediapipe as mp # Thu vien bat ban tay
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv(dotenv_path="../.env")

# API Configuration - Dùng Cloud Backend (Render) - HARDCODE để chắc chắn
CLOUD_BACKEND = "https://hm-jewelry-api.onrender.com"
API_URL = CLOUD_BACKEND + "/api/security/log"
RESET_ALARM_URL = CLOUD_BACKEND + "/api/security/reset-alarm"

print(f"[CONFIG] API_URL = {API_URL}")

# ======================================================================================
# DO AN TOT NGHIEP: HE THONG GIAM SAT THONG MINH (HYBRID EDGE-CLOUD AI) - v3.0
# ======================================================================================
# 
# TINH NANG MOI (v3.0): "VONG TRON BAO VE" (VIRTUAL FENCE) 🛡️
# -----------------------------------------------------------
# 1. FACE ID (YOLOv8 + FaceNet): Xac dinh danh tinh (Nhan vien / Nguoi la).
# 2. HAND TRACKING (MediaPipe): Phat hien ban tay xam nhap vung cam (Tu kinh).
# 3. SECURITY LOGIC (Dual-Condition):
#    - Tinh huong 1: Tay cham tu + Co Nhan vien -> OK (Dang phuc vu khach).
#    - Tinh huong 2: Tay cham tu + KHONG co Nhan vien -> BAO DONG (Hanh vi an trom).
#
# ======================================================================================

# --- SAFE IMPORT MEDIAPIPE ---
HAS_MEDIAPIPE = False
try:
    import mediapipe as mp
    try:
        mp_hands = mp.solutions.hands
        mp_drawing = mp.solutions.drawing_utils
        HAS_MEDIAPIPE = True
    except AttributeError:
        # Fallback for some versions
        from mediapipe.python.solutions import hands as mp_hands
        from mediapipe.python.solutions import drawing_utils as mp_drawing
        HAS_MEDIAPIPE = True
except Exception as e:
    print(f"[WARNING] MediaPipe Hand Tracking disabled: {e}")
    HAS_MEDIAPIPE = False

# === MTCNN FOR HIGH-QUALITY REGISTRATION ===
try:
    from facenet_pytorch import MTCNN
    MTCNN_AVAILABLE = True
except:
    MTCNN_AVAILABLE = False
    print("[WARNING] MTCNN not available. Using YOLOv8 for registration (lower quality).")

class HandDetector:
    """Module phat hien ban tay va xu ly va cham voi vung cam"""
    def __init__(self):
        self.mp_hands = None
        self.hands = None
        
        if HAS_MEDIAPIPE:
            self.mp_hands = mp_hands
            self.mp_draw = mp_drawing
            self.hands = self.mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=2,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
        else:
            print("[INFO] Hand Detector is OFF (Lib missing)")

    def find_hands(self, img):
        if not self.hands: return None
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.hands.process(img_rgb)
        return self.results.multi_hand_landmarks

    def check_intrusion(self, img, hand_landmarks, fence_box):
        if not hand_landmarks: return False
        
        x_min, y_min, x_max, y_max = fence_box
        h, w, c = img.shape
        is_intruding = False
        
        for hand_lms in hand_landmarks:
            if self.mp_draw:
                self.mp_draw.draw_landmarks(img, hand_lms, self.mp_hands.HAND_CONNECTIONS)
            
            x = int(hand_lms.landmark[8].x * w)
            y = int(hand_lms.landmark[8].y * h)
            
            cv2.circle(img, (x, y), 10, (255, 0, 255), cv2.FILLED)
            
            if x_min < x < x_max and y_min < y < y_max:
                is_intruding = True
        
        return is_intruding

class FaceRegistrationWindow:
    """Cửa sổ đăng ký khuôn mặt chuyên nghiệp với khung dẫn hướng oval"""
    def __init__(self, parent, name, device, resnet, mtcnn, detector, callback):
        self.window = tk.Toplevel(parent)
        self.window.title(f"Đăng ký nhân viên: {name}")
        self.window.geometry("1000x800")
        self.window.configure(bg='#2c3e50')
        self.window.protocol("WM_DELETE_WINDOW", self.on_close)
        
        self.name = name
        self.device = device
        self.resnet = resnet
        self.mtcnn = mtcnn
        self.detector = detector
        self.callback = callback
        
        self.cap = cv2.VideoCapture(0)
        self.is_running = True
        self.images_captured = 0
        self.total_needed = 20
        self.embs = []
        
        self.steps = [
            {"name": "NHÌN THẲNG", "count": 5, "instruction": "Hãy nhìn thẳng vào camera"},
            {"name": "QUAY TRÁI", "count": 5, "instruction": "Xoay mặt sang TRÁI 45 độ"},
            {"name": "QUAY PHẢI", "count": 5, "instruction": "Xoay mặt sang PHẢI 45 độ"},
            {"name": "NGẨNG ĐẦU", "count": 5, "instruction": "Ngẩng đầu lên nhẹ"}
        ]
        self.current_step = 0
        self.step_captured = 0
        self.last_capture_time = 0
        
        self.setup_ui()
        self.update_loop()

    def setup_ui(self):
        # Frame chính
        main_container = tk.Frame(self.window, bg='#2c3e50')
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Tiêu đề và Hướng dẫn
        self.lbl_instruction = tk.Label(main_container, text="BẮT ĐẦU ĐĂNG KÝ", font=('Segoe UI', 18, 'bold'), bg='#2c3e50', fg='#ecf0f1')
        self.lbl_instruction.pack(pady=10)
        
        self.lbl_sub_instruction = tk.Label(main_container, text="Chuẩn bị khuôn mặt trong khung hình", font=('Segoe UI', 12), bg='#2c3e50', fg='#bdc3c7')
        self.lbl_sub_instruction.pack(pady=5)
        
        # Khu vực Video Canvas
        self.canvas = tk.Canvas(main_container, width=640, height=480, bg='black', highlightthickness=0)
        self.canvas.pack(pady=10)
        
        # Khu vực Feedback bên dưới video
        feedback_frame = tk.Frame(main_container, bg='#2c3e50')
        feedback_frame.pack(fill=tk.X, pady=10)
        
        self.quality_labels = {}
        features = ["Face Detected", "Size OK", "Brightness", "Sharpness"]
        for i, feat in enumerate(features):
            lbl = tk.Label(feedback_frame, text=f"● {feat}", font=('Segoe UI', 10), bg='#2c3e50', fg='#95a5a6')
            lbl.grid(row=0, column=i, padx=20)
            self.quality_labels[feat] = lbl
            
        # Progress Bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(main_container, variable=self.progress_var, maximum=100, length=600)
        self.progress_bar.pack(pady=15)
        
        self.lbl_progress = tk.Label(main_container, text="Tiến độ: 0/20", font=('Segoe UI', 11), bg='#2c3e50', fg='#ecf0f1')
        self.lbl_progress.pack()
        
        # Nút hủy
        tk.Button(main_container, text="HỦY ĐĂNG KÝ", command=self.on_close, bg='#c0392b', fg='white', font=('Segoe UI', 11, 'bold'), pady=8, width=15, bd=0).pack(pady=10)

    def update_loop(self):
        if not self.is_running: return
        
        ret, frame = self.cap.read()
        if not ret: return
        
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        
        # Vẽ Oval dẫn hướng trên frame
        overlay = frame.copy()
        center_x, center_y = w // 2, h // 2
        axes_x, axes_y = 120, 160
        cv2.ellipse(overlay, (center_x, center_y), (axes_x, axes_y), 0, 0, 360, (0, 255, 0), 2)
        # Làm mờ vùng ngoài oval (Optional for pro look)
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.ellipse(mask, (center_x, center_y), (axes_x, axes_y), 0, 0, 360, 255, -1)
        frame_display = cv2.addWeighted(frame, 0.4, overlay, 0.6, 0)
        frame_display[mask > 0] = frame[mask > 0]
        cv2.ellipse(frame_display, (center_x, center_y), (axes_x, axes_y), 0, 0, 360, (0, 255, 0), 2)

        # Xử lý bước hiện tại
        step = self.steps[self.current_step]
        self.lbl_instruction.config(text=f"BƯỚC {self.current_step+1}/4: {step['name']}")
        self.lbl_sub_instruction.config(text=step['instruction'])
        
        # Detecting face for quality check
        face_found = False
        face_data = None # (box, face_img)
        
        if self.mtcnn:
            boxes, probs, landmarks = self.mtcnn.detect(frame, landmarks=True)
            if boxes is not None and len(boxes) > 0:
                best_idx = np.argmax(probs)
                if probs[best_idx] > 0.9:
                    box = boxes[best_idx]
                    x1, y1, x2, y2 = map(int, box)
                    face_img = frame[max(0,y1):min(h,y2), max(0,x1):min(w,x2)]
                    face_data = ((x1, y1, x2, y2), face_img)
                    face_found = True
        elif self.detector: # Fallback YOLO
            results = self.detector(frame, classes=[0], conf=0.6, verbose=False)[0]
            if len(results.boxes) > 0:
                # Get the biggest box
                best_box = None
                max_area = 0
                for box in results.boxes:
                    bx1, by1, bx2, by2 = map(int, box.xyxy[0])
                    area = (bx2 - bx1) * (by2 - by1)
                    if area > max_area:
                        max_area = area
                        best_box = (bx1, by1, bx2, by2)
                
                if best_box:
                    x1, y1, x2, y2 = best_box
                    face_img = frame[max(0,y1):min(h,y2), max(0,x1):min(w,x2)]
                    face_data = ((x1, y1, x2, y2), face_img)
                    face_found = True

        if face_found and face_data:
            box, face_img = face_data
            x1, y1, x2, y2 = box
            
            # Quality Indicators
            size_ok = 120 < (x2-x1) < 350
            gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            bright_ok = 60 < brightness < 200
            blur_val = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharp_ok = blur_val > 80
            
            self.update_quality_ui(True, size_ok, bright_ok, sharp_ok)
            
            if size_ok and bright_ok and sharp_ok:
                in_oval = (center_x - axes_x < (x1+x2)/2 < center_x + axes_x) and \
                          (center_y - axes_y < (y1+y2)/2 < center_y + axes_y)
                
                if in_oval:
                    # KIỂM TRA HƯỚNG MẶT (POSE CHECK)
                    is_correct_pose = self.check_pose(landmarks, step['name'])
                    
                    if is_correct_pose:
                        now = time.time()
                        if now - self.last_capture_time > 0.6:
                            self.capture_image(face_img)
                            self.last_capture_time = now
                    else:
                        self.lbl_sub_instruction.config(text=f"HÃY {step['instruction'].upper()}", fg='#e67e22') # Màu cam cảnh báo
                else:
                    self.lbl_sub_instruction.config(text="CĂN CHỈNH MẶT VÀO GIỮA KHUNG OVAL", fg='#f1c40f')
        else:
            self.update_quality_ui(False, False, False, False)
            
        # Hiển thị lên canvas
        img = Image.fromarray(cv2.cvtColor(frame_display, cv2.COLOR_BGR2RGB))
        self.imgtk = ImageTk.PhotoImage(image=img)
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.imgtk)
        
        # Check finish
        if self.images_captured >= self.total_needed:
            self.is_running = False
            self.finish_registration()
        else:
            self.window.after(30, self.update_loop)

    def update_quality_ui(self, detected, size, bright, sharp):
        colors = {True: '#2ecc71', False: '#e74c3c'}
        self.quality_labels["Face Detected"].config(fg=colors[detected])
        self.quality_labels["Size OK"].config(fg=colors[size])
        self.quality_labels["Brightness"].config(fg=colors[bright])
        self.quality_labels["Sharpness"].config(fg=colors[sharp])

    def check_pose(self, landmarks, step_name):
        """Ước lượng hướng mặt dựa trên 5 điểm mốc của MTCNN"""
        if landmarks is None or len(landmarks) == 0: return False
        
        lm = landmarks[0] # Lấy người đầu tiên
        # MTCNN landmarks: 0:mắt trái, 1:mắt phải, 2:mũi, 3:miệng trái, 4:miệng phải
        le, re, nose = lm[0], lm[1], lm[2]
        
        # Yaw (Trái/Phải): Tỉ lệ khoảng cách mũi tới 2 mắt
        eye_dist = re[0] - le[0]
        if eye_dist <= 0: return False
        yaw = (nose[0] - le[0]) / eye_dist
        
        # Pitch (Lên/Xuống): Khoảng cách mũi tới trục mắt
        eye_y_avg = (le[1] + re[1]) / 2
        pitch = nose[1] - eye_y_avg
        
        if step_name == "NHÌN THẲNG":
            return 0.4 < yaw < 0.6
        elif step_name == "QUAY TRÁI":
            return yaw > 0.75  # Mũi lệch hẳn sang phải (user quay trái)
        elif step_name == "QUAY PHẢI":
            return yaw < 0.25  # Mũi lệch hẳn sang trái (user quay phải)
        elif step_name == "NGẨNG ĐẦU":
            return pitch < 20   # Mũi gần mắt hơn (nhìn lên)
        return False

    def capture_image(self, face_img):
        os.makedirs(f"dataset/train/{self.name}", exist_ok=True)
        cv2.imwrite(f"dataset/train/{self.name}/{self.images_captured}.jpg", face_img)
        
        # Get embedding logic should be called here or post-process
        # For responsiveness, we just capture here
        self.images_captured += 1
        self.step_captured += 1
        
        progress = (self.images_captured / self.total_needed) * 100
        self.progress_var.set(progress)
        self.lbl_progress.config(text=f"Tiến độ: {self.images_captured}/{self.total_needed}")
        
        if self.step_captured >= 5:
            self.step_captured = 0
            if self.current_step < 3:
                self.current_step += 1
                messagebox.showinfo("Thành công!", f"Đã xong bước {self.current_step}. Chuyển sang: {self.steps[self.current_step]['name']}")

    def finish_registration(self):
        # Post process to get embeddings
        messagebox.showinfo("Xử lý", "Đã thu thập đủ ảnh. Đang trích xuất dữ liệu...")
        self.callback(self.name)
        self.on_close()

    def on_close(self):
        self.is_running = False
        if self.cap.isOpened(): self.cap.release()
        self.window.destroy()

class FaceRecognitionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NCKH: Smart Jewelry Security (v3.0 - Anti-Theft AI)")
        self.root.geometry("1300x850") # Wide screen
        self.root.configure(bg='#2c3e50')
        
        # 1. KHOI TAO AI MODELS
        print("[INFO] Loading YOLOv8 (for real-time monitoring)...")
        self.detector = YOLO('yolov8n.pt')
        
        print("[INFO] Loading FaceNet...")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        
        # MTCNN for high-quality registration
        if MTCNN_AVAILABLE:
            print("[INFO] Loading MTCNN (for registration)...")
            self.mtcnn = MTCNN(image_size=160, margin=20, device=self.device)
        else:
            self.mtcnn = None
        
        print("[INFO] Loading Hand Detector...")
        self.hand_detector = HandDetector()

        # 2. DATABASE & CONFIG
        # Lay MONGO_URI tu .env (Uu tien Atlas Cloud da co san)
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.setup_mongodb()
        os.makedirs("dataset/train", exist_ok=True) 
        
        # 3. LOGIC BIEN
        self.embeddings = {}
        self.classifier = None
        self.encoder = None
        self.last_log_time = {} 
        self.is_staff_present = False 

        self.frame_queue = queue.Queue(maxsize=1)
        self.is_running = False
        
        self.load_known_faces()
        self.setup_ui()

    def setup_mongodb(self):
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client['face_recognition']
            self.collection = self.db['embeddings']
            print("[INFO] Connected to MongoDB.")
        except:
            pass # Silent fail safely

    def setup_ui(self):
        self.side_bar = tk.Frame(self.root, bg='#34495e', width=260)
        self.side_bar.pack(side=tk.LEFT, fill=tk.Y)
        self.display_frame = tk.Frame(self.root, bg='#ecf0f1')
        self.display_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        tk.Label(self.side_bar, text="SECURITY DASHBOARD", bg='#34495e', fg='#ecf0f1', font=('Arial', 14, 'bold')).pack(pady=30)
        
        btn_config = {'font': ('Segoe UI', 11, 'bold'), 'bg': '#2980b9', 'fg': 'white', 'pady': 12, 'width': 22, 'bd': 0}
        tk.Button(self.side_bar, text="▶ START MONITORING", command=self.start_system, **btn_config).pack(pady=10)
        tk.Button(self.side_bar, text="⏹ STOP SYSTEM", command=self.stop_system, bg='#c0392b', fg='white', font=('Segoe UI', 11, 'bold'), pady=12, width=22, bd=0).pack(pady=10)
        tk.Button(self.side_bar, text="� TẮT CÒI", command=self.reset_alarm, bg='#e74c3c', fg='white', font=('Segoe UI', 11, 'bold'), pady=12, width=22, bd=0).pack(pady=10)
        tk.Button(self.side_bar, text="�👤 REGISTER STAFF", command=self.register_user, **btn_config).pack(pady=10)
        tk.Button(self.side_bar, text="🗑️ DELETE STAFF", command=self.delete_staff, bg='#e67e22', fg='white', font=('Segoe UI', 11, 'bold'), pady=12, width=22, bd=0).pack(pady=10)
        
        self.video_label = tk.Label(self.display_frame, bg='black')
        self.video_label.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

    def check_box_overlap(self, x1, y1, x2, y2, fx1, fy1, fx2, fy2):
        """Kiem tra xem bounding box co overlap voi Virtual Fence khong"""
        # Kiem tra xem 2 hinh chu nhat co giao nhau khong
        return not (x2 < fx1 or x1 > fx2 or y2 < fy1 or y1 > fy2)


    def load_known_faces(self):
        try:
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
                # Tang so luong neighbors de on dinh hon
                self.classifier = KNeighborsClassifier(n_neighbors=min(7, len(set(y))), metric='euclidean')
                self.classifier.fit(X, y_encoded)
                print(f"[INFO] Loaded {len(set(y))} users from DB.")
        except: pass

    # --- CORE WORKER ---
    def video_worker(self):
        cap = cv2.VideoCapture(0)
        cap.set(3, 800)
        cap.set(4, 600)
        
        fence_x1, fence_y1 = 500, 50   # Top-right corner
        fence_x2, fence_y2 = 750, 300
        fence_box = (fence_x1, fence_y1, fence_x2, fence_y2)

        while self.is_running:
            start = time.time()
            ret, frame = cap.read()
            if not ret: break
            
            frame = cv2.flip(frame, 1)

            # 2. PHAT HIEN KHUON MAT VA KIEM TRA XAM NHAP (YOLOv8)
            results = self.detector(frame, classes=[0], conf=0.6, verbose=False)[0]
            
            current_faces = []
            self.is_staff_present = False
            is_stranger_in_fence = False  # Kiem tra nguoi la co trong vung cam khong
            
            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                face_crop = frame[y1:y2, x1:x2]
                
                if face_crop.size > 0:
                    name = self.identify_face(face_crop)
                    current_faces.append(name)
                    
                    # Kiem tra xem nguoi nay co trong Virtual Fence khong
                    person_in_fence = self.check_box_overlap(x1, y1, x2, y2, fence_x1, fence_y1, fence_x2, fence_y2)
                    
                    # Logic hien thi
                    if "Stranger" in name: 
                        color = (0, 0, 255) # Do
                        if person_in_fence:
                            is_stranger_in_fence = True  # NGUOI LA TRONG VUNG CAM!
                    elif name == "Processing...":
                        color = (0, 255, 255)
                    else:
                        color = (0, 255, 0) # Xanh (Staff)
                        self.is_staff_present = True
                    
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, name, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            # 4. LOGIC AN NINH THONG MINH (SMART SECURITY)
            # Ve vung cam - Chuyen do khi nguoi la xam nhap
            color_fence = (0, 255, 0) if not is_stranger_in_fence else (0, 0, 255)
            cv2.rectangle(frame, (fence_x1, fence_y1), (fence_x2, fence_y2), color_fence, 2)
            cv2.putText(frame, "VUNG TRUNG BAY (JEWELRY ZONE)", (fence_x1, fence_y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_fence, 2)

            # LOGIC AN NINH: Chi bao dong khi NGUOI LA VAO VUNG CAM
            if is_stranger_in_fence:
                # NGUOI LA XAM NHAP TU KINH -> BAO DONG!!!
                msg = "!!! CANH BAO: TROM CAP - XAM NHAP TU KINH !!!"
                cv2.putText(frame, msg, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                print(f"[ALERT] Stranger intrusion detected!")
                self.process_alert("DANGER", "Trom cap", "Phat hien nguoi la xam nhap vung trung bay!")
            elif "Stranger" in current_faces:
                # Chi CANH BAO (khong bao dong) khi chi thay nguoi la ben ngoai
                msg = "CANH GIOI: Phat hien nguoi la"
                cv2.putText(frame, msg, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 165, 0), 2)  # Mau cam

            # 5. TU ĐỘNG TẮT CÒI KHI THẤY NHÂN VIÊN
            if self.is_staff_present:
                # Nếu thấy nhân viên -> Tự động gọi API tắt còi (Debounce 2s)
                now = time.time()
                if "AUTO_RESET" not in self.last_log_time or (now - self.last_log_time["AUTO_RESET"]) > 2:
                    self.last_log_time["AUTO_RESET"] = now
                    threading.Thread(target=self.reset_alarm, args=(True,)).start()

            # FPS
            fps = 1/(time.time()-start)
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 1)

            if not self.frame_queue.full():
                self.frame_queue.put(frame)

        cap.release()

    # ===== IMAGE QUALITY VALIDATORS =====
    def check_brightness(self, img):
        """Kiem tra do sang cua anh"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        return 60 < brightness < 200  # Khong qua toi/qua sang
    
    def check_blur(self, img):
        """Kiem tra anh co bi mo khong (Laplacian variance)"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return laplacian_var > 100  # Nguong blur
    
    def check_face_size(self, w, h):
        """Kiem tra kich thuoc khuon mat"""
        return 100 < w < 350 and 100 < h < 350
    
    def get_quality_feedback(self, img, face_w, face_h):
        """Tra ve thong bao chat luong anh"""
        if not self.check_brightness(img):
            return "QUA TOI/SANG - Dieu chinh anh sang"
        if not self.check_blur(img):
            return "ANH BI MO - Giu may yen"
        if not self.check_face_size(face_w, face_h):
            if face_w < 100:
                return "QUA XA - Tien gan hon"
            else:
                return "QUA GAN - Lui ra"
        return "OK"

    def get_embedding(self, face_crop):
        """Trích xuất vector đặc trưng (512-D) - Đã đồng bộ với lúc đăng ký"""
        try:
            # Chuyển sang RGB (FaceNet yêu cầu)
            face_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
            face_pil = Image.fromarray(face_rgb).resize((160, 160))
            
            # Normalization chuẩn của FaceNet: (x - 127.5) / 128.0
            img_t = (torch.tensor(np.array(face_pil)).permute(2,0,1).float() - 127.5) / 128.0
            
            with torch.no_grad():
                emb = self.resnet(img_t.unsqueeze(0).to(self.device))
            emb_vec = emb.cpu().numpy().flatten()
            
            if self.classifier:
                # Tìm khoảng cách ngắn nhất
                distances, indices = self.classifier.kneighbors([emb_vec])
                mean_dist = np.mean(distances[0])
                label_idx = self.classifier.predict([emb_vec])[0]
                name = self.encoder.inverse_transform([label_idx])[0]
                
                # Debug log khoảng cách (Giúp tinh chỉnh ngưỡng)
                if mean_dist < 1.0: # Chỉ log khi có vẻ giống
                    print(f"[RECOG] Name: {name} | Dist: {mean_dist:.3f}")

                # Ngưỡng nhận diện (0.8 là mức tương đối an toàn cho Euclidean)
                if mean_dist < 0.85: 
                    return name
            return "Stranger"
        except Exception as e:
            # print(f"Error in recognition: {e}")
            return "Processing..."

    def identify_face(self, face_crop):
        return self.get_embedding(face_crop)

    def process_alert(self, type, title, message):
        now = time.time()
        if "ALERT" in self.last_log_time and (now - self.last_log_time["ALERT"]) < 2:  # Giam xuong 2 giay
            print(f"[DEBUG] Alert blocked by debounce (last: {now - self.last_log_time['ALERT']:.1f}s ago)")
            return
        self.last_log_time["ALERT"] = now
        
        data = {"type": type, "title": title, "message": message, "detectedName": "INTRUDER"}
        print(f"[ALERT] Sending to backend: {type} - {title}")
        threading.Thread(target=lambda: requests.post(API_URL, json=data)).start()

    def start_system(self):
        if not self.is_running:
            self.is_running = True
            threading.Thread(target=self.video_worker, daemon=True).start()
            self.update_ui_loop()

    def stop_system(self):
        self.is_running = False

    def reset_alarm(self, silent=False):
        """Tắt còi báo động bằng cách gọi API reset"""
        try:
            response = requests.post(RESET_ALARM_URL)
            if response.status_code == 200:
                if not silent:
                    messagebox.showinfo("Thành công", "Đã tắt còi báo động!")
                else:
                    print("[INFO] Auto-reset: Alarm dismissed by Staff presence.")
            else:
                if not silent:
                    messagebox.showerror("Lỗi", "Không thể tắt còi!")
        except Exception as e:
            if not silent:
                messagebox.showerror("Lỗi", f"Không kết nối được Backend: {e}")

    def update_ui_loop(self):
        if self.is_running:
            try:
                frame = self.frame_queue.get_nowait()
                img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                imgtk = ImageTk.PhotoImage(image=img)
                self.video_label.imgtk = imgtk
                self.video_label.configure(image=imgtk)
            except: pass
            self.root.after(10, self.update_ui_loop)

    def register_user(self):
        """Mở cửa sổ đăng ký chuyên nghiệp thay vì dialog cũ"""
        name = simpledialog.askstring("Register", "Nhập tên nhân viên mới:")
        if not name: return
        
        def process_embeddings(staff_name):
            # Hàm callback sau khi chụp ảnh xong
            embs = []
            folder = f"dataset/train/{staff_name}"
            for img_name in os.listdir(folder):
                img_path = os.path.join(folder, img_name)
                img = cv2.imread(img_path)
                if img is not None:
                    emb = self.get_embedding_only(img)
                    embs.append(emb)
            
            if embs:
                buf = __import__('io').BytesIO()
                np.save(buf, np.array(embs))
                self.collection.replace_one({'name': staff_name}, {'name': staff_name, 'embeddings': Binary(buf.getvalue())}, upsert=True)
                messagebox.showinfo("Hoàn thành", f"Đã đăng ký thành công nhân viên: {staff_name}")
                self.load_known_faces()
                if not self.is_running:
                    self.start_system()

        FaceRegistrationWindow(self.root, name, self.device, self.resnet, self.mtcnn, self.detector, process_embeddings)

    def delete_staff(self):
        """Hien thi danh sach nhan vien va cho phep xoa"""
        try:
            docs = list(self.collection.find({}, {'name': 1}))
            staff_list = [doc['name'] for doc in docs if 'name' in doc]
        except:
            messagebox.showerror("Loi", "Khong the ket noi MongoDB")
            return
        
        if not staff_list:
            messagebox.showinfo("Thong bao", "Chua co nhan vien nao duoc dang ky")
            return
        
        # Tao cua so chon nhan vien
        delete_window = tk.Toplevel(self.root)
        delete_window.title("Quan ly Nhan vien")
        delete_window.geometry("400x500")
        delete_window.configure(bg='#34495e')
        
        tk.Label(delete_window, text="DANH SACH NHAN VIEN", bg='#34495e', fg='white', font=('Arial', 14, 'bold')).pack(pady=20)
        
        # Listbox hien thi danh sach
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
                messagebox.showwarning("Canh bao", "Vui long chon nhan vien can xoa")
                return
            
            staff_name = listbox.get(selection[0])
            confirm = messagebox.askyesno("Xac nhan", f"Ban co chac chan muon xoa '{staff_name}'?\nHanh dong nay khong the hoan tac!")
            
            if confirm:
                try:
                    # Xoa khoi MongoDB
                    self.collection.delete_one({'name': staff_name})
                    # Xoa folder anh (neu co)
                    import shutil
                    folder_path = f"dataset/train/{staff_name}"
                    if os.path.exists(folder_path):
                        shutil.rmtree(folder_path)
                    
                    messagebox.showinfo("Thanh cong", f"Da xoa nhan vien '{staff_name}'")
                    delete_window.destroy()
                    # Tai lai model
                    self.load_known_faces()
                except Exception as e:
                    messagebox.showerror("Loi", f"Khong the xoa: {str(e)}")
        
        # Nut xoa
        btn_frame = tk.Frame(delete_window, bg='#34495e')
        btn_frame.pack(pady=20)
        tk.Button(btn_frame, text="XOA NHAN VIEN", command=confirm_delete, bg='#c0392b', fg='white', font=('Segoe UI', 12, 'bold'), width=15, pady=10).pack(side=tk.LEFT, padx=10)
        tk.Button(btn_frame, text="HUY", command=delete_window.destroy, bg='#95a5a6', fg='white', font=('Segoe UI', 12, 'bold'), width=10, pady=10).pack(side=tk.LEFT, padx=10)

    def get_embedding_only(self, face_img):
        # Ham phu de lay vector luc register (giong logic tren)
        face_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
        face_pil = Image.fromarray(face_rgb).resize((160, 160))
        img_t = (torch.tensor(np.array(face_pil)).permute(2,0,1).float() - 127.5) / 128.0
        with torch.no_grad():
            emb = self.resnet(img_t.unsqueeze(0).to(self.device))
        return emb.cpu().numpy().flatten()

if __name__ == "__main__":
    root = tk.Tk()
    app = FaceRecognitionApp(root)
    root.mainloop()