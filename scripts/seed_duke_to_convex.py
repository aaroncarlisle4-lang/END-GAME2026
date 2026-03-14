#!/usr/bin/env python3
"""
Generate Convex seed mutation code for Duke cases.
Transforms extracted Duke JSON into Radiopaedia gold-standard framework
and outputs a TypeScript seed file for Convex.
"""
import json
import re

with open("convex/data/dukeCases.json") as f:
    duke_cases = json.load(f)

# Category abbreviation -> Convex category _id mapping
# We'll resolve these at runtime in the seed script
DUKE_CHAPTER_ORDER = {
    "Chest": 1, "Breast": 2, "GI": 3, "GU": 4, "MSK": 5,
    "Neuro": 6, "VIR": 7, "Paeds": 8, "US": 9, "NucMed": 10, "Cardiac": 11,
}

def escape_ts(s):
    """Escape string for TypeScript template literal."""
    if not s:
        return ""
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${").replace('"', '\\"')

def build_findings(case):
    """Build structured findings from figure descriptions and key facts."""
    parts = []
    if case.get("figureDescriptions"):
        parts.append(case["figureDescriptions"])
    return " ".join(parts).strip() if parts else ""

def build_interpretation(case):
    """Build interpretation from key radiologic facts."""
    facts = case.get("keyFactsRadiologic", [])
    if not facts:
        return ""
    # Take first 5 radiologic facts as interpretation
    return " ".join(facts[:5])

def build_key_bullets(case):
    """Combine clinical + radiologic key facts into bullets."""
    bullets = []
    for fact in case.get("keyFactsClinical", [])[:4]:
        if len(fact) > 15:
            bullets.append(fact[:200])
    for fact in case.get("keyFactsRadiologic", [])[:4]:
        if len(fact) > 15:
            bullets.append(fact[:200])
    return bullets[:8]

def build_important_negatives(case):
    """Extract important negatives from differentials and key facts."""
    negatives = []
    for diff in case.get("differentials", []):
        # Look for "less likely because" or "excluded by" patterns
        if "less likely" in diff.lower() or "excluded" in diff.lower() or "unlikely" in diff.lower():
            # Extract the negative reasoning
            neg = diff.split(":")[0] if ":" in diff else diff
            negatives.append(f"Not {neg.strip()}")
    # Also check key facts for negative statements
    for fact in case.get("keyFactsClinical", []) + case.get("keyFactsRadiologic", []):
        if any(w in fact.lower() for w in ["rare", "unusual", "uncommon", "absent", "not seen", "excluded"]):
            if len(fact) > 15 and len(fact) < 200:
                negatives.append(fact)
    return negatives[:5]

def build_exam_pearl(case):
    """Build exam pearl from most distinctive key fact."""
    all_facts = case.get("keyFactsClinical", []) + case.get("keyFactsRadiologic", [])
    # Pick the most "pearl-like" fact
    for fact in all_facts:
        if len(fact) > 30 and len(fact) < 300:
            return fact
    return ""

def build_next_steps(case):
    """Infer next steps from diagnosis and modality."""
    diag = case.get("diagnosis", "").lower()
    modality = case.get("modality", "")

    steps = []
    if "tumor" in diag or "carcinoma" in diag or "cancer" in diag or "malignant" in diag or "sarcoma" in diag or "lymphoma" in diag:
        steps.append("Discuss at MDT meeting")
        steps.append("Consider biopsy for tissue diagnosis if not already obtained")
        steps.append("Staging imaging as appropriate")
    elif "fracture" in diag:
        steps.append("Orthopaedic referral")
        steps.append("Assess neurovascular status")
    elif "infection" in diag or "abscess" in diag or "tuberculosis" in diag:
        steps.append("Correlate with inflammatory markers")
        steps.append("Consider drainage/sampling for microbiology")
    else:
        steps.append("Clinical correlation and MDT discussion")

    steps.append("Follow-up imaging as clinically indicated")
    return "; ".join(steps)

def build_differentials_list(case):
    """Extract just the differential names."""
    diffs = []
    for d in case.get("differentials", []):
        name = d.split(":")[0].strip() if ":" in d else d.strip()
        if len(name) > 2 and len(name) < 100:
            diffs.append(name)
    return diffs[:5]

def generate_seed_data():
    """Generate the full seed data structure."""
    seed_cases = []

    # Duke cases start at caseNumber 1001
    base_case_number = 1001

    for idx, case in enumerate(duke_cases):
        case_number = base_case_number + idx
        category = case.get("category", "Unknown")

        if category == "Unknown":
            continue

        is_high_yield = case.get("isHighYield", False)
        title = case.get("diagnosis", f"{category} Case {case.get('caseNumInChapter', idx+1)}")
        if not title:
            title = f"{category} Duke Case {case.get('caseNumInChapter', idx+1)}"

        # Add star for high yield
        if is_high_yield:
            title = f"* {title}"

        findings = build_findings(case)
        interpretation = build_interpretation(case)
        key_bullets = build_key_bullets(case)
        important_negatives = build_important_negatives(case)
        exam_pearl = build_exam_pearl(case)
        next_steps = build_next_steps(case)
        differentials = build_differentials_list(case)

        # Section mapping: use Duke chapter name as section
        section = f"Duke {category}"

        seed_cases.append({
            "caseNumber": case_number,
            "categoryAbbrev": category,
            "title": title,
            "section": section,
            "modality": case.get("modality", "CT"),
            "clinicalHistory": case.get("clinicalHistory", ""),
            "findings": findings,
            "interpretation": interpretation,
            "diagnosis": case.get("diagnosis", ""),
            "differentials": differentials,
            "nextSteps": next_steps,
            "keyBullets": key_bullets,
            "importantNegatives": important_negatives,
            "difficulty": "medium",
            "hasDiscriminator": False,
            "textbookRefs": [20],  # Duke ref number (we'll add it)
            "examPearl": exam_pearl,
            "nuclearMedicine": category == "NucMed",
            "isHighYield": is_high_yield,
            "dukeChapter": case.get("chapterNum", 0),
            "dukeCaseNum": case.get("caseNumInChapter", 0),
        })

    return seed_cases


seed = generate_seed_data()
print(f"Generated {len(seed)} seed records")

# Stats
hy = sum(1 for s in seed if s['isHighYield'])
print(f"High yield: {hy}")
by_cat = {}
for s in seed:
    cat = s['categoryAbbrev']
    by_cat[cat] = by_cat.get(cat, 0) + 1
for cat, count in sorted(by_cat.items()):
    print(f"  {cat}: {count}")

# Save as JSON for the Convex seeder
with open("convex/data/dukeSeedData.json", "w") as f:
    json.dump(seed, f, indent=2)

print(f"\nSaved to convex/data/dukeSeedData.json")

# Also print a sample
s = seed[0]
print(f"\n=== SAMPLE ===")
print(f"Case #{s['caseNumber']}: {s['title']}")
print(f"Category: {s['categoryAbbrev']}")
print(f"History: {s['clinicalHistory'][:120]}...")
print(f"Findings: {s['findings'][:120]}...")
print(f"Diagnosis: {s['diagnosis']}")
print(f"Differentials: {s['differentials']}")
print(f"Key Bullets: {len(s['keyBullets'])}")
print(f"Important Negatives: {len(s['importantNegatives'])}")
print(f"Exam Pearl: {s['examPearl'][:100]}...")
