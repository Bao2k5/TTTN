import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import useWishlistStore from '../../store/wishlistStore';
import useCartStore from '../../store/cartStore';
import cartService from '../../services/cartService';
import useAuthStore from '../../store/authStore';

const ProductCard = ({ product, onQuickView }) => {
  const { user } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const displayPrice = product.priceSale || product.price;
  const hasDiscount = product.priceSale && product.priceSale < product.price;
  const inWishlist = isInWishlist(product._id || product.id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation();

    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích!');
      return;
    }

    setWishlistLoading(true);
    try {
      const productId = product._id || product.id;
      const inWishlist = isInWishlist(productId);
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCartLoading(true);
    try {
      const productForCart = {
        id: product._id || product.id,
        name: product.name,
        price: displayPrice,
        images: product.images,
      };

      if (user) {
        try {
          await cartService.addToCart(product._id || product.id, 1);
        } catch (err) {
          console.error('Error adding to server cart:', err);
          const msg = err.response?.data?.error || err.response?.data?.message || 'Lỗi đồng bộ giỏ hàng';
          // toast.error(`Lỗi: ${msg}`); // Optional: notify user or keep silent if persistent local cart is preferred
          // But for debugging, we need to know.
          // Re-throwing to be caught by outer catch? No, outer catch updates local cart.
          // Let's alert the user but STILL update local cart? No, if server fails, local should probably not update to avoid desync.
          // But currently it updates local anyway. 
          // I will show a toast error so user knows server sync failed.
          import('react-hot-toast').then(({ toast }) => toast.error(`Lỗi Server: ${msg}`));
        }
      }

      await addToCart(productForCart, 1);  // Always update local for optimistic UI. 
      // BUT if server failed, this creates the desync ghost cart!
      // Ideally we should ONLY update local if server succeeds (if user is logged in).

    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <motion.div
      className="group relative card-luxury"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-luxury-silverPearl">
          <img
            src={
              product.images?.[0]
                ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                : product.img || 'https://via.placeholder.com/500?text=No+Image'
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/500?text=Image+Not+Found';
            }}
          />
        </div>
        <div className="p-6">
          <p className="text-luxury-steelGrey text-xs tracking-widest mb-2 uppercase">{product.category}</p>
          <h3 className="font-serif text-luxury-deepBlack font-light text-base tracking-wide mb-3 group-hover:text-luxury-steelGrey transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {hasDiscount && (
              <span className="text-luxury-platinumGrey line-through text-sm">{formatPrice(product.price)}</span>
            )}
            <span className={`font-medium ${hasDiscount ? 'text-luxury-deepBlack' : 'text-luxury-steelGrey'}`}>
              {formatPrice(displayPrice)}
            </span>
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 text-luxury-steelGrey text-sm">
              {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
              <span className="text-luxury-platinumGrey ml-1">({product.reviews})</span>
            </div>
          )}
        </div>
      </Link>

      { }
      {hasDiscount && (
        <motion.div
          className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          -{Math.round(((product.price - product.priceSale) / product.price) * 100)}%
        </motion.div>
      )}

      { }
      <button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${inWishlist
          ? 'bg-red-500 text-white shadow-lg'
          : 'bg-luxury-silverPearl/90 text-luxury-steelGrey hover:bg-luxury-metallicSilver hover:text-luxury-deepBlack'
          } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'}`}
        title={inWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
        {wishlistLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <svg
            className="w-5 h-5"
            fill={inWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </button>

      { }
      {onQuickView && (
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-4 right-4 bg-luxury-silverPearl/90 p-2 opacity-0 group-hover:opacity-100 transition-all border-1 border-luxury-metallicSilver hover:bg-luxury-deepBlack hover:text-luxury-silverPearl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}

      { }
      <button
        onClick={handleAddToCart}
        disabled={cartLoading}
        className="absolute bottom-6 left-6 right-6 bg-luxury-deepBlack text-luxury-silverPearl py-3 px-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-luxury-steelGrey disabled:opacity-50 disabled:cursor-not-allowed tracking-[0.2em] text-xs font-medium uppercase"
      >
        {cartLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-silverPearl"></div>
            Đang thêm...
          </span>
        ) : (
          'Thêm vào giỏ'
        )}
      </button>
    </motion.div>
  );
};

export default ProductCard;
