const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(`Missing required Vercel environment variable(s): ${missing.join(", ")}`);
  console.error("Add them in Vercel Project Settings > Environment Variables for Production, Preview, and Development, then redeploy.");
  process.exit(1);
}

try {
  const url = new URL(process.env.VITE_SUPABASE_URL);
  if (url.protocol !== "https:") throw new Error("VITE_SUPABASE_URL must use https");
} catch {
  console.error("VITE_SUPABASE_URL must be a valid HTTPS Supabase project URL.");
  process.exit(1);
}

console.log("Supabase environment detected; continuing Vercel build.");
