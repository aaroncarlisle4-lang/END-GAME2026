# YJL2B Differential Editing — Design Spec
**Date:** 2026-04-03  
**Status:** Approved

---

## Overview

Three independent deliverables:

1. **Add / reorder differentials on existing YJL play cards** (new feature)
2. **Fix the "General" folder in image import and image viewer** (two bugs)
3. **Fix the broken "Edit this section" button in the discriminator table** (one bug)

A fourth minor improvement is bundled: make the **Create Card modal** support more than 3 differentials.

---

## 1. Add / Reorder Differentials on Existing Play Cards

### Goal

Users need to add a 4th, 5th, or more differential to any existing YJL case and reorder the full list. Changes must propagate to: (a) the play card numbered buttons, (b) the image viewer folder list, (c) the image import dropdown, and (d) the discriminator table columns.

### Data Layer

#### New mutation: `yjlCases.editDifferentials`

```
args: { id: Id<"yjlCases">, top3Differentials: string[] }
```

Patches `top3Differentials` on the case. The field name is historical — it accepts any length array.

#### New mutation: `discriminators.syncDifferentials`

```
args: { id: Id<"discriminators">, orderedNames: string[] }
```

Reconciles `discriminator.differentials` against `orderedNames`:
- **Retained names**: keep all existing field data, update `sortOrder` to new position.
- **New names**: append a blank row (`{ diagnosis: name, sortOrder: i }` — all other fields undefined/empty).
- **Removed names**: drop the row entirely.

Both mutations are called together on save. If a case has no discriminator (`discriminatorId` is undefined), only `editDifferentials` is called.

### UI — `EditDifferentialsModal`

**Trigger:** Pencil icon (`Edit2`) on each `YJLCard`, visible on hover at the top-right corner (same visual layer as the image count badge). Clicking it opens the modal pre-populated with the case's current `top3Differentials`.

**Modal contents:**
- Header: "Edit Differentials — [case title]"
- Draggable list using HTML5 drag-and-drop (no external library). Each row:
  - `⠿` grip handle (left)
  - Numbered badge (auto-updates during drag)
  - Editable text input with the differential name
  - `×` remove button (disabled if only 1 row remains)
- `+ Add Differential` button below the list — appends a blank row, no cap on count
- Info notice (shown only when case has a discriminator): _"Saving updates the discriminator table. Existing cell data is preserved."_
- `Save` button: calls `editDifferentials` then `syncDifferentials` → closes modal
- `Cancel` button: discards all changes

**Drag behaviour:** Standard HTML5 `draggable` + `onDragStart` / `onDragOver` / `onDrop` pattern, same as the thumbnail reorder already in `RapidImageViewer`. A `dragIndex` ref tracks the dragged item; `onDrop` on a target row splices the array.

### Downstream propagation (no extra work needed)

- **Play card buttons**: `YJLCard` already renders `c.top3Differentials` — updating it via Convex reactivity auto-updates the card.
- **Image viewer folders**: `differentialFolders` in `DifferentialsPage.tsx:1596` is built from `[yjlCase.title, ...yjlCase.top3Differentials, "General / Uncategorized"]` — new differentials auto-appear as folders.
- **Import dropdown**: `differentialOptions` in the `ImageDropZone` for YJL cards is `[c.title, ...c.top3Differentials]` — new differentials auto-appear.
- **Discriminator table**: `syncDifferentials` adds/reorders columns; existing `InlineDiscriminators` rendering handles any column count.

### `CreateYJLCardModal` — dynamic differential list

Change the `differentials` state from the fixed `["", "", ""]` to a dynamic `string[]`:
- Start with `["", "", ""]` as before.
- Add `+ Add Differential` button below the list.
- Each row gets a `×` button (disabled when only 1 row remains).
- No backend change needed — `createManual` already handles any length array.

---

## 2. Fix "General" Folder — Two Bugs

### Bug A: General button resets immediately (`ImageDropZone.tsx:52-57`)

**Root cause:** The initialisation `useEffect` has `selectedDifferential` in its dependency array. Clicking "General" sets `selectedDifferential` to `""` (falsy), which triggers the effect, which sees `differentialOptions.length > 0 && !selectedDifferential` as true and immediately resets it to `differentialOptions[0]`.

**Fix:** Remove `selectedDifferential` from the `useEffect` dependency array. The effect must only fire when `differentialOptions` changes (i.e. a different card is shown), not when the user makes a selection.

```ts
// Before
useEffect(() => {
  if (differentialOptions.length > 0 && !selectedDifferential) {
    setSelectedDifferential(differentialOptions[0]);
  }
}, [differentialOptions, selectedDifferential]); // <-- selectedDifferential causes the loop

// After
useEffect(() => {
  if (differentialOptions.length > 0 && !selectedDifferential) {
    setSelectedDifferential(differentialOptions[0]);
  }
}, [differentialOptions]); // eslint-disable-line react-hooks/exhaustive-deps
```

### Bug B: "General" images invisible in the image viewer

**Root cause:** `ImageDropZone.handleStackImport` builds `caseGroup` as `"General - Label [timestamp]"` when no differential is selected. The viewer regex extracts `"General"` as the bucket name. But the viewer's catch-all is called `"General / Uncategorized"` — so imported "General" images land in a separate unnamed bucket instead of the catch-all.

**Fix:** Change the fallback bucket string from `"General"` to `"General / Uncategorized"` in three places in `ImageDropZone.tsx`:
- `handleStackImport`: `const bucket = selectedDifferential || "General / Uncategorized";`
- `handleUrlSubmit`: `const group = selectedDifferential || "General / Uncategorized";`
- `handleDrop` (URL path): `const group = selectedDifferential || "General / Uncategorized";`

---

## 3. Fix "Edit This Section" Button in Discriminator Table

### Root cause

`InlineDiscriminators.tsx:686` contains the literal text `... (unchanged editor code) ...` as a JSX text node — the editing UI template was never written. All supporting logic is present and correct: `handleSave`, `applyFormat`, `fromHTML`, `toHTML`, `editingCell` state, and the `visual-editor` element ID.

### Fix

Replace the placeholder at line 685-687 with the actual editing UI:

```jsx
<div className="flex flex-col gap-3 min-w-[500px]">
  {/* Format toolbar */}
  <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
    <button onClick={() => applyFormat('capitalize')} title="Capitalise selection"
      className="px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
      AA
    </button>
    <button onClick={() => applyFormat('highlight')} title="Highlight selection"
      className="px-2 py-1 rounded-lg text-[10px] font-black text-amber-600 hover:bg-amber-50 transition-all border border-transparent">
      <Highlighter className="w-3 h-3" />
    </button>
    <button onClick={() => applyFormat('underline')} title="Underline selection"
      className="px-2 py-1 rounded-lg text-[10px] font-black text-teal-600 hover:bg-teal-50 transition-all border border-transparent">
      <UnderlineIcon className="w-3 h-3" />
    </button>
  </div>

  {/* ContentEditable editor */}
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
    <button onClick={() => setEditingCell(null)}
      className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 hover:bg-slate-100 transition-all border border-slate-200">
      <RotateCcw className="w-3 h-3 inline mr-1" />Cancel
    </button>
    <button onClick={handleSave}
      className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm">
      <Save className="w-3 h-3 inline mr-1" />Save
    </button>
  </div>
</div>
```

---

## Files Changed

| File | Change |
|------|--------|
| `convex/yjlCases.ts` | Add `editDifferentials` mutation |
| `convex/discriminators.ts` | Add `syncDifferentials` mutation |
| `convex/_generated/api.d.ts` | Auto-regenerated |
| `src/pages/DifferentialsPage.tsx` | Add `EditDifferentialsModal`, edit pencil icon on `YJLCard`, dynamic rows in `CreateYJLCardModal` |
| `src/components/images/ImageDropZone.tsx` | Fix `useEffect` deps, fix General bucket name |
| `src/components/case/InlineDiscriminators.tsx` | Replace placeholder with editing UI |

---

## Out of Scope

- Drag-and-drop reorder of existing *scraped* playlist order (sortOrder field) — that is playlist sequence, not differentials
- Editing the case title from this modal
- Adding discriminator field data for new differentials (done via existing cell-edit UI once the bug is fixed)
