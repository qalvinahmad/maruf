#!/bin/bash

# Script to switch between production and local Supabase environments

case "$1" in
  "local")
    echo "🔄 Switching to LOCAL Supabase environment..."
    cp .env.local.dev .env.local
    echo "✅ Environment switched to LOCAL"
    echo "📋 Configuration:"
    echo "   - Supabase URL: http://127.0.0.1:54321"
    echo "   - Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    echo "   - Studio URL: http://127.0.0.1:54323"
    echo ""
    echo "🚀 You can now run: npm run dev"
    ;;
  "prod")
    echo "🔄 Switching to PRODUCTION Supabase environment..."
    cp .env.local.prod .env.local 2>/dev/null || echo "❌ .env.local.prod not found. Please create it with your production credentials."
    echo "✅ Environment switched to PRODUCTION"
    ;;
  *)
    echo "🔧 Supabase Environment Switcher"
    echo ""
    echo "Usage: $0 [local|prod]"
    echo ""
    echo "Commands:"
    echo "  local  - Switch to local Supabase development environment"
    echo "  prod   - Switch to production Supabase environment"
    echo ""
    echo "Current environment:"
    if grep -q "127.0.0.1" .env.local 2>/dev/null; then
      echo "  📍 LOCAL (Development)"
    else
      echo "  📍 PRODUCTION"
    fi
    ;;
esac
