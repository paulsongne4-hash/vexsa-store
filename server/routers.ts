import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createApp, insertAppAsset, listAppAssets, listApps } from "./db";
import { MAX_UPLOAD_BYTES, sanitizeStorageFileName, storagePut } from "./storage";

const assetTypeSchema = z.enum(["apk", "screenshot", "banner"]);
const appInputSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(2000),
  category: z.string().trim().min(2).max(80),
  badge: z.string().trim().max(80).optional(),
  badgeTone: z.string().trim().max(20).default("blue"),
  action: z.string().trim().max(80).default("Découvrir"),
  icon: z.string().trim().max(40).default("briefcase"),
  accent: z.string().trim().max(80).default("bg-[#155eef]"),
  version: z.string().trim().max(40).default("v1.0.0"),
});

const uploadInputSchema = z.object({
  appId: z.number().int().positive(),
  assetType: assetTypeSchema,
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(128),
  sizeBytes: z.number().int().positive().max(50_000_000),
  dataBase64: z.string().min(1),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(() => listApps()),
    assets: publicProcedure.input(z.object({ appId: z.number().int().positive().optional() }).optional()).query(({ input }) => listAppAssets(input?.appId)),
  }),
  admin: router({
    createApp: adminProcedure.input(appInputSchema).mutation(({ input }) => createApp(input)),
    assets: adminProcedure.input(z.object({ appId: z.number().int().positive().optional() }).optional()).query(({ input }) => listAppAssets(input?.appId)),
    uploadAsset: adminProcedure.input(uploadInputSchema).mutation(async ({ input, ctx }) => {
      const bytes = Buffer.from(input.dataBase64, "base64");
      if (bytes.length === 0 || bytes.length > MAX_UPLOAD_BYTES) {
        throw new Error("File must be between 1 byte and 50 MB");
      }
      const fileName = sanitizeStorageFileName(input.fileName);
      const { key, url } = await storagePut(`vexsa/apps/${input.appId}/${input.assetType}/${fileName}`, bytes, input.mimeType);
      const asset = await insertAppAsset({
        appId: input.appId,
        assetType: input.assetType,
        fileName: input.fileName,
        fileKey: key,
        fileUrl: url,
        mimeType: input.mimeType,
        sizeBytes: bytes.length,
      });
      return { asset, uploadedBy: ctx.user.openId };
    }),
  }),
});

export type AppRouter = typeof appRouter;
