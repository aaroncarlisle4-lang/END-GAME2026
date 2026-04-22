#!/usr/bin/env python3 -u
"""
Batch generation of mnemonic infographic images via NotebookLM (2-step) + Playwright.

Pipeline per mnemonic:
  Step 1 — NotebookLM enrichment:
    Give NotebookLM the mnemonic topic + differentials.
    It returns enriched clinical content: dominant imaging features, key
    discriminators, supporting features from the textbooks.

  Step 2 — NotebookLM infographic generation:
    Combine the enriched content + brand guide prompt.
    NotebookLM returns a complete self-contained HTML/SVG infographic.

  Step 3 — Render + store:
    Playwright screenshots the HTML → PNG.
    Uploaded to Convex storage and linked via studyImages.

Usage:
  python3 scripts/generate_infographics_batch.py [category] [--limit N] [--dry-run]
  python3 scripts/generate_infographics_batch.py Chest --limit 1
  python3 scripts/generate_infographics_batch.py --skip-step1   # re-use cached enrichment, re-generate HTML

Requires:
  - notebooklm auth check  (PASS)
  - notebooklm use 5242a5
  - playwright install chromium
  - npx convex dev  (or deployment active)
"""

import subprocess, json, re, sys, time, os, tempfile
os.environ["PYTHONUNBUFFERED"] = "1"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE   = os.path.join(SCRIPT_DIR, "infographic_progress.json")
CACHE_FILE      = os.path.join(SCRIPT_DIR, "infographic_enrichment_cache.json")
HTML_CACHE_DIR  = os.path.join(SCRIPT_DIR, "infographic_html_cache")
TMP_DIR         = "/tmp/infographics"

CATEGORIES = ["Chest", "MSK", "GI", "GU", "Neuro", "Paeds"]

# ─── Brand guide prompt (Step 2 — does not change) ────────────────────────────

BRAND_GUIDE = None  # Not used — prompt is built inline in step2_infographic_prompt

# ─── Progress + cache ─────────────────────────────────────────────────────────

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": []}

def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)

def cache_key(m):
    return f"ch{m['chapterNumber']:02d}"

def save_html_cache(chapter_num, html):
    os.makedirs(HTML_CACHE_DIR, exist_ok=True)
    path = os.path.join(HTML_CACHE_DIR, f"ch{chapter_num:02d}.html")
    with open(path, "w") as f:
        f.write(html)

def load_html_cache(chapter_num):
    path = os.path.join(HTML_CACHE_DIR, f"ch{chapter_num:02d}.html")
    if os.path.exists(path):
        with open(path) as f:
            return f.read()
    return None

# ─── Auth ─────────────────────────────────────────────────────────────────────

def check_auth():
    try:
        r = subprocess.run(["notebooklm", "auth", "check"],
                           capture_output=True, text=True, timeout=15)
        return r.returncode == 0 and "pass" in r.stdout.lower()
    except Exception:
        return False

def wait_for_auth():
    print("\n" + "!" * 60)
    print("  AUTH EXPIRED — run: python3 scripts/refresh_notebooklm_auth.py")
    print("  Then press Enter to resume, or 'q' to quit.")
    print("!" * 60)
    try:
        resp = input("\n  Press Enter to resume (or 'q' to quit): ").strip().lower()
        if resp == 'q':
            return False
        return check_auth()
    except (EOFError, KeyboardInterrupt):
        return False

# ─── Convex ───────────────────────────────────────────────────────────────────

def run_convex(func, args_dict):
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as tmp:
        tmp_path = tmp.name
    try:
        with open(tmp_path, 'w') as out_f:
            r = subprocess.run(
                ["npx", "convex", "run", func, json.dumps(args_dict)],
                stdout=out_f, stderr=subprocess.PIPE, text=True, timeout=60
            )
        if r.returncode != 0:
            raise Exception(f"Convex error: {r.stderr.strip()}")
        with open(tmp_path) as in_f:
            content = in_f.read().strip()
        return json.loads(content) if content else None
    finally:
        os.unlink(tmp_path)

# ─── NotebookLM queries ───────────────────────────────────────────────────────

def query_notebooklm(prompt):
    r = subprocess.run(
        ["notebooklm", "ask", prompt, "--json"],
        capture_output=True, text=True, timeout=180
    )
    if r.returncode != 0:
        raise Exception(f"NotebookLM error: {r.stderr.strip() or r.stdout.strip()}")
    data = json.loads(r.stdout)
    if data.get("error"):
        raise Exception(f"NotebookLM: {data.get('message', 'Unknown error')}")
    return data["answer"]

def step1_enrichment_prompt(m):
    """Build Step 1 prompt: give NotebookLM the mnemonic topic and ask for enriched clinical content."""
    diffs = m["differentials"]
    diff_lines = "\n".join(
        f"  {d.get('letter','-')}. {d['condition']}: {d.get('associatedFeatures','')}"
        for d in diffs
    )
    return f"""Radiology mnemonic enrichment request.

Pattern: {m['pattern']}
Category: {m['categoryAbbreviation']} ({m['bookSection']})
Mnemonic: {m['mnemonic']}

Differentials:
{diff_lines}

Using the radiology textbooks in this notebook (especially Dahnert Review Manual, Rapid Review Radiology, Radiology Made Easy):

For EACH differential above, provide:
1. dominantImagingFeature — the single most visually distinctive finding on imaging (1 short phrase, max 8 words)
2. keyDiscriminator — what specifically distinguishes this from the other differentials in this list (1 phrase, max 10 words, imaging-specific)
3. supportingFeatures — 1–2 additional supporting imaging or clinical clues (short bullet points)

Also provide:
- patternSummary: one sentence describing the overall imaging pattern and its significance
- clinicalPearl: one high-yield exam pearl about this pattern (specific, not generic)

Return as a JSON code block:
```json
{{
  "patternSummary": "...",
  "differentials": [
    {{
      "letter": "S",
      "condition": "Sarcoidosis",
      "dominantImagingFeature": "bilateral hilar lymphadenopathy + upper zone fibrosis",
      "keyDiscriminator": "perilymphatic nodules, spares costophrenic angles",
      "supportingFeatures": ["Stage I–IV classification", "lupus pernio skin lesion"]
    }}
  ],
  "clinicalPearl": "..."
}}
```"""

STANDARD_REFERENCES = {
    1: "Dahnert W. Radiology Review Manual, 8th ed. Wolters Kluwer 2017",
    2: "Weir J, Abrahams P. Imaging Atlas of Human Anatomy, 5th ed. Elsevier 2022",
    3: "Grainger RG et al. Grainger & Allison's Diagnostic Radiology, 6th ed. Elsevier 2015",
    4: "Hansell DM et al. Imaging of Diseases of the Chest, 5th ed. Elsevier 2010",
    5: "Corne J, Pointon K. Chest X-Ray Made Easy, 4th ed. Elsevier 2016",
    6: "Chapman S, Nakielny R. Aids to Radiological Differential Diagnosis, 6th ed. Elsevier 2014",
    7: "Brant WE, Helms CA. Fundamentals of Diagnostic Radiology, 4th ed. Lippincott 2012",
    8: "Webb WR et al. High-Resolution CT of the Lung, 5th ed. Wolters Kluwer 2014",
    9: "Sutton D. Textbook of Radiology and Imaging, 7th ed. Elsevier 2003",
    10: "Reeder MM. Reeder and Felson's Gamuts in Radiology, 4th ed. Springer 2003",
    11: "Squire LF, Novelline RA. Squire's Fundamentals of Radiology, 6th ed. Harvard 2004",
}

def build_native_generator_description(m, enrichment):
    """Build the description string for notebooklm generate infographic (native Studio generator).
    This is NOT an HTML prompt — it's a content description the native generator uses
    to produce a high-quality visual infographic. Include all clinical detail.
    """
    diffs = enrichment.get("differentials", [])

    orig_by_cond = {d["condition"].lower(): d for d in m["differentials"]}
    for d in diffs:
        orig = orig_by_cond.get(d.get("condition", "").lower(), {})
        if not d.get("dominantImagingFeature"):
            d["dominantImagingFeature"] = orig.get("associatedFeatures", "")[:80]

    mnemonic_str = m["mnemonic"]
    pattern_summary = re.sub(r'\s*\[\d+\]', '', enrichment.get("patternSummary", ""))
    pearl = re.sub(r'\s*\[\d+\]', '', enrichment.get("clinicalPearl", ""))

    # Build differential blocks — keep [N] inline refs on ALL fields
    diff_blocks = []
    for d in diffs:
        letter = d.get("letter", "-")
        cond = d.get("condition", "")
        dominant = d.get("dominantImagingFeature", "")[:90]   # keep [N] inline
        discrim = d.get("keyDiscriminator", "")[:80]           # keep [N] inline
        supports = d.get("supportingFeatures", [])[:2]         # keep [N] inline

        block = f"{letter} — {cond}: {dominant}"
        if discrim:
            block += f"\n   Key discriminator: {discrim}"
        for s in supports:
            block += f"\n   • {s}"
        diff_blocks.append(block)

    diffs_text = "\n\n".join(diff_blocks)

    # Build compact reference list
    all_text = json.dumps(enrichment)
    cited_nums = sorted(set(int(n) for n in re.findall(r'\[(\d+)\]', all_text)))
    refs_lines = [f"[{n}] {STANDARD_REFERENCES[n]}" for n in cited_nums if n in STANDARD_REFERENCES]
    refs_text = "\n".join(refs_lines[:10])

    description = f"""CANVAS: 4:5 ratio portrait — 1080 px wide by 1350 px tall. The entire design must fit within this ratio. Do not create a tall scrolling layout; keep it compact and wide enough to fill the 4:5 frame.

TITLE (use exactly): {m['pattern']}
SUBTITLE (use exactly): {mnemonic_str} Mnemonic
Overview: {pattern_summary}

DIFFERENTIALS — preserve every [N] superscript citation exactly as written below; they must appear inline next to the text they cite:

{diffs_text}

CLINICAL PEARL: {pearl}

REFERENCES — display as very small footnotes at the bottom right corner. Each on its own line, very small font, compact style. These correspond to the [N] numbers above:
{refs_text}

FOOTER: Display only the word "FRCRbank" — nothing else. No tagline, no subtitle. Just "FRCRbank" alone.

STYLE: Warm parchment background (#FAF6F0). Earthy muted watercolour palette — rust, teal, sage, warm brown for all text, labels, and borders. Include the mnemonic letters prominently. Editorial medical publication quality. Multi-column grid for differentials to keep the design compact within the 4:5 frame.

Each differential must have a realistic medical imaging panel — NOT an artistic illustration or animated drawing. These should look like actual clinical images: CT lung windows, chest X-ray posteroanterior views, coronal or axial CT slices, MRI sequences, or ultrasound — whichever modality best shows the key feature. Render in true greyscale (black background for CT/MRI, white background for CXR) with realistic radiographic contrast and texture. Coronal plane preferred for CT/MRI. Do not add any modality caption or label beneath the imaging panels."""

    return description

# ─── HTML extraction ──────────────────────────────────────────────────────────

def extract_html(answer):
    """Extract HTML document from NotebookLM response."""
    # Strip markdown fences if present
    fenced = re.search(r'```html\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()

    # Any code fence
    fenced2 = re.search(r'```\s*\n(.*?)\n```', answer, re.DOTALL)
    if fenced2:
        candidate = fenced2.group(1).strip()
        if '<!DOCTYPE' in candidate or '<html' in candidate:
            return candidate

    # Raw HTML
    raw = re.search(r'(<!DOCTYPE html>.*|<html[\s\S]*?</html>)', answer, re.DOTALL | re.IGNORECASE)
    if raw:
        return raw.group(1).strip()

    return None

def validate_html(html):
    if not html:
        return False
    return '<html' in html.lower() and '</html>' in html.lower() and 'body' in html.lower()

# ─── Render + upload ──────────────────────────────────────────────────────────

def render_png(html, output_path):
    from playwright.sync_api import sync_playwright
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1365, "height": 2048})
        page.set_content(html, wait_until="networkidle")
        page.screenshot(path=output_path, full_page=False)
        browser.close()
    size = os.path.getsize(output_path)
    print(f"  [render] {output_path} ({size // 1024}KB)")

def upload_to_convex(png_path, m):
    mnemonic_id = m["_id"]
    # Get upload URL
    upload_url = run_convex("studyImages:generateUploadUrl", {})
    if not isinstance(upload_url, str):
        raise Exception(f"Bad upload URL: {upload_url!r}")
    # POST the PNG
    r = subprocess.run(
        ["curl", "-s", "-X", "POST", upload_url,
         "-H", "Content-Type: image/png",
         "--data-binary", f"@{png_path}"],
        capture_output=True, text=True, timeout=60
    )
    if r.returncode != 0:
        raise Exception(f"Upload failed: {r.stderr.strip()}")
    storage_id = json.loads(r.stdout).get("storageId")
    if not storage_id:
        raise Exception(f"No storageId: {r.stdout}")
    # Create studyImages record
    run_convex("studyImages:addImage", {
        "sourceType": "mnemonic",
        "sourceId": mnemonic_id,
        "storageId": storage_id,
        "storageProvider": "convex",
        "caption": f"Infographic: {m['pattern']} ({m['mnemonic']})",
        "caseGroup": f"infographic-{m['chapterNumber']}",
    })
    print(f"  [upload] storageId: {storage_id[:24]}...")
    return storage_id

# ─── Instagram resize ─────────────────────────────────────────────────────────

def _watercolour_wash(img, x_start, col_w, fade_left_to_right):
    """Paint a soft earthy watercolour wash over a vertical strip of img (in-place).

    Technique: layered noise rectangles → heavy GaussianBlur → gradient alpha mask.
    Result: a brushed ochre/sand wash that fades smoothly into the parchment content.
    """
    import random
    from PIL import Image, ImageFilter, ImageDraw

    if col_w <= 0:
        return img

    col_h = img.height

    # Ochre/sand palette for the wash
    SWATCHES = [
        (200, 165, 110),  # warm ochre (stronger base)
        (182, 140,  88),  # deep ochre
        (215, 185, 135),  # pale sand
        (170, 130,  78),  # burnt ochre
        (205, 170, 120),  # mid sand
        (190, 150, 100),  # dusty ochre
        (165, 120,  70),  # terracotta
    ]

    # Base wash layer
    wash = Image.new("RGB", (col_w, col_h), SWATCHES[0])
    draw = ImageDraw.Draw(wash)

    rng = random.Random(42 if fade_left_to_right else 137)
    for _ in range(60):
        x = rng.randint(0, col_w - 1)
        w = rng.randint(4, col_w)
        y = rng.randint(-50, col_h)
        h = rng.randint(40, 400)
        c = rng.choice(SWATCHES)
        draw.rectangle([x, y, min(x + w, col_w - 1), min(y + h, col_h - 1)], fill=c)

    # Blur heavily — turns blocky rects into a smudgy watercolour wash
    wash = wash.filter(ImageFilter.GaussianBlur(radius=22))
    # Second pass — extra soft
    wash = wash.filter(ImageFilter.GaussianBlur(radius=10))

    # Gradient alpha mask: strong at outer edge, fades to 0 at inner edge
    mask = Image.new("L", (col_w, col_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    MAX_ALPHA = 240  # strong wash — parchment still shows faintly at inner edge

    for x in range(col_w):
        # t=1.0 → outer edge (full wash), t=0.0 → inner edge (transparent)
        t = (col_w - 1 - x) / (col_w - 1) if fade_left_to_right else x / (col_w - 1)
        # Smoothstep for a more natural fade (S-curve)
        t = t * t * (3 - 2 * t)
        mask_draw.line([(x, 0), (x, col_h - 1)], fill=int(MAX_ALPHA * t))

    # Soften mask edge so the transition is feathered, not hard
    mask = mask.filter(ImageFilter.GaussianBlur(radius=14))

    # Composite wash onto the image
    img.paste(wash, (x_start, 0), mask)
    return img


def crop_to_instagram(png_path):
    """Resize to fit exactly 1080×1350 (Instagram 4:5), add watercolour column borders.

    Strategy:
      1. Scale so width = 1080px.
      2. If height > 1338px (leaving 12px for border): scale down further so height = 1338px,
         pad sides with parchment.
      3. If height < 1338px: pad top/bottom with parchment.
      4. Paint earthy watercolour wash over the side parchment columns.
      5. Draw thin rust border frame around the full canvas.
    Overwrites the file in-place.
    """
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("  ⚠ Pillow not installed — skipping Instagram crop (pip install Pillow)")
        return png_path

    PARCHMENT = (250, 246, 240)   # warm parchment background
    RUST      = (160, 82, 45)     # earthy rust — thin border frame
    BORDER    = 12                # px — border line width
    TARGET_W, TARGET_H = 1080, 1350
    inner_h = TARGET_H - BORDER  # content must stay inside border clearance

    img = Image.open(png_path)
    orig_w, orig_h = img.size

    # Step 1: scale width to 1080
    new_w = TARGET_W
    new_h = round(orig_h * (TARGET_W / orig_w))
    img = img.resize((new_w, new_h), Image.LANCZOS)

    left = 0  # how many px of parchment on each side (updated below)

    if new_h > inner_h:
        # Scale DOWN so height fits inside border clearance
        new_w2 = round(new_w * (inner_h / new_h))
        new_h2 = inner_h
        img = img.resize((new_w2, new_h2), Image.LANCZOS)
        left = (TARGET_W - new_w2) // 2
        top  = (TARGET_H - new_h2) // 2
        padded = Image.new("RGB", (TARGET_W, TARGET_H), PARCHMENT)
        padded.paste(img, (left, top))
        img = padded
        print(f"  [2b] Scaled to fit 1080×1350 (image {new_w2}×{new_h2}, cols {left}px, top/bot {top}px)")
    elif new_h < inner_h:
        top_offset = (TARGET_H - new_h) // 2
        padded = Image.new("RGB", (TARGET_W, TARGET_H), PARCHMENT)
        padded.paste(img, (0, top_offset))
        img = padded
        print(f"  [2b] Padded to 1080×1350 (added {TARGET_H - new_h}px top/bottom)")
    else:
        print(f"  [2b] Exact fit — no adjustment needed")

    # Step 4: watercolour wash over side columns (only if there is side parchment)
    if left > 10:
        img = _watercolour_wash(img, 0, left, fade_left_to_right=True)          # left col
        img = _watercolour_wash(img, TARGET_W - left, left, fade_left_to_right=False)  # right col

    # Step 5: thin rust border frame
    draw = ImageDraw.Draw(img)
    draw.rectangle(
        [BORDER // 2, BORDER // 2, TARGET_W - BORDER // 2 - 1, TARGET_H - BORDER // 2 - 1],
        outline=RUST, width=BORDER
    )

    img.save(png_path, "PNG", optimize=True)
    size = os.path.getsize(png_path)
    print(f"  [2b] Instagram PNG saved ({size // 1024}KB)")
    return png_path

# ─── Per-mnemonic pipeline ────────────────────────────────────────────────────

def process_mnemonic(m, cache, skip_step1=False):
    ch = m["chapterNumber"]
    key = cache_key(m)
    print(f"\n{'='*60}")
    print(f"  Ch.{ch:02d}  {m['pattern']}  ({m['mnemonic']})")
    print(f"{'='*60}")

    # ── Step 1: Enrichment ──────────────────────────────────────
    if skip_step1 and key in cache:
        print("  [1/4] Step 1: using cached enrichment")
        enrichment = cache[key]
    else:
        print("  [1/4] Step 1: querying NotebookLM for clinical enrichment...")
        prompt1 = step1_enrichment_prompt(m)
        try:
            answer1 = query_notebooklm(prompt1)
        except Exception as e:
            print(f"  ⚠ Step 1 failed ({e}) — falling back to original mnemonic data")
            answer1 = ""

        # Extract JSON from response
        match = re.search(r'```json\s*\n(.*?)\n```', answer1, re.DOTALL)
        if match:
            try:
                enrichment = json.loads(match.group(1))
            except json.JSONDecodeError:
                enrichment = {}
        else:
            # Try to find raw JSON object
            match2 = re.search(r'\{[\s\S]*?"differentials"[\s\S]*?\}', answer1)
            enrichment = {}
            if match2:
                try:
                    enrichment = json.loads(match2.group(0))
                except Exception:
                    pass

        if not enrichment.get("differentials"):
            print("  ⚠ Step 1: sparse response — continuing with original mnemonic data")
            # Build minimal enrichment from existing mnemonic data
            enrichment = {
                "patternSummary": f"{m['pattern']} — key imaging pattern for FRCR 2B ({m['bookSection']})",
                "differentials": [
                    {
                        "letter": d.get("letter", "-"),
                        "condition": d["condition"],
                        "dominantImagingFeature": d.get("associatedFeatures", "")[:80],
                        "keyDiscriminator": "",
                        "supportingFeatures": []
                    }
                    for d in m["differentials"]
                ],
                "clinicalPearl": f"Key exam pattern: {m['mnemonic']} for {m['pattern']}"
            }

        cache[key] = enrichment
        save_cache(cache)
        print(f"  [1/4] Enriched {len(enrichment.get('differentials',[]))} differentials")
        print("  ⏳ 5s pause before Step 2...")
        time.sleep(5)

    # ── Step 2: Native NotebookLM Studio infographic generation ─
    png_path = os.path.join(TMP_DIR, f"infographic_ch{ch:02d}.png")
    cached_png = png_path.replace(TMP_DIR, HTML_CACHE_DIR).replace(".png", "_native.png")

    if skip_step1 and os.path.exists(cached_png):
        print(f"  [2/4] Step 2: using cached native PNG")
        import shutil
        os.makedirs(TMP_DIR, exist_ok=True)
        shutil.copy(cached_png, png_path)
    else:
        print("  [2/4] Step 2: generating native Studio infographic...")
        description = build_native_generator_description(m, enrichment)

        gen_r = subprocess.run(
            ["notebooklm", "generate", "infographic",
             "--style", "editorial",
             "--detail", "detailed",
             "--orientation", "portrait",
             "--wait",
             "--json",
             description],
            capture_output=True, text=True, timeout=480
        )
        if gen_r.returncode != 0:
            raise Exception(f"generate infographic failed: {gen_r.stderr.strip()[:300]}")

        gen_data = json.loads(gen_r.stdout)
        artifact_id = gen_data.get("task_id") or gen_data.get("artifact_id")
        if not artifact_id:
            raise Exception(f"No artifact_id in response: {gen_r.stdout[:200]}")

        print(f"  [2/4] Artifact generated: {artifact_id[:16]}... Downloading...")
        os.makedirs(TMP_DIR, exist_ok=True)
        dl_r = subprocess.run(
            ["notebooklm", "download", "infographic",
             "--latest", png_path, "--force", "--json"],
            capture_output=True, text=True, timeout=60
        )
        if dl_r.returncode != 0:
            raise Exception(f"download failed: {dl_r.stderr.strip()[:200]}")

        if not os.path.exists(png_path):
            raise Exception("Downloaded file not found at expected path")

        # Cache the native PNG for skip-step1 re-runs
        os.makedirs(HTML_CACHE_DIR, exist_ok=True)
        import shutil
        shutil.copy(png_path, cached_png)

        size = os.path.getsize(png_path)
        print(f"  [2/4] Native PNG downloaded ({size // 1024}KB)")

    # ── Step 2b: Resize + crop to Instagram 4:5 (1080×1350) ────
    png_path = crop_to_instagram(png_path)

    # ── Step 3: Upload to Convex ────────────────────────────────
    print("  [3/3] Uploading to Convex storage...")
    upload_to_convex(png_path, m)
    os.remove(png_path)

    print(f"  ✓ COMPLETE — Ch.{ch:02d} {m['pattern']}")
    return True

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    category_arg = None
    limit = None
    dry_run    = "--dry-run"    in sys.argv
    skip_step1 = "--skip-step1" in sys.argv

    for arg in sys.argv[1:]:
        if not arg.startswith("--"):
            category_arg = arg
            break
    for i, arg in enumerate(sys.argv):
        if arg == "--limit" and i + 1 < len(sys.argv):
            try:
                limit = int(sys.argv[i + 1])
            except ValueError:
                pass

    print(f"\n🖼  FRCRbank Mnemonic Infographic Generator (2-step NotebookLM)")
    print(f"{'='*60}")
    if category_arg:
        print(f"  Category : {category_arg}")
    else:
        print(f"  Categories: all ({', '.join(CATEGORIES)})")
    if dry_run:     print("  Mode     : DRY RUN")
    if skip_step1:  print("  Step 1   : using cached enrichment only")
    if limit:       print(f"  Limit    : {limit}")

    progress = load_progress()
    cache    = load_cache()
    completed_chapters = set(p["chapterNumber"] for p in progress["completed"])

    print("\n  Fetching mnemonics from Convex...")
    if category_arg:
        mnemonics = run_convex("mnemonics:getByCategory", {"categoryAbbreviation": category_arg})
        if not mnemonics:
            all_m = run_convex("mnemonics:list", {})
            mnemonics = [m for m in (all_m or []) if m.get("categoryAbbreviation") == category_arg]
    else:
        mnemonics = run_convex("mnemonics:list", {})

    if not mnemonics:
        print(f"  ✗ No mnemonics found.")
        return

    to_process = [m for m in mnemonics if m["chapterNumber"] not in completed_chapters]
    to_process.sort(key=lambda m: m["chapterNumber"])
    if limit:
        to_process = to_process[:limit]

    print(f"  Total: {len(mnemonics)}, Completed: {len(completed_chapters)}, To process: {len(to_process)}")

    if not to_process:
        print("  ✓ All done!")
        return

    if dry_run:
        print("\n  DRY RUN — would process:")
        for m in to_process:
            print(f"    Ch.{m['chapterNumber']:02d}  {m['pattern']}  ({m['mnemonic']})")
        return

    print("  Checking auth...")
    if not check_auth():
        print("  ⚠ Auth not valid.")
        if not wait_for_auth():
            return

    success, failed = 0, []

    for i, m in enumerate(to_process):
        if i > 0 and i % 10 == 0:
            if not check_auth():
                if not wait_for_auth():
                    break

        try:
            ok = process_mnemonic(m, cache, skip_step1)
            if ok:
                success += 1
                progress["completed"].append({
                    "chapterNumber": m["chapterNumber"],
                    "pattern": m["pattern"],
                    "mnemonic": m["mnemonic"],
                    "category": m["categoryAbbreviation"],
                    "time": time.strftime("%Y-%m-%dT%H:%M:%S"),
                })
                save_progress(progress)
            else:
                failed.append(f"Ch.{m['chapterNumber']}")
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed.append(f"Ch.{m['chapterNumber']} {m['pattern']}")
            progress["failed"].append({
                "chapterNumber": m["chapterNumber"],
                "pattern": m["pattern"],
                "error": str(e)[:200],
                "time": time.strftime("%Y-%m-%dT%H:%M:%S"),
            })
            save_progress(progress)
            if "auth" in str(e).lower() or "redirect" in str(e).lower():
                if not wait_for_auth():
                    break

        # Rate limit between mnemonics (3 NotebookLM calls per mnemonic)
        if i < len(to_process) - 1:
            print("  ⏳ 12s pause (rate limit)...")
            time.sleep(12)

    print(f"\n{'='*60}")
    print(f"  SUMMARY: {success}/{len(to_process)} infographics generated")
    if failed:
        print(f"  Failed: {', '.join(failed[:10])}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
