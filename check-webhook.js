#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env file');
  process.exit(1);
}

async function checkWebhook() {
  try {
    console.log('🔍 Checking webhook status...\n');
    
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    
    const info = response.data.result;
    
    console.log('📊 Current Webhook Status:');
    console.log('━'.repeat(50));
    console.log(`URL: ${info.url || '❌ NOT SET'}`);
    console.log(`Pending Updates: ${info.pending_update_count}`);
    console.log(`Max Connections: ${info.max_connections || 'Default'}`);
    console.log(`Last Error Date: ${info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : 'None'}`);
    console.log(`Last Error Message: ${info.last_error_message || 'None'}`);
    console.log(`Last Synchronization: ${info.last_synchronization_error_date ? new Date(info.last_synchronization_error_date * 1000).toISOString() : 'None'}`);
    console.log('━'.repeat(50));
    
    if (!info.url) {
      console.log('\n⚠️  WEBHOOK NOT CONFIGURED');
      console.log('You need to run: node deploy-webhook.js');
    } else if (info.last_error_message) {
      console.log('\n❌ WEBHOOK HAS ERRORS');
      console.log('This usually means:');
      console.log('1. The webhook URL is not accessible');
      console.log('2. The endpoint is returning errors');
      console.log('3. SSL certificate issues');
    } else if (info.pending_update_count > 0) {
      console.log('\n⚠️  WEBHOOK HAS PENDING UPDATES');
      console.log('The bot might be slow or not processing messages');
    } else {
      console.log('\n✅ WEBHOOK LOOKS GOOD');
      console.log('If bot is still not responding, check:');
      console.log('1. Vercel deployment status');
      console.log('2. Environment variables on Vercel');
      console.log('3. Function logs on Vercel dashboard');
    }
    
  } catch (error) {
    console.error('❌ Error checking webhook:', error.response?.data || error.message);
  }
}

checkWebhook();
