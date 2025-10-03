#!/usr/bin/env node

/**
 * Visitor2Buy Backend Setup Test
 * This script tests the basic functionality of the API
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testSetup() {
  console.log('🚀 Testing Visitor2Buy Backend Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables...');
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.log('❌ Missing environment variables:', missingEnvVars.join(', '));
    console.log('   Please copy .env.example to .env and configure the variables.\n');
  } else {
    console.log('✅ All required environment variables are set.\n');
  }

  // Test 2: Database Connection
  console.log('2. Testing Database Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection successful.\n');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('   Please check your MONGODB_URI in the .env file.\n');
  }

  // Test 3: Model Loading
  console.log('3. Testing Model Loading...');
  try {
    const User = require('./models/User');
    const Project = require('./models/Project');
    const Widget = require('./models/Widget');
    const Analytics = require('./models/Analytics');
    
    console.log('✅ All models loaded successfully.');
    console.log('   - User Model ✓');
    console.log('   - Project Model ✓');
    console.log('   - Widget Model ✓');
    console.log('   - Analytics Model ✓\n');
  } catch (error) {
    console.log('❌ Model loading failed:', error.message);
  }

  // Test 4: Route Loading
  console.log('4. Testing Route Loading...');
  try {
    require('./routes/auth');
    require('./routes/projects');
    require('./routes/widgets');
    require('./routes/analytics');
    require('./routes/embed');
    require('./routes/payments');
    require('./routes/admin');
    
    console.log('✅ All routes loaded successfully.');
    console.log('   - Auth Routes ✓');
    console.log('   - Project Routes ✓');
    console.log('   - Widget Routes ✓');
    console.log('   - Analytics Routes ✓');
    console.log('   - Embed Routes ✓');
    console.log('   - Payment Routes ✓');
    console.log('   - Admin Routes ✓\n');
  } catch (error) {
    console.log('❌ Route loading failed:', error.message);
  }

  // Test 5: External Services Configuration
  console.log('5. Checking External Services Configuration...');
  
  // Cloudinary
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log('✅ Cloudinary configuration found.');
  } else {
    console.log('⚠️  Cloudinary not configured (image uploads will fail).');
  }

  // Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    console.log('✅ Stripe configuration found.');
  } else {
    console.log('⚠️  Stripe not configured (payments will fail).');
  }

  // Email
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ Email configuration found.');
  } else {
    console.log('⚠️  Email not configured (notifications will fail).');
  }

  console.log('\n🎉 Setup test completed!');
  console.log('\nNext steps:');
  console.log('1. Configure missing environment variables');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Test the API endpoints with your frontend or API client');
  console.log('4. Check the README.md for detailed API documentation');
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.log('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
testSetup().catch(console.error);