#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const EXPECTED_WEBHOOK_URL = 'https://ytv-4c5pm8887-youngtraderviraj-ctrls-projects.vercel.app/api/webhook';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found');
  process.exit(1);
}

async function monitorAndFixWebhook() {
  try {
    console.log('🔍 Monitoring webhook status...\n');
    
    // Check current webhook
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    
    const info = response.data.result;
    const currentUrl = info.url || '';
    
    console.log('📊 Current Status:');
    console.log(`   URL: ${currentUrl || '❌ NOT SET'}`);
    console.log(`   Pending: ${info.pending_update_count}`);
    console.log(`   Errors: ${info.last_error_message || 'None'}\n`);
    
    // Check if webhook needs to be set/fixed
    if (!currentUrl) {
      console.log('⚠️  Webhook is not set! Fixing...\n');
      await setWebhook();
    } else if (currentUrl !== EXPECTED_WEBHOOK_URL) {
      console.log(`⚠️  Webhook URL mismatch!`);
      console.log(`   Expected: ${EXPECTED_WEBHOOK_URL}`);
      console.log(`   Current:  ${currentUrl}`);
      console.log('   Fixing...\n');
      await setWebhook();
    } else if (info.last_error_message) {
      console.log('⚠️  Webhook has errors! Reconfiguring...\n');
      await setWebhook();
    } else if (info.pending_update_count > 10) {
      console.log('⚠️  Too many pending updates! Reconfiguring...\n');
      await setWebhook();
    } else {
      console.log('✅ Webhook is properly configured!');
      console.log('   No action needed.\n');
    }
    
  } catch (error) {
    console.error('❌ Error monitoring webhook:', error.message);
    process.exit(1);
  }
}

async function setWebhook() {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: EXPECTED_WEBHOOK_URL,
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query']
      }
    );

    if (response.data.ok) {
      console.log('✅ Webhook configured successfully!');
      console.log(`   URL: ${EXPECTED_WEBHOOK_URL}\n`);
    } else {
      console.error('❌ Failed to set webhook:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
    process.exit(1);
  }
}

monitorAndFixWebhook();
