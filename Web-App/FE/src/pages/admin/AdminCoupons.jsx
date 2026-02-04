import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatDate, formatCurrency } from '../../utils/helpers';
import api from '../../services/api';

function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percent', // percent | fixed
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 100,
        onePerUser: true,
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/coupons');
            const data = response.data?.data || response.data || [];
            setCoupons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            // toast.error('Lỗi tải danh sách mã giảm giá'); // Silent fail or user friendly
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);

            // Xử lý ngày giờ theo múi giờ địa phương để tránh lỗi lệch giờ
            const processDate = (dateStr, isEnd = false) => {
                if (!dateStr) return undefined;
                // Thêm giờ vào chuỗi ngày để ép trình duyệt hiểu là giờ địa phương
                // VD: "2026-02-05" -> "2026-02-05T00:00:00" (Local) -> UTC
                const timeStr = isEnd ? 'T23:59:59.999' : 'T00:00:00.000';
                return new Date(dateStr + timeStr).toISOString();
            };

            const payload = {
                ...formData,
                discountValue: Number(formData.discountValue),
                minOrderAmount: Number(formData.minOrderAmount),
                maxDiscountAmount: Number(formData.maxDiscountAmount),
                usageLimit: Number(formData.usageLimit),
                startDate: processDate(formData.startDate),
                endDate: processDate(formData.endDate, true) // EndDate phải là cuối ngày
            };

            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon._id}`, payload);
                toast.success('Cập nhật mã giảm giá thành công');
            } else {
                await api.post('/coupons', payload);
                toast.success('Tạo mã giảm giá mới thành công');
            }

            setShowForm(false);
            setEditingCoupon(null);
            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            const message = error.response?.data?.message || 'Lỗi khi lưu mã giảm giá';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            usageLimit: coupon.usageLimit || 0,
            onePerUser: coupon.onePerUser,
            startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
            endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
            isActive: coupon.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã này?')) return;

        try {
            await api.delete(`/coupons/${id}`);
            toast.success('Đã xóa mã giảm giá');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Lỗi khi xóa mã giảm giá');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percent',
            discountValue: 0,
            minOrderAmount: 0,
            maxDiscountAmount: 0,
            usageLimit: 100,
            onePerUser: true,
            startDate: '',
            endDate: '',
            isActive: true
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCoupon(null);
        resetForm();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold font-serif text-luxury-charcoal">Quản lý Mã Giảm Giá</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-luxury-gold text-white px-6 py-2 rounded-lg hover:bg-luxury-brown transition shadow-md flex items-center gap-2"
                    >
                        {showForm ? 'Đóng Form' : '+ Tạo Mã Mới'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-luxury-beige mb-8 animate-fade-in-down">
                        <h2 className="text-xl font-bold mb-6 text-luxury-charcoal border-b pb-2">
                            {editingCoupon ? 'Chỉnh sửa Mã' : 'Tạo Mã Giảm Giá Mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Cột Trái */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Mã Code (In hoa) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold focus:border-transparent uppercase font-bold tracking-wider"
                                        placeholder="SALE50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Loại giảm giá</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                    >
                                        <option value="percent">Theo phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (VND)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                        Giá trị giảm {formData.discountType === 'percent' ? '(%)' : '(VND)'} *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                    />
                                </div>

                                {formData.discountType === 'percent' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Giảm tối đa (VND)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                            placeholder="0 = Không giới hạn"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Nhập 0 nếu không giới hạn số tiền giảm tối đa</p>
                                    </div>
                                )}
                            </div>

                            {/* Cột Phải */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Đơn hàng tối thiểu (VND)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Ngày kết thúc *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Giới hạn số lượng</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <input
                                            type="checkbox"
                                            id="onePerUser"
                                            checked={formData.onePerUser}
                                            onChange={(e) => setFormData({ ...formData, onePerUser: e.target.checked })}
                                            className="w-5 h-5 text-luxury-gold border-gray-300 rounded focus:ring-luxury-gold"
                                        />
                                        <label htmlFor="onePerUser" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                            Mỗi người chỉ dùng 1 lần
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Mô tả ngắn</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-luxury-gold"
                                        rows="2"
                                        placeholder="VD: Mã giảm giá Tết 2024"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 md:col-span-2 flex gap-4 mt-4 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-luxury-charcoal text-white px-6 py-3 rounded-lg hover:bg-black transition font-medium shadow-lg transform hover:-translate-y-0.5"
                                >
                                    {submitting ? '⏳ Đang lưu...' : (editingCoupon ? '💾 Cập Nhật Mã' : '✨ Tạo Mã Mới')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Coupon List Table */}
                <div className="bg-white rounded-lg shadow-lg border border-luxury-platinum overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-luxury-pearl border-b border-luxury-platinum">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Mã Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Giảm giá</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Điều kiện</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Thời hạn</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Lượt dùng</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-luxury-platinum">
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                                            Chưa có mã giảm giá nào. Hãy tạo mã đầu tiên! 🎟️
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon._id} className="hover:bg-luxury-ivory transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200 tracking-wide">
                                                    {coupon.code}
                                                </span>
                                                {coupon.description && (
                                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{coupon.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-luxury-charcoal">
                                                {coupon.discountType === 'percent'
                                                    ? <span className="text-blue-600">Giảm {coupon.discountValue}%</span>
                                                    : <span className="text-green-600">Giảm {formatCurrency(coupon.discountValue)}</span>
                                                }
                                                {coupon.maxDiscountAmount > 0 && (
                                                    <div className="text-xs text-gray-500">Tối đa: {formatCurrency(coupon.maxDiscountAmount)}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                Min: {formatCurrency(coupon.minOrderAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{coupon.startDate ? formatDate(coupon.startDate) : '---'}</span>
                                                    <span className="text-xs text-gray-400">đến</span>
                                                    <span>{coupon.endDate ? formatDate(coupon.endDate) : 'Vô thời hạn'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                        title="Sửa"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                                        title="Xóa"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminCoupons;
