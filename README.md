# Young Trader Viraj Bot

A Telegram bot for Young Trader Viraj that provides VIP channel access, trading education, and broker services through account verification.

## Features

- **VIP Channel Access** - Verify trading accounts for exclusive group access
- **Get Funded** - Information about prop trading opportunities
- **Paid Courses** - Premium trading education with special offers
- **Partner Brokers** - Exness, XM, and Delta Exchange integration
- **Website Link** - Direct access to youngtraderviraj.com
- **Serverless Deployment** - Runs on Vercel with automatic scaling

## Quick Start

### For Production Use
```bash
# Deploy and set up webhook automatically
npm run deploy
```

### For Local Development
```bash
# Switch to local development mode
npm run local

# Run the bot locally
npm run dev
```

## Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ytv-bot
   npm install
   ```

2. **Environment Variables**
   
   Create `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   Configure your values:
   ```
   BOT_TOKEN=your_telegram_bot_token
   EXNESS_JWT=your_exness_jwt_token
   GROUP_INVITE_LINK=https://t.me/your_vip_group
   ACCOUNT_OPEN_LINK=https://your_referral_link
   ```

3. **Get Telegram Bot Token**
   - Message [@BotFather](https://t.me/botfather)
   - Use `/newbot` to create your bot
   - Copy the token to `.env`

## Bot Flow

1. **Main Menu** - Users see 5 options when they start
2. **VIP Channel** - Requires account verification under partner brokers
3. **Account Verification** - Uses Exness API to verify affiliation
4. **Access Granted** - Verified users get VIP group invite
5. **New Users** - Non-verified users get account opening links

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy` | Deploy to production and set webhook |
| `npm run local` | Switch to local development mode |
| `npm run dev` | Run bot locally for testing |
| `npm run test` | Same as dev (alias) |

## Switching Between Local and Production

### To Production
```bash
npm run deploy
```
This will:
- Deploy to Vercel production
- Set webhook to production URL
- Bot works even when your computer is off

### To Local Development
```bash
npm run local
npm run dev
```
This will:
- Remove webhook (enables polling)
- Run bot locally for development
- Requires your computer to be on
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
