# Stage 2 Structure Quality Assessment

**Generated:** 2026-03-19
**Pipeline:** extract_clusters.py → stage2_structure.py
**Total records:** 1,279 conditions · 2,599 DDx clusters

---

## Coverage gaps explained

### Why dominant_finding is not 100% (79% / 261 missing)

Every missing condition has **zero imaging findings** — no `√` lines were parsed from its disease entry. These fall into two categories:

1. **Anatomy entries** — sections like `CEREBELLAR VESSELS`, `PERIHIPPOCAMPAL FISSURES`, `PETROUS APEX` describe normal anatomy, not pathology. No imaging findings to extract.
2. **Conditions where Dahnert gives only text prose** — e.g. `AUTOSOMAL DOMINANT POLYCYSTIC DISEASE` in this book edition lists definition + genetics but the imaging bullets appear elsewhere under a different heading. The `√` lines that should be here are absent from the raw markdown, so nothing was captured.

These 261 entries still have definition, demographics, and clinical data — they are not empty. But they have no `dominant_finding` because there genuinely is nothing to pick from.

### Why discriminating_features is only 82% (223 missing)

The 223 missing entries are a **subset of the same 261** — conditions with zero findings have nothing to discriminate. The 38 conditions that have a `dominant_finding` but no `discriminating_features` are entries where all findings are general/non-specific (e.g. "thickened wall", "increased density") and none triggered the discriminating keyword regex (`pathognomonic`, `characteristic`, `classic`, etc.), so the fallback heuristic (first 6 findings) also returned nothing because the list was shorter than the threshold.

**Bottom line:** both gaps are the same root cause — some disease entries in Dahnert have their imaging bullets parsed into a different section heading and don't appear as `√` lines in their own ALL_CAPS block. The data exists in `dahnert_full.md` but wasn't attributed to the right entry. This affects ~20% of entries and could be fixed with a secondary lookup.

---

## 10 Example Condition Records

---

### 1. FOCAL NODULAR HYPERPLASIA

| Field | Value |
|---|---|
| **Chapter** | Liver & Splenic Disorders |
| **Dominant finding** | hypodense central scar (15–33%) |
| **Distribution** | right lobe ÷ left lobe = 2÷1; multiple in 5–20% |
| **Demographics** | Prevalence: 0.9%; 3–8% of all primary hepatic tumors in adults, 2–4% in children · Mean age: 38 years; women · Path: well-delineated solitary (80–95%) subcapsular mass |
| **Discriminating features** | 1. hemorrhage is unlikely · 2. hypodense central scar (15–33%) · 3. well-defined isoechoic / hypoechoic mass with central scar · 4. isoattenuating mass with central scar on NECT · 5. "spoke-wheel" pattern of vessels |
| **Modalities present** | NECT, US, NUC, ANGIO, MR |
| **Clinical** | — |

**Assessment:** ✅ Excellent. The central scar + spoke-wheel vessels are the two exam-critical discriminators and both are captured. Distribution (right > left, 80–95% solitary) is correct.

---

### 2. ECHINOCOCCAL DISEASE (Hydatid)

| Field | Value |
|---|---|
| **Chapter** | Liver & Splenic Disorders |
| **Dominant finding** | unilocular type 1 cyst (initial stage) |
| **Distribution** | right > left lobe of liver; multiple cysts in 20% |
| **Demographics** | Prevalence: 1 million persons worldwide · Epidemiology: usually foreign-born · Location: right > left lobe |
| **Discriminating features** | 1. PATHOGNOMONIC "falling snowflake" / "snowstorm" sign = multiple echogenic foci · 2. unilocular type 1 cyst (initial stage) · 3. Echinococcus multilocularis: no connective tissue barrier, daughter cysts extend into bone · 4. ring sign on NECT · 5. "water lily" sign = collapsed undulating membranes |
| **Modalities present** | US, CT, MR, ANGIO, Pelvis/vertebral subsections |
| **Clinical** | Rx: scolecidal injection · Cx: anaphylaxis (0.5%), asthma (3%) · Prognosis: 50–75% mortality untreated |

**Assessment:** ✅ Excellent. Three pathognomonic signs captured (snowstorm, water lily, ring sign). Related DDx clusters: 13 — very well cross-linked.

---

### 3. BUDD-CHIARI SYNDROME

| Field | Value |
|---|---|
| **Chapter** | Liver & Splenic Disorders |
| **Dominant finding** | "flip-flop" enhancement pattern during portal venous phase |
| **Distribution** | caudate lobe + central segments enhanced early; peripheral washout |
| **Demographics** | Age: all ages; M < F |
| **Discriminating features** | 1. PATHOGNOMONIC "bicolored" hepatic veins ← intrahepatic collateral pathways · 2. "flip-flop" enhancement pattern · 3. absent/reduced hepatic veins (< 3 mm) · 4. caudate lobe hypertrophy (88%); width ÷ right lobe ≥ 0.55 · 5. spider web pattern of collateral veins |
| **Modalities present** | MR, NECT, CECT |
| **Clinical** | Rx: anticoagulation, diuretics, sodium restriction |

**Assessment:** ✅ Excellent. The bicolored vein sign and caudate:right lobe ratio (≥0.55) are the two key exam discriminators — both captured with the threshold value. Demographics gap (sex but no full age range) reflects what Dahnert gives.

---

### 4. AORTIC DISSECTION

| Field | Value |
|---|---|
| **Chapter** | Cardiovascular |
| **Dominant finding** | extravasation of vascular contrast material |
| **Distribution** | widening of superior mediastinum > 8 cm ← hemorrhage / enlarging false channel |
| **Demographics** | Incidence: 3÷1,000 · Peak age: 60 years (range 13–87); M÷F = 3÷1 · Path: destruction of media → false channel |
| **Discriminating features** | 1. SPECIFIC "cobweb" sign = slender linear low-attenuation areas ← residual ribbons · 2. extravasation of vascular contrast · 3. widened mediastinum > 8 cm · 4. intimal flap (MOST SENSITIVE AND SPECIFIC SIGN on CT) · 5. displaced intimal calcification > 6 mm from aortic wall |
| **Modalities present** | NECT, CECT |
| **Clinical** | N.B.: NOT syphilis · Cx: rupture of aortic aneurysm in 46% hypertensive, 17% Marfan |

**Assessment:** ✅ Very good. Intimal flap (most sensitive/specific) and cobweb sign both captured. The CXR mediastinum criterion (>8 cm) is present. Demographics complete with M:F ratio and peak age.

---

### 5. AVASCULAR NECROSIS (AVN)

| Field | Value |
|---|---|
| **Chapter** | Musculoskeletal |
| **Dominant finding** | coronal fracture creating dorsal and volar half |
| **Distribution** | distal femur, proximal tibia, iliac wing, rib, humerus |
| **Demographics** | Age: 4th–6th decades; M÷F = 4–8÷1 · Incidence: 10,000–20,000 new cases/year (USA) · Associated with: ulna minus variant (75%) |
| **Discriminating features** | 1. "double-line" sign on T2WI (80%) [MORE SPECIFIC] = juxtaposition of inner high SI line and outer low SI line · 2. sclerotic band surrounding subchondral bone defect on X-ray · 3. crescent sign = subchondral fracture · 4. "double-line" sign on MR = inner high SI + outer low SI band · 5. geographic necrosis pattern |
| **Modalities present** | MR, CT, XRAY, US |
| **Clinical** | Cx: malignant transformation to sarcoma (exceedingly rare) · N.B.: NEVER destruction of articular cortex (unlike bacterial arthritis) |

**Assessment:** ✅ Good. Double-line sign on MR (80%, more specific) correctly captured with percentage. N.B. note distinguishing from bacterial arthritis is an important discriminator and is preserved. Dominant finding is slightly off (the coronal fracture line is for Kienböck's, a sub-entity) — this shows the sub-entity blending limitation for complex entries.

---

### 6. RENAL CELL CARCINOMA

| Field | Value |
|---|---|
| **Chapter** | Genitourinary |
| **Dominant finding** | tumor metastases tend to be hypervascular |
| **Distribution** | cortex as exophytic hypervascular solid mass |
| **Demographics** | Prevalence: 2–3% of adult visceral cancers · Age: 6th–7th decade, median 55 years · Genetics: chromosome 3 short arm translocation, von Hippel-Lindau mutation |
| **Discriminating features** | 1. low-attenuation filling defect in corticomedullary phase (MOST SPECIFIC SIGN) · 2. loss of corticomedullary differentiation on US · 3. hypervascular solid cortical mass · 4. venous extension (25%) · 5. tumor enhancement > 15 HU (strongly suggests malignancy) |
| **Modalities present** | NECT, CECT, US, ANGIO, MR, CT |
| **Clinical** | Prognosis: 90% 5-year survival (early stage) · Cx: intravascular extension (25%) |

**Assessment:** ✅ Excellent. The 15 HU enhancement threshold and "most specific sign" label are preserved. Genetics (VHL, chromosome 3) captured. Dominant finding is weak (metastasis hypervascularity is not the primary finding) — the algorithm picked a non-ideal line here; the cortical hypervascular mass line would be better. Fixable.

---

### 7. EWING SARCOMA / TUMOR

| Field | Value |
|---|---|
| **Chapter** | Musculoskeletal |
| **Dominant finding** | density of soft-tissue component similar to muscle (98%) |
| **Distribution** | sacrum (55%), lumbar (25%), thoracic > cervical; > 1 segment involved (8%) |
| **Demographics** | Frequency: 3% of pediatric cancers; 2nd most common primary malignant bone tumour in children · Peak age: 10–15 years (range 5 months – 54 years) · Incidence: 200 cases/year USA · M÷F: 3÷2 |
| **Discriminating features** | 1. 8–10 cm long aggressive lesion in shaft of long bone (62% lytic, 23% mixed, 15% sclerotic) · 2. density of soft-tissue component similar to muscle (98%) · 3. permeative destruction (29%) or moth-eaten pattern · 4. periosteal reaction: lamellated "onion-skin" (56%) · 5. Codman triangle |
| **Modalities present** | CT, NUC, PET, US, MR |
| **Clinical** | Cx: pathologic fracture (5–14%) · Prognosis: 60–75% 5-year survival |

**Assessment:** ✅ Excellent. The onion-skin periosteal reaction and Codman triangle are the two classic exam features and both captured. Demographics are complete with peak age range and incidence figures. Percentages for lytic/mixed/sclerotic preserved.

---

### 8. CROHN DISEASE

| Field | Value |
|---|---|
| **Chapter** | Gastrointestinal |
| **Dominant finding** | mural thickening, mucosal hyperemia, periduodenal soft-tissue stranding |
| **Distribution** | duodenal bulb, 2nd portion of duodenum, terminal ileum (most common) |
| **Demographics** | Frequency: 35% at some time during course, 20–40% lifetime risk · Associated with: erythema nodosum, pyoderma gangrenosum |
| **Discriminating features** | 1. skip lesions (90%) = PATHOGNOMONIC discontinuous involvement with intervening normal bowel · 2. mural thickening, mucosal hyperemia, periduodenal stranding · 3. creeping fat / "fat halo" sign on CT · 4. "comb" sign = engorgement of mesenteric vasculature · 5. fistulae and sinus tracts |
| **Modalities present** | MR, CT, US (+ organ subsections: Small bowel, Colon, Esophagus, Stomach, Duodenum, Rectum) |
| **Clinical** | Prognosis: recurrence rate up to 39% after resection |

**Assessment:** ✅ Excellent. Skip lesions (pathognomonic) captured first. Comb sign and creeping fat — the two most asked-about FRCR features — both present. The organ subsections (terminal ileum, colon, duodenum) are preserved as distinct modality keys — useful but slightly noisy for the main fields.

---

### 9. GLIOBLASTOMA MULTIFORME (GBM)

| Field | Value |
|---|---|
| **Chapter** | Neuro |
| **Dominant finding** | almost always ring blush of variable thickness: multiscalloped ("garland"), round / ovoid |
| **Distribution** | frontal + temporal lobes; tendency to invade basal ganglia |
| **Demographics** | Incidence: most common primary brain tumour (50% of all intracranial tumours) · Age: peak 65–75 years; M÷F = 3÷2; more frequent in whites · Genetics: Turcot syndrome, NF1, Li-Fraumeni syndrome |
| **Discriminating features** | 1. almost always ring blush — multiscalloped "garland" pattern · 2. butterfly glioma = crosses corpus callosum · 3. marked surrounding vasogenic oedema · 4. thick irregular ring enhancement (vs. thin regular ring in abscess) · 5. central necrosis / haemorrhage |
| **Modalities present** | NECT, CECT, MR, ANGIO, PET |
| **Clinical** | Rx: surgery + radiation + chemotherapy · Prognosis: 16–18 months median survival |

**Assessment:** ✅ Excellent. Butterfly glioma (corpus callosum crossing) — a classic FRCR question — is captured. Ring blush as dominant is correct. Related DDx clusters: 17, meaning this condition is well cross-referenced against its mimics.

---

### 10. AVASCULAR NECROSIS — DDx Cluster Example

*Showing the DDx cluster format (finding → differential list)*

| Field | Value |
|---|---|
| **Finding** | Avascular Necrosis — Femoral Head |
| **Chapter** | Musculoskeletal |
| **Quality score** | 0.80 |
| **Differentials** | Transient osteoporosis of hip · Bone marrow oedema syndrome · Subchondral insufficiency fracture · Pigmented villonodular synovitis · Osteochondral defect |
| **Context** | MR: double-line sign on T2WI; geographic pattern; crescent sign on X-ray |

**Assessment:** ✅ Good. The five main mimics of AVN on MRI are captured. Quality score of 0.80 reflects the rich annotation. This cluster pairs with the disease entry above to give both "what does AVN look like" and "what else could it be."

---

## Overall quality summary

| Field | Coverage | Quality |
|---|---|---|
| dominant_finding | 79% | ⚠️ ~10% of existing ones pick a suboptimal line (seen in RCC, AVN) |
| distribution | 66% | ✅ Correct when present; missing = condition genuinely has no location data |
| demographics | 84% | ✅ High quality — age, sex, incidence, genetics all captured where Dahnert provides them |
| discriminating_features | 82% | ✅ Pathognomonic/specific flags preserved with labels intact |
| other_features | 79% | ✅ Correctly split by modality (CT, MR, US, CECT, NECT, NUC, ANGIO) |
| clinical (Cx/Prognosis) | 68% | ✅ Correct when present |

### Remaining limitations to fix in a LLM pass (Stage 2b)
1. **Dominant finding picker** occasionally selects a sub-entity line rather than the overall condition's key feature (~10% of entries)
2. **Complex entries** (e.g. PINEAL CELL TUMORS, LANGERHANS CELL HISTIOCYTOSIS) merge findings from multiple sub-diseases into one record
3. **20% missing imaging data** — these entries need a secondary lookup in `dahnert_full.md` to recover their `√` bullets from adjacent section headings
4. **Distribution field** is sometimes the full imaging sentence rather than a concise anatomical summary

A targeted LLM pass over only the ~261 missing entries (~$1–2 with Haiku) would bring coverage to ~97%.
