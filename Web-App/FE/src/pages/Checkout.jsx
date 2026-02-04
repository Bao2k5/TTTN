import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import addressService from '../services/addressService';
import { api } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // VietQR state
  const [qrData, setQrData] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const { user } = useAuthStore();
  const { items: localItems } = useCartStore();

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      try {
        if (user) {
          const data = await cartService.getCart();
          const mapped = (data.items || []).map(item => ({
            id: item.product._id || item.product.id,
            name: item.product.name,
            price: item.product.priceSale || item.product.price,
            quantity: item.qty,
            image: item.product.images?.[0]?.url || item.product.images?.[0] || 'https://via.placeholder.com/400',
          }));
          setCartItems(mapped);
        } else {
          setCartItems(localItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.priceSale || item.price,
            quantity: item.quantity,
            image: item.images?.[0]?.url || item.images?.[0] || item.image || 'https://via.placeholder.com/400',
          })));
        }
      } catch (err) {
        console.error('Error loading checkout cart:', err);
        setCartItems(localItems);
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, [user, localItems]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (user) {
        try {
          const response = await addressService.getAddresses();
          const addresses = response.data || [];
          setSavedAddresses(addresses);

          const defaultAddr = addresses.find(addr => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            handleAddressSelect(defaultAddr._id, addresses);
          }
        } catch (err) {
          console.error('Error loading addresses:', err);
        }
      }
    };
    loadAddresses();
  }, [user]);

  const handleAddressSelect = (addressId, addresses = savedAddresses) => {
    const selected = addresses.find(addr => addr._id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      setShippingInfo({
        ...shippingInfo,
        fullName: selected.fullName || '',
        phone: selected.phone || '',
        address: selected.address || '',
        city: selected.province || '',
        district: selected.district || '',
        ward: selected.ward || ''
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 500000 ? 0 : 50000;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal + shipping - discount;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Apply coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setCouponLoading(true);
    try {
      const response = await api.post('/coupons/apply', { 
        code: couponCode.trim(),
        orderAmount: subtotal
      });
      
      if (response.data.success) {
        setAppliedCoupon(response.data.data);
        toast.success(`Áp dụng mã giảm giá thành công! Giảm ${formatPrice(response.data.data.discountAmount)}`);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Mã giảm giá không hợp lệ';
      toast.error(message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Đã hủy mã giảm giá');
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {

    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng');
      navigate('/products');
      return;
    }

    const requiredFields = {
      fullName: 'Họ và tên',
      email: 'Email',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      city: 'Tỉnh/Thành phố',
      district: 'Quận/Huyện',
      ward: 'Phường/Xã'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!shippingInfo[field] || shippingInfo[field].trim() === '') {
        toast.error(`Vui lòng nhập ${label}`);
        setStep(1); // Go back to shipping step
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Email không hợp lệ');
      setStep(1);
      return;
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s/g, ''))) {
      toast.error('Số điện thoại không hợp lệ');
      setStep(1);
      return;
    }

    const validPaymentMethods = ['cod', 'vietqr'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      toast.error('Vui lòng chọn phương thức thanh toán hợp lệ');
      setStep(2); // Go back to payment step
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        address: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        fullName: shippingInfo.fullName,
        note: shippingInfo.note || '',
        paymentMethod: paymentMethod === 'vietqr' ? 'bank_transfer' : paymentMethod,
        couponCode: appliedCoupon?.code || null,
        discount: discount
      };

      const order = await orderService.createOrder(orderData);

      // Mark coupon as used if applied
      if (appliedCoupon) {
        try {
          await api.post('/coupons/use', { code: appliedCoupon.code });
        } catch (e) {
          console.log('Coupon use tracking failed:', e);
        }
      }

      if (paymentMethod === 'cod') {

        toast.success('Đặt hàng thành công!');
        navigate(`/payment/success?orderId=${order._id}&method=cod`);
      } else if (paymentMethod === 'vietqr') {
        // Generate VietQR (MB Bank)
        try {
          const qrResponse = await api.post('/payment/vietqr/generate', {
            orderId: order._id,
            amount: total,
            customerName: shippingInfo.fullName
          });
          
          if (qrResponse.data.success) {
            setQrData({ ...qrResponse.data.data, type: 'bank' });
            setShowQrModal(true);
            toast.success('Đã tạo mã QR chuyển khoản!');
          }
        } catch (qrError) {
          console.error('QR generation error:', qrError);
          toast.error('Không thể tạo mã QR. Vui lòng thử lại!');
        }
        setLoading(false);
        return; // Don't navigate, show QR modal
      }
    } catch (error) {
      console.error('Place order error:', error);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.msg
        || error.response?.data?.error
        || error.message
        || 'Đặt hàng thất bại. Vui lòng thử lại!';

      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      { }
      <div className="bg-gradient-to-b from-luxury-ivory to-luxury-cream py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-light mb-4 text-luxury-charcoal tracking-wide text-center">THANH TOÁN</h1>
          <div className="w-20 h-1 bg-luxury-taupe mx-auto mb-8"></div>

          { }
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-luxury-charcoal text-white' : 'bg-luxury-sand text-luxury-brown'}`}>
                {step > 1 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : '1'}
              </div>
              <span className="ml-2 text-luxury-brown font-light">Giao hàng</span>
            </div>

            <div className="w-12 h-0.5 bg-luxury-beige"></div>

            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-luxury-charcoal text-white' : 'bg-luxury-sand text-luxury-brown'}`}>
                {step > 2 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : '2'}
              </div>
              <span className="ml-2 text-luxury-brown font-light">Thanh toán</span>
            </div>

            <div className="w-12 h-0.5 bg-luxury-beige"></div>

            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-luxury-charcoal text-white' : 'bg-luxury-sand text-luxury-brown'}`}>
                3
              </div>
              <span className="ml-2 text-luxury-brown font-light">Xác nhận</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          { }
          <div className="lg:col-span-2">
            { }
            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="bg-white border border-luxury-sand p-8">
                  <h2 className="text-2xl font-light text-luxury-charcoal mb-6 tracking-wide">THÔNG TIN GIAO HÀNG</h2>

                  <div className="space-y-6">
                    { }
                    {user && savedAddresses.length > 0 && (
                      <div className="bg-luxury-cream/30 p-4 border border-luxury-sage/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-luxury-charcoal font-light">Chọn địa chỉ đã lưu</label>
                          <Link
                            to="/account/addresses"
                            className="text-luxury-sage hover:text-luxury-charcoal text-sm transition-colors"
                          >
                            Quản lý địa chỉ →
                          </Link>
                        </div>
                        <select
                          value={selectedAddressId}
                          onChange={(e) => handleAddressSelect(e.target.value)}
                          className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light bg-white"
                        >
                          <option value="">-- Nhập địa chỉ mới --</option>
                          {savedAddresses.map(addr => (
                            <option key={addr._id} value={addr._id}>
                              {addr.fullName} - {addr.phone} - {addr.address}, {addr.ward}, {addr.district}, {addr.province}
                              {addr.isDefault ? ' (Mặc định)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-luxury-charcoal font-light mb-2">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-luxury-charcoal font-light mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                        />
                      </div>
                      <div>
                        <label className="block text-luxury-charcoal font-light mb-2">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-luxury-charcoal font-light mb-2">Địa chỉ *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        placeholder="Số nhà, tên đường"
                        className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-luxury-charcoal font-light mb-2">Tỉnh/Thành phố *</label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                        />
                      </div>
                      <div>
                        <label className="block text-luxury-charcoal font-light mb-2">Quận/Huyện *</label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.district}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                          className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                        />
                      </div>
                      <div>
                        <label className="block text-luxury-charcoal font-light mb-2">Phường/Xã *</label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.ward}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, ward: e.target.value })}
                          className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-luxury-charcoal font-light mb-2">Ghi chú</label>
                      <textarea
                        rows="3"
                        value={shippingInfo.note}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                        placeholder="Ghi chú về đơn hàng (tùy chọn)"
                        className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/cart"
                    className="border-2 border-luxury-charcoal text-luxury-charcoal px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-charcoal hover:text-white transition-all duration-300"
                  >
                    QUAY LẠI GIỎ HÀNG
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 bg-luxury-charcoal text-white px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300"
                  >
                    TIẾP TỤC
                  </button>
                </div>
              </form>
            )}

            { }
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="bg-white border border-luxury-sand p-8">
                  <h2 className="text-2xl font-light text-luxury-charcoal mb-6 tracking-wide">PHƯƠNG THỨC THANH TOÁN</h2>

                  <div className="space-y-4">
                    { }
                    <label className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-luxury-charcoal bg-luxury-cream/30'
                      : 'border-luxury-sand hover:border-luxury-taupe'
                      }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-5 h-5 text-luxury-taupe"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-6 h-6 text-luxury-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium text-luxury-charcoal">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <p className="text-sm text-luxury-brown font-light">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </label>

                    { /* VietQR - BIDV Bank Transfer */ }
                    <label className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-all ${paymentMethod === 'vietqr'
                      ? 'border-luxury-charcoal bg-luxury-cream/30'
                      : 'border-luxury-sand hover:border-luxury-taupe'
                      }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="vietqr"
                        checked={paymentMethod === 'vietqr'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-5 h-5 text-luxury-taupe"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-green-800 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">B</span>
                          </div>
                          <span className="font-medium text-luxury-charcoal">Chuyển khoản BIDV (QR)</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Nhanh chóng</span>
                        </div>
                        <p className="text-sm text-luxury-brown font-light">Quét mã QR bằng app ngân hàng bất kỳ - Chuyển khoản 24/7</p>
                      </div>
                    </label>

                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border-2 border-luxury-charcoal text-luxury-charcoal px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-charcoal hover:text-white transition-all duration-300"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-luxury-charcoal text-white px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300"
                  >
                    TIẾP TỤC
                  </button>
                </div>
              </form>
            )}

            { }
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white border border-luxury-sand p-8">
                  <h2 className="text-2xl font-light text-luxury-charcoal mb-6 tracking-wide">XÁC NHẬN ĐƠN HÀNG</h2>

                  { }
                  <div className="mb-8 pb-8 border-b border-luxury-beige">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-light text-luxury-charcoal">Thông tin giao hàng</h3>
                      <button onClick={() => setStep(1)} className="text-sm text-luxury-taupe hover:text-luxury-charcoal">Chỉnh sửa</button>
                    </div>
                    <div className="space-y-2 text-luxury-brown font-light">
                      <p>{shippingInfo.fullName}</p>
                      <p>{shippingInfo.email} | {shippingInfo.phone}</p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}</p>
                      {shippingInfo.note && <p className="italic">Ghi chú: {shippingInfo.note}</p>}
                    </div>
                  </div>

                  { }
                  <div className="mb-8 pb-8 border-b border-luxury-beige">
                    <div className="flex items-center justify-between mb-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-50 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex justify-between">
                            <div>
                              <p className="font-light text-luxury-charcoal">{item.name}</p>
                              <p className="text-sm text-luxury-brown font-light">Số lượng: {item.quantity}</p>
                            </div>
                            <p className="font-light text-luxury-charcoal">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="border-2 border-luxury-charcoal text-luxury-charcoal px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-charcoal hover:text-white transition-all duration-300"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-luxury-charcoal text-white px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300"
                  >
                    ĐẶT HÀNG
                  </button>
                </div>
              </div>
            )}
          </div>

          { }
          <div>
            <div className="sticky top-24 bg-luxury-ivory border border-luxury-beige p-8">
              <h2 className="text-2xl font-light text-luxury-charcoal mb-8 tracking-wide">ĐƠN HÀNG</h2>

              <div className="space-y-4 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-white border border-luxury-beige flex-shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-luxury-charcoal text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-luxury-charcoal truncate">{item.name}</p>
                      <p className="text-sm text-luxury-brown font-light">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-luxury-beige">
                <div className="flex justify-between">
                  <span className="text-luxury-brown font-light">Tạm tính</span>
                  <span className="text-luxury-charcoal font-light">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-brown font-light">Phí vận chuyển</span>
                  <span className="text-luxury-charcoal font-light">
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-light">Giảm giá ({appliedCoupon.code})</span>
                    <span className="font-light">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              {/* Coupon Input */}
              <div className="mb-6 pb-6 border-b border-luxury-beige">
                <label className="block text-luxury-charcoal font-light mb-2 text-sm">Mã giảm giá</label>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 p-3 rounded">
                    <span className="flex-1 text-green-700 font-medium">{appliedCoupon.code}</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕ Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã"
                      className="flex-1 border border-luxury-beige px-3 py-2 text-sm focus:outline-none focus:border-luxury-taupe uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-luxury-charcoal text-white px-4 py-2 text-sm hover:bg-luxury-brown transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xl mb-6">
                <span className="font-light text-luxury-charcoal">Tổng cộng</span>
                <span className="font-light text-luxury-charcoal">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment Modal - Bank & MoMo */}
      {showQrModal && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Header with payment type indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-green-600 to-green-800">
                <span className="text-white text-sm font-bold">BIDV</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
              <p className="text-gray-500 mb-6">Sử dụng app ngân hàng để quét</p>
              
              {/* QR Image */}
              <div className="p-4 rounded-xl shadow-inner mb-6 bg-green-50">
                <img 
                  src={qrData.qrUrl} 
                  alt="VietQR Payment"
                  className="w-full max-w-[280px] mx-auto rounded-lg"
                />
              </div>
              
              {/* Payment Info */}
              <div className="rounded-xl p-4 text-left mb-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-medium">{qrData.bankInfo?.bankName}</span>
                  
                  <span className="text-gray-500">Số TK:</span>
                  <span className="font-medium">{qrData.bankInfo?.accountNo}</span>
                  
                  <span className="text-gray-500">Chủ TK:</span>
                  <span className="font-medium">{qrData.bankInfo?.accountName}</span>
                  
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(qrData.paymentInfo?.amount)}
                  </span>
                  
                  <span className="text-gray-500">Nội dung CK:</span>
                  <span className="font-mono px-2 rounded bg-yellow-100">
                    {qrData.paymentInfo?.transferContent}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mb-4">
                Sau khi thanh toán thành công, đơn hàng sẽ được xác nhận trong 5-10 phút
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => navigate('/account/orders')}
                  className="flex-1 text-white py-3 rounded-lg bg-luxury-charcoal hover:bg-luxury-brown"
                >
                  Xem đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
