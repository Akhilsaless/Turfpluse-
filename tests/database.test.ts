import { test } from "node:test";
import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { databaseOptions } from "../server/database";
import { SUPABASE_CA } from "../server/supabase-ca";

test("Supabase connection uses provider CA with certificate verification", () => {
  const options = databaseOptions("postgresql://user:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=verify-full");
  assert.ok(!options.connectionString!.includes("sslmode"));
  assert.equal((options.ssl as any).rejectUnauthorized, true);
  assert.equal((options.ssl as any).ca, SUPABASE_CA);
  assert.equal(new X509Certificate(SUPABASE_CA).fingerprint256.replaceAll(":", "").toLowerCase(), "807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa");
});

test("other PostgreSQL providers retain their connection settings", () => {
  const url = "postgresql://user:password@database.example.org/db?sslmode=verify-full";
  assert.deepEqual(databaseOptions(url), { connectionString: url });
});
