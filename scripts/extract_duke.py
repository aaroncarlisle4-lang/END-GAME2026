#!/usr/bin/env python3
"""
Extract all ~291 cases from Duke Radiology Case Review PDF.
Outputs a JSON file with structured case data.
"""
import fitz
import re
import json
import os

DUKE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "Knowledge source",
    "Longs",
)

# Find the Duke PDF
duke_file = None
for f in os.listdir(DUKE_PATH):
    if "Duke" in f and f.endswith(".pdf"):
        duke_file = os.path.join(DUKE_PATH, f)
        break

if not duke_file:
    raise FileNotFoundError("Duke PDF not found")

# Chapter mapping: Duke chapter name -> our category abbreviation
CHAPTER_TO_CATEGORY = {
    "Chest Radiology": "Chest",
    "Breast Imaging": "Breast",
    "Gastrointestinal": "GI",
    "Genitourinary": "GU",
    "Musculoskeletal": "MSK",
    "Neuroradiology": "Neuro",
    "Vascular": "VIR",
    "Pediatric": "Paeds",
    "Ultrasound": "US",
    "Nuclear Medicine": "NucMed",
    "Cardiac": "Cardiac",
}

CHAPTER_NUMBERS = {
    "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5,
    "SIX": 6, "SEVEN": 7, "EIGHT": 8, "NINE": 9, "TEN": 10, "ELEVEN": 11,
}

# Modality detection from figure descriptions
def detect_modality(figures_text):
    """Detect primary modality from figure descriptions."""
    text = figures_text.lower()
    if "mri" in text or "mr image" in text or "t1-weighted" in text or "t2-weighted" in text or "mr angiograph" in text:
        return "MRI"
    if "ct " in text or "computed tomography" in text or "ct(" in text:
        return "CT"
    if "ultrasound" in text or "sonograph" in text or "doppler" in text:
        return "US"
    if "mammogra" in text:
        return "XR"
    if "fluoroscop" in text or "barium" in text or "esophagram" in text:
        return "Fluoro"
    if "angiogra" in text or "arteriogra" in text or "venogra" in text:
        return "Angio"
    if "scintigra" in text or "bone scan" in text or "pet" in text or "spect" in text or "nuclear" in text or "technetium" in text:
        return "NM"
    if "radiograph" in text or "chest x-ray" in text or "plain film" in text or "x-ray" in text:
        return "XR"
    return "CT"  # Default


def extract_all_text(doc):
    """Extract all text from doc, page by page."""
    pages = []
    for i in range(len(doc)):
        pages.append(doc[i].get_text())
    return pages


def merge_pages(pages):
    """Merge all pages into one big string, keeping page markers."""
    parts = []
    for i, text in enumerate(pages):
        parts.append(f"<<<PAGE_{i}>>>")
        parts.append(text)
    return "\n".join(parts)


def parse_cases(full_text):
    """Parse the full text into individual cases."""
    cases = []

    current_chapter = "Unknown"
    current_chapter_num = 0

    # Split by CASE N pattern
    # Pattern: CASE followed by a number, possibly with chapter context
    case_pattern = re.compile(
        r'(?:Chapter\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN)\s*\n\s*(.*?)(?=\n))?'
        r'.*?CASE\s+(\d+)\s*\n',
        re.DOTALL
    )

    # Find all chapter headers first
    chapter_positions = []
    for m in re.finditer(r'Chapter\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN)\s*\n\s*(.+?)(?:\s*\n)', full_text):
        chap_word = m.group(1)
        chap_name = m.group(2).strip()
        # Try to match to known chapter
        for key in CHAPTER_TO_CATEGORY:
            if key.lower() in chap_name.lower():
                chapter_positions.append((m.start(), key, CHAPTER_NUMBERS.get(chap_word, 0)))
                break

    # Find all CASE N positions
    case_positions = []
    for m in re.finditer(r'CASE\s+(\d+)\s*\n', full_text):
        case_num = int(m.group(1))
        case_positions.append((m.start(), m.end(), case_num))

    # Assign chapters to cases
    def get_chapter_at(pos):
        best = ("Unknown", 0)
        for cp, name, num in chapter_positions:
            if cp < pos:
                best = (name, num)
        return best

    # Extract text between consecutive cases
    for idx, (start, end, case_num) in enumerate(case_positions):
        # Get end of this case (start of next case, or end of text)
        if idx + 1 < len(case_positions):
            case_end = case_positions[idx + 1][0]
        else:
            case_end = len(full_text)

        case_text = full_text[end:case_end]
        chapter_name, chapter_num = get_chapter_at(start)

        case_data = parse_single_case(case_text, case_num, chapter_name, chapter_num)
        if case_data:
            cases.append(case_data)

    return cases


def parse_single_case(text, case_num, chapter_name, chapter_num):
    """Parse a single case's text into structured data."""

    # Extract HISTORY
    history = ""
    hist_match = re.search(r'HISTORY\s*\n(.+?)(?=FIGURE|DIFFERENTIAL|DIAGNOSIS)', text, re.DOTALL)
    if hist_match:
        history = clean_text(hist_match.group(1))

    # Extract FIGURE descriptions (these contain findings)
    figures = []
    for fm in re.finditer(r'FIGURE\s+[\d\-]+[A-Z]?\s+(.+?)(?=FIGURE|DIFFERENTIAL|DIAGNOSIS|KEY FACTS)', text, re.DOTALL):
        figures.append(clean_text(fm.group(1)))
    figures_text = " ".join(figures)

    # Extract DIFFERENTIAL DIAGNOSIS section
    differentials = []
    diff_section = ""
    diff_match = re.search(r'DIFFERENTIAL DIAGNOSIS\s*\n(.+?)(?=\nDIAGNOSIS\b)', text, re.DOTALL)
    if diff_match:
        diff_section = diff_match.group(1)
        # Parse individual differentials: "Name: explanation"
        for dm in re.finditer(r'([A-Z][A-Za-z\s\'\-,]+?):\s+(.+?)(?=[A-Z][A-Za-z\s\'\-,]+?:|$)', diff_section, re.DOTALL):
            name = dm.group(1).strip()
            explanation = clean_text(dm.group(2))
            if len(name) < 80 and len(name) > 2:
                differentials.append(f"{name}: {explanation}")

    # Extract DIAGNOSIS
    diagnosis = ""
    diag_match = re.search(r'\nDIAGNOSIS\s*\n(.+?)(?=\nKEY FACTS|\nSUGGESTED)', text, re.DOTALL)
    if diag_match:
        diagnosis = clean_text(diag_match.group(1))
        # Take first line if multi-line
        diagnosis = diagnosis.split('\n')[0].strip()

    # Extract KEY FACTS
    key_facts_clinical = []
    key_facts_radiologic = []
    kf_match = re.search(r'KEY FACTS\s*\n(.+?)(?=SUGGESTED READING|CASE\s+\d+|$)', text, re.DOTALL)
    if kf_match:
        kf_text = kf_match.group(1)
        # Split into Clinical and Radiologic
        clinical_match = re.search(r'Clinical\s*\n(.+?)(?=Radiologic|$)', kf_text, re.DOTALL)
        radio_match = re.search(r'Radiologic\s*\n(.+?)(?=SUGGESTED|CASE|$)', kf_text, re.DOTALL)

        if clinical_match:
            for bullet in re.findall(r'[■●]\s*(.+?)(?=[■●]|$)', clinical_match.group(1), re.DOTALL):
                b = clean_text(bullet)
                if b:
                    key_facts_clinical.append(b)
            # Also try splitting by leading spaces/newlines (common pattern)
            if not key_facts_clinical:
                for line in clinical_match.group(1).split('\n'):
                    line = line.strip()
                    if line and len(line) > 10 and not line.startswith('Clinical'):
                        key_facts_clinical.append(line)

        if radio_match:
            for bullet in re.findall(r'[■●]\s*(.+?)(?=[■●]|$)', radio_match.group(1), re.DOTALL):
                b = clean_text(bullet)
                if b:
                    key_facts_radiologic.append(b)
            if not key_facts_radiologic:
                for line in radio_match.group(1).split('\n'):
                    line = line.strip()
                    if line and len(line) > 10 and not line.startswith('Radiologic') and not line.startswith('SUGGESTED'):
                        key_facts_radiologic.append(line)

    # Detect modality
    modality = detect_modality(figures_text + " " + text[:500])

    category = CHAPTER_TO_CATEGORY.get(chapter_name, "Unknown")

    if not diagnosis and not history:
        return None

    return {
        "chapterNum": chapter_num,
        "chapterName": chapter_name,
        "category": category,
        "caseNumInChapter": case_num,
        "clinicalHistory": history,
        "figureDescriptions": figures_text,
        "differentials": differentials,
        "diagnosis": diagnosis,
        "keyFactsClinical": key_facts_clinical,
        "keyFactsRadiologic": key_facts_radiologic,
        "modality": modality,
        "title": diagnosis if diagnosis else f"{chapter_name} Case {case_num}",
    }


def clean_text(text):
    """Clean extracted text."""
    # Remove page markers
    text = re.sub(r'<<<PAGE_\d+>>>', '', text)
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove figure references that snuck in
    text = re.sub(r'FIGURE\s+[\d\-]+[A-Z]?\s*', '', text)
    return text


def main():
    print(f"Opening: {duke_file}")
    doc = fitz.open(duke_file)
    print(f"Total pages: {len(doc)}")

    pages = extract_all_text(doc)
    full_text = merge_pages(pages)

    print("Parsing cases...")
    cases = parse_cases(full_text)

    # Stats
    by_chapter = {}
    for c in cases:
        ch = c["category"]
        if ch not in by_chapter:
            by_chapter[ch] = 0
        by_chapter[ch] += 1

    print(f"\nExtracted {len(cases)} cases:")
    for ch, count in sorted(by_chapter.items()):
        print(f"  {ch}: {count}")

    # Save
    output = os.path.join(os.path.dirname(__file__), "..", "convex", "data", "dukeCases.json")
    with open(output, "w") as f:
        json.dump(cases, f, indent=2)
    print(f"\nSaved to {output}")

    # Print first 3 cases as sample
    print("\n=== SAMPLE CASES ===")
    for c in cases[:3]:
        print(f"\n--- {c['category']} Case {c['caseNumInChapter']}: {c['diagnosis']} ---")
        print(f"  History: {c['clinicalHistory'][:150]}...")
        print(f"  Modality: {c['modality']}")
        print(f"  Differentials: {len(c['differentials'])}")
        print(f"  Key Facts (Clinical): {len(c['keyFactsClinical'])}")
        print(f"  Key Facts (Radiologic): {len(c['keyFactsRadiologic'])}")


if __name__ == "__main__":
    main()
