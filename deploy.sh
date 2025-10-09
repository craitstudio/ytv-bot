#!/bin/bash

echo "🚀 Deploying Telegram Bot to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your Vercel app URL from the deployment output above"
echo "2. Set environment variables in Vercel dashboard:"
echo "   - BOT_TOKEN: 8125308442:AAGDPN2-bW_wAM46EwcAJW43I5z2dyqZcWI"
echo "   - WEBHOOK_URL: https://your-app-url.vercel.app/api/webhook"
echo "   - EXNESS_JWT: (your JWT token)"
echo "   - GROUP_INVITE_LINK: (your group link)"
echo "   - ACCOUNT_OPEN_LINK: (your referral link)"
echo "3. Run: node deploy-webhook.js"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
