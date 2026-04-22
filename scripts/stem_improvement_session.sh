#!/bin/bash
# FRCR 2A Stem Improvement Session Runner
# Usage: ./scripts/stem_improvement_session.sh [category]
# Default category: Paediatrics (smallest, good for first run)
#
# Processing order (smallest first):
#   1. Paediatrics (258)
#   2. Neuro & Head/Neck (310)
#   3. Neuro/Head & Neck (377)
#   4. Gastrointestinal (465)
#   5. MSK (538)
#   6. Genitourinary_Gynaecology_Breast (549)
#   7. Thoracic/Cardiothoracic (564)
#
# To rollback a category:
#   npx supabase db query "UPDATE mcq_question_bank q SET question_text = b.question_text \
#     FROM mcq_question_bank_stems_backup_20260412 b \
#     WHERE q.id = b.id AND b.category = 'CATEGORY_NAME';" --linked

set -e

CATEGORY="${1:-Paediatrics}"

echo "=================================================="
echo "  FRCR 2A Stem Improvement Session"
echo "  Category: $CATEGORY"
echo "  $(date)"
echo "=================================================="

# Check NotebookLM auth
echo ""
echo "Checking NotebookLM auth..."
if ! notebooklm auth check 2>&1 | grep -q "pass"; then
    echo "ERROR: Auth expired. Run: python3 scripts/refresh_notebooklm_auth.py"
    exit 1
fi
echo "Auth OK."

# Select notebook
echo "Selecting notebook..."
notebooklm use 5242a5 2>&1 | tail -1

# Check difficulty profile exists
if [ ! -f scripts/stem_difficulty_profile.json ]; then
    echo ""
    echo "ERROR: Difficulty profile not found."
    echo "Run: python3 scripts/analyze_paper_style.py"
    exit 1
fi
echo "Difficulty profile found."

# Check backup exists
echo "Checking backup table..."
BACKUP_COUNT=$(npx supabase db query "SELECT COUNT(*) as cnt FROM mcq_question_bank_stems_backup_20260412;" --linked 2>&1 | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['rows'][0]['cnt'])" 2>/dev/null || echo "0")
if [ "$BACKUP_COUNT" = "0" ]; then
    echo "WARNING: Backup table empty or missing. Creating..."
    npx supabase db query "CREATE TABLE IF NOT EXISTS mcq_question_bank_stems_backup_20260412 AS SELECT id, category, question_text FROM mcq_question_bank;" --linked
fi
echo "Backup OK ($BACKUP_COUNT rows)."

# Run the pipeline
echo ""
echo "Starting pipeline..."
python3 scripts/improve_2a_stems.py --category "$CATEGORY"
