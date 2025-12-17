import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-luxury-deepBlack text-luxury-silverPearlLight">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <h3 className="font-serif text-base font-medium tracking-[0.25em] mb-4 text-luxury-silverPearl uppercase">
              HM Jewelry
            </h3>
            <p className="text-luxury-silverPearl/80 font-normal text-sm leading-relaxed mb-6">
              Trang sức bạc 925 cao cấp, thiết kế tinh xảo, mang đến vẻ đẹp vượt thời gian.
            </p>
            <div className="flex space-x-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silverPearl hover:text-luxury-steelGrey transition"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silverPearl hover:text-luxury-steelGrey transition"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silverPearl hover:text-luxury-steelGrey transition"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silverPearl hover:text-luxury-steelGrey transition"
                aria-label="Zalo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M440.7 182.1c7.9-98-59.9-181.8-159.8-184.1C165.7-4.6 79.4 79.4 79.4 194.6c0 18.8 2.6 37 7.5 54.4 1.7 6.1-.5 12.7-5.6 16.5l-32.8 24.3c-8.8 6.5-5.7 20.3 4.9 22.2l74.7 13.1c6.6 1.2 13.4-1.2 17.5-6.1l.2-.2c32.8 19.8 71.5 31.2 113 31.2 116.9 0 211.2-94.3 211.2-211.2 0-3.9-.1-7.7-.3-11.6zm-179.1 73.2l-39.9-39.9c-3.1-3.1-8.2-3.1-11.3 0l-11.3 11.3c-3.1 3.1-3.1 8.2 0 11.3l39.9 39.9-39.9 39.9c-3.1 3.1 8.2 3.1 11.3 0l11.3 11.3c3.1 3.1 8.2 3.1 11.3 0l11.3-11.3c3.1-3.1 3.1-8.2 0-11.3l-11.3-11.3c-3.1-3.1-8.2-3.1-11.3 0l-39.9 39.9z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-sm font-medium tracking-widest uppercase mb-6 text-luxury-silverPearl">Liên Kết</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Bộ Sưu Tập
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Giới Thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-sm font-medium tracking-widest uppercase mb-6 text-luxury-silverPearl">Hỗ Trợ</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Vận Chuyển
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Đổi Trả
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  Bảo Hành
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-medium tracking-widest uppercase mb-6 text-luxury-silverPearl">Liên Hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-luxury-steelGrey mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-luxury-silverPearl/80 font-light text-sm">
                  Cộng Hòa, Tân Bình, TP.HCM
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-luxury-steelGrey flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+84375223143" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  0375 223 143
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-luxury-steelGrey flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:2331540071@vaa.edu.vn" className="text-luxury-silverPearl/80 hover:text-luxury-steelGrey font-light text-sm transition">
                  2331540071@vaa.edu.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-luxury-platinumGrey/30 mt-12 pt-8">
          <p className="text-center text-luxury-silverPearl/70 font-light text-sm">
            © {currentYear} HM Jewelry. Bạc 925 Tinh Tế & Nhẹ Nhàng. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
