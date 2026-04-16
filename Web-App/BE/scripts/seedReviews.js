console.log('STARTING SEED SCRIPT');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/user.model');
const Product = require('../src/models/product.model');
const Review = require('../src/models/review.model');

const fakeUsers = [
    { name: 'Nguyễn Thị Lan', email: 'lan.nguyen@example.com' },
    { name: 'Trần Minh Tuấn', email: 'tuan.tran@example.com' },
    { name: 'Lê Thu Hà', email: 'ha.le@example.com' },
    { name: 'Phạm Văn Hùng', email: 'hung.pham@example.com' },
    { name: 'Hoàng Mai Anh', email: 'anh.hoang@example.com' },
    { name: 'Vũ Đức Minh', email: 'minh.vu@example.com' },
    { name: 'Đặng Thị Ngọc', email: 'ngoc.dang@example.com' },
    { name: 'Bùi Văn Nam', email: 'nam.bui@example.com' },
    { name: 'Đỗ Thị Hương', email: 'huong.do@example.com' },
    { name: 'Ngô Văn Long', email: 'long.ngo@example.com' }
];

const reviewContents = [
    { title: 'Tuyệt vời!', text: 'Sản phẩm rất đẹp, sáng bóng, đóng gói cẩn thận. Rất hài lòng!' },
    { title: 'Rất ưng ý', text: 'Giao hàng nhanh, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop dài dài.' },
    { title: 'Chất lượng tốt', text: 'Bạc sáng, đeo rất sang. Hộp đựng cũng rất đẹp, thích hợp làm quà tặng.' },
    { title: 'Đẹp xuất sắc', text: 'Mẫu mã y hình, đeo lên tay rất xinh. Giá cả hợp lý cho chất lượng này.' },
    { title: 'Sẽ quay lại', text: 'Mua lần đầu nhưng rất ấn tượng. Sản phẩm đẹp, dịch vụ tốt.' },
    { title: 'Quá đẹp', text: 'Nhẫn vừa tay, đá sáng lấp lánh. Rất đáng tiền!' },
    { title: 'Hài lòng', text: 'Shop đóng gói rất kỹ, sản phẩm không bị trầy xước. Chất lượng bạc tốt.' },
    { title: 'Dễ thương', text: 'Vòng tay xinh xắn, thiết kế tinh tế. Rất thích phong cách của shop.' },
    { title: 'Uy tín', text: 'Đã mua nhiều lần và chưa bao giờ thất vọng. Chúc shop buôn may bán đắt.' },
    { title: '10 điểm', text: 'Không có gì để chê. Từ sản phẩm đến dịch vụ đều tuyệt vời.' }
];

async function seed() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create Users
        const users = [];
        const password = await bcrypt.hash('123456', 10);

        for (const u of fakeUsers) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create({
                    name: u.name,
                    email: u.email,
                    password: password,
                    role: 'user'
                });
                console.log(`Created user: ${u.name}`);
            } else {
                console.log(`User exists: ${u.name}`);
            }
            users.push(user);
        }

        // 2. Get Products
        const products = await Product.find().limit(10);
        if (products.length === 0) {
            console.log('No products found. Please seed products first.');
            process.exit(1);
        }

        // 3. Create Reviews
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const product = products[i % products.length]; // Cycle through products
            const content = reviewContents[i % reviewContents.length];

            const existingReview = await Review.findOne({ user: user._id, product: product._id });
            if (!existingReview) {
                await Review.create({
                    user: user._id,
                    product: product._id,
                    rating: 5,
                    title: content.title,
                    text: content.text
                });
                console.log(`Created review by ${user.name} for ${product.name}`);

                // Update product stats
                const agg = await Review.aggregate([
                    { $match: { product: product._id } },
                    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
                ]);
                if (agg.length > 0) {
                    await Product.findByIdAndUpdate(product._id, { ratingsAvg: agg[0].avg, ratingsCount: agg[0].count });
                }
            } else {
                console.log(`Review already exists for ${user.name}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
