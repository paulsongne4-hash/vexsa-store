const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.warn(`Supabase environment variable(s) not provided at build time: ${missing.join(", ")}`);
  console.warn("The site will build, but Supabase authentication and community data remain disabled until these variables are added in Vercel.");
  process.exit(0);
}

try {
  const url = new URL(process.env.VITE_SUPABASE_URL);
  if (url.protocol !== "https:") throw new Error("VITE_SUPABASE_URL must use https");
} catch {
  console.warn("VITE_SUPABASE_URL is not a valid HTTPS URL; Supabase features will remain disabled until it is corrected in Vercel.");
  process.exit(0);
}

console.log("Supabase environment detected; continuing Vercel build.");
