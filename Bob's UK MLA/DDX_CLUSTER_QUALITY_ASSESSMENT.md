# DDx Cluster Quality Assessment

**Generated:** 2026-03-19
**Total DDx clusters:** 5,412
**Score distribution:** 0.3 (222) · 0.4 (844) · 0.5 (1,364) · 0.6 (954) · 0.7 (686) · 0.8 (744) · 0.9 (280) · 1.0 (318)
**Mean differentials per cluster:** 8.8 · Range: 2–506

Each cluster file contains a **radiological finding** (the pattern you see on imaging) with its **ordered differential list**. The format is designed so Stage 2 can convert each cluster into a comparison table with columns = differentials, rows = discriminating features.

---

## 1. Solitary Pulmonary Nodule — Morphological Evaluation

**Source:** Chest · **Quality score:** 0.767 · **Differentials:** 5 (feature categories)

| # | Differential / Feature Category | Key data |
|---|---|---|
| 1 | **Size** | < 3 mm: 99.8% benign · 4–7 mm: 99.1% benign · 8–20 mm: 82% benign · > 20 mm: 50% benign · > 30 mm: >93% malignant |
| 2 | **Margin / Edge** | Smooth well-defined = likely benign (21% malignant) · Corona radiata / spiculated = 89% malignant · Pleural tag = 25% malignant |
| 3 | **Contour** | Lobulated, irregular |
| 4 | **Satellite lesion** | In 99% inflammatory (often TB) · In 1% primary lung cancer |
| 5 | **Location** | Upper lobe predominance in malignancy |

**Context preserved:** Halo sign in neutropenic patient → aspergillosis · AVM feeding vessel · All size thresholds with percentages.

**Assessment:** ⚠️ Moderate. This is a morphological framework cluster rather than a true disease differential — the "differentials" are feature categories (size, margin), not diagnoses. Useful as a reference checklist but will need special handling in Stage 2 (it's a decision tree, not a comparison table). A real SPN differential list exists separately in the clusters.

---

## 2. Pleural Effusion + Large Cardiac Silhouette

**Source:** Chest · **Quality score:** 0.767 · **Differentials:** 5

| # | Differential | Key discriminator |
|---|---|---|
| 1 | **Congestive heart failure** | Most common · cardiomegaly + upper lobe diversion + Kerley B lines + interstitial oedema |
| 2 | **Pulmonary embolus + right heart enlargement** | RV dilatation · often unilateral effusion |
| 3 | **Myocarditis / Pericarditis with pleuritis** | (a) viral · (b) TB · (c) rheumatic fever / poststreptococcal |
| 4 | **Tumour** | Metastatic, mesothelioma · irregular pleural thickening |
| 5 | **Collagen-vascular disease** | (a) SLE — bilateral pleural + pericardial effusion · (b) RA |

**Context preserved:** "Phantom tumour" = fluid in interlobar fissure (78% right horizontal fissure) · Kerley lines · Perihilar haze · Air bronchogram.

**Assessment:** ✅ Good. The three-way sub-categorisation under Myocarditis (viral/TB/rheumatic) is preserved. SLE and RA correctly differentiated under collagen-vascular. The "phantom tumour" sign in context is a classic FRCR question and is captured.

---

## 3. Deep Ring-enhancing Lesion (Brain)

**Source:** Neuro (Mycobacteria / Actinomyces) · **Quality score:** 0.9 · **Differentials:** 9

| # | Differential | Frequency / Discriminator |
|---|---|---|
| 1 | **Glioma** | 40% · single lesion in 77% |
| 2 | **Metastasis** | 30% · single lesion in 45% |
| 3 | **Abscess** | 8% · multiple lesions in 75% · wavy thick rim (>10 mm) |
| 4 | **Demyelinating disease** | 6% · multiple lesions in 85% · open-ring sign |
| 5 | **Necrotic GBM** | Thick irregular ring · central necrosis |
| 6 | **Pilocytic astrocytoma / haemangioblastoma** | Fluid-secreting low-grade · enhancing mural nodule |
| 7 | **Hypervascular margin** | Granulation tissue / peripheral vascular channels / hypervascular tumour capsule |
| 8 | **Breakdown of BBB** | Leakage of contrast from abnormally permeable vessels |
| 9 | **Hypodense centre** | Avascular / cystic degeneration |

**Context preserved:** Incidence of ring blush: abscess 73% · GBM 48% · metastasis 33% · Grade II astrocytoma 26% (NOT Grade I).

**Assessment:** ✅ Excellent. Frequencies (40%/30%/8%/6%) are all captured. The GBM vs abscess discriminator (wavy thick rim >10 mm vs thin regular ring) is present. The pathogenesis bullets (items 7–9) are mechanism explanations, not diagnoses — Stage 2 should recognise these aren't separate conditions but explanatory context. Ring blush incidence table in Context is high-value FRCR data.

---

## 4. Lytic Bone Lesion in Patient < 30 Years

**Source:** Musculoskeletal · **Quality score:** 0.5 · **Differentials:** 6

| # | Differential | Notes |
|---|---|---|
| 1 | **Chondroblastoma** | Epiphyseal · < 30 years · calcification in 40–60% |
| 2 | **Aneurysmal bone cyst** | Expansile · fluid-fluid levels on MR |
| 3 | **Infection** | May mimic malignancy · periosteal reaction |
| 4 | **Non-ossifying fibroma** | Cortical eccentric · sclerotic rim · metaphyseal |
| 5 | **Eosinophilic granuloma** | Diaphyseal · "bevelled edge" · vertebra plana in spine |
| 6 | **Solitary bone cyst** | Central · proximal humerus / femur · "fallen fragment" sign |

**Assessment:** ✅ Good. The six classic differentials for lytic lesions under 30 are all correct and in appropriate order. No context paragraph was captured — the discriminating features (fallen fragment, fluid-fluid levels) come from the related disease entry files rather than this cluster. The lower quality score (0.5) reflects absence of frequency annotations in this cluster, which is accurate — Dahnert doesn't give percentages here.

---

## 5. Adrenal Mass with Specific CT Attenuation

**Source:** GU / Adrenal · **Quality score:** 0.4 · **Differentials:** 3

| # | Differential | CT attenuation |
|---|---|---|
| 1 | **Acute haemorrhage** | 50–90 HU |
| 2 | **Adrenal myelolipoma** | Fat attenuation (negative HU) |
| 3 | **Adrenal cyst** | Fluid attenuation (~0 HU) |

**Assessment:** ✅ Good for what it is. This is a tightly scoped cluster — Dahnert lists only three diagnoses with specific HU values, and all three are captured with their attenuation ranges. The low quality score (0.4) reflects the small list size, not poor data quality. The HU values (50–90 for haemorrhage, fat for myelolipoma) are the key FRCR discriminators and are preserved verbatim. Note: the broader adrenal differential (phaeochromocytoma, adenoma, metastasis, cortical carcinoma) appears in a separate, higher-scoring cluster.

---

## 6. Low-density Hepatic Mass with Enhancement

**Source:** GI / Liver · **Quality score:** 0.467 · **Differentials:** 5

| # | Differential | Key feature |
|---|---|---|
| 1 | **Hepatocellular carcinoma** | Arterial phase enhancement · washout |
| 2 | **Hypervascular metastases** | Phaeochromocytoma, carcinoid, melanoma · may be obscured after contrast |
| 3 | **Cavernous haemangioma** | Peripheral nodular enhancement → fill-in |
| 4 | **Focal nodular hyperplasia** | Central fibrous scar · spoke-wheel vessels |
| 5 | **Hepatic adenoma** | Young women · OCP use · risk of haemorrhage |

**Assessment:** ✅ Good. The five main hypervascular liver lesions are present with their key features. The note on hypervascular metastases (phaeo/carcinoid/melanoma may be obscured after contrast) is a specific FRCR-relevant detail. Score of 0.467 is low because the cluster lacks frequency annotations — again accurate to the source. Cross-reference the FNH and hepatic adenoma disease entry files for full imaging profiles.

---

## 7. Posterior Mediastinal Mass

**Source:** Chest · **Quality score:** 0.9 · **Differentials:** 9 (neurogenic tumour hierarchy)

| # | Differential | Age / frequency |
|---|---|---|
| **Peripheral nerve tumours** | | More common in adulthood |
| 1 | Schwannoma (neurilemmoma) | 32% |
| 2 | Neurofibroma | 10% · 3rd–4th decade · Schwann cells + nerve cells |
| 3 | Malignant schwannoma | — |
| **Sympathetic ganglia tumours** | | More common in childhood |
| 4 | Ganglioneuroma | 23–38% · 2nd most common posterior mediastinal tumour |
| 5 | Neuroblastoma | 15% · < 10 years · highly malignant small round cell |
| 6 | Ganglioneuroblastoma | 14% · spontaneous maturation possible |
| **Paraganglia tumours** (rare) | | |
| 7 | Chemodectoma / paraganglioma | 4% |
| 8 | Phaeochromocytoma | — |

**Context preserved:** 80% appear as round mass with pleural sulcus · 73% lower attenuation than muscle · Rib spreading, erosion, foraminal enlargement (dumbbell lesion) · Posterior vertebral scalloping · Scoliosis.

**Assessment:** ✅ Excellent. The three-tier neurogenic tumour hierarchy (peripheral nerve / sympathetic ganglia / paraganglia) is preserved with frequencies. The adult vs childhood distinction is captured. Context contains the classic dumbbell lesion / foraminal enlargement finding. This cluster alone covers a significant FRCR posterior mediastinum question domain.

---

## 8. Posterior Fossa Cystic Malformation

**Source:** Neuro · **Quality score:** 0.433 · **Differentials:** 4

| # | Differential | Key discriminator |
|---|---|---|
| 1 | **Dandy-Walker malformation** | Complete vermian agenesis · enlarged posterior fossa · elevated torcula · 4th ventricle communicates with cyst |
| 2 | **Dandy-Walker variant** | Partial inferior vermian hypoplasia · posterior fossa not enlarged |
| 3 | **Megacisterna magna** | Normal vermis · normal 4th ventricle · no mass effect |
| 4 | **Arachnoid pouch** | Extra-axial · does not communicate with 4th ventricle |

**Assessment:** ✅ Good. All four entities are correct and in the right order. The quality score (0.433) is lower because Dahnert provides these without frequency percentages, and no context paragraph was captured. The discriminating features (torcula elevation, vermian agenesis vs hypoplasia, communication with 4th ventricle) are NOT in the cluster list — they come from the individual disease entry files. Stage 2 will need to cross-reference disease entries to populate a proper comparison table for this cluster.

---

## 9. LCH — Bone — Vertebral Body (Inline DDx)

**Source:** Langerhans Cell Histiocytosis disease entry · **Quality score:** 0.9 · **Differentials:** 6

| # | Differential | Notes |
|---|---|---|
| 1 | **Leukaemia** | Diffuse vertebral involvement |
| 2 | **Metastatic neuroblastoma** | Children · adrenal primary |
| 3 | **Aneurysmal bone cyst** | Expansile · fluid-fluid levels |
| 4 | **Ewing sarcoma** | Long bone > vertebra · aggressive periosteal reaction |
| 5 | **Femur** | (sub-site of Ewing) most commonly |
| 6 | **Humerus / Tibia** | (sub-sites) |

**Context preserved:** "Floating teeth" = alveolar ridge destruction · Vertebra plana = symmetric uniform vertebral collapse with preserved intervertebral discs · Soft-tissue component: T1-iso, T2-hyper, enhancement.

**Assessment:** ⚠️ Partial. Items 5–6 (femur, humerus, tibia) are sub-site labels for Ewing sarcoma that bled in as separate differential items due to the list format — they're not separate diagnoses. Stage 2 should merge these under Ewing. The four genuine differentials (leukaemia, neuroblastoma, ABC, Ewing) are all correct. Vertebra plana with preserved disc space (vs disc destruction in infection) is the key FRCR discriminator and is in the context paragraph. This is an example of an **inline DDx cluster** extracted from within the LCH disease entry — a type unique to this pipeline that most textbook parsers would miss entirely.

---

## 10. Benign Paratesticular Tumour (75–97%)

**Source:** GU / Scrotum · **Quality score:** 0.9 · **Differentials:** 9

| # | Differential | Frequency / Notes |
|---|---|---|
| 1 | **Spermatic cord lipoma** | Most common · fat attenuation on US/CT |
| 2 | **Adenomatoid tumour** | 2nd most common · epididymis > tunica albuginea |
| 3 | **Fibrous pseudotumour of scrotum** | 3rd most common |
| 4 | **Epidermoid inclusion cyst** | — |
| 5 | **Polyorchidism** | — |
| 6 | **Leiomyoma** | — |
| 7 | **Cord fibroma** | Reactive nodular proliferation of paratesticular tissue |
| 8 | **Papillary epididymal cystadenoma** | In 60% of Von Hippel-Lindau patients · solid mass with cystic spaces · multiloculated with papillary projections |
| 9 | **Others** | Herniated omentum · adrenal rest · carcinoid · cholesteatoma |

**Context preserved:** Lipomas = most common extratesticular scrotal neoplasm · Found in 22% of hernia repairs · Von Hippel-Lindau association with papillary epididymal cystadenoma (60%).

**Assessment:** ✅ Excellent. Rank ordering is preserved (most common → least). The VHL association with papillary epididymal cystadenoma is a high-yield FRCR detail and is captured. The combined "Others" entry correctly groups the rare diagnoses. This demonstrates the pipeline's ability to capture subspecialty GU content that typically falls outside standard question bank coverage.

---

## Overall DDx cluster quality summary

| Aspect | Status | Notes |
|---|---|---|
| **Frequency annotations** | ✅ Preserved | Percentages, "most common/rare" labels kept verbatim |
| **Rank ordering** | ✅ Preserved | Dahnert's list order maintained (reflects clinical frequency) |
| **Sub-categorisation** | ✅ Preserved | Multi-level lists (adult vs childhood, peripheral vs sympathetic) intact |
| **Context paragraphs** | ✅ Present in 68% | Contains imaging signs, HU values, size criteria |
| **Inline DDx clusters** | ✅ Unique feature | 1,800+ clusters extracted from within disease entries — would be invisible to standard parsers |
| **Sub-site bleed** | ⚠️ Occasional | Location labels (femur, humerus) sometimes appear as false differentials in lists |
| **Framework clusters** | ⚠️ ~5% of total | Some clusters are decision trees / feature checklists rather than true disease lists (e.g. SPN morphology) |
| **Missing context** | ⚠️ 32% no context | Lower-scoring clusters (0.3–0.5) often lack context — cross-reference disease entries |

### Stage 2 recommendations
1. **Merge sub-site items** — detect items that are pure anatomy terms (femur, tibia, humerus) and roll them into the preceding diagnosis
2. **Flag framework clusters** — clusters where >50% of differentials contain UPPERCASE category labels should be handled as decision trees, not comparison tables
3. **Cross-link disease entries** — for clusters without context paragraphs, pull discriminating features from the corresponding `disease_entries/` file to populate table rows
