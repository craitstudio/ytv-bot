#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = 'https://ytv-ffzxgc0c5-youngtraderviraj-ctrls-projects.vercel.app/api/webhook';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env file');
  process.exit(1);
}

async function setupWebhook() {
  console.log('🚀 Setting up webhook for your bot...\n');
  console.log('━'.repeat(60));
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
  console.log('━'.repeat(60));
  
  try {
    // Set webhook
    console.log('\n🔧 Configuring webhook...');
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query']
      }
    );

    if (response.data.ok) {
      console.log('✅ Webhook set successfully!\n');
      
      // Verify webhook
      console.log('🔍 Verifying webhook configuration...');
      const infoResponse = await axios.get(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
      );
      
      const info = infoResponse.data.result;
      
      console.log('\n📊 Webhook Status:');
      console.log('━'.repeat(60));
      console.log(`✅ URL: ${info.url}`);
      console.log(`📬 Pending Updates: ${info.pending_update_count}`);
      console.log(`🔗 Max Connections: ${info.max_connections || 40}`);
      console.log(`⚠️  Last Error: ${info.last_error_message || 'None'}`);
      console.log('━'.repeat(60));
      
      console.log('\n🎉 Webhook Configuration Complete!\n');
      console.log('📝 Next Steps:\n');
      console.log('1. ✅ Webhook is now configured');
      console.log('2. 🔍 Verify Vercel environment variables:');
      console.log('   • BOT_TOKEN');
      console.log('   • EXNESS_JWT');
      console.log('   • NODE_ENV=production');
      console.log('   • VERCEL=1');
      console.log('3. 💬 Test your bot in Telegram with /start');
      console.log('\n💡 Check deployment logs at:');
      console.log('   https://vercel.com/youngtraderviraj-ctrls-projects/ytv/logs\n');
      
      if (info.last_error_message) {
        console.log('⚠️  WARNING: Previous webhook had errors:');
        console.log(`   ${info.last_error_message}`);
        console.log('   This might indicate deployment or environment issues.\n');
      }
      
    } else {
      console.error('\n❌ Failed to set webhook:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error setting webhook:');
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

setupWebhook();
