import { useState, useEffect, useCallback } from "react";

export function useHighlights(key: string) {
  const [highlights, setHighlights] = useState<string[]>([]);

  // Load from localStorage on mount or key change
  useEffect(() => {
    const stored = localStorage.getItem(`highlights_${key}`);
    if (stored) {
      try {
        setHighlights(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse highlights", e);
        setHighlights([]);
      }
    } else {
      setHighlights([]);
    }
  }, [key]);

  // Save to localStorage whenever highlights change
  const saveHighlights = useCallback((newHighlights: string[]) => {
    setHighlights(newHighlights);
    localStorage.setItem(`highlights_${key}`, JSON.stringify(newHighlights));
  }, [key]);

  const addHighlight = useCallback((text: string) => {
    if (!text || text.trim().length < 2) return;
    if (highlights.includes(text)) return;
    saveHighlights([...highlights, text]);
  }, [highlights, saveHighlights]);

  const removeHighlight = useCallback((text: string) => {
    saveHighlights(highlights.filter((h) => h !== text));
  }, [highlights, saveHighlights]);

  const clearHighlights = useCallback(() => {
    saveHighlights([]);
  }, [saveHighlights]);

  return {
    highlights,
    addHighlight,
    removeHighlight,
    clearHighlights,
  };
}
