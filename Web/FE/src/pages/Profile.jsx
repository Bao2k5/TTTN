import { Link } from 'react-router-dom';

const Profile = () => {

  const user = {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80'
  };

  return (
    <div className="min-h-screen bg-luxury-silverPearl">
      {}
      <div className="bg-gradient-to-b from-luxury-silverPearlDark to-luxury-silverPearl py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-light mb-4 text-luxury-deepBlack tracking-wide text-center">TÀI KHOẢN</h1>
          <div className="w-20 h-1 bg-luxury-platinumGrey mx-auto"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {}
          <div className="space-y-2">
            <Link to="/profile" className="block px-4 py-3 bg-luxury-deepBlack text-luxury-silverPearl font-light">
              Thông tin tài khoản
            </Link>
            <Link to="/orders" className="block px-4 py-3 border border-luxury-metallicSilver text-luxury-steelGrey hover:bg-luxury-metallicSilver/50 font-light transition">
              Đơn hàng của tôi
            </Link>
            <Link to="/wishlist" className="block px-4 py-3 border border-luxury-metallicSilver text-luxury-steelGrey hover:bg-luxury-metallicSilver/50 font-light transition">
              Sản phẩm yêu thích
            </Link>
            <button className="block w-full text-left px-4 py-3 border border-luxury-metallicSilver text-red-600 hover:bg-red-50 font-light transition">
              Đăng xuất
            </button>
          </div>

          {}
          <div className="md:col-span-3">
            <div className="bg-luxury-silverPearl border border-luxury-metallicSilver p-8">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-luxury-metallicSilver">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-luxury-silverPearlDark">
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-luxury-deepBlack mb-2">{user.fullName}</h2>
                  <button className="text-sm text-luxury-steelGrey hover:text-luxury-deepBlack font-light">
                    Thay đổi ảnh đại diện
                  </button>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-luxury-deepBlack font-light mb-2">Họ và tên</label>
                    <input
                      type="text"
                      defaultValue={user.fullName}
                      className="w-full border border-luxury-metallicSilver px-4 py-3 focus:outline-none focus:border-luxury-platinumGrey font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-deepBlack font-light mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      defaultValue={user.phone}
                      className="w-full border border-luxury-metallicSilver px-4 py-3 focus:outline-none focus:border-luxury-platinumGrey font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-luxury-deepBlack font-light mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full border border-luxury-metallicSilver px-4 py-3 focus:outline-none focus:border-luxury-platinumGrey font-light"
                  />
                </div>

                <div className="pt-6 border-t border-luxury-metallicSilver">
                  <h3 className="text-lg font-light text-luxury-deepBlack mb-4">Đổi mật khẩu</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-luxury-deepBlack font-light mb-2">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        className="w-full border border-luxury-metallicSilver px-4 py-3 focus:outline-none focus:border-luxury-platinumGrey font-light"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-luxury-deepBlack font-light mb-2">Mật khẩu mới</label>
                        <input
                          type="password"
                          className="w-full border border-luxury-metallicSilver px-4 py-3 focus:outline-none focus:border-luxury-platinumGrey font-light"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-luxury-deepBlack font-light mb-2">Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          className="w-full border border-luxury-metallicSilver px-4 py-3 focus:outline-none focus:border-luxury-platinumGrey font-light"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-luxury-deepBlack text-luxury-silverPearl px-12 py-4 text-sm font-light tracking-wider hover:bg-luxury-steelGrey transition-all duration-300"
                  >
                    LƯU THAY ĐỔI
                  </button>
                  <button
                    type="button"
                    className="border-2 border-luxury-metallicSilver text-luxury-steelGrey px-12 py-4 text-sm font-light tracking-wider hover:border-luxury-platinumGrey transition-all duration-300"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
