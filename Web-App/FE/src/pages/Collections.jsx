import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const res = await api.get('/collections');
        const fetchedCollections = res.data.collections || res.data || [];
        setCollections(fetchedCollections);

        const counts = {};
        for (const col of fetchedCollections) {
          try {
            const productsRes = await api.get('/products', {
              params: { category: col.name, limit: 1 }
            });
            counts[col._id] = productsRes.data.total || 0;
          } catch (err) {
            counts[col._id] = 0;
          }
        }
        setProducts(counts);
      } catch (err) {
        console.error('Failed to load collections', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {}
      <section className="relative h-[500px] bg-gradient-to-br from-luxury-ivory via-luxury-pearl to-luxury-sand overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-luxury-taupe rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 border border-luxury-taupe rounded-full"></div>
        </div>
        <div className="relative h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-7xl font-light text-luxury-charcoal tracking-wide mb-6">
              Bộ Sưu Tập
            </h1>
            <div className="w-32 h-px bg-luxury-taupe mx-auto mb-6"></div>
            <p className="text-luxury-brown text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Khám phá vẻ đẹp tinh tế trong từng thiết kế, nơi nghệ thuật gặp gỡ thời gian
            </p>
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-black"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-gray text-lg">Chưa có bộ sưu tập nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?category=${collection.name}`}
                  className="group block relative overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  {}
                  <div className="aspect-[4/5] overflow-hidden bg-luxury-pearl relative">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';
                      }}
                    />

                    {}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-luxury-charcoal font-light text-sm">
                        {products[collection._id] || 0} sản phẩm
                      </span>
                    </div>

                    {}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <span className="bg-white text-luxury-charcoal px-8 py-3 text-sm font-light tracking-widest uppercase hover:bg-luxury-charcoal hover:text-white transition-all duration-300">
                        Khám Phá Ngay
                      </span>
                    </div>
                  </div>

                  {}
                  <div className="p-8 text-center bg-white">
                    <h3 className="font-serif text-3xl font-light text-luxury-charcoal mb-3 tracking-wide group-hover:text-luxury-taupe transition-colors">
                      {collection.name}
                    </h3>
                    <div className="w-16 h-px bg-luxury-taupe mx-auto mb-4 group-hover:w-24 transition-all duration-300"></div>
                    <p className="text-luxury-brown font-light leading-relaxed text-base">
                      {collection.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {}
      <section className="section-luxury bg-luxury-pearl">
        <div className="container-luxury text-center">
          <h2 className="font-serif text-5xl font-light text-luxury-black tracking-wide mb-6">
            Tư Vấn Miễn Phí
          </h2>
          <p className="text-luxury-gray text-base font-light mb-10 max-w-2xl mx-auto leading-relaxed">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn để bạn tìm được món trang sức hoàn hảo
          </p>
          <Link to="/contact" className="btn-luxury inline-block px-12">
            LIÊN HỆ NGAY
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Collections;
