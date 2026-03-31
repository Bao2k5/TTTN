import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { SOCIAL_LINKS } from '../../utils/constants';

const InstagramFeed = () => {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Lấy 6 sản phẩm mới nhất để hiển thị
        const response = await api.get('/products/new-arrivals');
        if (response.data && response.data.products) {
          setPosts(response.data.products.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch instagram feed products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="section-luxury bg-luxury-white">
      <div className="container-luxury">
        { }
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-luxury-charcoal tracking-wide mb-4">
            #HMJewelry
          </h2>
          <div className="w-16 h-px bg-luxury-sage mx-auto mb-6"></div>
          <p className="text-luxury-brown text-base font-light mb-6">
            Theo dõi chúng tôi trên Instagram để cập nhật những mẫu mã mới nhất
          </p>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-luxury-charcoal hover:text-luxury-sage transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="text-sm tracking-wide">@hmjewelry</span>
          </a>
        </div>

        {/* Grid ảnh */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-2 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
          {posts.map((product, index) => (
            <motion.div
              key={product._id}
              className="relative flex-shrink-0 w-[40vw] md:w-auto aspect-square overflow-hidden group cursor-pointer snap-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/product/${product.slug}`}>
                <img
                  src={product.images && product.images.length > 0
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                    : '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-luxury-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-2">
                    <p className="font-serif text-sm mb-1 line-clamp-1">{product.name}</p>
                    <p className="text-xs font-light">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.priceSale || product.price)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
