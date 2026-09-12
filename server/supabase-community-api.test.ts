import { describe, expect, it } from "vitest";

describe("Supabase community catalog", () => {
  it("exposes the public apps collection to the publishable key", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    expect(url).toBeTruthy();
    expect(key).toBeTruthy();

    const response = await fetch(`${url}/rest/v1/apps?select=id&limit=1`, {
      headers: { apikey: key as string, Authorization: `Bearer ${key}` },
    });

    expect(response.ok).toBe(true);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  }, 15_000);
});
