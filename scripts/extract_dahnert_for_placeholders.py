#!/usr/bin/env python3
"""
Extract Dahnert content for 306 discriminator placeholder entries.

Searches dahnert_full.md for each condition, extracts imaging findings,
demographics, and distribution, then writes dahnert_patches.json.

Usage:
  python3 scripts/extract_dahnert_for_placeholders.py [--dry-run]
"""

import re
import json
import sys
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv

ROOT = Path(__file__).parent.parent
DAHNERT_MD = ROOT / "Bob's UK MLA" / "marker_output" / "dahnert_full.md"
OUTPUT_FILE = ROOT / "scripts" / "dahnert_patches.json"

# ── Load markdown ──────────────────────────────────────────────────────────────
print("Loading dahnert_full.md...")
with open(DAHNERT_MD) as f:
    lines = [l.rstrip('\n') for l in f]
print(f"Loaded {len(lines)} lines")


# ── Build section index ────────────────────────────────────────────────────────
def normalize(s: str) -> str:
    s = s.replace('\ufb01', 'fi').replace('\ufb02', 'fl')
    s = s.replace('\u2013', ' ').replace('\u2014', ' ')
    s = re.sub(r"[''''\u2019\u2018]", "", s)
    s = re.sub(r'[^a-z0-9 ]', ' ', s.lower())
    return re.sub(r'\s+', ' ', s).strip()


# Index: norm(name) -> (original_name, line_number)
section_index: dict[str, tuple[str, int]] = {}

for i, line in enumerate(lines):
    stripped = line.strip()
    if not stripped:
        continue

    # ### heading
    if stripped.startswith('### '):
        name = stripped[4:].strip()
        name = re.sub(r'\s+\d{1,4}\s*$', '', name)  # strip trailing page numbers
        key = normalize(name)
        if key and len(key) > 3:
            section_index.setdefault(key, (name, i))

    # ALL CAPS heading (standalone, not starting with list markers)
    elif (re.match(r'^[A-Z][A-Z0-9\s\-\/()\.,\'&\[\]]+$', stripped)
          and stripped[0].isalpha()
          and 5 <= len(stripped) <= 100
          and not stripped.startswith(('DDX', 'NB ', 'NOTE', 'SEE ', 'CF.'))):
        key = normalize(stripped)
        if key and len(key) > 3:
            section_index.setdefault(key, (stripped, i))

print(f"Indexed {len(section_index)} sections")


# ── Manual exact line mappings (diagnosis → line number) ─────────────────────
# These conditions exist in Dahnert but under different/variant names
MANUAL_MAPPINGS: dict[str, str] = {
    # Scleroderma
    "Scleroderma": "PROGRESSIVE SYSTEMIC SCLEROSIS",
    "Scleroderma-associated ILD": "PROGRESSIVE SYSTEMIC SCLEROSIS",
    # Thoratrast
    "Thoratrast": "THOROTRASTOSIS",
    # Thornwaldt cyst
    "Thornwaldt cyst": "TORNWALDT CYST",
    # Fat embolism
    "Fat emboli": "FAT EMBOLISM",
    # Subependymal giant cell astrocytoma
    "Subependymal giant cell astrocytoma": "SUBEPENDYMAL GIANT CELL TUMOR SGCT",
    # Hajdu-Cheney
    "Hajdu-Cheney syndrome": "HAJDU-CHENEY SYNDROME",
    # Plasmacytoma
    "Plasmacytoma": "EXTRAMEDULLARY PLASMACYTOMA",
    # Eosinophilic granuloma
    "Eosinophilic granuloma": "EOSINOPHILIC GRANULOMA",
    # Peliosis hepatis
    "Peliosis hepatis": "PELIOSIS",
    # Neurogenic bladder
    "Neurogenic bladder": "NEUROGENIC BLADDER",
    # Thrombosis
    "Thrombosis": "THROMBOSIS",
    # Vasculitis
    "Vasculitis": "VASCULITIS",
    # Rheumatoid arthritis
    "Rheumatoid arthritis": "RHEUMATOID ARTHRITIS",
    # Rounded atelectasis
    "Rounded atelectasis": "ROUNDED ATELECTASIS",
    # CMV
    "Cytomegalovirus (CMV)": "CYTOMEGALOVIRUS INFECTION",
    # Demyelinating disease
    "Demyelinating disease": "DEMYELINATING DISEASE",
    # Drug-induced
    "Drug-induced lung disease": "DRUG-INDUCED PULMONARY DISEASE",
    "Drug-induced esophagitis": "DRUG-INDUCED ESOPHAGITIS",
    # Epidural lipomatosis
    "Epidural lipomatosis": "EPIDURAL LIPOMATOSIS",
    # Esophageal carcinoma
    "Esophageal carcinoma": "CARCINOMA OF ESOPHAGUS",
    # Friedreich ataxia
    "Friedreich ataxia": "SPINOCEREBELLAR DEGENERATION",
    # Hypothalamic hamartoma - likely not a standalone section
    # Hypoxic-ischemic brain injury
    "Hypoxic-ischemic brain injury": "HYPOXIC-ISCHEMIC ENCEPHALOPATHY",
    # Lymphocytic interstitial pneumonitis
    "Lymphocytic interstitial pneumonitis (LIP)": "LYMPHOCYTIC INTERSTITIAL PNEUMONIA",
    # Morgagni hernia
    "Morgagni hernia": "MORGAGNI HERNIA",
    # Multiple hereditary exostoses
    "Multiple hereditary exostoses": "MULTIPLE HEREDITARY EXOSTOSES",
    # Psoriasis
    "Psoriasis": "PSORIATIC ARTHRITIS",
    # Pulmonary carcinoid
    "Pulmonary carcinoid": "BRONCHIAL CARCINOID",
    # Volvulus
    "Volvulus": "COLONIC VOLVULUS",
    # Primary sclerosing cholangitis
    "Primary sclerosing cholangitis (PSC)": "PRIMARY SCLEROSING CHOLANGITIS",
    # Eosinophilic
    "Alveolar sarcoidosis": "SARCOIDOSIS",
    # Pulmonary contusion
    "Pulmonary contusion": "PULMONARY CONTUSION",
    # Dissection
    "Dissection": "AORTIC DISSECTION",
    # Hiatal hernia
    "Hiatal hernia": "HIATAL HERNIA",
    # Pericarditis
    "Calcific pericarditis": "PERICARDITIS",
    # Teratoma - use ovary one as most complete
    "Teratoma": "TERATOMA OF OVARY",
    # Subdural hemorrhage
    "Subdural hemorrhage": "SUBDURAL HEMATOMA OF BRAIN",
    # Fat necrosis
    "Fat Necrosis": "FAT NECROSIS OF BREAST",
    "Fat necrosis": "FAT NECROSIS OF BREAST",
    # Parkinson
    "Parkinson disease": "PARKINSON DISEASE",
    # Renal duplication
    "Renal duplication": "RENAL DUPLICATION",
    # Metastases
    "Metastases": "METASTASES",
    "Metastasis": "METASTASES",
    "Metastatic disease": "METASTASES",
    "Metastases from a remote primary cancer": "METASTASES",
    # Pleural plaques
    "Pleural plaques": "PLEURAL PLAQUES",
    # Trauma
    "Trauma": "TRAUMATIC INJURIES",
    # Pregnancy
    "Pregnancy": "PREGNANCY",
    # Aneurysm
    "Aneurysm": "AORTIC ANEURYSM",
    "Iliac artery aneurysms": "ILIAC ARTERY ANEURYSM",
    # Healed varicella
    "Healed varicella": "VARICELLA",
    # Hematoma
    "Hematoma": "EPIDURAL HEMATOMA OF BRAIN",
    "Mediastinal hematoma": "MEDIASTINAL HEMORRHAGE",
    # Ischemia
    "Ischemia": "CEREBRAL ISCHEMIA",
    "Subacute infarct": "CEREBRAL INFARCTION",
    "Subacute infarction": "CEREBRAL INFARCTION",
    # Hemorrhage
    "Hemorrhage": "INTRACRANIAL HEMORRHAGE",
    "Subdural hemorrhage": "SUBDURAL HEMATOMA OF BRAIN",
    "Hypertensive hemorrhage": "HYPERTENSIVE HEMORRHAGE",
    # Cystic adventitial disease
    "Cystic adventitial disease": "CYSTIC ADVENTITIAL DISEASE",
    # Lymphatic malformation
    "Lymphatic malformation": "CYSTIC HYGROMA",
    # Endometritis
    "Endometritis": "ENDOMETRITIS",
    # Diaphragmatic eventration
    "Diaphragmatic eventration": "DIAPHRAGMATIC EVENTRATION",
    # Encephalocele
    "Encephalocele or myelomeningocele": "ENCEPHALOCELE",
    # Congenital syphilis
    "Congenital syphilis": "SYPHILIS",
    # Aortic transection
    "Aortic transection": "TRAUMATIC AORTIC INJURY",
    # Pulmonary carcinoid
    "Pulmonary carcinoid": "BRONCHIAL CARCINOID",
    # Caustic esophagitis
    "Caustic esophagitis": "CORROSIVE ESOPHAGITIS",
    # Pneumocystis
    "Pneumocystis (PJP)": "PNEUMOCYSTIS CARINII PNEUMONIA",
    "Pneumocystis pneumonia": "PNEUMOCYSTIS CARINII PNEUMONIA",
    # PSC
    "Primary sclerosing cholangitis (PSC)": "PRIMARY SCLEROSING CHOLANGITIS",
    # Sporadic OPCA
    "Sporadic olivopontocerebellar atrophy (OPCA)": "OLIVOPONTOCEREBELLAR ATROPHY",
    # Transverse myelitis
    "Transverse myelitis (TM)": "TRANSVERSE MYELITIS",
    # Drop metastases
    "Drop metastases": "LEPTOMENINGEAL CARCINOMATOSIS",
    # Lymphoproliferative
    "Lymphoproliferative disorder": "LYMPHOMA",
    # Vascular ring
    "Vascular ring": "VASCULAR RING",
    # Biliary hamartomas
    "Biliary hamartomas": "BILIARY HAMARTOMA",
    # Adenomyomatosis
    "Adenomyomatosis": "ADENOMYOMATOSIS",
    # Hepatic abscesses
    "Hepatic abscesses": "HEPATIC LIVER ABSCESS",
    # Fibrothorax
    "Fibrothorax": "FIBROTHORAX",
    # Gallbladder
    "Choledochal anomaly": "CHOLEDOCHAL CYST",
    # Perineural spread
    "Perineural spread of tumor": "PERINEURAL TUMOR SPREAD",
    # Toxocariasis
    "Toxocariasis": "TOXOCARIASIS",
    # Annuloaortic ectasia
    "Annuloaortic ectasia (cystic medial necrosis)": "ANNULOAORTIC ECTASIA",
    # Atherosclerosis
    "Atherosclerosis": "ATHEROSCLEROSIS",
    # Pneumonia
    "Necrotizing pneumonia": "NECROTIZING PNEUMONIA",
    # Abscess
    "Lung abscess": "PULMONARY ABSCESS",
    # Rheumatoid nodules
    "Rheumatoid nodules": "RHEUMATOID LUNG",
    # Epidural lipomatosis
    "Epidural lipomatosis": "EPIDURAL LIPOMATOSIS",
    # IPMN
    "IPMN (Intraductal Papillary Mucinous Neoplasm)": "INTRADUCTAL PAPILLARY MUCINOUS NEOPLASM",
    # Autoimmune pancreatitis
    "Autoimmune Pancreatitis": "AUTOIMMUNE PANCREATITIS",
    # Urethral injury
    "Urethral injury": "URETHRAL INJURY",
    # Shock bowel
    "Shock bowel": "ISCHEMIC ENTEROPATHY",
}


def find_in_index(name: str) -> tuple[str, int] | None:
    # 1. Check manual mappings first
    if name in MANUAL_MAPPINGS:
        target = normalize(MANUAL_MAPPINGS[name])
        if target in section_index:
            return section_index[target]

    n = normalize(name)

    # 2. Exact
    if n in section_index:
        return section_index[n]

    # 3. Strip parenthetical
    stripped = re.sub(r'\s*[\(\[].*?[\)\]]', '', name).strip()
    if stripped and stripped.lower() != name.lower():
        n2 = normalize(stripped)
        if n2 in section_index:
            return section_index[n2]

    # 4. Try parenthetical content alone (abbreviation expansion)
    paren = re.search(r'[\(\[](.*?)[\)\]]', name)
    if paren:
        inner = paren.group(1).strip()
        if len(inner) > 3:
            n3 = normalize(inner)
            if n3 in section_index:
                return section_index[n3]

    # 5. Singular form
    for suffix, replacement in [('ses', 's'), ('ies', 'y'), ('mata', 'ma'), ('es', ''), ('s', '')]:
        if n.endswith(suffix) and len(n) > len(suffix) + 4:
            singular = n[:-len(suffix)] + replacement
            if singular in section_index:
                return section_index[singular]
            break

    # Note: Removed broad word-matching to avoid false positives.
    # Manual mappings cover the known alternate names.

    return None


# ── Extract section content ────────────────────────────────────────────────────
def extract_section(start_line: int, max_lines: int = 150) -> list[str]:
    """Extract lines from start until next major heading."""
    section = []
    for j in range(start_line + 1, min(start_line + max_lines, len(lines))):
        line = lines[j]
        stripped = line.strip()

        # Stop at next ### heading
        if stripped.startswith('### '):
            break

        # Stop at ALL CAPS standalone heading (new section), but only after a few lines
        if (j > start_line + 5
                and stripped
                and re.match(r'^[A-Z][A-Z0-9\s\-\/()\.,\'&]+$', stripped)
                and stripped[0].isalpha()
                and 5 <= len(stripped) <= 100
                and not stripped.startswith('DDX')
                and not stripped.startswith('Cx')
                and not stripped.startswith('MRI')
                and not stripped.startswith('CT')
                and not stripped.startswith('US')
                and not stripped.startswith('NUC')
                and not stripped.startswith('ANGIO')):
            break

        section.append(line)
    return section


def parse_section(section_lines: list[str]) -> dict:
    """Parse a Dahnert section into structured fields."""
    text = '\n'.join(section_lines)

    # --- Demographics / definition ---
    demo_parts = []
    for pattern, label in [
        (r'Prevalence:\s*([^\n]+)', 'Prevalence'),
        (r'Frequency:\s*([^\n]+)', 'Frequency'),
        (r'Peak age:\s*([^\n]+)', 'Age'),
        (r'Age:\s+([^\n]+)', 'Age'),
        (r'M[÷:]\s*F[^\n]+', None),
        (r'(?:Cause|Etiology):\s*([^\n]+)', 'Cause'),
        (r'Histo(?:logy)?:\s*([^\n]+)', 'Histo'),
        (r'Associated with:\s*([^\n]+)', 'Associated'),
    ]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            val = (m.group(1).strip() if m.lastindex else m.group(0).strip())
            if val and len(val) > 5:
                prefix = f'{label}: ' if label else ''
                demo_parts.append(f'{prefix}{val[:200]}')

    demographics = '\n'.join(demo_parts[:5]).strip()[:600]

    # --- Location / distribution ---
    location_match = re.search(r'Location:\s*([^\n]+)', text, re.IGNORECASE)
    distribution = ''
    if location_match:
        distribution = location_match.group(1).strip()[:400]

    # --- Extract √ bullets with modality grouping ---
    modality_sections = []
    current_modality = 'GENERAL'
    current_bullets: list[str] = []

    modality_header_re = re.compile(
        r'^(RADIOGRAPH|XRAY|X-RAY|CXR|PLAIN FILM|CT|HRCT|NECT|CECT|MR|MRI|US|ULTRASOUND|NUC|SCINTIGRAPHY|PET|NUCLEAR|ANGIO|ANGIOGRAPHY|FLUORO|FLUOROSCOPY)\b',
        re.IGNORECASE
    )
    modality_label_map = {
        'RADIOGRAPH': 'RADIOGRAPH', 'XRAY': 'RADIOGRAPH', 'X-RAY': 'RADIOGRAPH',
        'CXR': 'RADIOGRAPH', 'PLAIN FILM': 'RADIOGRAPH',
        'CT': 'CT', 'HRCT': 'CT', 'NECT': 'CT', 'CECT': 'CT',
        'MR': 'MRI', 'MRI': 'MRI',
        'US': 'US', 'ULTRASOUND': 'US',
        'NUC': 'NUC MED', 'SCINTIGRAPHY': 'NUC MED', 'PET': 'NUC MED', 'NUCLEAR': 'NUC MED',
        'ANGIO': 'ANGIO', 'ANGIOGRAPHY': 'ANGIO',
        'FLUORO': 'FLUORO', 'FLUOROSCOPY': 'FLUORO',
    }

    def flush_modality():
        nonlocal current_bullets
        if current_bullets:
            bullets_str = '\n'.join(f'• {b}' for b in current_bullets[:8])
            modality_sections.append(f'{current_modality}:\n{bullets_str}')
        current_bullets = []

    for line in section_lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if it's a modality header line (e.g., "CT:", "MRI:", "US:")
        m = modality_header_re.match(stripped.rstrip(':'))
        if m and (stripped.endswith(':') or len(stripped) < 6):
            flush_modality()
            label_key = m.group(1).upper()
            current_modality = modality_label_map.get(label_key, label_key)
            continue

        # √ bullet
        if stripped.startswith('√'):
            bullet = re.sub(r'^√\s*', '', stripped).strip()
            if bullet and len(bullet) > 3:
                current_bullets.append(bullet)

    flush_modality()
    associated_findings = '\n\n'.join(modality_sections)[:1200]

    # --- Dominant finding: first √ bullet from GENERAL (or first overall) ---
    all_bullets = re.findall(r'√\s+([^\n√]+)', text)
    all_bullets = [b.strip() for b in all_bullets if b.strip() and len(b.strip()) > 5]
    dominant_finding = all_bullets[0][:400] if all_bullets else ''

    # --- Discriminating features: deduplicated subset of √ bullets ---
    discriminating = ''
    if all_bullets:
        # Take first 6 non-trivial bullets
        unique = list(dict.fromkeys(all_bullets))[:6]
        discriminating = '\n'.join(f'• {b}' for b in unique)[:600]

    # --- Complications ---
    cx_parts = []
    for pat in [
        r'Cx:\s*([^\n]+)',
        r'Complication[s]?:\s*([^\n]+)',
        r'Prognosis:\s*([^\n]+)',
        r'Rx:\s*([^\n]+)',
        r'Treatment:\s*([^\n]+)',
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            cx_parts.append(m.group(1).strip()[:200])
    complications = '\n'.join(cx_parts[:3]).strip()[:600]

    return {
        'demographicsClinicalContext': demographics or None,
        'distributionLocation': distribution or None,
        'dominantImagingFinding': dominant_finding or None,
        'discriminatingKeyFeature': discriminating or None,
        'associatedFindings': associated_findings or None,
        'complicationsSeriousAlternatives': complications or None,
    }


# ── All 256 unique placeholder diagnoses ──────────────────────────────────────
ALL_DIAGNOSES = [
    "ABPA","Abscess","Adenomyomatosis","Adnexal mass","Adnexal mass in a woman",
    "Air emboli","Alport syndrome","Alveolar sarcoidosis","Amyloid arthropathy",
    "Aneurysm","Angioedema","Annuloaortic ectasia (cystic medial necrosis)",
    "Aortic transection","Arcuate uterus","Arthropathy with calcified soft tissue nodule",
    "Asymmetric breast tissue","Atherosclerosis","Atypical infection (PML)","Autoimmune Pancreatitis",
    "Bacterial tracheitis","Bicornuate Uterus","Bilateral open-lip schizencephaly",
    "Biliary hamartomas","Biliary or portal venous gas","Bladder stone (Radiolucent)",
    "Blood clot","Brainstem glioma","COVID-19","Calcific pericarditis","Caustic esophagitis",
    "Central nervous system (CNS) infection","Cerebello-olivary degeneration",
    "Cerebral autosomal dominant arteriopathy (CADASIL)","Cerebrospinal fluid (CSF) pulsations",
    "Choledochal anomaly","Chronic HP (basilar)","Chronic transplant rejection",
    "Ciliary dyskinesia","Cocaine nose","Cochlear aplasia","Congenital syphilis",
    "Congenital thyroid lesion","Congestive hepatopathy","Connective tissue and granulomatous disorders",
    "Contusion","Cord ischemia","Corticosteroid use","Cyclosporine toxicity","Cyst with debris",
    "Cystic adventitial disease","Cystic neoplasm","Cystic pNET","Cystitis cystica",
    "Cytomegalovirus (CMV)","Dehiscent jugular bulb","Demyelinating disease",
    "Desmoplastic infantile glioma (DIG)","Diaphragmatic eventration","Dilated duct with debris",
    "Dissection","Drop metastases","Drug-induced esophagitis","Drug-induced lung disease",
    "Dystrophic Calcification","Eczema of the breast","Electronic artifact","Ellis-van Creveld syndrome",
    "Encephalocele or myelomeningocele","Endometritis","Eosinophilic granuloma","Epididymal TB",
    "Epidural lipomatosis","Esophageal carcinoma","Esophagitis with stricture","Exophytic pontine glioma",
    "Fat Necrosis","Fat emboli","Fat necrosis","Fetal demise","Fibrothorax","Focal colitis",
    "Free technetium","Friedreich ataxia","Fungal infection","Fungal infection (Aspergilloma)",
    "Fungus ball","Furosemide","Galactorrhea","Gel bleed","Gold therapy",
    "Granulomatous Prostatitis","Granulomatous disease","Haemophilus influenzae","Hajdu-Cheney syndrome",
    "Healed varicella","Hematoma","Hematometra","Hemiplegic migraine","Hemoglobinopathy",
    "Hemorrhage","Hemorrhage (anticoagulation)","Hemorrhagic cyst","Hepatic abscesses",
    "Hepatic pseudotumor","Herniation","Hiatal hernia","High-grade biliary obstruction",
    "Hypercoagulable conditions","Hypertensive hemorrhage","Hypervascular metastases (Renal, Carcinoid, Thyroid, Melanoma)",
    "Hypoglycaemia","Hypotension","Hypothalamic hamartoma","Hypoxic-ischemic brain injury",
    "IPMN (Intraductal Papillary Mucinous Neoplasm)","Iatrogenic","Idiopathic polyhydramnios",
    "Iliac artery aneurysms","Infected cyst","Infection","Infectious Enteritis",
    "Inferior vena cava thrombosis","Initial phase","Innominate artery compression syndrome",
    "Intraosseous ganglion cyst","Invasive aspergillosis","Infiltrated dose","Infiltrative disease",
    "Ischemia","Kernicterus","Limbic encephalitis","Lipohaemarthrosis","Lung abscess",
    "Lymphatic malformation","Lymphocytic interstitial pneumonitis (LIP)","Lymphoproliferative disorder",
    "Malignant primary cardiac neoplasm","Marchiafava-Bignami disease","Marked vesicoureteral reflux",
    "Mediastinal hematoma","Metabolic disease (hypothyroidism, rickets)","Metabolic leukoencephalopathy",
    "Metastases","Metastases from a remote primary cancer","Metastasis","Metastatic disease",
    "Metastatic disease (Renal)","Meyer dysplasia","Minor salivary gland tumor","Mitochondrial disorder",
    "Morgagni hernia","Multifocal HCC","Multiple hereditary exostoses","Multiple splenic infarcts",
    "Myeloproliferative/marrow infiltrative disorder","Myometrial Contraction","NSIP",
    "Necrotizing pneumonia","Neoplasm","Neurogenic bladder","Normal variant","Normal variant vasculature",
    "Obstructive lesion/mass","Ovarian Malignancy (Cystic)","Ovarian Malignancy with Torsion",
    "Ovarian cystic lesion","Papillary carcinoma","Papilloma","Parasites","Paratesticular rhabdomyosarcoma",
    "Parkinson disease","Partial nephrectomy","Peliosis hepatis","Pelvic Lymphomatosis",
    "Perineural spread of tumor","Peritoneal Lymphomatosis","Plasma cell granuloma","Plasmacytoma",
    "Pleural plaques","Pneumocystis (PJP)","Pneumocystis pneumonia","Polyps",
    "Post-operative Intussusception","Post-transplant arterial ischemia","Postoperative changes",
    "Postsurgical changes (vagotomy)","Postsurgical or postradiation changes","Postsurgical scar",
    "Pregnancy","Primary sclerosing cholangitis (PSC)","Prostaglandin therapy","Prostate protrusion",
    "Prostatic Cyst","Proximal Femoral Focal Deficiency","Psoas muscle hypertrophy","Psoriasis",
    "Pulmonary carcinoid","Pulmonary contusion","Pulmonary sling","Radiation","Radiation Enteritis",
    "Renal contusion","Renal duplication","Resolving contusion","Retained Products of Conception (RPOC)",
    "Retinopathy of prematurity (ROP)","Retroperitoneal Abscess","Rheumatoid arthritis",
    "Rheumatoid nodules","Rounded atelectasis","Scleroderma","Scleroderma-associated ILD",
    "Sclerosing Adenosis","Seizure (Todd's palsy)","Severe hepatocellular disease","Shock bowel",
    "Sloughed papillae","Small vessel disease","Solid Pseudopapillary Neoplasm (cystic component)",
    "Speed kidney","Spinal cord neoplasm with increased vascular flow",
    "Sporadic olivopontocerebellar atrophy (OPCA)","Status epilepticus","Steatocystoma multiplex",
    "Stromal fibrosis","Subacute infarct","Subacute infarction","Subdural hemorrhage",
    "Subependymal giant cell astrocytoma","Submucosal Fibroid","Succenturiate lobe",
    "Summation Artifact","Suture Calcification","Swallowed activity from sinusitis/pharyngitis",
    "Tamoxifen Effects","Tectal glioma","Teratoma","Thoratrast","Thornwaldt cyst",
    "Thrombosed popliteal artery aneurysm","Thrombosis","Toxic shock syndrome (TSS)",
    "Toxocariasis","Transplant rejection","Transverse myelitis (TM)","Trauma",
    "Trauma/iatrogenic","Tubular carcinoma","Urethral injury","Urinary obstruction",
    "Vascular ring","Vasculitis","Venolymphatic malformation","Viral infection",
    "Volvulus","Wharton jelly cyst",
]

# ── Process each diagnosis ─────────────────────────────────────────────────────
results: dict[str, dict] = {}
matched_count = 0
unmatched = []

for diag in ALL_DIAGNOSES:
    found = find_in_index(diag)
    if not found:
        unmatched.append(diag)
        continue

    heading_name, start_line = found
    section_lines = extract_section(start_line)
    parsed = parse_section(section_lines)

    # Only include if we got at least some content
    has_content = any(v for v in parsed.values() if v)
    if not has_content:
        unmatched.append(f'{diag} (no content)')
        continue

    results[diag] = {
        'matchedHeading': heading_name,
        'startLine': start_line,
        'fields': parsed,
    }
    matched_count += 1


print(f"\n=== Results ===")
print(f"Total unique diagnoses: {len(ALL_DIAGNOSES)}")
print(f"Matched with content: {matched_count}")
print(f"Unmatched/no-content: {len(unmatched)}")

print("\nFirst 30 matched:")
for diag, data in list(results.items())[:30]:
    fields = data['fields']
    dominant = (fields.get('dominantImagingFinding') or '')[:60]
    print(f"  '{diag}' → '{data['matchedHeading']}' | dom: {dominant}")

print(f"\nUnmatched ({len(unmatched)}):")
for d in unmatched:
    print(f"  '{d}'")

if not DRY_RUN:
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved {len(results)} entries to {OUTPUT_FILE}")
else:
    print("\n[DRY RUN - not saving]")
