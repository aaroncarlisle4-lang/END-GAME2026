import { createContext, useContext, useState, ReactNode } from "react";

interface KnowledgeContextType {
  isOpen: boolean;
  query: string;
  openKnowledge: (query: string) => void;
  closeKnowledge: () => void;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const openKnowledge = (newQuery: string) => {
    setQuery(newQuery);
    setIsOpen(true);
  };

  const closeKnowledge = () => {
    setIsOpen(false);
  };

  return (
    <KnowledgeContext.Provider value={{ isOpen, query, openKnowledge, closeKnowledge }}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error("useKnowledge must be used within a KnowledgeProvider");
  }
  return context;
}
