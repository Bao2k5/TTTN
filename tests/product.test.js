// tests/product.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../BE/src/app');
const Product = require('../BE/src/models/product.model');
const User = require('../BE/src/models/user.model');

describe('Product API Tests', () => {
  let adminToken;
  let userToken;
  let testProductId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thuongmaidientu_test');
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });

    // Create regular user
    const regularUser = await User.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password123',
      isVerified: true
    });

    // Login to get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    // Clean up
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    beforeAll(async () => {
      // Create test products
      await Product.create([
        {
          name: 'Nhẫn Bạc 925 Test 1',
          slug: 'nhan-bac-925-test-1',
          description: 'Test product 1',
          price: 500000,
          priceSale: 450000,
          category: 'Nhẫn',
          material: 'Bạc 925',
          stock: 10,
          images: ['test1.jpg']
        },
        {
          name: 'Vòng Tay Vàng Test 2',
          slug: 'vong-tay-vang-test-2',
          description: 'Test product 2',
          price: 1000000,
          category: 'Vòng Tay',
          material: 'Vàng',
          stock: 5,
          images: ['test2.jpg']
        }
      ]);
    });

    it('should get all products', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=Nhẫn');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].category).toBe('Nhẫn');
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=400000&maxPrice=600000');
      
      expect(res.status).toBe(200);
      res.body.forEach(product => {
        const price = product.priceSale || product.price;
        expect(price).toBeGreaterThanOrEqual(400000);
        expect(price).toBeLessThanOrEqual(600000);
      });
    });

    it('should filter products by material', async () => {
      const res = await request(app).get('/api/products?material=Bạc 925');
      
      expect(res.status).toBe(200);
      res.body.forEach(product => {
        expect(product.material).toBe('Bạc 925');
      });
    });

    it('should search products by name', async () => {
      const res = await request(app).get('/api/products?search=Nhẫn');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by id', async () => {
      const product = await Product.findOne({ slug: 'nhan-bac-925-test-1' });
      const res = await request(app).get(`/api/products/${product._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Nhẫn Bạc 925 Test 1');
    });

    it('should return 404 for invalid product id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    it('should create product with admin token', async () => {
      const newProduct = {
        name: 'Dây Chuyền Test',
        description: 'Test product',
        price: 800000,
        category: 'Dây Chuyền',
        material: 'Bạc 925',
        stock: 15,
        images: ['test3.jpg']
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Dây Chuyền Test');
      expect(res.body.slug).toBe('day-chuyen-test');
      
      testProductId = res.body._id;
    });

    it('should reject product creation without admin token', async () => {
      const newProduct = {
        name: 'Unauthorized Product',
        price: 500000,
        category: 'Nhẫn',
        material: 'Bạc',
        stock: 10
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProduct);
      
      expect(res.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const invalidProduct = {
        name: 'Test',
        // missing required fields
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct);
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id (Admin Only)', () => {
    it('should update product with admin token', async () => {
      const updates = {
        price: 900000,
        stock: 20
      };

      const res = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
      
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(900000);
      expect(res.body.stock).toBe(20);
    });

    it('should reject update without admin token', async () => {
      const res = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 1000000 });
      
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/products/:id (Admin Only)', () => {
    it('should delete product with admin token', async () => {
      const res = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      
      // Verify product is deleted
      const deletedProduct = await Product.findById(testProductId);
      expect(deletedProduct).toBeNull();
    });

    it('should reject delete without admin token', async () => {
      const product = await Product.findOne();
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
    });
  });

  describe('Product Slug Generation', () => {
    it('should generate unique slug for duplicate names', async () => {
      const product1 = await Product.create({
        name: 'Nhẫn Test Duplicate',
        price: 500000,
        category: 'Nhẫn',
        material: 'Bạc',
        stock: 10,
        images: ['test.jpg']
      });

      const product2 = await Product.create({
        name: 'Nhẫn Test Duplicate',
        price: 600000,
        category: 'Nhẫn',
        material: 'Vàng',
        stock: 5,
        images: ['test2.jpg']
      });

      expect(product1.slug).not.toBe(product2.slug);
      expect(product2.slug).toMatch(/nhan-test-duplicate-\d+/);
    });
  });
});
