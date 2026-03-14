import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { DifferentialsPage } from "./pages/DifferentialsPage";
import { VivaLanguagePage } from "./pages/VivaLanguagePage";
import { SectionListPage } from "./pages/SectionListPage";
import { PacketPage } from "./pages/PacketPage";
import { CaseViewPage } from "./pages/CaseViewPage";
import { KnowledgeProvider } from "./lib/knowledgeContext";
import { TextbookKnowledgeDrawer } from "./components/case/TextbookKnowledgeDrawer";

export default function App() {
  return (
    <KnowledgeProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/differentials" element={<DifferentialsPage />} />
          <Route path="/language" element={<VivaLanguagePage />} />
          <Route path="/category/:abbrev" element={<SectionListPage />} />
          <Route path="/category/:abbrev/:section" element={<PacketPage />} />
          <Route path="/case/:caseId" element={<CaseViewPage />} />
        </Routes>
      </AppShell>
      <TextbookKnowledgeDrawer />
    </KnowledgeProvider>
  );
}
