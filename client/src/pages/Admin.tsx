import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, ArrowLeft, Ban, BarChart3, Eye, FileWarning, Loader2, ShieldCheck, Trash2, UserRound, Users, X } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ADMIN_EMAIL, supabase, type AdminApp, type AdminOverview, type AdminUser } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated, signOut } = useSupabaseAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [apps, setApps] = useState<AdminApp[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [appPendingRemoval, setAppPendingRemoval] = useState<AdminApp | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const loadAdmin = async () => {
    if (!supabase || !isAdmin) return;
    setLoading(true);
    const [{ data: overviewData, error: overviewError }, { data: appData, error: appError }, { data: userData, error: userError }] = await Promise.all([
      supabase.rpc("admin_overview"),
      supabase.rpc("admin_list_apps"),
      supabase.rpc("admin_list_users"),
    ]);
    const error = overviewError || appError || userError;
    if (error) toast.error("Chargement admin impossible", { description: error.message });
    setOverview((overviewData ?? null) as AdminOverview | null);
    setApps((appData ?? []) as AdminApp[]);
    setUsers((userData ?? []) as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void loadAdmin();
    else setLoading(false);
  }, [isAdmin]);

  const removeApp = async () => {
    if (!supabase || !appPendingRemoval) return;
    setActionPending(appPendingRemoval.id);
    const { error } = await supabase.rpc("admin_remove_app", { target_app_id: appPendingRemoval.id });
    setActionPending(null);
    if (error) {
      toast.error("Modération impossible", { description: error.message });
      return;
    }
    toast.success("Application retirée du catalogue");
    setAppPendingRemoval(null);
    await loadAdmin();
  };

  const changeUserStatus = async (target: AdminUser, nextStatus: "active" | "suspended" | "banned") => {
    if (!supabase) return;
    setActionPending(target.id);
    const { error } = await supabase.rpc("admin_set_user_status", { target_user_id: target.id, next_status: nextStatus });
    setActionPending(null);
    if (error) {
      toast.error("Action utilisateur impossible", { description: error.message });
      return;
    }
    toast.success(nextStatus === "active" ? "Compte réactivé" : nextStatus === "banned" ? "Compte banni" : "Compte suspendu");
    await loadAdmin();
  };

  if (authLoading || loading && isAdmin) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-[#155eef]"><Loader2 className="size-6 animate-spin" /></div>;
  if (!isAuthenticated) return <><div className="min-h-screen bg-[#f7f8fa] px-4 py-20"><div className="mx-auto max-w-xl rounded-[30px] bg-white p-8 text-center shadow-[0_25px_80px_rgba(16,24,40,.08)] ring-1 ring-[#eaecf0] sm:p-12"><div className="mx-auto flex size-16 items-center justify-center rounded-[20px] bg-[#e9f0ff] text-[#155eef]"><ShieldCheck className="size-8" /></div><p className="mt-7 text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Administration protégée</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.07em] text-[#0b1428]">Accès réservé.</h1><p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#667085]">Connectez-vous avec l’adresse administrateur autorisée pour gérer Vexsa Store.</p><Button onClick={() => setAuthOpen(true)} className="mt-8 rounded-full bg-[#155eef] px-6 font-semibold text-white hover:bg-[#0d4cc9]">Se connecter</Button><a href="/" className="mt-5 block text-sm font-semibold text-[#667085] hover:text-[#155eef]">Retour au store</a></div></div><AuthDialog open={authOpen} onOpenChange={setAuthOpen} /></>;
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4"><div className="max-w-md rounded-[28px] bg-white p-8 text-center ring-1 ring-[#eaecf0]"><Ban className="mx-auto size-10 text-[#b42318]" /><h1 className="mt-5 font-display text-3xl font-bold text-[#0b1428]">Accès refusé</h1><p className="mt-3 text-sm leading-6 text-[#667085]">Ce panneau est réservé à {ADMIN_EMAIL}.</p><Button onClick={async () => { await signOut(); window.location.href = "/"; }} className="mt-6 rounded-full bg-[#0b1428] text-white">Se déconnecter</Button></div></div>;

  return <div className="min-h-screen bg-[#f7f8fa] text-[#101828]"><header className="border-b border-[#e4e7ec] bg-white"><div className="container flex min-h-[78px] items-center justify-between gap-4"><a href="/" className="flex items-center gap-2.5"><img src="/manus-storage/vexsa-store-logo-transparent_8c0914f8.png" alt="VEXSA-STORE" className="h-11 w-[118px] object-contain" /></a><div className="flex items-center gap-2"><ThemeToggle compact /><Button variant="outline" onClick={async () => { await signOut(); window.location.href = "/"; }} className="rounded-full border-[#e4e7ec] bg-white"><ArrowLeft className="mr-2 size-4" /> Quitter</Button></div></div></header><main className="container py-10 sm:py-14"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#155eef]">Zone sécurisée · {ADMIN_EMAIL}</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.07em] text-[#0b1428] sm:text-5xl">Console administrateur.</h1><p className="mt-3 max-w-xl text-base leading-7 text-[#667085]">Modérez les applications, protégez la communauté et surveillez la santé de la plateforme.</p></div><Button variant="outline" onClick={() => void loadAdmin()} className="rounded-full border-[#e4e7ec] bg-white"><Activity className="mr-2 size-4" /> Actualiser</Button></div><section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Utilisateurs" value={overview?.total_users ?? 0} icon={<Users className="size-5" />} /><Metric label="Applications" value={overview?.total_apps ?? 0} icon={<FileWarning className="size-5" />} /><Metric label="Vues globales" value={overview?.total_views ?? 0} icon={<Eye className="size-5" />} /><Metric label="Téléchargements" value={overview?.total_downloads ?? 0} icon={<BarChart3 className="size-5" />} /></section><div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><section className="rounded-[26px] bg-white p-6 ring-1 ring-[#eaecf0] sm:p-8"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#155eef]">Modération</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.05em]">Applications publiées</h2></div><span className="text-xs font-semibold text-[#98a2b3]">{apps.length} entrée(s)</span></div><div className="mt-6 space-y-3">{apps.length ? apps.map((app) => <div key={app.id} className="flex flex-col gap-3 rounded-2xl bg-[#f7f8fa] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#0b1428]">{app.name}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${app.status === "removed" ? "bg-[#fee4e2] text-[#b42318]" : "bg-[#e5f8ef] text-[#087443]"}`}>{app.status}</span></div><p className="mt-1 text-xs text-[#667085]">{app.category} · {app.owner_email} · {app.views_count} vues · {app.downloads_count} téléchargements</p></div><Button size="sm" variant="outline" disabled={app.status === "removed" || actionPending === app.id} onClick={() => setAppPendingRemoval(app)} className="rounded-full border-[#f3b4ae] text-[#b42318] hover:bg-[#fee4e2]"><Trash2 className="mr-2 size-3.5" /> Retirer</Button></div>) : <p className="rounded-2xl bg-[#f7f8fa] px-4 py-8 text-center text-sm text-[#667085]">Aucune application à modérer.</p>}</div></section><section className="rounded-[26px] bg-white p-6 ring-1 ring-[#eaecf0] sm:p-8"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#155eef]">Comptes</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.05em]">Utilisateurs</h2></div><div className="mt-6 space-y-3">{users.length ? users.map((account) => <div key={account.id} className="rounded-2xl bg-[#f7f8fa] p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e9f0ff] text-[#155eef]"><UserRound className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#0b1428]">{account.display_name || account.email}</p><p className="truncate text-xs text-[#667085]">{account.email}</p></div></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-[#667085]">{account.account_status}</span></div>{account.role !== "admin" && <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={actionPending === account.id} onClick={() => void changeUserStatus(account, account.account_status === "suspended" ? "active" : "suspended")} className="rounded-full text-xs">{account.account_status === "suspended" ? "Réactiver" : "Suspendre"}</Button><Button size="sm" variant="outline" disabled={actionPending === account.id || account.account_status === "banned"} onClick={() => void changeUserStatus(account, "banned")} className="rounded-full border-[#f3b4ae] text-xs text-[#b42318]"><Ban className="mr-1 size-3" /> Bannir</Button></div>}</div>) : <p className="rounded-2xl bg-[#f7f8fa] px-4 py-8 text-center text-sm text-[#667085]">Aucun compte.</p>}</div></section></div></main><AlertDialog open={Boolean(appPendingRemoval)} onOpenChange={(open) => { if (!open && !actionPending) setAppPendingRemoval(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Retirer cette application ?</AlertDialogTitle><AlertDialogDescription>Elle sera masquée du catalogue public et marquée comme retirée. Cette action est réservée à la modération.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void removeApp(); }} className="bg-[#b42318] text-white hover:bg-[#912018]"><Trash2 className="mr-2 size-4" /> Retirer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>;
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) { return <div className="rounded-[22px] bg-white p-5 ring-1 ring-[#eaecf0]"><div className="flex size-10 items-center justify-center rounded-[13px] bg-[#e9f0ff] text-[#155eef]">{icon}</div><p className="mt-4 text-xs font-semibold text-[#667085]">{label}</p><p className="mt-1 font-display text-3xl font-bold tracking-[-.06em] text-[#0b1428]">{value.toLocaleString("fr-FR")}</p></div>; }
