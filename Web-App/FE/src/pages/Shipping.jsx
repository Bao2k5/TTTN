import React from 'react';

const Shipping = () => {
    return (
        <div className="min-h-screen bg-luxury-silverPearl pt-24 pb-16">
            <div className="container-luxury mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 border border-luxury-platinumGrey/30 shadow-sm">
                    <h1 className="font-serif text-3xl md:text-4xl text-luxury-deepBlack mb-8 text-center tracking-wide">
                        Chính Sách Vận Chuyển
                    </h1>

                    <div className="prose prose-stone max-w-none text-luxury-deepBlack/80 font-light">
                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">1. Phạm vi giao hàng</h3>
                        <p className="mb-4">
                            HM Jewelry hỗ trợ giao hàng trên toàn quốc. Dù bạn ở bất kỳ đâu tại Việt Nam, chúng tôi đều có thể gửi sản phẩm đến tận tay bạn.
                        </p>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">2. Phí vận chuyển</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li><strong>Miễn phí vận chuyển:</strong> Cho tất cả đơn hàng có giá trị từ 500.000đ trở lên.</li>
                            <li><strong>Phí đồng giá:</strong> 30.000đ cho các đơn hàng dưới 500.000đ.</li>
                        </ul>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">3. Thời gian giao hàng</h3>
                        <p className="mb-4">
                            Thời gian giao hàng dự kiến phụ thuộc vào địa chỉ của bạn:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li><strong>Nội thành TP.HCM & Hà Nội:</strong> 1 - 2 ngày làm việc.</li>
                            <li><strong>Các tỉnh thành khác:</strong> 3 - 5 ngày làm việc.</li>
                        </ul>
                        <p className="text-sm italic text-luxury-steelGrey">
                            *Lưu ý: Thời gian có thể thay đổi vào các dịp lễ, tết hoặc do ảnh hưởng của thiên tai, dịch bệnh.
                        </p>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">4. Kiểm tra hàng</h3>
                        <p className="mb-4">
                            HM Jewelry khuyến khích quý khách <strong>kiểm tra hàng trước khi thanh toán</strong> (đồng kiểm).
                            Bạn có thể mở hộp để xem sản phẩm, kiểm tra mẫu mã, chất liệu. Nếu không ưng ý, bạn có thể từ chối nhận hàng ngay lúc đó.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
