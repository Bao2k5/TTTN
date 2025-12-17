// tests/order.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../BE/src/app');
const Order = require('../BE/src/models/order.model');
const Product = require('../BE/src/models/product.model');
const User = require('../BE/src/models/user.model');
const Cart = require('../BE/src/models/cart.model');

describe('Order API Tests', () => {
  let userToken;
  let userId;
  let testProduct;
  let testOrderId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thuongmaidientu_test');
    }

    // Create test user
    const user = await User.create({
      name: 'Order Test User',
      email: 'ordertest@example.com',
      password: 'password123',
      isVerified: true
    });
    userId = user._id;

    // Login to get token
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ordertest@example.com', password: 'password123' });
    userToken = login.body.token;

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product for Order',
      slug: 'test-product-order',
      description: 'Test product',
      price: 500000,
      category: 'Nhẫn',
      material: 'Bạc 925',
      stock: 100,
      images: [{ url: 'test.jpg', public_id: 'test_image_1' }]
    });
  });

  afterAll(async () => {
    // Clean up
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Cart.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Cart Management', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });
      
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
    });

    it('should get cart items', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });

    it('should update cart item quantity', async () => {
      const res = await request(app)
        .put('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 3
        });
      
      expect(res.status).toBe(200);
      expect(res.body.items[0].quantity).toBe(3);
    });

    it('should remove item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/${testProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });

    it('should reject cart operations without auth', async () => {
      const res = await request(app)
        .get('/api/cart');
      
      expect(res.status).toBe(401);
    });
  });

  describe('Order Creation', () => {
    beforeEach(async () => {
      // Add item to cart before each order test
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });
    });

    it('should create order with COD payment', async () => {
      const orderData = {
        shippingAddress: {
          fullName: 'Test User',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Hà Nội',
          district: 'Ba Đình',
          ward: 'Phúc Xá'
        },
        paymentMethod: 'cod',
        note: 'Test order'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);
      
      expect(res.status).toBe(201);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.paymentMethod).toBe('cod');
      expect(res.body.order.items).toHaveLength(1);
      expect(res.body.order.totalAmount).toBeGreaterThan(0);
      
      testOrderId = res.body.order._id;
    });

    it('should validate required shipping fields', async () => {
      const invalidOrder = {
        shippingAddress: {
          fullName: 'Test User',
          // missing required fields
        },
        paymentMethod: 'cod'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidOrder);
      
      expect(res.status).toBe(400);
    });

    it('should reject order with empty cart', async () => {
      // Clear cart first
      await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] }
      );

      const orderData = {
        shippingAddress: {
          fullName: 'Test User',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Hà Nội',
          district: 'Ba Đình',
          ward: 'Phúc Xá'
        },
        paymentMethod: 'cod'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);
      
      expect(res.status).toBe(400);
    });
  });

  describe('Order Retrieval', () => {
    it('should get user orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get specific order by id', async () => {
      const res = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(testOrderId);
    });

    it('should not get other user\'s order', async () => {
      // Create another user
      const anotherUser = await User.create({
        name: 'Another User',
        email: 'another@test.com',
        password: 'password123',
        isVerified: true
      });

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'another@test.com', password: 'password123' });

      const res = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${login.body.token}`);
      
      expect(res.status).toBe(403);
    });
  });

  describe('Order Cancellation', () => {
    it('should cancel pending order', async () => {
      const res = await request(app)
        .put(`/api/orders/${testOrderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('cancelled');
    });

    it('should not cancel delivered order', async () => {
      // Update order status to delivered
      await Order.findByIdAndUpdate(testOrderId, { status: 'delivered' });

      const res = await request(app)
        .put(`/api/orders/${testOrderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(400);
    });
  });

  describe('Stock Management', () => {
    it('should decrease stock after order', async () => {
      const initialStock = testProduct.stock;

      // Add to cart and create order
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 5
        });

      const orderData = {
        shippingAddress: {
          fullName: 'Test User',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Hà Nội',
          district: 'Ba Đình',
          ward: 'Phúc Xá'
        },
        paymentMethod: 'cod'
      };

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      // Check stock decreased
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.stock).toBe(initialStock - 5);
    });

    it('should reject order if insufficient stock', async () => {
      // Try to order more than available
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 1000
        });

      const orderData = {
        shippingAddress: {
          fullName: 'Test User',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Hà Nội',
          district: 'Ba Đình',
          ward: 'Phúc Xá'
        },
        paymentMethod: 'cod'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);
      
      expect(res.status).toBe(400);
    });
  });
});
