const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../BE/src/models/product.model');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/hoangmyjewelry')
.then(async () => {
  console.log('Đã kết nối database');
  
  // Lấy tất cả sản phẩm
  const products = await Product.find({});
  console.log(`Tìm thấy ${products.length} sản phẩm`);
  
  // Cập nhật lại ảnh placeholder cho tất cả sản phẩm
  const placeholderImages = [
    { url: '/placeholder-ring-1.jpg', public_id: 'placeholder-ring-1' },
    { url: '/placeholder-ring-2.jpg', public_id: 'placeholder-ring-2' },
    { url: '/placeholder-necklace-1.jpg', public_id: 'placeholder-necklace-1' },
    { url: '/placeholder-earring-1.jpg', public_id: 'placeholder-earring-1' },
    { url: '/placeholder-bracelet-1.jpg', public_id: 'placeholder-bracelet-1' }
  ];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Gán ảnh placeholder theo category
    let images = [];
    if (product.category?.toLowerCase().includes('nhẫn') || product.category?.toLowerCase().includes('ring')) {
      images = [placeholderImages[0], placeholderImages[1]];
    } else if (product.category?.toLowerCase().includes('dây chuyền') || product.category?.toLowerCase().includes('necklace')) {
      images = [placeholderImages[2], placeholderImages[0]];
    } else if (product.category?.toLowerCase().includes('bông tai') || product.category?.toLowerCase().includes('earring')) {
      images = [placeholderImages[3], placeholderImages[2]];
    } else {
      images = [placeholderImages[0], placeholderImages[4]];
    }
    
    await Product.findByIdAndUpdate(product._id, { images });
    console.log(`✅ Đã cập nhật ảnh cho: ${product.name}`);
  }
  
  console.log('\n🎉 Hoàn thành! Tất cả sản phẩm đã có ảnh placeholder');
  console.log('📝 Bạn cần upload ảnh thật vào folder public/ của frontend');
  
  process.exit(0);
})
.catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
