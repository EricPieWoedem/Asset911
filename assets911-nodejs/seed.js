require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/general_users/user.model');
const Asset = require('./models/general_users/asset.model');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    // await User.deleteMany({});
    // await Asset.deleteMany({});

    // Create a sample user
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'hashedpassword123', // In production, this should be hashed
      phoneNumber: '0550883056',
      provider: 'phoneNumber', 
    });

    console.log('Created user:', user._id);

    // Create sample assets
    const assets = await Asset.insertMany([
      {
        model: 'iPhone 14',
        brand: 'Apple',
        name: 'iPhone 14',
        type: 'Phone',
        uniqueNumber: 'UNIQUE001',
        dateOfPurchase: '2022-01-15',
        price: 999,
        purchaseReciept: 'RECEIPT001',
        identificationDetails: 'IMEI123456789',
        registrationAddress: '123 Main St',
        status: 'okay',
        owner: user._id,
        images: [
          'https://res.cloudinary.com/jhay/image/upload/v1699013243/br7lywtwczk0436y7uae.png',
        ],
      },
      {
        model: 'Dell XPS 13',
        brand: 'Dell',
        name: 'Dell XPS 13',
        type: 'Laptop',
        uniqueNumber: 'UNIQUE002',
        dateOfPurchase: '2023-06-20',
        price: 1299,
        purchaseReciept: 'RECEIPT002',
        identificationDetails: 'SERIAL456789',
        registrationAddress: '456 Oak Ave',
        status: 'okay',
        owner: user._id,
        images: [
          'https://res.cloudinary.com/jhay/image/upload/v1699013243/br7lywtwczk0436y7uae.png',
        ],
      },
      {
        model: 'Samsung Galaxy Watch',
        brand: 'Samsung',
        name: 'Samsung Galaxy Watch',
        type: 'Watch',
        uniqueNumber: 'UNIQUE003',
        dateOfPurchase: '2023-03-10',
        price: 299,
        purchaseReciept: 'RECEIPT003',
        identificationDetails: 'WATCH123',
        registrationAddress: '789 Pine Rd',
        status: 'okay',
        owner: user._id,
        images: [
          'https://res.cloudinary.com/jhay/image/upload/v1699013243/br7lywtwczk0436y7uae.png',
        ],
      },
    ]);

    console.log(`Created ${assets.length} assets`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
