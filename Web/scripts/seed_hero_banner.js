// scripts/seed_hero_banner.js
// Script to seed the current hero banner into database
const mongoose = require('mongoose');
require('dotenv').config();

const HeroBanner = require('../BE/src/models/heroBanner.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hoangmyjewelry';

const seedHeroBanner = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing banners
    await HeroBanner.deleteMany({});
    console.log('🗑️  Cleared existing hero banners');

    // Create default hero banner
    const banner = await HeroBanner.create({
      title: 'HM Jewelry',
      subtitle: 'Trang sức cao cấp - Vẻ đẹp vĩnh cửu',
      description: 'Khám phá bộ sưu tập trang sức bạc 925 độc đáo, tinh xảo',
      image: 'http://localhost:3000/uploads/bthn-hero.jpg', // Update this with actual uploaded image URL
      buttonText: 'Khám phá ngay',
      buttonLink: '/products',
      isActive: true,
      startDate: null,
      endDate: null,
      order: 0
    });

    console.log('✅ Created default hero banner:');
    console.log('   Title:', banner.title);
    console.log('   Subtitle:', banner.subtitle);
    console.log('   Image:', banner.image);
    console.log('   Active:', banner.isActive);

    console.log('\n📝 Note: Please update the image URL after uploading banner image through admin panel');
    console.log('   Current image path: /bthn-hero.jpg (in public folder)');
    console.log('   You can upload a new image at: http://localhost:3001/admin/hero-banners');

    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hero banner:', error);
    process.exit(1);
  }
};

seedHeroBanner();
