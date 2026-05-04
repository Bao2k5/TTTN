const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017/hoangmyjewelry', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function updateProductImages() {
  try {
    console.log('[SEARCH] Đang kiểm tra ảnh trong BE/uploads/...');
    
    const uploadsDir = path.join(__dirname, '..', 'BE', 'uploads');
    const imageFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.match(/\.(png|jpg|jpeg|webp)$/i))
      .sort();
    
    console.log(` Tìm thấy ${imageFiles.length} ảnh trong BE/uploads/`);
    
    const products = await Product.find();
    console.log(`[PACKAGE] Tìm thấy ${products.length} sản phẩm trong database`);
    
    let imageIndex = 0;
    
    for (const product of products) {
      const numImages = product.images ? product.images.length : 2;
      const newImages = [];
      
      for (let i = 0; i < numImages && imageIndex < imageFiles.length; i++) {
        const filename = imageFiles[imageIndex];
        newImages.push({
          url: `http://localhost:3000/uploads/${filename}`,
          public_id: filename.replace(/\.[^/.]+$/, '')
        });
        imageIndex++;
      }
      
      if (newImages.length > 0) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { images: newImages } }
        );
        console.log(`[SUCCESS] Đã cập nhật ${newImages.length} ảnh cho "${product.name}"`);
        console.log(`   Ảnh mới: ${newImages[0].url}`);
      }
    }
    
    console.log('\n[COMPLETE] Hoàn thành! Tất cả sản phẩm đã được cập nhật với ảnh local.');
    console.log(`[STATS] Đã sử dụng ${imageIndex}/${imageFiles.length} ảnh`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Lỗi:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

updateProductImages();
