#!/usr/bin/env python3
"""
Stage 2 — Structure Extraction (rule-based, no LLM)

Reads all processed_clusters/ files and extracts the five key fields
needed for the quiz platform tables:

  dominant_finding        – the single most defining imaging feature
  distribution            – where / how widespread (lobe, bilateral, etc.)
  demographics            – age, sex, incidence, frequency
  discriminating_features – what separates this from mimics
  other_features          – remaining imaging findings by modality

DDx clusters are additionally classified as:
  "differential"   – true disease list (the majority)
  "framework"      – decision tree / feature checklist (SIZE, MARGIN, GRADE…)
  "mixed"          – partly categorical, partly diagnostic

Sub-site bleed items (bare anatomy terms like "humerus", "tibia" that
leaked out of a parent diagnosis) are merged back into their parent.

Outputs:
  structured/conditions/<slug>.json   – one file per disease entry
  structured/ddx/<slug>.json          – one file per DDx finding cluster
  structured/all_conditions.json      – bulk import array
  structured/all_ddx.json             – bulk import array
  structured/schema.sql               – Supabase CREATE TABLE statements

Usage:
  python3 stage2_structure.py --input processed_clusters/ --output structured/
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


# ──────────────────────────────────────────────────────────────────────────────
# SHARED PATTERNS
# ──────────────────────────────────────────────────────────────────────────────

_DISCRIMINATING_RE = re.compile(
    r"pathognomonic|hallmark|characteristic|classic|specific|distinguishing|"
    r"diagnostic of|virtually always|virtually diagnostic|strongly suggest|"
    r"almost always|in contrast to|unlike|differentiates|distinguishes",
    re.IGNORECASE,
)

_DISTRIBUTION_RE = re.compile(
    r"\b(bilateral|unilateral|upper lobe|lower lobe|middle lobe|upper zone|lower zone|"
    r"upper third|lower third|central|peripheral|perihilar|hilar|basal|basilar|apical|"
    r"subpleural|peribronchial|diffuse|focal|multifocal|segmental|lobar|subsegmental|"
    r"diaphragmatic|mediastinal|right-?sided|left-?sided|right lobe|left lobe|"
    r"caudate lobe|hepatic|splenic|renal|cortical|medullary|"
    r"diaphyseal|metaphyseal|epiphyseal|periosteal|para-?spinal|"
    r"anterior|posterior|superior|inferior|perivascular|perilymphatic|"
    r"centrilobular|panlobular|paraseptal|random)\b",
    re.IGNORECASE,
)

_MODALITY_PRIORITY = ["CT", "CECT", "NECT", "HRCT", "MR", "US", "XRAY", "NUC", "PET"]

# ── Framework / decision-tree detection ───────────────────────────────────────
# True category labels in Dahnert: short ALL-CAPS descriptors or lettered lists
_FRAMEWORK_ITEM_RE = re.compile(
    r"^("
    # Single-letter list markers: "A.  CONGENITAL", "B.  ACQUIRED"
    r"[A-F]\.\s+"
    r"|"
    # Short ALL-CAPS descriptor words (1–4 words, no lowercase mixed in)
    # e.g. SIZE, MARGIN / EDGE, VASCULAR DISTRIBUTION, INTRINSIC OBSTRUCTION
    r"(?:[A-Z][A-Z\s/&+\-]{1,35}[A-Z])"
    r")",
)

# Known anatomy/sub-site terms that bleed as false differentials
_ANATOMY_TERMS_RE = re.compile(
    r"^(femur|femoral|tibia|tibial|humerus|humeral|fibula|fibular|"
    r"radius|radial|ulna|ulnar|skull|calvarium|pelvis|pelvic|sacrum|sacral|"
    r"clavicle|scapula|sternum|sternal|patella|vertebra|vertebral|spine|spinal|"
    r"rib|jaw|mandible|ilium|iliac|calcaneus|talus|tarsal|carpal|"
    r"phalanx|phalangeal|metacarpal|metatarsal|"
    r"epiphysis|metaphysis|diaphysis|"
    r"left|right|bilateral|ipsilateral|contralateral|"
    r"proximal|distal|medial|lateral|anterior|posterior|"
    r"upper|lower|superior|inferior|central|peripheral)"
    r"(\s|$)",
    re.IGNORECASE,
)


# ──────────────────────────────────────────────────────────────────────────────
# CLUSTER TYPE DETECTION
# ──────────────────────────────────────────────────────────────────────────────

def _is_framework_item(name: str) -> bool:
    """
    True if this item is a category label rather than a diagnosis name.

    Framework items: SIZE, MARGIN / EDGE, VASCULAR DISTRIBUTION, A. CONGENITAL
    NOT framework:   Congenital pulmonary airway malformation (starts with adj but is a
                     full diagnosis), Primary sclerosing cholangitis, etc.
    """
    stripped = name.strip()
    m = _FRAMEWORK_ITEM_RE.match(stripped)
    if not m:
        return False
    # Extra guard: if the match is followed by many more words it's a diagnosis name,
    # not a category header (e.g. "MALIGNANT FIBROUS HISTIOCYTOMA" has 3 words but IS a diagnosis)
    words = stripped.split()
    # Category headers are typically ≤ 4 words
    return len(words) <= 4


def detect_cluster_type(differentials: list[dict]) -> str:
    """
    Classify a DDx cluster as:
      "differential"  – genuine list of distinct diseases / diagnoses
      "framework"     – decision tree / feature checklist (SIZE, MARGIN, GRADE…)
      "mixed"         – partially categorical
    """
    if not differentials:
        return "differential"
    names = [x["name"] for x in differentials]
    n_framework = sum(1 for n in names if _is_framework_item(n))
    ratio = n_framework / len(names)
    if ratio >= 0.4:
        return "framework"
    if ratio >= 0.2:
        return "mixed"
    return "differential"


# ──────────────────────────────────────────────────────────────────────────────
# SUB-SITE BLEED CLEANUP
# ──────────────────────────────────────────────────────────────────────────────

def merge_sub_sites(differentials: list[dict]) -> list[dict]:
    """
    Dahnert uses '›  Site:' sub-labels which sometimes parse as independent
    differential items.  Bare anatomy terms (humerus, tibia, left, proximal…)
    immediately following a real diagnosis are merged back into that diagnosis
    as a 'sites' list.

    Example:
      [Ewing sarcoma, humerus, tibia]
      → [{name: Ewing sarcoma, sites: [humerus, tibia]}]
    """
    if not differentials:
        return differentials

    merged: list[dict] = []
    for item in differentials:
        name = item["name"].strip()
        if _ANATOMY_TERMS_RE.match(name) and merged:
            prev = merged[-1]
            # Only merge if the anatomy term is short (≤ 3 words)
            # and has no frequency/diagnostic context of its own
            if len(name.split()) <= 3 and not item.get("frequency"):
                prev.setdefault("sites", []).append(name)
                # Append site info to raw text of parent for LLM context
                if name not in prev.get("raw", ""):
                    prev["name"] = prev["name"].rstrip() + f" [{name}]"
                continue
        merged.append(item)
    return merged


# ──────────────────────────────────────────────────────────────────────────────
# FRAMEWORK CLUSTER EXPANSION
# ──────────────────────────────────────────────────────────────────────────────

def expand_framework_cluster(differentials: list[dict], context: str) -> dict:
    """
    For framework/decision-tree clusters, restructure the data:
    - Split context paragraph by √ markers to extract individual criteria
    - Group criteria under the nearest preceding category label
    - Return a dict: {category_label: [criterion, …], …}

    Example (SPN morphology):
      categories = {
        "SIZE":             ["< 3 mm: 99.8% benign", "4–7 mm: 99.1% benign", …],
        "MARGIN / EDGE":    ["smooth well-defined = likely benign (21% malignant)", …],
        "CONTOUR":          [],
        "SATELLITE LESION": ["in 99% inflammatory", "in 1% primary lung cancer"],
        "LOCATION":         [],
      }
    """
    # Parse context paragraph: split on √ markers
    raw_criteria = re.split(r"[√\u221a]\s+", context)
    raw_criteria = [c.strip() for c in raw_criteria if c.strip() and len(c.strip()) > 5]

    # Build category → criteria mapping
    categories: dict[str, list[str]] = {}
    current_cat = "__general__"

    for item in differentials:
        label = item["name"].strip()
        categories[label] = []

    # Try to assign each criterion to a category by keyword proximity
    cat_labels = list(categories.keys())
    for criterion in raw_criteria:
        best_cat = current_cat
        # Check if this criterion belongs to a known category by keyword overlap
        for cat in cat_labels:
            cat_words = set(re.sub(r"[^a-z\s]", "", cat.lower()).split())
            crit_lower = criterion.lower()
            if any(w in crit_lower for w in cat_words if len(w) > 3):
                best_cat = cat
                break
        categories.setdefault(best_cat, []).append(criterion)

    # Remove __general__ key with no entries
    categories.pop("__general__", None)

    return categories


# ──────────────────────────────────────────────────────────────────────────────
# DISEASE ENTRY PARSER
# ──────────────────────────────────────────────────────────────────────────────

def parse_disease_entry(filepath: Path) -> dict:
    """Parse a disease_entries/<chapter>/<slug>.md file into structured dict."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.split("\n")

    name = ""
    chapter = ""
    definition = ""
    demographics: dict[str, str] = {}
    general_findings: list[str] = []
    modality_findings: dict[str, list[str]] = {}
    clinical: dict[str, str] = {}

    section = None
    current_modality = None

    for line in lines:
        if line.strip().startswith("---") or line.strip().startswith("<!--"):
            break

        m = re.match(r"^# Disease:\s+(.+)$", line)
        if m:
            name = m.group(1).strip()
            continue

        m = re.match(r"^\*\*Source section:\*\*\s+(.+)$", line)
        if m:
            chapter = m.group(1).strip()
            continue

        if line.startswith("## "):
            section = line[3:].strip()
            current_modality = None
            continue

        if line.startswith("### "):
            sub = line[4:].strip()
            if section == "Imaging Findings":
                current_modality = None if sub == "General" else sub
                modality_findings.setdefault(sub, []) if sub != "General" else None
            continue

        stripped = line.strip()
        if not stripped or stripped.startswith("<!--") or stripped.startswith("---"):
            continue

        if section == "Definition":
            if stripped and not stripped.startswith("**"):
                definition = stripped
            continue

        if section == "Key Facts":
            m = re.match(r"^-\s+\*\*(.+?):\*\*\s+(.+)$", stripped)
            if m:
                demographics[m.group(1).strip()] = m.group(2).strip()
            continue

        if section == "Imaging Findings":
            m = re.match(r"^-\s+(.+)$", stripped)
            if m:
                finding = m.group(1).strip()
                if current_modality:
                    modality_findings.setdefault(current_modality, []).append(finding)
                else:
                    general_findings.append(finding)
            continue

        if section == "Clinical":
            m = re.match(r"^-\s+\*\*(.+?):\*\*\s+(.+)$", stripped)
            if m:
                clinical[m.group(1).strip()] = m.group(2).strip()
            continue

    all_findings = _all_findings_flat(general_findings, modality_findings)
    dominant_finding = _extract_dominant(general_findings, modality_findings)
    distribution     = _extract_distribution(all_findings, demographics)
    discriminating   = _extract_discriminating(all_findings, n=5)
    other_features   = _remaining_features(all_findings, dominant_finding, discriminating)

    return {
        "name":                    name,
        "slug":                    filepath.stem,
        "chapter":                 chapter,
        "source_file":             str(filepath),
        "definition":              definition,
        "demographics":            demographics,
        "dominant_finding":        dominant_finding,
        "distribution":            distribution,
        "discriminating_features": discriminating,
        "other_features": {
            "general": general_findings,
            **modality_findings,
        },
        "clinical": clinical,
    }


# ──────────────────────────────────────────────────────────────────────────────
# DDX CLUSTER PARSER
# ──────────────────────────────────────────────────────────────────────────────

def parse_ddx_cluster(filepath: Path) -> dict:
    """
    Parse a processed_clusters/<chapter>/<finding>.md file.

    Returns structured dict with:
      cluster_type   "differential" | "framework" | "mixed"
      differentials  cleaned, sub-site-merged list
      criteria       populated for framework clusters (category → [criterion, …])
      context        raw context paragraph (preserved for LLM)
    """
    text = filepath.read_text(encoding="utf-8")
    lines = text.split("\n")

    finding = ""
    chapter = ""
    quality = 0.0
    differentials: list[str] = []
    context = ""
    section = None

    for line in lines:
        if line.strip().startswith("---") or line.strip().startswith("<!--"):
            break

        m = re.match(r"^# Finding:\s+(.+)$", line)
        if m:
            finding = m.group(1).strip()
            continue

        m = re.match(r"^\*\*Source section:\*\*\s+(.+)$", line)
        if m:
            chapter = m.group(1).strip()
            continue

        m = re.match(r"^\*\*Quality score:\*\*\s+([\d.]+)$", line)
        if m:
            quality = float(m.group(1))
            continue

        if line.startswith("## "):
            section = line[3:].strip()
            continue

        if section == "Differentials":
            m = re.match(r"^-\s+(.+)$", line.strip())
            if m:
                differentials.append(m.group(1).strip())

        if section == "Context":
            stripped = line.strip()
            if stripped and not stripped.startswith("**"):
                context += " " + stripped

    context = context.strip()

    # Enrich + clean differentials
    enriched = _enrich_differentials(differentials, context)
    enriched = merge_sub_sites(enriched)

    # Classify cluster
    cluster_type = detect_cluster_type(enriched)

    # For framework clusters, extract structured criteria from context
    criteria: dict[str, list[str]] = {}
    if cluster_type in ("framework", "mixed") and context:
        criteria = expand_framework_cluster(enriched, context)

    return {
        "finding":        finding,
        "slug":           filepath.stem,
        "chapter":        chapter,
        "source_file":    str(filepath),
        "quality_score":  quality,
        "cluster_type":   cluster_type,
        "differentials":  enriched,
        "criteria":       criteria,      # populated for framework clusters
        "context":        context[:600] if context else "",
    }


# ──────────────────────────────────────────────────────────────────────────────
# EXTRACTION HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def _all_findings_flat(
    general: list[str],
    by_modality: dict[str, list[str]],
) -> list[str]:
    out = list(general)
    for mod in _MODALITY_PRIORITY:
        out.extend(by_modality.get(mod, []))
    for mod, findings in by_modality.items():
        if mod not in _MODALITY_PRIORITY:
            out.extend(findings)
    return out


def _extract_dominant(
    general: list[str],
    by_modality: dict[str, list[str]],
) -> str:
    candidates = []
    for mod in _MODALITY_PRIORITY:
        if by_modality.get(mod):
            candidates = by_modality[mod][:3]
            break
    if not candidates:
        candidates = general[:3]
    if not candidates:
        for findings in by_modality.values():
            if findings:
                candidates = findings[:3]
                break
    if not candidates:
        return ""

    def _score(f: str) -> int:
        score = 0
        if re.search(r"\d+\s*%", f):        score += 3
        if "←" in f or "→" in f:            score += 2
        if re.search(r"\d+\s*(mm|cm|HU)", f): score += 2
        if _DISCRIMINATING_RE.search(f):     score += 4
        if len(f) > 80:                      score -= 1
        return score

    return max(candidates, key=_score)


def _extract_distribution(
    all_findings: list[str],
    demographics: dict[str, str],
) -> str:
    for key in ("Location", "Distribution"):
        if key in demographics:
            return demographics[key]
    for finding in all_findings:
        if _DISTRIBUTION_RE.search(finding):
            return finding[:200]
    return ""


def _extract_discriminating(all_findings: list[str], n: int = 5) -> list[str]:
    discriminating: list[str] = []
    seen: set[str] = set()

    def _add(f: str) -> None:
        if f and f not in seen:
            discriminating.append(f)
            seen.add(f)

    for f in all_findings:
        if _DISCRIMINATING_RE.search(f):
            _add(f)

    if len(discriminating) < n:
        for f in all_findings[:6]:
            _add(f)

    return discriminating[:n]


def _remaining_features(
    all_findings: list[str],
    dominant: str,
    discriminating: list[str],
) -> list[str]:
    exclude = {dominant} | set(discriminating)
    return [f for f in all_findings if f not in exclude]


def _enrich_differentials(
    differentials: list[str],
    context: str,
) -> list[dict]:
    enriched = []
    for d in differentials:
        pct_m = re.search(r"(\d+(?:\.\d+)?)\s*%", d)
        pct = pct_m.group(0) if pct_m else None
        freq_m = re.search(
            r"\b(most common|common|uncommon|rare|frequent|occasional)\b",
            d, re.IGNORECASE,
        )
        freq = freq_m.group(0).lower() if freq_m else None
        clean = re.sub(r"\s*[\(\[].*?[\)\]]\s*$", "", d).strip()
        enriched.append({
            "name":      clean,
            "raw":       d,
            "frequency": pct or freq,
        })
    return enriched


# ──────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ──────────────────────────────────────────────────────────────────────────────

_SCHEMA_SQL = """\
-- Dahnert condition profiles
CREATE TABLE IF NOT EXISTS dahnert_conditions (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                    TEXT NOT NULL,
    slug                    TEXT NOT NULL,
    chapter                 TEXT,
    definition              TEXT,
    dominant_finding        TEXT,
    distribution            TEXT,
    demographics            JSONB,
    discriminating_features TEXT[],
    other_features          JSONB,
    clinical                JSONB,
    source_file             TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (slug, chapter)
);

-- Dahnert DDx finding clusters
CREATE TABLE IF NOT EXISTS dahnert_ddx (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    finding        TEXT NOT NULL,
    slug           TEXT NOT NULL,
    chapter        TEXT,
    cluster_type   TEXT DEFAULT 'differential'
                   CHECK (cluster_type IN ('differential','framework','mixed')),
    differentials  JSONB,
    criteria       JSONB,
    context        TEXT,
    quality_score  FLOAT,
    source_file    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (slug, chapter)
);

CREATE INDEX IF NOT EXISTS idx_dahnert_conditions_slug ON dahnert_conditions (slug);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_slug        ON dahnert_ddx (slug);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_type        ON dahnert_ddx (cluster_type);
CREATE INDEX IF NOT EXISTS idx_dahnert_conditions_demographics
    ON dahnert_conditions USING GIN (demographics);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_differentials
    ON dahnert_ddx USING GIN (differentials);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_criteria
    ON dahnert_ddx USING GIN (criteria);
"""


def _sql_val(v: object) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, str):
        return "'" + v.replace("'", "''") + "'"
    if isinstance(v, (list, dict)):
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'"
    return str(v)


def write_condition_inserts(records: list[dict], out_path: Path) -> None:
    lines = [
        "INSERT INTO dahnert_conditions",
        "  (name,slug,chapter,definition,dominant_finding,distribution,",
        "   demographics,discriminating_features,other_features,clinical,source_file)",
        "VALUES",
    ]
    rows = []
    for r in records:
        disc = "{" + ",".join(
            '"' + f.replace('"', '\\"') + '"' for f in r["discriminating_features"]
        ) + "}"
        rows.append(
            f"  ({_sql_val(r['name'])},{_sql_val(r['slug'])},{_sql_val(r['chapter'])},"
            f"{_sql_val(r['definition'])},{_sql_val(r['dominant_finding'])},"
            f"{_sql_val(r['distribution'])},{_sql_val(r['demographics'])},'{disc}',"
            f"{_sql_val(r['other_features'])},{_sql_val(r['clinical'])},"
            f"{_sql_val(r['source_file'])})"
        )
    lines.append(",\n".join(rows) +
                 "\nON CONFLICT (slug,chapter) DO UPDATE SET\n"
                 "  dominant_finding=EXCLUDED.dominant_finding,\n"
                 "  discriminating_features=EXCLUDED.discriminating_features,\n"
                 "  other_features=EXCLUDED.other_features;\n")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def write_ddx_inserts(records: list[dict], out_path: Path) -> None:
    lines = [
        "INSERT INTO dahnert_ddx",
        "  (finding,slug,chapter,cluster_type,differentials,criteria,context,quality_score,source_file)",
        "VALUES",
    ]
    rows = []
    for r in records:
        rows.append(
            f"  ({_sql_val(r['finding'])},{_sql_val(r['slug'])},{_sql_val(r['chapter'])},"
            f"{_sql_val(r['cluster_type'])},{_sql_val(r['differentials'])},"
            f"{_sql_val(r['criteria'])},{_sql_val(r['context'])},"
            f"{r['quality_score']},{_sql_val(r['source_file'])})"
        )
    lines.append(",\n".join(rows) +
                 "\nON CONFLICT (slug,chapter) DO UPDATE SET\n"
                 "  differentials=EXCLUDED.differentials,\n"
                 "  criteria=EXCLUDED.criteria,\n"
                 "  cluster_type=EXCLUDED.cluster_type,\n"
                 "  context=EXCLUDED.context;\n")
    out_path.write_text("\n".join(lines), encoding="utf-8")


# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Stage 2: extract structured fields from processed_clusters/",
    )
    parser.add_argument("--input",  "-i", default="processed_clusters")
    parser.add_argument("--output", "-o", default="structured")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    input_dir  = Path(args.input)
    output_dir = Path(args.output)
    (output_dir / "conditions").mkdir(parents=True, exist_ok=True)
    (output_dir / "ddx").mkdir(parents=True, exist_ok=True)

    # ── Disease entries ──────────────────────────────────────────────────────
    print("Processing disease entries…")
    all_conditions: list[dict] = []
    for fp in sorted((input_dir / "disease_entries").rglob("*.md")):
        try:
            record = parse_disease_entry(fp)
            if not record["name"]:
                continue
            (output_dir / "conditions" / f"{fp.stem}.json").write_text(
                json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            all_conditions.append(record)
            if args.verbose:
                print(f"  ✓ {fp.stem}")
        except Exception as e:
            print(f"  ✗ {fp}: {e}", file=sys.stderr)
    print(f"  {len(all_conditions)} conditions structured")

    # ── DDx clusters ────────────────────────────────────────────────────────
    print("Processing DDx clusters…")
    all_ddx: list[dict] = []
    type_counts: dict[str, int] = {"differential": 0, "framework": 0, "mixed": 0}
    sub_site_total = 0

    ddx_files = sorted(
        f for f in input_dir.rglob("*.md")
        if "disease_entries" not in str(f) and f.name != "index.md"
    )
    for fp in ddx_files:
        try:
            record = parse_ddx_cluster(fp)
            if not record["finding"]:
                continue
            # Count sub-site merges
            for item in record["differentials"]:
                sub_site_total += len(item.get("sites", []))
            type_counts[record["cluster_type"]] = type_counts.get(record["cluster_type"], 0) + 1
            (output_dir / "ddx" / f"{fp.stem}.json").write_text(
                json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            all_ddx.append(record)
            if args.verbose:
                print(f"  ✓ [{record['cluster_type'][:4]}] {fp.stem}")
        except Exception as e:
            print(f"  ✗ {fp}: {e}", file=sys.stderr)

    print(f"  {len(all_ddx)} DDx clusters structured")
    print(f"    differential: {type_counts['differential']}")
    print(f"    framework:    {type_counts['framework']}")
    print(f"    mixed:        {type_counts['mixed']}")
    print(f"    sub-site items merged: {sub_site_total}")

    # ── Bulk JSON ────────────────────────────────────────────────────────────
    (output_dir / "all_conditions.json").write_text(
        json.dumps(all_conditions, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (output_dir / "all_ddx.json").write_text(
        json.dumps(all_ddx, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # ── SQL ──────────────────────────────────────────────────────────────────
    (output_dir / "schema.sql").write_text(_SCHEMA_SQL, encoding="utf-8")
    write_condition_inserts(all_conditions, output_dir / "conditions_insert.sql")
    write_ddx_inserts(all_ddx, output_dir / "ddx_insert.sql")

    print(f"\nDone → {output_dir}/")


if __name__ == "__main__":
    main()
