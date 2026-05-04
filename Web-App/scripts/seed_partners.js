import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Partner from '../BE/src/models/partner.model.js';

dotenv.config();

const seedPartners = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thuongmaidientu');
    console.log('[SUCCESS] Đã kết nối MongoDB');

    // Clear existing partners
    await Partner.deleteMany({});
    console.log('[DELETE]  Xóa partners cũ');

    // Sample partners data
    const partnersSample = [
      {
        name: 'Tiffany & Co',
        logo: 'tiffany-logo.jpg',
        url: 'https://www.tiffany.com',
        description: 'Thương hiệu trang sức hàng đầu thế giới',
        displayFrom: new Date('2025-01-01'),
        displayTo: null,
        isActive: true,
        position: 1,
      },
      {
        name: 'Cartier',
        logo: 'cartier-logo.jpg',
        url: 'https://www.cartier.com',
        description: 'Trang sức cao cấp Pháp',
        displayFrom: new Date('2025-01-01'),
        displayTo: null,
        isActive: true,
        position: 2,
      },
      {
        name: 'Pandora',
        logo: 'pandora-logo.jpg',
        url: 'https://www.pandora.net',
        description: 'Trang sức bạc 925 thiết kế',
        displayFrom: new Date('2025-01-01'),
        displayTo: null,
        isActive: true,
        position: 3,
      },
      {
        name: 'Van Cleef & Arpels',
        logo: 'van-cleef-logo.jpg',
        url: 'https://www.vancleefarpels.com',
        description: 'Trang sức tinh tế Pháp',
        displayFrom: new Date('2025-01-01'),
        displayTo: null,
        isActive: true,
        position: 4,
      },
      {
        name: 'Georg Jensen',
        logo: 'georg-jensen-logo.jpg',
        url: 'https://www.georgjensen.com',
        description: 'Trang sức bạc Đan Mạch',
        displayFrom: new Date('2025-01-01'),
        displayTo: null,
        isActive: true,
        position: 5,
      },
      // Ví dụ: Partner cho ngày Valentine
      {
        name: 'Mon Chéri Valentine',
        logo: 'moncheri-valentine.jpg',
        url: '#',
        description: 'Bộ sưu tập Valentine đặc biệt',
        displayFrom: new Date('2025-02-01'),
        displayTo: new Date('2025-02-28'),
        isActive: true,
        position: 6,
      },
      // Ví dụ: Partner cho Tết
      {
        name: 'Tết Gold Collection',
        logo: 'tet-gold-2025.jpg',
        url: '#',
        description: 'Bộ sưu tập Tết 2025',
        displayFrom: new Date('2025-01-15'),
        displayTo: new Date('2025-02-15'),
        isActive: true,
        position: 7,
      },
    ];

    // Insert partners
    const inserted = await Partner.insertMany(partnersSample);
    console.log(`[SUCCESS] Thêm ${inserted.length} partners mẫu`);

    // List all partners
    const allPartners = await Partner.find();
    console.log('\n[INFO] Danh sách Partners:');
    allPartners.forEach((p) => {
      console.log(`  - ${p.name} (${p.displayFrom.toLocaleDateString('vi-VN')} - ${p.displayTo ? p.displayTo.toLocaleDateString('vi-VN') : 'Vĩnh viễn'})`);
    });

    console.log('\n[COMPLETE] Seeding partners hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Lỗi:', error.message);
    process.exit(1);
  }
};

seedPartners();
