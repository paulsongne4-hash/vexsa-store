import { useState } from "react";
import { Eye, EyeOff, Github, Globe2, Loader2, Mail, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "signin" | "signup";
};

export function AuthDialog({ open, onOpenChange, initialMode = "signin" }: AuthDialogProps) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(false);

  const resetForMode = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    setPassword("");
    setShowPassword(false);
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    if (!supabase) {
      toast.error("Supabase n’est pas configuré");
      return;
    }
    setPendingProvider(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setPendingProvider(null);
      toast.error("Connexion impossible", { description: error.message });
    }
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      toast.error("Supabase n’est pas configuré");
      return;
    }
    setPendingEmail(true);
    const result = mode === "signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/dashboard` },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setPendingEmail(false);

    if (result.error) {
      toast.error(mode === "signup" ? "Inscription impossible" : "Connexion impossible", { description: result.error.message });
      return;
    }

    if (mode === "signup" && !result.data.session) {
      toast.success("Vérifiez votre boîte mail", { description: "Un lien de confirmation vient de vous être envoyé." });
      return;
    }
    toast.success(mode === "signup" ? "Compte créé" : "Bienvenue sur Vexsa Store");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-[min(100%-1.5rem,26rem)] flex-col gap-0 overflow-hidden rounded-[22px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(11,20,40,.22)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="shrink-0 bg-[#0b1428] px-5 pb-5 pt-6 text-white sm:px-7 sm:pb-6 sm:pt-7">
          <div className="flex size-10 items-center justify-center rounded-[13px] bg-[#155eef] text-[#f7d51d] shadow-[0_8px_20px_rgba(21,94,239,.30)]"><UserRound className="size-5" /></div>
          <DialogHeader className="mt-3 text-left">
            <DialogTitle className="font-display text-2xl font-bold tracking-[-.06em] text-white">{mode === "signup" ? "Rejoindre Vexsa." : "Bon retour."}</DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-5 text-[#b8c7df]">{mode === "signup" ? "Publiez vos apps et rejoignez une communauté de créateurs." : "Connectez-vous pour télécharger et suivre vos applications."}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" disabled={Boolean(pendingProvider)} onClick={() => signInWithProvider("google")} className="h-11 rounded-xl border-[#e4e7ec] bg-white font-semibold text-[#344054] hover:bg-[#f7f8fa]">{pendingProvider === "google" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Globe2 className="mr-2 size-4 text-[#4285f4]" />} Google</Button>
            <Button type="button" variant="outline" disabled={Boolean(pendingProvider)} onClick={() => signInWithProvider("github")} className="h-11 rounded-xl border-[#e4e7ec] bg-white font-semibold text-[#344054] hover:bg-[#f7f8fa]">{pendingProvider === "github" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Github className="mr-2 size-4 text-[#0b1428]" />} GitHub</Button>
          </div>
          <div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a2b3]"><span className="h-px flex-1 bg-[#eaecf0]" /> ou avec email <span className="h-px flex-1 bg-[#eaecf0]" /></div>
          <form className="space-y-3.5" onSubmit={handleEmailAuth}>
            {mode === "signup" && <label className="block text-sm font-semibold text-[#344054]">Nom affiché<Input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 rounded-xl border-0 bg-[#f7f8fa] ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="Alex Martin" /></label>}
            <label className="block text-sm font-semibold text-[#344054]">Email<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]" /><Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-xl border-0 bg-[#f7f8fa] pl-10 ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="vous@exemple.com" /></div></label>
            <label className="block text-sm font-semibold text-[#344054]">Mot de passe<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]" /><Input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-xl border-0 bg-[#f7f8fa] pl-10 pr-11 ring-1 ring-transparent focus:bg-white focus:ring-[#155eef]/35" placeholder="6 caractères minimum" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#98a2b3] transition hover:bg-white hover:text-[#155eef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155eef]/40">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
            <Button disabled={pendingEmail} type="submit" className="h-10 w-full rounded-full bg-[#155eef] font-semibold text-white shadow-[0_10px_24px_rgba(21,94,239,.20)] hover:bg-[#0d4cc9]">{pendingEmail && <Loader2 className="mr-2 size-4 animate-spin" />}{mode === "signup" ? "Créer mon compte" : "Se connecter"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-[#667085]">{mode === "signup" ? "Déjà membre ?" : "Pas encore de compte ?"}{" "}<button type="button" onClick={() => resetForMode(mode === "signup" ? "signin" : "signup")} className="font-bold text-[#155eef] hover:underline">{mode === "signup" ? "Se connecter" : "S’inscrire gratuitement"}</button></p>
          <p className="mt-5 text-center text-[11px] leading-5 text-[#98a2b3]">En continuant, vous acceptez les conditions d’utilisation de Vexsa Store.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
