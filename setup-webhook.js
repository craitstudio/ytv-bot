import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Your Vercel deployment URL + /api/webhook

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required in .env file');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ WEBHOOK_URL is required in .env file');
  console.log('Example: WEBHOOK_URL=https://your-app.vercel.app/api/webhook');
  process.exit(1);
}

async function setupWebhook() {
  try {
    console.log('🔧 Setting up webhook...');
    
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
      console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
      
      // Get webhook info
      const infoResponse = await axios.get(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
      );
      
      console.log('📊 Webhook Info:');
      console.log(JSON.stringify(infoResponse.data.result, null, 2));
    } else {
      console.error('❌ Failed to set webhook:', response.data);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.response?.data || error.message);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Deleting webhook...');
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );

    if (response.data.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', response.data);
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.response?.data || error.message);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'delete') {
  deleteWebhook();
} else {
  setupWebhook();
}
