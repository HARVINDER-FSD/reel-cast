#!/usr/bin/env node

/**
 * 👥 USER CREATION SCRIPT
 * 
 * Creates test users for different roles:
 * 1. Talent (Model/Creator)
 * 2. Instagram Page Owner
 * 3. Brand (Company)
 * 
 * Usage: node create-user.js
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function createUsers() {
  try {
    console.log(chalk.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║   👥 TEST USERS CREATION SCRIPT 👥   ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    // Connect to MongoDB
    console.log(chalk.yellow('📡 Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green('✅ MongoDB connected successfully!\n'));

    // Hash password
    console.log(chalk.yellow('🔐 Hashing passwords...'));
    const userPassword = 'User123!';
    const hashedPassword = await bcrypt.hash(userPassword, 12);
    console.log(chalk.green('✅ Passwords hashed successfully!\n'));

    // 1. CREATE TALENT USER
    console.log(chalk.yellow('1️⃣  Creating Talent user...'));
    const talent = await mongoose.connection.collection('users').insertOne({
      name: "Test Talent",
      email: "talent@reelcast.com",
      password: hashedPassword,
      phone: "+91 9876543212",
      role: "talent",
      isSuperAdmin: false,
      isActive: true,
      isVerified: false,
      profilePicture: null,
      category: "Model",
      city: "Mumbai",
      rate: 15000,
      experience: "2 years",
      gender: "Female",
      bio: "Professional model with extensive portfolio",
      skills: ["Photography", "Modeling", "Acting"],
      availability: "available",
      loginAttempts: 0,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(chalk.green('✅ Talent user created!\n'));

    // 2. CREATE BRAND USER
    console.log(chalk.yellow('2️⃣  Creating Brand user...'));
    const brand = await mongoose.connection.collection('users').insertOne({
      name: "Test Brand",
      email: "brand@reelcast.com",
      password: hashedPassword,
      phone: "+91 9876543213",
      role: "brand",
      isSuperAdmin: false,
      isActive: true,
      isVerified: false,
      profilePicture: null,
      brandName: "Test Company Ltd.",
      companyType: "E-Commerce",
      industry: "Fashion",
      plan: "growth",
      requestsUsed: 0,
      requestsLimit: 20,
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      loginAttempts: 0,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(chalk.green('✅ Brand user created!\n'));

    // 3. CREATE INSTAGRAM PAGE USER
    console.log(chalk.yellow('3️⃣  Creating Instagram Page user...'));
    const igPage = await mongoose.connection.collection('users').insertOne({
      name: "Test IG Page",
      email: "igpage@reelcast.com",
      password: hashedPassword,
      phone: "+91 9876543214",
      role: "igpage",
      isSuperAdmin: false,
      isActive: true,
      isVerified: false,
      profilePicture: null,
      handle: "@testcreator_official",
      niche: "Fashion & Lifestyle",
      followers: "125K",
      followerCount: 125000,
      engagementRate: "8.5%",
      postRate: 10000,
      storyRate: 5000,
      reelRate: 15000,
      city: "Mumbai",
      about: "Fashion influencer and content creator",
      audienceGender: "85% Female, 15% Male",
      audienceAge: "18-35",
      availability: "available",
      totalPromos: 0,
      loginAttempts: 0,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(chalk.green('✅ Instagram Page user created!\n'));

    // Display all credentials
    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║     🔑 ALL USER CREDENTIALS 🔑       ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    console.log(chalk.bold.yellow('\n1️⃣  TALENT USER (Model/Creator)\n'));
    console.log(chalk.bold.green('Email:'));
    console.log(chalk.white('   talent@reelcast.com'));
    console.log(chalk.bold.green('Password:'));
    console.log(chalk.white(`   ${userPassword}`));
    console.log(chalk.bold.green('Role:'));
    console.log(chalk.white('   TALENT'));
    console.log(chalk.bold.green('Dashboard:'));
    console.log(chalk.white('   /dashboard/talent/'));
    console.log(chalk.bold.green('Details:'));
    console.log(chalk.white('   • Category: Model'));
    console.log(chalk.white('   • City: Mumbai'));
    console.log(chalk.white('   • Rate: ₹15,000/project'));
    console.log(chalk.white(`   • ID: ${talent.insertedId}`));

    console.log(chalk.bold.yellow('\n2️⃣  BRAND USER (Company)\n'));
    console.log(chalk.bold.green('Email:'));
    console.log(chalk.white('   brand@reelcast.com'));
    console.log(chalk.bold.green('Password:'));
    console.log(chalk.white(`   ${userPassword}`));
    console.log(chalk.bold.green('Role:'));
    console.log(chalk.white('   BRAND'));
    console.log(chalk.bold.green('Dashboard:'));
    console.log(chalk.white('   /dashboard/brand/'));
    console.log(chalk.bold.green('Details:'));
    console.log(chalk.white('   • Brand: Test Company Ltd.'));
    console.log(chalk.white('   • Plan: Growth (20 requests/month)'));
    console.log(chalk.white('   • Industry: Fashion'));
    console.log(chalk.white(`   • ID: ${brand.insertedId}`));

    console.log(chalk.bold.yellow('\n3️⃣  INSTAGRAM PAGE USER\n'));
    console.log(chalk.bold.green('Email:'));
    console.log(chalk.white('   igpage@reelcast.com'));
    console.log(chalk.bold.green('Password:'));
    console.log(chalk.white(`   ${userPassword}`));
    console.log(chalk.bold.green('Role:'));
    console.log(chalk.white('   IG PAGE OWNER'));
    console.log(chalk.bold.green('Dashboard:'));
    console.log(chalk.white('   /dashboard/igpage/'));
    console.log(chalk.bold.green('Details:'));
    console.log(chalk.white('   • Handle: @testcreator_official'));
    console.log(chalk.white('   • Followers: 125,000'));
    console.log(chalk.white('   • Niche: Fashion & Lifestyle'));
    console.log(chalk.white('   • Post Rate: ₹10,000'));
    console.log(chalk.white(`   • ID: ${igPage.insertedId}`));

    console.log(chalk.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║      📝 NEXT STEPS                     ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    console.log(chalk.yellow('✅ Users created successfully!'));
    console.log(chalk.yellow('1. Start backend: npm run dev'));
    console.log(chalk.yellow('2. Start frontend: cd client && npm run dev'));
    console.log(chalk.yellow('3. Visit: http://localhost:5173'));
    console.log(chalk.yellow('4. Login with any of the above accounts\n'));

    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║      🎯 TESTING FLOW                   ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    console.log(chalk.blue('Test As Talent:'));
    console.log(chalk.white('  1. Login with talent@reelcast.com'));
    console.log(chalk.white('  2. View talent dashboard'));
    console.log(chalk.white('  3. Edit profile & rates'));
    console.log(chalk.white('  4. Check booking requests\n'));

    console.log(chalk.blue('Test As Brand:'));
    console.log(chalk.white('  1. Login with brand@reelcast.com'));
    console.log(chalk.white('  2. Browse talent'));
    console.log(chalk.white('  3. Browse Instagram pages'));
    console.log(chalk.white('  4. Send booking requests'));
    console.log(chalk.white('  5. Check subscription\n'));

    console.log(chalk.blue('Test As IG Page:'));
    console.log(chalk.white('  1. Login with igpage@reelcast.com'));
    console.log(chalk.white('  2. View IG dashboard'));
    console.log(chalk.white('  3. Edit rates'));
    console.log(chalk.white('  4. Check promo requests\n'));

    console.log(chalk.green.bold('✨ All users ready for testing!\n'));

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(chalk.red.bold('\n❌ ERROR:\n'), chalk.red(error.message));
    console.log(chalk.red('\nTroubleshooting:'));
    console.log(chalk.red('• Make sure MongoDB is running'));
    console.log(chalk.red('• Check MONGO_URI in .env file'));
    console.log(chalk.red('• Run scripts in order:'));
    console.log(chalk.red('  1. node create-super-admin.js'));
    console.log(chalk.red('  2. node create-admin.js'));
    console.log(chalk.red('  3. node create-user.js\n'));
    
    await mongoose.connection.close();
    process.exit(1);
  }
}

createUsers();
