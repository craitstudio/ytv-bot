#!/usr/bin/env node

console.log('🔍 Finding Your Production URL\n');
console.log('━'.repeat(60));

console.log('\n📌 **Your Vercel Project:** ytv-bot\n');

console.log('🎯 **Most Likely Production URLs:**\n');

const possibleUrls = [
  'ytv-bot.vercel.app',
  'ytv-bot-youngtraderviraj-ctrls-projects.vercel.app',
  'ytv-bot-git-main-youngtraderviraj-ctrls-projects.vercel.app'
];

console.log('Testing these URLs...\n');

import axios from 'axios';

async function testUrl(url) {
  try {
    const fullUrl = `https://${url}/api/webhook`;
    console.log(`Testing: ${url}`);
    
    const response = await axios.get(fullUrl, {
      timeout: 5000,
      validateStatus: () => true // Accept any status
    });
    
    if (response.status === 200) {
      console.log(`  ✅ FOUND! Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
      return { url, status: response.status, working: true };
    } else if (response.status === 401) {
      console.log(`  ⚠️  Protected (401) - This might be a preview URL\n`);
      return { url, status: response.status, working: false };
    } else if (response.status === 404) {
      console.log(`  ❌ Not Found (404)\n`);
      return { url, status: response.status, working: false };
    } else {
      console.log(`  ⚠️  Status: ${response.status}\n`);
      return { url, status: response.status, working: false };
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.log(`  ❌ Domain doesn't exist\n`);
    } else {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
    return { url, error: error.message, working: false };
  }
}

async function findProductionUrl() {
  console.log('━'.repeat(60));
  console.log('\n');
  
  const results = [];
  for (const url of possibleUrls) {
    const result = await testUrl(url);
    results.push(result);
  }
  
  console.log('━'.repeat(60));
  console.log('\n📊 **RESULTS:**\n');
  
  const workingUrl = results.find(r => r.working);
  
  if (workingUrl) {
    console.log(`✅ **PRODUCTION URL FOUND:**`);
    console.log(`   https://${workingUrl.url}\n`);
    console.log(`📝 **Next Steps:**\n`);
    console.log(`1. Update setup-webhook-now.js with this URL`);
    console.log(`2. Run: node setup-webhook-now.js`);
    console.log(`3. Test your bot with /start in Telegram\n`);
  } else {
    console.log(`❌ **No working production URL found**\n`);
    console.log(`This means either:\n`);
    console.log(`1. Your project isn't deployed yet`);
    console.log(`2. The deployment failed`);
    console.log(`3. The URL pattern is different\n`);
    console.log(`📝 **To fix:**\n`);
    console.log(`1. Go to: https://vercel.com/dashboard`);
    console.log(`2. Click on "ytv-bot" project`);
    console.log(`3. Check "Deployments" tab for status`);
    console.log(`4. Look in "Domains" section for your production URL\n`);
    console.log(`Or deploy now by running:`);
    console.log(`   vercel --prod\n`);
  }
  
  console.log('━'.repeat(60));
}

findProductionUrl();
