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
  GitBranch,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Pencil,
} from "lucide-react";
import { ImageAnnotationLayer } from "./ImageAnnotationLayer";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface StudyImage {
  _id: string;
  url?: string;
  caption?: string;
  caseGroup?: string;
  attribution?: string;
  _source?: "individual" | "manifest";
  _manifestId?: string;
}

interface RapidImageViewerProps {
  open: boolean;
  onClose: () => void;
  images: StudyImage[];
  isLoading?: boolean;
  initialIndex?: number;
  title: string;
  onViewDiscriminators?: () => void;
  hasDiscriminator?: boolean;
}

interface CaseCluster {
  label: string;
  images: StudyImage[];
  caseGroup?: string;
}

interface Bucket {
  name: string;
  clusters: CaseCluster[];
}

export function RapidImageViewer({
  open,
  onClose,
  images,
  isLoading = false,
  initialIndex = 0,
  title,
  onViewDiscriminators,
  hasDiscriminator = false,
}: RapidImageViewerProps) {
  const deleteImage = useMutation(api.studyImages.deleteImage);
  const deleteStack = useMutation(api.studyImages.deleteStack);
  const deleteManifest = useMutation(api.studyImages.deleteManifest);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dragOverCenter, setDragOverCenter] = useState(false);

  // 1. Group images into CaseClusters (stacks/standalone)
  const allClusters = useMemo<CaseCluster[]>(() => {
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

  // 2. Group CaseClusters into Differential Buckets
  const buckets = useMemo<Bucket[]>(() => {
    const bucketMap = new Map<string, CaseCluster[]>();
    const unbucketed: CaseCluster[] = [];

    for (const cluster of allClusters) {
      // Look for "Differential - Label" pattern in caseGroup
      const match = cluster.caseGroup?.match(/^(.+?)\s*-\s*.*\[\d+\]$/) || cluster.caseGroup?.match(/^(.+?)\s*-\s*.*$/);
      if (match) {
        const bucketName = match[1].trim();
        const arr = bucketMap.get(bucketName) || [];
        arr.push(cluster);
        bucketMap.set(bucketName, arr);
      } else {
        unbucketed.push(cluster);
      }
    }

    const result: Bucket[] = [];
    for (const [name, clusters] of bucketMap) {
      result.push({ name, clusters });
    }
    if (unbucketed.length > 0) {
      result.push({ name: "General / Uncategorized", clusters: unbucketed });
    }
    return result;
  }, [allClusters]);

  const [activeBucketIndex, setActiveBucketId] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Annotate mode
  const [annotateMode, setAnnotateMode] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Reset on study/bucket change, but NOT on slice scroll
  useEffect(() => {
    resetZoom();
  }, [caseIndex, activeBucketIndex, expanded, resetZoom]);

  const toggleZoom = useCallback(() => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2.5);
    }
  }, [zoom, resetZoom]);

  const activeBucket = buckets[activeBucketIndex] || buckets[0];
  const cases = activeBucket?.clusters || [];

  // Use a ref to track if we've already initialized this "open" session
  // This prevents background data updates from resetting the user's expanded state or position.
  const sessionInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      sessionInitializedRef.current = null;
      return;
    }

    // Only run initialization logic if the viewer just opened or the target case/index changed significantly
    const sessionKey = `${title}-${initialIndex}`;
    if (sessionInitializedRef.current !== sessionKey && buckets.length > 0) {
      let cumulative = 0;
      let found = false;
      for (let b = 0; b < buckets.length; b++) {
        for (let c = 0; c < buckets[b].clusters.length; c++) {
          const cluster = buckets[b].clusters[c];
          if (cumulative + cluster.images.length > initialIndex) {
            setActiveBucketId(b);
            setCaseIndex(c);
            setSliceIndex(initialIndex - cumulative);
            found = true;
            break;
          }
          cumulative += cluster.images.length;
        }
        if (found) break;
      }
      
      if (!found) {
        setActiveBucketId(0);
        setCaseIndex(0);
        setSliceIndex(0);
      }
      
      setExpanded(false);
      setAutoPlay(false);
      sessionInitializedRef.current = sessionKey;
    }
  }, [open, initialIndex, buckets, title]);

  const [imgError, setImgError] = useState(false);
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    if (caseIndex < cases.length - 1) {
      setCaseIndex(caseIndex + 1);
    } else if (activeBucketIndex < buckets.length - 1) {
      setActiveBucketId(activeBucketIndex + 1);
      setCaseIndex(0);
    } else {
      setActiveBucketId(0);
      setCaseIndex(0);
    }
    setSliceIndex(0);
    setExpanded(false);
    setAnnotateMode(false);
  }, [caseIndex, cases.length, activeBucketIndex, buckets.length]);

  const goPrevCase = useCallback(() => {
    if (caseIndex > 0) {
      setCaseIndex(caseIndex - 1);
    } else if (activeBucketIndex > 0) {
      const prevBucketIdx = activeBucketIndex - 1;
      setActiveBucketId(prevBucketIdx);
      setCaseIndex(buckets[prevBucketIdx].clusters.length - 1);
    } else {
      const lastBucketIdx = buckets.length - 1;
      setActiveBucketId(lastBucketIdx);
      setCaseIndex(buckets[lastBucketIdx].clusters.length - 1);
    }
    setSliceIndex(0);
    setExpanded(false);
    setAnnotateMode(false);
  }, [caseIndex, activeBucketIndex, buckets]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (zoom > 1) {
          resetZoom();
          return;
        }
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
  }, [open, expanded, currentCase, hasMultipleSlices, goNextCase, goPrevCase, onClose, zoom, resetZoom, toggleZoom]);

  // Handle Pan dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click (button 1) to toggle zoom
    if (e.button === 1) {
      e.preventDefault();
      toggleZoom();
      return;
    }

    // Don't pan in annotate mode — ImageAnnotationLayer owns left-click
    if (!annotateMode && zoom > 1 && e.button === 0) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

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
        // LOCK TO STACK: When expanded, scrolling ONLY moves through slices of this stack.
        // It will not jump to the next case automatically.
        setSliceIndex((i) => Math.max(0, Math.min(currentCase.images.length - 1, i + delta)));
      } else if (!expanded && (cases.length > 1 || buckets.length > 1)) {
        // GALLERY MODE: Scroll between cases/buckets
        if (delta > 0) goNextCase();
        else goPrevCase();
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [open, expanded, currentCase, cases.length, buckets.length, goNextCase, goPrevCase]);

  // Preload adjacent images
  useEffect(() => {
    if (!open || buckets.length === 0) return;
    // Current, Next, Prev cluster logic
    const nextCase = cases[caseIndex + 1] || buckets[(activeBucketIndex + 1) % buckets.length]?.clusters[0];
    const prevCase = cases[caseIndex - 1] || buckets[(activeBucketIndex - 1 + buckets.length) % buckets.length]?.clusters.slice(-1)[0];
    
    [nextCase?.images[0]?.url, prevCase?.images[0]?.url].forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [open, caseIndex, activeBucketIndex, buckets, cases]);

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

    const manifestId = currentCase.images[0]?._manifestId;
    const isManifest = currentCase.images[0]?._source === "manifest" && manifestId;

    if (currentCase.images.length > 1) {
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      if (isManifest) {
        await deleteManifest({ id: manifestId as Id<"studyManifests"> });
      } else {
        const ids = currentCase.images.map((img) => img._id as Id<"studyImages">);
        await deleteStack({ ids });
      }
      setConfirmDelete(false);
      
      // Since data will refetch, the buckets useMemo will update.
      // We don't need complex state management here as Convex handles reactivity.
    } else {
      if (!currentImage) return;
      if (isManifest) {
        await deleteManifest({ id: manifestId as Id<"studyManifests"> });
      } else {
        await deleteImage({ id: currentImage._id as Id<"studyImages"> });
      }
    }
  };

  useEffect(() => {
    setConfirmDelete(false);
  }, [caseIndex, sliceIndex]);

  const displayLabel = (label: string) => {
    // Remove the suffix [timestamp] if it exists
    let clean = label.replace(/\s*\[\d{13,}\]$/, "");
    // Remove the bucket prefix if it exists (Differential - Label)
    if (activeBucket.name !== "General / Uncategorized") {
      clean = clean.replace(new RegExp(`^${activeBucket.name}\\s*-\\s*`), "");
    }
    return clean;
  };

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
                  {buckets.length > 0 && (
                    <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-teal-500/20">
                      {activeBucket.name}
                    </span>
                  )}
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
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-slate-700/50 rounded-lg p-0.5 mr-2">
                    <button
                      onClick={() => setZoom(z => Math.max(1, z - 0.5))}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleZoom}
                      className={`px-2 py-1 rounded-md text-[10px] font-black transition-colors ${
                        zoom > 1 ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-600'
                      }`}
                    >
                      {Math.round(zoom * 100)}%
                    </button>
                    <button
                      onClick={() => setZoom(z => Math.min(5, z + 0.5))}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Annotate mode toggle */}
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

                  {hasDiscriminator && onViewDiscriminators && (
                    <button
                      onClick={onViewDiscriminators}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg shadow-teal-900/40 transition-all active:scale-95 mr-2"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Compare</span>
                      <Sparkles className="w-2.5 h-2.5 text-teal-200" />
                    </button>
                  )}
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
                {/* Bucket Navigation Layer (Vertical Strip - Now wider for full text) */}
                {buckets.length > 1 && (
                  <div className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col py-4 gap-1 overflow-y-auto scrollbar-none">
                    <div className="px-5 mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Differential Folders</p>
                      <div className="h-1 w-8 bg-teal-500/30 rounded-full" />
                    </div>
                    {buckets.map((bucket, idx) => (
                      <button
                        key={bucket.name}
                        onClick={() => {
                          setActiveBucketId(idx);
                          setCaseIndex(0);
                          setSliceIndex(0);
                          setExpanded(false);
                        }}
                        className={`group relative px-5 py-4 flex items-center gap-4 transition-all ${
                          activeBucketIndex === idx
                            ? "bg-teal-500/10 border-r-4 border-teal-500"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-300 ${
                          activeBucketIndex === idx 
                            ? 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.9)] scale-110' 
                            : 'bg-slate-700 group-hover:bg-slate-500'
                        }`} />
                        <span className={`text-[12px] font-black uppercase tracking-normal text-left leading-tight transition-colors ${
                          activeBucketIndex === idx ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                        }`}>
                          {bucket.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Left sidebar — thumbnail navigation */}
                {cases.length > 0 && (
                  <div
                    ref={sidebarRef}
                    className="w-44 shrink-0 bg-slate-800/20 border-r border-slate-700/20 overflow-y-auto py-2 px-2 flex flex-col gap-2"
                  >
                    {/* Bucket Caption */}
                    <div className="px-3 py-3 mb-2 bg-slate-900/40 rounded-xl border border-white/5 shadow-inner">
                      <p className="text-[8px] font-black text-teal-500 uppercase tracking-widest leading-tight mb-1">
                        CURRENT FOLDER:
                      </p>
                      <p className="text-[11px] font-black text-white leading-snug uppercase tracking-tight">
                        {activeBucket.name}
                      </p>
                    </div>

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
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`flex-1 relative flex items-center justify-center min-h-0 min-w-0 p-0 bg-black transition-colors cursor-default ${
                    zoom > 1 ? 'cursor-move' : ''
                  } ${
                    dragOverCenter ? "bg-teal-500/10 ring-2 ring-inset ring-teal-400/20" : ""
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
                  ) : buckets.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <ImageOff className="w-10 h-10 text-slate-600" />
                      <p className="text-sm text-slate-400 font-medium">
                        No images found
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Left arrow */}
                      {(expanded ? currentCase.images.length > 1 : (cases.length > 1 || buckets.length > 1)) && (
                        <button
                          onClick={
                            expanded
                              ? () => setSliceIndex((i) => Math.max(0, i - 1))
                              : goPrevCase
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-colors z-10 backdrop-blur-sm border border-white/5"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      )}

                      {/* Image — uses every pixel of available space */}
                      <div className="relative h-full w-full flex items-center justify-center">
                        {currentUrl && !imgError ? (
                          <>
                            {/* Shared transform wrapper: image + annotation layer move together */}
                            <div
                              style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                maxHeight: '100%',
                                maxWidth: '100%',
                              }}
                              className={`will-change-transform${annotateMode ? ' ring-1 ring-amber-400/25' : ''}`}
                            >
                              <img
                                ref={imageRef}
                                key={currentUrl}
                                src={currentUrl}
                                alt={currentImage?.caption || "Study image"}
                                className="max-h-full max-w-full object-contain select-none"
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
                            
                            {/* Prominent Floating Caption & Metadata */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20">
                              <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl flex items-center gap-3">
                                <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.2em] border-r border-white/10 pr-3">
                                  {activeBucket.name}
                                </span>
                                <span className="text-sm font-bold text-white max-w-[400px] truncate">
                                  {currentImage?.caption || "Clinical View"}
                                </span>
                              </div>
                            </div>

                            {/* Floating Footer Attribution & Hints */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none w-full px-10 z-20">
                              {currentAttribution && (
                                <div className="px-4 py-1.5 bg-black/60 backdrop-blur-sm border border-white/5 rounded-lg mb-2">
                                  <p className="text-[11px] text-teal-400/90 italic font-medium">
                                    {currentAttribution}
                                  </p>
                                </div>
                              )}
                              <div className="px-4 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/5">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                                  {expanded
                                    ? "← → Slices  ↑ Back  Space Auto-Play"
                                    : "← → Folders  ↓ Expand  Space Auto-Play"}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-slate-500">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                              <ImageOff className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-sm font-medium">
                              {imgError ? "Image failed to load" : "No image URL"}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right arrow */}
                      {(expanded ? currentCase.images.length > 1 : (cases.length > 1 || buckets.length > 1)) && (
                        <button
                          onClick={
                            expanded
                              ? () =>
                                  setSliceIndex((i) =>
                                    Math.min(currentCase.images.length - 1, i + 1)
                                  )
                              : goNextCase
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-colors z-10 backdrop-blur-sm border border-white/5"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      )}

                      {/* Multi-slice expand indicator */}
                      {!expanded && hasMultipleSlices && (
                        <button
                          onClick={() => {
                            setExpanded(true);
                            setSliceIndex(0);
                          }}
                          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600/90 text-white hover:bg-teal-500 transition-all text-sm font-black uppercase tracking-widest shadow-2xl backdrop-blur shadow-teal-900/40"
                        >
                          <Layers className="w-5 h-5" />
                          {currentCase.images.length} slices — press{" "}
                          <kbd className="px-2 py-1 rounded bg-white/20 text-xs ml-1">
                            Enter
                          </kbd>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
