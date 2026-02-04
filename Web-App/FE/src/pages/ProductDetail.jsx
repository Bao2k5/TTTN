import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import ReviewCard from '../components/common/ReviewCard';
import api from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useWishlistStore from '../store/wishlistStore';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho form đánh giá
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {

      if (user) {
        await api.post('/cart', {
          productId: product.id,
          qty: quantity
        });
      }

      addToCart(product, quantity);

      alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);

      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng wishlist!');
      return;
    }

    setWishlistLoading(true);
    try {
      const productId = product._id || product.id;
      const inWishlist = isInWishlist(productId);
      if (inWishlist) {
        await removeFromWishlist(productId);
        alert('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToWishlist(product);
        alert('❤️ Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setWishlistLoading(false);
    }

  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để viết đánh giá!');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        text: reviewText
      });

      alert('Cảm ơn bạn đã đánh giá sản phẩm!');

      // Reset form sau khi gửi
      setReviewRating(5);
      setReviewTitle('');
      setReviewText('');

      // Load lại danh sách review
      const rev = await api.get(`/products/${id}/reviews`);
      setProductReviews((rev.data || []).map(r => ({
        id: r._id,
        userName: r.user?.name || 'Ẩn danh',
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
        comment: r.text,
        title: r.title
      })));

    } catch (error) {
      console.error('Review error:', error);
      alert(error.response?.data?.msg || 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data;

        const mapped = {
          id: p._id,
          name: p.name,
          price: p.price,
          priceSale: p.priceSale,
          images: (p.images || []).map(i => {
            let url = i.url || i;
            if (url && typeof url === 'string' && url.startsWith('/') && !url.startsWith('http')) {
              return (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api', '') + url;
            }
            return url;
          }),
          rating: p.ratingsAvg || 0,
          reviews: p.ratingsCount || 0,
          stock: p.stock,
          inStock: p.stock ? p.stock > 0 : true,
          description: p.description,
          specifications: p.specifications || p.attributes || {},
          material: p.attributes?.material || '',
          category: p.category || (p.collection && p.collection.name) || '',
        };
        setProduct(mapped);

        const params = { limit: 8 };
        if (p.collection) params.collection = p.collection._id;
        else if (p.category) params.category = p.category;
        const rel = await api.get('/products', { params });
        const relItems = (rel.data.products || []).filter(x => x._id !== p._id).slice(0, 4).map(x => ({
          id: x._id,
          name: x.name,
          price: x.price,
          images: (x.images || []).map(i => (i.url || i)),
        }));
        setRelatedProducts(relItems);

        try {
          const rev = await api.get(`/products/${id}/reviews`);
          setProductReviews((rev.data || []).map(r => ({
            id: r._id,
            userName: r.user?.name || 'Ẩn danh',
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
            comment: r.text,
            title: r.title
          })));
        } catch (e) {
          console.error('Error fetching reviews:', e);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  if (loading || !product) return <div className="min-h-screen bg-white p-12">Đang tải sản phẩm...</div>;

  const inStock = (product.inStock !== undefined) ? product.inStock : (product.stock ? product.stock > 0 : true);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb điều hướng */}
      <div className="bg-luxury-ivory py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-luxury-brown font-light">
            <Link to="/" className="hover:text-luxury-charcoal">Trang chủ</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-luxury-charcoal">Sản phẩm</Link>
            <span>/</span>
            <span className="text-luxury-charcoal">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Phần chi tiết sản phẩm chính */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Cột trái: Ảnh sản phẩm */}
          <div>
            <div className="aspect-square bg-gray-50 mb-4 overflow-hidden border border-luxury-beige">
              <img
                src={product.images[selectedImage]?.url || product.images[selectedImage] || 'https://via.placeholder.com/500'}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/500?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square bg-gray-50 overflow-hidden border-2 transition ${selectedImage === i ? 'border-luxury-charcoal' : 'border-gray-200 hover:border-luxury-taupe'
                    }`}
                >
                  <img
                    src={img?.url || img || 'https://via.placeholder.com/500'}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/500?text=No+Image';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div>
            <h1 className="text-4xl font-light text-luxury-charcoal mb-4 tracking-wide">{product.name}</h1>

            {/* Rating stars */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < product.rating ? 'text-luxury-taupe' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-luxury-brown font-light">({product.reviews} đánh giá)</span>
            </div>

            {/* Giá và trạng thái kho */}
            <div className="mb-8">
              <p className="text-4xl font-light text-luxury-charcoal mb-2">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-2">
                {inStock ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-light text-sm">Còn hàng</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-light text-sm">Hết hàng</span>
                  </>
                )}
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="space-y-3 mb-8 pb-8 border-b border-luxury-beige">
              <div className="flex items-center gap-3">
                <span className="text-luxury-brown font-light w-32">Chất liệu:</span>
                <span className="text-luxury-charcoal font-light">Bạc 925</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-luxury-brown font-light w-32">Danh mục:</span>
                <span className="text-luxury-charcoal font-light">{product.category}</span>
              </div>
            </div>

            {/* Chọn số lượng */}
            <div className="mb-8">
              <label className="block text-luxury-charcoal font-light mb-3">Số lượng</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-luxury-beige">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-luxury-charcoal hover:bg-luxury-ivory transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-12 text-center border-x border-luxury-beige text-luxury-charcoal font-light focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-luxury-charcoal hover:bg-luxury-ivory transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Nút thao tác */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="w-full bg-luxury-charcoal text-white py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inStock || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ĐANG THÊM...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    THÊM VÀO GIỎ HÀNG
                  </>
                )}
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="w-full border-2 border-luxury-charcoal text-luxury-charcoal py-4 text-sm font-light tracking-wider hover:bg-luxury-charcoal hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wishlistLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ĐANG XỬ LÝ...
                  </>
                ) : (
                  <>
                    <svg
                      className={`w-5 h-5 ${product && isInWishlist(product._id) ? 'fill-current' : ''}`}
                      fill={product && isInWishlist(product._id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {product && isInWishlist(product._id) ? 'ĐÃ YÊU THÍCH' : 'THÊM VÀO YÊU THÍCH'}
                  </>
                )}
              </button>
            </div>

            {/* Cam kết dịch vụ */}
            <div className="space-y-4 bg-luxury-ivory p-6 border border-luxury-beige">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-luxury-charcoal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div>
                  <h4 className="font-light text-luxury-charcoal mb-1">Miễn phí vận chuyển</h4>
                  <p className="text-sm text-luxury-brown font-light">Cho đơn hàng từ 500.000đ</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-luxury-charcoal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h4 className="font-light text-luxury-charcoal mb-1">Bảo hành trọn đời</h4>
                  <p className="text-sm text-luxury-brown font-light">Chất lượng được đảm bảo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-luxury-charcoal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <h4 className="font-light text-luxury-charcoal mb-1">Đổi trả dễ dàng</h4>
                  <p className="text-sm text-luxury-brown font-light">Trong vòng 30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần Tabs: Mô tả, Thông số, Đánh giá */}
        <div className="mb-20">
          {/* Tab headers */}
          <div className="flex gap-8 border-b border-luxury-beige mb-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 text-sm font-light tracking-wider transition ${activeTab === 'description'
                ? 'text-luxury-charcoal border-b-2 border-luxury-charcoal'
                : 'text-luxury-taupe hover:text-luxury-charcoal'
                }`}
            >
              MÔ TẢ
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`pb-4 text-sm font-light tracking-wider transition ${activeTab === 'specifications'
                ? 'text-luxury-charcoal border-b-2 border-luxury-charcoal'
                : 'text-luxury-taupe hover:text-luxury-charcoal'
                }`}
            >
              THÔNG SỐ KỸ THUẬT
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-light tracking-wider transition ${activeTab === 'reviews'
                ? 'text-luxury-charcoal border-b-2 border-luxury-charcoal'
                : 'text-luxury-taupe hover:text-luxury-charcoal'
                }`}
            >
              ĐÁNH GIÁ ({product.reviews})
            </button>
          </div>

          {/* Tab content */}
          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="text-luxury-brown font-light leading-relaxed text-lg">
                {product.description}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => {
                  const labels = {
                    material: 'Chất liệu',
                    gemstone: 'Đá quý',
                    pearl: 'Ngọc trai',
                    weight: 'Trọng lượng',
                    size: 'Kích thước',
                    length: 'Chiều dài',
                    diameter: 'Đường kính'
                  };
                  return (
                    <div key={key} className="flex border-b border-luxury-ivory pb-3">
                      <span className="w-48 text-luxury-brown font-light">{labels[key] || key}:</span>
                      <span className="flex-1 text-luxury-charcoal font-light">{key === 'material' ? 'Bạc 925' : value}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Review Form */}
                <div className="bg-gray-50 p-6 border border-luxury-beige rounded-sm mb-8">
                  <h3 className="text-lg font-light text-luxury-charcoal mb-4">Viết đánh giá của bạn</h3>
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm text-luxury-brown mb-2">Đánh giá của bạn</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <svg
                                className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-luxury-brown mb-2">Tiêu đề</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full p-3 border border-luxury-beige focus:border-luxury-charcoal focus:outline-none bg-white font-light"
                          placeholder="Tóm tắt trải nghiệm của bạn"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-luxury-brown mb-2">Nội dung</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows="4"
                          className="w-full p-3 border border-luxury-beige focus:border-luxury-charcoal focus:outline-none bg-white font-light"
                          placeholder="Chia sẻ chi tiết về sản phẩm..."
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-luxury-charcoal text-white px-8 py-3 text-sm font-light tracking-wider hover:bg-luxury-brown transition-colors disabled:opacity-50"
                      >
                        {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-luxury-brown mb-4">Vui lòng đăng nhập để viết đánh giá</p>
                      <Link to="/login" className="inline-block border border-luxury-charcoal text-luxury-charcoal px-6 py-2 hover:bg-luxury-charcoal hover:text-white transition-colors">
                        Đăng nhập ngay
                      </Link>
                    </div>
                  )}
                </div>

                {productReviews.length > 0 ? (
                  productReviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-luxury-brown font-light italic text-center">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4 text-luxury-charcoal tracking-wide">SẢN PHẨM LIÊN QUAN</h2>
            <div className="w-20 h-1 bg-luxury-taupe mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
