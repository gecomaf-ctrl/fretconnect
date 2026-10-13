import dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import * as schema from "./schema";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("supabase") || databaseUrl.includes("pooler")
        ? { rejectUnauthorized: false }
        : undefined,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : (null as any);

// Optional Supabase JS Client for Auth / Storage / Realtime
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export * from "./schema";
