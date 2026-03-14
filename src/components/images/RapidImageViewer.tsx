import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Play,
  Pause,
  Layers,
  Trash2,
  Loader2,
  ImageOff,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface StudyImage {
  _id: Id<"studyImages">;
  url?: string;
  caption?: string;
  caseGroup?: string;
  attribution?: string;
}

interface RapidImageViewerProps {
  open: boolean;
  onClose: () => void;
  images: StudyImage[];
  isLoading?: boolean;
  initialIndex?: number;
  title: string;
}

interface CaseCluster {
  label: string;
  images: StudyImage[];
  caseGroup?: string;
}

export function RapidImageViewer({
  open,
  onClose,
  images,
  isLoading = false,
  initialIndex = 0,
  title,
}: RapidImageViewerProps) {
  const deleteImage = useMutation(api.studyImages.deleteImage);
  const deleteStack = useMutation(api.studyImages.deleteStack);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dragOverCenter, setDragOverCenter] = useState(false);

  // Group images into cases
  const cases = useMemo<CaseCluster[]>(() => {
    const grouped = new Map<string, StudyImage[]>();
    const standalone: StudyImage[] = [];

    for (const img of images) {
      if (img.caseGroup) {
        const arr = grouped.get(img.caseGroup) || [];
        arr.push(img);
        grouped.set(img.caseGroup, arr);
      } else {
        standalone.push(img);
      }
    }

    const result: CaseCluster[] = [];
    for (const [group, imgs] of grouped) {
      result.push({ label: group, images: imgs, caseGroup: group });
    }
    for (const img of standalone) {
      result.push({
        label: img.caption || "Image",
        images: [img],
      });
    }
    return result;
  }, [images]);

  const [caseIndex, setCaseIndex] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [imgError, setImgError] = useState(false);
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      let cumulative = 0;
      for (let i = 0; i < cases.length; i++) {
        if (cumulative + cases[i].images.length > initialIndex) {
          setCaseIndex(i);
          setSliceIndex(initialIndex - cumulative);
          break;
        }
        cumulative += cases[i].images.length;
      }
      setExpanded(false);
      setAutoPlay(false);
      setImgError(false);
    }
  }, [open, initialIndex, cases]);

  // Reset error state when image changes
  const currentCase = cases[caseIndex] || cases[0];
  const currentImage = expanded
    ? currentCase?.images[sliceIndex]
    : currentCase?.images[0];
  const currentUrl = currentImage?.url;

  useEffect(() => {
    setImgError(false);
  }, [currentUrl]);

  const hasMultipleSlices = currentCase && currentCase.images.length > 1;

  const goNextCase = useCallback(() => {
    setCaseIndex((i) => (i + 1) % cases.length);
    setSliceIndex(0);
    setExpanded(false);
  }, [cases.length]);

  const goPrevCase = useCallback(() => {
    setCaseIndex((i) => (i - 1 + cases.length) % cases.length);
    setSliceIndex(0);
    setExpanded(false);
  }, [cases.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (expanded) {
          setExpanded(false);
          setSliceIndex(0);
        } else {
          onClose();
        }
        return;
      }
      if (expanded && currentCase) {
        if (e.key === "ArrowLeft") {
          setSliceIndex((i) => Math.max(0, i - 1));
        } else if (e.key === "ArrowRight") {
          setSliceIndex((i) => Math.min(currentCase.images.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
          setExpanded(false);
          setSliceIndex(0);
        }
      } else {
        if (e.key === "ArrowLeft") {
          goPrevCase();
        } else if (e.key === "ArrowRight") {
          goNextCase();
        } else if (
          (e.key === "ArrowDown" || e.key === "Enter") &&
          hasMultipleSlices
        ) {
          setExpanded(true);
          setSliceIndex(0);
        }
      }
      if (e.key === " ") {
        e.preventDefault();
        setAutoPlay((p) => !p);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, expanded, currentCase, hasMultipleSlices, goNextCase, goPrevCase, onClose]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || !open) return;
    const interval = setInterval(() => {
      if (autoPlayRef.current) goNextCase();
    }, 2500);
    return () => clearInterval(interval);
  }, [autoPlay, open, goNextCase]);

  // Mouse wheel navigation (scroll through slices like a PACS viewer)
  const imageAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const el = imageAreaRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      if (expanded && currentCase) {
        setSliceIndex((i) => Math.max(0, Math.min(currentCase.images.length - 1, i + delta)));
      } else if (cases.length > 1) {
        if (delta > 0) goNextCase();
        else goPrevCase();
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [open, expanded, currentCase, cases.length, goNextCase, goPrevCase]);

  // Preload adjacent images
  useEffect(() => {
    if (!open || cases.length === 0) return;
    const nextCase = cases[(caseIndex + 1) % cases.length];
    const prevCase = cases[(caseIndex - 1 + cases.length) % cases.length];
    [nextCase?.images[0]?.url, prevCase?.images[0]?.url].forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [open, caseIndex, cases]);

  // Auto-scroll sidebar to keep active thumbnail visible
  useEffect(() => {
    if (!sidebarRef.current) return;
    const active = sidebarRef.current.querySelector("[data-active='true']");
    if (active) {
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [caseIndex, sliceIndex, expanded]);

  const handleDelete = async () => {
    if (!currentCase) return;

    // If current item is a stack (multiple slices), delete the entire stack
    if (currentCase.images.length > 1) {
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      const ids = currentCase.images.map((img) => img._id);
      await deleteStack({ ids });
      setConfirmDelete(false);
      // Move to next case or close if none left
      if (cases.length <= 1) {
        onClose();
      } else {
        setCaseIndex((i) => Math.min(i, cases.length - 2));
        setSliceIndex(0);
        setExpanded(false);
      }
    } else {
      // Single image — delete directly
      if (!currentImage) return;
      await deleteImage({ id: currentImage._id });
      if (images.length <= 1) {
        onClose();
      }
    }
  };

  // Reset confirm state when navigating away
  useEffect(() => {
    setConfirmDelete(false);
  }, [caseIndex, sliceIndex]);

  const displayLabel = (label: string) =>
    label.replace(/\s*\[\d{13,}\]$/, "");

  // Find attribution for current case (stored on first image in group)
  const currentAttribution = currentCase?.images.find((img) => img.attribution)?.attribution;

  const thumbnailItems = expanded
    ? currentCase.images
    : cases.map((c) => c.images[0]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[70]">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/95" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="flex flex-col h-full w-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
                <div className="flex items-center gap-3 min-w-0">
                  <h2 className="text-sm font-bold text-white truncate max-w-xs">
                    {title}
                  </h2>
                  {cases.length > 0 && (
                    <span className="text-xs text-slate-400 font-mono shrink-0">
                      {expanded
                        ? `Slice ${sliceIndex + 1} / ${currentCase.images.length}`
                        : `Study ${caseIndex + 1} / ${cases.length}`}
                    </span>
                  )}
                  {expanded && currentCase && (
                    <span className="text-[10px] text-teal-400 font-medium truncate max-w-[200px]">
                      {displayLabel(currentCase.label)}
                    </span>
                  )}
                  {expanded && (
                    <button
                      onClick={() => {
                        setExpanded(false);
                        setSliceIndex(0);
                      }}
                      className="flex items-center gap-1 text-[10px] text-teal-400 hover:text-teal-300 uppercase font-bold shrink-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAutoPlay((p) => !p)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      autoPlay
                        ? "bg-teal-500/20 text-teal-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title={autoPlay ? "Pause auto-play" : "Auto-play (Space)"}
                  >
                    {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`p-1.5 rounded-lg transition-colors ${
                      confirmDelete
                        ? "bg-red-500/20 text-red-400"
                        : "text-slate-500 hover:text-red-400"
                    }`}
                    title={
                      currentCase && currentCase.images.length > 1
                        ? confirmDelete
                          ? `Click again to delete all ${currentCase.images.length} slices`
                          : `Delete stack (${currentCase.images.length} slices)`
                        : "Delete this image"
                    }
                  >
                    {confirmDelete ? (
                      <span className="text-[10px] font-bold px-1">
                        Delete {currentCase?.images.length} slices?
                      </span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main content: sidebar + image */}
              <div className="flex-1 flex min-h-0">
                {/* Left sidebar — thumbnail navigation */}
                {cases.length > 0 && (
                  <div
                    ref={sidebarRef}
                    className="w-32 shrink-0 bg-slate-800/60 border-r border-slate-700/50 overflow-y-auto py-2 px-2 flex flex-col gap-2"
                  >
                    {thumbnailItems.map((img, i) => {
                      if (!img) return null;
                      const isActive = expanded
                        ? i === sliceIndex
                        : i === caseIndex;
                      const caseAtI = expanded ? null : cases[i];
                      return (
                        <button
                          key={img._id}
                          data-active={isActive}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", String(i));
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onClick={() =>
                            expanded ? setSliceIndex(i) : setCaseIndex(i)
                          }
                          className={`relative shrink-0 w-full aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                            isActive
                              ? "border-teal-400 ring-2 ring-teal-400/30"
                              : "border-transparent opacity-50 hover:opacity-90"
                          }`}
                        >
                          {img.url ? (
                            <img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                              <ImageOff className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          {/* Stack badge */}
                          {!expanded && caseAtI && caseAtI.images.length > 1 && (
                            <div className="absolute bottom-0.5 right-0.5 bg-black/70 rounded px-1 flex items-center gap-0.5">
                              <Layers className="w-2.5 h-2.5 text-white" />
                              <span className="text-[8px] text-white font-bold">
                                {caseAtI.images.length}
                              </span>
                            </div>
                          )}
                          {/* Slice number */}
                          {expanded && (
                            <div className="absolute top-0.5 left-0.5 bg-black/60 rounded px-1">
                              <span className="text-[8px] text-white font-mono">
                                {i + 1}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Image area — fills remaining space */}
                <div
                  ref={imageAreaRef}
                  className={`flex-1 relative flex items-center justify-center min-h-0 min-w-0 p-4 transition-colors ${
                    dragOverCenter ? "bg-teal-500/5 ring-2 ring-inset ring-teal-400/20" : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverCenter(true);
                  }}
                  onDragLeave={() => setDragOverCenter(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCenter(false);
                    const idx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (!isNaN(idx)) {
                      if (expanded) {
                        setSliceIndex(idx);
                      } else {
                        setCaseIndex(idx);
                        setSliceIndex(0);
                        // Auto-expand if it's a stack
                        if (cases[idx] && cases[idx].images.length > 1) {
                          setExpanded(true);
                        }
                      }
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                      <p className="text-sm text-slate-400 font-medium">
                        Loading images...
                      </p>
                    </div>
                  ) : cases.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <ImageOff className="w-10 h-10 text-slate-600" />
                      <p className="text-sm text-slate-400 font-medium">
                        No images found
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Left arrow */}
                      {(expanded ? currentCase.images.length > 1 : cases.length > 1) && (
                        <button
                          onClick={
                            expanded
                              ? () => setSliceIndex((i) => Math.max(0, i - 1))
                              : goPrevCase
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}

                      {/* Image — uses nearly all available space */}
                      {currentUrl && !imgError ? (
                        <img
                          key={currentUrl}
                          src={currentUrl}
                          alt={currentImage?.caption || "Study image"}
                          className="max-h-full max-w-full object-contain select-none"
                          draggable={false}
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                            <ImageOff className="w-8 h-8 text-slate-600" />
                          </div>
                          <p className="text-sm font-medium">
                            {imgError ? "Image failed to load" : "No image URL"}
                          </p>
                          {imgError && currentUrl && (
                            <p className="text-[10px] text-slate-600 max-w-md text-center break-all">
                              {currentUrl}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Right arrow */}
                      {(expanded ? currentCase.images.length > 1 : cases.length > 1) && (
                        <button
                          onClick={
                            expanded
                              ? () =>
                                  setSliceIndex((i) =>
                                    Math.min(currentCase.images.length - 1, i + 1)
                                  )
                              : goNextCase
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}

                      {/* Multi-slice expand indicator */}
                      {!expanded && hasMultipleSlices && (
                        <button
                          onClick={() => {
                            setExpanded(true);
                            setSliceIndex(0);
                          }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-xs font-bold"
                        >
                          <Layers className="w-4 h-4" />
                          {currentCase.images.length} slices — press{" "}
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
                            Enter
                          </kbd>{" "}
                          to expand
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Footer — caption + keyboard hints */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/60 border-t border-slate-700/50">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentImage?.caption || ""}
                  </p>
                  {currentAttribution && (
                    <p className="text-[11px] text-teal-400 italic truncate max-w-[400px]">
                      {currentAttribution}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-slate-600 shrink-0">
                  {expanded
                    ? "← → or scroll: slices  ↑ back  Space auto-play  Esc close"
                    : "← → or scroll: studies  ↓ expand  Space auto-play  Esc close"}
                </p>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
