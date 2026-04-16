import { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      setEmail('');

      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <section className="section-luxury bg-luxury-sage/20">
      <div className="container-luxury">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-luxury-charcoal tracking-wide mb-4">
              Đăng Ký Nhận Tin
            </h2>
            <div className="w-16 h-px bg-luxury-sage mx-auto mb-6"></div>
            <p className="text-luxury-brown text-base font-light leading-relaxed">
              Đăng ký để nhận thông tin sản phẩm mới, ưu đãi độc quyền và tin tức từ HM Jewelry
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-luxury-mint/50 text-luxury-charcoal px-6 py-4 rounded mb-6 animate-slide-down">
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Cảm ơn bạn đã đăng ký! Vui lòng kiểm tra email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                className="flex-1 px-6 py-4 bg-luxury-white text-luxury-charcoal placeholder-luxury-taupe focus:outline-none focus:ring-2 focus:ring-luxury-sage transition-all"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-luxury-charcoal text-luxury-cream hover:bg-luxury-brown transition-all duration-300 tracking-[0.2em] text-xs font-medium uppercase disabled:opacity-50"
              >
                {isLoading ? 'Đang gửi...' : 'Đăng ký'}
              </button>
            </form>
          )}

          <p className="text-luxury-taupe text-xs mt-4">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
