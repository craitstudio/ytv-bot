#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file (not .env.example)
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
// Get the webhook URL from environment variable or use a default pattern
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-vercel-app.vercel.app/api/webhook';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required in environment variables or .env file');
  process.exit(1);
}

if (WEBHOOK_URL.includes('your-vercel-app')) {
  console.error('❌ Please set WEBHOOK_URL environment variable with your actual Vercel app URL');
  console.log('Example: WEBHOOK_URL=https://your-actual-app.vercel.app/api/webhook');
  process.exit(1);
}

async function setupWebhook() {
  try {
    console.log('🔧 Setting up webhook for production deployment...');
    console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
    
    // Set webhook
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        drop_pending_updates: true
      }
    );

    if (response.data.ok) {
      console.log('✅ Webhook set successfully!');
      
      // Get webhook info to confirm
      const infoResponse = await axios.get(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
      );
      
      console.log('📊 Webhook Info:');
      console.log(`URL: ${infoResponse.data.result.url}`);
      console.log(`Pending Updates: ${infoResponse.data.result.pending_update_count}`);
      console.log(`Last Error: ${infoResponse.data.result.last_error_message || 'None'}`);
      
      console.log('\n🎉 Your bot is now live and ready to use!');
      console.log('💬 Go to Telegram and send /start to your bot to test it');
    } else {
      console.error('❌ Failed to set webhook:', response.data);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.response?.data || error.message);
  }
}

setupWebhook();
