export type SupabaseAppRow = {
  id?: string | number;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  badge?: string;
  badgeTone?: string;
  action?: string;
  icon?: string;
  accent?: string;
  featured?: boolean;
  rating?: string;
  downloads?: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const appsTable = (import.meta.env.VITE_SUPABASE_APPS_TABLE as string | undefined) || "apps";

export const supabaseIsConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConnectionLabel = supabaseIsConfigured ? "Supabase connecté" : "Mode démo · Supabase prêt";

export async function fetchAppsFromSupabase(): Promise<SupabaseAppRow[] | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(`${supabaseUrl}/rest/v1/${appsTable}?select=*`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
  return response.json();
}

export const supabaseSetupMessage =
  "Variables attendues : VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY et VITE_SUPABASE_APPS_TABLE (optionnelle).";

export const supabaseConfig = {
  url: supabaseUrl,
  table: appsTable,
  storageBucket: (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) || "app-assets",
};

export const supabaseStatus = {
  configured: supabaseIsConfigured,
  label: supabaseConnectionLabel,
  detail: supabaseIsConfigured
    ? `Lecture publique de la table « ${appsTable} » activée.`
    : "Les fixtures locales s’affichent tant que les variables Vite ne sont pas renseignées.",
};

export default { fetchAppsFromSupabase, supabaseIsConfigured, supabaseConfig, supabaseStatus };
