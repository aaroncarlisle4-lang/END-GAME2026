#!/bin/bash

echo ""
echo "=== Supabase CLI Login Helper for WSL / Codespaces ==="
echo ""

echo "1) In another terminal (or background) run:"
echo "     npx supabase login"
echo ""
echo "   Your browser will open on your local machine."
echo "   Complete the login in the Supabase Dashboard."
echo ""

echo "2) The browser will attempt to redirect to localhost and likely FAIL."
echo "   Copy the FULL callback URL from your browser's address bar."
echo ""
echo "   Example:"
echo "   http://localhost:53344/?token=...&public_key=..."
echo ""

read -p "Paste callback URL here: " CALLBACK_URL

if [[ -z "$CALLBACK_URL" ]]; then
    echo "❌ No URL provided."
    exit 1
fi

echo ""
echo "Sending callback to Supabase CLI..."

# Use curl to send the callback URL to the local listener
curl -s "$CALLBACK_URL" > /dev/null

echo ""
echo "🎉 Supabase CLI authentication should now be complete!"
echo "You can now run:"
echo "     npx supabase projects list"
echo ""
