import { ArrowUpRight, Star } from "lucide-react";
import type { ReactNode } from "react";
import { DownloadButton } from "./DownloadButton";

export type StoreApp = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  badge: string;
  badgeTone: "yellow" | "blue" | "green" | "violet";
  action: string;
  accent: string;
  icon: ReactNode;
  rating: string;
  downloads: string;
  featured?: boolean;
  features: string[];
  version: string;
  downloadUrl?: string | null;
  supportContact?: string | null;
  source?: "demo" | "community";
};

const badgeStyles = {
  yellow: "bg-[#fff5b8] text-[#8a6900]",
  blue: "bg-[#e9f0ff] text-[#155eef]",
  green: "bg-[#e5f8ef] text-[#087443]",
  violet: "bg-[#f0ebff] text-[#6c43c4]",
};

export function AppCard({ app, onOpen }: { app: StoreApp; onOpen: (app: StoreApp) => void }) {
  return (
    <article className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(16,24,40,.05)] ring-1 ring-[#eaecf0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,24,40,.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-[18px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22)] ${app.accent}`}>
          {app.icon}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${badgeStyles[app.badgeTone]}`}>{app.badge}</span>
      </div>
      <div className="mt-5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#98a2b3]">{app.category}</p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-[-.04em] text-[#101828]">{app.name}</h3>
          </div>
          <button type="button" aria-label={`Ouvrir ${app.name}`} onClick={() => onOpen(app)} className="flex size-8 items-center justify-center rounded-full text-[#98a2b3] transition hover:bg-[#f4f7fb] hover:text-[#155eef]"><ArrowUpRight className="size-4" /></button>
        </div>
        <p className="mt-2 max-w-[280px] text-sm leading-5 text-[#667085]">{app.description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f0f2f5] pt-4">
        <div className="flex items-center gap-3 text-xs font-medium text-[#98a2b3]">
          <span className="flex items-center gap-1 text-[#667085]"><Star className="size-3.5 fill-[#f7d51d] text-[#f7d51d]" /> {app.rating}</span>
          <span>{app.downloads}</span>
        </div>
        <DownloadButton label={app.action} compact variant={app.action === "Télécharger APK" ? "dark" : "primary"} onClick={() => onOpen(app)} />
      </div>
    </article>
  );
}
