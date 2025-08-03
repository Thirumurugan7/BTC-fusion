#!/bin/bash

echo "🚀 Deploying Your Boy Satoshi to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "real-btc-server.js" ]; then
    echo "❌ Error: Please run this script from the fusion-plus-order directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: No .env file found. You'll need to set environment variables in Vercel dashboard."
    echo "   Required variables:"
    echo "   - BITCOIN_PRIVATE_KEY"
    echo "   - WALLET_ADDRESS"
    echo "   - RPC_URL"
    echo "   - DEV_PORTAL_API_KEY"
    echo ""
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🔗 Your app will be available at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test your live deployment"
echo "3. Share your hackathon demo URL!"
echo ""
echo "🏆 Your Boy Satoshi is now live! 🏆" 