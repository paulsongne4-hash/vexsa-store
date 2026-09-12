import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const apps = mysqlTable("apps", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  badge: varchar("badge", { length: 80 }),
  badgeTone: varchar("badgeTone", { length: 20 }).default("blue").notNull(),
  action: varchar("action", { length: 80 }).default("Découvrir").notNull(),
  icon: varchar("icon", { length: 40 }).default("briefcase").notNull(),
  accent: varchar("accent", { length: 80 }).default("bg-[#155eef]").notNull(),
  rating: varchar("rating", { length: 10 }).default("4.8").notNull(),
  downloads: varchar("downloads", { length: 40 }).default("—").notNull(),
  version: varchar("version", { length: 40 }).default("v1.0.0").notNull(),
  featured: int("featured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const appAssets = mysqlTable("appAssets", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").notNull(),
  assetType: mysqlEnum("assetType", ["apk", "screenshot", "banner"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  sizeBytes: bigint("sizeBytes", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type App = typeof apps.$inferSelect;
export type InsertApp = typeof apps.$inferInsert;
export type AppAsset = typeof appAssets.$inferSelect;
export type InsertAppAsset = typeof appAssets.$inferInsert;
