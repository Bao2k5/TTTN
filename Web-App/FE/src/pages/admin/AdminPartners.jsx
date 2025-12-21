import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const fetchPartners = async () => {
  const response = await api.get('/partners/admin/all');
  return response.data;
};

const createPartner = async (partnerData) => {
  const response = await api.post('/partners/admin/create', partnerData);
  return response.data;
};

const updatePartner = async ({ id, data }) => {
  const response = await api.put(`/partners/admin/update/${id}`, data);
  return response.data;
};

const deletePartner = async (id) => {
  const response = await api.delete(`/partners/admin/delete/${id}`);
  return response.data;
};

const AdminPartners = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    url: '',
    description: '',
    displayFrom: new Date().toISOString().split('T')[0],
    displayTo: '',
    isActive: true,
    position: 0,
  });

  const { data } = useQuery('partners', fetchPartners);
  const partners = data?.data || [];

  const createMutation = useMutation(createPartner, {
    onSuccess: () => {
      queryClient.invalidateQueries('partners');
      resetForm();
    },
  });

  const updateMutation = useMutation(updatePartner, {
    onSuccess: () => {
      queryClient.invalidateQueries('partners');
      resetForm();
    },
  });

  const deleteMutation = useMutation(deletePartner, {
    onSuccess: () => {
      queryClient.invalidateQueries('partners');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (partner) => {
    setFormData({
      name: partner.name,
      logo: partner.logo,
      url: partner.url,
      description: partner.description,
      displayFrom: partner.displayFrom?.split('T')[0] || '',
      displayTo: partner.displayTo?.split('T')[0] || '',
      isActive: partner.isActive,
      position: partner.position,
    });
    setEditingId(partner._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa partner này?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      url: '',
      description: '',
      displayFrom: new Date().toISOString().split('T')[0],
      displayTo: '',
      isActive: true,
      position: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-luxury-cream p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-4xl font-light text-luxury-charcoal mb-8">
          Quản Lý Đối Tác
        </h1>

        {}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-luxury-sand">
          <h2 className="text-2xl font-semibold text-luxury-charcoal mb-6">
            {editingId ? 'Chỉnh Sửa Partner' : 'Thêm Partner Mới'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {}
              <input
                type="text"
                placeholder="Tên Partner"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
                required
              />

              {}
              <input
                type="text"
                placeholder="Logo (tên file từ /public/images/partners/)"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
                required
              />

              {}
              <input
                type="url"
                placeholder="Website (https://...)"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
              />

              {}
              <input
                type="number"
                placeholder="Vị trí (0, 1, 2, ...)"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                className="px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
              />

              {}
              <input
                type="date"
                value={formData.displayFrom}
                onChange={(e) => setFormData({ ...formData, displayFrom: e.target.value })}
                className="px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
              />

              {}
              <input
                type="date"
                value={formData.displayTo}
                onChange={(e) => setFormData({ ...formData, displayTo: e.target.value })}
                className="px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
              />
            </div>

            {}
            <textarea
              placeholder="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-luxury-sand rounded-lg focus:outline-none focus:border-luxury-brown"
              rows={3}
            />

            {}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-luxury-brown">Kích hoạt</span>
            </label>

            {}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-luxury-charcoal text-white rounded-lg hover:bg-luxury-brown transition"
              >
                {editingId ? 'Cập Nhật' : 'Thêm'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-luxury-sand text-luxury-brown rounded-lg hover:bg-luxury-beige transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-luxury-sand overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxury-ivory">
              <tr>
                <th className="px-4 py-3 text-left text-luxury-charcoal">Tên</th>
                <th className="px-4 py-3 text-left text-luxury-charcoal">Logo</th>
                <th className="px-4 py-3 text-left text-luxury-charcoal">Từ Ngày</th>
                <th className="px-4 py-3 text-left text-luxury-charcoal">Đến Ngày</th>
                <th className="px-4 py-3 text-left text-luxury-charcoal">Trạng Thái</th>
                <th className="px-4 py-3 text-center text-luxury-charcoal">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner._id} className="border-t border-luxury-sand hover:bg-luxury-cream">
                  <td className="px-4 py-3">{partner.name}</td>
                  <td className="px-4 py-3 text-sm text-luxury-brown">{partner.logo}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(partner.displayFrom).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {partner.displayTo
                      ? new Date(partner.displayTo).toLocaleDateString('vi-VN')
                      : 'Vĩnh viễn'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        partner.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {partner.isActive ? 'Kích hoạt' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="px-3 py-1 bg-luxury-sand text-luxury-brown rounded hover:bg-luxury-beige transition text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {partners.length === 0 && (
            <div className="text-center py-8 text-luxury-taupe">
              Chưa có partners nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPartners;
