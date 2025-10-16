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
    { command: 'start', description: 'Show main menu' }
  ]).catch(err => {
    console.log('Failed to set commands (this is normal in serverless):', err.message);
  });
}

// Function to show welcome message with main menu
async function showWelcomeMessage(ctx) {
  const welcomeMsg = `🎯 **Welcome to Young Trader Viraj!**

🚀 Your gateway to trading success and exclusive content

👇 **Choose what you're looking for:**`;
  
  return ctx.reply(welcomeMsg, { 
    parse_mode: 'Markdown',
    reply_markup: { remove_keyboard: true }
  });
}

// Function to show main menu options
async function showMainMenu(ctx) {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔥 JOIN VIP CHANNEL', 'menu_vip_channel')],
    [Markup.button.callback('💰 GET FUNDED', 'menu_get_funded')],
    [Markup.button.callback('📚 GET PAID COURSES', 'menu_paid_courses')],
    [Markup.button.callback('🤝 OUR PARTNERS', 'menu_partners')],
    [Markup.button.callback('🌐 WEBSITE', 'menu_website')]
  ]);

  const menuMsg = await ctx.reply('📋 **Main Menu**\n\nSelect an option:', { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  const chatId = ctx.chat.id;
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(menuMsg.message_id);
  
  return menuMsg;
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
    [Markup.button.callback('⚡ Delta Exchange', 'broker_delta')],
    [Markup.button.callback('🏠 Back to Main Menu', 'back_to_main_menu')]
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

// Start command with main menu
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
    const welcomeMsg = await showWelcomeMessage(ctx);
    welcomeMessages[chatId] = welcomeMsg.message_id;
  }
  
  await showMainMenu(ctx);
});

// Handle main menu options
bot.action('menu_vip_channel', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ I UNDERSTAND, CONTINUE', 'vip_continue')],
    [Markup.button.callback('🔙 Back to Main Menu', 'back_to_main_menu')]
  ]);
  
  const vipMsg = `🔥 **JOIN VIP CHANNEL**\n\n⚠️ **Important Notice:**\nTo join our VIP channel, you need to have a trading account under us with one of our partner brokers.\n\n✅ **What you'll get:**\n• Exclusive trading signals\n• Market analysis\n• Direct access to Viraj\n• Premium content\n\n👇 **Ready to verify your account?**`;
  
  const sentMessage = await ctx.reply(vipMsg, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('vip_continue', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear previous messages and show broker selection
  await cleanupChatMessages(ctx, chatId);
  
  // Initialize message tracking for this user
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  
  await showBrokerSelection(ctx, false, true);
});

bot.action('menu_get_funded', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Main Menu', 'back_to_main_menu')]
  ]);
  
  const fundedMsg = `💰 **GET FUNDED**\n\n🚀 **Prop Trading Opportunities**\n\n• Partner with top prop firms\n• Get funded up to $200K\n• Keep 80-90% of profits\n• No personal risk\n\n📞 **Contact us for:**\n• Prop firm recommendations\n• Application assistance\n• Trading strategies\n\n💬 Contact: @YourContactHandle`;
  
  const sentMessage = await ctx.reply(fundedMsg, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('menu_paid_courses', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Main Menu', 'back_to_main_menu')]
  ]);
  
  const coursesMsg = `📚 **GET PAID COURSES**\n\n🎓 **Premium Trading Education**\n\n• Complete trading masterclass\n• Risk management strategies\n• Technical analysis deep dive\n• Live trading sessions\n• 1-on-1 mentorship\n\n💎 **Special Offer:**\nGet 50% off with verified account!\n\n📞 Contact: @YourContactHandle`;
  
  const sentMessage = await ctx.reply(coursesMsg, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('menu_partners', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Exness', 'partner_exness')],
    [Markup.button.callback('📈 XM', 'partner_xm')],
    [Markup.button.callback('⚡ Delta Exchange', 'partner_delta')],
    [Markup.button.callback('🔙 Back to Main Menu', 'back_to_main_menu')]
  ]);
  
  const partnersMsg = `🤝 **OUR PARTNERS**\n\n💼 **Trusted Broker Partners**\n\nChoose a broker to learn more and get exclusive benefits:`;
  
  const sentMessage = await ctx.reply(partnersMsg, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('menu_website', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.url('🌐 Visit Website', 'https://www.youngtraderviraj.com')],
    [Markup.button.callback('🔙 Back to Main Menu', 'back_to_main_menu')]
  ]);
  
  const websiteMsg = `🌐 **VISIT OUR WEBSITE**\n\n🚀 **www.youngtraderviraj.com**\n\n📖 **What you'll find:**\n• Trading blog & insights\n• Market analysis\n• Educational resources\n• Success stories\n• Contact information\n\n👆 **Click the button above to visit**`;
  
  const sentMessage = await ctx.reply(websiteMsg, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

// Handle partner broker info (from partners menu)
bot.action('partner_exness', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Open Exness Account', 'open_exness_account')],
    [Markup.button.callback('✅ Verify Existing Account', 'verify_exness_account')],
    [Markup.button.callback('🔙 Back to Partners', 'menu_partners')]
  ]);
  
  const exnessInfo = `🔥 **EXNESS**\n\n🏆 **Why Choose Exness:**\n• Zero commission trading\n• Unlimited leverage up to 1:2000\n• Instant withdrawals\n• Multi-asset platform\n• Regulated & trusted globally\n\n🎁 **Exclusive Benefits:**\n• VIP support through us\n• Special bonuses\n• Priority processing\n\n👇 **Choose an option:**`;
  
  const sentMessage = await ctx.reply(exnessInfo, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('partner_xm', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Partners', 'menu_partners')]
  ]);
  
  const xmInfo = `📈 **XM**\n\n🚀 **Coming Soon!**\n\nWe're working on bringing you exclusive XM benefits:\n• No deposit bonuses\n• Competitive spreads\n• Advanced trading platforms\n• Educational resources\n\n📞 Stay tuned for updates!`;
  
  const sentMessage = await ctx.reply(xmInfo, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

bot.action('partner_delta', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Partners', 'menu_partners')]
  ]);
  
  const deltaInfo = `⚡ **DELTA EXCHANGE**\n\n🚀 **Coming Soon!**\n\nWe're working on bringing you exclusive Delta Exchange benefits:\n• Crypto derivatives trading\n• Advanced options strategies\n• Low fees\n• High liquidity\n\n📞 Stay tuned for updates!`;
  
  const sentMessage = await ctx.reply(deltaInfo, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

// Handle account opening
bot.action('open_exness_account', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.url('🚀 Open Account Now', process.env.ACCOUNT_OPEN_LINK || 'https://your_referral_account_opening_link')],
    [Markup.button.callback('🔙 Back to Partners', 'menu_partners')]
  ]);
  
  const openAccountMsg = `🚀 **OPEN EXNESS ACCOUNT**\n\n🎉 **Get Started Today:**\n• Click the button below\n• Complete registration\n• Verify your account\n• Start trading with exclusive benefits\n\n📞 **Need help?** Contact us after opening!`;
  
  const sentMessage = await ctx.reply(openAccountMsg, { 
    parse_mode: 'Markdown',
    ...keyboard
  });
  
  // Track this message for potential deletion
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  userMessages[chatId].push(sentMessage.message_id);
});

// Handle account verification
bot.action('verify_exness_account', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear previous messages and show broker selection
  await cleanupChatMessages(ctx, chatId);
  
  // Initialize message tracking for this user
  if (!userMessages[chatId]) {
    userMessages[chatId] = [];
  }
  
  await showBrokerSelection(ctx, false, true);
});

// Handle back to main menu
bot.action('back_to_main_menu', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  
  // Clear user state and delete all messages except welcome
  await cleanupChatMessages(ctx, chatId);
  
  await showMainMenu(ctx);
});

// Handle text messages based on conversation state
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const user = userStates[chatId];
  const messageText = ctx.message.text.trim();
  
  // Handle any button presses that might come from old sessions
  if (messageText === '🚀 Start Verification') {
    // Redirect to main menu
    await cleanupChatMessages(ctx, chatId);
    delete firstTimeUsers[chatId];
    
    if (!userMessages[chatId]) {
      userMessages[chatId] = [];
    }
    
    if (!welcomeMessages[chatId]) {
      const welcomeMsg = await showWelcomeMessage(ctx);
      welcomeMessages[chatId] = welcomeMsg.message_id;
    }
    
    await showMainMenu(ctx);
    return;
  }
  
  // If no user state exists, show welcome message and main menu
  if (!user) {
    // Check if this is a first-time user
    if (!firstTimeUsers[chatId]) {
      firstTimeUsers[chatId] = true;
      const welcomeMsg = await showWelcomeMessage(ctx);
      welcomeMessages[chatId] = welcomeMsg.message_id;
      await showMainMenu(ctx);
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
      user.step = 'exness_client_id';
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Skip Client ID', 'skip_client_id')],
        [Markup.button.callback('🔙 Back to Email', 'back_to_email')],
        [Markup.button.callback('🏠 Back to Brokers', 'back_to_brokers')]
      ]);
      
      // DON'T delete user's email message - preserve it
      // The user wants to see their email remain visible
      
      // Send instruction message
      const instructionMsg = await ctx.reply('🆔 **Please enter your Client ID**\n\n📍 You can find your Client ID in your Exness Personal Area:\n\n💡 **Or type "skip" if you don\'t have it**', { 
        parse_mode: 'Markdown'
      });
      
      // Track this message for potential deletion
      if (!userMessages[chatId]) {
        userMessages[chatId] = [];
      }
      userMessages[chatId].push(instructionMsg.message_id);
      
      // Send image showing where to find Client ID
      try {
        const imageMsg = await ctx.replyWithPhoto(
          'https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Exness+Client+ID+Location', // Placeholder - replace with actual screenshot
          {
            caption: '👆 **Where to find your Client ID:**\n\n1️⃣ Login to your Exness Personal Area\n2️⃣ Go to "My Account" section\n3️⃣ Your Client ID is displayed at the top\n\n💡 It\'s usually a 8-character code like "ab12cd34"\n\n⏭️ **Can\'t find it? Use the Skip button below**',
            parse_mode: 'Markdown',
            ...keyboard
          }
        );
        
        userMessages[chatId].push(imageMsg.message_id);
      } catch (error) {
        // If image fails, send text instructions
        const fallbackMsg = await ctx.reply('📋 **How to find your Client ID:**\n\n1️⃣ Login to your Exness Personal Area\n2️⃣ Go to "My Account" section\n3️⃣ Your Client ID is displayed at the top\n\n💡 It\'s usually a 8-character code like "ab12cd34"\n\n👇 **Please enter your Client ID or type "skip":**', { 
          parse_mode: 'Markdown',
          ...keyboard
        });
        
        userMessages[chatId].push(fallbackMsg.message_id);
      }
      
      return;
    }

    if (user.step === 'exness_client_id') {
      const clientIdInput = ctx.message.text.trim().toLowerCase();
      
      // Check if user wants to skip
      if (clientIdInput === 'skip' || clientIdInput === 'Skip') {
        user.clientId = 'Skipped';
      } else {
        user.clientId = ctx.message.text.trim();
      }
      
      // DON'T delete user's client ID message - preserve it
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

// Handle skip client ID
bot.action('skip_client_id', async (ctx) => {
  ctx.answerCbQuery();
  const chatId = ctx.chat.id;
  const user = userStates[chatId];
  
  if (user && user.broker === 'exness' && user.step === 'exness_client_id') {
    user.clientId = 'Skipped';
    
    // Process Exness verification
    await processExnessVerification(ctx, user);
    delete userStates[chatId];
  }
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
    delete user.clientId;
    
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
      if (user.clientId && user.clientId !== 'Skipped') {
        successMsg += `🆔 **Your Client ID:** ${user.clientId}\n`;
      }
      successMsg += `👤 **Client UID:** ${clientUid}\n`;
      
      if (accounts.length > 0) {
        successMsg += `📊 **Linked Accounts:** ${accounts.join(', ')}\n\n`;
      }
      
      await ctx.reply(successMsg, { parse_mode: 'Markdown' });
      
      // Send exclusive welcome message and VIP group invite
      const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name || 'Trader';
      const firstName = ctx.from.first_name || 'Trader';
      
      const exclusiveWelcome = `🎉 **CONGRATULATIONS ${firstName.toUpperCase()}!** 🎉\n\n✨ **You are now part of our EXCLUSIVE VIP community!**\n\n🔥 **What you get access to:**\n• Premium trading signals\n• Live market analysis\n• Direct access to Viraj\n• Exclusive trading strategies\n• Priority support\n• Special bonuses & offers\n\n👑 **Welcome to the VIP family!**`;
      
      await ctx.reply(exclusiveWelcome, { parse_mode: 'Markdown' });
      
      // Send VIP group link with user-specific message
      const vipGroupMsg = `🚀 **YOUR EXCLUSIVE VIP GROUP ACCESS**\n\nhttps://t.me/+un8XwGD0qJU1Nzc1\n\n⚠️ **IMPORTANT:**\n• This link is for ${username} only\n• Link expires when shared with others\n• Keep it private and secure\n\n🎯 **Join now and start your VIP journey!**`;
      
      const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('🔥 Join VIP Group', 'https://t.me/+un8XwGD0qJU1Nzc1')],
        [Markup.button.callback('🔄 Check Another Account', 'back_to_brokers')],
        [Markup.button.callback('🏠 Main Menu', 'back_to_main_menu')]
      ]);
      
      await ctx.reply(vipGroupMsg, { 
        parse_mode: 'Markdown',
        ...inlineKeyboard
      });
    } else {
      await ctx.reply('❌ **Account Not Found**\n\nThis account is not under our Exness referral program.', { parse_mode: 'Markdown' });
      
      // Send transfer instructions with YouTube video
      const transferMsg = `🔄 **Transfer Your Account to Us**\n\n📺 **Watch this video to learn how to transfer:**\nhttps://www.youtube.com/watch?v=8jWSDxqzZjs\n\n🏷️ **Use Partner Code:** \`YTV\`\n\n✅ **After transfer is complete:**\n• Come back to this bot\n• Use "Check Another Account" to verify\n• Get instant VIP access!`;
      
      const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('📺 Watch Transfer Video', 'https://www.youtube.com/watch?v=8jWSDxqzZjs')],
        [Markup.button.callback('🔄 Check Another Account', 'back_to_brokers')],
        [Markup.button.callback('🏠 Main Menu', 'back_to_main_menu')]
      ]);
      
      await ctx.reply(transferMsg, { 
        parse_mode: 'Markdown',
        ...inlineKeyboard
      });
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
      [Markup.button.callback('🔄 Try Again', 'back_to_brokers')],
      [Markup.button.callback('🏠 Main Menu', 'back_to_main_menu')]
    ]);
    
    await ctx.reply(errorMessage, { 
      parse_mode: 'Markdown',
      ...inlineKeyboard
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
