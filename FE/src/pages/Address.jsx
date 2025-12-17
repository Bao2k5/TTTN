import { useState, useEffect } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/addressService';

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    label: 'home',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      alert('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAddress) {

        await updateAddress(editingAddress._id, formData);
        alert('Cập nhật địa chỉ thành công!');
      } else {

        await createAddress(formData);
        alert('Thêm địa chỉ mới thành công!');
      }

      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address: address.address,
      label: address.label,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
      await deleteAddress(id);
      alert('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      alert('Đặt làm địa chỉ mặc định thành công!');
      loadAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      alert('Không thể đặt làm địa chỉ mặc định');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      address: '',
      label: 'home',
      isDefault: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const getLabelText = (label) => {
    const labels = {
      home: '🏠 Nhà riêng',
      office: '🏢 Văn phòng',
      other: '📍 Khác'
    };
    return labels[label] || label;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-taupe"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-luxury-charcoal">Sổ Địa Chỉ</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-luxury-charcoal text-white px-6 py-2 hover:bg-luxury-brown transition"
        >
          {showForm ? 'Đóng' : '+ Thêm địa chỉ mới'}
        </button>
      </div>

      {}
      {showForm && (
        <div className="bg-white border border-luxury-beige p-6 mb-6 shadow">
          <h2 className="text-xl font-light mb-4">
            {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-light mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                  placeholder="0901234567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-light mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                  placeholder="Hà Nội"
                />
              </div>
              <div>
                <label className="block text-sm font-light mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                  placeholder="Ba Đình"
                />
              </div>
              <div>
                <label className="block text-sm font-light mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="ward"
                  required
                  value={formData.ward}
                  onChange={handleChange}
                  className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                  placeholder="Phường Điện Biên"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light mb-1">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                placeholder="Số nhà, tên đường..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light mb-1">Loại địa chỉ</label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="w-full border border-luxury-beige px-3 py-2 focus:outline-none focus:border-luxury-taupe"
                >
                  <option value="home">🏠 Nhà riêng</option>
                  <option value="office">🏢 Văn phòng</option>
                  <option value="other">📍 Khác</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm font-light">Đặt làm địa chỉ mặc định</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-luxury-charcoal text-white px-6 py-2 hover:bg-luxury-brown transition"
              >
                {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-luxury-beige px-6 py-2 hover:bg-luxury-ivory transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-white border border-luxury-beige">
            <p className="text-luxury-brown font-light">Bạn chưa có địa chỉ nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-luxury-taupe hover:text-luxury-charcoal underline"
            >
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white border ${addr.isDefault ? 'border-luxury-taupe shadow-md' : 'border-luxury-beige'} p-6 relative`}
            >
              {addr.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="bg-luxury-taupe text-white text-xs px-3 py-1 rounded-full">
                    Mặc định
                  </span>
                </div>
              )}

              <div className="pr-24">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{getLabelText(addr.label)}</span>
                </div>
                <h3 className="font-medium text-lg text-luxury-charcoal">{addr.fullName}</h3>
                <p className="text-luxury-brown">{addr.phone}</p>
                <p className="text-luxury-brown mt-2">
                  {addr.address}, {addr.ward}, {addr.district}, {addr.province}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-sm text-luxury-taupe hover:text-luxury-charcoal underline"
                  >
                    Chỉnh sửa
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-sm text-luxury-taupe hover:text-luxury-charcoal underline"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-sm text-red-500 hover:text-red-700 underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Address;
