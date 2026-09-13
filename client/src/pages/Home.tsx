import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Download,
  ExternalLink,
  Headphones,
  LineChart,
  Menu,
  MessageCircle,
  Moon,
  PackageSearch,
  PlayCircle,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AppCard, type StoreApp } from "@/components/AppCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { DownloadButton } from "@/components/DownloadButton";
import { PromoBanner } from "@/components/PromoBanner";
import { AuthDialog } from "@/components/AuthDialog";
import { ADMIN_EMAIL, fetchPublicApps, recordAppEvent } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

const categories = ["Toutes", "B2B", "Matériaux", "Outillage", "Services"];

const demoApps: StoreApp[] = [
  {
    id: "vexsa-pro",
    name: "Vexsa Pro",
    shortName: "VP",
    description: "La suite opérationnelle pour piloter vos chantiers et équipes terrain.",
    category: "B2B",
    badge: "-50% ce mois",
    badgeTone: "yellow",
    action: "Ouvrir l'App",
    accent: "bg-[#155eef]",
    icon: <BriefcaseBusiness className="size-7" strokeWidth={1.8} />,
    rating: "4.9",
    downloads: "12k+ installs",
    featured: true,
    features: ["Planning partagé en temps réel", "Suivi des équipes terrain", "Rapports d’activité automatisés"],
    version: "v3.8.2",
  },
  {
    id: "vexsa-stock",
    name: "Vexsa Stock",
    shortName: "VS",
    description: "Stocks, livraisons et réassorts enfin visibles au même endroit.",
    category: "Matériaux",
    badge: "Nouveau",
    badgeTone: "blue",
    action: "Découvrir",
    accent: "bg-[#0b1428]",
    icon: <Boxes className="size-7" strokeWidth={1.8} />,
    rating: "4.8",
    downloads: "4.6k+ installs",
    features: ["Inventaire multi-dépôts", "Alertes de seuil", "Scan QR code produits"],
    version: "v1.4.0",
  },
  {
    id: "vexsa-tools",
    name: "Vexsa Tools",
    shortName: "VT",
    description: "Réservez, localisez et partagez votre parc d’outillage.",
    category: "Outillage",
    badge: "Accès Bêta Event",
    badgeTone: "violet",
    action: "Accéder",
    accent: "bg-[#6d4aff]",
    icon: <Wrench className="size-7" strokeWidth={1.8} />,
    rating: "4.7",
    downloads: "2.8k+ installs",
    features: ["Disponibilité des outils", "Réservation par équipe", "Historique maintenance"],
    version: "v0.9.6 beta",
  },
  {
    id: "vexsa-flow",
    name: "Vexsa Flow",
    shortName: "VF",
    description: "Centralisez demandes, devis et validations sans friction.",
    category: "Services",
    badge: "Populaire",
    badgeTone: "green",
    action: "Ouvrir l'App",
    accent: "bg-[#079455]",
    icon: <LineChart className="size-7" strokeWidth={1.8} />,
    rating: "4.9",
    downloads: "8.2k+ installs",
    features: ["Workflow personnalisable", "Validation en un clic", "Historique client complet"],
    version: "v2.6.1",
  },
  {
    id: "vexsa-inspect",
    name: "Vexsa Inspect",
    shortName: "VI",
    description: "Transformez vos contrôles qualité en actions concrètes.",
    category: "B2B",
    badge: "Événement",
    badgeTone: "yellow",
    action: "Télécharger APK",
    accent: "bg-[#ee7b21]",
    icon: <ShieldCheck className="size-7" strokeWidth={1.8} />,
    rating: "4.8",
    downloads: "3.1k+ installs",
    features: ["Checklists terrain", "Photos horodatées", "Export de rapports PDF"],
    version: "v2.1.3",
  },
  {
    id: "vexsa-connect",
    name: "Vexsa Connect",
    shortName: "VC",
    description: "Le support et les services Vexsa à portée de main.",
    category: "Services",
    badge: "24/7",
    badgeTone: "blue",
    action: "Découvrir",
    accent: "bg-[#1296e8]",
    icon: <Headphones className="size-7" strokeWidth={1.8} />,
    rating: "4.8",
    downloads: "6.4k+ installs",
    features: ["Support prioritaire", "Suivi des demandes", "Base de connaissances"],
    version: "v1.8.4",
  },
];

const promoSlides = [
  {
    eyebrow: "Pack événement · jusqu’au 30 sept.",
    title: "Le terrain avance. Vos apps aussi.",
    body: "Découvrez le pack Opérations : Vexsa Pro, Stock et Inspect réunis pour accélérer chaque journée de chantier.",
    offer: "−50%",
    cta: "Découvrir le pack",
    footnote: "Offre réservée aux visiteurs",
  },
  {
    eyebrow: "Nouveau · Vexsa Tools beta",
    title: "Votre parc d’outillage, sans zone grise.",
    body: "Activez l’accès bêta et donnez à vos équipes une visibilité instantanée sur les outils disponibles.",
    offer: "BÊTA",
    cta: "Rejoindre la bêta",
    footnote: "Places limitées pour l’event",
  },
  {
    eyebrow: "Offre équipe · activation express",
    title: "Un seul store. Toute votre organisation.",
    body: "Constituez votre stack Vexsa en quelques minutes et profitez d’un onboarding équipe accompagné.",
    offer: "3 → 1",
    cta: "Voir les offres",
    footnote: "Activation en moins de 10 min",
  },
];

function supportHref(contact?: string | null) {
  const value = contact?.trim();
  if (!value) return "https://wa.me/22871338887?text=Bonjour%20Vexsa%2C%20j%27aimerais%20%C3%AAtre%20accompagn%C3%A9";
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value;
  if (value.includes("@")) return `mailto:${value}`;
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 8) return `https://wa.me/${digits}`;
  return `https://${value}`;
}

function remoteToApp(row: { id?: string | number; name: string; description?: string | null; category?: string | null; badge?: string | null; action?: string | null; icon?: string | null; accent?: string | null; rating?: string | null; downloads?: string | null; downloads_count?: number | null; download_url?: string | null; support_contact?: string | null; version?: string | null }): StoreApp {
  const Icon = row.icon === "boxes" ? Boxes : row.icon === "wrench" ? Wrench : row.icon === "chart" ? LineChart : row.icon === "shield" ? ShieldCheck : BriefcaseBusiness;
  return {
    ...demoApps[0],
    id: String(row.id ?? row.name.toLowerCase().replaceAll(" ", "-")),
    name: row.name,
    shortName: row.name.slice(0, 2).toUpperCase(),
    description: row.description || "Une solution Vexsa pensée pour vos équipes.",
    category: row.category || "Services",
    badge: row.badge || "Vexsa",
    action: row.action || "Découvrir",
    accent: row.accent || "bg-[#155eef]",
    icon: <Icon className="size-7" strokeWidth={1.8} />,
    rating: row.rating || "4.8",
    downloads: row.downloads || (row.downloads_count ? `${row.downloads_count} téléchargements` : "Nouveau"),
    downloadUrl: row.download_url || null,
    supportContact: row.support_contact || null,
    source: "community",
  };
}

export default function Home() {
  const { user, isAuthenticated, signOut } = useSupabaseAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [apps, setApps] = useState<StoreApp[]>(demoApps);
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [query, setQuery] = useState("");
  const [promoIndex, setPromoIndex] = useState(0);
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityApps, setCommunityApps] = useState<StoreApp[]>([]);
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Compte";

  useEffect(() => {
    fetchPublicApps()
      .then((rows) => {
        const mapped = rows.map(remoteToApp);
        setCommunityApps(mapped);
        if (mapped.length) setApps(mapped);
      })
      .catch(() => undefined);
  }, []);

  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCategory = activeCategory === "Toutes" || app.category === activeCategory;
      const matchesQuery = !normalizedQuery || `${app.name} ${app.description} ${app.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, apps, query]);

  const openApp = async (app: StoreApp) => {
    setSelectedApp(app);
    if (user && app.source === "community") {
      await recordAppEvent(app.id, "view").catch(() => undefined);
    }
  };

  const handlePrimaryAction = () => {
    toast.success("Votre sélection est prête", { description: "La prochaine étape d’activation sera bientôt disponible." });
  };

  const handleSelectedDownload = async () => {
    if (!selectedApp) return;
    if (!isAuthenticated) {
      setAuthMode("signin");
      setAuthOpen(true);
      toast.info("Connectez-vous pour télécharger", { description: "L’inscription est gratuite et ouverte à toute la communauté." });
      return;
    }
    if (selectedApp.downloadUrl) {
      await recordAppEvent(selectedApp.id, "download").catch(() => undefined);
      window.open(selectedApp.downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("Lien de téléchargement indisponible", { description: "Cette app de démonstration sera bientôt distribuée." });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-[#101828]">
      <div className="border-b border-[#edf0f4] bg-white text-center text-[11px] font-semibold tracking-[.08em] text-[#667085]">
        <div className="container flex min-h-9 items-center justify-center gap-2"><Sparkles className="size-3.5 text-[#f7c900]" /> <span>VEXSA EVENT 2026</span><span className="hidden text-[#98a2b3] sm:inline">·</span><span className="hidden font-normal sm:inline">Le store officiel de l’écosystème Vexsa</span></div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#edf0f4]/90 bg-white/95 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center gap-4">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="Vexsa Store, accueil">
            <img src="/manus-storage/vexsa-store-logo-transparent_8c0914f8.png" alt="VEXSA-STORE" className="h-11 w-[118px] object-contain" />
          </a>

          <nav className="ml-6 hidden items-center gap-6 text-sm font-semibold text-[#667085] lg:flex" aria-label="Navigation principale">
            <a className="text-[#0b1428]" href="#catalogue">Catalogue</a>
            <a className="transition hover:text-[#155eef]" href="#packs">Packs & promos</a>
            <a className="transition hover:text-[#155eef]" href="#support">Support</a>
          </nav>

          <div className="ml-auto hidden w-full max-w-[330px] md:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une application…" className="h-11 w-full rounded-full bg-[#f6f8fb] pl-10 pr-4 text-sm text-[#101828] outline-none ring-1 ring-transparent transition placeholder:text-[#98a2b3] focus:bg-white focus:ring-[#155eef]/35" />
            </label>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <ThemeToggle compact />
            {isAuthenticated ? <><a href="/dashboard" className="flex items-center gap-2 rounded-full border border-[#e4e7ec] px-3 py-2 text-sm font-semibold text-[#344054] transition hover:border-[#155eef]/30 hover:text-[#155eef]"><span className="flex size-6 items-center justify-center rounded-full bg-[#155eef] text-[10px] font-bold text-white">{displayName.slice(0, 1).toUpperCase()}</span>{displayName}</a>{user?.email?.toLowerCase() === ADMIN_EMAIL && <a href="/admin" className="rounded-full bg-[#0b1428] px-3 py-2 text-xs font-bold text-white hover:bg-[#182845]">Admin</a>}<button type="button" onClick={() => void signOut()} className="rounded-full px-3 py-2 text-sm font-semibold text-[#667085] hover:bg-[#f7f8fa] hover:text-[#0b1428]">Sortir</button></> : <><button type="button" onClick={() => { setAuthMode("signin"); setAuthOpen(true); }} className="rounded-full px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-[#f7f8fa]">Connexion</button><button type="button" onClick={() => { setAuthMode("signup"); setAuthOpen(true); }} className="rounded-full bg-[#155eef] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(21,94,239,.18)] hover:bg-[#0d4cc9]">Inscription</button></>}
          </div>
          <span className="sm:hidden"><ThemeToggle compact /></span>
          <button type="button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen((value) => !value)} className="flex size-10 items-center justify-center rounded-full bg-[#f6f8fb] text-[#344054] md:hidden">{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
        {menuOpen && <div className="container border-t border-[#edf0f4] pb-4 pt-3 md:hidden"><div className="mb-3"><label className="relative block"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une application…" className="h-11 w-full rounded-full bg-[#f6f8fb] pl-10 pr-4 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" /></label></div><nav className="flex items-center gap-5 text-sm font-semibold text-[#667085]"><a href="#catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a><a href="#packs" onClick={() => setMenuOpen(false)}>Packs & promos</a><a href="#support" onClick={() => setMenuOpen(false)}>Support</a></nav><div className="mt-4 flex gap-2">{isAuthenticated ? <a href="/dashboard" className="rounded-full border border-[#e4e7ec] px-3 py-2 text-sm font-semibold text-[#344054]">Mon dashboard</a> : <><button type="button" onClick={() => { setAuthMode("signin"); setAuthOpen(true); setMenuOpen(false); }} className="rounded-full border border-[#e4e7ec] px-3 py-2 text-sm font-semibold text-[#344054]">Connexion</button><button type="button" onClick={() => { setAuthMode("signup"); setAuthOpen(true); setMenuOpen(false); }} className="rounded-full bg-[#155eef] px-3 py-2 text-sm font-semibold text-white">Inscription</button></>}</div></div>}
      </header>

      <main id="top">
        <section className="container pt-10 sm:pt-14 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e9f0ff] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#155eef]"><span className="size-1.5 rounded-full bg-[#155eef]" /> La plateforme officielle Vexsa</div>
              <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] font-bold leading-[.9] tracking-[-.075em] text-[#0b1428]">Tout Vexsa.<br /><span className="text-[#155eef]">En un geste.</span></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#667085] sm:text-lg">Le catalogue centralisé des solutions qui font avancer vos équipes, vos chantiers et vos décisions.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#catalogue"><DownloadButton label="Explorer le catalogue" onClick={() => undefined} /></a>
                <button type="button" onClick={() => toast.info("Visite guidée", { description: "La démo interactive sera disponible pendant l’événement." })} className="group inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#344054] transition hover:bg-white hover:shadow-[0_8px_24px_rgba(16,24,40,.06)]"><PlayCircle className="size-5 text-[#155eef]" /> Voir la démo <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" /></button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[#667085]"><span className="flex items-center gap-2"><BadgeCheck className="size-4 text-[#079455]" /> Apps vérifiées</span><span className="flex items-center gap-2"><QrCode className="size-4 text-[#155eef]" /> Scan & accès instantané</span></div>
            </div>
            <div className="relative hidden min-h-[390px] lg:block">
              <div className="absolute right-3 top-0 h-[380px] w-[490px] overflow-hidden rounded-[34px] bg-[#0b3eac] shadow-[0_28px_70px_rgba(11,62,172,.2)]"><img src="/manus-storage/vexsa-event-hero_d665b161.jpg" alt="Univers graphique Vexsa Store" className="h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-tr from-[#07296f]/60 via-transparent to-[#155eef]/10" /></div>
              <div className="absolute -bottom-1 left-2 w-[245px] rounded-[24px] bg-white p-4 shadow-[0_18px_45px_rgba(16,24,40,.13)] ring-1 ring-[#eaecf0] animate-float"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-[14px] bg-[#155eef] text-white"><BarChart3 className="size-5" /></span><div><p className="font-display text-lg font-bold tracking-[-.04em]">+28%</p><p className="text-xs text-[#667085]">productivité moyenne</p></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eff3f8]"><div className="h-full w-[72%] rounded-full bg-[#f7d51d]" /></div></div>
              <div className="absolute right-[-18px] top-12 rounded-[18px] bg-[#f7d51d] px-4 py-3 text-[#0b1428] shadow-[0_14px_30px_rgba(16,24,40,.12)]"><p className="text-[10px] font-bold uppercase tracking-[.16em]">Live event</p><p className="mt-1 font-display text-xl font-bold tracking-[-.05em]">2026</p></div>
            </div>
          </div>
        </section>

        <section id="packs" className="container mt-16 sm:mt-20">
          <PromoBanner slide={promoSlides[promoIndex]} index={promoIndex} total={promoSlides.length} onPrevious={() => setPromoIndex((promoIndex - 1 + promoSlides.length) % promoSlides.length)} onNext={() => setPromoIndex((promoIndex + 1) % promoSlides.length)} onCta={handlePrimaryAction} />
        </section>

        <section id="catalogue" className="container py-16 sm:py-20">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]"><PackageSearch className="size-4" /> Le catalogue Vexsa</div><h2 className="font-display text-3xl font-bold tracking-[-.06em] text-[#0b1428] sm:text-4xl">Les apps qui font<br className="hidden sm:block" /> avancer le terrain.</h2></div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#667085]"><span className="size-2 rounded-full bg-[#079455]" /> {apps.length} solutions disponibles</div>
          </div>
          <div className="mt-8"><CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} /></div>
          {filteredApps.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredApps.map((app) => <AppCard key={app.id} app={app} onOpen={openApp} />)}</div> : <div className="mt-7 rounded-[24px] bg-white px-6 py-16 text-center ring-1 ring-[#eaecf0]"><CircleHelp className="mx-auto size-8 text-[#155eef]" /><h3 className="mt-4 font-display text-xl font-bold">Aucune app ne correspond</h3><p className="mt-2 text-sm text-[#667085]">Essayez une autre recherche ou revenez aux catégories principales.</p><button type="button" onClick={() => { setQuery(""); setActiveCategory("Toutes"); }} className="mt-5 text-sm font-bold text-[#155eef]">Réinitialiser les filtres</button></div>}
        </section>

        <section className="container pb-16 sm:pb-20">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
            <div className="relative overflow-hidden rounded-[26px] bg-[#0b1428] p-7 text-white sm:p-9"><div className="absolute -right-10 -top-16 size-64 rounded-full bg-[#155eef]/40 blur-3xl" /><div className="relative max-w-xl"><div className="mb-5 flex size-11 items-center justify-center rounded-[15px] bg-[#f7d51d] text-[#0b1428]"><Boxes className="size-5" /></div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#f7d51d]">Packs & promotions</p><h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-[-.055em] sm:text-4xl">Construisez votre stack Vexsa.</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#c7d2e7]">Des bundles conçus pour les événements, les équipes en croissance et les opérations qui ne peuvent pas ralentir.</p><button type="button" onClick={handlePrimaryAction} className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">Voir les packs <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></button></div></div>
            <div id="support" className="rounded-[26px] bg-[#f7d51d] p-7 text-[#0b1428] sm:p-9"><MessageCircle className="size-7" /><h3 className="mt-8 font-display text-2xl font-bold leading-tight tracking-[-.05em]">Besoin d’un accompagnement event ?</h3><p className="mt-3 text-sm leading-6 text-[#475467]">Notre équipe vous aide à choisir les bons outils pour votre activation.</p><a href="https://wa.me/22871338887?text=Bonjour%20Vexsa%2C%20j%27aimerais%20%C3%AAtre%20accompagn%C3%A9" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0b1428] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#182845]">Contacter sur WhatsApp <ExternalLink className="size-4" /></a></div>
          </div>
        </section>

        <footer className="border-t border-[#e8ebf0] bg-white"><div className="container flex flex-col gap-5 py-7 text-xs text-[#98a2b3] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-display font-bold text-[#344054]"><span className="flex size-7 items-center justify-center rounded-lg bg-[#155eef] text-[#f7d51d]"><Zap className="size-3.5 fill-current" /></span> Vexsa Store</div><div className="flex flex-wrap items-center gap-4"><span>{communityApps.length ? `${communityApps.length} app(s) publiées par la communauté` : "Catalogue communautaire prêt"}</span><span className="size-1 rounded-full bg-[#d0d5dd]" /><span>© 2026 Vexsa ecosystem</span></div></div></footer>
      </main>

      {selectedApp && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1428]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Détails de ${selectedApp.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedApp(null); }}><div className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-[0_28px_90px_rgba(11,20,40,.25)] sm:rounded-[28px] sm:p-8"><div className="flex items-start justify-between"><div className={`flex size-16 items-center justify-center rounded-[20px] text-white ${selectedApp.accent}`}>{selectedApp.icon}</div><button type="button" aria-label="Fermer" onClick={() => setSelectedApp(null)} className="flex size-9 items-center justify-center rounded-full bg-[#f6f8fb] text-[#667085] hover:text-[#0b1428]"><X className="size-4" /></button></div><p className="mt-7 text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">{selectedApp.category} · {selectedApp.version}</p><h2 className="mt-2 font-display text-4xl font-bold tracking-[-.065em] text-[#0b1428]">{selectedApp.name}</h2><p className="mt-4 text-base leading-7 text-[#667085]">{selectedApp.description}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{selectedApp.features.map((feature) => <div key={feature} className="rounded-2xl bg-[#f7f8fa] p-3 text-xs font-semibold leading-5 text-[#475467]"><BadgeCheck className="mb-2 size-4 text-[#079455]" />{feature}</div>)}</div><div className="mt-8 flex flex-wrap items-center gap-3"><DownloadButton label={selectedApp.action === "Télécharger APK" ? "Télécharger APK" : "Ouvrir l’App"} onClick={() => void handleSelectedDownload()} /><a href={supportHref(selectedApp.supportContact)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e4e7ec] px-4 text-sm font-semibold text-[#344054] transition hover:border-[#155eef]/30 hover:text-[#155eef]"><MessageCircle className="size-4" /> Parler à l’équipe</a></div><div className="mt-7 flex items-center gap-2 border-t border-[#eaecf0] pt-5 text-xs text-[#98a2b3]"><Download className="size-4" /> {selectedApp.downloads} <span className="mx-1">·</span> <span>Version stable disponible</span></div></div></div>}
      <AuthDialog key={`${authMode}-${authOpen}`} open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </div>
  );
}
