# DDx Cluster Examples — Post Decision-Tree Handler (v2)

**Generated:** 2026-03-19
**Pipeline version:** extract_clusters.py + stage2_structure.py with framework detection + sub-site merging
**Total clusters:** 5,412 · differential: 5,058 (93.5%) · framework: 50 (0.9%) · mixed: 304 (5.6%)
**Sub-site items merged:** 362

These 10 examples demonstrate all three cluster types and the sub-site merge fix.

---

## 1. FRAMEWORK — SPN Morphological Decision Tree

**Finding:** Morphologic Evaluation of Solitary Pulmonary Nodule
**cluster_type:** `framework`  **quality_score:** 0.767

This is the flagship framework cluster. Dahnert lists SIZE, MARGIN/EDGE, CONTOUR, SATELLITE LESION, LOCATION as the "differentials" — but these are feature categories, not diagnoses. Stage 2 now correctly classifies this as a decision tree and extracts the criteria into the `criteria` JSONB column rather than presenting them as diseases in a comparison table.

| Category | Key criteria extracted |
|---|---|
| **SIZE** | < 3 mm: 99.8% benign · 4–7 mm: 99.1% benign · 8–20 mm: 82% benign · > 20 mm: 50% benign · > 30 mm: >93% malignant |
| **MARGIN / EDGE** | Smooth well-defined = likely benign (21% malignant) · Corona radiata/spiculated = 89% malignant · Pleural tag = 25% malignant |
| **SATELLITE LESION** | In 99% inflammatory (often TB) · In 1% primary lung cancer |

**Assessment:** ✅ Correctly classified as `framework`. Criteria are in `criteria` JSONB not `differentials`. Stage 2 will render this as a decision tree / reference table, not a "which disease is it?" comparison.

---

## 2. FRAMEWORK — Congenital Anomalies of Pulmonary Veins

**Finding:** Congenital Anomalies of Pulmonary Veins
**cluster_type:** `framework`  **quality_score:** 0.567

Category headers are ANOMALIES IN NUMBER and ANOMALIES IN DIAMETER — these are anatomical classification buckets, not diagnoses.

| Category | Items underneath |
|---|---|
| **ANOMALIES IN NUMBER** | Anomalous unilateral single pulmonary vein (= meandering pulmonary vein) |
| **ANOMALIES IN DIAMETER** | Congenital unilateral pulmonary vein stenosis / atresia · Pulmonary vein varix |

**Context (√ lines):** Serpentine tubular opacity adjacent to lung hilum · Small lung with ipsilateral mediastinal deviation · Reticular opacities with Kerley B lines

**Assessment:** ✅ Correctly classified as `framework`. The ALL-CAPS category headers triggered the `_FRAMEWORK_ITEM_RE` regex (≤4 words, predominantly uppercase). The actual diagnoses underneath the headers are preserved in `differentials` with the category as their parent — useful for building a classification tree.

---

## 3. MIXED — Increased Pulmonary Vasculature

**Finding:** Increased Pulmonary Vasculature
**cluster_type:** `mixed`  **quality_score:** 0.867

This cluster has both ALL-CAPS category headers (OVERCIRCULATION, PULMONARY VENOUS HYPERTENSION) and real diagnoses (Thyrotoxicosis, Anemia, Pregnancy) underneath them.

| # | Item | Type |
|---|---|---|
| 1 | **OVERCIRCULATION** = shunt vascularity | Category header |
| 2 | **L-R shunts** | Sub-category |
| 3 | **Admixture cyanotic lesions** | Sub-category |
| 4 | **Thyrotoxicosis** | ✅ Real diagnosis |
| 5 | **Anemia** | ✅ Real diagnosis |
| 6 | **Pregnancy** | ✅ Real diagnosis (sub-site: "Peripheral arteriovenous fistula" merged back in) |
| 7 | **PULMONARY VENOUS HYPERTENSION** | Category header |

**Context (√ lines):** Diameter of right descending pulmonary artery larger than trachea just above aortic knob · Kissing cousin sign · Kerley lines · Alveolar oedema

**Assessment:** ✅ Correctly classified as `mixed` (category headers present but < 40% of total items, so not pure framework). Stage 2 can extract the real diagnoses and flag the category headers as section dividers. Note: "Pregnancy [Peripheral arteriovenous fistula]" shows the sub-site merge in action — the square bracket suffix was added by `merge_sub_sites()`.

---

## 4. DIFFERENTIAL — Posterior Mediastinal Mass (Quality 0.9)

**Finding:** Posterior Mediastinal Mass
**cluster_type:** `differential`  **quality_score:** 0.9

The three-tier neurogenic tumour hierarchy is preserved. Frequencies are in the `frequency` field of each differential item.

| # | Differential | Frequency |
|---|---|---|
| 1 | Schwannoma (neurilemmoma) | 32% |
| 2 | Neurofibroma | 10% · 3rd–4th decade |
| 3 | Malignant schwannoma | — |
| 4 | Ganglioneuroma | 23–38% · 2nd most common |
| 5 | Neuroblastoma | 15% · < 10 years · highly malignant |
| 6 | Ganglioneuroblastoma | 14% · spontaneous maturation possible |
| 7 | Chemodectoma / paraganglioma | 4% |
| 8 | Phaeochromocytoma | — |

**Context (√ lines):** 80% round mass with pleural sulcus · 73% lower attenuation than muscle · Rib spreading · Foraminal enlargement (dumbbell lesion) · Vertebral scalloping · Scoliosis

**Assessment:** ✅ Excellent. Adult vs childhood distinction preserved. Peripheral nerve / sympathetic / paraganglia hierarchy intact. Dumbbell lesion / foraminal enlargement in context. No anatomy bleed detected.

---

## 5. DIFFERENTIAL — Aortic Regurgitation Causes (Quality 0.967)

**Finding:** Intrinsic Aortic Valve Disease (causes of AR)
**cluster_type:** `differential`  **quality_score:** 0.967

High-quality cluster with detailed causes and pathognomonic signs.

| # | Differential | Notes |
|---|---|---|
| 1 | Congenital bicuspid valve | — |
| 2 | Rheumatic endocarditis | Most common in developing world |
| 3 | Bacterial endocarditis | Perforation / prolapse of cusp |
| 4 | Rupture of congenitally fenestrated cusp | — |
| 5 | Myxomatous valve / cystic medial necrosis | — |
| 6 | Atherosclerotic degeneration | Severely calcified valves often regurgitant |
| 7 | Connective tissue: Marfan syndrome | — |
| 8 | Systemic inflammation: SLE, Crohn, Takayasu, giant cell arteritis | — |

**Context:** LV enlargement (CTR > 0.55) + initially normal pulmonary vascularity · Austin Flint murmur · Water-hammer pulse · LV wall may appear thin even with hypertrophy

**Assessment:** ✅ Detailed cardiovascular DDx with clinical signs intact. The Austin Flint murmur and water-hammer pulse bled in as false differential items — this is a known edge case where clinical signs appear in the differential list format. Stage 2 should filter items that are clearly sign descriptions (no NOS or disease noun).

---

## 6. DIFFERENTIAL — Posterior Fossa Cystic Malformation (Quality 0.433)

**Finding:** Posterior Fossa Cystic Malformation
**cluster_type:** `differential`  **quality_score:** 0.433

Low score because Dahnert provides no frequency annotations and no context paragraph for this cluster. The four diagnoses are correct.

| # | Differential | Key discriminator |
|---|---|---|
| 1 | **Dandy-Walker malformation** | Complete vermian agenesis · enlarged posterior fossa · elevated torcula |
| 2 | **Dandy-Walker variant** | Partial inferior vermian hypoplasia · posterior fossa not enlarged |
| 3 | **Megacisterna magna** | Normal vermis · normal 4th ventricle · no mass effect |
| 4 | **Arachnoid pouch** | Extra-axial · does not communicate with 4th ventricle |

**Assessment:** ✅ All four entities correct. Discriminating features (torcula elevation, vermis agenesis vs hypoplasia, 4th ventricle communication) come from the individual disease entry files not this cluster — Stage 2 must cross-reference `disease_entries/` to populate a comparison table for this finding. The low score accurately reflects absence of context data.

---

## 7. DIFFERENTIAL — Chronic Primary Adrenal Insufficiency (Quality 0.767)

**Finding:** Chronic Primary Adrenal Insufficiency
**cluster_type:** `differential`  **quality_score:** 0.767

| # | Differential | Frequency |
|---|---|---|
| 1 | **Idiopathic adrenal atrophy** (likely autoimmune) | 60–70% |
| 2 | **Fungal infection** (histoplasmosis, blastomycosis, coccidioidomycosis) | — |
| 3 | **Granulomatous disease** (TB, sarcoidosis) | — |
| 4 | **Bilateral metastatic disease** | Rare |

**Context (√ lines):** Diminutive glands ← idiopathic atrophy + chronic inflammation · Calcifications in 25% of chronic course

**Assessment:** ✅ Good. The 60–70% for autoimmune atrophy is the key FRCR discriminator. Calcifications (25%) in the context paragraph distinguish chronic TB/histoplasma from autoimmune (no calcification). Clinical bleed (hyponatraemia, hyperkalaemia, azotaemia) bled into the differential list — not diagnoses, but preserved for completeness.

---

## 8. DIFFERENTIAL — Low-intensity Adnexal Lesion on T2WI (Quality 0.7, Sub-site Merge)

**Finding:** Low-intensity Adnexal Lesion on T2WI
**cluster_type:** `differential`  **quality_score:** 0.7

This cluster demonstrates the sub-site merge in action. "Ovarian fibromatosis" in the source had "Pelvic aggressive fibromatosis" as the next line — a location variant, not a separate diagnosis.

| # | Differential | Sites merged |
|---|---|---|
| 1 | Blood products | — |
| 2 | Endometrioma | — |
| 3 | Hemorrhagic cyst | — |
| 4 | Hematosalpinx | — |
| 5 | Cystic adenomyosis | — |
| 6 | Uterine leiomyoma | — |
| 7 | Ovarian fibroma | — |
| 8 | Theca cell tumour | — |
| 9 | Cystadenofibroma | — |
| 10 | **Ovarian fibromatosis** | [Pelvic aggressive fibromatosis] ← merged |

**Assessment:** ✅ Sub-site merge working. "Pelvic aggressive fibromatosis" is now stored in `sites[]` array of its parent rather than as a false 11th diagnosis. Category labels "Smooth muscle" and "Fibrous tissue" still appear as items — these are Dahnert's tissue-type sub-headers and would need a second pass to clean up.

---

## 9. DIFFERENTIAL — Orbital and Periorbital Masses (Sub-site Merge)

**Finding:** Orbital and Periorbital Masses
**cluster_type:** `differential`  **quality_score:** 0.467

| # | Differential | Sites merged |
|---|---|---|
| 1 | **Dacryocystocele** | [Anterior encephalocele] ← merged |
| 2 | Glioma | — |
| 3 | Hemangioma | — |
| 4 | Teratoma | — |

**Assessment:** ✅ "Anterior encephalocele" appeared on the next line after Dacryocystocele in the source — it's a location variant / differential of the dacryocystocele, now stored in `sites[]` rather than as a false 5th diagnosis. Quality 0.467 reflects absence of context paragraph. This cluster needs disease entry cross-reference for imaging discriminators.

---

## 10. DIFFERENTIAL — Low Quality (0.3) for Comparison

**Finding:** Hepatic Lesion — Liver (section B)
**cluster_type:** `differential`  **quality_score:** 0.3

A 0.3-score cluster is included to show the lower bound — minimal annotation, no context, but the list of diagnoses is still clinically correct.

| # | Differential | Notes |
|---|---|---|
| 1 | **Acute hepatitis** | Alcoholic / viral / drug-related / toxic |
| 2 | **Hepatic abscess** | — |
| 3 | **Hepatic tumour** | Metastases, HCC, haemangioma, FNH, hepatic adenoma |
| 4 | **Haemorrhagic cyst** | — |
| 5 | **Hepatic congestion** | Acute congestion, Budd-Chiari syndrome |
| 6 | **Perihepatitis** | Fitz-Hugh-Curtis syndrome |

**Assessment:** ⚠️ Low score because the finding heading ("B. LIVER") is an alphabet-sectioned subheading rather than a specific finding. The differentials themselves are correct and complete. The finding name needs Stage 2 cleanup — it should be labelled from its parent section context (e.g. "Hepatic Lesion causing pain / RUQ tenderness").

---

## Summary Table

| # | Finding | cluster_type | Quality | Key feature demonstrated |
|---|---|---|---|---|
| 1 | SPN Morphology | framework | 0.767 | SIZE/MARGIN categories → criteria JSONB, not disease table |
| 2 | Congenital Pulmonary Vein Anomalies | framework | 0.567 | Anatomical classification buckets correctly isolated |
| 3 | Increased Pulmonary Vasculature | mixed | 0.867 | Real diagnoses mixed with category headers; sub-site merge on Pregnancy |
| 4 | Posterior Mediastinal Mass | differential | 0.900 | 3-tier neurogenic hierarchy, frequencies preserved |
| 5 | Aortic Regurgitation Causes | differential | 0.967 | High-quality with clinical sign bleed as edge case |
| 6 | Posterior Fossa Cystic | differential | 0.433 | Correct diagnoses, no context — needs disease entry XRef |
| 7 | Adrenal Insufficiency | differential | 0.767 | 60–70% autoimmune; calcification in 25% |
| 8 | Low-intensity Adnexal T2WI | differential | 0.700 | Sub-site merge: Ovarian fibromatosis [Pelvic aggressive fibromatosis] |
| 9 | Orbital/Periorbital Masses | differential | 0.467 | Sub-site merge: Dacryocystocele [Anterior encephalocele] |
| 10 | Hepatic Lesion (section B) | differential | 0.300 | Lower bound — correct diagnoses, poor heading attribution |
