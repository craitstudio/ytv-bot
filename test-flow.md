# Bot Flow Test Guide

## Expected Behavior

### 1. First Time User Experience
- User sends `/start`
- Bot sends **permanent** welcome message: "🎯 **Welcome to Multi-Broker Affiliation Checker!**"
- Bot sends broker selection menu: "Please select your broker to check your account status:"

### 2. Navigation Flow
- User clicks "🔥 Exness" → Bot shows email input
- User clicks "🔙 Back to Brokers" → Bot:
  - Deletes the email input message
  - Shows broker selection menu with "🔄 **Select your broker:**"
  - **KEEPS** the original welcome message intact

### 3. Subsequent /start Commands
- If user sends `/start` again, bot:
  - Does NOT send welcome message again (already exists)
  - Only shows broker selection menu

### 4. Message Cleanup
- User input messages (email, account ID) are deleted after submission
- Intermediate bot messages are deleted when navigating back
- Welcome message is NEVER deleted

## Test Steps

1. Start the bot: `node test-bot.js`
2. In Telegram, send `/start`
3. Click "🔥 Exness"
4. Click "🔙 Back to Brokers"
5. Verify welcome message is still there
6. Send `/start` again
7. Verify no duplicate welcome message

## Key Changes Made

- Added `welcomeMessages` object to track permanent welcome message IDs
- Modified `showBrokerSelection()` to handle different message contexts
- Updated all back navigation to preserve welcome message
- Added message cleanup for user inputs
- Separated welcome message from broker selection logic
