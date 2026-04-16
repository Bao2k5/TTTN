import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/wishlistStore';
import useAuthStore from '../store/authStore';
import ProductCard from '../components/common/ProductCard';

const Wishlist = () => {
  const { user } = useAuthStore();
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-pearl">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-6">💝</div>
          <h2 className="text-3xl font-display font-light text-luxury-black mb-4">
            Đăng nhập để xem yêu thích
          </h2>
          <p className="text-luxury-darkGray mb-8 font-light">
            Hãy đăng nhập để lưu và quản lý các sản phẩm yêu thích của bạn
          </p>
          <Link 
            to="/login" 
            className="btn-luxury-primary"
          >
            ĐĂNG NHẬP
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-black mx-auto mb-4"></div>
          <p className="text-luxury-darkGray">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-light text-luxury-black mb-6 tracking-wide">
            SẢN PHẨM YÊU THÍCH
          </h1>
          <div className="w-24 h-px bg-luxury-black mx-auto mb-6"></div>
          <p className="text-luxury-darkGray font-light max-w-2xl mx-auto">
            Tất cả những sản phẩm trang sức mà bạn yêu thích nhất
          </p>
        </div>

        {items.length === 0 ? (

          <div className="text-center max-w-md mx-auto py-16">
            <div className="text-8xl mb-6">💝</div>
            <h3 className="text-2xl font-display font-light text-luxury-black mb-4">
              Chưa có sản phẩm yêu thích
            </h3>
            <p className="text-luxury-darkGray mb-8 font-light">
              Hãy khám phá bộ sưu tập trang sức và thêm những sản phẩm yêu thích của bạn
            </p>
            <Link 
              to="/products" 
              className="btn-luxury-primary"
            >
              KHÁM PHÁ SẢN PHẨM
            </Link>
          </div>
        ) : (

          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-luxury-darkGray font-light">
                {items.length} sản phẩm trong danh sách yêu thích
              </p>
              <Link 
                to="/products" 
                className="text-luxury-black hover:text-luxury-darkGray font-light underline transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item) => (
                <div key={item.product._id} className="relative group">
                  <ProductCard product={item.product} />

                  {}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-luxury-white rounded-full shadow-md flex items-center justify-center text-luxury-darkGray hover:text-red-500 hover:bg-red-50 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    title="Xóa khỏi yêu thích"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {}
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/products" 
                  className="btn-luxury-secondary"
                >
                  TIẾP TỤC MUA SẮM
                </Link>
                <Link 
                  to="/cart" 
                  className="btn-luxury-primary"
                >
                  XEM GIỎ HÀNG
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;