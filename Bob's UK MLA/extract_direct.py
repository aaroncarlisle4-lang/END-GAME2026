#!/usr/bin/env python3
"""
Dähnert Direct Extractor — Stage 1 (no Marker required)
─────────────────────────────────────────────────────────
Since the PDF has an embedded text layer, we extract structure directly with
PyMuPDF (fitz), using font sizes to infer heading levels. This avoids Marker's
~6 GB neural-model memory requirement and is ~10× faster.

The output is identical to the Marker pipeline: one .md file per differential
cluster, passed through the same extract_clusters.py logic.

Usage:
    python extract_direct.py "review manual dahnert.pdf" -o processed_clusters/
    python extract_direct.py "review manual dahnert.pdf" -o processed_clusters/ --pages 100-300
    python extract_direct.py "review manual dahnert.pdf" -o processed_clusters/ --emit-md marker_output/dahnert.md

Options:
    --emit-md PATH    Also save the intermediate full-book Markdown (useful for
                      debugging or running extract_clusters.py separately later)
    --pages START-END Process only a page range (0-indexed)
    --min-quality     Minimum cluster quality score [0.0-1.0] (default 0.3)
"""

from __future__ import annotations

import argparse
import logging
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

# Import the shared cleaning and cluster logic from extract_clusters.py
# (both files must be in the same directory)
sys.path.insert(0, str(Path(__file__).parent))
from extract_clusters import (
    clean_markdown,
    _parse_sections,
    detect_clusters,
    write_clusters,
    write_index,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# PDF → MARKDOWN CONVERSION (font-size based structure detection)
# ──────────────────────────────────────────────────────────────────────────────

# Radiology textbook heuristics
_BULLET_CHARS = frozenset("•◦▪▸▹►–-")
_MIN_HEADING_FONT_RATIO = 1.15   # heading must be ≥ 15% larger than body text
_RUNNING_HEADER_MAX_CHARS = 80   # lines shorter than this at page top = suspect header


def _detect_body_font_size(page_blocks: list[dict]) -> float:
    """
    Estimate the dominant (body text) font size for this page by frequency.
    Returns the most common font size in the page's text spans.
    """
    sizes: dict[float, int] = {}
    for block in page_blocks:
        if block["type"] != 0:   # 0 = text block
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                size = round(span["size"], 1)
                char_count = len(span["text"].strip())
                sizes[size] = sizes.get(size, 0) + char_count
    if not sizes:
        return 10.0
    return max(sizes, key=sizes.__getitem__)


def _is_page_header_or_footer(text: str, block_bbox: tuple, page_height: float) -> bool:
    """
    Heuristic: is this block a running header or footer?
    Checks vertical position (top/bottom 5% of page) and short text.
    """
    _, y0, _, y1 = block_bbox
    in_margin = y0 < page_height * 0.05 or y1 > page_height * 0.95
    return in_margin and len(text.strip()) < _RUNNING_HEADER_MAX_CHARS


def _span_is_bullet(text: str) -> bool:
    """Does this span represent the start of a bullet item?"""
    stripped = text.strip()
    if not stripped:
        return False
    return stripped[0] in _BULLET_CHARS


def extract_page_markdown(page: fitz.Page, body_size: float) -> str:
    """
    Convert a single PDF page to Markdown using font-size hierarchy for headings.

    Algorithm:
    1. Iterate text blocks in reading order (already sorted by PyMuPDF)
    2. Skip running headers/footers by position
    3. Determine heading level by font-size ratio vs body text
    4. Detect bullets by leading bullet character or bold + short line pattern
    5. Emit Markdown lines
    """
    blocks = page.get_text("dict", sort=True)["blocks"]
    page_height = page.rect.height
    lines_out: list[str] = []
    prev_text = ""

    for block in blocks:
        if block["type"] != 0:
            continue

        block_text = " ".join(
            span["text"]
            for line in block.get("lines", [])
            for span in line.get("spans", [])
        ).strip()

        if not block_text:
            continue

        if _is_page_header_or_footer(block_text, block["bbox"], page_height):
            continue

        # Walk lines within the block to preserve list structure
        for line in block.get("lines", []):
            if not line.get("spans"):
                continue

            first_span = line["spans"][0]
            line_text = "".join(s["text"] for s in line["spans"]).strip()

            if not line_text:
                continue

            font_size = first_span["size"]
            is_bold = bool(first_span["flags"] & 2**4)  # flag bit 4 = bold
            size_ratio = font_size / body_size if body_size > 0 else 1.0

            # ── Heading detection ──────────────────────────────────────────
            if size_ratio >= _MIN_HEADING_FONT_RATIO:
                # Infer heading level from size ratio
                if size_ratio >= 1.6:
                    prefix = "# "       # Chapter
                elif size_ratio >= 1.35:
                    prefix = "## "      # Major finding / section
                elif size_ratio >= 1.15:
                    prefix = "### "     # Sub-finding
                else:
                    prefix = "#### "
                lines_out.append(f"\n{prefix}{line_text}")
                prev_text = line_text
                continue

            # ── Bullet detection ───────────────────────────────────────────
            # Method 1: explicit bullet character
            if line_text and line_text[0] in _BULLET_CHARS:
                bullet_text = line_text[1:].strip()
                # Estimate indent from x-position
                x0 = line["spans"][0]["origin"][0]
                # Typical left margin ~50-70pt; each indent level ~12-20pt
                indent_level = max(0, int((x0 - 50) / 15))
                indent = "  " * indent_level
                lines_out.append(f"{indent}- {bullet_text}")
                prev_text = bullet_text
                continue

            # Method 2: bold short line after a heading (Dahnert uses bold for
            # major differentials sometimes, without an explicit bullet char)
            if is_bold and len(line_text) < 120 and lines_out:
                last = lines_out[-1]
                if last.startswith("#"):
                    lines_out.append(f"- {line_text}")
                    prev_text = line_text
                    continue

            # ── Regular paragraph text ─────────────────────────────────────
            lines_out.append(line_text)
            prev_text = line_text

    return "\n".join(lines_out)


def pdf_to_markdown(
    pdf_path: Path,
    page_range: tuple[int, int] | None = None,
) -> str:
    """
    Convert the full PDF (or a page range) to a single Markdown string.
    """
    doc = fitz.open(str(pdf_path))
    total = doc.page_count
    start, end = (0, total - 1) if page_range is None else page_range
    end = min(end, total - 1)

    log.info(f"Extracting pages {start}–{end} of {total} from {pdf_path.name}")

    md_parts: list[str] = []
    for page_num in range(start, end + 1):
        page = doc[page_num]
        blocks = page.get_text("dict", sort=True)["blocks"]
        body_size = _detect_body_font_size(blocks)
        page_md = extract_page_markdown(page, body_size)
        if page_md.strip():
            md_parts.append(page_md)

        if (page_num - start) % 100 == 0:
            log.info(f"  Page {page_num}/{end}...")

    doc.close()
    return "\n\n".join(md_parts)


# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract differential clusters directly from PDF (no Marker needed).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("pdf", help="Path to Dähnert PDF")
    parser.add_argument("--output", "-o", default="processed_clusters")
    parser.add_argument("--pages", help="Page range e.g. '0-200' (0-indexed)")
    parser.add_argument("--emit-md", metavar="PATH",
                        help="Also save full-book Markdown to this path")
    parser.add_argument("--min-quality", "-q", type=float, default=0.3)
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    pdf_path = Path(args.pdf)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    page_range: tuple[int, int] | None = None
    if args.pages:
        parts = args.pages.split("-")
        page_range = (int(parts[0]), int(parts[1]))

    # ── Stage A: PDF → Markdown ───────────────────────────────────────────────
    raw_md = pdf_to_markdown(pdf_path, page_range)

    if args.emit_md:
        emit_path = Path(args.emit_md)
        emit_path.parent.mkdir(parents=True, exist_ok=True)
        emit_path.write_text(raw_md, encoding="utf-8")
        log.info(f"Full Markdown saved to: {emit_path}")

    # ── Stage B: Clean → Parse → Cluster → Write ─────────────────────────────
    log.info("Cleaning Markdown...")
    cleaned = clean_markdown(raw_md)

    log.info("Parsing sections...")
    sections = _parse_sections(cleaned)
    log.info(f"  {len(sections)} sections")

    log.info("Detecting clusters...")
    clusters = detect_clusters(sections)
    clusters.sort(key=lambda c: -c.quality_score)
    log.info(f"  {len(clusters)} candidate clusters")

    written, skipped = write_clusters(clusters, output_dir, args.min_quality)
    if clusters:
        write_index(clusters, output_dir)

    log.info(f"\nDone: {written} clusters written, {skipped} skipped → {output_dir}/")


if __name__ == "__main__":
    main()
