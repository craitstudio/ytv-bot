import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables:');
console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('EXNESS_JWT:', process.env.EXNESS_JWT ? 'Set ✅' : 'Missing ❌');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GROUP_INVITE_LINK:', process.env.GROUP_INVITE_LINK);
console.log('ACCOUNT_OPEN_LINK:', process.env.ACCOUNT_OPEN_LINK);

if (!process.env.BOT_TOKEN) {
  console.log('\n❌ BOT_TOKEN is missing. Please check your .env file.');
  process.exit(1);
}

console.log('\n✅ Environment looks good!');
