import React from 'react';

const Returns = () => {
    return (
        <div className="min-h-screen bg-luxury-silverPearl pt-24 pb-16">
            <div className="container-luxury mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 border border-luxury-platinumGrey/30 shadow-sm">
                    <h1 className="font-serif text-3xl md:text-4xl text-luxury-deepBlack mb-8 text-center tracking-wide">
                        Chính Sách Đổi Trả
                    </h1>

                    <div className="prose prose-stone max-w-none text-luxury-deepBlack/80 font-light">
                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">1. Điều kiện đổi trả</h3>
                        <p className="mb-4">
                            HM Jewelry hỗ trợ đổi hàng trong vòng <strong>30 ngày</strong> kể từ ngày nhận hàng, áp dụng cho các trường hợp:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng.</li>
                            <li>Sản phẩm bị lỗi do nhà sản xuất (bung đá, gãy chốt, sai mẫu...).</li>
                            <li>Sản phẩm không vừa size (đối với nhẫn, lắc tay).</li>
                        </ul>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">2. Quy trình đổi trả</h3>
                        <ol className="list-decimal pl-5 mb-4 space-y-2">
                            <li>Liên hệ với CSKH qua Hotline hoặc Zalo/Facebook.</li>
                            <li>Cung cấp mã đơn hàng và video/hình ảnh tình trạng sản phẩm.</li>
                            <li>Gửi sản phẩm về địa chỉ của HM Jewelry (chúng tôi sẽ hỗ trợ phí ship nếu lỗi do nhà sản xuất).</li>
                            <li>Nhận sản phẩm mới hoặc hoàn tiền trong vòng 3-5 ngày làm việc sau khi chúng tôi nhận được hàng hoàn.</li>
                        </ol>

                        <h3 className="font-serif text-xl text-luxury-deepBlack mt-6 mb-3">3. Hoàn tiền</h3>
                        <p className="mb-4">
                            Trong trường hợp hết hàng đổi hoặc khách hàng muốn trả hàng (do lỗi sản phẩm), chúng tôi sẽ hoàn tiền 100% giá trị sản phẩm qua chuyển khoản ngân hàng.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Returns;
