#!/bin/bash
# NotebookLM enrichment session runner
# Usage: ./scripts/notebooklm_session.sh [category]
# Default: processes all categories in order

set -e
cd "$(dirname "$0")/.."

CATEGORIES=("Spine" "Chest" "GI" "GI Oncology" "GU" "Head and Neck" "MSK" "Neuro" "Pediatrics")

echo "========================================"
echo "  NotebookLM Enrichment Session"
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
echo "[2] Selecting notebook..."
notebooklm use 5242a5 2>/dev/null || true

# Step 3: Run enrichment
if [ -n "$1" ]; then
    echo ""
    echo "[3] Enriching category: $1"
    python3 scripts/enrich_yjl2b_batch.py "$1"
else
    echo ""
    echo "[3] Enriching all categories..."
    for cat in "${CATEGORIES[@]}"; do
        echo ""
        echo "--- Processing: $cat ---"
        python3 scripts/enrich_yjl2b_batch.py "$cat"

        # Re-check auth between categories
        if ! notebooklm auth check 2>&1 | grep -q "pass"; then
            echo ""
            echo "AUTH EXPIRED between categories. Refresh and re-run."
            echo "  python3 scripts/refresh_notebooklm_auth.py"
            echo "  ./scripts/notebooklm_session.sh $cat"
            exit 1
        fi
    done
fi

echo ""
echo "========================================"
echo "  Session complete: $(date '+%Y-%m-%d %H:%M')"
echo "========================================"
