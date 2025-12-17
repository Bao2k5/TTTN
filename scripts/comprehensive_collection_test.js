require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test toàn bộ luồng collections
const comprehensiveTest = async () => {
  try {
    console.log('🧪 COMPREHENSIVE COLLECTION TEST');
    console.log('='.repeat(50));
    
    // Step 1: Login
    console.log('\n1️⃣ Login as admin...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get all collections
    console.log('\n2️⃣ Get all collections...');
    const getCollections = await axios.get('http://localhost:3000/api/collections');
    const collections = getCollections.data.collections || getCollections.data;
    console.log(`✅ Found ${collections.length} collections`);
    collections.forEach(c => {
      console.log(`   - ${c.name} (${c.slug})`);
      console.log(`     Image: ${c.image}`);
    });
    
    // Step 3: Upload test image
    console.log('\n3️⃣ Upload test image...');
    const uploadsDir = path.join(__dirname, '../BE/uploads');
    const files = fs.readdirSync(uploadsDir);
    const testImage = files.find(f => f.endsWith('.png') || f.endsWith('.jpg'));
    
    if (!testImage) {
      console.log('❌ No test image found');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(path.join(uploadsDir, testImage)));
    
    const uploadRes = await axios.post('http://localhost:3000/api/upload/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Image uploaded successfully');
    console.log(`   URL: ${uploadRes.data.url}`);
    const newImageUrl = uploadRes.data.url;
    
    // Step 4: Update first collection with new image
    if (collections.length > 0) {
      const firstCollection = collections[0];
      console.log(`\n4️⃣ Update collection "${firstCollection.name}" with new image...`);
      
      const updateRes = await axios.put(
        `http://localhost:3000/api/collections/${firstCollection._id}`,
        {
          name: firstCollection.name,
          slug: firstCollection.slug,
          description: firstCollection.description,
          image: newImageUrl
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('✅ Collection updated successfully');
      console.log(`   New image: ${updateRes.data.collection.image}`);
      
      // Step 5: Verify image URL is accessible
      console.log('\n5️⃣ Verify image is accessible...');
      try {
        // Extract path from URL (remove domain if exists)
        const imagePath = newImageUrl.includes('http') 
          ? new URL(newImageUrl).pathname 
          : newImageUrl;
        
        const imageUrl = `http://localhost:3000${imagePath}`;
        const imageRes = await axios.get(imageUrl, { 
          responseType: 'arraybuffer',
          timeout: 5000 
        });
        
        if (imageRes.status === 200 && imageRes.data.byteLength > 0) {
          console.log('✅ Image is accessible');
          console.log(`   URL: ${imageUrl}`);
          console.log(`   Size: ${(imageRes.data.byteLength / 1024).toFixed(2)} KB`);
          console.log(`   Content-Type: ${imageRes.headers['content-type']}`);
        }
      } catch (err) {
        console.log('❌ Image not accessible:', err.message);
      }
    }
    
    // Step 6: Test frontend access (simulate)
    console.log('\n6️⃣ Verify collections API response format...');
    const finalCheck = await axios.get('http://localhost:3000/api/collections');
    const finalCollections = finalCheck.data.collections || finalCheck.data;
    
    console.log('✅ API Response structure:');
    console.log(`   - Total collections: ${finalCollections.length}`);
    finalCollections.forEach(c => {
      const hasValidImage = c.image && (c.image.startsWith('http') || c.image.startsWith('/'));
      console.log(`   - ${c.name}: ${hasValidImage ? '✅' : '❌'} Image URL valid`);
      if (!hasValidImage) {
        console.log(`     Current: ${c.image}`);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 COMPREHENSIVE TEST COMPLETED');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Login: Working`);
    console.log(`   ✅ Get Collections: Working`);
    console.log(`   ✅ Upload Image: Working`);
    console.log(`   ✅ Update Collection: Working`);
    console.log(`   ✅ Image Accessibility: Check results above`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Open http://localhost:3001/admin/collections');
    console.log('   2. Hard refresh (Ctrl+Shift+R)');
    console.log('   3. Upload new images for all collections');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   URL:', error.config.url);
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
};

comprehensiveTest();
