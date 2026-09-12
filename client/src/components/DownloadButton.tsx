import { ArrowUpRight, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type DownloadButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "dark" | "yellow" | "ghost";
  compact?: boolean;
};

export function DownloadButton({ label, onClick, variant = "primary", compact = false }: DownloadButtonProps) {
  const Icon = label.toLowerCase().includes("télécharger") ? Download : label.toLowerCase().includes("ouvrir") ? ExternalLink : ArrowUpRight;
  const styles = {
    primary: "bg-[#155eef] text-white shadow-[0_10px_24px_rgba(21,94,239,.22)] hover:bg-[#0d4cc9]",
    dark: "bg-[#0b1428] text-white shadow-[0_10px_24px_rgba(11,20,40,.16)] hover:bg-[#182845]",
    yellow: "bg-[#f7d51d] text-[#0b1428] shadow-[0_10px_24px_rgba(247,213,29,.22)] hover:bg-[#ffe45c]",
    ghost: "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20",
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      className={`group rounded-full font-semibold transition-all duration-200 active:scale-[.97] ${compact ? "h-9 px-3 text-[12px]" : "h-11 px-4 text-sm"} ${styles[variant]}`}
    >
      {label}
      <Icon className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Button>
  );
}
