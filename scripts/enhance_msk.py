#!/usr/bin/env python3
"""
Enhance all Duke MSK cases:
1. Generate findings for 11 shell cases (from keyFactsRadiologic)
2. Generate scoring guides + viva scripts for all 25 Duke MSK cases missing them
"""
import json

with open("convex/data/dukeCases.json") as f:
    duke_all = json.load(f)

msk = [c for c in duke_all if c.get("category") == "MSK"]
print(f"Total MSK Duke cases: {len(msk)}")

# --- PART 1: Build findings for shell cases ---

def build_findings_from_facts(case):
    """Build structured findings text from keyFactsRadiologic."""
    rad = case.get("keyFactsRadiologic", [])
    modality = case.get("modality", "imaging")
    diag = case.get("diagnosis", "")

    if not rad:
        return ""

    # Take first 3-5 key radiologic facts as structured findings
    finding_parts = []
    for i, fact in enumerate(rad[:5]):
        # Clean up and truncate
        fact = fact.strip()
        if len(fact) > 300:
            fact = fact[:297] + "..."
        if fact:
            finding_parts.append(fact)

    return " ".join(finding_parts)


shell_findings_updates = []
for case in msk:
    if not case.get("figureDescriptions", "").strip():
        case_num = 1001 + duke_all.index(case)
        findings = build_findings_from_facts(case)
        if findings:
            shell_findings_updates.append({
                "caseNumber": case_num,
                "findings": findings,
            })

print(f"Shell cases with generated findings: {len(shell_findings_updates)}")

# --- PART 2: Scoring guides + viva for all 25 that need them ---
# Cases 1114,1117,1119,1123,1133 already have scoring/viva (high-yield)
ALREADY_ENHANCED = {1114, 1117, 1119, 1123, 1133}

def generate_scoring_guide(case):
    diag = case.get("diagnosis", "this condition")
    diffs = case.get("differentials", [])
    diff_names = [d.split(":")[0].strip() for d in diffs[:3]]
    modality = case.get("modality", "imaging")
    rad_facts = case.get("keyFactsRadiologic", [])
    clin_facts = case.get("keyFactsClinical", [])
    key_finding = rad_facts[0][:200] if rad_facts else "the key imaging findings"
    secondary_finding = rad_facts[1][:200] if len(rad_facts) > 1 else "associated features"
    clinical_point = clin_facts[0][:200] if clin_facts else "the clinical context"

    score4 = f"Candidate fails to identify the primary abnormality on {modality}. Does not offer {diag} or any reasonable differential. Unable to describe the key imaging features systematically. May misidentify normal structures as abnormal."
    score5 = f"Candidate identifies there is an abnormality but describes findings poorly or incompletely. May suggest {diag} as one of several differentials but cannot explain why it is the most likely diagnosis. Limited understanding of {key_finding[:100]}. Does not discuss management appropriately."
    diff_str = " or ".join(diff_names[:2]) if diff_names else "the key differentials"
    score6 = f"Candidate identifies the main abnormality and correctly suggests {diag} as the primary diagnosis. Can describe most key findings. Offers a reasonable differential including {diff_str}. Discusses basic management but may miss important points about {clinical_point[:100]}."
    score7 = f"Candidate systematically describes all key imaging findings and confidently reaches the correct diagnosis of {diag}. Provides a well-reasoned differential diagnosis with clear discriminating features. Demonstrates understanding of {secondary_finding[:100]}. Discusses appropriate next steps and management including MDT discussion where relevant."
    score8 = f"Candidate provides an exemplary structured presentation. Immediately identifies {diag} with a comprehensive description of all imaging features. Offers a prioritised differential with specific discriminators for each. Demonstrates detailed knowledge of {key_finding[:100]} and {clinical_point[:100]}. Discusses management confidently with awareness of guidelines, complications, and prognosis. Would impress an examiner with breadth and depth of knowledge."

    return {"score4": score4, "score5": score5, "score6": score6, "score7": score7, "score8": score8}


def generate_viva_presentation(case):
    diag = case.get("diagnosis", "this condition")
    history = case.get("clinicalHistory", "")
    diffs = case.get("differentials", [])
    diff_names = [d.split(":")[0].strip() for d in diffs[:3]]
    modality = case.get("modality", "imaging")
    rad_facts = case.get("keyFactsRadiologic", [])
    clin_facts = case.get("keyFactsClinical", [])
    figures = case.get("figureDescriptions", "")
    key_findings_text = figures[:300] if figures else (rad_facts[0][:300] if rad_facts else "the primary imaging abnormality")

    opening = f"This is a {modality} study of a patient presenting with {history[:150] if history else 'the described clinical scenario'}. I will systematically describe the findings."
    anchor = f"The key abnormality is {key_findings_text[:200]}."
    sys_approach_parts = rad_facts[:3] if rad_facts else ["I would systematically review all structures"]
    systematic = " ".join([s[:150] for s in sys_approach_parts])
    synthesis = f"Taken together, the clinical history and imaging findings are most consistent with {diag}."

    if diff_names:
        diff_reasoning = f"The differential diagnosis includes {', '.join(diff_names[:3])}. {diag} is the most likely diagnosis because of the combination of clinical and imaging features described."
    else:
        diff_reasoning = f"The appearances are characteristic of {diag}."

    urgency_keywords = {
        "emergency": ["rupture", "acute", "hemorrhage", "infarct", "obstruction", "perforation", "dissection", "fracture", "necrotizing", "dislocation", "septic"],
        "urgent": ["malignant", "cancer", "carcinoma", "lymphoma", "sarcoma", "tumor", "mass", "abscess", "osteosarcoma", "plasmacytoma"],
        "routine": ["benign", "cyst", "chronic", "degenerative"],
    }
    diag_lower = diag.lower()
    urgency_level = "semi-urgent"
    for level, keywords in urgency_keywords.items():
        if any(kw in diag_lower for kw in keywords):
            urgency_level = level
            break

    if urgency_level == "emergency":
        urgency = "This is an emergency presentation requiring immediate clinical discussion and urgent management. I would contact the referring team directly."
    elif urgency_level == "urgent":
        urgency = "This requires urgent discussion at MDT. I would recommend tissue diagnosis if not already obtained, and staging investigations as appropriate."
    else:
        urgency = "I would recommend clinical correlation and follow-up imaging as appropriate. MDT discussion should be considered."

    pearl = clin_facts[0] if clin_facts else ""
    examiner_tip = f"Key teaching point: {pearl[:200]}." if pearl else f"Remember to mention the classic imaging features of {diag} and the key discriminating features from the differential."

    return {
        "opening": opening,
        "anchorStatement": anchor,
        "systemicApproach": systematic,
        "synthesis": synthesis,
        "differentialReasoning": diff_reasoning,
        "clinicalUrgency": urgency,
        "examinerTip": examiner_tip,
    }


scoring_viva_updates = []
for case in msk:
    case_number = 1001 + duke_all.index(case)
    if case_number in ALREADY_ENHANCED:
        continue

    scoring = generate_scoring_guide(case)
    viva = generate_viva_presentation(case)
    scoring_viva_updates.append({
        "caseNumber": case_number,
        "scoringGuide": scoring,
        "vivaPresentation": viva,
    })

print(f"Scoring/viva updates: {len(scoring_viva_updates)}")

# Save both outputs
with open("convex/data/mskShellFindings.json", "w") as f:
    json.dump(shell_findings_updates, f, indent=2)

with open("convex/data/mskScoringViva.json", "w") as f:
    json.dump(scoring_viva_updates, f, indent=2)

# Print samples
print(f"\n=== SAMPLE SHELL FINDINGS: Case #{shell_findings_updates[0]['caseNumber']} ===")
print(shell_findings_updates[0]['findings'][:300])

print(f"\n=== SAMPLE SCORING/VIVA: Case #{scoring_viva_updates[0]['caseNumber']} ===")
s = scoring_viva_updates[0]
print(f"Score 6: {s['scoringGuide']['score6'][:150]}...")
print(f"Opening: {s['vivaPresentation']['opening'][:150]}...")
