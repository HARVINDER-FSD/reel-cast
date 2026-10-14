#!/usr/bin/env node

/**
 * ✅ ADMIN CREATION SCRIPT
 * 
 * Creates regular Admin with limited platform access
 * (Can approve bookings, manage users, but cannot system settings)
 * 
 * Usage: node create-admin.js
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function createAdmin() {
  try {
    console.log(chalk.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║    ✅ ADMIN CREATION SCRIPT ✅        ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    // Connect to MongoDB
    console.log(chalk.yellow('📡 Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green('✅ MongoDB connected successfully!\n'));

    // Hash password
    console.log(chalk.yellow('🔐 Hashing password...'));
    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    console.log(chalk.green('✅ Password hashed successfully!\n'));

    // Create Admin
    console.log(chalk.yellow('👤 Creating Admin user...'));
    
    const admin = await mongoose.connection.collection('users').insertOne({
      name: "Admin",
      email: "admin@reelcast.com",
      password: hashedPassword,
      phone: "+91 9876543211",
      role: "admin",
      isSuperAdmin: false,
      isActive: true,
      isVerified: true,
      profilePicture: null,
      loginAttempts: 0,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(chalk.green('✅ Admin created successfully!\n'));

    // Display credentials
    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║       🔑 ADMIN CREDENTIALS 🔑        ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));
    
    console.log(chalk.bold.green('📧 Email:'));
    console.log(chalk.white('   admin@reelcast.com\n'));
    
    console.log(chalk.bold.green('🔑 Password:'));
    console.log(chalk.white(`   ${adminPassword}\n`));
    
    console.log(chalk.bold.green('👤 Role:'));
    console.log(chalk.white('   ADMIN (Limited Platform Access)\n'));
    
    console.log(chalk.bold.green('Permissions:'));
    console.log(chalk.white('   ✅ Approve/Reject bookings'));
    console.log(chalk.white('   ✅ Verify users'));
    console.log(chalk.white('   ✅ View platform stats'));
    console.log(chalk.white('   ❌ Cannot change system settings\n'));
    
    console.log(chalk.bold.green('ID:'));
    console.log(chalk.white(`   ${admin.insertedId}\n`));

    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║      ℹ️  ADMIN vs SUPER ADMIN        ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));
    
    console.log(chalk.blue('SUPER ADMIN (Full Access):'));
    console.log(chalk.white('  • All admin privileges'));
    console.log(chalk.white('  • System configuration'));
    console.log(chalk.white('  • User management (all)'));
    console.log(chalk.white('  • Platform settings\n'));
    
    console.log(chalk.blue('ADMIN (Limited Access):'));
    console.log(chalk.white('  • Approve/reject bookings'));
    console.log(chalk.white('  • Verify talent & pages'));
    console.log(chalk.white('  • View platform stats'));
    console.log(chalk.white('  • Cannot change settings\n'));

    console.log(chalk.yellow('\n✨ Admin setup complete!\n'));

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(chalk.red.bold('\n❌ ERROR:\n'), chalk.red(error.message));
    console.log(chalk.red('\nTroubleshooting:'));
    console.log(chalk.red('• Make sure MongoDB is running'));
    console.log(chalk.red('• Check MONGO_URI in .env file'));
    console.log(chalk.red('• Create Super Admin first: node create-super-admin.js\n'));
    
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
