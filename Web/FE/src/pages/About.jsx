import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Chất lượng đảm bảo',
      description: 'Sản phẩm được làm từ bạc 925 nguyên chất, đạt chuẩn quốc tế. Mỗi sản phẩm đều có giấy chứng nhận chất lượng và tem bảo hành.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'Thiết kế độc đáo',
      description: 'Các thiết kế được chế tác tỉ mỉ bởi đội ngũ nghệ nhân giàu kinh nghiệm, kết hợp giữa phong cách hiện đại và nét đẹp truyền thống.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Tận tâm phục vụ',
      description: 'Đội ngũ tư vấn nhiệt tình, chu đáo, luôn sẵn sàng hỗ trợ bạn 24/7. Chính sách đổi trả linh hoạt, bảo hành trọn đời.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Giá cả hợp lý',
      description: 'Cam kết giá tốt nhất thị trường với chất lượng cao. Thường xuyên có các chương trình khuyến mãi và ưu đãi hấp dẫn.'
    }
  ];

  const timeline = [
    {
      year: 'Tháng 6/2025',
      title: 'Mùa hè khởi đầu',
      description: 'Ra mắt bộ sưu tập đầu tiên "Hạ Vọng" với 15 thiết kế nhẫn bạc handmade. Bán được 100 sản phẩm đầu tiên qua Instagram và nhận được phản hồi tích cực từ khách hàng.'
    },
    {
      year: 'Tháng 7/2025',
      title: 'Mở rộng sản phẩm',
      description: 'Phát triển thêm dòng dây chuyền và bông tai. Đội ngũ nghệ nhân tăng lên 8 người. Doanh thu tháng đạt 50 triệu đồng. Bắt đầu có khách hàng quen trở lại.'
    },
    {
      year: 'Tháng 8/2025',
      title: 'Xây dựng thương hiệu',
      description: 'Tham gia hội chợ thủ công tại Hà Nội, nhận được 500+ khách hàng mới. Ra mắt chương trình "Bảo hành trọn đời" và chính sách đổi trả 30 ngày.'
    },
    {
      year: 'Tháng 9/2025',
      title: 'Hợp tác & Đầu tư',
      description: 'Ký hợp đồng với 3 cửa hàng accessories tại TP.HCM. Nhận đầu tư 200 triệu đồng để mở rộng xưởng sản xuất. Sản phẩm có mặt tại 10 điểm bán.'
    },
    {
      year: 'Tháng 10/2025',
      title: 'Mùa vàng kinh doanh',
      description: 'Doanh thu tháng đạt 300 triệu đồng. Ra mắt bộ sưu tập "Thu Luyến" với 30 thiết kế mới. Bán được 2000+ sản phẩm. Đội ngũ đạt 15 nhân viên.'
    },
    {
      year: 'Tháng 11-12/2025',
      title: 'Mùa lễ hội bùng nổ',
      description: 'Đón mùa lễ hội với bộ sưu tập "Ký Ức". Doanh thu dự kiến 1 tỷ đồng. Mở showroom đầu tiên tại Hà Nội. Sẵn sàng cho năm mới với nhiều dòng sản phẩm cao cấp.'
    }
  ];

  return (
    <div className="min-h-screen bg-luxury-cream">
      {}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center bg-gradient-to-br from-luxury-sage/30 to-luxury-mint/30">
        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.h1 
            className="font-serif text-3xl md:text-5xl font-medium text-luxury-charcoal tracking-[0.2em] mb-6 uppercase"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Về HM Jewelry
          </motion.h1>
          <motion.div 
            className="w-24 h-px bg-luxury-sage mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.p 
            className="text-lg md:text-xl text-luxury-brown font-normal leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Nơi có những món đồ bé nhỏ để bạn có thể gói ghém<br />
            dành tặng bản thân và người thân yêu của bạn
          </motion.p>
        </div>
      </section>

      {}
      <section className="section-luxury bg-luxury-white">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-luxury-charcoal tracking-[0.2em] mb-6 uppercase text-center">
              Câu chuyện của chúng tôi
            </h2>
            <div className="w-16 h-px bg-luxury-sage mx-auto mb-12"></div>

            <div className="space-y-6 text-luxury-brown text-base md:text-lg leading-relaxed font-normal">
              <p>
                <strong className="text-luxury-charcoal">HM Jewelry</strong> được ra đời từ tình yêu với vẻ đẹp tinh tế 
                và niềm đam mê tạo nên những món trang sức mang đậm dấu ấn cá nhân. Chúng tôi tin rằng mỗi món trang sức 
                không chỉ là phụ kiện làm đẹp, mà còn là câu chuyện, là kỷ niệm, là tình cảm được lưu giữ mãi mãi.
              </p>

              <p>
                Với đội ngũ nghệ nhân giàu kinh nghiệm và tâm huyết, mỗi sản phẩm của chúng tôi đều được chế tác tỉ mỉ 
                từ <strong className="text-luxury-charcoal">bạc 925 nguyên chất</strong>, đảm bảo độ bền đẹp và an toàn 
                cho làn da. Từ khâu thiết kế, chọn lựa nguyên liệu đến hoàn thiện sản phẩm, tất cả đều được thực hiện 
                với sự tỉ mỉ và chuyên nghiệp cao nhất.
              </p>

              <p>
                Chúng tôi không ngừng học hỏi, đổi mới để mang đến những thiết kế độc đáo, phù hợp với xu hướng thời trang 
                hiện đại nhưng vẫn giữ được nét đẹp truyền thống. Mỗi bộ sưu tập của HM Jewelry đều mang trong mình một 
                thông điệp riêng, kể một câu chuyện riêng, để bạn có thể tìm thấy món trang sức hoàn hảo cho chính mình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="section-luxury bg-luxury-sage/10">
        <div className="container-luxury">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-luxury-charcoal tracking-[0.2em] mb-6 uppercase text-center">
            Giá trị cốt lõi
          </h2>
          <div className="w-16 h-px bg-luxury-sage mx-auto mb-16"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-luxury-white p-8 text-center hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-luxury-charcoal mb-6 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="font-serif text-lg font-medium text-luxury-charcoal mb-4 uppercase tracking-wide">
                  {value.title}
                </h3>
                <p className="text-luxury-brown text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="section-luxury bg-luxury-white">
        <div className="container-luxury">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-luxury-charcoal tracking-[0.2em] mb-6 uppercase text-center">
            Hành trình phát triển
          </h2>
          <div className="w-16 h-px bg-luxury-sage mx-auto mb-16"></div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className="flex gap-8 mb-12 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-luxury-sage/20 rounded-full flex items-center justify-center">
                    <span className="font-serif text-xl font-medium text-luxury-charcoal">
                      {item.year}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pb-12 border-b border-luxury-sage/20 last:border-0">
                  <h3 className="font-serif text-xl font-medium text-luxury-charcoal mb-3 uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-luxury-brown text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="section-luxury bg-luxury-sage/5">
        <div className="container-luxury">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-luxury-charcoal tracking-[0.2em] mb-6 uppercase text-center">
            Hành trình phát triển công nghệ
          </h2>
          <div className="w-16 h-px bg-luxury-sage mx-auto mb-16"></div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                className="bg-luxury-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-luxury-mint/20 rounded-full flex items-center justify-center mb-6">
                  <span className="font-serif text-sm font-bold text-luxury-charcoal">6-7/2025</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-luxury-charcoal mb-3 uppercase tracking-wide">
                  Khởi nghiệp
                </h3>
                <ul className="text-luxury-brown text-sm space-y-2">
                  <li>• 15 thiết kế đầu tiên</li>
                  <li>• Bán qua Instagram</li>
                  <li>• 8 nghệ nhân</li>
                  <li>• 50 triệu doanh thu</li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-luxury-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-luxury-mint/30 rounded-full flex items-center justify-center mb-6">
                  <span className="font-serif text-sm font-bold text-luxury-charcoal">8-9/2025</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-luxury-charcoal mb-3 uppercase tracking-wide">
                  Phát triển
                </h3>
                <ul className="text-luxury-brown text-sm space-y-2">
                  <li>• Hội chợ thủ công</li>
                  <li>• 500+ khách hàng mới</li>
                  <li>• 10 điểm bán</li>
                  <li>• 200 triệu đầu tư</li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-luxury-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-luxury-mint/40 rounded-full flex items-center justify-center mb-6">
                  <span className="font-serif text-sm font-bold text-luxury-charcoal">10-12/2025</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-luxury-charcoal mb-3 uppercase tracking-wide">
                  Bùng nổ
                </h3>
                <ul className="text-luxury-brown text-sm space-y-2">
                  <li>• 300 triệu/tháng</li>
                  <li>• 2000+ sản phẩm</li>
                  <li>• 15 nhân viên</li>
                  <li>• Showroom đầu tiên</li>
                </ul>
              </motion.div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-8 text-luxury-brown text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-luxury-mint rounded-full"></div>
                  <span>Đã hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-luxury-sage rounded-full"></div>
                  <span>Đang phát triển</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-luxury-charcoal rounded-full"></div>
                  <span>Kế hoạch tương lai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="section-luxury bg-luxury-mint/30">
        <div className="container-luxury text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-luxury-charcoal tracking-[0.2em] mb-6 uppercase">
            Khám phá bộ sưu tập
          </h2>
          <div className="w-16 h-px bg-luxury-sage mx-auto mb-8"></div>
          <p className="text-luxury-brown text-base md:text-lg mb-10 max-w-2xl mx-auto">
            Hãy để HM Jewelry đồng hành cùng bạn trong những khoảnh khắc đáng nhớ
          </p>
          <Link
            to="/products"
            className="inline-block bg-luxury-charcoal text-luxury-cream px-12 py-4 hover:bg-luxury-brown transition-all duration-300 tracking-[0.2em] text-xs font-medium uppercase"
          >
            Xem sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
