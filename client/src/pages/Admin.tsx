import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, CloudUpload, FileBox, Loader2, LogIn, ShieldCheck, UploadCloud } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const MAX_UPLOAD_BYTES = 35_000_000;

export default function Admin() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const appsQuery = trpc.catalog.list.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const assetsQuery = trpc.admin.assets.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const createApp = trpc.admin.createApp.useMutation({
    onSuccess: async () => {
      await utils.catalog.list.invalidate();
      toast.success("Application créée", { description: "Elle est maintenant disponible pour recevoir ses assets." });
      setAppForm({ slug: "", name: "", description: "", category: "B2B" });
    },
    onError: (error) => toast.error("Création impossible", { description: error.message }),
  });
  const uploadAsset = trpc.admin.uploadAsset.useMutation({
    onSuccess: async () => {
      await utils.admin.assets.invalidate();
      toast.success("Fichier stocké", { description: "La référence S3 a été enregistrée dans la base." });
      setSelectedFile(null);
    },
    onError: (error) => toast.error("Upload impossible", { description: error.message }),
  });
  const [appForm, setAppForm] = useState({ slug: "", name: "", description: "", category: "B2B" });
  const [appId, setAppId] = useState("");
  const [assetType, setAssetType] = useState<"apk" | "screenshot" | "banner">("apk");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedApp = useMemo(() => appsQuery.data?.find((app) => String(app.id) === appId), [appId, appsQuery.data]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-[#155eef]"><Loader2 className="size-6 animate-spin" /></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[#f7f8fa] px-4 py-16"><div className="mx-auto max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_20px_70px_rgba(16,24,40,.08)] ring-1 ring-[#eaecf0]"><div className="mx-auto flex size-14 items-center justify-center rounded-[18px] bg-[#e9f0ff] text-[#155eef]"><ShieldCheck className="size-7" /></div><h1 className="mt-6 font-display text-3xl font-bold tracking-[-.06em] text-[#0b1428]">Accès administration</h1><p className="mt-3 text-sm leading-6 text-[#667085]">Connectez-vous avec votre compte Vexsa pour gérer le catalogue et les fichiers stockés.</p><Button type="button" onClick={startLogin} className="mt-7 h-11 rounded-full bg-[#155eef] px-5 font-semibold text-white hover:bg-[#0d4cc9]"><LogIn className="mr-2 size-4" /> Se connecter</Button><a href="/" className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#155eef]"><ArrowLeft className="size-4" /> Retour au store</a></div></div>;
  }

  if (user.role !== "admin") {
    return <div className="min-h-screen bg-[#f7f8fa] px-4 py-16"><div className="mx-auto max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_20px_70px_rgba(16,24,40,.08)] ring-1 ring-[#eaecf0]"><div className="mx-auto flex size-14 items-center justify-center rounded-[18px] bg-[#fff5b8] text-[#8a6900]"><ShieldCheck className="size-7" /></div><h1 className="mt-6 font-display text-3xl font-bold tracking-[-.06em] text-[#0b1428]">Accès limité</h1><p className="mt-3 text-sm leading-6 text-[#667085]">Votre compte est connecté, mais ne possède pas encore le rôle administrateur.</p><a href="/" className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#155eef]"><ArrowLeft className="size-4" /> Retour au store</a></div></div>;
  }

  const handleCreateApp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createApp.mutate({ ...appForm, badge: "Nouveau", action: "Découvrir", icon: "briefcase", accent: "bg-[#155eef]", version: "v1.0.0" });
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !appId) {
      toast.error("Sélection incomplète", { description: "Choisissez une application et un fichier." });
      return;
    }
    if (selectedFile.size > MAX_UPLOAD_BYTES) {
      toast.error("Fichier trop volumineux", { description: "La limite actuelle est de 35 MB pour le transfert navigateur." });
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
      reader.readAsDataURL(selectedFile);
    });
    uploadAsset.mutate({ appId: Number(appId), assetType, fileName: selectedFile.name, mimeType: selectedFile.type || "application/octet-stream", sizeBytes: selectedFile.size, dataBase64: dataUrl.split(",")[1] || "" });
  };

  return <div className="min-h-screen bg-[#f7f8fa] text-[#101828]"><header className="border-b border-[#e4e7ec] bg-white"><div className="container flex min-h-[76px] items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Vexsa Store · Admin</p><h1 className="mt-1 font-display text-2xl font-bold tracking-[-.05em] text-[#0b1428]">Gérer les assets</h1></div><a href="/" className="inline-flex items-center gap-2 rounded-full border border-[#e4e7ec] px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:border-[#155eef]/30 hover:text-[#155eef]"><ArrowLeft className="size-4" /> Retour au store</a></div></header><main className="container py-10 sm:py-14"><div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><section className="rounded-[26px] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,.05)] ring-1 ring-[#eaecf0] sm:p-8"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-[15px] bg-[#e9f0ff] text-[#155eef]"><FileBox className="size-5" /></span><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#98a2b3]">1 · Catalogue</p><h2 className="font-display text-xl font-bold tracking-[-.04em]">Ajouter une application</h2></div></div><form className="mt-7 space-y-4" onSubmit={handleCreateApp}><label className="block text-sm font-semibold text-[#344054]">Nom<input required value={appForm.name} onChange={(event) => setAppForm({ ...appForm, name: event.target.value })} className="mt-2 h-11 w-full rounded-xl bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="Vexsa Pro" /></label><label className="block text-sm font-semibold text-[#344054]">Slug<input required value={appForm.slug} onChange={(event) => setAppForm({ ...appForm, slug: event.target.value })} className="mt-2 h-11 w-full rounded-xl bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="vexsa-pro" /></label><label className="block text-sm font-semibold text-[#344054]">Catégorie<select value={appForm.category} onChange={(event) => setAppForm({ ...appForm, category: event.target.value })} className="mt-2 h-11 w-full rounded-xl bg-[#f7f8fa] px-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35"><option>B2B</option><option>Matériaux</option><option>Outillage</option><option>Services</option></select></label><label className="block text-sm font-semibold text-[#344054]">Description<textarea required minLength={10} value={appForm.description} onChange={(event) => setAppForm({ ...appForm, description: event.target.value })} className="mt-2 min-h-28 w-full resize-y rounded-xl bg-[#f7f8fa] p-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="Décrivez la valeur de l’application pour les équipes…" /></label><Button disabled={createApp.isPending} type="submit" className="h-11 w-full rounded-full bg-[#0b1428] font-semibold text-white hover:bg-[#182845]">{createApp.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />} Créer l’application</Button></form></section><section className="rounded-[26px] bg-[#0b1428] p-6 text-white shadow-[0_18px_55px_rgba(11,20,40,.13)] sm:p-8"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-[15px] bg-[#f7d51d] text-[#0b1428]"><CloudUpload className="size-5" /></span><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#a9c2f6]">2 · Stockage S3</p><h2 className="font-display text-xl font-bold tracking-[-.04em]">Uploader un fichier</h2></div></div><p className="mt-5 max-w-md text-sm leading-6 text-[#c7d2e7]">Le fichier est envoyé au backend, stocké via <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#f7d51d]">storagePut</code>, puis sa référence est enregistrée dans <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#f7d51d]">appAssets</code>.</p><form className="mt-7 space-y-4" onSubmit={handleUpload}><label className="block text-sm font-semibold text-[#e7edf7]">Application<select required value={appId} onChange={(event) => setAppId(event.target.value)} className="mt-2 h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-white/15 focus:ring-[#f7d51d]/60"><option value="" className="text-[#101828]">Choisir une application…</option>{appsQuery.data?.map((app) => <option key={app.id} value={app.id} className="text-[#101828]">{app.name} · #{app.id}</option>)}</select></label><label className="block text-sm font-semibold text-[#e7edf7]">Type<select value={assetType} onChange={(event) => setAssetType(event.target.value as typeof assetType)} className="mt-2 h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-white/15 focus:ring-[#f7d51d]/60"><option value="apk" className="text-[#101828]">APK · distribution Android</option><option value="screenshot" className="text-[#101828]">Capture d’écran</option><option value="banner" className="text-[#101828]">Bannière promo</option></select></label><label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/[.06] px-4 text-center transition hover:border-[#f7d51d]/70 hover:bg-white/10"><UploadCloud className="size-7 text-[#f7d51d]" /><span className="mt-2 text-sm font-semibold">{selectedFile ? selectedFile.name : "Choisir un fichier"}</span><span className="mt-1 text-xs text-[#a9b9d4]">Transfert navigateur · 35 MB max</span><input type="file" required onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} className="sr-only" /></label><Button disabled={uploadAsset.isPending || !selectedFile || !selectedApp} type="submit" className="h-11 w-full rounded-full bg-[#f7d51d] font-semibold text-[#0b1428] hover:bg-[#ffe45c]">{uploadAsset.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CloudUpload className="mr-2 size-4" />} Envoyer vers le stockage</Button></form></section></div><section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,.05)] ring-1 ring-[#eaecf0] sm:p-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#155eef]">Fichiers enregistrés</p><h2 className="mt-1 font-display text-xl font-bold tracking-[-.04em]">Références du catalogue</h2></div><span className="text-sm text-[#667085]">{assetsQuery.data?.length || 0} fichier(s)</span></div><div className="mt-6 divide-y divide-[#edf0f4]">{assetsQuery.data?.length ? assetsQuery.data.map((asset) => <div key={asset.id} className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#344054]">{asset.fileName}</p><p className="text-xs text-[#98a2b3]">App #{asset.appId} · {asset.assetType} · {Math.round(asset.sizeBytes / 1024)} KB</p></div><a href={asset.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#155eef] hover:underline">Ouvrir le fichier</a></div>) : <div className="rounded-2xl bg-[#f7f8fa] px-4 py-8 text-center text-sm text-[#667085]">Aucun fichier n’a encore été uploadé.</div>}</div></section></main></div>;
}
