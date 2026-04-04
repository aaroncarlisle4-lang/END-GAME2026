# YJL2B Differential Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two image-import bugs, fix the broken discriminator cell editor, add a drag-to-reorder "Edit Differentials" modal on YJL play cards, and make the Create Card modal support more than 3 differentials.

**Architecture:** All fixes are frontend-only or use existing Convex mutations — no new backend mutations are needed. `yjlCases.update` already accepts `top3Differentials: string[]` of any length. `discriminators.update` already accepts a full `differentials` array. Reconciliation logic (merging old field data onto reordered names) lives in the new `EditDifferentialsModal` component inside `DifferentialsPage.tsx`.

**Tech Stack:** React 18, Convex (useMutation/useQuery), Tailwind CSS, HTML5 drag-and-drop (no extra library), lucide-react icons.

---

## File Map

| File | What changes |
|------|-------------|
| `src/components/images/ImageDropZone.tsx` | Fix `useEffect` deps (Bug A) + fix bucket name string (Bug B) |
| `src/components/case/InlineDiscriminators.tsx` | Replace placeholder line 686 with actual editing UI (Bug C) |
| `src/pages/DifferentialsPage.tsx` | Add `EditDifferentialsModal`, add pencil icon to `YJLCard`, make `CreateYJLCardModal` differentials dynamic |

---

## Task 1: Fix "General" button reset in ImageDropZone

**Files:**
- Modify: `src/components/images/ImageDropZone.tsx:52-57`

**Root cause:** The `useEffect` that initialises `selectedDifferential` lists `selectedDifferential` in its own dependency array. When the user clicks "General" (sets it to `""`), the effect fires again because `""` is falsy, and immediately resets it to `differentialOptions[0]`.

- [ ] **Step 1: Open `src/components/images/ImageDropZone.tsx` and locate the useEffect at lines 52–57:**

```ts
useEffect(() => {
  if (differentialOptions.length > 0 && !selectedDifferential) {
    setSelectedDifferential(differentialOptions[0]);
  }
}, [differentialOptions, selectedDifferential]);
```

- [ ] **Step 2: Remove `selectedDifferential` from the dependency array**

Replace those lines with:

```ts
useEffect(() => {
  if (differentialOptions.length > 0 && !selectedDifferential) {
    setSelectedDifferential(differentialOptions[0]);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [differentialOptions]);
```

The effect now only fires when the card changes (new `differentialOptions` prop), not when the user makes a selection.

- [ ] **Step 3: Verify manually**

Open the app in the browser. Navigate to the YJL 2B tab. Hover a card and open the stack import popover (layers icon). Click **General** — it should stay selected (highlighted dark). Previously it would flash and snap back to the first differential.

- [ ] **Step 4: Commit**

```bash
git add src/components/images/ImageDropZone.tsx
git commit -m "fix: General button no longer resets in ImageDropZone useEffect"
```

---

## Task 2: Fix "General" images not appearing in the image viewer

**Files:**
- Modify: `src/components/images/ImageDropZone.tsx` (3 locations)

**Root cause:** When `selectedDifferential` is `""` (General), imported images get `caseGroup` prefixes of `"General"`. The image viewer's regex extracts `"General"` as the bucket name. But the viewer names its catch-all bucket `"General / Uncategorized"` — so images land in a separate unlabelled bucket.

Fix: use `"General / Uncategorized"` as the fallback string everywhere a bucket prefix is built.

- [ ] **Step 1: Fix `handleStackImport` (around line 164)**

Find:
```ts
const bucket = selectedDifferential || "General";
```
Replace with:
```ts
const bucket = selectedDifferential || "General / Uncategorized";
```

- [ ] **Step 2: Fix `handleUrlSubmit` (around line 119)**

Find:
```ts
const group = selectedDifferential || urlValue.split("/").pop() || "Image";
await addByUrl(urlValue, urlValue.split("/").pop(), group);
```
Replace with:
```ts
const group = selectedDifferential
  ? `${selectedDifferential} - ${urlValue.split("/").pop() || "Image"} [${Date.now()}]`
  : `General / Uncategorized - ${urlValue.split("/").pop() || "Image"} [${Date.now()}]`;
await addByUrl(urlValue, urlValue.split("/").pop(), group);
```

- [ ] **Step 3: Fix `handleDrop` URL path (around line 103)**

Find:
```ts
const group = selectedDifferential || text.split("/").pop() || "Image";
await addByUrl(text, text.split("/").pop(), group);
```
Replace with:
```ts
const group = selectedDifferential
  ? `${selectedDifferential} - ${text.split("/").pop() || "Image"} [${Date.now()}]`
  : `General / Uncategorized - ${text.split("/").pop() || "Image"} [${Date.now()}]`;
await addByUrl(text, text.split("/").pop(), group);
```

- [ ] **Step 4: Verify manually**

Import a stack image with "General" selected. Open the image viewer for that card. The image should appear under the **General / Uncategorized** folder tab in the sidebar.

- [ ] **Step 5: Commit**

```bash
git add src/components/images/ImageDropZone.tsx
git commit -m "fix: General images now route to General/Uncategorized bucket in viewer"
```

---

## Task 3: Fix broken "Edit this section" button in discriminator table

**Files:**
- Modify: `src/components/case/InlineDiscriminators.tsx:685-687`

**Root cause:** Line 686 contains the literal text `... (unchanged editor code) ...` as a JSX text node — the editing UI was never written. All supporting handlers (`handleSave`, `applyFormat`, `fromHTML`, `toHTML`) are already present and correct.

- [ ] **Step 1: Open `src/components/case/InlineDiscriminators.tsx` and find lines 684–687:**

```tsx
{isEditing ? (
  <div className="flex flex-col gap-4 min-w-[500px] bg-white p-1 rounded-2xl shadow-sm">
    ... (unchanged editor code) ...
  </div>
```

- [ ] **Step 2: Replace those three lines with the full editing UI**

The `editingCell` object has shape `{ originalIndex: number; key: string; dbField: string; text: string }`. The `toHTML` / `fromHTML` / `applyFormat` / `handleSave` functions are already defined above in the same component. Icons `Highlighter`, `UnderlineIcon`, `Save`, `RotateCcw`, `Type` are already imported at the top of the file.

Replace:
```tsx
{isEditing ? (
  <div className="flex flex-col gap-4 min-w-[500px] bg-white p-1 rounded-2xl shadow-sm">
    ... (unchanged editor code) ...
  </div>
```

With:
```tsx
{isEditing ? (
  <div className="flex flex-col gap-3 min-w-[500px] bg-white p-2 rounded-2xl shadow-sm border border-teal-200">
    {/* Format toolbar */}
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Format:</span>
      <button
        onMouseDown={(e) => { e.preventDefault(); applyFormat('capitalize'); }}
        title="Capitalise selection"
        className="px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
      >
        AA
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); applyFormat('highlight'); }}
        title="Highlight selection"
        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all border border-transparent"
      >
        <Highlighter className="w-3 h-3" />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
        title="Underline selection"
        className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-all border border-transparent"
      >
        <UnderlineIcon className="w-3 h-3" />
      </button>
    </div>

    {/* ContentEditable rich editor */}
    <div
      id="visual-editor"
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: toHTML(editingCell.text) }}
      onInput={() => {
        const editor = document.getElementById('visual-editor');
        if (editor && editingCell) {
          setEditingCell({ ...editingCell, text: fromHTML(editor.innerHTML) });
        }
      }}
      className="min-h-[80px] p-3 rounded-xl border border-teal-300 bg-white text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30"
    />

    {/* Save / Cancel */}
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => setEditingCell(null)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
      >
        <RotateCcw className="w-3 h-3" />
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm"
      >
        <Save className="w-3 h-3" />
        Save
      </button>
    </div>
  </div>
```

Note: `onMouseDown` with `e.preventDefault()` on format buttons prevents the editor from losing focus before `applyFormat` reads `window.getSelection()`.

- [ ] **Step 3: Verify manually**

Open a discriminator table on any card (click "Discriminate"). Hover a cell — a pencil icon appears top-right. Click it. The cell should show the rich editor with format buttons and a Save/Cancel bar. Type something, click Save. The cell should update. Click the pencil again, highlight text, click the highlight button — the text should turn yellow.

- [ ] **Step 4: Commit**

```bash
git add src/components/case/InlineDiscriminators.tsx
git commit -m "fix: restore missing edit cell UI in discriminator table"
```

---

## Task 4: Add EditDifferentialsModal and pencil icon to YJLCard

**Files:**
- Modify: `src/pages/DifferentialsPage.tsx`

This task adds:
1. The `EditDifferentialsModal` component (new, defined before `DifferentialsPage`)
2. A pencil icon trigger on `YJLCard`
3. State wiring in `DifferentialsPage` to open the modal

### Step-by-step

- [ ] **Step 1: Add `editCase` state to `DifferentialsPage`**

Inside the `DifferentialsPage` function, find the existing state declarations (around line 748 where `viewerTarget` is defined). Add:

```tsx
const [editDiffTarget, setEditDiffTarget] = useState<YJLCase | null>(null);
```

- [ ] **Step 2: Add the `EditDifferentialsModal` component**

Add this new component directly above the `CreateYJLCardModal` function (around line 599). It uses the existing `api.yjlCases.update` and `api.discriminators.update` mutations — both already exist in the generated API.

```tsx
function EditDifferentialsModal({
  open,
  onClose,
  yjlCase,
  discriminator,
}: {
  open: boolean;
  onClose: () => void;
  yjlCase: YJLCase | null;
  discriminator?: Doc<"discriminators"> | null;
}) {
  const updateCase = useMutation(api.yjlCases.update);
  const updateDiscriminator = useMutation(api.discriminators.update);

  const [items, setItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  // Reset when modal opens with a new case
  useEffect(() => {
    if (open && yjlCase) {
      setItems([...yjlCase.top3Differentials]);
    }
  }, [open, yjlCase]);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next;
    });
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
  };

  const addItem = () => setItems((prev) => [...prev, ""]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!yjlCase) return;
    const filtered = items.filter((s) => s.trim());
    if (filtered.length === 0) return;
    setSaving(true);
    try {
      // 1. Update yjlCase differentials
      await updateCase({ id: yjlCase._id as Id<"yjlCases">, top3Differentials: filtered });

      // 2. If there's a linked discriminator, reconcile its differentials array
      if (discriminator) {
        const existing = discriminator.differentials;
        const existingByName = new Map(
          existing.map((d) => [d.diagnosis.toLowerCase().trim(), d])
        );
        const newDiffs = filtered.map((name, i) => {
          const key = name.toLowerCase().trim();
          const old = existingByName.get(key);
          if (old) {
            // Preserve all existing field data, update sortOrder
            return { ...old, sortOrder: i };
          }
          // New differential — blank row
          return { diagnosis: name, sortOrder: i };
        });
        await updateDiscriminator({ id: discriminator._id, differentials: newDiffs });
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !yjlCase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Differentials</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[280px]">{yjlCase.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {discriminator && (
          <p className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            Saving will update the discriminator table. Existing cell data is preserved.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            >
              {/* Grip handle */}
              <span className="text-slate-300 select-none text-sm leading-none shrink-0">⠿</span>

              {/* Number badge */}
              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-blue-400"
              }`}>
                {i + 1}
              </span>

              {/* Text input */}
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`Differential #${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
              />

              {/* Remove button */}
              <button
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-20"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Differential
        </button>

        <button
          onClick={handleSave}
          disabled={items.filter((s) => s.trim()).length === 0 || saving}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
```

Note: `Id` is already imported from `"../../convex/_generated/dataModel"` at the top of `DifferentialsPage.tsx`.

- [ ] **Step 3: Add `useRef` to the imports at the top of `DifferentialsPage.tsx`**

The file currently imports `useState, useMemo, useCallback` from `"react"`. Add `useRef` and `useEffect`:

```tsx
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
```

- [ ] **Step 4: Add a pencil icon trigger to `YJLCard`**

`YJLCard` currently takes props `c, discriminator, discriminatorOpen, setDiscriminatorOpen, onViewImages, onAddNote, pendingNoteCount, onNavigateDiscriminator, discriminatorPosition`. Add `onEditDifferentials`:

Find the `YJLCard` function signature (around line 468) and add the prop:

```tsx
function YJLCard({
  c,
  discriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
  onNavigateDiscriminator,
  discriminatorPosition,
  onEditDifferentials,  // ← add this
}: {
  c: YJLCase;
  discriminator?: Doc<"discriminators"> | null;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
  onAddNote?: () => void;
  pendingNoteCount?: number;
  onNavigateDiscriminator?: (direction: "prev" | "next") => void;
  discriminatorPosition?: { current: number; total: number };
  onEditDifferentials?: () => void;  // ← add this
}) {
```

Then inside the card's top section, add the pencil icon. Find where the card title block ends (the `<div className="shrink-0 pt-1 text-gray-400">` chevron div, around line 513) and add the pencil just before the outer flex-end div:

```tsx
<div className="flex items-start justify-between gap-3">
  <div className="flex-1 min-w-0">
    {/* ... existing badge, title, playlist name ... */}
  </div>
  <div className="shrink-0 flex items-center gap-1.5 pt-1 text-gray-400">
    {onEditDifferentials && (
      <button
        onClick={(e) => { e.stopPropagation(); onEditDifferentials(); }}
        className="p-1 rounded-lg text-slate-300 hover:text-teal-600 hover:bg-teal-50 transition-colors opacity-0 group-hover:opacity-100"
        title="Edit differentials"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    )}
    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </div>
</div>
```

Also add `group` to the outer card `<div>` className so the pencil opacity transition works:

```tsx
<div className={`rounded-xl border ${meta.accentBorder} bg-white overflow-hidden transition-shadow hover:shadow-md flex flex-col group`}>
```

- [ ] **Step 5: Wire the modal in the YJL2B rendering block**

In `DifferentialsPage`, find where `YJLCard` is rendered (around line 1458). Add the `onEditDifferentials` prop:

```tsx
<YJLCard
  c={c}
  discriminator={discriminator}
  discriminatorOpen={openDiscriminatorId === c._id}
  setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null)}
  onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
  onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
  pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
  onNavigateDiscriminator={openDiscriminatorId === c._id ? handleNavigateDiscriminator : undefined}
  discriminatorPosition={openDiscriminatorId === c._id && discriminatorSiblings ? {
    current: discriminatorSiblings.currentIndex + 1,
    total: discriminatorSiblings.siblings.length,
  } : undefined}
  onEditDifferentials={() => setEditDiffTarget(c)}   // ← add this line
/>
```

- [ ] **Step 6: Render the modal at the bottom of `DifferentialsPage` JSX**

Near the other modals (around line 1531 where `CreateYJLCardModal` is rendered), add:

```tsx
{/* Edit Differentials Modal */}
<EditDifferentialsModal
  open={!!editDiffTarget}
  onClose={() => setEditDiffTarget(null)}
  yjlCase={editDiffTarget}
  discriminator={
    editDiffTarget?.discriminatorId
      ? allDiscriminators?.find((d) => d._id === editDiffTarget.discriminatorId)
      : null
  }
/>
```

- [ ] **Step 7: Verify manually**

Navigate to YJL 2B tab. Hover a play card — a pencil icon should appear top-right next to the chevron. Click it — the Edit Differentials modal opens with the current differentials pre-filled. Drag rows to reorder. Click `+` to add a new differential. Click `×` to remove one. Click Save. The card updates immediately (Convex reactivity). Re-open the modal — the new order is shown. Open the image viewer for the card — the folder list reflects the new order.

- [ ] **Step 8: Commit**

```bash
git add src/pages/DifferentialsPage.tsx
git commit -m "feat: add Edit Differentials modal with drag-to-reorder on YJL play cards"
```

---

## Task 5: Make CreateYJLCardModal differentials dynamic

**Files:**
- Modify: `src/pages/DifferentialsPage.tsx` (the `CreateYJLCardModal` function, around line 599)

- [ ] **Step 1: Change `differentials` state to dynamic**

Find (around line 611):
```tsx
const [differentials, setDifferentials] = useState(["", "", ""]);
```

This is already a `string[]` — no type change needed. The `createManual` mutation accepts any length. Only the UI needs updating.

- [ ] **Step 2: Change the reset block to also reset to 3 slots**

The existing reset block (around line 617) already does:
```tsx
setDifferentials(["", "", ""]);
```
No change needed here.

- [ ] **Step 3: Replace the static differentials section with a dynamic one**

Find the entire `<div>` block with label `"Differentials (up to 3)"` (around line 686–708):

```tsx
<div>
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Differentials (up to 3)</label>
  <div className="space-y-2">
    {differentials.map((d, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
          i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : "bg-orange-400"
        }`}>{i + 1}</span>
        <input
          type="text"
          value={d}
          onChange={(e) => {
            const next = [...differentials];
            next[i] = e.target.value;
            setDifferentials(next);
          }}
          placeholder={`Differential #${i + 1}`}
          className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
        />
      </div>
    ))}
  </div>
</div>
```

Replace with:

```tsx
<div>
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Differentials</label>
  <div className="space-y-2">
    {differentials.map((d, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
          i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-blue-400"
        }`}>{i + 1}</span>
        <input
          type="text"
          value={d}
          onChange={(e) => {
            const next = [...differentials];
            next[i] = e.target.value;
            setDifferentials(next);
          }}
          placeholder={`Differential #${i + 1}`}
          className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
        />
        <button
          onClick={() => setDifferentials((prev) => prev.filter((_, idx) => idx !== i))}
          disabled={differentials.length <= 1}
          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-20 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    ))}
  </div>
  <button
    onClick={() => setDifferentials((prev) => [...prev, ""])}
    className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest transition-colors"
  >
    <Plus className="w-3.5 h-3.5" />
    Add Differential
  </button>
</div>
```

- [ ] **Step 4: Verify manually**

Click "Add Card" on the YJL 2B tab. The modal should show 3 differential slots by default. Click "+ Add Differential" — a 4th row appears. Click `×` on a row — it disappears. Try creating a card with 4 differentials — it saves correctly and the card shows all 4.

- [ ] **Step 5: Commit**

```bash
git add src/pages/DifferentialsPage.tsx
git commit -m "feat: make Create Card modal support dynamic differential count"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Bug A (General button reset) — Task 1
- ✅ Bug B (General images invisible in viewer) — Task 2
- ✅ Bug C (edit cell placeholder) — Task 3
- ✅ Add/reorder differentials on existing cards — Task 4
- ✅ Discriminator table sync on save — Task 4, Step 2 of `handleSave`
- ✅ Downstream propagation (viewer folders, import dropdown) — auto via Convex reactivity, noted in Task 4 Step 7
- ✅ Dynamic differentials in Create Card modal — Task 5

**Type consistency:**
- `EditDifferentialsModal` uses `YJLCase` interface (already defined in DifferentialsPage.tsx:57)
- `updateCase` uses `api.yjlCases.update` with `{ id, top3Differentials }` — matches existing mutation signature
- `updateDiscriminator` uses `api.discriminators.update` with `{ id, differentials }` — matches existing mutation signature at `discriminators.ts:89`
- `dragIndex` is a `useRef<number | null>` — consistent throughout the drag handler

**No placeholders:** All code blocks are complete and specific.
