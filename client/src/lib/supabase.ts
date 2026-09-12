import { createClient, type Session, type User } from "@supabase/supabase-js";

export type CommunityApp = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  icon_url: string | null;
  download_url: string | null;
  download_kind: "link" | "storage";
  published_at: string | null;
  created_at: string;
  views_count: number;
  downloads_count: number;
};

export type CommunityAsset = {
  id: string;
  app_id: string;
  owner_id: string;
  kind: "screenshot" | "icon" | "apk";
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export const ADMIN_EMAIL = "paulsongne4@gmail.com";

export type AdminOverview = {
  total_users: number;
  active_users: number;
  suspended_users: number;
  total_apps: number;
  published_apps: number;
  removed_apps: number;
  total_views: number;
  total_downloads: number;
};

export type AdminApp = {
  id: string;
  name: string;
  category: string;
  status: "published" | "hidden" | "removed";
  published_at: string | null;
  views_count: number;
  downloads_count: number;
  owner_id: string;
  owner_email: string;
  owner_status: "active" | "suspended" | "banned";
};

export type AdminUser = {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin";
  account_status: "active" | "suspended" | "banned";
  created_at: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseIsConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = supabaseIsConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const supabaseConfig = {
  url: supabaseUrl,
  storageBucket: "app-assets",
};

export async function fetchPublicApps() {
  if (!supabase) return [] as CommunityApp[];
  const { data, error } = await supabase.from("apps").select("*").eq("status", "published").not("published_at", "is", null).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CommunityApp[];
}

export async function fetchAppAssets(appId: string) {
  if (!supabase) return [] as CommunityAsset[];
  const { data, error } = await supabase.from("app_assets").select("*").eq("app_id", appId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CommunityAsset[];
}

export async function recordAppEvent(appId: string, eventType: "view" | "download") {
  if (!supabase) return;
  const { error } = await supabase.rpc("record_app_event", { target_app_id: appId, kind: eventType });
  if (error) throw error;
}

export async function deleteOwnedApp(appId: string, ownerId: string) {
  if (!supabase) throw new Error("Supabase n’est pas configuré");
  const { data: assets, error: assetsError } = await supabase.from("app_assets").select("storage_path").eq("app_id", appId).eq("owner_id", ownerId);
  if (assetsError) throw assetsError;
  const paths = (assets ?? []).map((asset) => asset.storage_path).filter(Boolean);
  if (paths.length) await supabase.storage.from("app-assets").remove(paths);
  const { error: assetsDeleteError } = await supabase.from("app_assets").delete().eq("app_id", appId).eq("owner_id", ownerId);
  if (assetsDeleteError) throw assetsDeleteError;
  const { error: appDeleteError } = await supabase.from("apps").delete().eq("id", appId).eq("owner_id", ownerId);
  if (appDeleteError) throw appDeleteError;
}

export type SupabaseAuthState = {
  session: Session | null;
  user: User | null;
};

export const supabaseSetupMessage = "Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour activer l’authentification Supabase.";
