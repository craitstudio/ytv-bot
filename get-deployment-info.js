#!/usr/bin/env node

console.log('🔍 Deployment Troubleshooting Guide\n');
console.log('━'.repeat(60));
console.log('\n⚠️  Your deployment URL returned a 401 Unauthorized error.');
console.log('This usually means one of the following:\n');

console.log('1️⃣  **Using Preview/Development URL instead of Production**');
console.log('   Solution: Get your production domain from Vercel\n');

console.log('2️⃣  **Vercel Protection is Enabled**');
console.log('   Solution: Disable protection for the webhook endpoint\n');

console.log('3️⃣  **Project is Private/Has Authentication**');
console.log('   Solution: Make the project public or remove auth\n');

console.log('━'.repeat(60));
console.log('\n📝 **ACTION REQUIRED:**\n');

console.log('Please follow these steps:\n');

console.log('**Step 1: Get Your Production URL**');
console.log('────────────────────────────────────');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Click on your "ytv-bot" project');
console.log('3. Look for "Domains" section');
console.log('4. Find your production domain (usually ends with .vercel.app)');
console.log('   Example: ytv-bot.vercel.app OR ytv-bot-git-main-username.vercel.app\n');

console.log('**Step 2: Check Vercel Protection**');
console.log('────────────────────────────────────');
console.log('1. In your Vercel project dashboard');
console.log('2. Go to: Settings → Deployment Protection');
console.log('3. If "Standard Protection" or "Vercel Authentication" is ON:');
console.log('   - Turn it OFF (or)');
console.log('   - Add /api/webhook to bypass rules\n');

console.log('**Step 3: Verify Deployment Status**');
console.log('────────────────────────────────────');
console.log('1. Check if deployment is "Ready"');
console.log('2. Look at deployment logs for errors');
console.log('3. Make sure "api/webhook.js" file exists in deployment\n');

console.log('**Step 4: Check Project Settings**');
console.log('────────────────────────────────────');
console.log('1. Settings → General');
console.log('2. Make sure "Root Directory" is not set (or is set to ".")');
console.log('3. Framework Preset: "Other" or leave empty\n');

console.log('━'.repeat(60));
console.log('\n🔧 **Quick Tests:**\n');

console.log('Test 1: Check if your domain is accessible');
console.log('```bash');
console.log('curl https://YOUR-PRODUCTION-URL.vercel.app');
console.log('```\n');

console.log('Test 2: Check the webhook endpoint');
console.log('```bash');
console.log('curl https://YOUR-PRODUCTION-URL.vercel.app/api/webhook');
console.log('```');
console.log('Should return: {"message":"Exness Affiliation Bot is running!",...}\n');

console.log('━'.repeat(60));
console.log('\n💡 **Common Production URLs:**\n');
console.log('• ytv-bot.vercel.app');
console.log('• ytv-bot-youngtraderviraj-ctrls-projects.vercel.app');
console.log('• ytv-git-main-youngtraderviraj-ctrls-projects.vercel.app\n');

console.log('━'.repeat(60));
console.log('\n📞 **Once you have the correct production URL:**\n');
console.log('Run this command with your actual URL:');
console.log('```bash');
console.log('node setup-webhook-now.js');
console.log('```');
console.log('(Update the URL in the file first)\n');

console.log('━'.repeat(60));
