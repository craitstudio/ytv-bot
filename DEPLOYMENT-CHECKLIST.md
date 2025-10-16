# 🚀 Deployment Checklist

## ✅ Webhook Configuration
**Status:** ✅ COMPLETED
- Webhook URL: `https://ytv-kswt25x1y-youngtraderviraj-ctrls-projects.vercel.app/api/webhook`
- Configured on: 2025-10-15

---

## 🔧 Vercel Environment Variables

### Required Variables (Check on Vercel Dashboard)

Go to: https://vercel.com/youngtraderviraj-ctrls-projects/ytv/settings/environment-variables

Make sure these are set:

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | ✅ YES | Your Telegram bot token |
| `EXNESS_JWT` | ✅ YES | Exness API authentication token |
| `NODE_ENV` | ✅ YES | Set to `production` |
| `VERCEL` | ✅ YES | Set to `1` |
| `GROUP_INVITE_LINK` | ⚠️ Optional | VIP group invite link |
| `ACCOUNT_OPEN_LINK` | ⚠️ Optional | Exness account opening link |

### How to Add/Update Variables:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**
6. **IMPORTANT:** After adding/updating variables, you must **redeploy** the project

---

## 🧪 Testing Your Bot

### Test the Bot:
1. Open Telegram
2. Find your bot: `@your_bot_username`
3. Send `/start`
4. You should see the Young Trader Viraj welcome menu

### If Bot Still Doesn't Respond:

#### 1. Check Webhook Status
```bash
node check-webhook.js
```

#### 2. Check Deployment Logs
- Visit: https://vercel.com/youngtraderviraj-ctrls-projects/ytv/logs
- Look for errors in the function logs
- Common issues:
  - Missing environment variables
  - API authentication errors
  - Function timeout errors

#### 3. Test the Endpoint Directly
```bash
curl https://ytv-kswt25x1y-youngtraderviraj-ctrls-projects.vercel.app/api/webhook
```
Should return: `{"message":"Exness Affiliation Bot is running!","timestamp":"...","status":"healthy"}`

#### 4. Verify Bot Token
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
```
Should return your bot information.

---

## 🔄 Redeployment

If you make changes to the code or environment variables:

1. **Push changes to Git:**
   ```bash
   git add .
   git commit -m "Update bot configuration"
   git push
   ```

2. **Or trigger manual redeploy on Vercel:**
   - Go to your project dashboard
   - Click **Deployments**
   - Click the **•••** menu on the latest deployment
   - Select **Redeploy**

---

## 📊 Monitoring

### Check Bot Health:
```bash
# Webhook status
node check-webhook.js

# Test bot locally
npm run dev
```

### Useful Links:
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/youngtraderviraj-ctrls-projects/ytv/settings
- **Deployment Logs:** https://vercel.com/youngtraderviraj-ctrls-projects/ytv/logs
- **Telegram Bot API:** https://core.telegram.org/bots/api

---

## 🐛 Common Issues & Solutions

### Issue: Bot not responding
**Solution:**
1. Check webhook is set (run `node check-webhook.js`)
2. Verify all environment variables on Vercel
3. Check deployment logs for errors
4. Ensure latest code is deployed

### Issue: "Authentication failed"
**Solution:**
- Check `EXNESS_JWT` is correct and not expired
- JWT tokens have expiration dates - you may need to regenerate

### Issue: "Group invite link not working"
**Solution:**
- Update `GROUP_INVITE_LINK` in Vercel environment variables
- Make sure the invite link is valid and not revoked

### Issue: Webhook errors
**Solution:**
1. Check the function logs on Vercel
2. Ensure the webhook URL is accessible: `curl https://ytv-kswt25x1y-youngtraderviraj-ctrls-projects.vercel.app/api/webhook`
3. Verify SSL certificate is valid

---

## 📝 Maintenance Tasks

### Monthly:
- [ ] Check JWT token expiration (Exness JWT)
- [ ] Review deployment logs for errors
- [ ] Test bot functionality end-to-end

### As Needed:
- [ ] Update group invite links if changed
- [ ] Update account opening links if changed
- [ ] Monitor user feedback and fix issues

---

**Last Updated:** 2025-10-15
**Bot Status:** ✅ WEBHOOK CONFIGURED - Ready for testing
