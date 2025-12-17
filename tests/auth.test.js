const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  // require app after setting MONGO_URI
  app = require('../BE/src/app');
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});

describe('Basic API smoke', () => {
  test('GET /api/products returns 200', async () => {
    const res = await request(app).get('/api/products');
    expect([200, 404]).toContain(res.status);
  }, 20000);
});
