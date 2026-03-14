#!/usr/bin/env python3
"""
Generate scoring guides (4-8) and viva presentation scripts
for the 41 high-yield Duke cases.
"""
import json

# Load high-yield cases from the extraction
with open("convex/data/dukeCases.json") as f:
    duke_all = json.load(f)

high_yield = [c for c in duke_all if c.get("isHighYield")]
print(f"High-yield cases: {len(high_yield)}")


def generate_scoring_guide(case):
    """Generate FRCR 2B scoring guide (scores 4-8) based on case content."""
    diag = case.get("diagnosis", "this condition")
    diffs = case.get("differentials", [])
    diff_names = [d.split(":")[0].strip() for d in diffs[:3]]
    modality = case.get("modality", "imaging")

    # Get key radiologic facts for the scoring descriptors
    rad_facts = case.get("keyFactsRadiologic", [])
    clin_facts = case.get("keyFactsClinical", [])

    key_finding = rad_facts[0] if rad_facts else "the key imaging findings"
    secondary_finding = rad_facts[1] if len(rad_facts) > 1 else "associated features"
    clinical_point = clin_facts[0] if clin_facts else "the clinical context"

    # Truncate long strings
    def trunc(s, n=200):
        return s[:n] if s else ""

    score4 = f"Candidate fails to identify the primary abnormality on {modality}. Does not offer {diag} or any reasonable differential. Unable to describe the key imaging features systematically. May misidentify normal structures as abnormal."

    score5 = f"Candidate identifies there is an abnormality but describes findings poorly or incompletely. May suggest {diag} as one of several differentials but cannot explain why it is the most likely diagnosis. Limited understanding of {trunc(key_finding, 100)}. Does not discuss management appropriately."

    diff_str = " or ".join(diff_names[:2]) if diff_names else "the key differentials"
    score6 = f"Candidate identifies the main abnormality and correctly suggests {diag} as the primary diagnosis. Can describe most key findings. Offers a reasonable differential including {diff_str}. Discusses basic management but may miss important points about {trunc(clinical_point, 100)}."

    score7 = f"Candidate systematically describes all key imaging findings and confidently reaches the correct diagnosis of {diag}. Provides a well-reasoned differential diagnosis with clear discriminating features. Demonstrates understanding of {trunc(secondary_finding, 100)}. Discusses appropriate next steps and management including MDT discussion where relevant."

    score8 = f"Candidate provides an exemplary structured presentation. Immediately identifies {diag} with a comprehensive description of all imaging features. Offers a prioritised differential with specific discriminators for each. Demonstrates detailed knowledge of {trunc(key_finding, 100)} and {trunc(clinical_point, 100)}. Discusses management confidently with awareness of guidelines, complications, and prognosis. Would impress an examiner with breadth and depth of knowledge."

    return {
        "score4": score4,
        "score5": score5,
        "score6": score6,
        "score7": score7,
        "score8": score8,
    }


def generate_viva_presentation(case):
    """Generate 7-part viva presentation script."""
    diag = case.get("diagnosis", "this condition")
    history = case.get("clinicalHistory", "")
    diffs = case.get("differentials", [])
    diff_names = [d.split(":")[0].strip() for d in diffs[:3]]
    modality = case.get("modality", "imaging")

    rad_facts = case.get("keyFactsRadiologic", [])
    clin_facts = case.get("keyFactsClinical", [])
    figures = case.get("figureDescriptions", "")

    # Extract key findings from figures
    key_findings_text = figures[:300] if figures else "the primary imaging abnormality"

    def trunc(s, n=250):
        return s[:n] if s else ""

    opening = f"This is a {modality} study of a patient presenting with {trunc(history, 150)}. I will systematically describe the findings."

    anchor = f"The key abnormality is {trunc(key_findings_text, 200)}."

    # Build systematic approach from radiologic facts
    sys_approach_parts = rad_facts[:3] if rad_facts else ["I would systematically review all structures"]
    systematic = " ".join([trunc(s, 150) for s in sys_approach_parts])

    synthesis = f"Taken together, the clinical history and imaging findings are most consistent with {diag}."

    # Differential reasoning
    if diff_names:
        diff_reasoning_parts = []
        for d in diff_names[:3]:
            diff_reasoning_parts.append(f"{d}")
        diff_reasoning = f"The differential diagnosis includes {', '.join(diff_reasoning_parts)}. {diag} is the most likely diagnosis because of the combination of clinical and imaging features described."
    else:
        diff_reasoning = f"The appearances are characteristic of {diag}."

    # Clinical urgency
    urgency_keywords = {
        "emergency": ["rupture", "acute", "hemorrhage", "infarct", "obstruction", "perforation", "dissection", "fracture", "necrotizing"],
        "urgent": ["malignant", "cancer", "carcinoma", "lymphoma", "sarcoma", "tumor", "mass", "abscess"],
        "routine": ["benign", "cyst", "chronic", "degenerative"],
    }

    diag_lower = diag.lower()
    urgency_level = "semi-urgent"
    for level, keywords in urgency_keywords.items():
        if any(kw in diag_lower for kw in keywords):
            urgency_level = level
            break

    if urgency_level == "emergency":
        urgency = f"This is an emergency presentation requiring immediate clinical discussion and urgent management. I would contact the referring team directly."
    elif urgency_level == "urgent":
        urgency = f"This requires urgent discussion at MDT. I would recommend tissue diagnosis if not already obtained, and staging investigations as appropriate."
    else:
        urgency = f"I would recommend clinical correlation and follow-up imaging as appropriate. MDT discussion should be considered."

    # Examiner tip
    pearl = case.get("keyFactsClinical", [""])[0] if case.get("keyFactsClinical") else ""
    examiner_tip = f"Key teaching point: {trunc(pearl, 200)}." if pearl else f"Remember to mention the classic imaging features of {diag} and the key discriminating features from the differential."

    return {
        "opening": opening,
        "anchorStatement": anchor,
        "systemicApproach": systematic,
        "synthesis": synthesis,
        "differentialReasoning": diff_reasoning,
        "clinicalUrgency": urgency,
        "examinerTip": examiner_tip,
    }


# Generate for all high-yield cases
updates = []
for case in high_yield:
    case_number = 1001 + duke_all.index(case)

    scoring = generate_scoring_guide(case)
    viva = generate_viva_presentation(case)

    updates.append({
        "caseNumber": case_number,
        "diagnosis": case.get("diagnosis", ""),
        "scoringGuide": scoring,
        "vivaPresentation": viva,
    })

print(f"Generated {len(updates)} scoring guides + viva scripts")

# Save for verification
with open("convex/data/dukeHighYieldEnhancements.json", "w") as f:
    json.dump(updates, f, indent=2)

# Print sample
sample = updates[0]
print(f"\n=== SAMPLE: Case #{sample['caseNumber']} — {sample['diagnosis']} ===")
print(f"\nScoring Guide:")
for k, v in sample['scoringGuide'].items():
    print(f"  {k}: {v[:120]}...")
print(f"\nViva Presentation:")
for k, v in sample['vivaPresentation'].items():
    print(f"  {k}: {v[:120]}...")
