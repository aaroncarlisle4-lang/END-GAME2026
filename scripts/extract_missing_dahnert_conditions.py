#!/usr/bin/env python3
"""
Extract disease conditions from dahnert_full.md that were missed by the original
pipeline — specifically ### ALL_CAPS headings.

Original pipeline only captured conditions from dedicated disease_entry markdown
files. This script extracts the remaining conditions directly from the raw text.

Output: Bob's UK MLA/structured/supplementary_conditions.json
"""
import re
import json
import os

SRC = os.path.join(os.path.dirname(__file__), "..", "Bob's UK MLA", "marker_output", "dahnert_full.md")
OUT = os.path.join(os.path.dirname(__file__), "..", "Bob's UK MLA", "structured", "supplementary_conditions.json")
EXISTING = os.path.join(os.path.dirname(__file__), "..", "Bob's UK MLA", "structured", "all_conditions.json")

# Non-condition headings to skip
SKIP_HEADINGS = {
    "PREFACE", "CONTENTS", "ABBREVIATIONS", "REFERENCES", "INDEX",
    "MUSCULOSKELETAL SYSTEM", "CHEST", "CARDIOVASCULAR", "NERVOUS SYSTEM",
    "GENITOURINARY", "GASTROINTESTINAL", "OBSTETRIC", "GYNECOLOGIC",
    "DIFFERENTIAL DIAGNOSIS", "DIAGNOSTIC GAMUT", "UNIVERSAL DIFFERENTIAL",
    "MUSCULOSKELETAL DISORDERS", "BREAST", "EAR NOSE AND THROAT",
    "ORBITAL AND OCULAR", "SKULL AND SPINE", "UROGENITAL",
    "TREATMENT OF ADVERSE", "PRINCIPLES OF TREATMENT",
    "VASOVAGAL REACTION", "DERMAL CONTRAST", "NAUSEA", "VOMITING",
    "RESPIRATORY DISTRESS", "ANAPHYLACTOID REACTION", "SEVERE HYPERTENSION",
    "ANGINA", "AIR EMBOLISM", "CONTRAST EXTRAVASATION",
}

# Patterns that indicate a chapter/section heading rather than a condition
SECTION_PATTERNS = [
    r'^[A-Z]\.\s+[A-Z]',          # "A. SOMETHING"
    r'DIFFERENTIAL DIAGNOSIS',
    r'DIAGNOSTIC GAMUT',
    r'UNIVERSAL',
    r'^(ANATOMY|PHYSIOLOGY|EMBRYOLOGY|OVERVIEW|CLASSIFICATION|STAGING)',
]

def is_condition_heading(name: str) -> bool:
    """Filter out non-condition headings."""
    if name in SKIP_HEADINGS:
        return False
    name_norm = name.upper()
    for pat in SECTION_PATTERNS:
        if re.search(pat, name_norm):
            return False
    # Must be at least 3 chars and not purely numeric
    if len(name) < 3 or name.isdigit():
        return False
    return True

def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    s = s.strip('_')
    return s

def extract_definition(lines: list) -> str:
    """Extract definition from '= ' prefix lines."""
    defs = []
    for line in lines[:30]:
        s = line.strip()
        if s.startswith('= ') or s.startswith('=  '):
            defs.append(s[2:].strip())
        elif defs and s and not s.startswith('#'):
            # continuation line (indented or plain text right after)
            if line.startswith('  ') or line.startswith('\t'):
                defs.append(s)
            else:
                break
    return ' '.join(defs)[:500] if defs else ''

def extract_demographics(lines: list) -> dict:
    """Extract age, sex ratio, incidence, predisposing factors."""
    demo = {}
    for line in lines:
        s = line.strip()
        for key in ['Age:', 'Incidence:', 'Prevalence:', 'M:F', 'M÷F', 'Predisposed:', 'Location:']:
            if s.startswith(key):
                val = s[len(key):].strip().lstrip(' ')
                demo[key.rstrip(':')] = val[:200]
    return demo

def extract_distribution(lines: list) -> str:
    """Find Location: line."""
    for line in lines:
        s = line.strip()
        if s.startswith('Location:') or s.startswith('Location '):
            val = s.split(':', 1)[-1].strip()
            if len(val) > 5:
                return val[:300]
    return ''

def extract_dominant_finding(lines: list) -> str:
    """First √ line."""
    for line in lines:
        s = line.strip()
        if s.startswith('√ ') or s.startswith('√  '):
            return s[1:].strip()[:300]
    return ''

def extract_discriminating_features(lines: list, max_items: int = 8) -> list:
    """Extract √ and ◊ lines as discriminating features."""
    feats = []
    for line in lines:
        s = line.strip()
        if (s.startswith('√ ') or s.startswith('√  ')
                or s.startswith('◊ ') or s.startswith('◊  ')):
            feat = s[1:].strip()
            if len(feat) > 10 and feat not in feats:
                feats.append(feat[:300])
        if len(feats) >= max_items:
            break
    return feats

def extract_modality_findings(lines: list) -> dict:
    """Parse modality sections: CT:, MR:, US:, CXR:, etc."""
    modality_map = {
        'CT:': 'ct', 'CT ': 'ct',
        'MR:': 'mri', 'MRI:': 'mri', 'MR ': 'mri',
        'US:': 'us', 'US ': 'us',
        'CXR:': 'cxr', 'CECT:': 'cect', 'NECT:': 'nect',
        'NUC:': 'nuc', 'PET:': 'pet', 'ANGIO:': 'angio',
    }
    result = {v: [] for v in set(modality_map.values())}
    current_modality = 'general'
    general_findings = []

    for line in lines:
        s = line.strip()
        # Check for modality header
        matched = False
        for prefix, mod in modality_map.items():
            if s.startswith(prefix):
                current_modality = mod
                matched = True
                break
        if matched:
            continue
        # Collect findings under current modality
        if s.startswith('√ ') or s.startswith('√  '):
            feat = s[1:].strip()[:300]
            if current_modality == 'general':
                general_findings.append(feat)
            else:
                result[current_modality].append(feat)

    result['general'] = general_findings
    # Remove empty
    return {k: v for k, v in result.items() if v}

def parse_block(name: str, chapter: str, lines: list) -> dict:
    """Parse a condition block into a structured record."""
    return {
        'name': name,
        'slug': slugify(name),
        'chapter': chapter,
        'source_file': 'dahnert_full.md (supplementary extraction)',
        'definition': extract_definition(lines),
        'demographics': extract_demographics(lines) or None,
        'dominant_finding': extract_dominant_finding(lines),
        'distribution': extract_distribution(lines),
        'discriminating_features': extract_discriminating_features(lines),
        'other_features': extract_modality_findings(lines),
        'clinical': {},
    }

def main():
    print(f"Reading {SRC}...")
    with open(SRC) as f:
        content = f.read()
    lines_all = content.split('\n')

    # Load existing conditions to avoid duplicates
    with open(EXISTING) as f:
        existing = json.load(f)
    existing_slugs = {c['slug'] for c in existing}
    existing_names = {c['name'].upper() for c in existing}
    print(f"Existing conditions: {len(existing)} (will skip duplicates)")

    # Major chapter headings in Dahnert (as ### headings in the raw text)
    CHAPTER_HEADINGS = {
        "MUSCULOSKELETAL SYSTEM": "MUSCULOSKELETAL SYSTEM",
        "CENTRAL NERVOUS SYSTEM": "CENTRAL NERVOUS SYSTEM",
        "SKULL AND SPINE DISORDERS": "SKULL AND SPINE DISORDERS",
        "NERVOUS SYSTEM DISORDERS": "NERVOUS SYSTEM DISORDERS",
        "CHEST DISORDERS": "CHEST DISORDERS",
        "CARDIOVASCULAR DISORDERS": "CARDIOVASCULAR DISORDERS",
        "GASTROINTESTINAL AND ABDOMINAL DISORDERS": "GASTROINTESTINAL AND ABDOMINAL DISORDERS",
        "OBSTETRIC AND GYNECOLOGIC DISORDERS": "OBSTETRIC AND GYNECOLOGIC DISORDERS",
        "EAR, NOSE, AND THROAT DISORDERS": "EAR, NOSE, AND THROAT DISORDERS",
        "ORBITAL AND OCULAR DISORDERS": "ORBITAL AND OCULAR DISORDERS",
        "UROGENITAL DISORDERS": "UROGENITAL DISORDERS",
        "BREAST DISORDERS": "BREAST DISORDERS",
        "NUCLEAR MEDICINE": "NUCLEAR MEDICINE",
        "PEDIATRIC RADIOLOGY": "PEDIATRIC RADIOLOGY",
        "INTERVENTIONAL RADIOLOGY": "INTERVENTIONAL RADIOLOGY",
        "LYMPH NODES": "LYMPH NODES",
        "SPINE": "SPINE",
    }

    # Parse: track current chapter, collect ### condition blocks
    results = []
    current_chapter = 'MUSCULOSKELETAL SYSTEM'  # default — first chapter
    i = 0
    while i < len(lines_all):
        line = lines_all[i]

        # Track ## chapter headings (author name etc — skip)
        m2 = re.match(r'^## (.+)', line)
        if m2:
            i += 1
            continue

        # Look for ### ALL_CAPS condition headings
        m3 = re.match(r'^### ([A-Z][A-Z0-9 /\(\)\-\,\.\:\']+)\s*$', line.strip())
        if m3:
            name = m3.group(1).strip()
            # Update chapter if this is a known chapter heading
            if name in CHAPTER_HEADINGS:
                current_chapter = CHAPTER_HEADINGS[name]
                i += 1
                continue

            # Skip non-conditions
            if not is_condition_heading(name):
                i += 1
                continue

            # Skip if already extracted
            slug = slugify(name)
            if slug in existing_slugs or name.upper() in existing_names:
                i += 1
                continue

            # Collect block until next ### or ## heading
            block_lines = []
            j = i + 1
            while j < len(lines_all):
                next_line = lines_all[j]
                if re.match(r'^#{2,3} ', next_line):
                    break
                block_lines.append(next_line)
                j += 1

            # Only include if there's meaningful content (√ findings or definition)
            block_text = '\n'.join(block_lines)
            has_findings = '√' in block_text
            has_def = re.search(r'^=\s+\S', block_text, re.MULTILINE)

            if has_findings or has_def:
                record = parse_block(name, current_chapter, block_lines)
                results.append(record)
                existing_slugs.add(slug)  # prevent duplicates within this run

            i = j
            continue

        i += 1

    print(f"Extracted {len(results)} new condition entries")

    # Stats
    with_dominant = sum(1 for r in results if r['dominant_finding'])
    with_disc = sum(1 for r in results if r['discriminating_features'])
    with_dist = sum(1 for r in results if r['distribution'])
    print(f"  dominant_finding: {with_dominant}")
    print(f"  discriminating_features: {with_disc}")
    print(f"  distribution: {with_dist}")

    # Sample
    print("\nSample new conditions:")
    for r in results[:20]:
        print(f"  {r['name']} [{r['chapter']}] — disc:{len(r['discriminating_features'])} dom:{bool(r['dominant_finding'])}")

    with open(OUT, 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nWritten to {OUT}")

if __name__ == '__main__':
    main()
