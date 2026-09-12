import { ChevronLeft, ChevronRight, Clock3, Sparkles } from "lucide-react";
import { DownloadButton } from "./DownloadButton";

type PromoSlide = {
  eyebrow: string;
  title: string;
  body: string;
  offer: string;
  cta: string;
  footnote: string;
};

export function PromoBanner({ slide, index, total, onPrevious, onNext, onCta }: { slide: PromoSlide; index: number; total: number; onPrevious: () => void; onNext: () => void; onCta: () => void }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-[#083aa5] px-6 py-7 text-white shadow-[0_24px_80px_rgba(21,94,239,.18)] sm:px-10 sm:py-9 lg:min-h-[280px] lg:px-12">
      <div className="absolute inset-0 -z-10 bg-[url('/manus-storage/vexsa-event-hero_d665b161.jpg')] bg-cover bg-[center_right] opacity-80 mix-blend-screen" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#062d88] via-[#083aa5]/85 to-transparent" />
      <div className="absolute -right-16 -top-24 -z-10 size-72 rounded-full bg-[#f7d51d]/20 blur-3xl" />
      <div className="relative max-w-[650px]">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#f7d51d]">
          <Sparkles className="size-4" />
          {slide.eyebrow}
        </div>
        <h2 className="max-w-xl font-display text-3xl font-bold leading-[1.04] tracking-[-.045em] sm:text-5xl">{slide.title}</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-blue-100 sm:text-[15px]">{slide.body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <DownloadButton label={slide.cta} variant="yellow" onClick={onCta} />
          <span className="flex items-center gap-2 text-xs text-blue-100"><Clock3 className="size-4 text-[#f7d51d]" /> {slide.footnote}</span>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 hidden text-right sm:block lg:right-10">
        <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-blue-200">Valeur du pack</span>
        <span className="font-display text-5xl font-bold tracking-[-.06em] text-[#f7d51d]">{slide.offer}</span>
      </div>
      <div className="absolute bottom-5 right-5 flex items-center gap-2 sm:bottom-7 sm:right-10">
        <button type="button" onClick={onPrevious} aria-label="Promotion précédente" className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"><ChevronLeft className="size-4" /></button>
        <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-white/15">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <button type="button" onClick={onNext} aria-label="Promotion suivante" className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"><ChevronRight className="size-4" /></button>
      </div>
    </section>
  );
}
