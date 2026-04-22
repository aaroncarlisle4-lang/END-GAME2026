# Image Viewer Enhancements — Design Spec
Date: 2026-04-22

## Scope

Ten changes to RapidImageViewer, DifferentialsPage, InlineDiscriminators, and Convex backend.
Grouped into: Bug Fixes, Drag & Drop, Findings Everywhere, Favourites, Caption Polish.

---

## Bug Fixes

### F1 — Add Note Button Broken

**Root cause:** `onAddNote` closure captures `activeFullDiscriminator` which is `null` unless the discriminator panel is already expanded. `setNoteTarget(null)` silently no-ops.

**Fix:**
- Change `noteTarget` state from `Doc<"discriminators"> | null` to `Id<"discriminators"> | null`
- Update `AddNoteModal` props: replace `discriminator: Doc<"discriminators">` with `discriminatorId: Id<"discriminators">`, fetch data internally via `useQuery(api.discriminators.get, { id: discriminatorId })`
- All `onAddNote` callbacks become: `() => setNoteTarget(lookup._id)` — no dependency on `activeFullDiscriminator`
- Applies to all card types (PatternCard, MnemonicCard, ChapmanCard, YJLCard) and image viewer

### F2 — Import Goes to Wrong Folder

**Root cause:** `caseGroup` format is `"BucketName - Label [timestamp]"`. Lazy regex `(.+?)\s*-\s*` cuts off at the first ` - `, so differential names containing ` - ` (e.g. "T-cell Lymphoma") produce a truncated bucket name, creating orphan subfolders.

**Fix:**
- New `caseGroup` format: `[BucketName] Label [timestamp]` (bracket-delimited bucket name)
- New primary regex: `/^\[(.+?)\]/` — unambiguous extraction
- Keep old regex as fallback for backward-compatible reads
- Update import handler in `RapidImageViewer.tsx` to use new format
- **Migration:** Convex action `studyImages.fixOrphanedImports` — scans all images where old-format extraction produces a bucket name not present in `differentialFolders` for that source; re-parents them to the correct bucket by updating `caseGroup`

---

## Drag & Drop

**Library:** Install `@dnd-kit/core` + `@dnd-kit/sortable`. Use `SortableContext` + `useSortable` for all three surfaces. Chosen over HTML5 native because: smooth visual placeholder, touch support, no external state hacks, reusable across three independent sortable lists.

### D1 — Folder Order (Left Navigation)

- Wrap bucket list in `DndContext` + `SortableContext` in `RapidImageViewer`
- Each bucket button becomes a `SortableItem` with drag handle (GripVertical icon, appears on hover)
- On `onDragEnd`: reorder local `bucketOrder` state (array of bucket names), persist via `api.viewerPreferences.setFolderOrder({ sourceType, sourceId, folderOrder })` mutation
- On viewer open: fetch `api.viewerPreferences.get({ sourceType, sourceId })`, apply `folderOrder` to reorder buckets before rendering
- `viewerPreferences` table (new): `{ sourceType, sourceId, folderOrder?: string[], columnOrder?: string[] }`, index `by_source (sourceType, sourceId)`

### D2 — Image Set Order (Thumbnail Strip)

- Wrap thumbnail list in its own `DndContext` + `SortableContext`
- Each thumbnail button is a `SortableItem`
- On `onDragEnd`: reorder clusters in local state immediately (optimistic), then call `api.studyImages.reorderClusters({ sourceType, sourceId, bucketName, clusterOrder: string[] })` — mutation updates `sortOrder` on each image/manifest record
- New mutation `studyImages.reorderClusters` accepts ordered array of `caseGroup` strings and assigns new sequential `sortOrder` values

### D3 — Discriminant Table Column Order (Per-Case)

- In `InlineDiscriminators.tsx`: add `columnOrder?: string[]` prop (the ordered list of differential indices/diagnoses)
- Wrap column headers in `DndContext` + `SortableContext`
- On `onDragEnd`: emit `onColumnReorder(newOrder: string[])` callback to parent
- `DifferentialsPage` on `onColumnReorder`: call `api.viewerPreferences.setColumnOrder({ sourceType: "yjlCase", sourceId: yjlCaseId, columnOrder })` and update local `columnOrderMap` state
- On YJLCard expand: load `viewerPreferences` for that case; pass stored `columnOrder` into `InlineDiscriminators`

---

## Findings Everywhere

### E1 — Findings Box in All Folders

**Schema change:** `viewerFindings` table — add `bucketName: v.string()` field (empty string = title/primary bucket). Change index from `by_source` to `by_source_bucket (sourceType, sourceId, bucketName)`. Existing records receive `bucketName: ""` via migration.

**Backend:** Update `viewerFindings.save` mutation to accept `bucketName`; update `viewerFindings.get` query to accept `bucketName`; add `viewerFindings.getAll` query returning all bucket findings for a source.

**Frontend:** 
- Remove guard `{activeBucketIndex === 0 && (` — render Findings box for all buckets
- In `DifferentialsPage`: switch from single `viewerFindings` query to `viewerFindings.getAll`, cache as `findingsMap: Map<bucketName, string>`
- Pass `findings={findingsMap.get(activeBucketName) ?? ""}` and `onSaveFindings={(text) => saveFinding({ ..., bucketName: activeBucketName })}` into viewer

### E2 — Import Panel Always Visible

- Remove `{cases.length > 0 && (` guard on the thumbnail sidebar
- Sidebar always renders with folder caption + import button
- When folder is empty: show "No images yet" placeholder below the import button, styled with `ImageOff` icon + subtitle text

### E3 — Findings Field in Import Form

- Add `importFindings` state + textarea input ("Findings" label, above URL textarea)
- On import: if `importFindings` is non-empty, call `api.viewerFindings.save({ sourceType, sourceId, bucketName: activeBucket.name, text: importFindings })` immediately after image batch upload
- Clear `importFindings` after successful import

---

## Favourites

### V1 — Heart Icon → Favourites → High Yield Tab

**New Convex table `userFavourites`:**
```
{ sourceType: string, sourceId: string, categoryName: string, title: string }
index by_source (sourceType, sourceId)
index by_category (sourceType, categoryName)
```

**Mutations/queries:**
- `userFavourites.toggle({ sourceType, sourceId, categoryName, title })` — creates or deletes
- `userFavourites.isFavourited({ sourceType, sourceId })` — returns boolean
- `userFavourites.listByCategory()` — returns all favourites grouped

**Heart icon placement:**
1. YJLCard footer — between image count badge and Add Note button
2. InlineDiscriminators table header — top-right corner of the expanded panel
3. RapidImageViewer toolbar — next to the existing zoom/annotate buttons

**Heart behaviour:** Outline (unfavourited) ↔ Solid rose/filled (favourited). Optimistic update in local state, confirmed by Convex.

**High Yield tab integration:**
- Add a "Favourited Cases" section at the top of the High Yield tab (above existing category groups)
- Groups favourites by `categoryName`, same layout as existing high-yield clusters
- Card style: same as YJLCard with a rose `♥ Favourited` badge replacing the teal cluster badge
- Clicking view images or discriminator works identically to the YJL2B tab

---

## Caption Polish

### C1 — Larger Attribution Text

- Find attribution/credit rendering in `RapidImageViewer.tsx` (the bottom overlay text)
- Increase from `text-[8px]` / `text-[9px]` to `text-xs` (12px) for the attribution line
- Increase caption label from `text-[9px]` to `text-[10px]`
- Keep same position and background

---

## Implementation Order

1. Schema changes (viewerFindings migration, viewerPreferences new table, userFavourites new table)
2. F1 Add Note fix (self-contained, low risk)
3. F2 Import format fix + migration action
4. C1 Caption polish (trivial)
5. E2 Import sidebar always visible
6. E1 Findings per bucket (depends on schema)
7. E3 Import findings field (depends on E1)
8. D2 Thumbnail reorder (depends on schema)
9. D1 Folder reorder (depends on schema)
10. D3 Column reorder (depends on schema)
11. V1 Favourites (depends on schema, touches most files)

---

## Files Affected

| File | Changes |
|------|---------|
| `convex/schema.ts` | Add viewerPreferences, userFavourites; update viewerFindings |
| `convex/viewerFindings.ts` | Add bucketName param, getAll query |
| `convex/viewerPreferences.ts` | New file |
| `convex/userFavourites.ts` | New file |
| `convex/studyImages.ts` | Add reorderClusters mutation, fixOrphanedImports action |
| `src/components/images/RapidImageViewer.tsx` | D1, D2, E1, E2, E3, C1, F2 format fix |
| `src/components/case/InlineDiscriminators.tsx` | D3 column drag |
| `src/components/text/AddNoteModal.tsx` | F1 — accept ID, fetch internally |
| `src/pages/DifferentialsPage.tsx` | F1 noteTarget type, V1 heart + favourites section, E1 findings map |
