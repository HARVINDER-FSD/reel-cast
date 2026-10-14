#!/usr/bin/env node

/**
 * Generate Strong JWT Secrets
 * Run this to generate secure random secrets for production
 */

import crypto from 'crypto';

console.log('\n🔐 Generating Strong JWT Secrets for Production\n');
console.log('─'.repeat(70));

const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ Copy these to your .env file:\n');
console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);

console.log('\n' + '─'.repeat(70));
console.log('\n⚠️  IMPORTANT:');
console.log('  • Keep these secrets PRIVATE');
console.log('  • Never commit them to git');
console.log('  • Use different secrets for production and development');
console.log('  • These secrets are 128 characters each (very secure)');
console.log('\n');
