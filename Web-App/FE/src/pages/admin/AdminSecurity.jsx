import { useEffect, useState, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api'; 
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Kết nối Socket.IO - Lấy base URL (bỏ /api ở cuối)
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace('/api', '');

const AdminSecurity = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alarmActive, setAlarmActive] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [justReset, setJustReset] = useState(false); // Flag để không trigger lại ngay sau reset
    const [selectedVideo, setSelectedVideo] = useState(null);
    const audioRef = useRef(null);

    const fetchLogs = async (skipAlarmCheck = false) => {
        try {
            const response = await api.get('/security/logs?limit=50');
            if (response.data.success) {
                setLogs(response.data.data);
                
                // Check if any active danger persists (chỉ khi không vừa reset)
                if (!skipAlarmCheck) {
                    const activeDanger = response.data.data.find(l => 
                        (l.type === 'DANGER' || l.type === 'WARNING') && l.status === 'active'
                    );
                    if (activeDanger) {
                        triggerAlarm(activeDanger);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch security logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerAlarm = (alertData) => {
        setAlarmActive(true);
        setCurrentAlert(alertData);
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
    };

    const stopAlarm = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (isResetting) return; // Prevent double click
        
        const pin = prompt("Nhập mã PIN an ninh để tắt còi báo động (Mặc định: 1234):");
        if (!pin) return;

        setIsResetting(true);
        
        try {
            console.log('Calling reset-alarm API...');
            const response = await api.post('/security/reset-alarm', { pin });
            console.log('Reset response:', response.data);
            
            // Tắt alarm ngay lập tức
            setAlarmActive(false);
            setCurrentAlert(null);
            setJustReset(true);
            
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            
            toast.success("Đã tắt còi báo động!");
            
            // Refresh logs nhưng skip alarm check
            await fetchLogs(true);
            
            // Reset flag sau 3 giây
            setTimeout(() => setJustReset(false), 3000);
            
        } catch (error) {
            console.error('Reset error:', error);
            toast.error("Lỗi khi tắt còi: " + (error.response?.data?.message || error.message));
        } finally {
            setIsResetting(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        
        // Setup Socket
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to Security Socket');
        });

        socket.on('new-alert', (newLog) => {
            setLogs(prev => [newLog, ...prev]);
            
            if (newLog.type === 'DANGER' || newLog.type === 'WARNING') {
                triggerAlarm(newLog);
            }
        });

        socket.on('alarm-resolved', () => {
            setAlarmActive(false);
            setCurrentAlert(null);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            toast.success("Cảnh báo đã được xử lý!");
            fetchLogs(true); // Skip alarm check when resolved
        });

        return () => {
            socket.disconnect();
            if (audioRef.current) audioRef.current.pause();
        };
    }, []);

    return (
        <AdminLayout>
             {/* Âm thanh báo động (ẩn) */}
             <audio ref={audioRef} src="/sounds/alarm.mp3" preload="auto" />

            {/* ALARM OVERLAY - Thiết kế chuyên nghiệp hơn */}
            {alarmActive && currentAlert && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]"></div>
                    
                    {/* Pulsing rings */}
                    <div className="absolute w-64 h-64 rounded-full border-4 border-white/30 animate-ping"></div>
                    <div className="absolute w-48 h-48 rounded-full border-4 border-white/50 animate-pulse"></div>
                    
                    <div className="relative z-10 text-center px-8 flex flex-col items-center">
                        {/* Icon */}
                        <div className="text-8xl mb-6 animate-bounce">⚠️</div>
                        
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            PHÁT HIỆN XÂM NHẬP
                        </h1>
                        
                        {/* Alert Info Card */}
                        <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl mb-8 max-w-md mx-auto border border-white/20">
                            <p className="text-lg opacity-90 mb-2">Loại cảnh báo</p>
                            <p className="text-2xl font-bold text-yellow-300 mb-4">{currentAlert.title}</p>
                            <p className="text-sm opacity-75">{currentAlert.message}</p>
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-sm opacity-75">
                                    🕐 {new Date(currentAlert.timestamp).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>

                        {/* Stop Button */}
                        <button 
                            onClick={stopAlarm}
                            disabled={isResetting}
                            className={`
                                bg-white text-red-600 px-10 py-4 rounded-xl font-bold text-xl 
                                shadow-[0_0_30px_rgba(255,255,255,0.5)] 
                                hover:shadow-[0_0_50px_rgba(255,255,255,0.8)] 
                                hover:scale-105 active:scale-95
                                transition-all duration-200 
                                ${isResetting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {isResetting ? '⏳ Đang xử lý...' : '🔇 TẮT CẢNH BÁO'}
                        </button>
                        
                        {currentAlert.videoUrl && (
                            <div className="mt-8">
                                <a 
                                    href={currentAlert.videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-xl hover:scale-105"
                                >
                                    🎬 XEM BẰNG CHỨNG VIDEO (CLOUDINARY)
                                </a>
                            </div>
                        )}
                        
                        <p className="mt-4 text-sm opacity-60">Nhấn nút để xác nhận đã xử lý</p>
                    </div>
                </div>
            )}

            {/* VIDEO PLAYER MODAL */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
                    <div className="relative w-full max-w-4xl bg-luxury-black rounded-lg overflow-hidden shadow-2xl border border-luxury-platinum">
                        <div className="flex justify-between items-center p-4 border-b border-white/10">
                            <h3 className="text-white font-medium">Bằng chứng Video - {new Date(selectedVideo.timestamp).toLocaleString('vi-VN')}</h3>
                            <button onClick={() => setSelectedVideo(null)} className="text-white/60 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="aspect-video bg-black flex items-center justify-center">
                            <video src={selectedVideo.url} controls autoPlay className="max-h-full max-w-full"></video>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide">Security Monitor</h1>
                    <p className="text-luxury-gray">Giám sát An ninh & Cảnh báo Xâm nhập (Real-time)</p>
                </div>
                <div className="flex gap-3">
                    {alarmActive ? (
                         <button
                            onClick={stopAlarm}
                            className="bg-red-600 text-white px-6 py-2 rounded font-bold animate-bounce shadow-lg"
                        >
                            🚨 TẮT CÒI
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded border border-green-200">
                             <span className="relative flex h-3 w-3">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                             </span>
                              System Safe
                        </div>
                    )}
                   
                    <button
                        onClick={fetchLogs}
                        className="bg-luxury-black text-white px-4 py-2 rounded hover:bg-luxury-charcoal transition-colors"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-luxury-platinum overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-luxury-gray">Đang tải dữ liệu...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-luxury-gray">Chưa có dữ liệu cảnh báo nào.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-luxury-pearl border-b border-luxury-platinum">
                            <tr>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Thời gian</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Trạng thái</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Loại</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Tiêu đề</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Nội dung</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Đối tượng</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-luxury-platinum">
                            {logs.map((log) => (
                                <tr key={log._id} className={`transition-colors ${log.status === 'active' && (log.type === 'DANGER' || log.type === 'WARNING') ? 'bg-red-50' : 'hover:bg-luxury-cream/10'}`}>
                                    <td className="p-4 text-luxury-gray text-sm">
                                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="p-4">
                                        {log.status === 'active' ? (
                                            <span className="text-red-600 font-bold text-xs uppercase border border-red-200 bg-red-50 px-2 py-1 rounded">Active</span>
                                        ) : (
                                            <span className="text-gray-500 text-xs uppercase border border-gray-200 bg-gray-50 px-2 py-1 rounded">Resolved</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'DANGER' ? 'bg-red-100 text-red-700' :
                                                log.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700 alert-blink' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-luxury-black font-medium">{log.title}</td>
                                    <td className="p-4 text-luxury-black">{log.message}</td>
                                    <td className="p-4 text-luxury-black">
                                        {log.detectedName !== 'Unknown' ? (
                                            <span className="text-blue-600 font-bold">{log.detectedName}</span>
                                        ) : (
                                            <span className="text-gray-500 italic">{log.detectedName}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {log.videoUrl ? (
                                            <button 
                                                onClick={() => setSelectedVideo({ url: log.videoUrl, timestamp: log.timestamp })}
                                                className="bg-luxury-brown text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest hover:bg-luxury-charcoal transition-all shadow-sm flex items-center gap-1"
                                            >
                                                <span>👁️</span> Xem Video
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 text-[10px] uppercase tracking-widest italic">No Video</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <style>{`
                .alert-blink {
                    animation: blinker 1s linear infinite;
                }
                @keyframes blinker {
                    50% { opacity: 0.5; }
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminSecurity;
