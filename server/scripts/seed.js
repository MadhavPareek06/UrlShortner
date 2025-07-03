const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
require('dotenv').config();

const Url = require('../models/Url');

const sampleUrls = [
  {
    originalUrl: 'https://www.google.com',
    title: 'Google Search',
    description: 'The world\'s most popular search engine',
    clicks: Math.floor(Math.random() * 100)
  },
  {
    originalUrl: 'https://www.github.com',
    title: 'GitHub',
    description: 'Where the world builds software',
    clicks: Math.floor(Math.random() * 50)
  },
  {
    originalUrl: 'https://www.stackoverflow.com',
    title: 'Stack Overflow',
    description: 'Where developers learn, share, & build careers',
    clicks: Math.floor(Math.random() * 75)
  },
  {
    originalUrl: 'https://www.youtube.com',
    title: 'YouTube',
    description: 'Video sharing platform',
    clicks: Math.floor(Math.random() * 200)
  },
  {
    originalUrl: 'https://www.npmjs.com',
    title: 'npm',
    description: 'Node.js package manager',
    clicks: Math.floor(Math.random() * 30)
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Url.deleteMany({});
    console.log('🗑️  Cleared existing URLs');

    // Create sample URLs
    const urls = sampleUrls.map(url => ({
      ...url,
      shortId: nanoid(8),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      lastClickedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
    }));

    await Url.insertMany(urls);
    console.log(`✅ Created ${urls.length} sample URLs`);

    // Display created URLs
    console.log('\n📋 Sample URLs created:');
    urls.forEach(url => {
      console.log(`   ${url.shortId} -> ${url.originalUrl} (${url.clicks} clicks)`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
