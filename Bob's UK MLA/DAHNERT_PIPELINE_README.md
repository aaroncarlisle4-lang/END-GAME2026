# Dahnert Radiology Knowledge Pipeline — Complete Documentation

**Project:** FRCR 2A Quiz Platform (Bob's UK MLA)
**Source:** Dähnert's Radiology Review Manual, 8th Edition (PDF)
**Goal:** Extract all radiological knowledge into structured JSON/SQL ready for Supabase import
**Status:** Stage 1 complete · Stage 2 complete · DB import pending

---

## Overview

This pipeline converts a 1,200-page radiology textbook into two structured databases:

1. **Disease entries** — 1,296 conditions, each with imaging findings by modality, demographics, discriminating features, clinical data
2. **DDx clusters** — 5,412 finding→differential lists, classified by type, with quality scores and frequency annotations

The two databases are complementary:
- A disease entry answers: *"What does GBM look like on MRI?"*
- A DDx cluster answers: *"What are the causes of a ring-enhancing brain lesion?"*

Together they power a comparison-table question format: given a finding, show a table of differentials × discriminating features.

---

## File Structure

```
Bob's UK MLA/
├── review manual dahnert.pdf        ← Source PDF (Dahnert 8th ed)
│
├── extract_clusters.py              ← Stage 1: PDF → Markdown files
├── stage2_structure.py              ← Stage 2: Markdown → JSON/SQL
├── run_pipeline.sh                  ← Shell wrapper (runs both stages)
│
├── processed_clusters/              ← Stage 1 output
│   ├── index.md                     ← Master index of all clusters
│   ├── <chapter_slug>/
│   │   └── <finding_slug>.md        ← One file per DDx cluster
│   └── disease_entries/
│       └── <condition_slug>.md      ← One file per disease condition
│
├── structured/                      ← Stage 2 output (DB-ready)
│   ├── schema.sql                   ← CREATE TABLE statements
│   ├── all_conditions.json          ← 1,296 disease records (array)
│   ├── all_ddx.json                 ← 5,412 DDx cluster records (array)
│   ├── conditions_insert.sql        ← INSERT statements for conditions
│   ├── ddx_insert.sql               ← INSERT statements for DDx clusters
│   ├── conditions/                  ← Individual condition JSON files
│   └── ddx/                         ← Individual DDx cluster JSON files
│
├── DAHNERT_PIPELINE_README.md       ← This file
├── CLUSTER_EXAMPLES_V2.md           ← 10 annotated cluster examples
├── QUALITY_ASSESSMENT.md            ← 10 disease entry examples + coverage analysis
├── DDX_CLUSTER_QUALITY_ASSESSMENT.md ← Earlier DDx quality assessment (pre-v2)
│
├── marker_output/                   ← Intermediate: raw PDF→text output
└── __pycache__/                     ← Python cache (ignore)
```

---

## Stage 1: extract_clusters.py

### What it does

Three-pass extraction from the Dahnert PDF:

**Pass 1 — DDx cluster detection (`detect_clusters`)**
Scans for lines matching the pattern: `Finding / Sign / Syndrome → DDx: item1, item2...`
Each cluster is one radiological finding paired with its ordered differential diagnosis list.

**Pass 2 — Inline DDx extraction (`extract_inline_ddx`)**
Scans within ALL_CAPS disease entries for embedded `DDx:` lines.
Example: within the LANGERHANS CELL HISTIOCYTOSIS entry, there are DDx lines for vertebra plana, bone lesions, diabetes insipidus separately. These are extracted as distinct clusters and would be invisible to standard parsers.

**Pass 3 — Disease entry extraction (`extract_disease_entries`)**
Scans ALL_CAPS headings (≥70% uppercase words, ≥4 chars). Each becomes a DiseaseEntry record with:
- Definition (`=` prefix lines)
- Demographics (Age, Incidence, M÷F, Prevalence)
- Findings by modality (CT:, MR:, US:, CXR:, NUC:, ANGIO:, CECT:, NECT:, PET:)
- Imaging findings (`√` prefix lines = Dahnert's finding marker)
- Organ sub-sections (`@` prefix lines — e.g. "@ Left heart", "@ Right heart")
- Clinical data (Cx:, Prognosis:, Rx:, N.B.:)

### Key technical detail: the √ symbol

Dahnert uses `√` (Unicode U+221A, mathematical square root) as his imaging finding bullet. This caused a critical pipeline bug:

```python
'√'[0].isupper()  # → False  (it's a math symbol, not a letter)
```

The line-joiner `_fix_broken_bullets()` failed to recognise √ lines as bullet starts, causing them to be appended to the preceding `-` line and becoming invisible to the finding extractor. Fix: added `√\u221a` explicitly to `_BULLET_START_RE`.

### Output format: DDx cluster Markdown

```markdown
# Posterior Mediastinal Mass

**Source:** Chest · **Quality score:** 0.9 · **Differentials:** 11

## Differentials

1. Schwannoma = neurilemmoma (32%)
2. Neurofibroma (10%): contains Schwann cells + nerve cells, 3rd + 4th decade
3. Malignant schwannoma
4. Ganglioneuroma (23–38%): second most common…
...

## Context

√  80% appear as a round mass with sulcus
√  lower attenuation than muscle (in 73%)
√  rib spreading, erosion, destruction
√  enlargement of neural foramina (dumbbell lesion)
```

### Output format: Disease entry Markdown

```markdown
# GLIOBLASTOMA MULTIFORME (GBM)

**Chapter:** Neuro
**Source line:** 4821

## Definition
Most common primary brain tumour...

## Demographics
- Age: peak 65–75 years; M÷F = 3÷2
- Incidence: 50% of all intracranial tumours
- Genetics: Turcot syndrome, NF1, Li-Fraumeni

## Findings

### General
√ almost always ring blush of variable thickness: multiscalloped ("garland")
√ butterfly glioma = crosses corpus callosum
√ thick irregular ring enhancement (vs thin regular ring in abscess)

### MR
√ marked surrounding vasogenic oedema
√ central necrosis / haemorrhage

## Clinical
- Rx: surgery + radiation + chemotherapy
- Prognosis: 16–18 months median survival
```

### Quality scoring algorithm

Each DDx cluster is assigned a quality score 0.0–1.0 based on:

| Signal | Score boost |
|---|---|
| Has context paragraph | +0.2 |
| Differentials have frequency annotations (%, "most common", "rare") | +0.1 per item, max +0.3 |
| Differentials have clinical discriminators | +0.1 |
| Ordered list (most→least common) | +0.1 |
| 5+ differentials | +0.1 |
| Source is a high-yield chapter (Neuro, MSK, Chest) | +0.1 |

Score distribution across 5,412 clusters: 0.3 (222) · 0.4 (844) · 0.5 (1,364) · 0.6 (954) · 0.7 (686) · 0.8 (744) · 0.9 (280) · 1.0 (318)

---

## Stage 2: stage2_structure.py

### What it does

Reads all Markdown files from `processed_clusters/` and converts them to database-ready JSON and SQL.

Run command:
```bash
cd "/workspaces/Question-bank-3-/Bob's UK MLA"
python3 stage2_structure.py --input processed_clusters --output structured
```

### Disease entry structuring

For each `disease_entries/*.md` file, extracts six fields:

| Field | Coverage | How extracted |
|---|---|---|
| `dominant_finding` | 90% | First pathognomonic/characteristic finding; fallback = first √ finding |
| `distribution` | 66% | Lines containing anatomical location words (right > left, bilateral, etc.) |
| `demographics` | 84% | Age, Incidence, M÷F, Prevalence, Genetics |
| `discriminating_features` | 92% | Lines with "pathognomonic", "characteristic", "classic", "specific", "most common"; fallback = first 6 findings |
| `other_features` | 79% | All remaining √ lines, grouped by modality (CT, MR, US, CECT, NECT, NUC, ANGIO) |
| `clinical` | 68% | Cx (complications), Prognosis, Rx (treatment), N.B. (important notes) |

### Coverage gaps

**10% missing dominant_finding / discriminating_features:**
These are genuine — entries like BICUSPID AORTIC VALVE and ARTERIOSCLEROSIS OBLITERANS have no `√` imaging lines in Dahnert (purely clinical/genetic descriptions). The remaining 8% after bug fixes are not recoverable from this source text.

**34% missing distribution:**
Entries where Dahnert describes no anatomical predilection — e.g. systemic diseases that are by definition bilateral/diffuse.

### DDx cluster structuring — key features

#### 1. Cluster type detection

Each cluster is classified into one of three types:

```
cluster_type: "differential" | "framework" | "mixed"
```

**framework** (50 clusters, 0.9%): The differentials list is entirely or predominantly feature categories (SIZE, MARGIN, A. CONGENITAL) not diseases. Used for Dahnert's decision trees and classification schemes. These should NOT be rendered as comparison tables.

Detection: `_FRAMEWORK_ITEM_RE` triggers on items that are SHORT (≤4 words) ALL-CAPS strings or single-letter prefixed items (A., B., C.). If ≥40% of items trigger this → framework.

**mixed** (304 clusters, 5.6%): Has both category headers AND real diagnoses. Stage 2 retains the real diagnoses and flags the category headers.

Detection: If 20–40% of items trigger `_FRAMEWORK_ITEM_RE` → mixed.

**differential** (5,058 clusters, 93.5%): Standard disease DDx list — can be rendered as a comparison table.

#### 2. Sub-site merging

Dahnert frequently follows a diagnosis with its anatomical sub-sites on the next line:
```
Ewing sarcoma
  Femur
  Humerus / Tibia
```

These location labels were being parsed as false differential items. `merge_sub_sites()` detects anatomy/location terms (femur, tibia, proximal, bilateral, left, right, superior, inferior, etc.) and rolls them back into the `sites[]` array of the preceding diagnosis.

362 items were merged across 264 clusters.

The merged item's name gets a `[site]` suffix for transparency:
```json
{
  "name": "Ewing sarcoma [Femur]",
  "sites": ["Femur", "Humerus / Tibia"]
}
```

#### 3. Framework criteria extraction

For framework clusters, `expand_framework_cluster()` splits the context paragraph by `√` markers and attempts to group criteria under their nearest category label. The result goes into the `criteria` JSONB column (empty dict for differential clusters).

Example for SPN Morphology:
```json
"criteria": {
  "SIZE": ["< 3 mm nodule: in 99.8% benign", "4-7 mm nodule: in 99.1% benign", ...],
  "MARGIN / EDGE": ["corona radiata = 89% malignant", ...],
  "CONTOUR": [],
  "SATELLITE LESION": [],
  "LOCATION": []
}
```

### SQL schema (schema.sql)

Two tables, designed for Supabase/PostgreSQL:

```sql
-- Disease conditions
CREATE TABLE dahnert_conditions (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                  TEXT NOT NULL,
    slug                  TEXT NOT NULL UNIQUE,
    chapter               TEXT,
    dominant_finding      TEXT,
    distribution          TEXT,
    demographics          JSONB,
    discriminating_features JSONB,
    other_features        JSONB,
    clinical              JSONB,
    source_file           TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- DDx clusters
CREATE TABLE dahnert_ddx (
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
```

### JSON record formats

**Disease condition record (`all_conditions.json`):**
```json
{
  "name": "GLIOBLASTOMA MULTIFORME (GBM)",
  "slug": "glioblastoma_multiforme_gbm",
  "chapter": "Neuro",
  "dominant_finding": "almost always ring blush of variable thickness: multiscalloped (\"garland\")",
  "distribution": "frontal + temporal lobes; tendency to invade basal ganglia",
  "demographics": {
    "Age": "peak 65–75 years; M÷F = 3÷2",
    "Incidence": "most common primary brain tumour (50% of all intracranial tumours)",
    "Genetics": "Turcot syndrome, NF1, Li-Fraumeni syndrome"
  },
  "discriminating_features": [
    "almost always ring blush — multiscalloped 'garland' pattern",
    "butterfly glioma = crosses corpus callosum",
    "marked surrounding vasogenic oedema",
    "thick irregular ring enhancement (vs thin regular ring in abscess)",
    "central necrosis / haemorrhage"
  ],
  "other_features": {
    "NECT": ["hyperdense ring-like mass"],
    "MR": ["T1: iso-hypointense", "T2: hyperintense oedema"],
    "PET": ["increased glucose metabolism"]
  },
  "clinical": {
    "Rx": "surgery + radiation + chemotherapy",
    "Prognosis": "16–18 months median survival"
  },
  "source_file": "processed_clusters/disease_entries/glioblastoma_multiforme_gbm.md"
}
```

**DDx cluster record (`all_ddx.json`):**
```json
{
  "finding": "Posterior Mediastinal Mass",
  "slug": "posterior_mediastinal_mass",
  "chapter": "Chest",
  "cluster_type": "differential",
  "quality_score": 0.9,
  "differentials": [
    {
      "name": "Schwannoma = neurilemmoma",
      "raw": "Schwannoma = neurilemmoma (32%)",
      "frequency": "32%"
    },
    {
      "name": "Neuroblastoma",
      "raw": "Neuroblastoma (15%): highly malignant undifferentiated small round cell tumor...",
      "frequency": "15%"
    }
  ],
  "criteria": {},
  "context": "√ 80% appear as a round mass with sulcus\n√ lower attenuation than muscle (in 73%)\n√ rib spreading, erosion, destruction",
  "source_file": "processed_clusters/e_cardiovascular/posterior_mediastinal_mass.md"
}
```

---

## Known Limitations

### 1. Chapter attribution errors (~8% of clusters)

Some clusters have wrong chapter values because the source file is in a directory named after Dahnert's section letter (e.g. `a_pericarditis_with_restriction/`) rather than the true clinical chapter (Chest, Cardiovascular). The `chapter` field reflects the directory name, not always the clinical topic.

**Fix for Stage 2b:** Map section letter → clinical chapter using a lookup table (A.=Constitutional, B.=Liver, etc.)

### 2. Clinical sign bleed into differentials (~3% of differential clusters)

Dahnert sometimes lists pathophysiology notes, clinical signs, and lab values in the same list as diagnoses. Examples:
- "water-hammer pulse = twin-peaked pulse" appearing as a differential item in the AR cluster
- "hyponatraemia, hyperkalaemia, azotaemia" in the adrenal insufficiency cluster

**Fix for Stage 2b:** Filter items that match `_CLINICAL_SIGN_RE` (contains "=" followed by a non-disease descriptor, or is a pure lab value string).

### 3. Framework criteria grouping is imperfect

`expand_framework_cluster()` assigns context paragraph bullets to category labels by proximity/keyword matching. This works well for clear cases (SIZE with size criteria) but over-assigns to the first category when context bullets don't keyword-match any subsequent category.

**Fix:** Use semantic similarity (pgvector) or a second LLM pass to re-group criteria.

### 4. Duplicate clusters

Some findings appear in multiple Dahnert sections. The slug-deduplication appends a hash suffix (e.g. `posterior_fossa_cystic_malformation_a3f9b1`) but both records are kept. A deduplication pass should merge these or flag the highest-quality version.

### 5. Sub-site merge edge cases

`merge_sub_sites()` uses a regex of 30+ anatomy terms. It correctly handles femur/tibia/humerus but can over-fire on legitimate diagnoses that start with a location word (e.g. "Lateral pharyngeal space abscess" — "lateral" is in the anatomy term list). The frequency check mitigates this (items with frequency annotations are never merged) but not perfectly.

---

## Stage 2b: What Still Needs Doing

Before loading into Supabase:

1. **Chapter mapping** — map section letter directories to clinical chapter names
2. **Clinical sign filter** — remove lab values / clinical signs from `differentials[]`
3. **Deduplication** — merge duplicate clusters (same finding, different sections), keep highest quality_score
4. **Missing entry lookup** — 8% of conditions have no `√` lines; secondary lookup in raw markdown to recover bullets from adjacent headings
5. **Framework criteria re-grouping** — improve context→category assignment for the 50 framework clusters

---

## Loading into Supabase

```bash
# 1. Run schema
psql $DATABASE_URL < structured/schema.sql

# 2. Load conditions
psql $DATABASE_URL < structured/conditions_insert.sql

# 3. Load DDx clusters
psql $DATABASE_URL < structured/ddx_insert.sql
```

Or use Supabase MCP:
```
mcp__supabase__apply_migration with content of schema.sql
mcp__supabase__execute_sql with content of conditions_insert.sql (batched)
```

For vector search (pgvector), add:
```sql
ALTER TABLE dahnert_conditions ADD COLUMN embedding vector(1536);
ALTER TABLE dahnert_ddx ADD COLUMN embedding vector(1536);
CREATE INDEX ON dahnert_conditions USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON dahnert_ddx USING ivfflat (embedding vector_cosine_ops);
```

Then generate embeddings via the OpenAI/Anthropic embedding API over `discriminating_features` + `context` fields.

---

## How This Feeds the FRCR Quiz Platform

The intended flow in the main quiz app:

```
User sees a finding (e.g. "Ring-enhancing brain lesion on MRI")
    ↓
Query dahnert_ddx WHERE finding ILIKE '%ring-enhancing%'
    ↓
Return ordered differential list [Glioma 40%, Metastasis 30%, Abscess 8%...]
    ↓
For each differential, query dahnert_conditions WHERE name = differential
    ↓
Build comparison table: rows = discriminating_features, cols = differentials
    ↓
Generate MCQ: "Which feature best distinguishes abscess from GBM?"
    correct_answer = "Thin regular ring wall (abscess) vs thick irregular ring (GBM)"
```

The `discriminating_features` field from disease entries populates the table rows. The `frequency` field from DDx cluster differentials populates the column headers with prevalence data. The `clinical` field feeds the explanation panel.

---

## Pipeline Run Command

Full pipeline from scratch (PDF → structured JSON/SQL):

```bash
cd "/workspaces/Question-bank-3-/Bob's UK MLA"

# Stage 1: Extract from PDF → Markdown
python3 extract_clusters.py

# Stage 2: Structure Markdown → JSON/SQL
python3 stage2_structure.py --input processed_clusters --output structured

# Or run both:
bash run_pipeline.sh
```

Expected runtime: Stage 1 ~8 min (PDF processing), Stage 2 ~45 sec (6,700 Markdown files).

Expected output:
```
Stage 1:
  DDx clusters extracted: 5,412
  Disease entries extracted: 1,296
  Inline DDx clusters: ~1,800

Stage 2:
  1296 conditions structured
  5412 DDx clusters structured
    differential: 5058
    framework:    50
    mixed:        304
    sub-site items merged: 362
```
