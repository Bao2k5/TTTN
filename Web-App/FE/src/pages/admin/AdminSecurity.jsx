import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api'; // Ensure you have an axios instance or similar

const AdminSecurity = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/security/logs'); // Adjust endpoint if needed
            if (response.data.success) {
                setLogs(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch security logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide">Security Monitor</h1>
                    <p className="text-luxury-gray">Giám sát An ninh & Cảnh báo Xâm nhập</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="bg-luxury-black text-white px-4 py-2 rounded hover:bg-luxury-charcoal transition-colors"
                >
                    Làm mới
                </button>
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
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Loại</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Tiêu đề</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Nội dung</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Đối tượng</th>
                                <th className="p-4 font-medium text-luxury-black text-sm uppercase tracking-wider">Hình ảnh</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-luxury-platinum">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-luxury-cream/10 transition-colors">
                                    <td className="p-4 text-luxury-gray text-sm">
                                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'DANGER' ? 'bg-red-100 text-red-700' :
                                                log.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
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
                                        {log.imageUrl && (
                                            <a href={log.imageUrl} target="_blank" rel="noopener noreferrer" className="text-luxury-brown underline text-xs">
                                                Xem ảnh
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSecurity;
