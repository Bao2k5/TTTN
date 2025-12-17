import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const AdminCollections = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await api.get('/collections');
      setCollections(response.data.collections || response.data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      let imageUrl = formData.image;
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      const data = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: imageUrl
      };

      console.log('Submitting collection data:', data);

      if (editingCollection) {
        await api.put(`/collections/${editingCollection._id}`, data);
      } else {
        await api.post('/collections', data);
      }

      setShowModal(false);
      resetForm();
      loadCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Lỗi khi lưu bộ sưu tập: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bộ sưu tập này?')) return;
    try {
      await api.delete(`/collections/${id}`);
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Lỗi khi xóa bộ sưu tập: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      image: collection.image || ''
    });
    setSelectedFile(null);
    setImagePreview(collection.image || '');
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return formData.image;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', selectedFile);

      console.log('📤 Uploading image:', selectedFile.name);

      const response = await api.post('/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Upload response:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Lỗi khi upload ảnh: ' + (error.response?.data?.message || error.message));
      return formData.image; // Return existing image URL if upload fails
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: ''
    });
    setEditingCollection(null);
    setSelectedFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-black"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide">Quản Lý Bộ Sưu Tập</h1>
            <p className="text-luxury-gray">Thêm, sửa, xóa bộ sưu tập trang sức</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-luxury px-6 py-3"
          >
            + Thêm Bộ Sưu Tập
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection._id} className="card-luxury overflow-hidden group">
              {}
              <div className="relative h-48 bg-luxury-pearl overflow-hidden">
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luxury-gray">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {}
              <div className="p-6">
                <h3 className="font-display text-xl text-luxury-black mb-2">{collection.name}</h3>
                <p className="text-sm text-luxury-gray mb-1">Slug: {collection.slug}</p>
                {collection.description && (
                  <p className="text-luxury-gray text-sm mb-4 line-clamp-2">{collection.description}</p>
                )}
                <p className="text-sm text-luxury-gray mb-4">
                  Sản phẩm: {collection.productCount || 0}
                </p>

                {}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(collection)}
                    className="flex-1 px-4 py-2 border border-luxury-platinum text-luxury-black hover:bg-luxury-pearl transition-colors rounded-md"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(collection._id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        {collections.length === 0 && (
          <div className="card-luxury p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-luxury-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="font-display text-xl text-luxury-black mb-2">Chưa có bộ sưu tập nào</h3>
            <p className="text-luxury-gray mb-6">Bắt đầu bằng cách thêm bộ sưu tập đầu tiên</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="btn-luxury px-6 py-3"
            >
              + Thêm Bộ Sưu Tập
            </button>
          </div>
        )}
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {}
            <div className="sticky top-0 bg-white border-b border-luxury-platinum px-8 py-6 flex items-center justify-between">
              <h2 className="font-display text-3xl text-luxury-black">
                {editingCollection ? 'Sửa Bộ Sưu Tập' : 'Thêm Bộ Sưu Tập Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-luxury-gray hover:text-luxury-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Tên Bộ Sưu Tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-4 py-3 border border-luxury-platinum rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="VD: Nhẫn, Dây Chuyền, Bông Tai..."
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-luxury-platinum rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent bg-luxury-pearl"
                  placeholder="VD: nhan, day-chuyen, bong-tai..."
                />
                <p className="mt-1 text-sm text-luxury-gray">Tự động tạo từ tên, có thể chỉnh sửa</p>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-luxury-platinum rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="Mô tả ngắn về bộ sưu tập này..."
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Hình Ảnh
                </label>

                {}
                {imagePreview && (
                  <div className="mb-4 relative w-full h-48 bg-luxury-pearl rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {}
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-luxury-platinum rounded-md p-6 text-center hover:border-luxury-gold transition-colors">
                      <svg className="w-10 h-10 mx-auto mb-2 text-luxury-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-luxury-gray">
                        {selectedFile ? selectedFile.name : 'Chọn ảnh hoặc kéo thả vào đây'}
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border border-luxury-platinum text-luxury-black hover:bg-luxury-pearl transition-colors rounded-md"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingImage}
                      className="flex-1 btn-luxury px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang upload...
                        </span>
                      ) : editingCollection ? (
                        'Cập Nhật'
                      ) : (
                        'Thêm Bộ Sưu Tập'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCollections;
