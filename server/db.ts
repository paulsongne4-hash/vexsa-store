import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { appAssets, apps, InsertApp, InsertAppAsset, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Database not available");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= values.lastSignedIn;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listApps() {
  const db = requireDb(await getDb());
  return db.select().from(apps).orderBy(asc(apps.id));
}

export async function createApp(input: InsertApp) {
  const db = requireDb(await getDb());
  await db.insert(apps).values(input);
  const result = await db.select().from(apps).where(eq(apps.slug, input.slug)).limit(1);
  return result[0];
}

export async function listAppAssets(appId?: number) {
  const db = requireDb(await getDb());
  if (appId) return db.select().from(appAssets).where(eq(appAssets.appId, appId)).orderBy(asc(appAssets.id));
  return db.select().from(appAssets).orderBy(asc(appAssets.id));
}

export async function insertAppAsset(input: InsertAppAsset) {
  const db = requireDb(await getDb());
  await db.insert(appAssets).values(input);
  const result = await db.select().from(appAssets).where(eq(appAssets.fileKey, input.fileKey)).limit(1);
  return result[0];
}
