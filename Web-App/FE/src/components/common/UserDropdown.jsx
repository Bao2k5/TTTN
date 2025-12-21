import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  const getAvatarColor = () => {
    if (!user || !user.name) return '#6B5D52';
    const colors = ['#3D3530', '#6B5D52', '#8B7355', '#A0826D', '#C19A6B'];
    const index = user.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Thông tin tài khoản',
      path: '/account'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      label: 'Sản phẩm yêu thích',
      path: '/wishlist'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Sổ địa chỉ',
      path: '/account/addresses'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Cài đặt tài khoản',
      path: '/account/settings'
    }
  ];

  const adminItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      ),
      label: 'Trang quản trị',
      path: '/admin'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative focus:outline-none group"
        aria-label="User menu"
      >
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-luxury-metallicSilver/30 group-hover:border-luxury-metallicSilver transition-all duration-300"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-luxury-metallicSilver/30 group-hover:border-luxury-metallicSilver transition-all duration-300 font-medium text-luxury-silverPearl text-sm"
            style={{ backgroundColor: getAvatarColor() }}
          >
            {getInitial()}
          </div>
        )}

        {}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-luxury-silverPearl rounded-full"></span>
      </button>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-64 bg-luxury-silverPearl shadow-lg border border-luxury-metallicSilver/20 z-50"
          >
            {}
            <div className="px-5 py-4 border-b border-luxury-metallicSilver/20 bg-luxury-silverPearlDark/30">
              <div className="flex items-center gap-3">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-luxury-metallicSilver/30"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-medium text-luxury-silverPearl text-lg"
                    style={{ backgroundColor: getAvatarColor() }}
                  >
                    {getInitial()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-luxury-deepBlack font-medium text-sm truncate">
                    {user?.name || 'Khách hàng'}
                  </p>
                  <p className="text-luxury-steelGrey text-xs truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="py-2">
              {}
              {user?.role === 'admin' ? (
                <>
                  {adminItems.map((item, idx) => (
                    <Link
                      key={`admin-${idx}`}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-luxury-steelGrey hover:bg-luxury-metallicSilver/50 hover:text-luxury-deepBlack transition-all duration-200 group"
                    >
                      <span className="text-luxury-platinumGrey group-hover:text-luxury-deepBlack transition-colors">
                        {item.icon}
                      </span>
                      <span className="text-sm font-light tracking-wide">
                        {item.label}
                      </span>
                    </Link>
                  ))}

                  <div className="my-1 border-t border-luxury-metallicSilver/10"></div>

                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-luxury-steelGrey hover:bg-luxury-metallicSilver/50 hover:text-luxury-deepBlack transition-all duration-200 group"
                    >
                      <span className="text-luxury-platinumGrey group-hover:text-luxury-deepBlack transition-colors">
                        {item.icon}
                      </span>
                      <span className="text-sm font-light tracking-wide">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (

                menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-luxury-steelGrey hover:bg-luxury-metallicSilver/50 hover:text-luxury-deepBlack transition-all duration-200 group"
                  >
                    <span className="text-luxury-platinumGrey group-hover:text-luxury-deepBlack transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-sm font-light tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                ))
              )}
            </div>

            {}
            <div className="border-t border-luxury-metallicSilver/20">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-light tracking-wide">
                  Đăng xuất
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
