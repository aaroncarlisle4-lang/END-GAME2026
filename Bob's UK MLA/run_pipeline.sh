#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Dähnert Radiology Review Manual — Stage 1 Pipeline
# PDF → Marker Markdown → Differential Clusters
#
# MEMORY NOTE: Marker requires ~6 GB RAM for its neural models.
# This Codespace has 7.8 GB / no swap.
#
# Options:
#   A) Run on a machine with ≥8 GB RAM + swap (recommended for full book)
#   B) Use --page_range to process in batches of ~50 pages, then merge
#   C) Use marker's lighter --disable_ocr mode if the PDF has embedded text
#      (check with: pdftotext "review manual dahnert.pdf" /tmp/test.txt && head /tmp/test.txt)
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PDF="review manual dahnert.pdf"
MARKER_OUT="marker_output"
CLUSTER_OUT="processed_clusters"
MIN_QUALITY=0.3

# ── Stage 1a: Marker PDF → Markdown ──────────────────────────────────────────
echo "═══════════════════════════════════════════════"
echo " Stage 1a: Marker PDF → Markdown"
echo "═══════════════════════════════════════════════"

# Check if PDF has embedded text (much faster + lower memory than OCR mode)
if pdftotext "$PDF" /tmp/_dahnert_text_check.txt 2>/dev/null && [ -s /tmp/_dahnert_text_check.txt ]; then
    echo "→ PDF has embedded text — using --disable_ocr for speed"
    OCR_FLAG="--disable_ocr"
else
    echo "→ PDF appears to be scanned — OCR will be used (needs ≥8 GB RAM)"
    OCR_FLAG=""
fi
rm -f /tmp/_dahnert_text_check.txt

# Option A: Full book (run on machine with ≥8 GB RAM)
marker_single "$PDF" \
    --output_dir "$MARKER_OUT" \
    --disable_multiprocessing \
    $OCR_FLAG

# Option B (batch mode for low-memory machines): uncomment and adjust ranges
# Total pages in Dahnert 7th ed: ~1091
# for START in $(seq 0 50 1050); do
#     END=$((START + 49))
#     echo "Processing pages ${START}-${END}..."
#     marker_single "$PDF" \
#         --output_dir "${MARKER_OUT}/batch_${START}" \
#         --page_range "${START}-${END}" \
#         --disable_multiprocessing \
#         $OCR_FLAG
# done
# # Merge all batch outputs
# cat "${MARKER_OUT}"/batch_*/review_manual_dahnert/*.md > "${MARKER_OUT}/dahnert_full.md"

# ── Stage 1b: Extract Differential Clusters ──────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo " Stage 1b: Extract Differential Clusters"
echo "═══════════════════════════════════════════════"

# Find the Marker output file (marker_single creates a subdir with the PDF name)
MARKER_MD=$(find "$MARKER_OUT" -name "*.md" | head -1)
if [ -z "$MARKER_MD" ]; then
    echo "ERROR: No Markdown file found in $MARKER_OUT/"
    echo "Did Marker complete successfully?"
    exit 1
fi

echo "Using: $MARKER_MD"
python3 extract_clusters.py "$MARKER_MD" \
    --output "$CLUSTER_OUT" \
    --min-quality "$MIN_QUALITY" \
    --verbose

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo " Summary"
echo "═══════════════════════════════════════════════"
TOTAL=$(find "$CLUSTER_OUT" -name "*.md" ! -name "index.md" | wc -l)
echo "Clusters written to: $CLUSTER_OUT/"
echo "Total cluster files: $TOTAL"
echo ""
echo "Top sections by cluster count:"
find "$CLUSTER_OUT" -mindepth 1 -maxdepth 1 -type d | while read -r dir; do
    count=$(find "$dir" -name "*.md" | wc -l)
    echo "  $count  $(basename "$dir")"
done | sort -rn | head -10
