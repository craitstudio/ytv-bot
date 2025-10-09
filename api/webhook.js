import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Store user conversation states
let userStates = {};
let welcomeMessages = {}; // Track welcome message IDs to prevent deletion
let firstTimeUsers = {}; // Track first-time users
let userMessages = {}; // Track all messages for each user (except welcome)

// Set persistent menu for all users (only in development mode)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  bot.telegram.setMyCommands([
    { command: 'start', description: 'Start account verification' }
  ]).catch(err => {
    console.log('Failed to set commands (this is normal in serverless):', err.message);
  });
}

// Function to show welcome message with bot capabilities
async function showWelcomeMessage(ctx) {
  const welcomeMsg = `🎯 **Welcome to Multi-Broker Affiliation Checker!**

🤖 **What I can do:**
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

// Handle text messages based on conversation state
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
      
      // Process Exness verification immediately
      await processExnessVerification(ctx, user);
      delete userStates[chatId];
    }
  }
});

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

// Process Exness verification with optimized performance
async function processExnessVerification(ctx, user) {
  const chatId = ctx.chat.id;
  let statusMessage;
  
  try {
    console.log(`Starting verification process for user ${chatId}, email: ${user.email}`);
    
    // Send initial status with immediate feedback
    statusMessage = await ctx.reply('🔍 **Verifying with Exness...**', { parse_mode: 'Markdown' });
    console.log(`Status message sent with ID: ${statusMessage.message_id}`);
    
    // Track this message for potential deletion
    if (!userMessages[chatId]) {
      userMessages[chatId] = [];
    }
    userMessages[chatId].push(statusMessage.message_id);
    
    // Make the API call immediately without complex async updates
    console.log(`About to make Exness API call...`);
    const response = await makeExnessAPICall(user.email, 3); // 3 retries
    console.log(`API call completed successfully`);

    // Delete status message before showing results
    try {
      await ctx.telegram.deleteMessage(chatId, statusMessage.message_id);
      // Remove from tracking since we deleted it
      userMessages[chatId] = userMessages[chatId].filter(id => id !== statusMessage.message_id);
    } catch (e) {
      // Ignore delete errors
    }

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
    
    // Delete status message on error
    try {
      await ctx.telegram.deleteMessage(chatId, statusMessage.message_id);
      userMessages[chatId] = userMessages[chatId].filter(id => id !== statusMessage.message_id);
    } catch (e) {
      // Ignore delete errors
    }
    
    let errorMessage = '⚠️ **Verification Failed**\n\n';
    
    if (error.code === 'TIMEOUT') {
      errorMessage += '⏱️ Request timed out. Exness servers may be slow. Please try again.';
    } else if (error.response?.status === 401) {
      errorMessage += '🔐 Authentication failed. Please contact administrator.';
    } else if (error.response?.status === 429) {
      errorMessage += '🚦 Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status === 400) {
      errorMessage += '📧 Invalid email format. Please check your email address.';
    } else if (error.response?.status >= 500) {
      errorMessage += '🔧 Exness servers are experiencing issues. Please try again later.';
    } else {
      errorMessage += '🔄 Unable to verify account. Please try again or contact support.';
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

// Optimized Exness API call with retry logic
async function makeExnessAPICall(email, maxRetries = 3) {
  console.log(`Starting Exness API call for email: ${email}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Exness API attempt ${attempt}/${maxRetries} starting...`);
      
      const response = await axios.post(
        'https://my.exnessaffiliates.com/api/partner/affiliation/',
        { email: email },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.EXNESS_JWT,
            'Accept': 'application/json'
          },
          timeout: 5000, // Reduced from 10s to 5s
          validateStatus: function (status) {
            return status < 500; // Don't throw error for 4xx responses
          }
        }
      );
      
      console.log(`Exness API attempt ${attempt} succeeded with status: ${response.status}`);
      // If we get here, the request succeeded
      return response;
      
    } catch (error) {
      console.log(`Exness API attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        // Add timeout code for better error handling
        if (error.code === 'ECONNABORTED') {
          error.code = 'TIMEOUT';
        }
        console.log(`All Exness API attempts failed. Final error:`, error.message);
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000); // Max 3s delay
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Add comprehensive error handling for the bot
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  
  // Try to send error message to user if context is available
  if (ctx && ctx.reply) {
    try {
      ctx.reply('⚠️ **Something went wrong**\n\nPlease try again or contact support.', {
        parse_mode: 'Markdown'
      }).catch(replyErr => {
        console.error('Failed to send error message to user:', replyErr);
      });
    } catch (replyError) {
      console.error('Error in error handler:', replyError);
    }
  }
});

// For Vercel serverless deployment
export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Handle Telegram webhook updates
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } else if (req.method === 'GET') {
      // Health check endpoint
      res.status(200).json({ 
        message: 'Exness Affiliation Bot is running!',
        timestamp: new Date().toISOString(),
        status: 'healthy'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    // Don't crash the function, just log and return error
    res.status(200).json({ ok: false, error: 'Update processing failed' });
  }
}

// For local development only - check if we're running locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  console.log('Starting bot in development mode...');
  bot.launch({
    polling: {
      timeout: 10,
      limit: 100,
      allowedUpdates: ['message', 'callback_query']
    }
  }).then(() => {
    console.log('✅ Bot started successfully in polling mode!');
    console.log('🤖 Bot username:', bot.botInfo?.username);
    console.log('💬 Send /start to your bot to test it');
  }).catch(err => {
    console.error('❌ Failed to start bot:', err.message);
  });

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
  console.log('Bot running in webhook mode for production/Vercel');
}
