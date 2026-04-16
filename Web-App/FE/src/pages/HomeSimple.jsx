import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import ProductCard from '../components/common/ProductCard';

import NewsletterSignup from '../components/common/NewsletterSignup';
import TestimonialsSlider from '../components/common/TestimonialsSlider';
import InstagramFeed from '../components/common/InstagramFeed';
import api from '../services/api';
import { getNewArrivals, getProductsByCollection } from '../services/productService';
import { getProductImage } from '../utils/helpers';

const HomeSimple = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [dayChuyen, setDayChuyen] = useState([]);
  const [nhan, setNhan] = useState([]);
  const [lacTay, setLacTay] = useState([]);
  const [bongTai, setBongTai] = useState([]);
  const [collections, setCollections] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [testimonials] = useState([
    { id: 1, name: 'Khách hàng A', role: 'Khách hàng', content: 'Sản phẩm rất đẹp', rating: 5 },
    { id: 2, name: 'Khách hàng B', role: 'Khách hàng', content: 'Dịch vụ tốt', rating: 5 }
  ]);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const p = await api.get('/products', { params: { limit: 12 } });
        console.log('API Response:', p.data);
        const products = (p.data.products || []).slice(0, 8).map(x => ({
          id: x._id,
          name: x.name,
          price: x.price,
          priceSale: x.priceSale,
          category: x.category,
          images: (x.images || []).map(i => typeof i === 'string' ? i : (i.url || i))
        }));
        console.log('Mapped Products:', products);
        setFeaturedProducts(products);
      } catch (err) {
        console.error('Failed to load featured products', err);
      }
      try {
        const c = await api.get('/collections');

        const rawCols = c.data.collections || c.data || [];
        const normalized = (rawCols || []).map((col) => ({
          ...col,
          image: typeof col.image === 'string' ? col.image : (col.image && (col.image.url || col.image.path)) || '/placeholder.jpg',
        }));
        setCollections(normalized);
      } catch (err) {
        console.error('Failed to load collections', err);
      }
      try {
        const h = await api.get('/hero-banners/active');
        setHeroBanners(h.data.data || []);
      } catch (err) {
        console.error('Failed to load hero banners', err);
      }
      try {
        const na = await getNewArrivals();
        setNewArrivals(na.products || []);
      } catch (err) {
        console.error('Failed to load new arrivals', err);
      }

      try {
        const dc = await getProductsByCollection('day-chuyen', 4);
        setDayChuyen(dc.products || []);
      } catch (err) {
        console.error('Failed to load day-chuyen', err);
      }
      try {
        const n = await getProductsByCollection('nhan', 4);
        setNhan(n.products || []);
      } catch (err) {
        console.error('Failed to load nhan', err);
      }
      try {
        const lt = await getProductsByCollection('lac-tay', 4);
        setLacTay(lt.products || []);
      } catch (err) {
        console.error('Failed to load lac-tay', err);
      }
      try {
        const bt = await getProductsByCollection('bong-tai', 4);
        setBongTai(bt.products || []);
      } catch (err) {
        console.error('Failed to load bong-tai', err);
      }
    };
    fetchHome();
  }, []);

  useEffect(() => {
    if (heroBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % heroBanners.length);
      }, 5000); // Change every 5 seconds
      return () => clearInterval(interval);
    }
  }, [heroBanners.length]);

  return (
    <div className="min-h-screen bg-luxury-silverPearl">
      {/* Hero Banner Section - Slide tự động chạy */}
      {heroBanners.length > 0 ? (
        <section className="relative w-full overflow-hidden aspect-video md:aspect-video">
          {heroBanners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />
              {/* Overlay tối màu để text dễ đọc hơn */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white max-w-3xl px-8">
                  {banner.title && (
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 tracking-wide">
                      {banner.title}
                    </h1>
                  )}
                  {banner.subtitle && (
                    <p className="text-xl md:text-2xl font-light mb-6">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.description && (
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                      {banner.description}
                    </p>
                  )}
                  {banner.buttonText && banner.buttonLink && (
                    <Link
                      to={banner.buttonLink}
                      className="inline-block bg-luxury-silverPearl text-luxury-deepBlack px-8 py-3 rounded-lg hover:bg-luxury-metallicSilver transition-colors font-medium tracking-wide"
                    >
                      {banner.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Nút điều hướng slide (dots) */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {heroBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentBannerIndex ? 'bg-luxury-silverPearl' : 'bg-luxury-silverPearl/50'
                    }`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (

        <section className="relative w-full overflow-hidden aspect-video md:aspect-video">
          <img
            src="/bthn-hero.png"
            alt="HM Jewelry"
            className="w-full h-full object-cover object-center"
          />
        </section>
      )}

      {/* Phần cam kết dịch vụ (Shipping, Bảo mật...) */}
      <section className="section-luxury bg-luxury-silverPearlLight">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <Link to="/shipping" className="text-center group block">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-luxury-steelGrey group-hover:text-luxury-deepBlack transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-sm font-sans font-medium mb-2 text-luxury-deepBlack uppercase tracking-widest">Miễn Phí Vận Chuyển</h3>
              <p className="text-luxury-steelGrey text-sm font-light">Đơn hàng từ 500.000đ</p>
            </Link>
            <Link to="/faq" className="text-center group block">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-luxury-steelGrey group-hover:text-luxury-deepBlack transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-sans font-medium mb-2 text-luxury-deepBlack uppercase tracking-widest">Thanh Toán Bảo Mật</h3>
              <p className="text-luxury-steelGrey text-sm font-light">An toàn 100%</p>
            </Link>
            <Link to="/warranty" className="text-center group block">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-luxury-steelGrey group-hover:text-luxury-deepBlack transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-sans font-medium mb-2 text-luxury-deepBlack uppercase tracking-widest">Chất Lượng Đảm Bảo</h3>
              <p className="text-luxury-steelGrey text-sm font-light">Bảo hành trọn đời</p>
            </Link>
            <Link to="/returns" className="text-center group block">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-luxury-steelGrey group-hover:text-luxury-deepBlack transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-sm font-sans font-medium mb-2 text-luxury-deepBlack uppercase tracking-widest">Đổi Trả Dễ Dàng</h3>
              <p className="text-luxury-steelGrey text-sm font-light">Trong vòng 30 ngày</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section - Cinematic Split Layout */}
      <section className="section-luxury bg-luxury-silverPearlLight pb-0">
        <div className="container-luxury">
          <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-sm overflow-hidden">
            <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
              {/* Left Side: Text Content */}
              <div className="w-full md:w-5/12 flex flex-col justify-center items-center text-center p-8 md:p-12 bg-luxury-silverPearl/30">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-serif text-3xl md:text-5xl font-light tracking-widest mb-6 uppercase text-luxury-deepBlack">
                    Tinh Hoa <br /> Chế Tác
                  </h2>
                  <div className="w-16 h-px bg-luxury-platinumGrey mx-auto mb-6"></div>
                  <p className="text-luxury-softBlack text-base md:text-lg font-light leading-relaxed mb-8 max-w-xs mx-auto">
                    Từng đường nét được chạm khắc tỉ mỉ, đánh thức vẻ đẹp kiêu sa tiềm ẩn trong mỗi trang sức của chúng tôi.
                  </p>
                  <Link
                    to="/about"
                    className="inline-block border border-luxury-deepBlack text-luxury-deepBlack px-8 py-3 hover:bg-luxury-deepBlack hover:text-white transition-all duration-300 tracking-[0.2em] text-xs uppercase"
                  >
                    Câu chuyện thương hiệu
                  </Link>
                </motion.div>
              </div>

              {/* Right Side: Vertical Video */}
              <div className="w-full md:w-7/12 relative h-[400px] md:h-full group">
                <video
                  ref={videoRef}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2070&auto=format&fit=crop"
                >
                  <source src="https://res.cloudinary.com/drqowqzr6/video/upload/v1764559439/7279733070411_zxhlga.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Overlay gradient nhẹ */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />

                {/* Mute/Unmute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/40 transition-all duration-300"
                  aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách Bộ sưu tập */}
      <section className="section-luxury bg-luxury-silverPearlLight">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium mb-4 text-luxury-deepBlack tracking-[0.2em] uppercase">Bộ Sưu Tập</h2>
            <div className="w-12 h-px bg-luxury-platinumGrey mx-auto mb-4"></div>
            <p className="text-luxury-steelGrey text-base font-normal tracking-wide">Khám phá vẻ đẹp tinh tế của từng thiết kế</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {collections.map((item) => (
              <Link
                key={item._id || item.id}
                to={`/products?category=${encodeURIComponent(item.name)}`}
                className="group block relative"
              >
                <div className="aspect-square relative overflow-hidden border-1 border-luxury-metallicSilver">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-luxury-deepBlack/0 group-hover:bg-luxury-deepBlack/10 transition-all duration-500" />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-serif text-xl font-light text-luxury-deepBlack mb-2 tracking-wide">{item.name}</h3>

                  <div className="w-8 h-px bg-luxury-deepBlack mx-auto opacity-0 group-hover:opacity-100 transition-opacity mt-3"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Sản phẩm nổi bật */}
      <section className="section-luxury bg-luxury-silverPearlLight">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium mb-4 text-luxury-deepBlack tracking-[0.2em] uppercase">Sản phẩm</h2>
            <div className="w-12 h-px bg-luxury-platinumGrey mx-auto mb-4"></div>
            <p className="text-luxury-steelGrey text-base font-normal tracking-wide">Khám phá những thiết kế được yêu thích nhất</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/products" className="btn-luxury">
              XEM TẤT CẢ SẢN PHẨM
            </Link>
          </div>
        </div>
      </section>

      {/* Giới thiệu về thương hiệu */}
      <section className="section-luxury bg-luxury-silverPearlLight">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-luxury-deepBlack tracking-[0.25em] mb-6 uppercase">
                HM Jewelry
              </h2>
              <div className="w-16 h-px bg-luxury-platinumGrey mx-auto mb-8"></div>
            </div>

            <div className="space-y-6 text-luxury-steelGrey text-base md:text-lg leading-relaxed font-normal">
              <p className="text-xl md:text-2xl font-serif italic text-luxury-deepBlack mb-8">
                "Nơi có những món đồ bé nhỏ để bạn có thể gói ghém dành tặng bản thân và người thân yêu của bạn"
              </p>

              <p>
                <strong className="text-luxury-deepBlack">HM Jewelry</strong> là thương hiệu trang sức bạc 925 tinh tế,
                được thành lập với sứ mệnh mang đến những sản phẩm trang sức nhẹ nhàng, sang trọng và đầy ý nghĩa.
                Chúng tôi tin rằng mỗi món trang sức không chỉ là phụ kiện làm đẹp, mà còn là câu chuyện, là kỷ niệm,
                là tình cảm được lưu giữ mãi mãi.
              </p>

              <p>
                Mỗi sản phẩm của chúng tôi đều được chế tác tỉ mỉ từ <strong className="text-luxury-deepBlack">bạc 925 nguyên chất</strong>,
                kết hợp với nghệ thuật và tình yêu đối với vẻ đẹp tự nhiên. Từ những thiết kế tinh xảo đến
                từng chi tiết nhỏ nhất, tất cả đều được thực hiện bởi đôi bàn tay tài hoa của những nghệ nhân lành nghề.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-luxury-silverPearl rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-luxury-deepBlack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-luxury-deepBlack mb-2 uppercase tracking-wider">Chất lượng</h3>
                  <p className="text-sm text-luxury-steelGrey">Bạc 925 nguyên chất, kiểm định chặt chẽ</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-luxury-silverPearl rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-luxury-deepBlack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-luxury-deepBlack mb-2 uppercase tracking-wider">Thiết kế</h3>
                  <p className="text-sm text-luxury-steelGrey">Tinh tế, nhẹ nhàng, phù hợp mọi phong cách</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-luxury-silverPearl rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-luxury-deepBlack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-luxury-deepBlack mb-2 uppercase tracking-wider">Bảo hành</h3>
                  <p className="text-sm text-luxury-steelGrey">Bảo hành trọn đời, đổi trả miễn phí</p>
                </div>
              </div>

              <p className="italic">
                Hãy để <strong className="text-luxury-deepBlack">HM Jewelry</strong> đồng hành cùng bạn trong những khoảnh khắc đáng nhớ,
                tô điểm thêm vẻ đẹp và sự tự tin cho phong cách của bạn.
              </p>
            </div>

            <Link
              to="/about"
              className="inline-block mt-12 bg-luxury-deepBlack text-luxury-silverPearl px-12 py-4 hover:bg-luxury-steelGrey transition-all duration-300 tracking-[0.2em] text-xs font-medium uppercase"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section >

      {/* Slider đánh giá khách hàng */}
      < TestimonialsSlider />

      {/* Feed Instagram */}
      < InstagramFeed />



      { }

      {/* Đăng ký nhận tin */}
      <NewsletterSignup />
    </div >
  );
};

export default HomeSimple;
