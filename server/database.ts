import type { PoolConfig } from "pg";
import { SUPABASE_CA } from "./supabase-ca";

export function databaseOptions(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const supabase = url.hostname.endsWith(".pooler.supabase.com") ||
    url.hostname.endsWith(".supabase.co");
  if (!supabase) return { connectionString };
  // pg-connection-string overrides an explicit ssl object when sslmode is
  // present. Supply the provider CA and require chain + hostname verification.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: { ca: SUPABASE_CA, rejectUnauthorized: true },
  };
}
