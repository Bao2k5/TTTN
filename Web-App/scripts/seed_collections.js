require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('../BE/src/config/db');
const Collection = require('../BE/src/models/collection.model');

const collections = [
  {
    name: 'Nhẫn',
    slug: 'nhan',
    description: 'Biểu tượng của tình yêu và cam kết vĩnh cửu',
    image: '/images/collections/nhan.jpg',
    featured: true
  },
  {
    name: 'Dây Chuyền',
    slug: 'day-chuyen',
    description: 'Nâng tầm phong cách với sự tinh tế',
    image: '/images/collections/day-chuyen.jpg',
    featured: true
  },
  {
    name: 'Bông Tai',
    slug: 'bong-tai',
    description: 'Điểm nhấn hoàn hảo cho khuôn mặt',
    image: '/images/collections/bong-tai.jpg',
    featured: true
  },
  {
    name: 'Lắc Tay',
    slug: 'vong-tay',
    description: 'Sang trọng và quyến rũ ở từng chi tiết',
    image: '/images/collections/vong-tay.jpg',
    featured: true
  }
];

const seedCollections = async () => {
  try {
    console.log('[CONNECT] Connecting to MongoDB...');
    await connectDB();

    console.log('[DELETE]  Clearing existing collections...');
    await Collection.deleteMany({});

    console.log(' Seeding 4 main collections...');
    const createdCollections = await Collection.insertMany(collections);

    console.log('[SUCCESS] Successfully seeded collections:');
    createdCollections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name} (${col.slug}) - ID: ${col._id}`);
    });

    console.log('\n[STATS] Summary:');
    console.log(`   Total collections: ${createdCollections.length}`);
    console.log(`   Featured collections: ${createdCollections.filter(c => c.featured).length}`);

    console.log('\n[COMPLETE] Collections seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error seeding collections:', error);
    process.exit(1);
  }
};

seedCollections();
