# Exness Affiliation Checker Bot

A Telegram bot that checks if user accounts are under your Exness referral program and provides appropriate responses.

## Features

- ✅ **Account Verification**: Checks if user accounts are under your referral
- 🎯 **Smart Responses**: Sends group invites for verified accounts or registration links for new users
- 🔒 **Secure API Integration**: Uses your Exness Partner API with JWT authentication
- 🚀 **Serverless Deployment**: Ready for Vercel deployment
- 📱 **User-Friendly**: Simple conversation flow for users

## Bot Flow

1. User starts the bot with `/start`
2. Bot asks for:
   - Full Name
   - Email Address
   - Account ID (optional)
3. Bot checks the Exness API for affiliation
4. **If affiliated**: Sends welcome message + group invite link
5. **If not affiliated**: Sends account opening/referral link

## Quick Setup

### 1. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Choose a name and username for your bot
4. Copy the **Bot Token**

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   EXNESS_JWT=JWT eyJhbGciOiJSUzI1NiIsImtpZCI6InVzZXIiLCJ0eXAiOiJKV1QifQ...
   GROUP_INVITE_LINK=https://t.me/your_group_invite_link
   ACCOUNT_OPEN_LINK=https://your_referral_account_opening_link
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Deploy to Vercel

#### Option A: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option B: Deploy via GitHub
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### 5. Set Up Webhook

After deployment, set up the webhook:

```bash
# Add your Vercel URL to .env
echo "WEBHOOK_URL=https://your-app.vercel.app/api/webhook" >> .env

# Run webhook setup
npm run setup-webhook
```

## Local Development

For local testing:

```bash
# Install dependencies
npm install

# Set NODE_ENV to development in .env
echo "NODE_ENV=development" >> .env

# Run the bot
npm run dev
```

## API Integration

The bot integrates with the Exness Partner Affiliation API:

- **Endpoint**: `https://my.exnessaffiliates.com/api/partner/affiliation/`
- **Method**: POST
- **Headers**: 
  - `Authorization: JWT your_jwt_token`
  - `Content-Type: application/json`
- **Body**: `{ "email": "user@example.com" }`

### Expected API Response

**Affiliated Account:**
```json
{
  "affiliation": true,
  "accounts": ["148706685", "185399031"],
  "client_uid": "470fdc8f"
}
```

**Non-Affiliated Account:**
```json
{
  "affiliation": false,
  "accounts": [],
  "client_uid": null
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram Bot Token from BotFather | ✅ |
| `EXNESS_JWT` | Your Exness API JWT token | ✅ |
| `GROUP_INVITE_LINK` | Telegram group invite link for verified users | ✅ |
| `ACCOUNT_OPEN_LINK` | Account opening/referral link for new users | ✅ |
| `WEBHOOK_URL` | Your deployment URL + /api/webhook | ✅ (for production) |
| `NODE_ENV` | Environment (development/production) | Optional |

## Project Structure

```
ytv-bot/
├── api/
│   └── webhook.js          # Main bot handler
├── .env.example            # Environment variables template
├── .env                    # Your environment variables (create this)
├── package.json            # Dependencies and scripts
├── vercel.json            # Vercel deployment config
├── setup-webhook.js       # Webhook configuration script
└── README.md              # This file
```

## Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Set up webhook (after deployment)
npm run setup-webhook

# Delete webhook
node setup-webhook.js delete
```

## Error Handling

The bot handles various error scenarios:

- **Invalid Email**: Prompts user to enter a valid email
- **API Errors**: Shows user-friendly error messages
- **Rate Limiting**: Handles 429 responses from Exness API
- **Authentication Errors**: Logs 401 errors for admin review
- **Network Issues**: Graceful timeout and retry handling

## Security Notes

- ✅ JWT token is stored securely in environment variables
- ✅ Input validation for email addresses
- ✅ Error messages don't expose sensitive information
- ✅ API timeout protection (10 seconds)
- ✅ Proper error logging for debugging

## Troubleshooting

### Bot not responding
1. Check if webhook is set correctly: `npm run setup-webhook`
2. Verify BOT_TOKEN in environment variables
3. Check Vercel deployment logs

### API errors
1. Verify EXNESS_JWT token is valid and not expired
2. Check API endpoint availability
3. Ensure proper request format

### Deployment issues
1. Verify all environment variables are set in Vercel
2. Check build logs for errors
3. Ensure webhook URL is correct

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Verify all environment variables are correctly set

## License

MIT License - feel free to modify and use for your needs.
