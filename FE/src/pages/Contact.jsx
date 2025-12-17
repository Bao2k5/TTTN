import { useState } from 'react';
import api from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', formData);
      alert('Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact error:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-luxury-white">
      { }
      <section className="relative h-[400px] bg-gradient-to-br from-luxury-pearl to-luxury-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-6xl font-light text-luxury-black tracking-wide mb-4">
            LIÊN HỆ
          </h1>
          <div className="w-24 h-px bg-luxury-gray mx-auto mb-4"></div>
          <p className="text-luxury-gray text-lg font-light tracking-wide">
            Chúng tôi luôn sẵn sàng lắng nghe
          </p>
        </div>
      </section>

      { }
      <section className="section-luxury">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            { }
            <div>
              <h2 className="font-serif text-4xl font-light text-luxury-black tracking-wide mb-8">
                Gửi Tin Nhắn
              </h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-luxury-darkGray text-sm uppercase tracking-widest mb-2">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-luxury w-full"
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>
                <div>
                  <label className="block text-luxury-darkGray text-sm uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-luxury w-full"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-luxury-darkGray text-sm uppercase tracking-widest mb-2">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-luxury w-full"
                    placeholder="0375 223 143"
                  />
                </div>
                <div>
                  <label className="block text-luxury-darkGray text-sm uppercase tracking-widest mb-2">
                    Tin Nhắn
                  </label>
                  <textarea
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input-luxury w-full resize-none"
                    placeholder="Nhập nội dung tin nhắn..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-luxury w-full disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'ĐANG GỬI...' : 'GỬI TIN NHẮN'}
                </button>
              </form>
            </div>

            { }
            <div>
              <h2 className="font-serif text-4xl font-light text-luxury-black tracking-wide mb-8">
                Thông Tin Liên Hệ
              </h2>

              <div className="space-y-8">
                { }
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-pearl rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-luxury-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-luxury-black font-medium uppercase tracking-widest text-sm mb-2">
                      Địa Chỉ
                    </h3>
                    <p className="text-luxury-gray font-light leading-relaxed">
                      Cộng Hòa, Tân Bình<br />
                      TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                { }
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-pearl rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-luxury-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-luxury-black font-medium uppercase tracking-widest text-sm mb-2">
                      Điện Thoại
                    </h3>
                    <p className="text-luxury-gray font-light">
                      <a href="tel:0375223143" className="hover:text-luxury-black transition">
                        0375 223 143
                      </a>
                    </p>
                  </div>
                </div>

                { }
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-pearl rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-luxury-darkGray" fill="currentColor" viewBox="0 0 48 48">
                      <path d="M24 4C13.5 4 5 11.9 5 21.7c0 6.1 3.4 11.5 8.5 14.8l-2.7 8.1 8.3-4.3c1.6.4 3.3.6 5 .6 10.5 0 19-7.9 19-17.7S34.5 4 24 4zm0 32c-1.6 0-3.1-.2-4.5-.6l-5.4 2.8 1.8-5.3C12.3 30.4 10 26.3 10 21.7 10 14.6 16.3 9 24 9s14 5.6 14 12.7-6.3 14.3-14 14.3z" />
                      <path d="M29.5 24.5h-4v-4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v4h-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h4v4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-4h4c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-luxury-black font-medium uppercase tracking-widest text-sm mb-2">
                      Zalo
                    </h3>
                    <p className="text-luxury-gray font-light">
                      <a href="https://zalo.me/0375225749" target="_blank" rel="noopener noreferrer" className="hover:text-luxury-black transition">
                        0375 225 749
                      </a>
                    </p>
                  </div>
                </div>

                { }
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-pearl rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-luxury-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-luxury-black font-medium uppercase tracking-widest text-sm mb-2">
                      Email
                    </h3>
                    <p className="text-luxury-gray font-light">
                      <a href="mailto:2331540071@vaa.edu.vn" className="hover:text-luxury-black transition">
                        2331540071@vaa.edu.vn
                      </a>
                    </p>
                  </div>
                </div>

                { }
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-pearl rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-luxury-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-luxury-black font-medium uppercase tracking-widest text-sm mb-2">
                      Giờ Làm Việc
                    </h3>
                    <p className="text-luxury-gray font-light leading-relaxed">
                      Thứ 2 - Thứ 7: 9:00 - 21:00<br />
                      Chủ Nhật: 10:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>

              { }
              <div className="mt-10 pt-10 border-t border-luxury-platinum">
                <h3 className="text-luxury-black font-medium uppercase tracking-widest text-sm mb-4">
                  Kết Nối Với Chúng Tôi
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-luxury-platinum rounded-full flex items-center justify-center text-luxury-darkGray hover:bg-luxury-black hover:text-white hover:border-luxury-black transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-luxury-platinum rounded-full flex items-center justify-center text-luxury-darkGray hover:bg-luxury-black hover:text-white hover:border-luxury-black transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-luxury-platinum rounded-full flex items-center justify-center text-luxury-darkGray hover:bg-luxury-black hover:text-white hover:border-luxury-black transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                  <a
                    href="https://zalo.me/0375225749"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-luxury-platinum rounded-full flex items-center justify-center text-luxury-darkGray hover:bg-luxury-black hover:text-white hover:border-luxury-black transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 48 48">
                      <path d="M24 4C13.5 4 5 11.9 5 21.7c0 6.1 3.4 11.5 8.5 14.8l-2.7 8.1 8.3-4.3c1.6.4 3.3.6 5 .6 10.5 0 19-7.9 19-17.7S34.5 4 24 4zm0 32c-1.6 0-3.1-.2-4.5-.6l-5.4 2.8 1.8-5.3C12.3 30.4 10 26.3 10 21.7 10 14.6 16.3 9 24 9s14 5.6 14 12.7-6.3 14.3-14 14.3z" />
                      <path d="M29.5 24.5h-4v-4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v4h-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h4v4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-4h4c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
