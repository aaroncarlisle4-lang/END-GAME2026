# Image Annotation Feature Design

**Date:** 2026-03-24
**Status:** Approved

## Overview

Add an annotation layer to `RapidImageViewer` that lets users place arrow+caption units on radiology images. Annotations are persisted to Convex per image ID, visible in a dedicated "Annotate" mode, and fully editable and deletable.

## Data Model

New Convex table: `imageAnnotations`

| Field | Type | Description |
|---|---|---|
| `imageId` | `string` | The `_id` of the `studyImages` document |
| `x1` | `number` | Arrowhead X position as % of rendered image width (0–100) |
| `y1` | `number` | Arrowhead Y position as % of rendered image height (0–100) |
| `x2` | `number` | Tail/caption-anchor X position (0–100) |
| `y2` | `number` | Tail/caption-anchor Y position (0–100) |
| `captionRotation` | `number` | Rotation of caption box in degrees. Default: `0`. |
| `text` | `string` | Caption label text. Default: `"Finding"`. |

**Ownership:** Annotations are currently **global/shared** — all users see and can edit/delete all annotations on a given image. Per-user isolation is deferred to a future iteration.

Schema addition in `convex/schema.ts`.

Convex backend file: `convex/imageAnnotations.ts`
- `getByImageId(imageId)` — query, returns all annotations for an image
- `create(imageId, x1, y1, x2, y2, captionRotation, text)` — mutation
- `update(id, fields)` — mutation, partial update of any fields
- `remove(id)` — mutation

## SVG Overlay & Coordinate System

### DOM structure

The current outer image container is:
```
<div className="relative h-full w-full flex items-center justify-center overflow-hidden">
  <img style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} />
</div>
```

This becomes:
```
<div className="relative h-full w-full flex items-center justify-center">
  {/* overflow-hidden removed from outer div */}
  <div
    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
    className="relative overflow-hidden"
  >
    {/* shared transform wrapper — clips zoomed/panned content */}
    <img ref={imageRef} className="max-h-full max-w-full object-contain select-none" />
    <ImageAnnotationLayer ... />  {/* SVG overlay, see below */}
  </div>
  {/* floating overlays (caption pill, attribution, hints) stay OUTSIDE the wrapper */}
</div>
```

### SVG coordinate system

The `<svg>` inside `ImageAnnotationLayer` is positioned to exactly overlay the `<img>`:

```tsx
<svg
  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>
```

All coordinates — `x1`, `y1`, `x2`, `y2`, handle positions — are in **SVG user units which equal percentage values (0–100)** because the viewBox is `0 0 100 100`. No unit conversion is needed when reading from or writing to the Convex document.

### Hit-test coordinate conversion

On any mouse event, convert to SVG/percentage coordinates as follows:

```ts
function toPercent(e: MouseEvent): { x: number; y: number } {
  const rect = imageRef.current!.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  };
}
```

`getBoundingClientRect()` on a descendant of a CSS-transformed ancestor returns viewport coordinates that already account for the ancestor's transform (including `scale(zoom)` and `translate(pan.x, pan.y)` on the wrapper). Therefore `rect.left/top/width/height` are the actual on-screen pixel positions of the image, and the resulting percentages are correct at all zoom levels. No de-zoom correction is needed.

**Guard:** If `imageRef.current.naturalWidth === 0` (image not yet loaded), all click/drag interactions are ignored AND the SVG renders nothing (no stale annotation flash when switching images).

### Rotation handle position

The rotation handle is a circle at SVG coordinates `(x2 - 4, y2 - 8)` (i.e., offset in SVG user units / percentage space, not screen pixels). This positions it slightly above and left of the caption anchor, visible at all caption rotations, and is always in the same SVG user-unit space as all other coordinates.

### Auto-offset for new annotations

The tail is offset from the arrowhead by **10 SVG units left and 10 SVG units down** (i.e., `x2 = x1 - 10`, `y2 = y1 + 10`). These are percentage-space values — no pixel conversion required.

### foreignObject sizing

Each caption box uses:
```tsx
<foreignObject x={x2} y={y2} width="20" height="6">
  {/* 20×6 SVG units ≈ reasonable caption size in a 0-100 viewBox */}
  <div style={{ transform: `rotate(${captionRotation}deg)`, transformOrigin: '0 0' }}>
    ...
  </div>
</foreignObject>
```

Width `20` and height `6` in SVG user units (= 20% and 6% of image dimensions) gives a proportional caption box. The inner `<div>` clips overflow with `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`.

### z-index

The annotation SVG is at **z-index 30** (above the existing floating overlays at z-20 and navigation arrows at z-10).

## Annotate Mode & Interaction

### Mode toggle
A pencil icon button in the header toolbar toggles `annotateMode`. When active: button glows teal, a teal border ring appears around the image area.

**Panning in annotate mode:** When `annotateMode` is on, left-click drag no longer pans even when `zoom > 1`. Annotate mode takes full ownership of mouse events. Middle-click zoom toggle remains available in both modes.

### Drag handling — attach to `window`

During any annotation drag, `ImageAnnotationLayer` attaches `mousemove` and `mouseup` to **`window`**. This ensures the drag continues if the mouse exits the SVG or image area. Listeners are removed on `mouseup` or when `annotateMode` becomes `false`.

### In annotate mode

| Action | Result |
|---|---|
| Click empty space | Hit-tested in order: (1) drag handles (3-unit radius in SVG space), (2) line body (1-unit tolerance), (3) else place new annotation. New: arrowhead at click, tail at `x1-10, y1+10`. Caption defaults to `"Finding"`, `captionRotation=0`. Immediately enters inline edit. |
| Click existing annotation | Select it — shows three drag handles. |
| Drag arrowhead handle | Reposition x1/y1. Calls `update` on mouseup. |
| Drag tail handle | Reposition x2/y2. Calls `update` on mouseup. |
| Drag rotation handle | Compute angle from handle drag delta to caption-box centre `(x2, y2)`. Update `captionRotation`. Calls `update` on mouseup. |
| Click caption text | Inline edit via `<input>` inside `<foreignObject>`. Saves via `update` on blur or Enter. |
| Trash icon on selected annotation | Delete via `remove` mutation. |
| Click empty space (selection active) | Deselect. |

### Edge cases

**annotateMode toggled off mid-drag:** Drag is cancelled. No `update` call is made. Annotation stays at last Convex-saved position. `window` listeners are removed.

**Pending caption edit on imageId change / unmount:** `editingId`, `editText`, and `originalText` (the text at the time the edit began) are stored in **`useRef`** (not `useState`) so that the `useEffect` cleanup closure always reads their current values in React 18 concurrent mode:

```ts
const editingIdRef = useRef<string | null>(null);
const editTextRef = useRef<string>('');
const originalTextRef = useRef<string>('');

useEffect(() => {
  return () => {
    if (editingIdRef.current && editTextRef.current !== originalTextRef.current) {
      update({ id: editingIdRef.current, text: editTextRef.current });
    }
  };
}, [imageId]);
```

### Outside annotate mode
Annotations are rendered but non-interactive (`pointer-events: none` on SVG). Zoom/pan works exactly as before.

## Component Architecture

### New file: `src/components/images/ImageAnnotationLayer.tsx`

**Props:**
```ts
interface ImageAnnotationLayerProps {
  imageId: string;
  imageRef: RefObject<HTMLImageElement>;
  annotateMode: boolean;
}
```

**Internal state and refs:**
```ts
// React state (triggers re-render)
selectedId: string | null
dragType: 'head' | 'tail' | 'rotate' | null

// Refs (for stable closure capture and non-render values)
editingIdRef: MutableRefObject<string | null>
editTextRef: MutableRefObject<string>
originalTextRef: MutableRefObject<string>
dragOffsetRef: MutableRefObject<{ dx: number; dy: number }>
```

**Responsibilities:**
- `useQuery(api.imageAnnotations.getByImageId, { imageId })` — live annotations
- Convex mutations: create, update, remove
- SVG rendering: `viewBox="0 0 100 100"`, arrowhead marker def, lines, foreignObject caption boxes, drag handles when selected
- Drag: attaches `mousemove`/`mouseup` to `window` on drag start; removes on mouseup or annotateMode=false
- Coordinate conversion via `toPercent()` using `imageRef.getBoundingClientRect()`
- `useEffect` cleanup to flush pending caption edits on `imageId` change / unmount (using refs)

### Changes to `RapidImageViewer.tsx`
- Add `annotateMode: boolean` state + pencil icon button in header (teal when active)
- Refactor image container: remove `overflow-hidden` from outer div; add shared transform wrapper with `overflow-hidden` and the zoom/pan transform; remove transform from `<img>`
- Add `imageRef = useRef<HTMLImageElement>(null)` and attach to `<img>`
- Pass `imageRef`, `imageId` (= `currentImage?._id ?? ''`), and `annotateMode` to `<ImageAnnotationLayer>`
- When `annotateMode` is true, skip `isPanning = true` in `handleMouseDown`

### New file: `convex/imageAnnotations.ts`
- Query: `getByImageId`
- Mutations: `create`, `update`, `remove`

### Modified: `convex/schema.ts`
- Add `imageAnnotations` table definition

## Out of Scope (not in this iteration)
- Per-user annotation ownership / visibility
- Annotations on rapid-mode thumbnail view (annotations only visible in full viewer)
- Annotation export / screenshot
- Undo/redo
