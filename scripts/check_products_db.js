const connectDB = require('../BE/src/config/db');
const Product = require('../BE/src/models/product.model');

(async function(){
  try{
    await connectDB();
    console.log('Connected, querying for test products...');
    const tests = await Product.find({ name: /Test Silver Product|CRUD Test Product/i }).lean().limit(50);
    console.log(`Found ${tests.length} test product(s):`);
    tests.forEach(p => {
      console.log('- id:', p._id, 'name:', p.name, 'createdAt:', p.createdAt);
    });
    process.exit(0);
  } catch (e) {
    console.error('Error querying DB:', e.message || e);
    process.exit(1);
  }
})();
