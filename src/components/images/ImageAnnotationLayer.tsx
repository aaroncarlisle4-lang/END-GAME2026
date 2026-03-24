import { useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ImageAnnotationLayerProps {
  imageId: string;
  imageRef: React.RefObject<HTMLImageElement>;
  annotateMode: boolean;
}

type DragType = "head" | "tail" | "rotate" | null;

interface AnnPos {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Convert a mouse event to SVG percentage coordinates (0–100).
// getBoundingClientRect() on a descendant of a CSS-transformed ancestor returns
// the post-transform viewport rect, so this is correct at all zoom levels.
function toPercent(
  e: MouseEvent,
  imageRef: React.RefObject<HTMLImageElement>
): { x: number; y: number } | null {
  const el = imageRef.current;
  if (!el || el.naturalWidth === 0) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  };
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, ax, ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return dist(px, py, ax + t * dx, ay + t * dy);
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
  // dragTick forces re-render when ref values (optimistic drag pos) change
  const [dragTick, setDragTick] = useState(0);

  // Refs for window-level drag closures (stale-closure-safe)
  const dragTypeRef = useRef<DragType>(null);
  const draggingIdRef = useRef<string | null>(null);
  const resizingIdRef = useRef<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(16);
  const [resizeWidths, setResizeWidths] = useState<Record<string, number>>({});
  const dragPosRef = useRef<AnnPos | null>(null);

  const startDrag = useCallback(
    (type: "head" | "tail", annId: string, ann: AnnPos) => {
      dragTypeRef.current = type;
      draggingIdRef.current = annId;
      dragPosRef.current = { ...ann };
      setDragType(type);

      const onMove = (e: MouseEvent) => {
        const pos = toPercent(e, imageRef);
        if (!pos || !dragPosRef.current) return;
        if (dragTypeRef.current === "head") {
          dragPosRef.current = { ...dragPosRef.current, x1: pos.x, y1: pos.y };
        } else if (dragTypeRef.current === "tail") {
          dragPosRef.current = { ...dragPosRef.current, x2: pos.x, y2: pos.y };
        }
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

        if (!id || !dp || !dt) return;
        if (dt === "head" && pos) {
          updateAnnotation({ id, x1: pos.x, y1: pos.y });
        } else if (dt === "tail" && pos) {
          updateAnnotation({ id, x2: pos.x, y2: pos.y });
        }
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

      const HANDLE_RADIUS = 3;
      const LINE_TOLERANCE = 1.5;

      if (annotations) {
        for (const ann of annotations) {
          const a =
            draggingIdRef.current === ann._id && dragPosRef.current
              ? { ...ann, ...dragPosRef.current }
              : ann;

          // Arrowhead handle
          if (dist(pos.x, pos.y, a.x1, a.y1) < HANDLE_RADIUS) {
            setSelectedId(ann._id);
            startDrag("head", ann._id, a);
            return;
          }
          // Tail handle
          if (dist(pos.x, pos.y, a.x2, a.y2) < HANDLE_RADIUS) {
            setSelectedId(ann._id);
            startDrag("tail", ann._id, a);
            return;
          }
          // Line body
          if (pointToSegmentDist(pos.x, pos.y, a.x1, a.y1, a.x2, a.y2) < LINE_TOLERANCE) {
            setSelectedId(ann._id);
            return;
          }
        }
      }

      // Click on empty space — deselect if something selected, otherwise place new
      if (selectedId) {
        setSelectedId(null);
        return;
      }

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
      });
    },
    [
      annotateMode,
      annotations,
      imageId,
      selectedId,
      startDrag,
      createAnnotation,
      imageRef,
    ]
  );

  // Don't render if image not loaded yet or no imageId
  if (!imageId) return null;
  if (imageRef.current && imageRef.current.naturalWidth === 0) return null;
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
        cursor: annotateMode ? "crosshair" : "default",
      }}
      onMouseDown={annotateMode ? handleSvgMouseDown : undefined}
    >
      <defs>
        <marker
          id="ann-arrowhead"
          markerWidth="4"
          markerHeight="4"
          refX="3.5"
          refY="2"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L4,2 L0,4 Z" fill="#f59e0b" />
        </marker>
      </defs>

      {annotations.map((ann) => {
        const isSelected = selectedId === ann._id;
        const pos =
          draggingIdRef.current === ann._id && dragPosRef.current
            ? { ...ann, ...dragPosRef.current }
            : ann;

        const captionFlipped = ann.captionRotation === 1;
        const captionW = resizeWidths[ann._id] ?? ann.captionWidth ?? 16;

        return (
          <g key={ann._id}>
            {/* Arrow line: tail → head */}
            <line
              x1={pos.x2}
              y1={pos.y2}
              x2={pos.x1}
              y2={pos.y1}
              stroke="#f59e0b"
              strokeWidth="0.35"
              markerEnd="url(#ann-arrowhead)"
            />

            {/* Caption — foreignObject for text/input only */}
            <foreignObject
              x={captionFlipped ? pos.x2 - captionW - 1 : pos.x2 + 1}
              y={pos.y2 - 2}
              width={captionW}
              height="20"
              style={{ overflow: "visible", pointerEvents: "all" }}
            >
              {annotateMode ? (
                <textarea
                  key={ann._id}
                  defaultValue={ann.text}
                  rows={1}
                  style={{
                    background: "rgba(0,0,0,0.80)",
                    border: `1px solid ${isSelected ? "#f59e0b" : "rgba(245,158,11,0.4)"}`,
                    borderRadius: "2px",
                    padding: "1px 2px",
                    color: "#fef3c7",
                    fontSize: "6px",
                    fontWeight: 600,
                    fontFamily: "system-ui, sans-serif",
                    outline: "none",
                    width: "100%",
                    resize: "none",
                    overflow: "hidden",
                    display: "block",
                    cursor: "text",
                    boxSizing: "border-box",
                    lineHeight: "1.3",
                  }}
                  onInput={(e) => {
                    const el = e.target as HTMLTextAreaElement;
                    el.style.height = "auto";
                    el.style.height = el.scrollHeight + "px";
                  }}
                  onBlur={(e) => {
                    const newText = e.target.value.trim() || "Finding";
                    if (newText !== ann.text) {
                      updateAnnotation({ id: ann._id as Id<"imageAnnotations">, text: newText });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div style={{
                  background: "rgba(0,0,0,0.80)",
                  border: "1px solid rgba(245,158,11,0.4)",
                  borderRadius: "2px",
                  padding: "1px 2px",
                  color: "#fef3c7",
                  fontSize: "6px",
                  fontWeight: 600,
                  fontFamily: "system-ui, sans-serif",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {ann.text}
                </div>
              )}
            </foreignObject>

            {/* Resize grip — drag right edge to change caption width */}
            {annotateMode && (() => {
              const gripX = captionFlipped ? pos.x2 - captionW - 1 : pos.x2 + 1 + captionW;
              const gripY = pos.y2 - 2;
              return (
                <rect
                  x={gripX - 1}
                  y={gripY}
                  width="2"
                  height="4"
                  rx="0.5"
                  fill="rgba(100,116,139,0.8)"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    resizingIdRef.current = ann._id;
                    resizeStartXRef.current = e.clientX;
                    resizeStartWidthRef.current = captionW;
                    const imgEl = imageRef.current;
                    const onMove = (ev: MouseEvent) => {
                      if (!imgEl) return;
                      const rect = imgEl.getBoundingClientRect();
                      const dxPx = ev.clientX - resizeStartXRef.current;
                      const dxPct = (dxPx / rect.width) * 100;
                      const newW = Math.max(8, resizeStartWidthRef.current + (captionFlipped ? -dxPct : dxPct));
                      setResizeWidths(prev => ({ ...prev, [ann._id]: newW }));
                    };
                    const onUp = () => {
                      window.removeEventListener("mousemove", onMove);
                      window.removeEventListener("mouseup", onUp);
                      const finalW = resizeWidths[ann._id] ?? captionW;
                      updateAnnotation({ id: ann._id as Id<"imageAnnotations">, captionWidth: finalW });
                      resizingIdRef.current = null;
                    };
                    window.addEventListener("mousemove", onMove);
                    window.addEventListener("mouseup", onUp);
                  }}
                />
              );
            })()}

            {/* SVG-native buttons */}
            {annotateMode && (() => {
              const btnY = pos.y2 - 2;
              const flipX = captionFlipped ? pos.x2 - captionW - 7 : pos.x2 + captionW + 3;
              const delX = captionFlipped ? pos.x2 - captionW - 12 : pos.x2 + captionW + 7.5;
              return (
                <>
                  {/* Flip button ↔ */}
                  <g
                    style={{ cursor: "pointer" }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      updateAnnotation({ id: ann._id as Id<"imageAnnotations">, captionRotation: captionFlipped ? 0 : 1 });
                    }}
                  >
                    <rect x={flipX} y={btnY} width="4" height="4" rx="0.5" fill="rgba(71,85,105,0.9)" />
                    <text x={flipX + 2} y={btnY + 3} textAnchor="middle" fontSize="3.5" fill="#94a3b8" style={{ userSelect: "none", pointerEvents: "none" }}>↔</text>
                  </g>
                  {/* Delete button × */}
                  <g
                    style={{ cursor: "pointer" }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      removeAnnotation({ id: ann._id as Id<"imageAnnotations"> });
                      setSelectedId(null);
                    }}
                  >
                    <rect x={delX} y={btnY} width="4" height="4" rx="0.5" fill="rgba(239,68,68,0.9)" />
                    <text x={delX + 2} y={btnY + 3} textAnchor="middle" fontSize="4" fill="white" style={{ userSelect: "none", pointerEvents: "none" }}>×</text>
                  </g>
                </>
              );
            })()}

            {/* Drag handles — shown when selected */}
            {isSelected && annotateMode && (
              <>
                <circle cx={pos.x1} cy={pos.y1} r="2" fill="#f59e0b" stroke="white" strokeWidth="0.5" style={{ cursor: "move" }}
                  onMouseDown={(e) => { e.stopPropagation(); startDrag("head", ann._id, pos); }} />
                <circle cx={pos.x2} cy={pos.y2} r="2" fill="#f59e0b" stroke="white" strokeWidth="0.5" style={{ cursor: "move" }}
                  onMouseDown={(e) => { e.stopPropagation(); startDrag("tail", ann._id, pos); }} />
              </>
            )}
          </g>
        );
      })}

      {/* Suppress unused var warning for dragTick — it's used to force re-renders */}
      {dragTick > 0 && null}
      {dragType && null}
    </svg>
  );
}
