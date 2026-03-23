import { useState, useCallback, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface TextSuggestion {
  differentialIndex: number;
  diagnosis: string;
  field: string;
  currentValue: string | null;
  suggestedValue: string;
  action: "add" | "replace" | "skip";
  confidence: number;
  reasoning: string;
}

export function useTextIngestion() {
  const processTextAction = useAction(api.textIngestion.processText);
  const patchField = useMutation(api.discriminators.patchDifferentialField);

  const [suggestions, setSuggestions] = useState<TextSuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  // Store the active discriminator ID in a ref so approve/refine always use the current one
  const activeIdRef = useRef<Id<"discriminators"> | null>(null);

  const processText = useCallback(
    async (text: string, discriminatorId: Id<"discriminators">) => {
      activeIdRef.current = discriminatorId;
      setError(null);
      setIsProcessing(true);
      setOriginalText(text);
      setSuggestions([]);
      try {
        const result = await processTextAction({
          text,
          discriminatorId,
        });
        setSuggestions(result as TextSuggestion[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Processing failed");
      } finally {
        setIsProcessing(false);
      }
    },
    [processTextAction]
  );

  const refineSuggestion = useCallback(
    async (feedback: string) => {
      const id = activeIdRef.current;
      if (!id || !originalText) return;
      setError(null);
      setIsProcessing(true);
      try {
        const result = await processTextAction({
          text: originalText,
          discriminatorId: id,
          userFeedback: feedback,
        });
        setSuggestions(result as TextSuggestion[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Refinement failed");
      } finally {
        setIsProcessing(false);
      }
    },
    [originalText, processTextAction]
  );

  const approveSuggestion = useCallback(
    async (index: number) => {
      const id = activeIdRef.current;
      if (!id) return;
      const s = suggestions[index];
      if (!s || s.action === "skip") return;
      try {
        await patchField({
          id,
          differentialIndex: s.differentialIndex,
          field: s.field,
          value: s.suggestedValue,
        });
        setSuggestions((prev) => prev.filter((_, i) => i !== index));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Approval failed");
      }
    },
    [suggestions, patchField]
  );

  const approveAll = useCallback(async () => {
    const id = activeIdRef.current;
    if (!id) return;
    const actionable = suggestions.filter((s) => s.action !== "skip");
    for (const s of actionable) {
      try {
        await patchField({
          id,
          differentialIndex: s.differentialIndex,
          field: s.field,
          value: s.suggestedValue,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Batch approval failed");
        return;
      }
    }
    setSuggestions([]);
  }, [suggestions, patchField]);

  const dismissSuggestion = useCallback((index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const dismissAll = useCallback(() => {
    setSuggestions([]);
  }, []);

  const reset = useCallback(() => {
    setSuggestions([]);
    setIsProcessing(false);
    setError(null);
    setOriginalText("");
    activeIdRef.current = null;
  }, []);

  return {
    processText,
    refineSuggestion,
    approveSuggestion,
    approveAll,
    dismissSuggestion,
    dismissAll,
    reset,
    suggestions,
    isProcessing,
    error,
  };
}
