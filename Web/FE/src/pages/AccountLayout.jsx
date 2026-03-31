import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AccountLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: 'Đơn hàng của tôi',
      path: '/account/orders'
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
      label: 'Cài đặt',
      path: '/account/settings'
    }
  ];

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

  return (
    <div className="min-h-screen bg-luxury-cream pt-24 pb-16">
      <div className="container-luxury">
        <div className="max-w-7xl mx-auto">
          {}
          <div className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl font-light text-luxury-charcoal tracking-wide mb-4">
              Tài Khoản Của Tôi
            </h1>
            <div className="w-16 h-px bg-luxury-sage"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {}
            <div className="lg:col-span-1">
              <div className="bg-luxury-white shadow-sm border border-luxury-sage/20 sticky top-24">
                {}
                <div className="p-6 border-b border-luxury-sage/20">
                  <div className="flex items-center gap-4">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-luxury-sage/30"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-serif font-medium text-luxury-white text-xl"
                        style={{ backgroundColor: getAvatarColor() }}
                      >
                        {getInitial()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-luxury-charcoal font-medium text-base truncate">
                        {user?.name || 'Khách hàng'}
                      </p>
                      <p className="text-luxury-taupe text-sm truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {}
                <nav className="p-2">
                  {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
                          isActive
                            ? 'bg-luxury-sage/20 text-luxury-charcoal font-medium'
                            : 'text-luxury-brown hover:bg-luxury-cream/50 hover:text-luxury-charcoal'
                        }`}
                      >
                        <span className={isActive ? 'text-luxury-charcoal' : 'text-luxury-taupe'}>
                          {item.icon}
                        </span>
                        <span className="text-sm tracking-wide">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {}
            <div className="lg:col-span-3">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
