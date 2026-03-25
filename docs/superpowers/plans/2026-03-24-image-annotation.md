# Image Annotation Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SVG arrow+caption annotations to `RapidImageViewer`, persisted in Convex per image ID, toggleable via an "Annotate" mode button.

**Architecture:** A new `ImageAnnotationLayer` SVG overlay component sits inside a shared transform wrapper with the `<img>`. Annotations are stored as percentage coordinates (0–100 in a `viewBox="0 0 100 100"` SVG space) in a new Convex `imageAnnotations` table. The viewer gains an annotate mode toggle that disables panning and enables click-to-place + drag-to-reposition.

**Tech Stack:** React 18, TypeScript, Convex (real-time), Tailwind CSS, lucide-react icons, SVG

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `convex/schema.ts` | Add `imageAnnotations` table definition |
| Create | `convex/imageAnnotations.ts` | `getByImageId` query + `create`/`update`/`remove` mutations |
| Create | `src/components/images/ImageAnnotationLayer.tsx` | Full SVG annotation overlay component |
| Modify | `src/components/images/RapidImageViewer.tsx` | Add annotate mode toggle, DOM refactor, wire up layer |

---

## Task 1: Convex Schema + Backend

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/imageAnnotations.ts`

- [ ] **Step 1.1 — Add `imageAnnotations` table to schema**

In `convex/schema.ts`, add the following table definition after the `studyManifests` block (before `pendingNotes`):

```ts
imageAnnotations: defineTable({
  imageId: v.string(),
  x1: v.number(),
  y1: v.number(),
  x2: v.number(),
  y2: v.number(),
  captionRotation: v.number(),
  text: v.string(),
}).index("by_imageId", ["imageId"]),
```

- [ ] **Step 1.2 — Create `convex/imageAnnotations.ts`**

Create this file with the full content:

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByImageId = query({
  args: { imageId: v.string() },
  handler: async (ctx, { imageId }) => {
    if (!imageId) return [];
    return await ctx.db
      .query("imageAnnotations")
      .withIndex("by_imageId", (q) => q.eq("imageId", imageId))
      .collect();
  },
});

export const create = mutation({
  args: {
    imageId: v.string(),
    x1: v.number(),
    y1: v.number(),
    x2: v.number(),
    y2: v.number(),
    captionRotation: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("imageAnnotations", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("imageAnnotations"),
    x1: v.optional(v.number()),
    y1: v.optional(v.number()),
    x2: v.optional(v.number()),
    y2: v.optional(v.number()),
    captionRotation: v.optional(v.number()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("imageAnnotations") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
```

- [ ] **Step 1.3 — Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors (Convex codegen will update `_generated/api.d.ts` when the dev server is running, but TS should still pass with the existing generated types for now).

- [ ] **Step 1.4 — Commit**

```bash
git add convex/schema.ts convex/imageAnnotations.ts
git commit -m "feat: add imageAnnotations Convex table and CRUD backend"
```

---

## Task 2: ImageAnnotationLayer Component

**Files:**
- Create: `src/components/images/ImageAnnotationLayer.tsx`

This is the full SVG overlay. It handles rendering, interaction, and Convex persistence. Read through the whole task before starting — the state design is important.

- [ ] **Step 2.1 — Create `ImageAnnotationLayer.tsx`**

Create `src/components/images/ImageAnnotationLayer.tsx` with the full content below. Every design decision is documented inline.

```tsx
import { useRef, useState, useEffect, useCallback, MutableRefObject } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Trash2 } from "lucide-react";

interface ImageAnnotationLayerProps {
  imageId: string;
  imageRef: React.RefObject<HTMLImageElement>;
  annotateMode: boolean;
}

type DragType = "head" | "tail" | "rotate" | null;

// Convert a mouse event to SVG percentage coordinates (0-100)
// getBoundingClientRect() on a descendant of a CSS-transformed ancestor returns
// the post-transform viewport rect, so this is correct at all zoom levels.
function toPercent(
  e: MouseEvent,
  imageRef: React.RefObject<HTMLImageElement>
): { x: number; y: number } | null {
  const el = imageRef.current;
  if (!el || el.naturalWidth === 0) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  };
}

// Distance squared between two points (in SVG user units)
function dist2(ax: number, ay: number, bx: number, by: number) {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

// Distance from point (px,py) to line segment (ax,ay)-(bx,by) in SVG user units
function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt(dist2(px, py, ax, ay));
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.sqrt(dist2(px, py, ax + t * dx, ay + t * dy));
}

export function ImageAnnotationLayer({
  imageId,
  imageRef,
  annotateMode,
}: ImageAnnotationLayerProps) {
  const annotations = useQuery(
    api.imageAnnotations.getByImageId,
    imageId ? { imageId } : "skip"
  );
  const createAnnotation = useMutation(api.imageAnnotations.create);
  const updateAnnotation = useMutation(api.imageAnnotations.update);
  const removeAnnotation = useMutation(api.imageAnnotations.remove);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<DragType>(null);

  // Use refs for values needed in event-listener closures to avoid stale captures
  // (React 18 concurrent mode can interrupt renders between listener attachment and fire)
  const editingIdRef = useRef<string | null>(null);
  const editTextRef = useRef<string>("");
  const originalTextRef = useRef<string>("");
  const dragTypeRef = useRef<DragType>(null);
  const draggingIdRef = useRef<string | null>(null);
  // Local optimistic position during drag (avoid Convex roundtrip per mousemove)
  const dragPosRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  // Force re-render during drag to show optimistic position
  const [dragTick, setDragTick] = useState(0);

  // Flush any pending caption edit when imageId changes or on unmount
  useEffect(() => {
    return () => {
      if (
        editingIdRef.current &&
        editTextRef.current !== originalTextRef.current
      ) {
        updateAnnotation({
          id: editingIdRef.current as Id<"imageAnnotations">,
          text: editTextRef.current,
        });
      }
      editingIdRef.current = null;
    };
  }, [imageId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel drag when annotateMode turns off
  useEffect(() => {
    if (!annotateMode) {
      dragTypeRef.current = null;
      draggingIdRef.current = null;
      dragPosRef.current = null;
      setDragType(null);
      setSelectedId(null);
    }
  }, [annotateMode]);

  // Window-level drag handlers (attached during drag so mouse can leave SVG)
  const startDrag = useCallback(
    (
      type: DragType,
      annId: string,
      ann: { x1: number; y1: number; x2: number; y2: number }
    ) => {
      dragTypeRef.current = type;
      draggingIdRef.current = annId;
      dragPosRef.current = { ...ann };
      setDragType(type);

      const onMove = (e: MouseEvent) => {
        const pos = toPercent(e, imageRef);
        if (!pos || !dragPosRef.current || !dragTypeRef.current) return;
        const p = dragPosRef.current;
        if (dragTypeRef.current === "head") {
          dragPosRef.current = { ...p, x1: pos.x, y1: pos.y };
        } else if (dragTypeRef.current === "tail") {
          dragPosRef.current = { ...p, x2: pos.x, y2: pos.y };
        }
        // For rotate: handled separately below via angle calc
        setDragTick((t) => t + 1);
      };

      const onUp = (e: MouseEvent) => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);

        const pos = toPercent(e, imageRef);
        const id = draggingIdRef.current as Id<"imageAnnotations"> | null;
        const dp = dragPosRef.current;
        const dt = dragTypeRef.current;

        dragTypeRef.current = null;
        draggingIdRef.current = null;
        dragPosRef.current = null;
        setDragType(null);

        if (!id || !dp || !dt || !pos) return;

        if (dt === "head") {
          updateAnnotation({ id, x1: dp.x1, y1: dp.y1 });
        } else if (dt === "tail") {
          updateAnnotation({ id, x2: dp.x2, y2: dp.y2 });
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [imageRef, updateAnnotation]
  );

  const startRotateDrag = useCallback(
    (annId: string, captionX: number, captionY: number) => {
      dragTypeRef.current = "rotate";
      draggingIdRef.current = annId;

      const onMove = (e: MouseEvent) => {
        const pos = toPercent(e, imageRef);
        if (!pos) return;
        const angle =
          Math.atan2(pos.y - captionY, pos.x - captionX) * (180 / Math.PI);
        // Store angle in dragPosRef so we can read it in onUp
        dragPosRef.current = { x1: 0, y1: 0, x2: captionX, y2: captionY };
        // Update the annotation optimistically — rotation needs live Convex update
        // since captionRotation isn't in dragPosRef naturally
        updateAnnotation({
          id: annId as Id<"imageAnnotations">,
          captionRotation: angle,
        });
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        dragTypeRef.current = null;
        draggingIdRef.current = null;
        dragPosRef.current = null;
        setDragType(null);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [imageRef, updateAnnotation]
  );

  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!annotateMode || e.button !== 0) return;
      e.stopPropagation();

      const pos = toPercent(e.nativeEvent, imageRef);
      if (!pos) return;

      // 1. Check handles (3 SVG-unit radius hit area)
      const HANDLE_RADIUS = 3;
      const LINE_TOLERANCE = 1.5;

      if (annotations) {
        for (const ann of annotations) {
          // Use live drag position if currently dragging this annotation
          const a =
            draggingIdRef.current === ann._id && dragPosRef.current
              ? dragPosRef.current
              : ann;

          // Arrowhead handle
          if (Math.sqrt(dist2(pos.x, pos.y, a.x1, a.y1)) < HANDLE_RADIUS) {
            setSelectedId(ann._id);
            startDrag("head", ann._id, a);
            return;
          }
          // Tail handle
          if (Math.sqrt(dist2(pos.x, pos.y, a.x2, a.y2)) < HANDLE_RADIUS) {
            setSelectedId(ann._id);
            startDrag("tail", ann._id, a);
            return;
          }
          // Rotation handle (offset from tail: x2-4, y2-8)
          const rotHandleX = a.x2 - 4;
          const rotHandleY = a.y2 - 8;
          if (Math.sqrt(dist2(pos.x, pos.y, rotHandleX, rotHandleY)) < HANDLE_RADIUS) {
            setSelectedId(ann._id);
            startRotateDrag(ann._id, a.x2, a.y2);
            return;
          }

          // 2. Line body hit
          if (
            pointToSegmentDist(pos.x, pos.y, a.x1, a.y1, a.x2, a.y2) <
            LINE_TOLERANCE
          ) {
            setSelectedId(ann._id);
            return;
          }
        }
      }

      // 3. Deselect if clicking empty space while selected
      if (selectedId) {
        setSelectedId(null);
        return;
      }

      // 4. Place new annotation
      const newX1 = pos.x;
      const newY1 = pos.y;
      const newX2 = Math.max(0, pos.x - 10);
      const newY2 = Math.min(100, pos.y + 10);

      createAnnotation({
        imageId,
        x1: newX1,
        y1: newY1,
        x2: newX2,
        y2: newY2,
        captionRotation: 0,
        text: "Finding",
      }).then((newId) => {
        setSelectedId(newId);
        // Auto-open caption for editing
        editingIdRef.current = newId;
        originalTextRef.current = "Finding";
        editTextRef.current = "Finding";
      });
    },
    [
      annotateMode,
      annotations,
      imageId,
      selectedId,
      startDrag,
      startRotateDrag,
      createAnnotation,
    ]
  );

  // Don't render anything until image is loaded
  if (!imageId || imageRef.current?.naturalWidth === 0) return null;
  // Also don't render until query resolves
  if (!annotations) return null;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 30,
        pointerEvents: annotateMode ? "auto" : "none",
        overflow: "visible",
      }}
      onMouseDown={annotateMode ? handleSvgMouseDown : undefined}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
      </defs>

      {annotations.map((ann) => {
        const isSelected = selectedId === ann._id;
        // Use optimistic drag position if currently dragging this annotation
        const pos =
          draggingIdRef.current === ann._id && dragPosRef.current
            ? { ...ann, ...dragPosRef.current }
            : ann;

        const rotHandleX = pos.x2 - 4;
        const rotHandleY = pos.y2 - 8;

        return (
          <g key={ann._id}>
            {/* Arrow line */}
            <line
              x1={pos.x2}
              y1={pos.y2}
              x2={pos.x1}
              y2={pos.y1}
              stroke="#f59e0b"
              strokeWidth="0.6"
              markerEnd="url(#arrowhead)"
            />

            {/* Caption box */}
            <foreignObject
              x={pos.x2}
              y={pos.y2}
              width="20"
              height="6"
              style={{ overflow: "visible" }}
            >
              <div
                style={{
                  transform: `rotate(${ann.captionRotation}deg)`,
                  transformOrigin: "0 0",
                  background: "rgba(0,0,0,0.75)",
                  border: isSelected ? "1px solid #f59e0b" : "1px solid rgba(245,158,11,0.4)",
                  borderRadius: "3px",
                  padding: "1px 4px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "12px",
                  color: "#fef3c7",
                  fontWeight: 600,
                  fontFamily: "system-ui, sans-serif",
                  cursor: annotateMode ? "text" : "default",
                  lineHeight: "1.4",
                  userSelect: "none",
                }}
                onClick={(e) => {
                  if (!annotateMode) return;
                  e.stopPropagation();
                  setSelectedId(ann._id);
                  editingIdRef.current = ann._id;
                  originalTextRef.current = ann.text;
                  editTextRef.current = ann.text;
                  // Re-render to show input
                  setDragTick((t) => t + 1);
                }}
              >
                {editingIdRef.current === ann._id && annotateMode ? (
                  <input
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    defaultValue={ann.text}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fef3c7",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      width: "100%",
                    }}
                    onChange={(e) => {
                      editTextRef.current = e.target.value;
                    }}
                    onBlur={(e) => {
                      const newText = e.target.value.trim() || "Finding";
                      updateAnnotation({
                        id: ann._id as Id<"imageAnnotations">,
                        text: newText,
                      });
                      editingIdRef.current = null;
                      setDragTick((t) => t + 1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                      if (e.key === "Escape") {
                        editingIdRef.current = null;
                        setDragTick((t) => t + 1);
                      }
                      e.stopPropagation(); // Don't let arrow keys navigate the viewer
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  ann.text
                )}
              </div>
            </foreignObject>

            {/* Drag handles — only visible when selected */}
            {isSelected && annotateMode && (
              <>
                {/* Arrowhead handle */}
                <circle
                  cx={pos.x1}
                  cy={pos.y1}
                  r="2"
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth="0.4"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startDrag("head", ann._id, pos);
                  }}
                />
                {/* Tail handle */}
                <circle
                  cx={pos.x2}
                  cy={pos.y2}
                  r="2"
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth="0.4"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startDrag("tail", ann._id, pos);
                  }}
                />
                {/* Rotation handle */}
                <circle
                  cx={rotHandleX}
                  cy={rotHandleY}
                  r="1.5"
                  fill="#818cf8"
                  stroke="#fff"
                  strokeWidth="0.4"
                  style={{ cursor: "crosshair" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startRotateDrag(ann._id, pos.x2, pos.y2);
                  }}
                />
                <line
                  x1={rotHandleX}
                  y1={rotHandleY}
                  x2={pos.x2}
                  y2={pos.y2}
                  stroke="#818cf8"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />

                {/* Trash icon — rendered as a foreignObject button */}
                <foreignObject
                  x={pos.x1 + 2}
                  y={pos.y1 - 6}
                  width="6"
                  height="6"
                >
                  <button
                    style={{
                      background: "rgba(239,68,68,0.9)",
                      border: "none",
                      borderRadius: "2px",
                      color: "white",
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    title="Delete annotation"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation({
                        id: ann._id as Id<"imageAnnotations">,
                      });
                      setSelectedId(null);
                    }}
                  >
                    <Trash2 style={{ width: "10px", height: "10px" }} />
                  </button>
                </foreignObject>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2.2 — Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If there are errors about `api.imageAnnotations` not found, the Convex dev server needs to be running to regenerate `_generated/api.d.ts`. Start it with:

```bash
npx convex dev --once
```

Then re-run `tsc --noEmit`.

- [ ] **Step 2.3 — Commit**

```bash
git add src/components/images/ImageAnnotationLayer.tsx
git commit -m "feat: add ImageAnnotationLayer SVG overlay component"
```

---

## Task 3: Integrate into RapidImageViewer

**Files:**
- Modify: `src/components/images/RapidImageViewer.tsx`

Changes needed:
1. Add `annotateMode` state + pencil button in header
2. Add `imageRef = useRef<HTMLImageElement>(null)`
3. Refactor the image DOM structure: move `overflow-hidden` and transform to a shared wrapper
4. Skip panning when in annotate mode
5. Render `<ImageAnnotationLayer>` inside the wrapper

- [ ] **Step 3.1 — Add imports and state**

At the top of `RapidImageViewer.tsx`:

**Add to the lucide-react import:**
```tsx
import { ..., Pencil } from "lucide-react";
```

**Add below the existing `useRef` imports (around line 137):**
```tsx
const imageRef = useRef<HTMLImageElement>(null);
const [annotateMode, setAnnotateMode] = useState(false);
```

**Add import for the annotation layer** (after the existing imports):
```tsx
import { ImageAnnotationLayer } from "./ImageAnnotationLayer";
```

- [ ] **Step 3.2 — Add annotate mode button to header**

In the header toolbar (around line 501, next to the zoom controls), add the pencil toggle button. Place it between the zoom controls group and the Compare button:

```tsx
{/* Annotate toggle */}
<button
  onClick={() => setAnnotateMode((m) => !m)}
  className={`p-1.5 rounded-lg transition-colors ${
    annotateMode
      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/40"
      : "text-slate-400 hover:text-white"
  }`}
  title={annotateMode ? "Exit annotate mode" : "Annotate image"}
>
  <Pencil className="w-4 h-4" />
</button>
```

Also, reset annotate mode when changing case. In `goNextCase` and `goPrevCase`, add `setAnnotateMode(false)` alongside `setExpanded(false)`.

- [ ] **Step 3.3 — Disable panning in annotate mode**

In `handleMouseDown` (around line 301), wrap the pan logic so it only runs when `annotateMode` is false:

```tsx
const handleMouseDown = (e: React.MouseEvent) => {
  if (e.button === 1) {
    e.preventDefault();
    toggleZoom();
    return;
  }
  // Don't pan in annotate mode — ImageAnnotationLayer owns mouse events
  if (!annotateMode && zoom > 1 && e.button === 0) {
    setIsPanning(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }
};
```

- [ ] **Step 3.4 — Refactor image container DOM structure**

Find the image container div (around line 761):

```tsx
<div className="relative h-full w-full flex items-center justify-center overflow-hidden">
  {currentUrl && !imgError ? (
    <>
      <img
        key={currentUrl}
        src={currentUrl}
        alt={currentImage?.caption || "Study image"}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
        }}
        className="max-h-full max-w-full object-contain select-none will-change-transform"
        draggable={false}
        onError={() => setImgError(true)}
      />
      {/* ...floating overlays... */}
    </>
  ) : ...}
</div>
```

Replace with:

```tsx
<div className="relative h-full w-full flex items-center justify-center">
  {/* overflow-hidden removed from outer div — moved to wrapper below */}
  {currentUrl && !imgError ? (
    <>
      {/* Shared transform wrapper — image and annotation layer move together */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxHeight: '100%',
          maxWidth: '100%',
        }}
        className={annotateMode ? 'ring-2 ring-amber-400/30' : ''}
      >
        <img
          ref={imageRef}
          key={currentUrl}
          src={currentUrl}
          alt={currentImage?.caption || "Study image"}
          className="max-h-full max-w-full object-contain select-none will-change-transform"
          draggable={false}
          onError={() => setImgError(true)}
        />
        {currentImage && (
          <ImageAnnotationLayer
            imageId={currentImage._id}
            imageRef={imageRef}
            annotateMode={annotateMode}
          />
        )}
      </div>
      {/* Floating overlays remain OUTSIDE the transform wrapper */}
      {/* Prominent Floating Caption & Metadata */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20">
        {/* ...keep existing caption content exactly as-is... */}
      </div>
      {/* Floating Footer Attribution & Hints */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none w-full px-10 z-20">
        {/* ...keep existing attribution/hints content exactly as-is... */}
      </div>
    </>
  ) : (
    {/* ...keep existing error state exactly as-is... */}
  )}
</div>
```

> **Note:** Keep all floating overlay content (caption pill, attribution, keyboard hints) exactly as they are — just ensure they stay outside the shared transform wrapper div. The overlay divs at `absolute top-6` and `absolute bottom-6` are positioned relative to the outer container, not the wrapper.

- [ ] **Step 3.5 — Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3.6 — Commit**

```bash
git add src/components/images/RapidImageViewer.tsx
git commit -m "feat: integrate ImageAnnotationLayer into RapidImageViewer with annotate mode toggle"
```

---

## Task 4: Manual Verification Checklist

Run the dev server and open the image viewer:

```bash
npm run dev
```

- [ ] Pencil button appears in viewer header
- [ ] Clicking pencil button glows amber and enables annotate mode
- [ ] In annotate mode, clicking the image places an arrow+caption ("Finding")
- [ ] Caption text is immediately editable; Enter or blur saves it
- [ ] Multiple annotations can be placed on one image
- [ ] Clicking an annotation selects it — three handles appear (amber x2, purple x1)
- [ ] Dragging the arrowhead handle repositions it; releases save to Convex
- [ ] Dragging the tail handle repositions it; releases save to Convex
- [ ] Dragging the rotation handle spins the caption box
- [ ] Red trash button deletes the selected annotation
- [ ] Clicking empty space deselects
- [ ] Toggling annotate mode off hides handles, annotations still visible
- [ ] Outside annotate mode, zoom/pan works exactly as before
- [ ] Navigating to a different case clears annotate mode
- [ ] Reload page — annotations persist (Convex persistence confirmed)
- [ ] Annotations on image A don't appear on image B

---

## Notes for Implementer

- **Convex codegen:** After modifying `convex/schema.ts`, run `npx convex dev --once` to regenerate `convex/_generated/api.d.ts`. Without this, TypeScript will complain about `api.imageAnnotations` not existing.
- **SVG `preserveAspectRatio="none"`:** This stretches the 0-100 coordinate space to match the image exactly regardless of aspect ratio. All percentage-based coordinates will align correctly.
- **`dragTick` state:** This is a simple integer counter used to force a re-render when ref values change (since refs don't trigger renders). It drives the optimistic drag position display.
- **`_id` type casting:** Convex query results have typed IDs. When using mutation args, cast `ann._id` to `Id<"imageAnnotations">`.
