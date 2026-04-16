import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/top-reviews');
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(r => ({
            id: r._id,
            name: r.user?.name || 'Khách hàng ẩn danh',
            role: 'Khách hàng thân thiết',
            content: r.text,
            rating: r.rating,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || 'User')}&background=random`
          }));
          setTestimonials(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch top reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="section-luxury bg-luxury-cream">
      <div className="container-luxury">
        { }
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-luxury-charcoal tracking-wide mb-4">
            Khách Hàng Nói Gì
          </h2>
          <div className="w-16 h-px bg-luxury-sage mx-auto mb-6"></div>
          <p className="text-luxury-brown text-base font-light">
            Những đánh giá chân thực từ khách hàng của chúng tôi
          </p>
        </div>

        { }
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-luxury-white p-8 md:p-12 shadow-lg"
            >
              { }
              <div className="text-luxury-sage/30 text-6xl mb-6 font-serif">"</div>

              { }
              <p className="text-luxury-charcoal text-lg md:text-xl font-light leading-relaxed mb-8 italic">
                {testimonials[currentIndex].content}
              </p>

              { }
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              { }
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-luxury-sage"
                />
                <div className="text-left">
                  <h4 className="text-luxury-charcoal font-medium text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-luxury-taupe text-sm">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          { }
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-luxury-white hover:bg-luxury-sage text-luxury-charcoal hover:text-luxury-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 group"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-luxury-white hover:bg-luxury-sage text-luxury-charcoal hover:text-luxury-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 group"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          { }
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 ${index === currentIndex
                    ? 'w-8 h-2 bg-luxury-sage'
                    : 'w-2 h-2 bg-luxury-taupe/30 hover:bg-luxury-taupe/50'
                  } rounded-full`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
