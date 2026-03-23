#!/usr/bin/env python3
"""
Radiology Differential Cluster Extractor
Stage 1 of 2: Marker PDF → Structured Markdown Pipeline

Converts Dähnert's Radiology Review Manual Markdown output (from Marker)
into one clean .md file per radiological finding, optimised for downstream
LLM extraction into comparison tables.

Design philosophy
─────────────────
• Preserve ALL semantic clues: percentages, frequency words ("most common"),
  demographic hints ("in children", "elderly"), distribution descriptors
  ("perihilar", "upper lobes"). The LLM will need these to fill table rows.
• One finding per file → LLM can focus a single prompt on a single cluster
  without context-window pollution from adjacent sections.
• Standardised headings so the LLM receives a predictable schema every time.
• Quality scoring lets you filter junk before burning API tokens.

Usage
─────
  # Full pipeline (see run_pipeline.sh for Marker step)
  python extract_clusters.py marker_output/dahnert.md -o processed_clusters/
  python extract_clusters.py marker_output/ -o processed_clusters/ --min-quality 0.35
"""

from __future__ import annotations

import argparse
import hashlib
import logging
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────────
# LOGGING
# ──────────────────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# DATA MODELS
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class BulletItem:
    """
    A single differential diagnosis entry.

    `level` 0 = top-level differential, 1 = sub-bullet qualifier, etc.
    Preserving sub-bullets matters because they often carry discriminating
    detail, e.g.:
        - Pulmonary oedema        ← level 0
            - cardiogenic (most common)   ← level 1 (frequency clue!)
            - non-cardiogenic (ARDS)      ← level 1
    """
    text: str
    level: int = 0
    children: list[BulletItem] = field(default_factory=list)

    # ── Semantic detection helpers ────────────────────────────────────────────

    _PCT_RE = re.compile(r"\d+\s*%")
    _FREQ_WORDS = frozenset({
        "most common", "common", "uncommon", "rare", "frequent", "classic",
        "occasionally", "usually", "often", "typical", "majority", "minority",
        "predominant", "universal", "almost always", "nearly always",
    })

    def has_percentage(self) -> bool:
        return bool(self._PCT_RE.search(self.text))

    def has_frequency_indicator(self) -> bool:
        lower = self.text.lower()
        return any(w in lower for w in self._FREQ_WORDS)

    def has_demographic(self) -> bool:
        """
        Demographic clues populate the 'Demographics / clinical context'
        row of the extraction table.
        """
        _DEMO = re.compile(
            r"\b(child(?:ren)?|infant|neonate|adult|elderly|male|female|"
            r"men|women|young|middle.aged|hiv|immunocompromised|pregnant)\b",
            re.IGNORECASE,
        )
        return bool(_DEMO.search(self.text))

    def has_distribution(self) -> bool:
        """
        Distribution clues populate the 'Distribution / location' row.
        """
        _DIST = re.compile(
            r"\b(upper lobe|lower lobe|bilateral|unilateral|perihilar|"
            r"peripheral|central|basal|apical|anterior|posterior|"
            r"mediastinal|hilar|pleural|cortical|medullary|diaphyseal|"
            r"metaphyseal|epiphyseal|intra-?articular|para-?spinal)\b",
            re.IGNORECASE,
        )
        return bool(_DIST.search(self.text))


@dataclass
class DiseaseEntry:
    """
    Structured representation of a Dahnert ALL_CAPS disease-entry section.

    Captures imaging findings organised by modality (CT, MR, US, X-ray, etc.),
    demographics, histology, and clinical outcomes.  Used in Stage 2 to
    generate per-disease feature summaries and cross-reference with DDx tables.
    """
    name: str
    parent_section: str = ""
    definition: str = ""
    demographics: dict[str, str] = field(default_factory=dict)
    findings_by_modality: dict[str, list[str]] = field(default_factory=dict)
    general_findings: list[str] = field(default_factory=list)
    organ_sections: dict[str, list[str]] = field(default_factory=dict)
    clinical: dict[str, str] = field(default_factory=dict)
    source_line: int = 0

    @property
    def slug(self) -> str:
        return slugify(self.name)

    @property
    def total_findings(self) -> int:
        n = len(self.general_findings)
        for v in self.findings_by_modality.values():
            n += len(v)
        for v in self.organ_sections.values():
            n += len(v)
        return n


@dataclass
class DifferentialCluster:
    """
    Core unit of the pipeline: one radiological finding + its differential list.

    Will later be converted by the LLM into a comparison table:
    ┌─────────────────────┬────────────┬────────────┬────────────┐
    │ Feature             │ Dx A       │ Dx B       │ Dx C       │
    ├─────────────────────┼────────────┼────────────┼────────────┤
    │ Dominant finding    │ ...        │ ...        │ ...        │
    │ Demographics        │ ...        │ ...        │ ...        │
    │ Distribution        │ ...        │ ...        │ ...        │
    │ Discriminator       │ ...        │ ...        │ ...        │
    │ Frequency           │ ...        │ ...        │ ...        │
    └─────────────────────┴────────────┴────────────┴────────────┘
    """
    heading: str
    heading_level: int
    differentials: list[BulletItem] = field(default_factory=list)
    context_text: str = ""       # Paragraph(s) surrounding the list
    parent_section: str = ""     # Chapter-level heading (e.g. "Chest")
    quality_score: float = 0.0
    source_line: int = 0

    @property
    def slug(self) -> str:
        return slugify(self.heading)

    @property
    def differential_count(self) -> int:
        return len(self.differentials)

    @property
    def has_rich_annotations(self) -> bool:
        return any(
            d.has_percentage() or d.has_frequency_indicator()
            for d in self.differentials
        )


# ──────────────────────────────────────────────────────────────────────────────
# TEXT CLEANING
# ──────────────────────────────────────────────────────────────────────────────

# OCR ligature artifacts common in scanned medical PDFs
_LIGATURE_MAP = {
    "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl",
    "ﬅ": "st", "ﬆ": "st",
    "\u2013": "-",   # en-dash
    "\u2014": "-",   # em-dash
    "\u00ad": "",    # soft hyphen (OCR artifact)
    "\u2019": "'",   # right single quotation
    "\u201c": '"', "\u201d": '"',  # curly quotes
}

_PAGE_NUMBER_RE = re.compile(r"^\s*\d{1,4}\s*$", re.MULTILINE)
_RUNNING_HEADER_RE = re.compile(
    r"^(Radiology Review Manual|D[aä]hnert|RADIOLOGY|Chapter \d+)\s*$",
    re.MULTILINE | re.IGNORECASE,
)
_HORIZONTAL_RULE_RE = re.compile(r"^\s*[-_=]{3,}\s*$", re.MULTILINE)
_MULTI_BLANK_RE = re.compile(r"\n{3,}")

_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$")
# Matches: "- item", "* item", "1. item", "1)  item", "(a) item", "A. item"
_BULLET_RE = re.compile(
    r"^(\s*)(?:[-*]|(?:\d+|[a-zA-Z])[\.\)]|[\(\[]\d+[\)\]])\s+(.+)$"
)
_SENTENCE_END_RE = re.compile(r"[.!?:;]\s*$")
_BULLET_START_RE = re.compile(
    r"^\s*([-•*•◦▪▸▹►√\u221a]|(?:\d+|[a-zA-Z])[\.\)]|[\(\[]\d+[\)\]])\s"
)


def _fix_ligatures(text: str) -> str:
    for bad, good in _LIGATURE_MAP.items():
        text = text.replace(bad, good)
    return unicodedata.normalize("NFC", text)


def _clean_heading(text: str) -> str:
    """
    Normalise a heading string:
    - Strip orphaned trailing/leading parentheses from PDF line-split artifacts
      e.g. "opacity)" → skip (caught by uppercase check), but "Findings (" → "Findings"
    - Collapse internal whitespace
    - Strip Dahnert page-cross markers like "=  " at start
    """
    # Remove leading "= " or "=  " (Dahnert uses "= definition" style)
    text = re.sub(r"^=\s+", "", text)
    # Strip trailing orphaned open/close paren left by line splits
    text = re.sub(r"\s*[\(\)]\s*$", "", text)
    # Collapse whitespace
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


def _remove_noise(text: str) -> str:
    """Strip page numbers, running headers, horizontal rules."""
    text = _PAGE_NUMBER_RE.sub("", text)
    text = _RUNNING_HEADER_RE.sub("", text)
    text = _HORIZONTAL_RULE_RE.sub("", text)
    text = _MULTI_BLANK_RE.sub("\n\n", text)
    return text.strip()


def _fix_broken_bullets(text: str) -> str:
    """
    Marker can split a bullet mid-sentence if the original PDF had a hard
    line-break inside a list item. We detect continuation lines and rejoin.

    Example fix:
        - Pulmonary embolism with infarction in anticoagulated
          patients (rare)
    → - Pulmonary embolism with infarction in anticoagulated patients (rare)

    Critical guard: do NOT join if the next line starts with an uppercase letter
    and is short (≤80 chars) — that signals a new heading or diagnosis name, not
    a continuation. This prevents "5. Thyroid carcinoma" + "Endobronchial Metastasis"
    from being merged into one mangled bullet.
    """
    lines = text.split("\n")
    out: list[str] = []
    for line in lines:
        stripped = line.strip()
        is_continuation = (
            out
            and stripped
            and not _BULLET_START_RE.match(line)
            and not _HEADING_RE.match(line)
            and not _SENTENCE_END_RE.search(out[-1])
            and _BULLET_RE.match(out[-1])
            # Guard: uppercase start + short = likely a new item/heading, not continuation
            and not (stripped[0].isupper() and len(stripped) <= 80)
            # Guard: lowercase start strongly suggests genuine continuation
        )
        if is_continuation:
            out[-1] = out[-1].rstrip() + " " + stripped
        else:
            out.append(line)
    return "\n".join(out)


def _normalise_bullets(text: str) -> str:
    """Collapse all bullet variants (•, ◦, ▪, ▸) → '-', preserving indent."""
    return re.sub(r"^(\s*)[•◦▪▸▹►]\s+", r"\1- ", text, flags=re.MULTILINE)


# ── Mnemonic expansion ────────────────────────────────────────────────────────
# Matches "mnemonic:  WORD" or "mnemonic:  WORD1 WORD2" (all-caps tokens only)
# We skip complex forms like "5 M'S To PROoF" (numbers + apostrophes make them
# ambiguous — letter count is unclear and verification would be unreliable).
_MNEMONIC_LINE_RE = re.compile(
    r"^mnemonic:\s+([A-Z][A-Z\s]{1,40})$",
    re.IGNORECASE,
)


def _expand_mnemonics(text: str) -> str:
    """
    Convert Dahnert mnemonic blocks into standard bullet lists.

    Before:
        mnemonic:   ROWE
        Rhabdomyosarcoma
        Osteosarcoma
        Wilms tumor
        Ewing sarcoma

    After:
        - Rhabdomyosarcoma
        - Osteosarcoma
        - Wilms tumor
        - Ewing sarcoma

    Algorithm:
    1. Find a `mnemonic: WORD` line where WORD is purely alphabetic+spaces (all-caps).
    2. Count only the alpha characters across all tokens → N items expected.
    3. Collect the next N non-empty lines.
    4. Verify ≥ 50% of items start with the corresponding mnemonic letter.
       (Loose threshold because some items cover two letters, e.g. "Fibrous dysplasia,
        Fibrous cortical defect" for "F" in FOGMACHINES.)
    5. On success, emit `- item` lines.  On failure, leave the block as-is so
       downstream code can still try to handle it.
    """
    lines = text.split("\n")
    out: list[str] = []
    i = 0

    while i < len(lines):
        line = lines[i]
        m = _MNEMONIC_LINE_RE.match(line.strip())

        if m:
            mnemonic_str = m.group(1).strip().upper()
            # Only alphabetic characters count toward item slots
            letters = [c for c in mnemonic_str if c.isalpha()]
            n = len(letters)

            if n >= 2:
                # Collect next n non-empty lines
                items: list[str] = []
                j = i + 1
                while j < len(lines) and len(items) < n:
                    candidate = lines[j].strip()
                    if candidate:
                        items.append(candidate)
                    j += 1

                if len(items) == n:
                    # Verify first-letter correspondence (≥ 50% match)
                    matches = sum(
                        1 for k, item in enumerate(items)
                        if item and item[0].upper() == letters[k]
                    )
                    if matches >= n * 0.5:
                        # Successful expansion — emit as bullets
                        for item in items:
                            out.append(f"- {item}")
                        i = j
                        continue

        out.append(line)
        i += 1

    return "\n".join(out)


def clean_markdown(text: str) -> str:
    """Full cleaning pipeline applied to raw Marker output."""
    text = _fix_ligatures(text)
    text = _remove_noise(text)
    text = _expand_mnemonics(text)   # before bullet fixing so items get normalised
    text = _fix_broken_bullets(text)
    text = _normalise_bullets(text)
    return text


# ──────────────────────────────────────────────────────────────────────────────
# PARSING
# ──────────────────────────────────────────────────────────────────────────────

def _parse_bullet_items(lines: list[str], start: int) -> tuple[list[BulletItem], int]:
    """
    Parse a run of bullet lines beginning at index `start`.
    Returns (items, next_index_after_bullets).

    Indentation determines hierarchy:
      0 spaces  → level 0 (top-level differential)
      2-4 spaces → level 1 (qualifier / sub-differential)
      etc.

    Why preserve sub-bullets?
    LLM needs them to fill the 'Other associated findings' and
    'Discriminating feature' rows — they are often the most informative text.
    """
    items: list[BulletItem] = []
    i = start

    while i < len(lines):
        m = _BULLET_RE.match(lines[i])
        if not m:
            break
        indent = len(m.group(1))
        level = indent // 2   # Every 2 spaces = one indent level
        item = BulletItem(text=m.group(2).strip(), level=level)

        if level > 0 and items:
            # Attach to nearest shallower ancestor
            parent = items[-1]
            while parent.children and parent.children[-1].level < level - 1:
                parent = parent.children[-1]
            parent.children.append(item)
        else:
            items.append(item)

        i += 1

    return items, i


_IMPLICIT_HEADING_RE = re.compile(
    # Short line not starting with a bullet/number/special char.
    # We check uppercase start separately.
    r"^(?![\-*•\d\(√])(.{5,100})$"
)
_NEXT_IS_LIST_RE = re.compile(
    r"^\s*(?:[-*•]|(?:\d+|[a-zA-Z])[\.\)]|[A-Z]\.)\s+"
)
# Dahnert uses "mnemonic:", "Frequency:", "CT:", "√" as body text markers —
# lines starting with these are NOT headings even if they look like one.
_BODY_LINE_RE = re.compile(
    r"^(mnemonic|frequency|histo|location|note|n\.b\.|cave|ddx|ct:|mr:|us:|nuc:|pет:|"
    r"age:|peak:|sex:|prevalence:|incidence:|prognosis:)",
    re.IGNORECASE,
)


def _is_title_case_phrase(text: str) -> bool:
    """
    True if text looks like a Title Case heading.
    e.g. "Endobronchial Metastasis", "Cavitating Lung Metastases"
    Ignores short connector words (of, in, with, the, a, an, and, or).
    """
    STOP = frozenset({"of", "in", "with", "the", "a", "an", "and", "or",
                      "to", "by", "for", "at", "on", "from", "during"})
    words = text.split()
    if len(words) < 2:
        return False
    content_words = [w for w in words if w.lower() not in STOP and w.isalpha() and len(w) > 1]
    if not content_words:
        return False
    cap = sum(1 for w in content_words if w[0].isupper())
    return cap >= len(content_words) * 0.75


def _is_implicit_heading(line: str, next_lines: list[str], prev_line: str = "") -> bool:
    """
    Heuristic: plain-text line that acts as a differential-cluster heading,
    i.e. was not marked with '#' by Marker/PyMuPDF (same font as body text).

    Catches:
        "Bilateral Hilar Lymphnode Enlargement"  → "1. Sarcoidosis (75%)..."
        "Endobronchial Metastasis"               → "1. Bronchogenic carcinoma..."
        "Cavitating Lung Metastases"             → "1. Squamous cell carcinoma..."

    Rejects:
        "opacity)"          ← lowercase start, continuation of prev line
        "CT:  findings..."  ← body annotation marker
        "mnemonic: ROWE"    ← mnemonic line
        "/ chemotherapy"    ← continuation from split line
    """
    m = _IMPLICIT_HEADING_RE.match(line)
    if not m:
        return False

    text = m.group(1).strip()

    # 1. Must start with an uppercase letter — rejects "opacity)", "/ chemo"
    if not text or not text[0].isupper():
        return False

    # 2. Reject known Dahnert body annotation markers
    if _BODY_LINE_RE.match(text):
        return False

    # 3. Must not end like a fragment that continues onto next line
    if re.search(r"[,;:=\[\(]\s*$", text):
        return False

    # 4. Reject if previous line ended mid-sentence without terminal punctuation
    #    (means the current line is a continuation, e.g. "ground-glass\n" → "opacity)")
    prev = prev_line.strip()
    if prev and not re.search(r"[.!?]\s*$", prev):
        # Previous line is non-empty and didn't end with terminal punctuation.
        # If previous line itself looks like a heading or list item, OK to proceed.
        # Otherwise this line is likely a continuation.
        if not (_HEADING_RE.match(prev) or _BULLET_RE.match(prev) or _NEXT_IS_LIST_RE.match(prev)):
            # Allow if this line is clearly Title Case AND has a radiology keyword
            # (strong signal even when prev line is mid-sentence)
            if not (_is_title_case_phrase(text) and _is_radiology_heading(text)):
                return False

    # 5. Must be Title Case OR contain a radiology keyword OR match Dahnert pattern
    if not (
        _is_title_case_phrase(text)
        or _is_radiology_heading(text)
        or any(p.search(text) for p in _DAHNERT_PATTERNS)
    ):
        return False

    # 6. Must be followed by a list item within next 4 non-blank lines
    seen = 0
    for nl in next_lines:
        if not nl.strip():
            continue
        if _NEXT_IS_LIST_RE.match(nl):
            return True
        # A non-list, non-blank line intervening → probably not a heading
        seen += 1
        if seen >= 4:
            break

    return False


def _parse_sections(text: str) -> list[dict]:
    """
    Split cleaned Markdown into a flat list of section dicts:
    {
        'heading': str,
        'heading_level': int,
        'line': int,         # line number in source (for debugging)
        'body_lines': list[str],
    }

    Detects two types of headings:
    1. Explicit: lines starting with '#' (from Marker / extract_direct.py)
    2. Implicit: plain-text finding-level headings followed by a list
       (e.g. "Bilateral Hilar Lymphnode Enlargement" → "1. Sarcoidosis...")
    """
    lines = text.split("\n")
    sections: list[dict] = []
    current: dict | None = None

    for i, line in enumerate(lines):
        prev_line = lines[i - 1] if i > 0 else ""

        # ── Explicit Markdown heading ──────────────────────────────────────
        m = _HEADING_RE.match(line)
        if m:
            if current is not None:
                sections.append(current)
            current = {
                "heading": _clean_heading(m.group(2).strip()),
                "heading_level": len(m.group(1)),
                "line": i,
                "body_lines": [],
            }
            continue

        # ── Implicit heading (plain-text finding label) ────────────────────
        if line.strip() and _is_implicit_heading(line, lines[i + 1:i + 6], prev_line):
            if current is not None:
                sections.append(current)
            current = {
                "heading": _clean_heading(line.strip()),
                "heading_level": 3,
                "line": i,
                "body_lines": [],
            }
            continue

        # ── Body line ──────────────────────────────────────────────────────
        if current is not None:
            current["body_lines"].append(line)

    if current is not None:
        sections.append(current)

    return sections


# ──────────────────────────────────────────────────────────────────────────────
# CLUSTER DETECTION
# ──────────────────────────────────────────────────────────────────────────────

_MIN_DIFFERENTIALS = 3   # Fewer than this → not a useful cluster

# Keywords that strongly indicate a radiological finding heading.
# Broad enough to catch Dahnert sub-headings like "Endobronchial Metastasis",
# "Cavitating Lung Metastases", "Hemorrhagic Lung Metastases", etc.
_RADIOLOGY_KEYWORDS = frozenset({
    # Imaging descriptors
    "opacity", "lucency", "density", "lesion", "mass", "nodule",
    "effusion", "consolidation", "atelectasis", "calcification",
    "enhancement", "signal", "uptake", "defect", "filling",
    "widening", "narrowing", "displacement", "deviation",
    "fracture", "lysis", "sclerosis", "erosion", "destruction",
    "hyperlucent", "hyperdense", "hypodense", "hyperintense", "hypointense",
    "avascular", "cystic", "solid", "bilateral", "unilateral",
    "diffuse", "focal", "multifocal", "pattern", "sign", "appearance",
    "finding", "differential", "cause", "etiology", "aetiology",
    "periosteal", "cortical", "medullary", "intramedullary",
    "pleural", "mediastinal", "hilar", "perihilar",
    "cavitating", "cavitary", "calcified", "enhancing", "necrotic",
    "hemorrhagic", "cystic", "solid", "mixed",
    # Pathology types (common Dahnert sub-heading words)
    "metastasis", "metastases", "metastatic",
    "carcinoma", "sarcoma", "lymphoma", "adenocarcinoma", "melanoma",
    "pneumonia", "infection", "infectious",
    "tumor", "tumour", "neoplasm", "neoplastic",
    "hemorrhage", "haemorrhage", "infarction", "ischemia", "ischaemia",
    "edema", "oedema", "fibrosis", "obstruction", "occlusion",
    "stenosis", "dilation", "dilatation", "aneurysm",
    "thrombosis", "embolism", "embolus",
    "abscess", "empyema", "fistula", "cyst",
    "hypertension", "hypertrophy",
    "congenital", "developmental", "acquired",
    "acute", "chronic", "subacute",
    "benign", "malignant", "primary", "secondary",
    # Anatomical modifiers that appear in Dahnert sub-headings
    "endobronchial", "endoluminal", "intraluminal", "intracranial",
    "pulmonary", "hepatic", "renal", "splenic", "cardiac", "aortic",
    "spinal", "vertebral", "meningeal", "cerebral",
    "subcutaneous", "subpleural", "subdiaphragmatic",
    # Clinical scenario words
    "syndrome", "disease", "disorder", "condition",
    "stridor", "dysphagia", "failure", "collapse",
    "childhood", "children", "infant", "neonatal", "adult", "elderly",
})

# Structural Dahnert-style heading patterns
_DAHNERT_PATTERNS = [
    re.compile(r"causes?\s+of\b", re.IGNORECASE),
    re.compile(r"associated\s+with\b", re.IGNORECASE),
    re.compile(r"\bin\s+(child|infant|neonate|adult|male|female|elderly)", re.IGNORECASE),
    re.compile(r"^(differential|DDx|D/D)\b", re.IGNORECASE),
    re.compile(r"\b(increased|decreased|absent|multiple|single)\b", re.IGNORECASE),
]


def _is_radiology_heading(heading: str) -> bool:
    """
    Heuristic: does this heading describe a radiology finding or differential list?
    Used to filter out table-of-contents lines, author credits, etc.
    """
    lower = heading.lower()
    if any(kw in lower for kw in _RADIOLOGY_KEYWORDS):
        return True
    return any(p.search(heading) for p in _DAHNERT_PATTERNS)


def _looks_like_diagnosis_name(text: str) -> bool:
    """
    True if a plain-text line looks like a bare diagnosis/condition name —
    a Dahnert list item with no bullet/number prefix.

    Medical names frequently DON'T follow strict Title Case:
      "Ewing sarcoma", "Wilms tumor", "Langerhans cell histiocytosis"
    So we only require: starts with uppercase + short + no annotation markers.
    The run detection (≥ MIN_DIFFERENTIALS consecutive) handles false positives.
    """
    if not text or not text[0].isupper():
        return False
    if _BODY_LINE_RE.match(text) or _IMAGING_MARKER_RE.match(text):
        return False
    # Ends with = or : → definition / annotation line, not a diagnosis name
    if re.search(r"[=:]\s*$", text):
        return False
    # Starts with a Dahnert section sub-label like "A.  CONGENITAL"
    if re.match(r"^[A-Z]\.\s+[A-Z]", text):
        return False
    words = text.split()
    # Diagnosis names are short; anything > 8 words is likely a sentence
    return len(words) <= 8


def _extract_bullets_and_context(body_lines: list[str]) -> tuple[list[BulletItem], str]:
    """
    Separate bullet items from paragraph context within a section body.

    Three item sources:
    1. Explicit bullets (-, *, 1., A.) → always captured
    2. Implied list runs: ≥ 3 consecutive bare Title Case short lines
       immediately after the heading, before any context text.
       E.g. the DIATTOM list or plain-text differential lists.
    3. Everything else → context paragraph

    Returns:
        bullets   – flat list of BulletItem (top-level + children)
        context   – concatenated non-bullet paragraph text
    """
    context_parts: list[str] = []
    all_bullets: list[BulletItem] = []
    i = 0

    while i < len(body_lines):
        line = body_lines[i]

        # ── Explicit bullet ────────────────────────────────────────────────
        if _BULLET_RE.match(line):
            bullets, i = _parse_bullet_items(body_lines, i)
            all_bullets.extend(bullets)
            continue

        stripped = line.strip()

        # ── Implied list run detection ─────────────────────────────────────
        # Only look for bare-text lists before we've accumulated context,
        # or immediately after an explicit bullet run (Dahnert sometimes
        # mixes explicit + implicit items).
        if stripped and _looks_like_diagnosis_name(stripped):
            # Peek ahead: collect the run of similar lines
            run = [stripped]
            j = i + 1
            while j < len(body_lines):
                nxt = body_lines[j].strip()
                if not nxt:       # blank line ends the run
                    break
                if _BULLET_RE.match(body_lines[j]):  # explicit bullet follows
                    break
                if _looks_like_diagnosis_name(nxt):
                    run.append(nxt)
                    j += 1
                else:
                    break         # non-matching line ends the run

            if len(run) >= _MIN_DIFFERENTIALS:
                # Treat run as implied bullet items
                all_bullets.extend(BulletItem(text=t) for t in run)
                i = j
                continue

        # ── Context paragraph ──────────────────────────────────────────────
        if stripped:
            context_parts.append(stripped)
        i += 1

    return all_bullets, " ".join(context_parts)


_IMAGING_MARKER_RE = re.compile(
    r"^(√|\u221a|MR\b|CT\b|NUC\b|US\b|X-?ray\b|PET\b|DDx\b|Cause:|Location:|"
    r"Histo:|Age:|Frequency:|Prognosis:|Note:|N\.B\.:)",
    re.IGNORECASE,
)
_MEAN_BULLET_CHAR_LIMIT = 90    # avg chars → feature list
_MAX_BULLET_CHAR_LIMIT = 250    # any single bullet this long → likely run-on


def _bullets_look_like_differentials(bullets: list[BulletItem]) -> bool:
    """
    Dahnert uses bullet-lists for TWO different purposes:
    A) True differential lists — short, one condition per bullet
       e.g. "- Sarcoidosis (most common cause, 90% have hilar disease)"
    B) Feature lists for a single disease — long, imaging-marker prefixed
       e.g. "- √  cortical thinning ← medullary pressure"

    We want A, not B.
    """
    if not bullets:
        return False

    top_level = [b for b in bullets if b.level == 0]
    if not top_level:
        return False

    # Reject if most items start with imaging annotation markers
    imaging_count = sum(1 for b in top_level if _IMAGING_MARKER_RE.match(b.text))
    if imaging_count / len(top_level) > 0.35:
        return False

    # Reject if mean bullet length is very high (detailed single-disease descriptions)
    mean_len = sum(len(b.text) for b in top_level) / len(top_level)
    if mean_len > _MEAN_BULLET_CHAR_LIMIT:
        return False

    # Reject if a majority of items are individually very long (run-on sentences)
    long_count = sum(1 for b in top_level if len(b.text) > _MAX_BULLET_CHAR_LIMIT)
    if long_count / len(top_level) > 0.4:
        return False

    return True


def _is_disease_entry_heading(heading: str) -> bool:
    """
    In Dahnert, ALL_CAPS headings are disease-specific entries
    (e.g. AVASCULAR NECROSIS, SARCOIDOSIS). These list imaging FEATURES
    of that one condition, not a differential. We skip them.
    Mixed-case headings are finding/pattern entries (what we want).
    """
    # If the heading has ≥ 3 words and they're all uppercase → disease entry
    words = heading.split()
    uppercase_words = sum(1 for w in words if w.isupper() and len(w) > 2)
    return len(words) >= 2 and uppercase_words >= len(words) * 0.7


def _score_cluster(cluster: DifferentialCluster) -> float:
    """
    Quality score [0.0, 1.0] — higher = more useful for LLM extraction.

    Weights:
        0.40  differential count (sweet spot 4-12 for radiology)
        0.30  radiology-specific heading
        0.20  rich semantic annotations (%, frequency words)
        0.10  has supporting context paragraph
       -1.0  disease entry heading (ALL_CAPS) → effectively zero

    Rationale: we burn API credits in Stage 2, so filtering low-quality
    clusters here avoids wasted calls and noisy output tables.
    """
    # Disease-specific entries (AVASCULAR NECROSIS, etc.) are not useful clusters
    if _is_disease_entry_heading(cluster.heading):
        return 0.0

    # Bullet list that looks like imaging features, not differentials
    if not _bullets_look_like_differentials(cluster.differentials):
        return 0.0

    score = 0.0

    n = cluster.differential_count
    if n >= _MIN_DIFFERENTIALS:
        score += min(n / 12.0, 1.0) * 0.40

    if _is_radiology_heading(cluster.heading):
        score += 0.30

    if cluster.has_rich_annotations:
        score += 0.20

    if cluster.context_text:
        score += 0.10

    return round(min(score, 1.0), 3)


# Patterns that indicate a CHAPTER/SYSTEM heading (not a finding cluster)
_CHAPTER_HEADING_RE = re.compile(
    r"^(DIFFERENTIAL DIAGNOSIS OF|.* SYSTEM$|.* DISORDERS$|"
    r"TREATMENT OF|PRINCIPLES OF|ABBREVIATIONS|PREFACE|CONTENTS|"
    r"UNIVERSAL DIFFERENTIAL|DIAGNOSTIC GAMUT)",
    re.IGNORECASE,
)

_CHAPTER_SYSTEMS = frozenset({
    "musculoskeletal", "chest", "cardiovascular", "gastrointestinal",
    "genitourinary", "neuro", "head", "neck", "breast", "nuclear",
    "pediatric", "interventional", "ultrasound", "mammograph",
})


def _is_chapter_heading(heading: str) -> bool:
    """
    Is this heading a chapter/system title rather than a finding?

    Dahnert chapter headings are typically:
    - Very short ALL-CAPS system names ("MUSCULOSKELETAL SYSTEM")
    - "DIFFERENTIAL DIAGNOSIS OF X" section titles
    - "TREATMENT OF..." sections
    """
    if _CHAPTER_HEADING_RE.match(heading):
        return True
    lower = heading.lower()
    # Short system names: "CHEST", "NEURO", "CARDIOVASCULAR"
    words = heading.split()
    if len(words) <= 2 and any(s in lower for s in _CHAPTER_SYSTEMS):
        return True
    return False


def detect_clusters(sections: list[dict]) -> list[DifferentialCluster]:
    """
    Walk sections in order, tracking chapter-level headings as `parent_section`
    for subdirectory organisation, and treating headings followed by bullet
    lists as differential clusters.

    Since Marker / PyMuPDF often flatten all headings to the same `#` level,
    we distinguish chapters from finding-clusters by content, not by `#` depth:
    - Chapter headings: short system names, "DIFFERENTIAL DIAGNOSIS OF X" etc.
      → update current_parent, skip
    - Finding headings with < MIN_DIFFERENTIALS bullets → skip (log debug)
    - Finding headings with ≥ MIN_DIFFERENTIALS bullets → candidate cluster
    """
    clusters: list[DifferentialCluster] = []
    current_parent = ""

    for sec in sections:
        level = sec["heading_level"]
        heading = sec["heading"]

        # Explicit level-1 headings are ALWAYS top-level (title page etc.)
        if level == 1:
            current_parent = heading
            continue

        # Chapter/system headings (regardless of # level)
        if _is_chapter_heading(heading):
            current_parent = heading
            log.debug(f"Chapter: {heading!r}")
            continue

        bullets, context = _extract_bullets_and_context(sec["body_lines"])

        if len(bullets) < _MIN_DIFFERENTIALS:
            # Still update parent if heading has no radiology content
            # (sub-chapter title with sub-sections below it)
            if not _is_radiology_heading(heading):
                current_parent = heading
            log.debug(f"Skip (bullets={len(bullets)}): {heading!r}")
            continue

        cluster = DifferentialCluster(
            heading=heading,
            heading_level=level,
            differentials=bullets,
            context_text=context[:600],
            parent_section=current_parent,
            source_line=sec["line"],
        )
        cluster.quality_score = _score_cluster(cluster)
        clusters.append(cluster)

    return clusters


# ──────────────────────────────────────────────────────────────────────────────
# OUTPUT RENDERING
# ──────────────────────────────────────────────────────────────────────────────

def slugify(text: str, max_len: int = 80) -> str:
    """
    'Ground glass opacity (GGO)' → 'ground_glass_opacity_ggo'

    Safe for use as a filename on Linux, macOS, and Windows.
    """
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s-]+", "_", text).strip("_")
    return text[:max_len]


def _render_bullet(item: BulletItem, depth: int = 0) -> str:
    indent = "  " * depth
    line = f"{indent}- {item.text}"
    children_md = "\n".join(_render_bullet(c, depth + 1) for c in item.children)
    return f"{line}\n{children_md}" if children_md else line


def render_cluster(cluster: DifferentialCluster) -> str:
    """
    Produce clean, LLM-ready Markdown for a single cluster.

    Schema chosen to maximise extraction accuracy:
    ─────────────────────────────────────────────
    # Finding: <heading>                      ← LLM extracts finding name from here
    **Source section:** <chapter>             ← provenance
    **Quality score:** <float>                ← pipeline metadata

    ## Differentials                          ← LLM targets this section exactly
    - Diagnosis A (most common, 70%)          ← frequency → 'Relative frequency' row
    - Diagnosis B                             ← demographics preserved inline
      - in children: X                        ← sub-bullet discriminators preserved
    - Diagnosis C

    ## Context                                ← optional, LLM uses for demographics/
    <paragraph text>                             distribution rows if bullets lack detail

    <!-- LLM instructions embedded as HTML comments (invisible in rendered MD) -->
    """
    lines: list[str] = [
        f"# Finding: {cluster.heading}",
        "",
        f"**Source section:** {cluster.parent_section}",
        f"**Quality score:** {cluster.quality_score}",
        f"**Differential count:** {cluster.differential_count}",
        "",
        "## Differentials",
        "",
    ]

    for item in cluster.differentials:
        lines.append(_render_bullet(item))

    if cluster.context_text:
        lines += [
            "",
            "## Context",
            "",
            cluster.context_text,
        ]

    # Embedded LLM instructions — these appear as comments in raw Markdown
    # and help the Stage 2 prompt stay consistent without bloating each file.
    lines += [
        "",
        "---",
        "<!--",
        "  LLM EXTRACTION INSTRUCTIONS (Stage 2):",
        "  1. Convert ## Differentials into a comparison table.",
        "  2. Columns = each differential diagnosis.",
        "  3. Rows = Dominant finding | Demographics | Distribution |",
        "            Key discriminator | Other findings | Relative frequency.",
        "  4. Preserve any percentages or 'most common/rare' qualifiers.",
        "  5. Use ## Context paragraph for additional demographic / distribution clues.",
        "-->",
    ]

    return "\n".join(lines) + "\n"


# ──────────────────────────────────────────────────────────────────────────────
# FILE OUTPUT
# ──────────────────────────────────────────────────────────────────────────────

def _section_subdir(parent_section: str) -> str:
    return slugify(parent_section) or "uncategorised"


def _resolve_slug_conflicts(clusters: list[DifferentialCluster]) -> dict[int, str]:
    """
    If two clusters share the same slug (e.g. same heading in two chapters),
    append an incrementing suffix to keep filenames unique.
    """
    seen: dict[str, int] = {}
    result: dict[int, str] = {}
    for c in clusters:
        slug = c.slug
        if slug in seen:
            seen[slug] += 1
            result[id(c)] = f"{slug}_{seen[slug]}"
        else:
            seen[slug] = 0
            result[id(c)] = slug
    return result


def write_clusters(
    clusters: list[DifferentialCluster],
    output_dir: Path,
    min_quality: float = 0.3,
) -> tuple[int, int]:
    """
    Write one .md file per cluster.  Files are organised into subdirectories
    named after the parent section (chapter) for easy browsing.

    Returns (written, skipped).
    """
    slug_map = _resolve_slug_conflicts(clusters)
    written = skipped = 0

    for cluster in clusters:
        if cluster.quality_score < min_quality:
            log.debug(f"Skip low-quality ({cluster.quality_score}): {cluster.heading!r}")
            skipped += 1
            continue

        subdir = output_dir / _section_subdir(cluster.parent_section)
        subdir.mkdir(parents=True, exist_ok=True)

        slug = slug_map[id(cluster)]
        out_path = subdir / f"{slug}.md"

        # Collision guard (shouldn't happen after slug dedup, but be safe)
        if out_path.exists():
            h = hashlib.md5(cluster.heading.encode()).hexdigest()[:6]
            out_path = subdir / f"{slug}_{h}.md"

        out_path.write_text(render_cluster(cluster), encoding="utf-8")
        log.info(f"  ✓ {out_path.relative_to(output_dir)}")
        written += 1

    return written, skipped


def write_index(clusters: list[DifferentialCluster], output_dir: Path) -> None:
    """Write index.md: a human-readable manifest grouped by section and sorted by score."""
    by_section: dict[str, list[DifferentialCluster]] = {}
    for c in clusters:
        key = c.parent_section or "Uncategorised"
        by_section.setdefault(key, []).append(c)

    lines = [
        "# Differential Cluster Index",
        "",
        f"**Total clusters extracted:** {len(clusters)}",
        "",
    ]
    for section in sorted(by_section):
        items = sorted(by_section[section], key=lambda c: -c.quality_score)
        lines += [f"## {section}", ""]
        for c in items:
            slug = slugify(c.heading)
            subdir = _section_subdir(c.parent_section)
            lines.append(
                f"- [{c.heading}]({subdir}/{slug}.md) "
                f"— {c.differential_count} dx, score={c.quality_score}"
            )
        lines.append("")

    (output_dir / "index.md").write_text("\n".join(lines), encoding="utf-8")
    log.info("  ✓ index.md")


# ──────────────────────────────────────────────────────────────────────────────
# INLINE DDx EXTRACTOR
# ──────────────────────────────────────────────────────────────────────────────
# Dahnert embeds 1,367 "DDx: A, B, C" lines inside disease-entry sections.
# These are invisible to detect_clusters() because the entire disease entry
# is filtered out (ALL_CAPS heading + imaging-marker bullets).
# This extractor scans ALL lines for DDx patterns and creates clusters
# with the surrounding context as the heading.
#
# Example (from LANGERHANS CELL HISTIOCYTOSIS):
#   @   Lung (~10%)
#   √  centrilobular micronodules
#   Distribution:   bilateral symmetric upper- to mid-lung
#   DDx:   metastases, miliary tuberculosis, sarcoidosis, silicosis
#
# → Cluster heading: "LCH — Lung: centrilobular micronodules (DDx)"
# → Differentials:   metastases | miliary tuberculosis | sarcoidosis | silicosis
# → Context:         all the √ lines above it

_DDX_LINE_RE = re.compile(
    r"^DDx(?:\s+for\s+[^:]+)?:\s+(.+)$",
    re.IGNORECASE,
)
_ORGAN_ANCHOR_RE = re.compile(
    r"^@\s+(.+?)(?:\s*[\(\[][\d~<>%]+[\)\]])?\s*$"
)
_DISEASE_HEADING_RE = re.compile(r"^###\s+([A-Z][A-Z\s/\-,\(\)]{3,})$")


def _ddx_quality(n_items: int, has_context: bool) -> float:
    """
    Dedicated quality scorer for inline DDx clusters.
    The generic _score_cluster() is calibrated for heading→list clusters and
    penalises small counts. Inline DDx entries are always intentional, so we
    score purely on richness.
    """
    if n_items >= 6:
        score = 0.80
    elif n_items >= 4:
        score = 0.65
    elif n_items >= 3:
        score = 0.50
    else:  # 2 items — Dahnert often gives exactly 2 key differentials
        score = 0.40
    if has_context:
        score += 0.10
    return round(min(score, 1.0), 3)


def extract_inline_ddx(text: str, current_disease: str = "") -> list[DifferentialCluster]:
    """
    Scan cleaned Markdown line-by-line for embedded DDx annotations and
    convert each into a DifferentialCluster.

    Handles:
    - "DDx:  A, B, C"               — standard
    - "DDx for single lesion:  A, B" — site-qualified
    - DDx lines split across page breaks (joins next non-empty line if the
      DDx value ends without terminal punctuation mid-item)
    """
    lines = text.split("\n")
    clusters: list[DifferentialCluster] = []
    current_disease_name = current_disease
    current_organ = ""

    for i, line in enumerate(lines):
        # Track which disease entry we're inside
        dm = _DISEASE_HEADING_RE.match(line)
        if dm:
            current_disease_name = dm.group(1).strip().title()
            current_organ = ""
            continue

        # Track organ-level anchors (@  Bone, @  Lung, @  CNS)
        om = _ORGAN_ANCHOR_RE.match(line.strip())
        if om:
            current_organ = om.group(1).strip()
            continue

        # Look for DDx line
        ddx_m = _DDX_LINE_RE.match(line.strip())
        if not ddx_m:
            continue

        raw_ddx = ddx_m.group(1).strip()

        # Join continuation line if the DDx value was split across a page break
        # e.g. "...unicameral cyst, aneurysmal\n" + "bone cyst"
        if not re.search(r"[.)\]]\s*$", raw_ddx) and i + 1 < len(lines):
            # look for a short continuation line (not a heading, not a bullet)
            next_stripped = lines[i + 1].strip()
            if (next_stripped
                    and len(next_stripped) < 60
                    and not _HEADING_RE.match(lines[i + 1])
                    and not _BULLET_RE.match(lines[i + 1])
                    and not _DDX_LINE_RE.match(next_stripped)
                    and not next_stripped[0].isupper()):
                raw_ddx = raw_ddx.rstrip() + " " + next_stripped

        # Parse comma-separated differentials
        # Handle numbered: "(1) X (2) Y" and plain: "X, Y, Z"
        if re.search(r"\(\d+\)", raw_ddx):
            items = re.split(r"\s*\(\d+\)\s*", raw_ddx)
        else:
            items = re.split(r",\s*", raw_ddx)

        items = [it.strip() for it in items if it.strip() and len(it.strip()) > 2]

        if len(items) < 2:
            continue

        # Look back for a site sub-label (›  Skull:, ›  Vertebral body:)
        site = ""
        for back_line in reversed(lines[max(0, i - 8): i]):
            sl = back_line.strip()
            if re.match(r"^[›>»]", sl):
                site = re.sub(r"^[›>»]\s*", "", sl).rstrip(":")
                break
            if sl.startswith("DDx") or sl.startswith("@"):
                break

        # Collect √ imaging-finding context lines from the lookback window
        context_lines = []
        for back_line in lines[max(0, i - 12): i]:
            bl = back_line.strip()
            if bl.startswith("√") or bl.startswith("\u221a"):
                context_lines.append(re.sub(r"^[√\u221a]\s*", "", bl))

        # Build a precise heading
        parts = [p for p in [current_disease_name, current_organ, site] if p]
        if not parts:
            continue
        heading = " — ".join(parts) + " (DDx)"

        context = " | ".join(context_lines[-4:]) if context_lines else ""
        differentials = [BulletItem(text=it) for it in items]

        cluster = DifferentialCluster(
            heading=heading,
            heading_level=4,
            differentials=differentials,
            context_text=context,
            parent_section=current_disease_name,
            source_line=i,
        )
        cluster.quality_score = _ddx_quality(len(items), bool(context))
        clusters.append(cluster)

    return clusters


# ──────────────────────────────────────────────────────────────────────────────
# DISEASE ENTRY EXTRACTOR
# ──────────────────────────────────────────────────────────────────────────────
# Dahnert's ALL_CAPS headings are disease-specific entries.  Each entry
# contains imaging features (√ lines) organised by modality (CT, MR, US…),
# demographics (Age, Histo, Incidence), and clinical outcomes (Cx, Prognosis).
#
# Example (PINEOBLASTOMA):
#   ### PINEAL CELL TUMORS
#   =  highly malignant tumor derived from primitive pineal parenchymal cells
#   Age:   any age, most common in first 2 decades; M÷F = 1÷1
#   Incidence: 40% of pineal parenchymal tumors
#   CT:
#   √  poorly marginated iso- / typically hyperdense mass
#   √  intense homogeneous contrast enhancement
#   MR:
#   √  heterogeneous mass iso/hypointense on T1WI
#   Cx:   hemorrhage, necrosis, CSF spread
#   Prognosis: 58% 5-year survival after resection
#
# → disease_entries/pineal_cell_tumors/pineal_cell_tumors.md

_MODALITY_LINE_RE = re.compile(
    r"^(CT|MR|MRI|US|NUC|PET|CXR|HRCT|CECT|NECT|X-?ray|Radiograph(?:y)?|"
    r"Angio(?:graph(?:y)?)?|Fluoroscop(?:y)?|Scintigraph(?:y)?|Mammograph(?:y)?)"
    r"\s*:\s*(.*)$",
    re.IGNORECASE,
)
_DEMO_FIELD_RE = re.compile(
    r"^(Age|Sex|M[÷/]F|Incidence|Prevalence|Frequency|Histo(?:logy)?|"
    r"Path(?:ology)?|Peak(?: age)?|Mean age|Location|Distribution|Size|Stage|"
    r"Epidemiology|Etiology|Aetiology|Associated with|Race|Genetics?)"
    r":\s*(.+)$",
    re.IGNORECASE,
)
_CLINICAL_FIELD_RE = re.compile(
    r"^(Cx|Complication|Prognosis|Spread|Treatment|Rx|Therapy|"
    r"Survival|N\.B\.|Note|Management)"
    r":\s*(.+)$",
    re.IGNORECASE,
)
_DEFINITION_LINE_RE = re.compile(r"^=\s+(.+)$")
_FINDING_SQRT_RE = re.compile(r"^[√\u221a]\s*(.+)$")
_ORGAN_ANCHOR2_RE = re.compile(r"^@\s+(.+?)(?:\s*[\(\[][\d~<>%]+[\)\]])?\s*$")


def _parse_disease_body(
    body_lines: list[str],
) -> tuple[str, dict, dict, list, dict, dict]:
    """
    Parse the body of a disease entry section into structured components.

    Returns:
        definition          str
        demographics        {key: value}
        findings_by_modality {modality: [finding, …]}
        general_findings    [finding, …]  (not under any modality)
        organ_sections      {organ: [finding, …]}
        clinical            {key: value}
    """
    definition_parts: list[str] = []
    demographics: dict[str, str] = {}
    findings_by_modality: dict[str, list[str]] = {}
    general_findings: list[str] = []
    organ_sections: dict[str, list[str]] = {}
    clinical: dict[str, str] = {}
    current_modality: str | None = None
    current_organ: str | None = None

    def _add_finding(text: str) -> None:
        if current_organ and current_modality is None:
            organ_sections.setdefault(current_organ, []).append(text)
        elif current_modality:
            findings_by_modality.setdefault(current_modality, []).append(text)
        else:
            general_findings.append(text)

    for line in body_lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Skip DDx lines — already captured by extract_inline_ddx
        if _DDX_LINE_RE.match(stripped):
            continue

        # Definition line ("= highly malignant tumor …")
        m = _DEFINITION_LINE_RE.match(stripped)
        if m:
            definition_parts.append(m.group(1).strip())
            continue

        # Organ anchor ("@  Bone", "@  Lung (~10%)")
        m = _ORGAN_ANCHOR2_RE.match(stripped)
        if m:
            current_organ = m.group(1).strip()
            current_modality = None
            organ_sections.setdefault(current_organ, [])
            continue

        # Modality header ("CT:", "MR:", "US:", with optional inline content)
        m = _MODALITY_LINE_RE.match(stripped)
        if m:
            raw_mod = m.group(1).upper().replace("-", "")
            modality = "MR" if raw_mod == "MRI" else raw_mod
            current_modality = modality
            inline = m.group(2).strip()
            if inline:
                fm = _FINDING_SQRT_RE.match(inline)
                if fm:
                    _add_finding(fm.group(1).strip())
            continue

        # Demographic field ("Age:", "Histo:", "Incidence:", …)
        m = _DEMO_FIELD_RE.match(stripped)
        if m:
            key, val = m.group(1).strip(), m.group(2).strip()
            if key not in demographics:   # first occurrence wins
                demographics[key] = val
            continue

        # Clinical outcome field ("Cx:", "Prognosis:", "Spread:", …)
        m = _CLINICAL_FIELD_RE.match(stripped)
        if m:
            key, val = m.group(1).strip(), m.group(2).strip()
            if key not in clinical:
                clinical[key] = val
            continue

        # Imaging finding (√ line)
        m = _FINDING_SQRT_RE.match(stripped)
        if m:
            _add_finding(m.group(1).strip())
            continue

        # All other lines (numbered sublists, page annotations) — skip

    return (
        " ".join(definition_parts),
        demographics,
        findings_by_modality,
        general_findings,
        organ_sections,
        clinical,
    )


def extract_disease_entries(text: str) -> list[DiseaseEntry]:
    """
    Scan cleaned Dahnert markdown for ALL_CAPS disease entry sections and
    extract their structured imaging features, demographics, and clinical data.

    Returns one DiseaseEntry per ### ALL_CAPS heading that has body content.
    """
    lines = text.split("\n")
    entries: list[DiseaseEntry] = []
    current_chapter = ""
    current_disease_name = ""
    current_disease_line = 0
    current_body: list[str] = []

    def _flush() -> None:
        nonlocal current_disease_name, current_body
        if not current_disease_name or not current_body:
            current_disease_name = ""
            current_body = []
            return

        definition, demographics, findings_by_modality, general_findings, \
            organ_sections, clinical = _parse_disease_body(current_body)

        entries.append(DiseaseEntry(
            name=current_disease_name,
            parent_section=current_chapter,
            definition=definition,
            demographics=demographics,
            findings_by_modality=findings_by_modality,
            general_findings=general_findings,
            organ_sections=organ_sections,
            clinical=clinical,
            source_line=current_disease_line,
        ))
        current_disease_name = ""
        current_body = []

    for i, line in enumerate(lines):
        m = _HEADING_RE.match(line)
        if m:
            heading_text = _clean_heading(m.group(2).strip())
            if _is_chapter_heading(heading_text):
                _flush()
                current_chapter = heading_text
                continue
            if _is_disease_entry_heading(heading_text):
                _flush()
                current_disease_name = heading_text
                current_disease_line = i
                continue
            # Mixed-case finding-cluster heading — flush any in-progress entry
            _flush()
            continue

        if current_disease_name:
            current_body.append(line)

    _flush()  # capture the last entry
    return entries


def render_disease_entry(entry: DiseaseEntry) -> str:
    """Produce structured, LLM-ready Markdown for a single disease entry."""
    lines: list[str] = [
        f"# Disease: {entry.name}",
        "",
        f"**Source section:** {entry.parent_section}",
        "",
    ]

    if entry.definition:
        lines += ["## Definition", "", entry.definition, ""]

    if entry.demographics:
        lines += ["## Key Facts", ""]
        for key, val in entry.demographics.items():
            lines.append(f"- **{key}:** {val}")
        lines.append("")

    has_imaging = (entry.general_findings or entry.findings_by_modality
                   or entry.organ_sections)
    if has_imaging:
        lines += ["## Imaging Findings", ""]
        if entry.general_findings:
            lines += ["### General", ""]
            for f in entry.general_findings:
                lines.append(f"- {f}")
            lines.append("")
        for modality, findings in entry.findings_by_modality.items():
            if findings:
                lines += [f"### {modality}", ""]
                for f in findings:
                    lines.append(f"- {f}")
                lines.append("")
        for organ, findings in entry.organ_sections.items():
            if findings:
                lines += [f"### {organ}", ""]
                for f in findings:
                    lines.append(f"- {f}")
                lines.append("")

    if entry.clinical:
        lines += ["## Clinical", ""]
        for key, val in entry.clinical.items():
            lines.append(f"- **{key}:** {val}")
        lines.append("")

    lines += [
        "---",
        "<!--",
        "  LLM EXTRACTION INSTRUCTIONS (Stage 2):",
        "  1. Summarize key imaging discriminators for each modality.",
        "  2. Extract demographics (age, sex, incidence) for clinical context.",
        "  3. Note clinical outcomes (Cx, Prognosis) for the complete picture.",
        "  4. Cross-reference processed_clusters/ DDx files for differential tables.",
        "-->",
    ]
    return "\n".join(lines) + "\n"


def write_disease_entries(
    entries: list[DiseaseEntry],
    output_dir: Path,
    min_findings: int = 1,
) -> tuple[int, int]:
    """
    Write one .md per disease entry under output_dir/disease_entries/<chapter>/.
    Returns (written, skipped).
    """
    disease_dir = output_dir / "disease_entries"
    written = skipped = 0
    seen: dict[str, int] = {}

    for entry in entries:
        if (entry.total_findings < min_findings
                and not entry.demographics
                and not entry.definition
                and not entry.clinical):
            skipped += 1
            continue

        subdir = disease_dir / (slugify(entry.parent_section) or "uncategorised")
        subdir.mkdir(parents=True, exist_ok=True)

        slug = entry.slug
        key = f"{entry.parent_section}/{slug}"
        if key in seen:
            seen[key] += 1
            slug = f"{slug}_{seen[key]}"
        else:
            seen[key] = 0

        out_path = subdir / f"{slug}.md"
        out_path.write_text(render_disease_entry(entry), encoding="utf-8")
        log.info(f"  ✓ {out_path.relative_to(output_dir)}")
        written += 1

    return written, skipped


# ──────────────────────────────────────────────────────────────────────────────
# PIPELINE ORCHESTRATION
# ──────────────────────────────────────────────────────────────────────────────

def process_file(md_path: Path, output_dir: Path, min_quality: float) -> list[DifferentialCluster]:
    log.info(f"→ {md_path.name}")

    raw = md_path.read_text(encoding="utf-8", errors="replace")

    cleaned = clean_markdown(raw)
    sections = _parse_sections(cleaned)
    log.info(f"   {len(sections)} sections parsed")

    clusters = detect_clusters(sections)

    # Second pass: extract inline DDx lines from disease-entry blocks
    inline = extract_inline_ddx(cleaned)
    log.info(f"   {len(clusters)} section clusters + {len(inline)} inline DDx clusters")
    clusters = clusters + inline

    clusters.sort(key=lambda c: -c.quality_score)

    written, skipped = write_clusters(clusters, output_dir, min_quality)
    log.info(f"   {written} clusters written, {skipped} skipped (score < {min_quality})")

    # Third pass: disease entry imaging features
    entries = extract_disease_entries(cleaned)
    log.info(f"   {len(entries)} disease entries found")
    e_written, e_skipped = write_disease_entries(entries, output_dir)
    log.info(f"   {e_written} disease entries written, {e_skipped} skipped (no content)")

    return clusters


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract radiology differential clusters from Marker Markdown output.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python extract_clusters.py marker_output/dahnert.md
  python extract_clusters.py marker_output/ -o processed_clusters/ --min-quality 0.35 -v
        """,
    )
    parser.add_argument("input", help="Marker .md file OR directory containing .md files")
    parser.add_argument("--output", "-o", default="processed_clusters", help="Output directory")
    parser.add_argument("--min-quality", "-q", type=float, default=0.3,
                        help="Minimum quality score [0.0–1.0] (default: 0.3)")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    input_path = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    all_clusters: list[DifferentialCluster] = []

    if input_path.is_dir():
        md_files = sorted(input_path.glob("**/*.md"))
        if not md_files:
            log.error(f"No .md files found in {input_path}")
            sys.exit(1)
        log.info(f"Processing {len(md_files)} files from {input_path}/")
        for f in md_files:
            all_clusters.extend(process_file(f, output_dir, args.min_quality))
    elif input_path.is_file():
        all_clusters = process_file(input_path, output_dir, args.min_quality)
    else:
        log.error(f"Input not found: {input_path}")
        sys.exit(1)

    if all_clusters:
        write_index(all_clusters, output_dir)

    log.info(f"\nDone. {len(all_clusters)} total clusters → {output_dir}/")


if __name__ == "__main__":
    main()
