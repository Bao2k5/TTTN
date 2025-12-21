const axios = require('axios');

(async function(){
  try{
    const res = await axios.get('http://localhost:3000/api/products?q=Test');
    const products = res.data.products || res.data;
    console.log(`Found ${products.length} product(s) matching 'Test':`);
    products.forEach(p => console.log('- id:', p._id || p.id, 'name:', p.name));
  } catch (e) {
    console.error('Error calling API:', e.message || e);
    if (e.response) console.error('Status:', e.response.status, 'Data:', e.response.data);
  }
})();
