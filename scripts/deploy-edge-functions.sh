#!/bin/bash

# Deploy Edge Functions to Supabase
# Run this script to deploy all OTP-related Edge Functions

echo "🚀 Deploying Edge Functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

echo "📧 Deploying send-email function..."
supabase functions deploy send-email --no-verify-jwt

echo "🔐 Deploying generate-otp function..."
supabase functions deploy generate-otp --no-verify-jwt

echo "✅ Deploying verify-otp function..."
supabase functions deploy verify-otp --no-verify-jwt

echo ""
echo "✨ All Edge Functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to Edge Functions > Settings"
echo "3. Add the following environment variables:"
echo "   - RESEND_API_KEY (if using Resend)"
echo "   - FROM_EMAIL"
echo "   - SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD (if using SMTP)"
echo ""
echo "🔗 Your Edge Function URLs:"
echo "   - Generate OTP: https://[project-ref].supabase.co/functions/v1/generate-otp"
echo "   - Verify OTP: https://[project-ref].supabase.co/functions/v1/verify-otp"
echo "   - Send Email: https://[project-ref].supabase.co/functions/v1/send-email"
