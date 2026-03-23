import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-teal-700 font-semibold text-lg">
            <Stethoscope className="w-6 h-6" />
            RadQuiz
          </Link>
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/differentials"
              className="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50"
            >
              Top 3 DDx
            </Link>
            <Link
              to="/dahnert"
              className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50"
            >
              Dahnert
            </Link>
            <Link
              to="/dahnert-ddx"
              className="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50"
            >
              DDx Clusters
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
