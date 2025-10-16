# 🚀 Deploy Your Bot to Production

## Current Status:
❌ Bot is NOT deployed to production
✅ Vercel CLI is installed
✅ Project is linked to Vercel

---

## Quick Deploy (Run this command):

```bash
vercel --prod
```

This will:
1. Build your bot
2. Deploy to production
3. Give you the production URL

---

## Important: Before Deploying

Make sure your environment variables are set on Vercel:

1. Go to: https://vercel.com/youngtraderviraj-ctrls-projects/ytv-bot/settings/environment-variables

2. Add these variables:
   - `BOT_TOKEN` = Your Telegram bot token
   - `EXNESS_JWT` = Your Exness API JWT
   - `NODE_ENV` = production
   - `VERCEL` = 1

3. Make sure they're enabled for **Production** environment

---

## After Deployment:

1. You'll get a production URL (e.g., `ytv-bot.vercel.app`)
2. Run the webhook setup:
   ```bash
   # Update the URL in setup-webhook-now.js first
   node setup-webhook-now.js
   ```
3. Test your bot in Telegram with /start

---

## Alternative: Deploy via Git

If you prefer deploying via Git:

```bash
# Commit your changes
git add .
git commit -m "Deploy bot"
git push

# Vercel will auto-deploy from the main branch
```

---

## Troubleshooting

### If deployment fails:
- Check build logs in terminal
- Verify all files are committed (if using git)
- Check environment variables are set

### If bot still doesn't work:
- Check deployment logs: https://vercel.com/youngtraderviraj-ctrls-projects/ytv-bot/logs
- Verify webhook is set: `node check-webhook.js`
- Test endpoint: `curl https://your-url.vercel.app/api/webhook`
