import React from 'react';

const Warranty = () => {
    return (
        <div className="min-h-screen bg-luxury-silverPearl pt-24 pb-16">
            <div className="container-luxury mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 border border-luxury-platinumGrey/30 shadow-sm">
                    <h1 className="font-serif text-3xl md:text-4xl text-luxury-deepBlack mb-8 text-center tracking-wide">
                        Chính Sách Bảo Hành
                    </h1>

                    <div className="prose prose-stone max-w-none text-luxury-deepBlack/80 font-light">
                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">1. Thời gian bảo hành</h3>
                        <p className="mb-4">
                            Tất cả sản phẩm trang sức bạc tại HM Jewelry đều được bảo hành <strong>trọn đời</strong> về độ sáng bóng và làm sạch.
                        </p>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">2. Hạng mục bảo hành miễn phí</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Đánh bóng, làm sáng sản phẩm định kỳ.</li>
                            <li>Hàn nối các chi tiết bị đứt gãy (nếu có thể hàn được và không cần thêm nguyên liệu).</li>
                            <li>Gắn lại đá (đối với đá CZ tấm thông thường, khách hàng còn giữ đá hoặc đá có sẵn tại cửa hàng).</li>
                        </ul>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">3. Hạng mục bảo hành có tính phí</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Sản phẩm bị biến dạng nặng, cần xi mạ lại toàn bộ.</li>
                            <li>Mất đá chủ hoặc các loại đá quý hiếm cần thay thế.</li>
                            <li>Các yêu cầu sửa chữa thay đổi thiết kế gốc.</li>
                        </ul>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">4. Từ chối bảo hành</h3>
                        <p className="mb-4">
                            Chúng tôi xin phép từ chối bảo hành đối với các sản phẩm bị hư hỏng quá nặng không thể phục hồi, hoặc sản phẩm đã bị can thiệp sửa chữa tại các đơn vị khác.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Warranty;
