import { useState, useCallback, useMemo, type DragEvent, type ReactNode } from "react";
import { Upload, Camera, Layers, Loader2, Bookmark } from "lucide-react";
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

type SourceType = "differentialPattern" | "mnemonic" | "chapman";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageDropZoneProps {
  sourceType: SourceType;
  sourceId: string;
  imageCount: number;
  onViewImages: () => void;
  children: ReactNode;
}

export function ImageDropZone({
  sourceType,
  sourceId,
  imageCount,
  onViewImages,
  children,
}: ImageDropZoneProps) {
  const { uploadFile, addByUrl, addByUrlBatch, isUploading, batchProgress, error } =
    useImageUpload(sourceType, sourceId);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showStackImport, setShowStackImport] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [stackLabel, setStackLabel] = useState("");
  const [stackUrls, setStackUrls] = useState("");
  const [stackAttribution, setStackAttribution] = useState("");

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
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
        await uploadFile(file);
      }

      const text = e.dataTransfer.getData("text/plain");
      if (text && text.startsWith("https://")) {
        await addByUrl(text, text.split("/").pop());
      }
    },
    [uploadFile, addByUrl]
  );

  const isDirectImageUrl = (url: string) =>
    /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url) ||
    url.includes("prod-images-static.radiopaedia.org");

  const handleUrlSubmit = async () => {
    if (!urlValue.startsWith("https://")) return;
    await addByUrl(urlValue, urlValue.split("/").pop());
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
    if (parsedStackUrls.length === 0 || !stackLabel.trim()) return;
    // Unique caseGroup per import so multiple stacks stay separate
    const uniqueGroup = `${stackLabel.trim()} [${Date.now()}]`;
    await addByUrlBatch(parsedStackUrls, uniqueGroup, stackLabel.trim(), stackAttribution || undefined);
    setStackUrls("");
    setStackLabel("");
    setStackAttribution("");
    setShowStackImport(false);
  };

  return (
    <div
      className="relative"
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
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
        {isUploading && (
          <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
        )}
        {batchProgress && (
          <span className="text-[10px] text-teal-600 font-medium">
            {batchProgress.done}/{batchProgress.total}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStackImport((v) => !v);
            setShowUrlInput(false);
          }}
          className="w-6 h-6 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-300 flex items-center justify-center transition-colors shadow-sm"
          title="Import image stack"
        >
          <Layers className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowUrlInput((v) => !v);
            setShowStackImport(false);
          }}
          className="w-6 h-6 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-300 flex items-center justify-center transition-colors shadow-sm"
          title="Import image URL"
        >
          <Camera className="w-3 h-3" />
        </button>
      </div>

      {/* Stack import popover */}
      {showStackImport && (
        <div
          className="absolute bottom-10 right-2 z-20 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-80"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Import Image Stack
          </p>

          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
            Stack Label
          </label>
          <input
            type="text"
            value={stackLabel}
            onChange={(e) => setStackLabel(e.target.value)}
            placeholder="e.g. CT Brain Axial"
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 mb-2"
            autoFocus
          />

          {/* Bookmarklet tip */}
          <div className="mb-2 p-2 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-[10px] text-teal-700">
              <Bookmark className="w-3 h-3 inline mr-1" />
              <strong>One-click import:</strong> Use the{" "}
              <span className="font-mono bg-teal-100 px-1 rounded">RadQuiz Grab</span>{" "}
              bookmarklet on any Radiopaedia case page. It copies all slice URLs to your clipboard — just paste here.
            </p>
          </div>

          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
            Paste image URLs (comma or newline separated)
          </label>
          <textarea
            value={stackUrls}
            onChange={(e) => handleStackUrlsChange(e.target.value)}
            placeholder={"Use bookmarklet on Radiopaedia, then paste here.\nOr paste URLs manually, comma or newline separated."}
            rows={5}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 font-mono resize-y"
          />

          <div className="mt-2 space-y-1">
            {parsedStackUrls.length > 0 && (
              <p className="text-[10px] text-teal-600 font-medium">
                {parsedStackUrls.length} valid URL{parsedStackUrls.length !== 1 ? "s" : ""} detected
              </p>
            )}
            {nonImageUrls.length > 0 && (
              <p className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                {nonImageUrls.length} URL{nonImageUrls.length !== 1 ? "s" : ""} don't look like direct image links
              </p>
            )}
          </div>

          <label className="block text-[10px] font-semibold text-slate-500 mb-1 mt-2">
            Credit (paste from RQ Credit bookmarklet)
          </label>
          <input
            type="text"
            value={stackAttribution}
            onChange={(e) => setStackAttribution(e.target.value)}
            placeholder="Case courtesy of..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          {stackAttribution && (
            <p className="text-[10px] text-teal-600 mt-1 italic">{stackAttribution}</p>
          )}

          {error && (
            <p className="text-[10px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded mt-1">
              {error}
            </p>
          )}

          <button
            onClick={handleStackImport}
            disabled={
              parsedStackUrls.length === 0 || !stackLabel.trim() || isUploading
            }
            className="w-full mt-2 px-3 py-2 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 disabled:opacity-40 transition-colors"
          >
            {isUploading
              ? "Importing..."
              : `Import ${parsedStackUrls.length} Image${parsedStackUrls.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* URL import popover */}
      {showUrlInput && (
        <div
          className="absolute bottom-10 right-2 z-20 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-72"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Paste Image URL
          </p>
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
          <p className="text-sm font-bold text-teal-700">Drop image here</p>
          <p className="text-[10px] text-teal-500 mt-1">
            JPEG, PNG, WebP up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}
