import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, BarChart3, CheckCircle2, CloudUpload, Eye, FileImage, FileUp, Github, Globe2, ImagePlus, Loader2, LogOut, PackagePlus, Plus, RefreshCw, ShieldCheck, Sparkles, Trash2, TrendingUp, UserRound, X } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, type CommunityApp, type CommunityAsset } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { deleteOwnedApp } from "@/lib/supabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const categories = ["B2B", "Productivité", "Finance", "Design", "Éducation", "Services", "Autre"];
const bucket = "app-assets";

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function uploadPublicFile(userId: string, appId: string, file: File, kind: CommunityAsset["kind"]) {
  if (!supabase) throw new Error("Supabase n’est pas configuré");
  const path = `${userId}/${appId}/${kind}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) throw uploadError;
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const { data: asset, error: assetError } = await supabase.from("app_assets").insert({ app_id: appId, owner_id: userId, kind, file_name: file.name, storage_path: path, public_url: publicData.publicUrl, mime_type: file.type || "application/octet-stream", size_bytes: file.size }).select().single();
  if (assetError) throw assetError;
  return { asset: asset as CommunityAsset, url: publicData.publicUrl };
}

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, signOut } = useSupabaseAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [apps, setApps] = useState<CommunityApp[]>([]);
  const [assets, setAssets] = useState<CommunityAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showPublisher, setShowPublisher] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "Productivité", version: "1.0.0", downloadUrl: "" });
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [appPendingDeletion, setAppPendingDeletion] = useState<CommunityApp | null>(null);
  const [deletingApp, setDeletingApp] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Créateur";
  const totalViews = useMemo(() => apps.reduce((sum, app) => sum + Number(app.views_count || 0), 0), [apps]);
  const totalDownloads = useMemo(() => apps.reduce((sum, app) => sum + Number(app.downloads_count || 0), 0), [apps]);
  const engagement = totalViews ? `${Math.round((totalDownloads / totalViews) * 100)}%` : "—";

  const loadDashboard = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    const [{ data: appData, error: appError }, { data: assetData, error: assetError }] = await Promise.all([
      supabase.from("apps").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("app_assets").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (appError || assetError) toast.error("Impossible de charger votre espace", { description: appError?.message || assetError?.message });
    setApps((appData ?? []) as CommunityApp[]);
    setAssets((assetData ?? []) as CommunityAsset[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setApps([]);
      setAssets([]);
      setLoading(false);
      return;
    }
    void loadDashboard();
  }, [user?.id]);

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !user) return;
    if (!downloadFile && !form.downloadUrl.trim()) {
      toast.error("Ajoutez un téléchargement", { description: "Choisissez un fichier ou renseignez un lien public." });
      return;
    }
    setPublishing(true);
    const slug = `${form.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 6)}`;
    const { data: created, error: createError } = await supabase.from("apps").insert({ owner_id: user.id, slug, name: form.name.trim(), description: form.description.trim(), category: form.category, version: form.version.trim(), published_at: null, download_url: form.downloadUrl.trim() || null, download_kind: downloadFile ? "storage" : "link" }).select().single();
    if (createError || !created) {
      setPublishing(false);
      toast.error("Publication impossible", { description: createError?.message || "Application invalide" });
      return;
    }

    try {
      let downloadUrl = form.downloadUrl.trim() || null;
      if (downloadFile) downloadUrl = (await uploadPublicFile(user.id, created.id, downloadFile, "apk")).url;
      let iconUrl: string | null = null;
      if (iconFile) iconUrl = (await uploadPublicFile(user.id, created.id, iconFile, "icon")).url;
      for (const screenshot of screenshotFiles.slice(0, 6)) await uploadPublicFile(user.id, created.id, screenshot, "screenshot");
      const { error: updateError } = await supabase.from("apps").update({ download_url: downloadUrl, icon_url: iconUrl, published_at: new Date().toISOString() }).eq("id", created.id).eq("owner_id", user.id);
      if (updateError) throw updateError;
      toast.success("Application publiée", { description: "Elle est désormais visible dans le catalogue public." });
      setForm({ name: "", description: "", category: "Productivité", version: "1.0.0", downloadUrl: "" });
      setDownloadFile(null);
      setIconFile(null);
      setScreenshotFiles([]);
      setShowPublisher(false);
      await loadDashboard();
    } catch (error) {
      toast.error("Assets non finalisés", { description: error instanceof Error ? error.message : "Réessayez avec des fichiers plus légers." });
    } finally {
      setPublishing(false);
    }
  };

  const confirmDeleteApp = async () => {
    if (!appPendingDeletion) return;
    setDeletingApp(true);
    try {
      await deleteOwnedApp(appPendingDeletion.id);
      toast.success("Application supprimée", { description: "Les fichiers associés ont également été supprimés." });
      setAppPendingDeletion(null);
      await loadDashboard();
    } catch (error) {
      toast.error("Suppression impossible", { description: error instanceof Error ? error.message : "Réessayez plus tard." });
    } finally {
      setDeletingApp(false);
    }
  };

  const handleDownload = async (app: CommunityApp) => {
    if (!user) {
      setAuthOpen(true);
      toast.info("Connectez-vous pour télécharger", { description: "L’inscription est gratuite et prend moins d’une minute." });
      return;
    }
    try {
      await supabase?.rpc("record_app_event", { target_app_id: app.id, kind: "download" });
    } finally {
      if (app.download_url) window.open(app.download_url, "_blank", "noopener,noreferrer");
    }
  };

  if (authLoading || loading && isAuthenticated) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-[#155eef]"><Loader2 className="size-6 animate-spin" /></div>;
  if (!isAuthenticated) return <><div className="min-h-screen bg-[#f7f8fa] px-4 py-20"><div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_25px_80px_rgba(16,24,40,.08)] ring-1 ring-[#eaecf0] sm:p-12"><div className="mx-auto flex size-16 items-center justify-center rounded-[20px] bg-[#e9f0ff] text-[#155eef]"><ShieldCheck className="size-8" /></div><p className="mt-7 text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Espace communauté</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.07em] text-[#0b1428]">Votre hub de publication.</h1><p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#667085]">Publiez vos apps, suivez leur impact et téléchargez les solutions partagées par la communauté Vexsa.</p><Button onClick={() => setAuthOpen(true)} className="mt-8 h-12 rounded-full bg-[#155eef] px-6 font-semibold text-white hover:bg-[#0d4cc9]"><UserRound className="mr-2 size-4" /> Se connecter ou s’inscrire</Button><a href="/" className="mt-5 block text-sm font-semibold text-[#667085] hover:text-[#155eef]">Retour au catalogue</a></div></div><AuthDialog open={authOpen} onOpenChange={setAuthOpen} /></>;

  return <div className="min-h-screen bg-[#f7f8fa] text-[#101828]"><header className="border-b border-[#e4e7ec] bg-white"><div className="container flex min-h-[78px] items-center justify-between gap-4"><a href="/" className="flex items-center gap-2.5"><img src="/manus-storage/vexsa-store-logo-transparent_8c0914f8.png" alt="VEXSA-STORE" className="h-11 w-[118px] object-contain" /></a><div className="flex items-center gap-3"><ThemeToggle compact /><div className="hidden items-center gap-2 rounded-full bg-[#f7f8fa] px-3 py-2 text-sm text-[#475467] sm:flex"><span className="flex size-7 items-center justify-center rounded-full bg-[#155eef] text-xs font-bold text-white">{displayName.slice(0, 1).toUpperCase()}</span>{displayName}</div><Button variant="outline" onClick={async () => { await signOut(); window.location.href = "/"; }} className="rounded-full border-[#e4e7ec] bg-white"><LogOut className="mr-2 size-4" /> Déconnexion</Button></div></div></header><main className="container py-10 sm:py-14"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Bonjour, {displayName}</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.07em] text-[#0b1428] sm:text-5xl">Votre espace créateur.</h1><p className="mt-3 max-w-xl text-base leading-7 text-[#667085]">Publiez, mesurez et faites découvrir vos solutions à toute la communauté.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void loadDashboard()} className="h-11 rounded-full border-[#e4e7ec] bg-white px-4 font-semibold text-[#344054] hover:border-[#155eef]/30 hover:text-[#155eef]"><RefreshCw className="mr-2 size-4" /> Actualiser</Button><Button onClick={() => setShowPublisher((value) => !value)} className="h-11 rounded-full bg-[#0b1428] px-5 font-semibold text-white hover:bg-[#182845]"><Plus className="mr-2 size-4" /> {showPublisher ? "Fermer l’éditeur" : "Publier une app"}</Button></div></div><section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={<PackagePlus className="size-5" />} label="Applications publiées" value={String(apps.length)} tone="blue" /><MetricCard icon={<Eye className="size-5" />} label="Vues totales" value={String(totalViews)} tone="violet" /><MetricCard icon={<ArrowDownToLine className="size-5" />} label="Téléchargements" value={String(totalDownloads)} tone="yellow" /><MetricCard icon={<TrendingUp className="size-5" />} label="Engagement" value={engagement} tone="green" /></section>{showPublisher && <section className="mt-7 rounded-[28px] bg-white p-6 shadow-[0_15px_50px_rgba(16,24,40,.07)] ring-1 ring-[#eaecf0] sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Nouvelle publication</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.05em] text-[#0b1428]">Présentez votre application</h2><p className="mt-2 text-sm leading-6 text-[#667085]">Les champs marqués sont visibles dans le catalogue public. Les images sont stockées dans le bucket Supabase privé/public contrôlé par RLS.</p></div><button type="button" onClick={() => setShowPublisher(false)} className="flex size-9 items-center justify-center rounded-full bg-[#f7f8fa] text-[#667085]"><X className="size-4" /></button></div><form className="mt-7 grid gap-5 lg:grid-cols-2" onSubmit={handlePublish}><label className="block text-sm font-semibold text-[#344054]">Titre<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 h-11 w-full rounded-xl border-0 bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="Mon application" /></label><label className="block text-sm font-semibold text-[#344054]">Version<input required value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} className="mt-2 h-11 w-full rounded-xl border-0 bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="1.0.0" /></label><label className="block text-sm font-semibold text-[#344054]">Catégorie<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 h-11 w-full rounded-xl border-0 bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="block text-sm font-semibold text-[#344054]">Lien de téléchargement <span className="font-normal text-[#98a2b3]">(ou fichier)</span><input type="url" value={form.downloadUrl} onChange={(event) => setForm({ ...form, downloadUrl: event.target.value })} className="mt-2 h-11 w-full rounded-xl border-0 bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="https://…" /></label><label className="block text-sm font-semibold text-[#344054] lg:col-span-2">Description<textarea required minLength={20} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-28 w-full resize-y rounded-xl border-0 bg-[#f7f8fa] p-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="Décrivez les bénéfices et fonctionnalités…" /></label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#cfd6e3] p-4 text-sm font-semibold text-[#344054] hover:border-[#155eef]/50"><FileUp className="size-5 text-[#155eef]" /><span className="min-w-0 flex-1 truncate">{downloadFile?.name || "Fichier APK / ZIP / DMG"}<small className="mt-1 block text-xs font-normal text-[#98a2b3]">Le fichier sera stocké dans Supabase Storage.</small></span><input type="file" accept=".apk,.zip,.dmg,.exe" onChange={(event) => setDownloadFile(event.target.files?.[0] || null)} className="sr-only" /></label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#cfd6e3] p-4 text-sm font-semibold text-[#344054] hover:border-[#155eef]/50"><ImagePlus className="size-5 text-[#155eef]" /><span className="min-w-0 flex-1 truncate">{iconFile?.name || "Icône de l’application"}<small className="mt-1 block text-xs font-normal text-[#98a2b3]">PNG, JPG ou WEBP.</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setIconFile(event.target.files?.[0] || null)} className="sr-only" /></label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#cfd6e3] p-4 text-sm font-semibold text-[#344054] lg:col-span-2 hover:border-[#155eef]/50"><FileImage className="size-5 text-[#155eef]" /><span className="min-w-0 flex-1 truncate">{screenshotFiles.length ? `${screenshotFiles.length} capture(s) sélectionnée(s)` : "Captures d’écran (jusqu’à 6)"}<small className="mt-1 block text-xs font-normal text-[#98a2b3]">Montrez l’expérience avant le téléchargement.</small></span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setScreenshotFiles(Array.from(event.target.files || []).slice(0, 6))} className="sr-only" /></label><div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2"><p className="flex items-center gap-2 text-xs text-[#667085]"><ShieldCheck className="size-4 text-[#079455]" /> Publication visible immédiatement après validation.</p><Button disabled={publishing} type="submit" className="h-11 rounded-full bg-[#155eef] px-6 font-semibold text-white hover:bg-[#0d4cc9]">{publishing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CloudUpload className="mr-2 size-4" />} Publier l’application</Button></div></form></section>}<section className="mt-8"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Suivi manuel</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.05em] text-[#0b1428]">Vos applications</h2></div><span className="text-xs font-semibold text-[#98a2b3]">Actualisation uniquement sur demande</span></div>{apps.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{apps.map((app) => <article key={app.id} className="rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(16,24,40,.05)] ring-1 ring-[#eaecf0]"><div className="flex items-start gap-4"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#e9f0ff] text-[#155eef]">{app.icon_url ? <img src={app.icon_url} alt="" className="h-full w-full object-cover" /> : <PackagePlus className="size-6" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-display text-xl font-bold tracking-[-.04em] text-[#0b1428]">{app.name}</h3><p className="mt-1 text-xs font-semibold text-[#98a2b3]">{app.category} · v{app.version}</p></div><span className="rounded-full bg-[#e5f8ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#087443]">Publié</span></div><p className="mt-3 text-sm leading-6 text-[#667085]">{app.description}</p></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#f0f2f5] pt-4"><Stat label="Vues" value={app.views_count} icon={<Eye className="size-3.5" />} /><Stat label="Téléchargements" value={app.downloads_count} icon={<ArrowDownToLine className="size-3.5" />} /><Stat label="Captures" value={assets.filter((asset) => asset.app_id === app.id && asset.kind === "screenshot").length} icon={<ImagePlus className="size-3.5" />} /></div><button type="button" onClick={() => setAppPendingDeletion(app)} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#b42318] transition hover:text-[#912018]"><Trash2 className="size-3.5" /> Supprimer définitivement</button></article>)}</div> : <div className="mt-5 rounded-[24px] bg-white px-6 py-14 text-center ring-1 ring-[#eaecf0]"><PackagePlus className="mx-auto size-8 text-[#155eef]" /><h3 className="mt-4 font-display text-xl font-bold tracking-[-.04em]">Votre première publication vous attend.</h3><p className="mt-2 text-sm text-[#667085]">Présentez une application et commencez à suivre son engagement.</p><Button onClick={() => setShowPublisher(true)} className="mt-5 rounded-full bg-[#0b1428] text-white hover:bg-[#182845]"><Plus className="mr-2 size-4" /> Publier une app</Button></div>}</section></main><AlertDialog open={Boolean(appPendingDeletion)} onOpenChange={(open) => { if (!open && !deletingApp) setAppPendingDeletion(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette application ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est définitive. L’application et tous ses fichiers associés seront supprimés du catalogue.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletingApp}>Annuler</AlertDialogCancel>
          <AlertDialogAction disabled={deletingApp} onClick={(event) => { event.preventDefault(); void confirmDeleteApp(); }} className="bg-[#b42318] text-white hover:bg-[#912018]">{deletingApp ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />} Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog></div>;
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "blue" | "violet" | "yellow" | "green" }) {
  const tones = { blue: "bg-[#e9f0ff] text-[#155eef]", violet: "bg-[#f0ebff] text-[#6c43c4]", yellow: "bg-[#fff5b8] text-[#8a6900]", green: "bg-[#e5f8ef] text-[#087443]" };
  return <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_30px_rgba(16,24,40,.04)] ring-1 ring-[#eaecf0]"><div className={`flex size-10 items-center justify-center rounded-[13px] ${tones[tone]}`}>{icon}</div><p className="mt-4 text-xs font-semibold text-[#667085]">{label}</p><p className="mt-1 font-display text-3xl font-bold tracking-[-.06em] text-[#0b1428]">{value}</p></div>;
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div><p className="flex items-center gap-1 text-[11px] font-semibold text-[#98a2b3]">{icon}{label}</p><p className="mt-1 text-lg font-bold text-[#344054]">{value}</p></div>;
}
