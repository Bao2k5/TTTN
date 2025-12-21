
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, isOpen, onClose, isInWishlist }) => {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) return null;

  const images = product.images || ['/images/placeholder.jpg'];
  const currentPrice = product.priceSale || product.price;
  const hasDiscount = product.priceSale && product.priceSale < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.priceSale) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity 
      })).unwrap();

      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product._id));
    toast.success(isInWishlist ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          />

          {}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                {}
                <div className="space-y-4">
                  {}
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    {hasDiscount && (
                      <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{discountPercent}%
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <span className="text-white text-xl font-bold">Hết hàng</span>
                      </div>
                    )}
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? 'border-amber-500 ring-2 ring-amber-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {}
                <div className="flex flex-col space-y-4">
                  {}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {product.name}
                  </h2>

                  {}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full">
                      {product.category}
                    </span>
                    {product.material && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {product.material}
                      </span>
                    )}
                  </div>

                  {}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-amber-600">
                      {currentPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {hasDiscount && (
                      <span className="text-xl text-gray-400 line-through">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>

                  {}
                  {product.description && (
                    <div className="text-gray-600 text-sm line-clamp-3">
                      {product.description}
                    </div>
                  )}

                  {}
                  <div className="text-sm">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-medium">
                        ✓ Còn hàng ({product.stock} sản phẩm)
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        ✗ Hết hàng
                      </span>
                    )}
                  </div>

                  {}
                  {product.stock > 0 && (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700 font-medium">Số lượng:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          -
                        </button>
                        <span className="px-6 py-2 border-x border-gray-300 font-medium min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock}
                          className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0 || isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </button>

                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isInWishlist
                          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600'
                      }`}
                      title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                    >
                      {isInWishlist ? (
                        <HeartSolidIcon className="w-6 h-6" />
                      ) : (
                        <HeartIcon className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {}
                  <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                    <p>• Miễn phí vận chuyển cho đơn hàng trên 500.000₫</p>
                    <p>• Bảo hành 12 tháng</p>
                    <p>• Đổi trả trong 7 ngày</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
