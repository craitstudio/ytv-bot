import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
let userStates = {};
let welcomeMessages = {}; // Track welcome message IDs to prevent deletion
let firstTimeUsers = {}; // Track first-time users
let userMessages = {}; // Track all messages for each user (except welcome)

console.log('🚀 Starting multi-broker bot...');

// Set persistent menu for all users
bot.telegram.setMyCommands([
  { command: 'start', description: 'Start account verification' }
]);

// Function to show welcome message with bot capabilities
async function showWelcomeMessage(ctx) {
  const welcomeMsg = `🎯 **Welcome to Multi-Broker Affiliation Checker!**

• ✅ Verify your account with supported brokers
• 🔍 Check if you're under our referral program
• 🎉 Provide group access for verified accounts
• 🔗 Share account opening links for new users

**Supported Brokers:**
🔥 Exness (Active)
📈 XM (Coming Soon)
⚡ Delta Exchange (Coming Soon)

👇 **Click the button below to begin verification**`;
  
  const keyboard = Markup.keyboard([
    ['🚀 Start Verification']
  ]).resize().persistent();
  
  return ctx.reply(welcomeMsg, { 
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Cleanup function to remove old messages except welcome
async function cleanupChatMessages(ctx, chatId) {
  // Delete all tracked messages except the welcome message
  if (userMessages[chatId]) {
    for (const messageId of userMessages[chatId]) {
      try {
        await ctx.telegram.deleteMessage(chatId, messageId);
      } catch (error) {
        // Ignore if message can't be deleted (already deleted, too old, etc.)
      }
    }
    // Clear the message tracking array
    userMessages[chatId] = [];
  }
  
  // Clear user state but keep welcome message ID
  delete userStates[chatId];
  // Note: We keep welcomeMessages[chatId] to track the permanent welcome message
}

// Start command with broker selection
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  
  // Clear any existing user state and messages
  await cleanupChatMessages(ctx, chatId);
  
  // Mark user as no longer first-time
  delete firstTimeUsers[chatId];
  
  // Initialize message tracking for this user
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  
  // Send permanent welcome message only if not already sent
  if (!welcomeMessages[chatId]) {
    const welcomeMsg = await ctx.reply(
      '🎯 **Welcome to Multi-Broker Affiliation Checker!**',
      { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } }
    );
    welcomeMessages[chatId] = welcomeMsg.message_id;
  }
  
  await showBrokerSelection(ctx, false, true);
});

// Function to show broker selection menu
async function showBrokerSelection(ctx, isReturning = false, isFirstTime = false) {
  const chatId = ctx.chat.id;
  let message;
  
  if (isReturning) {
    message = `🔄 **Select your broker:**`;
  } else if (isFirstTime) {
    message = `Please select your broker to check your account status:`;
  } else {
    message = `Please select your broker to check your account status:`;
  }

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Exness', 'broker_exness')],
    [Markup.button.callback('📈 XM', 'broker_xm')],
    [Markup.button.callback('⚡ Delta Exchange', 'broker_delta')]
  ]);

  // Send new message and track it
  const sentMessage = await ctx.reply(message, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
}

// Handle broker selection
bot.action('broker_exness', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear previous state and start fresh
  delete userStates[chatId];
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Brokers', 'back_to_brokers')]
  ]);
  
  const sentMessage = await ctx.reply('🔥 **Exness Selected**\n\nPlease enter your **Email Address**:', { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
  
  userStates[chatId] = { 
    step: 'exness_email',
    broker: 'exness'
  };
});

bot.action('broker_xm', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear previous state
  delete userStates[chatId];
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Brokers', 'back_to_brokers')]
  ]);
  
  const sentMessage = await ctx.reply('📈 **XM Selected**\n\nThis broker integration is coming soon! 🚧', { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('broker_delta', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear previous state
  delete userStates[chatId];
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Brokers', 'back_to_brokers')]
  ]);
  
  const sentMessage = await ctx.reply('⚡ **Delta Exchange Selected**\n\nThis broker integration is coming soon! 🚧', { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

// Handle back to brokers
bot.action('back_to_brokers', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear user state and delete all messages except welcome
  await cleanupChatMessages(ctx, chatId);
  
  // Use the showBrokerSelection function which handles editing properly
  await showBrokerSelection(ctx, true);
});

// Handle back to email step
bot.action('back_to_email', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Reset to email step
  const user = userStates[chatId];
  if (user && user.broker === 'exness') {
    user.step = 'exness_email';
    delete user.email;
    delete user.accountId;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Back to Brokers', 'back_to_brokers')]
    ]);
    
    // Edit the current message instead of creating new one
    try {
      await ctx.editMessageText('🔥 **Exness Selected**\n\nPlease enter your **Email Address**:', {
        parse_mode: 'Markdown',
        ...keyboard
      });
    } catch (error) {
      // If edit fails, fall back to delete and send new message
      try {
        await ctx.deleteMessage();
        const sentMessage = await ctx.reply('🔥 **Exness Selected**\n\nPlease enter your **Email Address**:', { 
          parse_mode: 'Markdown',
          ...keyboard
        });
        
        // Track this message for potential deletion
        if (!userMessages[chatId]) {
          userMessages[chatId] = [];
        }
        userMessages[chatId].push(sentMessage.message_id);
      } catch (deleteError) {
        // If both fail, just send new message
        const sentMessage = await ctx.reply('🔥 **Exness Selected**\n\nPlease enter your **Email Address**:', { 
          parse_mode: 'Markdown',
          ...keyboard
        });
        
        // Track this message for potential deletion
        if (!userMessages[chatId]) {
          userMessages[chatId] = [];
        }
        userMessages[chatId].push(sentMessage.message_id);
      }
    }
  }
});

// Handle text messages based on user state
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const user = userStates[chatId];
  const messageText = ctx.message.text.trim();
  
  // Handle Start Verification button press
  if (messageText === '🚀 Start Verification') {
    // Clear any existing user state and messages
    await cleanupChatMessages(ctx, chatId);
    
    // Mark user as no longer first-time
    delete firstTimeUsers[chatId];
    
    // Initialize message tracking for this user
    if (!userMessages[chatId]) {
      userMessages[chatId] = [];
    }
    
    // Send permanent welcome message only if not already sent
    if (!welcomeMessages[chatId]) {
      const welcomeMsg = await ctx.reply(
        '🎯 **Welcome to Multi-Broker Affiliation Checker!**',
        { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } }
      );
      welcomeMessages[chatId] = welcomeMsg.message_id;
    }
    
    await showBrokerSelection(ctx, false, true);
    return;
  }
  
  // If no user state exists, show welcome message and broker selection
  if (!user) {
    // Check if this is a first-time user
    if (!firstTimeUsers[chatId]) {
      firstTimeUsers[chatId] = true;
      await showWelcomeMessage(ctx);
      return;
    }
    return;
  }
  
  // Store message ID for potential cleanup (but don't delete user input messages)
  const userMessageId = ctx.message.message_id;

  // Exness flow
  if (user.broker === 'exness') {
    if (user.step === 'exness_email') {
      const email = ctx.message.text.trim();
      
      // Basic email validation
      if (!isValidEmail(email)) {
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Back to Brokers', 'back_to_brokers')]
        ]);
        const errorMsg = await ctx.reply('❌ Please enter a valid email address.', { ...keyboard });
        
        // Track error message for potential deletion
        if (!userMessages[chatId]) {
          userMessages[chatId] = [];
        }
        userMessages[chatId].push(errorMsg.message_id);
        return;
      }
      
      user.email = email;
      user.step = 'exness_account';
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back to Email', 'back_to_email')],
        [Markup.button.callback('🏠 Back to Brokers', 'back_to_brokers')]
      ]);
      
      // DON'T delete user's email message - preserve it
      // The user wants to see their email remain visible
      
      const accountMsg = await ctx.reply('🆔 **Please enter your Account ID** (optional - type "skip" if you don\'t have one):', { 
        parse_mode: 'Markdown',
        ...keyboard
      });
      
      // Track this message for potential deletion
      if (!userMessages[chatId]) {
        userMessages[chatId] = [];
      }
      userMessages[chatId].push(accountMsg.message_id);
      return;
    }

    if (user.step === 'exness_account') {
      user.accountId = ctx.message.text.trim();
      
      // DON'T delete user's account ID message - preserve it
      // The user wants to see their input remain visible
      
      // Process Exness verification
      processExnessVerification(ctx, user);
      delete userStates[chatId];
    }
  }
});

// Process Exness verification
async function processExnessVerification(ctx, user) {
  try {
    await ctx.reply('⏳ **Checking your Exness account status...**', { parse_mode: 'Markdown' });
    
    const response = await axios.post(
      'https://my.exnessaffiliates.com/api/partner/affiliation/',
      { email: user.email },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.EXNESS_JWT,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    const data = response.data;

    if (data.affiliation === true) {
      const accounts = data.accounts || [];
      const clientUid = data.client_uid || 'N/A';
      
      let successMsg = `✅ **Verified with Exness!**\n\nYour account is under our referral program!\n\n`;
      successMsg += `👤 **Client UID:** ${clientUid}\n`;
      
      if (accounts.length > 0) {
        successMsg += `📊 **Linked Accounts:** ${accounts.join(', ')}\n\n`;
      }
      
      await ctx.reply(successMsg, { parse_mode: 'Markdown' });
      
      // Send group invite with navigation and persistent start button
      const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Check Another Account', 'back_to_brokers')]
      ]);
      
      const persistentKeyboard = Markup.keyboard([
        ['🚀 Start Verification']
      ]).resize().persistent();
      
      if (process.env.GROUP_INVITE_LINK && process.env.GROUP_INVITE_LINK !== 'https://t.me/your_group_invite_link') {
        await ctx.reply(`🎉 **Welcome to our exclusive group!**\n\n${process.env.GROUP_INVITE_LINK}`, { 
          ...inlineKeyboard,
          reply_markup: persistentKeyboard
        });
      } else {
        await ctx.reply('🎉 **You\'re verified!** Contact admin for group access.', { 
          ...inlineKeyboard,
          reply_markup: persistentKeyboard
        });
      }
    } else {
      await ctx.reply('❌ **Account Not Found**\n\nThis account is not under our Exness referral program.', { parse_mode: 'Markdown' });
      
      // Send account opening link with navigation and persistent start button
      const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Check Another Account', 'back_to_brokers')]
      ]);
      
      const persistentKeyboard = Markup.keyboard([
        ['🚀 Start Verification']
      ]).resize().persistent();
      
      if (process.env.ACCOUNT_OPEN_LINK && process.env.ACCOUNT_OPEN_LINK !== 'https://your_referral_account_opening_link') {
        await ctx.reply(`👉 **Open your Exness account with us:**\n\n${process.env.ACCOUNT_OPEN_LINK}`, { 
          ...inlineKeyboard,
          reply_markup: persistentKeyboard
        });
      } else {
        await ctx.reply('👉 **Contact admin for account opening link.**', { 
          ...inlineKeyboard,
          reply_markup: persistentKeyboard
        });
      }
    }
  } catch (error) {
    console.error('Exness API error:', error.response?.data || error.message);
    
    let errorMessage = '⚠️ **Error checking your account**\n\n';
    
    if (error.response?.status === 401) {
      errorMessage += 'Authentication failed. Please contact administrator.';
    } else if (error.response?.status === 429) {
      errorMessage += 'Too many requests. Please try again later.';
    } else if (error.response?.status === 400) {
      errorMessage += 'Invalid email format.';
    } else {
      errorMessage += 'Unable to check account status. Please try again later.';
    }
    
    const inlineKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Try Again', 'back_to_brokers')]
    ]);
    
    const persistentKeyboard = Markup.keyboard([
      ['🚀 Start Verification']
    ]).resize().persistent();
    
    await ctx.reply(errorMessage, { 
      parse_mode: 'Markdown',
      ...inlineKeyboard,
      reply_markup: persistentKeyboard
    });
  }
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Add error handling for the bot
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Launch with retry logic
async function startBot() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`🔄 Attempting to start bot... (${4 - retries}/3)`);
      
      await bot.launch({
        polling: {
          timeout: 30,
          limit: 100,
          allowedUpdates: ['message', 'callback_query']
        }
      });
      
      console.log('✅ Test bot started successfully!');
      console.log('🤖 Bot username:', bot.botInfo?.username);
      console.log('💬 Go to Telegram and send /start to test');
      console.log('🛑 Press Ctrl+C to stop');
      break;
      
    } catch (err) {
      console.error(`❌ Attempt ${4 - retries} failed:`, err.message);
      retries--;
      
      if (retries > 0) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('❌ All retry attempts failed. Please check:');
        console.error('1. Your internet connection');
        console.error('2. BOT_TOKEN in .env file');
        console.error('3. Firewall/proxy settings');
        process.exit(1);
      }
    }
  }
}

startBot();

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Stopping bot...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => bot.stop('SIGTERM'));
