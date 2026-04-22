#!/bin/bash
# FRCRbank Mnemonic Infographic generation session runner
# Usage: ./scripts/infographic_session.sh [category]
# Default: processes all 6 categories in order

set -e
cd "$(dirname "$0")/.."

CATEGORIES=("Chest" "MSK" "GI" "GU" "Neuro" "Paeds")

echo "========================================"
echo "  FRCRbank Mnemonic Infographic Session"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "========================================"

# Step 1: Auth check
echo ""
echo "[1] Checking authentication..."
if notebooklm auth check 2>&1 | grep -q "pass"; then
    echo "    Auth is valid."
else
    echo "    Auth EXPIRED. Please refresh cookies:"
    echo "    python3 scripts/refresh_notebooklm_auth.py"
    exit 1
fi

# Step 2: Notebook check
echo ""
echo "[2] Selecting notebook (Rapid Review of Radiology)..."
notebooklm use 5242a5 2>/dev/null || true

# Step 3: Run infographic generation
if [ -n "$1" ]; then
    echo ""
    echo "[3] Generating infographics for: $1"
    python3 scripts/generate_infographics_batch.py "$1"
else
    echo ""
    echo "[3] Generating infographics for all categories..."
    for cat in "${CATEGORIES[@]}"; do
        echo ""
        echo "--- Processing: $cat ---"
        python3 scripts/generate_infographics_batch.py "$cat"

        # Re-check auth between categories
        if ! notebooklm auth check 2>&1 | grep -q "pass"; then
            echo ""
            echo "AUTH EXPIRED between categories. Refresh and re-run:"
            echo "  python3 scripts/refresh_notebooklm_auth.py"
            echo "  ./scripts/infographic_session.sh \"$cat\""
            exit 1
        fi
    done
fi

echo ""
echo "========================================"
echo "  Session complete: $(date '+%Y-%m-%d %H:%M')"
echo "========================================"
