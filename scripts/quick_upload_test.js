const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const quickUploadTest = async () => {
  try {
    console.log('1️⃣ Testing backend connection...');
    const healthCheck = await axios.get('http://localhost:3000/api/collections');
    console.log(`✅ Backend is UP - ${healthCheck.data.collections.length} collections found`);
    
    console.log('\n2️⃣ Login...');
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const token = login.data.token;
    console.log('✅ Login successful');
    
    console.log('\n3️⃣ Upload test image...');
    const uploadsDir = path.join(__dirname, '../BE/uploads');
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    
    if (files.length === 0) {
      console.log('❌ No test images found');
      return;
    }
    
    const testFile = path.join(uploadsDir, files[0]);
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testFile));
    
    const uploadRes = await axios.post('http://localhost:3000/api/upload/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    console.log('✅ Upload successful!');
    console.log('   URL:', uploadRes.data.url);
    console.log('   Message:', uploadRes.data.message);
    
    console.log('\n4️⃣ Test image accessibility...');
    const imageUrl = uploadRes.data.url;
    const imageRes = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 5000
    });
    
    console.log('✅ Image is accessible!');
    console.log('   Size:', (imageRes.data.byteLength / 1024).toFixed(2), 'KB');
    console.log('   Type:', imageRes.headers['content-type']);
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n💡 Now try uploading in browser:');
    console.log('   http://localhost:3001/admin/collections');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('   No response from server');
      console.error('   Make sure backend is running on port 3000');
    } else {
      console.error('   Error:', error.message);
    }
  }
};

quickUploadTest();
