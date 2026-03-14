import { useState } from "react";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { BookOpen } from "lucide-react";

const tabs = ["Simple", "AI-Enhanced"] as const;

export function ExplanationDrawer() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Simple");

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-teal-600" />
        <h4 className="font-semibold text-gray-900">Explanation</h4>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <ContentComingSoon label={`${activeTab} explanation coming in a future update`} />
    </div>
  );
}
