#!/usr/bin/env node

/**
 * 🔥 SUPER ADMIN CREATION SCRIPT
 * 
 * Only for database initialization
 * Creates Super Admin with full platform access
 * 
 * Usage: node create-super-admin.js
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function createSuperAdmin() {
  try {
    console.log(chalk.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║   🔥 SUPER ADMIN CREATION SCRIPT 🔥   ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    // Connect to MongoDB
    console.log(chalk.yellow('📡 Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green('✅ MongoDB connected successfully!\n'));

    const mongoUri = process.env.MONGO_URI;
    const dbName = mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'MongoDB (Local)';
    console.log(chalk.blue(`Database: ${dbName}`));
    console.log(chalk.blue(`Connection: ${mongoUri.substring(0, 50)}...\n`));

    // Hash password
    console.log(chalk.yellow('🔐 Hashing password...'));
    const superAdminPassword = 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    console.log(chalk.green('✅ Password hashed successfully!\n'));

    // Create Super Admin
    console.log(chalk.yellow('👤 Creating Super Admin user...'));
    
    const superAdmin = await mongoose.connection.collection('users').insertOne({
      name: "Super Admin",
      email: "superadmin@reelcast.com",
      password: hashedPassword,
      phone: "+91 9876543210",
      role: "super-admin",
      isSuperAdmin: true,
      isActive: true,
      isVerified: true,
      profilePicture: null,
      loginAttempts: 0,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(chalk.green('✅ Super Admin created successfully!\n'));

    // Display credentials
    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║      🔑 SUPER ADMIN CREDENTIALS 🔑    ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));
    
    console.log(chalk.bold.green('📧 Email:'));
    console.log(chalk.white('   superadmin@reelcast.com\n'));
    
    console.log(chalk.bold.green('🔑 Password:'));
    console.log(chalk.white(`   ${superAdminPassword}\n`));
    
    console.log(chalk.bold.green('👤 Role:'));
    console.log(chalk.white('   SUPER ADMIN (Full Platform Access)\n'));
    
    console.log(chalk.bold.green('ID:'));
    console.log(chalk.white(`   ${superAdmin.insertedId}\n`));

    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║      📝 NEXT STEPS                     ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    console.log(chalk.yellow('1. Save these credentials securely'));
    console.log(chalk.yellow('2. Change password in production'));
    console.log(chalk.yellow('3. Create Admin user: node create-admin.js'));
    console.log(chalk.yellow('4. Create regular users: node create-user.js'));
    console.log(chalk.yellow('5. Start backend: npm run dev'));
    console.log(chalk.yellow('6. Start frontend: cd client && npm run dev'));
    console.log(chalk.yellow('7. Login at http://localhost:5173/login\n'));

    console.log(chalk.green.bold('✨ Super Admin setup complete!\n'));

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(chalk.red.bold('\n❌ ERROR:\n'), chalk.red(error.message));
    console.log(chalk.red('\nTroubleshooting:'));
    console.log(chalk.red('• Make sure MongoDB is running'));
    console.log(chalk.red('• Check MONGO_URI in .env file'));
    console.log(chalk.red('• Verify node_modules are installed\n'));
    
    await mongoose.connection.close();
    process.exit(1);
  }
}

createSuperAdmin();
