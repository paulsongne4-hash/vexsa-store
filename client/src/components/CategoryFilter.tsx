import { SlidersHorizontal } from "lucide-react";

export function CategoryFilter({ categories, active, onChange }: { categories: string[]; active: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Filtrer les applications par catégorie">
      <div className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[#155eef]">
        <SlidersHorizontal className="size-4" />
      </div>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[.97] ${active === category ? "bg-[#0b1428] text-white shadow-[0_8px_20px_rgba(11,20,40,.12)]" : "bg-white text-[#667085] ring-1 ring-[#e5e7eb] hover:bg-[#f8fafc] hover:text-[#0b1428]"}`}
          aria-pressed={active === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
