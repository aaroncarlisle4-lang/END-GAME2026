import { CategoryCard } from "./CategoryCard";

interface Category {
  _id: string;
  name: string;
  abbreviation: string;
  caseCount: number;
  examSection: string;
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  // Show long cases first, then rapids
  const sorted = [...categories].sort((a, b) => {
    if (a.examSection !== b.examSection) return a.examSection === "long" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sorted.map((cat) => (
        <CategoryCard
          key={cat._id}
          name={cat.name}
          abbreviation={cat.abbreviation}
          caseCount={cat.caseCount}
          examSection={cat.examSection}
        />
      ))}
    </div>
  );
}
