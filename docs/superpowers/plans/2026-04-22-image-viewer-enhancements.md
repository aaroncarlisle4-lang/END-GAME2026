# Image Viewer Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-and-drop reordering (folders, thumbnails, discriminant columns), per-bucket findings, always-visible import panel, favourites system, fix Add Note bug, fix import-to-wrong-folder bug, and enlarge attribution text in the image viewer.

**Architecture:** All persistence goes through Convex. Three new Convex backend files (`viewerPreferences.ts`, `userFavourites.ts`, updated `viewerFindings.ts`) plus schema changes form the foundation. Frontend changes are split between `RapidImageViewer.tsx` (D&D, findings, import UX), `InlineDiscriminators.tsx` (column D&D), and `DifferentialsPage.tsx` (favourites tab section, wiring). D&D uses `@dnd-kit/core` + `@dnd-kit/sortable` throughout for consistency.

**Tech Stack:** React 18, Convex, `@dnd-kit/core` + `@dnd-kit/sortable`, Tailwind CSS, TypeScript

---

## File Map

| File | What changes |
|------|-------------|
| `convex/schema.ts` | Add `viewerPreferences`, `userFavourites` tables; add `bucketName` + index to `viewerFindings`; add `sortOrder` to `studyManifests` |
| `convex/viewerFindings.ts` | Add `bucketName` param, `getAll` query |
| `convex/viewerPreferences.ts` | **New** — CRUD for folder order + column order |
| `convex/userFavourites.ts` | **New** — toggle, listAll, isFavourited |
| `convex/studyImages.ts` | Add `reorderClusters` mutation |
| `src/components/text/AddNoteModal.tsx` | Accept `discriminatorId: Id<"discriminators">` instead of full doc |
| `src/components/images/RapidImageViewer.tsx` | D1 folder D&D, D2 thumbnail D&D, E1 findings per bucket, E2 import sidebar always visible, E3 import findings field, F2 caseGroup format fix, C1 caption size, heart icon in toolbar |
| `src/components/case/InlineDiscriminators.tsx` | D3 column D&D, heart icon in header |
| `src/pages/DifferentialsPage.tsx` | F1 Add Note fix, V1 favourites section + wiring, E1 findings getAll wiring, D1/D2/D3 viewerPreferences wiring |

---

## Task 1: Install @dnd-kit

**Files:** `package.json`, `node_modules/`

- [ ] **Step 1: Install the packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@dnd-kit/core'); console.log('ok')"
```

Expected: prints `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @dnd-kit for drag-and-drop sorting"
```

---

## Task 2: Schema Changes

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add `bucketName` to `viewerFindings`, add `sortOrder` to `studyManifests`, add `viewerPreferences` and `userFavourites` tables**

In `convex/schema.ts`, replace the `viewerFindings` table definition (currently lines 499-505):

```typescript
  viewerFindings: defineTable({
    sourceType: v.string(),
    sourceId: v.string(),
    bucketName: v.optional(v.string()), // "" = title folder, undefined = legacy title
    findings: v.string(),
    updatedAt: v.number(),
  })
    .index("by_source", ["sourceType", "sourceId"]),
```

In the `studyManifests` table definition, add `sortOrder` as an optional field at the top level (after `createdAt`):

```typescript
    createdAt: v.number(),
    sortOrder: v.optional(v.number()),
```

After the closing `});` of the `viewerFindings` table and before the final `});` of the schema export, add:

```typescript
  viewerPreferences: defineTable({
    sourceType: v.string(),
    sourceId: v.string(),
    folderOrder: v.optional(v.array(v.string())),   // custom bucket name ordering
    columnOrder: v.optional(v.array(v.number())),   // custom differential column ordering (originalIndex values)
  })
    .index("by_source", ["sourceType", "sourceId"]),

  userFavourites: defineTable({
    sourceType: v.string(),  // "yjlCase" | "differentialPattern" | "mnemonic" | "chapman"
    sourceId: v.string(),
    categoryName: v.string(), // for grouping in High Yield tab
    title: v.string(),
  })
    .index("by_source", ["sourceType", "sourceId"])
    .index("by_category", ["sourceType", "categoryName"]),
```

- [ ] **Step 2: Verify schema compiles**

```bash
npx convex dev --once 2>&1 | head -20
```

Expected: no TypeScript errors; may show schema deployment message.

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add viewerPreferences, userFavourites tables; extend viewerFindings with bucketName"
```

---

## Task 3: Update `viewerFindings` Backend

**Files:**
- Modify: `convex/viewerFindings.ts`

- [ ] **Step 1: Replace entire file with bucket-aware version**

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Fetch a single bucket's findings. bucketName="" means the title/primary folder.
// Falls back to legacy records (bucketName undefined) when querying the title folder.
export const getBySourceBucket = query({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    bucketName: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();
    // Match exact bucketName, or legacy records (undefined) for the title bucket
    return (
      all.find((r) => (r.bucketName ?? "") === args.bucketName) ?? null
    );
  },
});

// Fetch all bucket findings for a source as a map of bucketName -> findings text.
export const getAllBySource = query({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();
    // Return as array; UI builds a Map<bucketName, findings>
    return all.map((r) => ({
      bucketName: r.bucketName ?? "",
      findings: r.findings,
    }));
  },
});

// Keep old getBySource for backward compatibility with other call sites
export const getBySource = query({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();
    return all.find((r) => !r.bucketName) ?? null;
  },
});

export const save = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    bucketName: v.optional(v.string()),
    findings: v.string(),
  },
  handler: async (ctx, args) => {
    const targetBucket = args.bucketName ?? "";
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();

    const existing = all.find((r) => (r.bucketName ?? "") === targetBucket);

    if (existing) {
      await ctx.db.patch(existing._id, {
        findings: args.findings,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("viewerFindings", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        bucketName: targetBucket,
        findings: args.findings,
        updatedAt: Date.now(),
      });
    }
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add convex/viewerFindings.ts
git commit -m "feat: extend viewerFindings with per-bucket support (bucketName field)"
```

---

## Task 4: New `viewerPreferences` Backend

**Files:**
- Create: `convex/viewerPreferences.ts`

- [ ] **Step 1: Create the file**

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { sourceType: v.string(), sourceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("viewerPreferences")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .first();
  },
});

export const setFolderOrder = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    folderOrder: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("viewerPreferences")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { folderOrder: args.folderOrder });
    } else {
      await ctx.db.insert("viewerPreferences", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        folderOrder: args.folderOrder,
      });
    }
  },
});

export const setColumnOrder = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    columnOrder: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("viewerPreferences")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { columnOrder: args.columnOrder });
    } else {
      await ctx.db.insert("viewerPreferences", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        columnOrder: args.columnOrder,
      });
    }
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add convex/viewerPreferences.ts
git commit -m "feat: add viewerPreferences backend (folder order + column order)"
```

---

## Task 5: New `userFavourites` Backend

**Files:**
- Create: `convex/userFavourites.ts`

- [ ] **Step 1: Create the file**

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("userFavourites").collect();
  },
});

export const toggle = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    categoryName: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userFavourites")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // now unfavourited
    } else {
      await ctx.db.insert("userFavourites", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        categoryName: args.categoryName,
        title: args.title,
      });
      return true; // now favourited
    }
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add convex/userFavourites.ts
git commit -m "feat: add userFavourites backend (toggle, listAll)"
```

---

## Task 6: `studyImages.reorderClusters` Mutation

**Files:**
- Modify: `convex/studyImages.ts`

- [ ] **Step 1: Add mutation at the end of `convex/studyImages.ts`**

```typescript
// Reorder image clusters within a source by assigning new sortOrder values.
// orderedCaseGroups: array of caseGroup strings in the desired order.
export const reorderClusters = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    orderedCaseGroups: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const allImages = await ctx.db
      .query("studyImages")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();

    const allManifests = await ctx.db
      .query("studyManifests")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();

    for (let i = 0; i < args.orderedCaseGroups.length; i++) {
      const caseGroup = args.orderedCaseGroups[i];
      const base = i * 1000;

      const imgs = allImages.filter((img) => img.caseGroup === caseGroup);
      for (let j = 0; j < imgs.length; j++) {
        await ctx.db.patch(imgs[j]._id, { sortOrder: base + j });
      }

      const manifests = allManifests.filter((m) => m.caseGroup === caseGroup);
      for (let j = 0; j < manifests.length; j++) {
        await ctx.db.patch(manifests[j]._id, { sortOrder: base + j });
      }
    }
  },
});
```

Note: the `studyManifests` table now needs the `sortOrder` field from the schema change in Task 2. The `listBySource` query in `studyImages.ts` already collects manifests without explicit sort — it relies on insertion order from the Map. After this change, update `listBySource` to sort manifests by `sortOrder` when available.

- [ ] **Step 2: In `listBySource`, sort manifests by `sortOrder` before adding to result**

Find the section in `listBySource` where manifests are pushed to the results array. Ensure manifests are sorted:

```typescript
// Sort manifests by sortOrder (new field) or fallback to _creationTime
const sortedManifests = [...manifests].sort(
  (a, b) => (a.sortOrder ?? a._creationTime) - (b.sortOrder ?? b._creationTime)
);
// Use sortedManifests instead of manifests below
```

- [ ] **Step 3: Verify**

```bash
npx convex dev --once 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add convex/studyImages.ts
git commit -m "feat: add reorderClusters mutation; sort manifests by sortOrder in listBySource"
```

---

## Task 7: Fix F1 — Add Note Button (AddNoteModal)

**Files:**
- Modify: `src/components/text/AddNoteModal.tsx`

**Root cause:** The modal received a full `Doc<"discriminators">` but callers could only provide it when the discriminator panel was already expanded. Fix: accept just an ID and fetch internally.

- [ ] **Step 1: Replace `AddNoteModal.tsx`**

```typescript
import { useState, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, BookmarkPlus, Save, Check, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const FIELD_LABELS: Record<string, string> = {
  dominantImagingFinding: "Dominant Imaging Finding",
  distributionLocation: "Distribution & Location",
  demographicsClinicalContext: "Demographics & Clinical",
  discriminatingKeyFeature: "Key Discriminating Feature",
  associatedFindings: "Associated Findings",
  complicationsSeriousAlternatives: "Complications / Serious Alternatives",
};

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  discriminatorId: Id<"discriminators">;
}

export function AddNoteModal({ open, onClose, discriminatorId }: AddNoteModalProps) {
  const discriminator = useQuery(api.discriminators.get, open ? { id: discriminatorId } : "skip");
  const createNote = useMutation(api.pendingNotes.create);

  const [differentialIndex, setDifferentialIndex] = useState(0);
  const [field, setField] = useState("dominantImagingFinding");
  const [rawText, setRawText] = useState("");
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!rawText.trim() || !discriminator) return;
    setSaving(true);
    try {
      await createNote({
        discriminatorId,
        differentialIndex,
        field,
        rawText: rawText.trim(),
        source: source.trim() || undefined,
      });
      setSaved(true);
      setRawText("");
      setSource("");
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-white font-bold text-base flex items-center gap-2">
                      <BookmarkPlus className="w-4 h-4 text-amber-400" />
                      Add Note
                    </DialogTitle>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">
                      {discriminator?.pattern ?? "Loading..."}
                    </p>
                  </div>
                  <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!discriminator ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                          Differential
                        </label>
                        <select
                          value={differentialIndex}
                          onChange={(e) => setDifferentialIndex(Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                        >
                          {discriminator.differentials.map((d, i) => (
                            <option key={i} value={i}>{d.diagnosis}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                          Field
                        </label>
                        <select
                          value={field}
                          onChange={(e) => setField(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                        >
                          {Object.entries(FIELD_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                        Note Text
                      </label>
                      <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste or type your note here..."
                        rows={4}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                        Source <span className="font-normal text-slate-400 normal-case">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g. Dahnert p.412, Grainger & Allison"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                      />
                    </div>
                  </div>
                )}

                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!rawText.trim() || saving || !discriminator}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold text-white rounded-lg transition-colors disabled:opacity-40 ${
                      saved ? "bg-emerald-500" : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? "Saved!" : saving ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
```

- [ ] **Step 2: Update `DifferentialsPage.tsx` — change `noteTarget` state type and all `onAddNote` callbacks**

Change line 1033:
```typescript
// FROM:
const [noteTarget, setNoteTarget] = useState<Doc<"discriminators"> | null>(null);
// TO:
const [noteTarget, setNoteTarget] = useState<Id<"discriminators"> | null>(null);
```

Change all four `onAddNote` callback sites (lines 1553, 1584, 1638, 1680, 1735, 1788) from:
```typescript
onAddNote={lookup ? () => setNoteTarget(activeFullDiscriminator ?? null) : undefined}
```
to:
```typescript
onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
```

Change the AddNoteModal usage (around line 1820) from:
```typescript
{noteTarget && (
  <AddNoteModal
    open={true}
    onClose={() => setNoteTarget(null)}
    discriminator={noteTarget}
  />
)}
```
to:
```typescript
{noteTarget && (
  <AddNoteModal
    open={true}
    onClose={() => setNoteTarget(null)}
    discriminatorId={noteTarget}
  />
)}
```

- [ ] **Step 3: Remove the `Doc` import from DifferentialsPage if no longer used elsewhere**

Check: `grep -n "Doc<" src/pages/DifferentialsPage.tsx` — if `Doc` only appeared for noteTarget, remove it from the import.

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors related to AddNoteModal or noteTarget.

- [ ] **Step 5: Commit**

```bash
git add src/components/text/AddNoteModal.tsx src/pages/DifferentialsPage.tsx
git commit -m "fix: Add Note button now works without expanding discriminator panel first"
```

---

## Task 8: Fix F2 — Import caseGroup Format

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`

**Root cause:** `caseGroup` format `"BucketName - Label [timestamp]"` — the lazy regex cuts off bucket names that contain ` - `. New format: `"[BucketName] Label [timestamp]"`.

- [ ] **Step 1: Update import handler in `RapidImageViewer.tsx`**

Find the import button onClick handler (around line 883-894). Change the `group` line:

```typescript
// FROM:
const group = `${bucket} - ${label} [${Date.now()}]`;
// TO:
const group = `[${bucket}] ${label} [${Date.now()}]`;
```

- [ ] **Step 2: Update bucket extraction regex in `RapidImageViewer.tsx`**

Find the `buckets` useMemo (around line 163-206). The regex lines (around line 169) currently:
```typescript
const match = cluster.caseGroup?.match(/^(.+?)\s*-\s*.*\[\d+\]$/) || cluster.caseGroup?.match(/^(.+?)\s*-\s*.*$/);
```

Replace with:
```typescript
// New format: "[BucketName] Label [timestamp]"
// Old format: "BucketName - Label [timestamp]" (backward compat)
const match =
  cluster.caseGroup?.match(/^\[(.+?)\]/) ||
  cluster.caseGroup?.match(/^(.+?)\s*-\s*.*\[\d+\]$/) ||
  cluster.caseGroup?.match(/^(.+?)\s*-\s*.*$/);
```

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx
git commit -m "fix: change import caseGroup format to [BucketName] to prevent wrong-folder bug"
```

---

## Task 9: Fix C1 — Caption Text Size

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`

- [ ] **Step 1: Increase attribution text size**

Find the floating footer attribution section (around line 1216-1221):
```typescript
<p className="text-[11px] text-teal-400/90 italic font-medium">
  {currentAttribution}
</p>
```

Change to:
```typescript
<p className="text-sm text-teal-400 italic font-medium leading-snug">
  {currentAttribution}
</p>
```

Also find the backdrop `div` wrapping the attribution (line 1217) — remove any implicit width constraint by ensuring `w-full max-w-2xl mx-auto` on the parent:

```typescript
// Change the parent div (line 1215) from:
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none w-full px-10 z-20">
// To:
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none w-full max-w-3xl px-6 z-20">
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx
git commit -m "fix: increase attribution text size for readability in image viewer"
```

---

## Task 10: Fix E2 — Import Sidebar Always Visible

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`

- [ ] **Step 1: Remove the `cases.length > 0` guard on the thumbnail sidebar**

Find (around line 812):
```typescript
{/* Left sidebar — thumbnail navigation */}
{cases.length > 0 && (
  <div
    ref={sidebarRef}
    className="w-44 shrink-0 ...">
```

Change to always render the sidebar (remove the `cases.length > 0 &&` wrapper). Keep the `ref`, `className`, and all content. Only the conditional wrapper changes.

- [ ] **Step 2: Add empty-state placeholder when no images exist**

Inside the sidebar, after the import panel block (around line 901), add:

```typescript
{cases.length === 0 && !showImport && (
  <div className="flex flex-col items-center justify-center py-8 px-3 text-center gap-2">
    <ImageOff className="w-6 h-6 text-slate-600" />
    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-tight">
      No images yet
    </p>
    {canImport && (
      <p className="text-[8px] text-slate-500">
        Use Import above to add images to this folder
      </p>
    )}
  </div>
)}
```

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx
git commit -m "feat: import sidebar always visible even when folder has no images"
```

---

## Task 11: Fix E1 — Findings Box in All Folders

This requires changes in both `DifferentialsPage.tsx` (wiring) and `RapidImageViewer.tsx` (rendering).

**Files:**
- Modify: `src/pages/DifferentialsPage.tsx`
- Modify: `src/components/images/RapidImageViewer.tsx`

**Part A: DifferentialsPage — switch to `getAllBySource` and track active bucket name**

- [ ] **Step 1: Update the `viewerFindings` query in `DifferentialsPage.tsx`**

Find around line 1096:
```typescript
const viewerFindingsData = useQuery(
  api.viewerFindings.getBySource,
  viewerTarget
    ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId }
    : "skip"
);
```

Replace with:
```typescript
const viewerFindingsAll = useQuery(
  api.viewerFindings.getAllBySource,
  viewerTarget
    ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId }
    : "skip"
);
// Build a quick-lookup map: bucketName -> findings text
const viewerFindingsMap = useMemo(() => {
  const m = new Map<string, string>();
  for (const row of viewerFindingsAll ?? []) {
    m.set(row.bucketName, row.findings);
  }
  return m;
}, [viewerFindingsAll]);
```

- [ ] **Step 2: Add `activeBucketName` state to DifferentialsPage**

Near the `viewerOpen` state declaration, add:
```typescript
const [viewerActiveBucketName, setViewerActiveBucketName] = useState<string>("");
```

- [ ] **Step 3: Update `handleSaveFindings` to include `bucketName`**

Replace the existing `handleSaveFindings` (around line 1104):
```typescript
const handleSaveFindings = useCallback((text: string, bucketName: string) => {
  if (!viewerTarget) return;
  saveFindings({
    sourceType: viewerTarget.sourceType,
    sourceId: viewerTarget.sourceId,
    bucketName,
    findings: text,
  });
}, [viewerTarget, saveFindings]);
```

- [ ] **Step 4: Update the RapidImageViewer usage in DifferentialsPage**

Find the `<RapidImageViewer>` component call (around line 1890+). Update the `findings` and `onSaveFindings` props, and add `onActiveBucketChange`:

```typescript
findings={viewerFindingsMap.get(viewerActiveBucketName) ?? ""}
onSaveFindings={(text) => handleSaveFindings(text, viewerActiveBucketName)}
onActiveBucketChange={(bucketName) => setViewerActiveBucketName(bucketName)}
```

**Part B: RapidImageViewer — remove primary-only guard, add `onActiveBucketChange` prop**

- [ ] **Step 5: Add `onActiveBucketChange` to `RapidImageViewerProps`**

```typescript
/** Notifies parent when active bucket changes, for per-bucket findings */
onActiveBucketChange?: (bucketName: string) => void;
```

And destructure it in the component:
```typescript
onActiveBucketChange,
```

- [ ] **Step 6: Call `onActiveBucketChange` whenever the active bucket changes**

Find the bucket button `onClick` handler (around line 754):
```typescript
onClick={() => {
  setActiveBucketId(idx);
  setCaseIndex(0);
  setSliceIndex(0);
  setExpanded(false);
  onActiveBucketChange?.(bucket.name);  // ADD THIS LINE
}}
```

Also call it during initialization in the `useEffect` that sets `activeBucketIndex` (after `setActiveBucketId(b)`) and when case navigation resets (in the `sourceId` useEffect):
```typescript
onActiveBucketChange?.(buckets[0]?.name ?? "");
```

- [ ] **Step 7: Remove the `activeBucketIndex === 0` guard on the Findings box**

Find (around line 997):
```typescript
{/* Findings + Viva Summary — left column, primary folder only */}
{activeBucketIndex === 0 && (
  <div className="absolute top-4 left-3 z-30 ...">
    <div className="px-3 py-2 ...">  {/* Findings box */}
```

Remove the `activeBucketIndex === 0 &&` wrapper. The Findings box now always renders when a bucket is active.

Similarly remove the guard around the right-side viva overlays block (around line 1095):
```typescript
{/* Right sidebar overlays — primary folder only */}
{activeBucketIndex === 0 && (
```
→ Change to render always (remove the condition), since findings + overlays should all work per-folder. However, the `vivaSummary` box only makes sense for the primary folder — keep the condition inside the box: only render the viva summary `div` when `activeBucketIndex === 0`.

- [ ] **Step 8: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 9: Commit**

```bash
git add src/pages/DifferentialsPage.tsx src/components/images/RapidImageViewer.tsx
git commit -m "feat: findings box now appears for every folder with per-bucket persistence"
```

---

## Task 12: Fix E3 — Findings Field in Import Form

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`

- [ ] **Step 1: Add `importFindings` state**

Near the other import state declarations (around line 130):
```typescript
const [importFindings, setImportFindings] = useState("");
```

- [ ] **Step 2: Add findings textarea to the import panel UI**

Inside the import panel `div` (around line 843), add the findings textarea as the FIRST input (before the URL textarea):

```typescript
<input
  type="text"
  value={importFindings}
  onChange={(e) => setImportFindings(e.target.value)}
  placeholder="Findings (optional)"
  className="w-full text-[10px] px-2 py-1.5 rounded-lg bg-slate-800 border border-amber-500/30 text-amber-200 placeholder-amber-500/40 focus:border-amber-400"
/>
```

- [ ] **Step 3: Save findings on import**

In the import button's `onClick` handler, after `await imgUpload.addByUrlBatch(...)` and before clearing state, add:

```typescript
if (importFindings.trim() && onSaveFindings) {
  onSaveFindings(importFindings.trim(), activeBucket.name);
}
```

Then clear `importFindings` alongside the other reset lines:
```typescript
setImportFindings("");
```

Note: `onSaveFindings` now takes `(text: string, bucketName: string)` — update the prop type in `RapidImageViewerProps`:
```typescript
onSaveFindings?: (text: string, bucketName: string) => void;
```

And update all existing calls in `RapidImageViewer` that call `onSaveFindings?.(findingsDraft)` to `onSaveFindings?.(findingsDraft, activeBucket.name)`.

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx
git commit -m "feat: add Findings field to import form, auto-saves to active bucket on import"
```

---

## Task 13: D2 — Thumbnail Drag-and-Drop Reorder

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`

- [ ] **Step 1: Add dnd-kit imports at top of RapidImageViewer.tsx**

Add to the imports block:
```typescript
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
```

- [ ] **Step 2: Add `reorderClusters` mutation and `viewerPrefs` query**

Near the top of the component, after existing mutations:
```typescript
const reorderClustersMut = useMutation(api.studyImages.reorderClusters);
```

- [ ] **Step 3: Add local reorder state for cases within the active bucket**

After `const cases = activeBucket?.clusters || [];` add:
```typescript
// Local ordered case list — optimistic reorder; persisted to Convex on drag end
const [localCaseOrder, setLocalCaseOrder] = useState<string[]>([]);

// Sync localCaseOrder when bucket changes or cases update
useEffect(() => {
  setLocalCaseOrder(cases.map((c) => c.caseGroup ?? c.label));
}, [activeBucketIndex, cases.length]); // eslint-disable-line react-hooks/exhaustive-deps

const orderedCases = useMemo(() => {
  if (localCaseOrder.length !== cases.length) return cases;
  const map = new Map(cases.map((c) => [c.caseGroup ?? c.label, c]));
  return localCaseOrder.map((key) => map.get(key)).filter(Boolean) as CaseCluster[];
}, [cases, localCaseOrder]);
```

Replace all references to `cases` in the thumbnail rendering with `orderedCases` (the sorted version).

- [ ] **Step 4: Add `handleThumbnailDragEnd`**

```typescript
const handleThumbnailDragEnd = useCallback(
  async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localCaseOrder.indexOf(String(active.id));
    const newIndex = localCaseOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(localCaseOrder, oldIndex, newIndex);
    setLocalCaseOrder(newOrder);
    setCaseIndex(newIndex); // follow the dragged item

    if (canImport && sourceType && sourceId) {
      await reorderClustersMut({
        sourceType,
        sourceId,
        orderedCaseGroups: newOrder,
      });
    }
  },
  [localCaseOrder, canImport, sourceType, sourceId, reorderClustersMut]
);
```

- [ ] **Step 5: Create `SortableThumbnail` sub-component inside `RapidImageViewer.tsx` (before the main export)**

```typescript
function SortableThumbnail({
  id,
  img,
  isActive,
  caseAtI,
  expanded,
  onClick,
}: {
  id: string;
  img: StudyImage;
  isActive: boolean;
  caseAtI: CaseCluster | null;
  expanded: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative w-full">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 cursor-grab text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      <button
        data-active={isActive}
        onClick={onClick}
        className={`group relative shrink-0 w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
          isActive
            ? "border-teal-400 ring-2 ring-teal-400/30"
            : "border-transparent opacity-50 hover:opacity-90"
        }`}
      >
        {img.url ? (
          <img src={img.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <ImageOff className="w-4 h-4 text-slate-500" />
          </div>
        )}
        {!expanded && caseAtI && caseAtI.images.length > 1 && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/70 rounded px-1 flex items-center gap-0.5">
            <Layers className="w-2.5 h-2.5 text-white" />
            <span className="text-[8px] text-white font-bold">{caseAtI.images.length}</span>
          </div>
        )}
        {expanded && (
          <div className="absolute top-0.5 left-0.5 bg-black/60 rounded px-1">
            <span className="text-[8px] text-white font-mono">{/* slice num handled by parent */}</span>
          </div>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Wrap the thumbnail list with DndContext + SortableContext**

Replace the section that maps `thumbnailItems` (around line 903-957) with:

```typescript
const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

// Inside the sidebar JSX, replace the thumbnailItems.map block:
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleThumbnailDragEnd}
>
  <SortableContext
    items={localCaseOrder}
    strategy={verticalListSortingStrategy}
  >
    {orderedCases.map((cluster, i) => {
      const firstImg = cluster.images[0];
      if (!firstImg) return null;
      const isActive = i === caseIndex;
      const id = cluster.caseGroup ?? cluster.label;
      return (
        <SortableThumbnail
          key={id}
          id={id}
          img={firstImg}
          isActive={isActive}
          caseAtI={cluster}
          expanded={expanded}
          onClick={() => {
            setCaseIndex(i);
            setSliceIndex(0);
          }}
        />
      );
    })}
  </SortableContext>
</DndContext>
```

Note: `sensors` declaration should be at the top of the component function, not inside JSX.

- [ ] **Step 7: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 8: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx
git commit -m "feat: drag-and-drop thumbnail reordering (persists sortOrder to Convex)"
```

---

## Task 14: D1 — Folder Drag-and-Drop Reorder

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`
- Modify: `src/pages/DifferentialsPage.tsx`

- [ ] **Step 1: Add `viewerPrefs` query and `setFolderOrder` mutation to RapidImageViewer**

Add these props to `RapidImageViewerProps`:
```typescript
/** Saved folder order (bucket names) from Convex */
savedFolderOrder?: string[];
/** Persist new folder order */
onFolderReorder?: (newOrder: string[]) => void;
```

And destructure them in the component.

- [ ] **Step 2: Apply `savedFolderOrder` to bucket order**

After the `buckets` useMemo, add:
```typescript
const orderedBuckets = useMemo(() => {
  if (!savedFolderOrder || savedFolderOrder.length === 0) return buckets;
  const map = new Map(buckets.map((b) => [b.name, b]));
  const reordered = savedFolderOrder
    .map((name) => map.get(name))
    .filter(Boolean) as Bucket[];
  // Append any buckets not in savedFolderOrder (e.g. newly added ones)
  const seen = new Set(savedFolderOrder);
  for (const b of buckets) {
    if (!seen.has(b.name)) reordered.push(b);
  }
  return reordered;
}, [buckets, savedFolderOrder]);
```

Replace all uses of `buckets` in the component (index access, `.map`, `.length`) with `orderedBuckets`.

- [ ] **Step 3: Add `SortableFolderItem` sub-component**

```typescript
function SortableFolderItem({
  bucket,
  idx,
  isActive,
  onClick,
}: {
  bucket: Bucket;
  idx: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: bucket.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <span
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 cursor-grab text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </span>
      <button
        onClick={onClick}
        className={`relative w-full px-5 py-4 flex items-center gap-4 transition-all ${
          isActive
            ? "bg-teal-500/10 border-r-4 border-teal-500"
            : "hover:bg-slate-800/50"
        }`}
      >
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-300 ${
          isActive
            ? "bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.9)] scale-110"
            : "bg-slate-700 group-hover:bg-slate-500"
        }`} />
        <span className={`text-[12px] font-black uppercase tracking-normal text-left leading-tight transition-colors ${
          isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
        }`}>
          {bucket.name}
        </span>
        <span className="text-[9px] text-slate-600 font-mono">{bucket.clusters.length || 0}</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Replace the bucket list render with a DndContext + SortableContext**

Find the bucket navigation div (around line 745-808). Replace the `{orderedBuckets.map((bucket, idx) => (<button ...>))}` section with:

```typescript
const folderIds = orderedBuckets.map((b) => b.name);

// In JSX — inside the w-64 bucket nav div, replace bucket map:
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={(event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = folderIds.indexOf(String(active.id));
    const newIdx = folderIds.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    const newOrder = arrayMove(folderIds, oldIdx, newIdx);
    // Update active bucket index to follow the moved item
    if (activeBucketIndex === oldIdx) setActiveBucketId(newIdx);
    onFolderReorder?.(newOrder);
  }}
>
  <SortableContext items={folderIds} strategy={verticalListSortingStrategy}>
    {orderedBuckets.map((bucket, idx) => (
      <SortableFolderItem
        key={bucket.name}
        bucket={bucket}
        idx={idx}
        isActive={activeBucketIndex === idx}
        onClick={() => {
          setActiveBucketId(idx);
          setCaseIndex(0);
          setSliceIndex(0);
          setExpanded(false);
          onActiveBucketChange?.(bucket.name);
        }}
      />
    ))}
  </SortableContext>
</DndContext>
```

- [ ] **Step 5: Wire `savedFolderOrder` and `onFolderReorder` from DifferentialsPage**

In `DifferentialsPage.tsx`, add:
```typescript
const viewerPrefs = useQuery(
  api.viewerPreferences.get,
  viewerTarget ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId } : "skip"
);
const saveFolderOrder = useMutation(api.viewerPreferences.setFolderOrder);

const handleFolderReorder = useCallback((newOrder: string[]) => {
  if (!viewerTarget) return;
  saveFolderOrder({
    sourceType: viewerTarget.sourceType,
    sourceId: viewerTarget.sourceId,
    folderOrder: newOrder,
  });
}, [viewerTarget, saveFolderOrder]);
```

Pass to `<RapidImageViewer>`:
```typescript
savedFolderOrder={viewerPrefs?.folderOrder}
onFolderReorder={handleFolderReorder}
```

- [ ] **Step 6: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 7: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx src/pages/DifferentialsPage.tsx
git commit -m "feat: drag-and-drop folder reordering with Convex persistence"
```

---

## Task 15: D3 — Discriminant Table Column Drag-and-Drop

**Files:**
- Modify: `src/components/case/InlineDiscriminators.tsx`
- Modify: `src/pages/DifferentialsPage.tsx`

- [ ] **Step 1: Add dnd-kit imports to `InlineDiscriminators.tsx`**

```typescript
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
```

- [ ] **Step 2: Add `columnOrder` and `onColumnReorder` to `Props` interface**

```typescript
/** Persisted column order (array of originalIndex values) */
columnOrder?: number[];
/** Callback when user reorders columns */
onColumnReorder?: (newOrder: number[]) => void;
```

- [ ] **Step 3: Apply `columnOrder` to `diffs` before pagination**

After `const diffs = sortedDiffs;` (around line 379), add:

```typescript
// Apply user's custom column order if provided
const orderedDiffs = useMemo(() => {
  if (!columnOrder || columnOrder.length !== diffs.length) return diffs;
  const map = new Map(diffs.map((d) => [d.originalIndex, d]));
  return columnOrder.map((idx) => map.get(idx)).filter(Boolean) as typeof diffs;
}, [diffs, columnOrder]);

const effectiveDiffs = columnOrder ? orderedDiffs : diffs;
const totalPages = Math.ceil(effectiveDiffs.length / itemsPerPage);
const currentDiffs = effectiveDiffs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
```

Replace the existing `totalPages` and `currentDiffs` lines.

- [ ] **Step 4: Add `SortableColumnHeader` sub-component**

Define before the `InlineDiscriminators` function:

```typescript
function SortableColumnHeader({
  id,
  d,
  children,
}: {
  id: string;
  d: { isCorrectDiagnosis?: boolean; isSeriousAlternative?: boolean };
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`p-6 border-b-2 border-r last:border-r-0 border-slate-200 text-center relative ${
        d.isCorrectDiagnosis
          ? "bg-slate-900 text-white z-10"
          : "bg-white text-slate-900"
      }`}
    >
      {d.isCorrectDiagnosis && (
        <div className="absolute -top-px left-0 right-0 h-1 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
      )}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab text-slate-400 hover:text-slate-600"
        title="Drag to reorder column"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      {children}
    </th>
  );
}
```

- [ ] **Step 5: Wrap column headers in DndContext + SortableContext**

Find the `<thead><tr>` section (around line 599). Wrap the mapped `currentDiffs` headers in a sortable context. Because this is inside a `<tr>` (table row), we use `horizontalListSortingStrategy`:

```typescript
const columnSensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
);

const columnIds = currentDiffs.map((d) => String(d.originalIndex));

const handleColumnDragEnd = useCallback(
  (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Work with effectiveDiffs indices, not currentPage slice
    const allIds = effectiveDiffs.map((d) => String(d.originalIndex));
    const oldIdx = allIds.indexOf(String(active.id));
    const newIdx = allIds.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;

    const newOrder = arrayMove(
      effectiveDiffs.map((d) => d.originalIndex),
      oldIdx,
      newIdx
    );
    onColumnReorder?.(newOrder);
  },
  [effectiveDiffs, onColumnReorder]
);

// In JSX, wrap the `{currentDiffs.map(...)}` headers:
<DndContext
  sensors={columnSensors}
  collisionDetection={closestCenter}
  onDragEnd={handleColumnDragEnd}
>
  <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
    {currentDiffs.map((d) => (
      <SortableColumnHeader
        key={String(d.originalIndex)}
        id={String(d.originalIndex)}
        d={d}
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
            d.isCorrectDiagnosis ? "bg-teal-500 text-white border-teal-400" :
            (d as any).isSeriousAlternative ? "bg-rose-500 text-white border-rose-400" :
            "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {d.isCorrectDiagnosis ? "Primary Match" : (d as any).isSeriousAlternative ? "Serious Alt" : "Differential"}
          </span>
          <span className="text-base font-black uppercase tracking-tight leading-tight">
            {d.diagnosis}
          </span>
        </div>
      </SortableColumnHeader>
    ))}
  </SortableContext>
</DndContext>
```

The body rows still iterate `currentDiffs` (same order), so columns align correctly.

- [ ] **Step 6: Wire column order in DifferentialsPage**

Add state and mutations:
```typescript
const [columnOrderMap, setColumnOrderMap] = useState<Map<string, number[]>>(new Map());
const saveColumnOrder = useMutation(api.viewerPreferences.setColumnOrder);

const handleColumnReorder = useCallback((caseId: string, newOrder: number[]) => {
  setColumnOrderMap((prev) => new Map(prev).set(caseId, newOrder));
  saveColumnOrder({ sourceType: "yjlCase", sourceId: caseId, columnOrder: newOrder });
}, [saveColumnOrder]);
```

Load stored column order when a card is expanded. When setting `openDiscriminatorId`, also fetch the case's viewerPreferences (already fetched in `viewerPrefs` if viewerTarget matches, otherwise a separate query). For simplicity, use the `viewerPreferences.get` query reactively keyed to the open card:

```typescript
const openCasePrefs = useQuery(
  api.viewerPreferences.get,
  openDiscriminatorId ? { sourceType: "yjlCase", sourceId: openDiscriminatorId } : "skip"
);
```

Pass to the `YJLCard` / `InlineDiscriminators`:
```typescript
// In YJLCard (via InlineDiscriminators props):
columnOrder={openDiscriminatorId === c._id ? (openCasePrefs?.columnOrder ?? columnOrderMap.get(c._id)) : undefined}
onColumnReorder={(newOrder) => handleColumnReorder(c._id, newOrder)}
```

- [ ] **Step 7: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 8: Commit**

```bash
git add src/components/case/InlineDiscriminators.tsx src/pages/DifferentialsPage.tsx
git commit -m "feat: discriminant table column drag-and-drop reordering (per-case, Convex-persisted)"
```

---

## Task 16: V1 — Favourites: Backend Wire-Up + Heart Icon in YJLCard

**Files:**
- Modify: `src/pages/DifferentialsPage.tsx`
- Modify: `src/pages/DifferentialsPage.tsx` (YJLCard component inline)

- [ ] **Step 1: Load all favourites and build lookup set in DifferentialsPage**

```typescript
const allFavourites = useQuery(api.userFavourites.listAll) ?? [];
const favouriteSet = useMemo(
  () => new Set(allFavourites.map((f) => f.sourceId)),
  [allFavourites]
);
const toggleFavourite = useMutation(api.userFavourites.toggle);
```

- [ ] **Step 2: Add `isFavourited` and `onToggleFavourite` props to `YJLCard`**

In the `YJLCard` props interface:
```typescript
isFavourited?: boolean;
onToggleFavourite?: () => void;
```

- [ ] **Step 3: Add heart icon to `YJLCard` footer**

Find the YJLCard footer area (around line 621-628 where Add Note button is). Add the heart button alongside:

```typescript
import { Heart } from "lucide-react";

// Inside YJLCard footer, next to Add Note:
{onToggleFavourite && (
  <button
    onClick={(e) => { e.stopPropagation(); onToggleFavourite(); }}
    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
      isFavourited
        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        : "text-slate-400 hover:text-rose-400 border border-transparent"
    }`}
    title={isFavourited ? "Remove from favourites" : "Add to favourites"}
  >
    <Heart className={`w-3 h-3 ${isFavourited ? "fill-rose-500" : ""}`} />
    {isFavourited ? "Saved" : "Favourite"}
  </button>
)}
```

- [ ] **Step 4: Pass props from DifferentialsPage to YJLCard**

In the YJL tab render (around line 1728):
```typescript
<YJLCard
  ...existing props...
  isFavourited={favouriteSet.has(c._id)}
  onToggleFavourite={() => toggleFavourite({
    sourceType: "yjlCase",
    sourceId: c._id,
    categoryName: c.playlistCategory,
    title: c.title,
  })}
/>
```

- [ ] **Step 5: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/DifferentialsPage.tsx
git commit -m "feat: heart/favourite toggle on YJL play cards (persists to Convex)"
```

---

## Task 17: V1 — Heart Icon in Image Viewer + Discriminant Table Header

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`
- Modify: `src/components/case/InlineDiscriminators.tsx`

- [ ] **Step 1: Add `isFavourited` and `onToggleFavourite` props to `RapidImageViewerProps`**

```typescript
isFavourited?: boolean;
onToggleFavourite?: () => void;
```

- [ ] **Step 2: Add heart button to the RapidImageViewer toolbar**

Find the top toolbar button group (the area with zoom, annotate, delete, close buttons around line 680-739). Add the heart button:

```typescript
import { Heart } from "lucide-react";

// In the toolbar, before the close button:
{onToggleFavourite && (
  <button
    onClick={onToggleFavourite}
    className={`p-1.5 rounded-lg transition-colors ${
      isFavourited
        ? "text-rose-500"
        : "text-slate-400 hover:text-rose-400"
    }`}
    title={isFavourited ? "Remove from favourites" : "Add to favourites"}
  >
    <Heart className={`w-4 h-4 ${isFavourited ? "fill-rose-500" : ""}`} />
  </button>
)}
```

- [ ] **Step 3: Pass heart props from DifferentialsPage to RapidImageViewer**

In the `<RapidImageViewer>` call in DifferentialsPage:
```typescript
isFavourited={viewerTarget?.sourceType === "yjlCase" ? favouriteSet.has(viewerTarget.sourceId) : false}
onToggleFavourite={viewerTarget?.sourceType === "yjlCase" ? () => {
  const c = allYJL?.find(x => x._id === viewerTarget?.sourceId);
  if (!c || !viewerTarget) return;
  toggleFavourite({ sourceType: "yjlCase", sourceId: c._id, categoryName: c.playlistCategory, title: c.title });
} : undefined}
```

- [ ] **Step 4: Add heart to InlineDiscriminators header**

Add `isFavourited` and `onToggleFavourite` to the `Props` interface of `InlineDiscriminators`:
```typescript
isFavourited?: boolean;
onToggleFavourite?: () => void;
```

In the header div (around line 520-591), add the heart button alongside the close button:
```typescript
{onToggleFavourite && (
  <button
    onClick={onToggleFavourite}
    className={`p-2 rounded-xl transition-all border ${
      isFavourited
        ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
        : "bg-white/5 border-white/5 text-slate-400 hover:text-rose-400"
    }`}
    title={isFavourited ? "Remove from favourites" : "Add to favourites"}
  >
    <Heart className={`w-5 h-5 ${isFavourited ? "fill-rose-400" : ""}`} />
  </button>
)}
```

- [ ] **Step 5: Pass heart props from YJLCard to InlineDiscriminators**

In `YJLCard`, pass `isFavourited` and `onToggleFavourite` down to the `<InlineDiscriminators>` component embedded within it.

- [ ] **Step 6: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 7: Commit**

```bash
git add src/components/images/RapidImageViewer.tsx src/components/case/InlineDiscriminators.tsx src/pages/DifferentialsPage.tsx
git commit -m "feat: heart icon in image viewer toolbar and discriminant table header"
```

---

## Task 18: V1 — Favourites Section in High Yield Tab

**Files:**
- Modify: `src/pages/DifferentialsPage.tsx`

- [ ] **Step 1: Build grouped favourites for the High Yield tab**

In `DifferentialsPage.tsx`, add:
```typescript
const groupedFavourites = useMemo(() => {
  const yjlFavs = allFavourites.filter((f) => f.sourceType === "yjlCase");
  const map = new Map<string, typeof yjlFavs>();
  for (const fav of yjlFavs) {
    const arr = map.get(fav.categoryName) ?? [];
    arr.push(fav);
    map.set(fav.categoryName, arr);
  }
  return Array.from(map.entries()).sort(([a], [b]) => {
    const ai = YJL_CATEGORIES.indexOf(a);
    const bi = YJL_CATEGORIES.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}, [allFavourites]);
```

- [ ] **Step 2: Add Favourites section at the top of the High Yield tab**

Inside `{activeTab === "highyield" && (`, before `{groupedHighYield.map(...)}`, add:

```typescript
{groupedFavourites.length > 0 && (
  <div className="animate-in fade-in duration-500">
    <div className="flex items-end gap-3 mb-6 border-b border-rose-100 pb-2">
      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Favourited Cases</h2>
      <span className="text-[10px] font-black bg-rose-100 text-rose-500 px-2 py-1 rounded-md mb-1.5">
        {allFavourites.filter(f => f.sourceType === "yjlCase").length} CASES
      </span>
    </div>
    <div className="space-y-8">
      {groupedFavourites.map(([categoryName, favs]) => (
        <div key={categoryName}>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{categoryName}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {favs.map((fav) => {
              const c = allYJL?.find((x) => x._id === fav.sourceId);
              if (!c) return null;
              const lookup = c.discriminatorId
                ? allDiscriminatorLookups?.find((d) => d._id === c.discriminatorId)
                : patternMap.get(c.title.toLowerCase().trim());
              const discriminator = openDiscriminatorId === c._id && activeFullDiscriminator
                ? activeFullDiscriminator
                : undefined;
              return (
                <div key={c._id} className="relative">
                  <div className="absolute -top-3 left-4 z-10 bg-rose-500 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black uppercase tracking-widest border border-rose-600 flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-white" />
                    Favourited
                  </div>
                  <div className="pt-2">
                    <ImageDropZone
                      key={c._id}
                      sourceType="yjlCase"
                      sourceId={c._id}
                      imageCount={c.imageCount ?? 0}
                      onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                      differentialOptions={[c.title, ...c.top3Differentials]}
                    >
                      <YJLCard
                        c={c}
                        discriminator={discriminator}
                        hasDiscriminator={!!lookup}
                        discriminatorOpen={openDiscriminatorId === c._id}
                        setDiscriminatorOpen={(open) =>
                          setOpenDiscriminatorId(open ? c._id : null, open ? lookup?._id : undefined)
                        }
                        onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                        onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                        pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
                        isFavourited={true}
                        onToggleFavourite={() =>
                          toggleFavourite({
                            sourceType: "yjlCase",
                            sourceId: c._id,
                            categoryName: c.playlistCategory,
                            title: c.title,
                          })
                        }
                        onEditDifferentials={() => setEditDiffTarget(c)}
                      />
                    </ImageDropZone>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Add `Heart` to lucide imports in DifferentialsPage**

```typescript
import { ..., Heart } from "lucide-react";
```

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/DifferentialsPage.tsx
git commit -m "feat: favourited YJL2B cases appear in Highest Yield tab under their category"
```

---

## Self-Review

**Spec coverage check:**
- F1 Add Note ✅ Task 7
- F2 Import wrong folder ✅ Task 8
- D1 Folder reorder ✅ Task 14
- D2 Thumbnail reorder ✅ Task 13
- D3 Column reorder ✅ Task 15
- E1 Findings per bucket ✅ Task 11
- E2 Import always visible ✅ Task 10
- E3 Import findings field ✅ Task 12
- V1 Favourites ✅ Tasks 16+17+18
- C1 Caption size ✅ Task 9

**Placeholder scan:** All steps contain concrete code. No "TBD" or "similar to above."

**Type consistency check:**
- `onSaveFindings`: Takes `(text: string, bucketName: string)` — updated in Tasks 11 and 12.
- `noteTarget`: Changed from `Doc<"discriminators">` to `Id<"discriminators">` — consistent across Tasks 7 and all 6 `onAddNote` call sites.
- `addNoteModal` receives `discriminatorId` prop — consistent with the new AddNoteModal signature.
- `reorderClusters` accepts `orderedCaseGroups: string[]` — consistent with Task 6 definition and Task 13 call site.
- `viewerPreferences.get` returns `{ folderOrder?: string[], columnOrder?: number[] }` — consistent with usages in Tasks 14 and 15.
- `SortableFolderItem` uses `Bucket` type defined at line 79 of RapidImageViewer — consistent.
- `effectiveDiffs` used in Task 15 Step 3 and Step 5 handleColumnDragEnd — consistent.
