import { useRef, useState, useEffect, useCallback } from "react";
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

  // Refs for values needed inside window-level drag closures (stale-closure-safe)
  const editingIdRef = useRef<string | null>(null);
  const editTextRef = useRef<string>("");
  const originalTextRef = useRef<string>("");
  const dragTypeRef = useRef<DragType>(null);
  const draggingIdRef = useRef<string | null>(null);
  const dragPosRef = useRef<AnnPos | null>(null);
  // Track editing state for render (separate from ref so caption input shows)
  const [editingId, setEditingId] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId]);

  // Cancel any in-progress drag when annotateMode turns off
  useEffect(() => {
    if (!annotateMode) {
      dragTypeRef.current = null;
      draggingIdRef.current = null;
      dragPosRef.current = null;
      setDragType(null);
      setSelectedId(null);
      setEditingId(null);
      editingIdRef.current = null;
    }
  }, [annotateMode]);

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

  const startRotateDrag = useCallback(
    (annId: string, captionX: number, captionY: number) => {
      dragTypeRef.current = "rotate";
      draggingIdRef.current = annId;
      setDragType("rotate");

      const onMove = (e: MouseEvent) => {
        const pos = toPercent(e, imageRef);
        if (!pos) return;
        const angle =
          Math.atan2(pos.y - captionY, pos.x - captionX) * (180 / Math.PI);
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
          // Rotation handle
          if (dist(pos.x, pos.y, a.x2 - 3, a.y2 - 6) < HANDLE_RADIUS) {
            setSelectedId(ann._id);
            startRotateDrag(ann._id, a.x2, a.y2);
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
        setEditingId(newId);
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
        const isEditing = editingId === ann._id;
        const pos =
          draggingIdRef.current === ann._id && dragPosRef.current
            ? { ...ann, ...dragPosRef.current }
            : ann;

        const rotHandleX = pos.x2 - 3;
        const rotHandleY = pos.y2 - 6;

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

            {/* Caption box */}
            <foreignObject
              x={pos.x2}
              y={pos.y2}
              width="20"
              height="5"
              style={{ overflow: "visible" }}
            >
              <div
                style={{
                  transform: `rotate(${ann.captionRotation}deg)`,
                  transformOrigin: "0 0",
                  background: "rgba(0,0,0,0.80)",
                  border: isSelected
                    ? "1px solid #f59e0b"
                    : "1px solid rgba(245,158,11,0.35)",
                  borderRadius: "2px",
                  padding: "0px 3px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: isEditing ? "clip" : "ellipsis",
                  fontSize: "9px",
                  color: "#fef3c7",
                  fontWeight: 600,
                  fontFamily: "system-ui, sans-serif",
                  lineHeight: "1.4",
                  userSelect: "none",
                  cursor: annotateMode ? "text" : "default",
                  minWidth: "40px",
                  maxWidth: "150px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
                onClick={(e) => {
                  if (!annotateMode) return;
                  e.stopPropagation();
                  setSelectedId(ann._id);
                  setEditingId(ann._id);
                  editingIdRef.current = ann._id;
                  originalTextRef.current = ann.text;
                  editTextRef.current = ann.text;
                }}
              >
                {isEditing && annotateMode ? (
                  <input
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    defaultValue={ann.text}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fef3c7",
                      fontSize: "9px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      width: "80px",
                      padding: 0,
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
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                      if (e.key === "Escape") {
                        editingIdRef.current = null;
                        setEditingId(null);
                      }
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  ann.text
                )}
                {/* Delete button inline beside caption text — only when selected */}
                {isSelected && annotateMode && (
                  <button
                    style={{
                      background: "rgba(239,68,68,0.85)",
                      border: "none",
                      borderRadius: "2px",
                      color: "white",
                      cursor: "pointer",
                      padding: "0 2px",
                      lineHeight: 1,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
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
                    <Trash2 style={{ width: "7px", height: "7px" }} />
                  </button>
                )}
              </div>
            </foreignObject>

            {/* Drag handles + delete — only when selected in annotate mode */}
            {isSelected && annotateMode && (
              <>
                {/* Arrowhead handle */}
                <circle
                  cx={pos.x1}
                  cy={pos.y1}
                  r="2"
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth="0.5"
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
                  stroke="white"
                  strokeWidth="0.5"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startDrag("tail", ann._id, pos);
                  }}
                />
                {/* Rotation handle */}
                <line
                  x1={rotHandleX}
                  y1={rotHandleY}
                  x2={pos.x2}
                  y2={pos.y2}
                  stroke="#818cf8"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />
                <circle
                  cx={rotHandleX}
                  cy={rotHandleY}
                  r="1.5"
                  fill="#818cf8"
                  stroke="white"
                  strokeWidth="0.4"
                  style={{ cursor: "crosshair" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startRotateDrag(ann._id, pos.x2, pos.y2);
                  }}
                />

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
