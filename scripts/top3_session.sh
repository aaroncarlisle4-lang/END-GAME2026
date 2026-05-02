#!/bin/bash
# Top 3 O'Brien Pattern enrichment session runner
#
# Usage:
#   ./scripts/top3_session.sh                       # Pass 1 (matrix) for all categories
#   ./scripts/top3_session.sh Chest                 # Pass 1 for one category
#   ./scripts/top3_session.sh --viva                # Pass 2 (viva) for everything
#   ./scripts/top3_session.sh --viva Chest          # Pass 2 for cases scoped by category range
#
# Pass 2 is keyed on O'Brien case-number ranges (per category) since the viva
# script doesn't itself filter by category — see CATEGORY_RANGES below.

set -e
cd "$(dirname "$0")/.."

# O'Brien category → (caseFrom, caseTo) ranges per memory.
# Chest 1-25, GI 26-50, GU 51-75, MSK 76-100, ENT 101-125, Neuro 126-150,
# Paeds 151-175, US 176-200, Gynae 201-225, VIR 226-250, NucMed 251-275, Breast 276-300
CATEGORIES=("Chest" "GI" "GU" "MSK" "ENT" "Neuro" "Paeds" "US" "Gynae" "VIR" "NucMed" "Breast")

declare -A FROM=( [Chest]=1 [GI]=26 [GU]=51 [MSK]=76 [ENT]=101 [Neuro]=126 [Paeds]=151 [US]=176 [Gynae]=201 [VIR]=226 [NucMed]=251 [Breast]=276 )
declare -A TO=(   [Chest]=25 [GI]=50 [GU]=75 [MSK]=100 [ENT]=125 [Neuro]=150 [Paeds]=175 [US]=200 [Gynae]=225 [VIR]=250 [NucMed]=275 [Breast]=325 )

PASS=1
CATEGORY=""
for arg in "$@"; do
    case "$arg" in
        --viva) PASS=2 ;;
        *) CATEGORY="$arg" ;;
    esac
done

echo "========================================"
echo "  Top 3 Pattern Pipeline — Pass $PASS"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "========================================"

echo ""
echo "[1] Checking authentication..."
if notebooklm auth check 2>&1 | grep -q "pass"; then
    echo "    Auth file present (still need a live ask to confirm session is valid)."
else
    echo "    Auth EXPIRED. Refresh cookies first:"
    echo "    python3 scripts/refresh_notebooklm_auth.py"
    exit 1
fi

echo ""
echo "[2] Selecting notebook..."
notebooklm use 5242a5 2>/dev/null || true

run_pass1() {
    local cat="$1"
    if [ -n "$cat" ]; then
        echo "[3] Pass 1 (matrix) — category: $cat"
        python3 scripts/enrich_top3_patterns_batch.py --category "$cat"
    else
        echo "[3] Pass 1 (matrix) — all categories"
        for c in "${CATEGORIES[@]}"; do
            echo ""
            echo "--- Processing: $c ---"
            python3 scripts/enrich_top3_patterns_batch.py --category "$c"
            if ! notebooklm auth check 2>&1 | grep -q "pass"; then
                echo "AUTH FILE GONE between categories. Refresh and resume from: $c"
                exit 1
            fi
        done
    fi
}

run_pass2() {
    local cat="$1"
    if [ -n "$cat" ]; then
        local f="${FROM[$cat]}"
        local t="${TO[$cat]}"
        if [ -z "$f" ] || [ -z "$t" ]; then
            echo "Unknown category for case-range mapping: $cat"
            exit 1
        fi
        echo "[3] Pass 2 (viva) — $cat (#$f–#$t)"
        python3 scripts/generate_top3_viva_batch.py --case-from "$f" --case-to "$t"
    else
        echo "[3] Pass 2 (viva) — all categories sequentially"
        for c in "${CATEGORIES[@]}"; do
            echo ""
            echo "--- Processing: $c (#${FROM[$c]}–#${TO[$c]}) ---"
            python3 scripts/generate_top3_viva_batch.py --case-from "${FROM[$c]}" --case-to "${TO[$c]}"
        done
    fi
}

echo ""
if [ "$PASS" = "1" ]; then
    run_pass1 "$CATEGORY"
else
    run_pass2 "$CATEGORY"
fi

echo ""
echo "========================================"
echo "  Session complete: $(date '+%Y-%m-%d %H:%M')"
echo "========================================"
