#!/usr/bin/env node

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables from .env.example
dotenv.config({ path: '.env.example' });

const envVars = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  EXNESS_JWT: process.env.EXNESS_JWT,
  GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || 'https://t.me/your_group_invite_link',
  ACCOUNT_OPEN_LINK: process.env.ACCOUNT_OPEN_LINK || 'https://your_referral_account_opening_link',
  NODE_ENV: 'production'
};

console.log('Setting up environment variables for Vercel...\n');

for (const [key, value] of Object.entries(envVars)) {
  if (value && value !== 'your_telegram_bot_token_here') {
    try {
      console.log(`Setting ${key}...`);
      execSync(`vercel env add ${key} production`, {
        input: value,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`✅ ${key} set successfully\n`);
    } catch (error) {
      console.log(`⚠️  ${key} might already exist or there was an error\n`);
    }
  }
}

console.log('Environment variables setup complete!');
console.log('Now run: node setup-webhook.js');
