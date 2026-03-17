import { useState, useCallback, useMemo, useEffect, type DragEvent, type ReactNode } from "react";
import { Upload, Camera, Layers, Loader2, Bookmark, FileText, X } from "lucide-react";
import { useImageUpload } from "../../hooks/useImageUpload";

/**
 * Parse URLs from freeform text — handles newlines, commas, spaces, or any mix.
 */
function parseUrls(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("https://"));
}

type SourceType = "differentialPattern" | "mnemonic" | "chapman" | "rapidCase";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageDropZoneProps {
  sourceType: SourceType;
  sourceId: string;
  imageCount: number;
  onViewImages: () => void;
  children: ReactNode;
  onTextDrop?: (text: string) => void;
  differentialOptions?: string[];
}

export function ImageDropZone({
  sourceType,
  sourceId,
  imageCount,
  onViewImages,
  children,
  onTextDrop,
  differentialOptions = [],
}: ImageDropZoneProps) {
  const { uploadFile, addByUrl, addByUrlBatch, isUploading, batchProgress, error } =
    useImageUpload(sourceType, sourceId);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showStackImport, setShowStackImport] = useState(false);
  const [showTextPaste, setShowTextPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [stackLabel, setStackLabel] = useState("");
  const [stackUrls, setStackUrls] = useState("");
  const [stackAttribution, setStackAttribution] = useState("");
  const [selectedDifferential, setSelectedDifferential] = useState<string>("");

  // Initialize selected differential when options change
  useEffect(() => {
    if (differentialOptions.length > 0 && !selectedDifferential) {
      setSelectedDifferential(differentialOptions[0]);
    }
  }, [differentialOptions, selectedDifferential]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files") || e.dataTransfer.types.includes("text/plain")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX <= rect.left ||
      clientX >= rect.right ||
      clientY <= rect.top ||
      clientY >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) continue;
        if (file.size > MAX_SIZE) continue;
        await uploadFile(file, selectedDifferential || undefined);
      }

      const text = e.dataTransfer.getData("text/plain");
      if (text) {
        if (text.startsWith("https://")) {
          const group = selectedDifferential || text.split("/").pop() || "Image";
          await addByUrl(text, text.split("/").pop(), group);
        } else if (onTextDrop && text.trim().length > 0) {
          onTextDrop(text);
        }
      }
    },
    [uploadFile, addByUrl, onTextDrop, selectedDifferential]
  );

  const isDirectImageUrl = (url: string) =>
    /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url) ||
    url.includes("prod-images-static.radiopaedia.org");

  const handleUrlSubmit = async () => {
    if (!urlValue.startsWith("https://")) return;
    const group = selectedDifferential || urlValue.split("/").pop() || "Image";
    await addByUrl(urlValue, urlValue.split("/").pop(), group);
    setUrlValue("");
    setShowUrlInput(false);
  };

  // Auto-detect label + attribution from bookmarklet paste
  const handleStackUrlsChange = useCallback(
    (value: string) => {
      setStackUrls(value);
      const lines = value.split("\n");
      if (lines.length > 1 && !stackLabel) {
        // First non-URL line = label
        if (lines[0].trim() && !lines[0].trim().startsWith("https://")) {
          setStackLabel(lines[0].trim());
        }
      }
      // Look for attribution line (starts with "Case courtesy of" or "ATTR:")
      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("ATTR:")) {
          setStackAttribution(t.replace("ATTR:", "").trim());
          break;
        }
        if (t.startsWith("Case courtesy of")) {
          setStackAttribution(t);
          break;
        }
      }
    },
    [stackLabel]
  );

  // Parse stack URLs from textarea (handles newlines, commas, or mix)
  const parsedStackUrls = useMemo(() => parseUrls(stackUrls), [stackUrls]);

  const nonImageUrls = useMemo(() => {
    return parsedStackUrls.filter((url) => !isDirectImageUrl(url));
  }, [parsedStackUrls]);

  const handleStackImport = async () => {
    if (parsedStackUrls.length === 0) return;
    
    // Default label if none provided
    const finalLabel = stackLabel.trim() || "Image Stack";
    const bucket = selectedDifferential || "General";
    
    // Unique caseGroup per import, but prefixed with differential for "Bucketing"
    const uniqueGroup = `${bucket} - ${finalLabel} [${Date.now()}]`;

    await addByUrlBatch(parsedStackUrls, uniqueGroup, finalLabel, stackAttribution || undefined);
    setStackUrls("");
    setStackLabel("");
    setStackAttribution("");
    setShowStackImport(false);
  };

  return (
    <div
      className="relative group"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {/* Image count badge */}
      {imageCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewImages();
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-teal-600 transition-colors"
          title={`${imageCount} image${imageCount !== 1 ? "s" : ""} — click to view`}
        >
          {imageCount}
        </button>
      )}

      {/* Action buttons */}
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUploading && (
          <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
        )}
        {batchProgress && (
          <span className="text-[10px] text-teal-600 font-medium bg-white/80 px-1.5 py-0.5 rounded border border-teal-100">
            {batchProgress.done}/{batchProgress.total}
          </span>
        )}
        {onTextDrop && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTextPaste((v) => !v);
              setShowUrlInput(false);
              setShowStackImport(false);
            }}
            className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-violet-600 hover:border-violet-300 flex items-center justify-center transition-colors shadow-sm"
            title="Paste text for AI classification"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStackImport((v) => !v);
            setShowUrlInput(false);
            setShowTextPaste(false);
          }}
          className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-300 flex items-center justify-center transition-colors shadow-sm"
          title="Import image stack"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowUrlInput((v) => !v);
            setShowStackImport(false);
            setShowTextPaste(false);
          }}
          className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-300 flex items-center justify-center transition-colors shadow-sm"
          title="Import image URL"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stack import popover */}
      {showStackImport && (
        <div
          className="absolute bottom-10 right-2 z-20 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-80 animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Import Image Stack
            </p>
            <button 
              onClick={() => setShowStackImport(false)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">
              Map to Differential (Required)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedDifferential("")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                  !selectedDifferential
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                General
              </button>
              {differentialOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedDifferential(opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    selectedDifferential === opt
                      ? "bg-teal-500 border-teal-600 text-white shadow-md"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Paste slice URLs (Required)
              </label>
              <textarea
                value={stackUrls}
                onChange={(e) => handleStackUrlsChange(e.target.value)}
                placeholder={"Paste URLs here..."}
                rows={4}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 font-mono resize-none"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={stackLabel}
                  onChange={(e) => setStackLabel(e.target.value)}
                  placeholder="e.g. Axial CT"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Credit (Optional)
                </label>
                <input
                  type="text"
                  value={stackAttribution}
                  onChange={(e) => setStackAttribution(e.target.value)}
                  placeholder="Courtesy of..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleStackImport}
            disabled={parsedStackUrls.length === 0 || isUploading}
            className="w-full mt-4 px-4 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black disabled:opacity-40 transition-all shadow-lg active:scale-95"
          >
            {isUploading ? "Importing..." : `Import ${parsedStackUrls.length} Slices`}
          </button>
        </div>
      )}

      {/* Text paste popover */}
      {showTextPaste && onTextDrop && (
        <div
          className="absolute bottom-10 right-2 z-20 bg-white rounded-xl shadow-xl border border-violet-200 p-4 w-80 animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">
              Paste Textbook Text
            </p>
            <button 
              onClick={() => setShowTextPaste(false)}
              className="p-1 hover:bg-violet-50 rounded-full text-violet-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste text from Dahnert, Radiopaedia, or any radiology source..."
            rows={5}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-y"
            autoFocus
          />
          {pasteText.trim() && (
            <p className="text-[10px] text-slate-400 mt-1">
              {pasteText.trim().split(/\s+/).length} words
            </p>
          )}
          <button
            onClick={() => {
              if (pasteText.trim()) {
                onTextDrop(pasteText.trim());
                setPasteText("");
                setShowTextPaste(false);
              }
            }}
            disabled={!pasteText.trim()}
            className="w-full mt-2 px-3 py-2 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 disabled:opacity-40 transition-colors"
          >
            Process with AI
          </button>
        </div>
      )}

      {/* URL import popover */}
      {showUrlInput && (
        <div
          className="absolute bottom-10 right-2 z-20 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72 animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Import Image URL
            </p>
            <button 
              onClick={() => setShowUrlInput(false)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {differentialOptions.length > 0 && (
            <div className="mb-3">
              <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1.5">
                Map to Differential
              </label>
              <div className="flex flex-wrap gap-1">
                {differentialOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedDifferential(opt)}
                    className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                      selectedDifferential === opt
                        ? "bg-teal-500 border-teal-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="https://..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
              autoFocus
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlValue.startsWith("https://")}
              className="px-3 py-2 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
          {urlValue && urlValue.startsWith("https://") && (
            <div className="mt-2 space-y-1.5">
              {!isDirectImageUrl(urlValue) && (
                <p className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                  This doesn't look like a direct image URL. For Radiopaedia,
                  right-click the image and copy the image address (should end in
                  .jpg/.png).
                </p>
              )}
              <div className="rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                <img
                  src={urlValue}
                  alt="Preview"
                  className="w-full h-24 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-20 rounded-xl border-2 border-dashed border-teal-400 bg-teal-50/80 flex flex-col items-center justify-center pointer-events-none">
          <Upload className="w-8 h-8 text-teal-500 mb-2" />
          <p className="text-sm font-bold text-teal-700">Drop image or text here</p>
          <p className="text-[10px] text-teal-500 mt-1">
            {onTextDrop ? "Images (JPEG/PNG/WebP) or plain text for AI classification" : "JPEG, PNG, WebP up to 10MB"}
          </p>
        </div>
      )}
    </div>
  );
}
