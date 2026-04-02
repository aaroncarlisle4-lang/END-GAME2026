#!/bin/bash
# Auto-resume YJL2B enrichment pipeline on codespace start.
# Added to .devcontainer/devcontainer.json postStartCommand.
#
# Safe to run multiple times — checks for existing process first.
# Progress persists in scripts/yjl2b_progress.json, so it picks up
# where it left off after codespace restarts.

set -e
cd /workspaces/END-GAME2026

LOG="/tmp/yjl2b_enrichment.log"
SCRIPT="scripts/enrich_autonomous.py"
CATEGORIES=("GU" "Head and Neck" "MSK" "Neuro" "Pediatrics")

echo "[$(date '+%H:%M:%S')] Enrichment startup check..."

# Already running?
if pgrep -f "enrich_autonomous.py" > /dev/null 2>&1; then
    echo "  Pipeline already running (PID $(pgrep -f enrich_autonomous.py)). Skipping."
    exit 0
fi

# Check notebooklm CLI exists
if ! command -v notebooklm &> /dev/null; then
    echo "  notebooklm CLI not found. Installing..."
    pip install notebooklm-py > /dev/null 2>&1
fi

# Try to refresh auth via Playwright (uses existing cookies, no manual input needed)
echo "  Attempting Playwright cookie refresh..."
if python3 scripts/refresh_cookies_playwright.py --refresh > /tmp/pw_refresh.log 2>&1; then
    echo "  Auth refreshed via Playwright!"
else
    echo "  Playwright refresh failed. Trying direct auth check..."
    if ! notebooklm use 5242a5 2>&1 | grep -q "Rapid Review"; then
        echo "  Auth expired or missing. Pipeline NOT started."
        echo "  Run: python3 scripts/refresh_cookies_playwright.py (paste Cookie-Editor JSON)"
        exit 1
    fi
fi

# Check if all categories are done
REMAINING=$(python3 -c "
import subprocess, json
total = 0
for cat in ['GU', 'Head and Neck', 'MSK', 'Neuro', 'Pediatrics']:
    try:
        cases = json.loads(subprocess.run(['npx', 'convex', 'run', 'yjlCases:listByCategory', json.dumps({'category': cat})], capture_output=True, text=True, timeout=30).stdout)
        total += sum(1 for c in cases if not c.get('discriminatorId'))
    except: pass
print(total)
" 2>/dev/null)

if [ "$REMAINING" = "0" ]; then
    echo "  All categories fully enriched! Nothing to do."
    exit 0
fi

echo "  $REMAINING cases remaining. Starting pipeline..."

# Launch in background
nohup python3 -u "$SCRIPT" "${CATEGORIES[@]}" > "$LOG" 2>&1 &
echo "  Started (PID $!). Log: $LOG"
echo "  Monitor: tail -f $LOG"
echo "  Status:  python3 $SCRIPT --status"
