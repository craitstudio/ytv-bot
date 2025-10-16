#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env file');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupWebhook() {
  console.log('🚀 Webhook Setup Wizard\n');
  console.log('━'.repeat(60));
  
  // Check current webhook status
  try {
    const currentInfo = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    
    if (currentInfo.data.result.url) {
      console.log(`📍 Current webhook: ${currentInfo.data.result.url}`);
      console.log('');
    }
  } catch (e) {
    // Ignore
  }
  
  console.log('Please enter your Vercel deployment URL:');
  console.log('Example: https://ytv-bot-abc123.vercel.app');
  console.log('');
  
  const deploymentUrl = await question('Vercel URL: ');
  
  if (!deploymentUrl || !deploymentUrl.startsWith('http')) {
    console.error('\n❌ Invalid URL. Please provide a valid HTTPS URL');
    rl.close();
    process.exit(1);
  }
  
  // Clean up URL (remove trailing slash if any)
  const cleanUrl = deploymentUrl.replace(/\/$/, '');
  const webhookUrl = `${cleanUrl}/api/webhook`;
  
  console.log('\n🔧 Setting webhook...');
  console.log(`📍 Webhook URL: ${webhookUrl}`);
  
  try {
    // Set webhook
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: webhookUrl,
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query']
      }
    );

    if (response.data.ok) {
      console.log('\n✅ Webhook configured successfully!');
      
      // Verify webhook
      const infoResponse = await axios.get(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
      );
      
      const info = infoResponse.data.result;
      
      console.log('\n📊 Webhook Status:');
      console.log('━'.repeat(60));
      console.log(`URL: ${info.url}`);
      console.log(`Pending Updates: ${info.pending_update_count}`);
      console.log(`Last Error: ${info.last_error_message || 'None'}`);
      console.log('━'.repeat(60));
      
      console.log('\n🎉 Setup Complete!');
      console.log('\n📝 Next Steps:');
      console.log('1. Make sure your bot is deployed to Vercel');
      console.log('2. Ensure environment variables are set on Vercel:');
      console.log('   - BOT_TOKEN');
      console.log('   - EXNESS_JWT');
      console.log('   - GROUP_INVITE_LINK (optional)');
      console.log('   - ACCOUNT_OPEN_LINK (optional)');
      console.log('3. Test your bot by sending /start in Telegram');
      console.log('\n💡 To check logs, visit: https://vercel.com/dashboard');
      
    } else {
      console.error('\n❌ Failed to set webhook:', response.data);
    }
  } catch (error) {
    console.error('\n❌ Error setting webhook:');
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
  
  rl.close();
}

setupWebhook();
