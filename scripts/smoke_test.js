const fetch = require('node-fetch');

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:5000';
  try {
    console.log('GET /api/products');
    let r = await fetch(base + '/api/products');
    console.log('status', r.status);
    const data = await r.json();
    console.log('products count', data.products ? data.products.length : 'n/a');
  } catch (err) {
    console.error('Smoke test error', err.message);
  }
}

run();
