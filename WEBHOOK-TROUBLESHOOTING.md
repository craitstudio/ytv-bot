# 🔧 Webhook Troubleshooting Guide

## Problem: Bot Stops Responding

### Quick Fix (Run This):
```bash
node monitor-webhook.js
```

This will check and automatically fix the webhook if needed.

---

## Common Causes:

### 1. **Webhook Configuration Lost**
**Symptoms:** Bot doesn't respond at all
**Cause:** Webhook URL was deleted or changed
**Fix:** Run `node setup-webhook-now.js`

### 2. **Deployment URL Changed**
**Symptoms:** Bot stopped after redeploying
**Cause:** Vercel generated a new deployment URL
**Fix:** 
1. Get new URL from Vercel dashboard
2. Update `setup-webhook-now.js` with new URL
3. Run `node setup-webhook-now.js`

### 3. **Vercel Protection Re-enabled**
**Symptoms:** Webhook shows errors in status
**Cause:** Vercel protection was turned back on
**Fix:** Disable protection in Vercel settings

### 4. **Environment Variables Missing**
**Symptoms:** Bot responds but doesn't work properly
**Cause:** BOT_TOKEN or EXNESS_JWT missing on Vercel
**Fix:** Add variables in Vercel dashboard → Settings → Environment Variables

### 5. **JWT Token Expired**
**Symptoms:** Exness verification fails
**Cause:** EXNESS_JWT has expired (tokens have expiration dates)
**Fix:** Generate new JWT from Exness and update in Vercel

---

## Diagnostic Commands:

### Check Webhook Status:
```bash
node check-webhook.js
```

### Monitor and Auto-Fix:
```bash
node monitor-webhook.js
```

### Manual Webhook Setup:
```bash
node setup-webhook-now.js
```

### Test Endpoint:
```bash
curl https://ytv-ffzxgc0c5-youngtraderviraj-ctrls-projects.vercel.app/api/webhook
```
Should return: `{"message":"Exness Affiliation Bot is running!","status":"healthy"}`

---

## Prevention:

### Set Up Monitoring (Optional):

You can set up a cron job to auto-monitor:

1. **Create a cron job** (Mac/Linux):
   ```bash
   crontab -e
   ```

2. **Add this line** (checks every 5 minutes):
   ```
   */5 * * * * cd /Users/xena/this\ mac/crait/ytv-bot && node monitor-webhook.js >> webhook-monitor.log 2>&1
   ```

Or use a monitoring service like:
- **UptimeRobot** - Ping your endpoint every 5 minutes
- **Vercel Cron Jobs** - Set up scheduled checks
- **GitHub Actions** - Create a workflow to monitor

---

## Emergency Checklist:

When bot stops working, run these in order:

1. ✅ **Check webhook:**
   ```bash
   node check-webhook.js
   ```

2. ✅ **Test endpoint:**
   ```bash
   curl https://ytv-ffzxgc0c5-youngtraderviraj-ctrls-projects.vercel.app/api/webhook
   ```

3. ✅ **Fix webhook if needed:**
   ```bash
   node setup-webhook-now.js
   ```

4. ✅ **Check deployment logs:**
   https://vercel.com/youngtraderviraj-ctrls-projects/ytv-bot/logs

5. ✅ **Verify environment variables:**
   https://vercel.com/youngtraderviraj-ctrls-projects/ytv-bot/settings/environment-variables

6. ✅ **Test in Telegram:**
   Send `/start` to your bot

---

## Important Notes:

⚠️ **Never run polling mode and webhook at the same time**
- If you test locally with `node test-bot.js`, it uses polling
- This can interfere with the production webhook
- Always stop local testing before checking production

⚠️ **Webhook URL must be accessible**
- HTTPS only (not HTTP)
- Valid SSL certificate
- No authentication/protection blocking it

⚠️ **Bot token must remain secret**
- Don't share it
- Don't commit it to Git
- Don't regenerate it unless necessary (causes webhook to break)

---

## Contact for Help:

If issue persists:
1. Check Vercel deployment status
2. Review function logs for errors
3. Verify Telegram API status: https://status.telegram.org/
4. Check if bot was blocked by Telegram (rare)

---

**Last Updated:** 2025-10-16
**Current Production URL:** https://ytv-ffzxgc0c5-youngtraderviraj-ctrls-projects.vercel.app
