import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryCard } from "../components/home/CategoryCard";
import { ManagementFormula } from "../components/home/ManagementFormula";
import { ChevronDown, ChevronUp, BookOpen, Zap, ListTree, MessageSquare } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  abbreviation: string;
  caseCount: number;
  examSection: string;
}

function SectionGateway({
  title,
  subtitle,
  icon: Icon,
  accent,
  accentBg,
  accentBorder,
  categories,
  defaultOpen,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
  accentBorder: string;
  categories: Category[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const totalCases = categories.reduce((sum, c) => sum + c.caseCount, 0);

  return (
    <div className={`rounded-2xl border-2 ${accentBorder} overflow-hidden`}>
      {/* Gateway header — click to toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-4 px-6 py-5 ${accentBg} hover:brightness-95 transition-all text-left`}
      >
        <div className={`p-3 rounded-xl bg-white/70 ${accent}`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            {categories.length} categories · {totalCases} cases
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <div className={`p-2 rounded-lg bg-white/60 ${accent}`}>
          {open ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Category grid — collapsible */}
      {open && (
        <div className="px-5 pb-5 pt-4 bg-white border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...categories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((cat) => (
                <CategoryCard
                  key={cat._id}
                  name={cat.name}
                  abbreviation={cat.abbreviation}
                  caseCount={cat.caseCount}
                  examSection={cat.examSection}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const categories = useQuery(api.categories.list);

  if (categories === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  const longCases = categories.filter((c) => c.examSection === "long");
  const rapidCases = categories.filter((c) => c.examSection === "rapid");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FRCR 2B Case Study</h1>
        <p className="text-gray-500 mt-1">Select a section to begin studying</p>
      </div>

      {/* Long Cases */}
      <SectionGateway
        title="Long Cases"
        subtitle="Full reporting format — findings, interpretation, diagnosis, differentials, management"
        icon={BookOpen}
        accent="text-teal-700"
        accentBg="bg-teal-50"
        accentBorder="border-teal-200"
        categories={longCases}
        defaultOpen={true}
      />

      <ManagementFormula />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 3 Differentials */}
        <Link
          to="/differentials"
          className="block rounded-2xl border-2 border-violet-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4 px-6 py-5 bg-violet-50 h-full">
            <div className="p-3 rounded-xl bg-white/70 text-violet-700">
              <ListTree className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Differentials & Mnemonics</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                325 O'Brien patterns & 50 mnemonics
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Master the top 3 differentials and high-yield memory aids for the exam
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/60 text-violet-700">
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </div>
          </div>
        </Link>

        {/* Viva Language */}
        <Link
          to="/language"
          className="block rounded-2xl border-2 border-indigo-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4 px-6 py-5 bg-indigo-50 h-full">
            <div className="p-3 rounded-xl bg-white/70 text-indigo-700">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Viva Language (2B)</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                50 professional scripts & frameworks
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Structured scripts for openings, recovery, safety netting, and specialty cases
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/60 text-indigo-700">
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </div>
          </div>
        </Link>
      </div>

      {/* Rapid Cases */}
      <SectionGateway
        title="Rapid Reporting"
        subtitle="High-speed pattern recognition — key finding, diagnosis, and exam pearl"
        icon={Zap}
        accent="text-amber-700"
        accentBg="bg-amber-50"
        accentBorder="border-amber-200"
        categories={rapidCases}
        defaultOpen={true}
      />
    </div>
  );
}
