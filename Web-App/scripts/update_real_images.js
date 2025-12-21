const mongoose = require('mongoose');
const Product = require('../BE/src/models/product.model');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/hoangmyjewelry')
.then(async () => {
  console.log('Đã kết nối database');
  
  // Mapping ảnh thật theo category
  const realImages = {
    'nhẫn': ['/nhan.png', '/product-1.png'],
    'dây chuyền': ['/day-chuyen.png', '/product-2.png'],
    'bông tai': ['/bong-tai.png', '/product-3.png'],
    'vòng tay': ['/vong-tay.png', '/product-4.png'],
    'default': ['/product-5.png', '/product-6.png']
  };
  
  // Lấy tất cả sản phẩm và cập nhật ảnh
  const products = await Product.find({});
  
  for (const product of products) {
    let images = realImages.default;
    
    // Tìm category phù hợp
    const categoryLower = product.category?.toLowerCase() || '';
    if (categoryLower.includes('nhẫn') || categoryLower.includes('ring')) {
      images = realImages['nhẫn'];
    } else if (categoryLower.includes('dây chuyền') || categoryLower.includes('necklace')) {
      images = realImages['dây chuyền'];
    } else if (categoryLower.includes('bông tai') || categoryLower.includes('earring')) {
      images = realImages['bông tai'];
    } else if (categoryLower.includes('vòng tay') || categoryLower.includes('bracelet')) {
      images = realImages['vòng tay'];
    }
    
    // Cập nhật với ảnh thật
    const updatedImages = images.map((url, index) => ({
      url: url,
      public_id: `real-image-${index}`
    }));
    
    await Product.findByIdAndUpdate(product._id, { images: updatedImages });
    console.log(`✅ Đã cập nhật ảnh thật cho: ${product.name}`);
    console.log(`   Images: ${updatedImages.map(i => i.url).join(', ')}`);
  }
  
  console.log('\n🎉 Hoàn thành! Tất cả sản phẩm đã có ảnh thật');
  console.log('🔄 Refresh lại trang web để xem ảnh mới');
  
  process.exit(0);
})
.catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
