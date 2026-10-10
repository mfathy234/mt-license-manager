// Copies the production database (from `vercel env pull .env.production.local`)
// into the LOCAL database from .env.local. Production is only read (pg_dump).
//
//   node scripts/pull-production-data.mjs            dry run: checks only
//   node scripts/pull-production-data.mjs --yes      empties local tables, restores
//   add --sync-key to copy production CREDENTIAL_ENCRYPTION_KEY into .env.local
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PG_BIN = process.env.PG_BIN ?? "C:/Program Files/PostgreSQL/18/bin";
const args = new Set(process.argv.slice(2));
const confirmed = args.has("--yes");
const syncKey = args.has("--sync-key");

// libpq rejects Prisma/pooler-only query params such as pgbouncer or connection_limit.
const LIBPQ_PARAMS = new Set(["sslmode", "channel_binding", "options", "sslrootcert"]);

function readEnv(file) {
  if (!fs.existsSync(file)) throw new Error(`${file} not found.`);
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function toLibpqUrl(raw) {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) {
    if (!LIBPQ_PARAMS.has(key)) url.searchParams.delete(key);
  }
  return url.toString();
}

function run(tool, toolArgs, { capture = false } = {}) {
  const result = spawnSync(path.join(PG_BIN, `${tool}.exe`), toolArgs, {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${tool} failed (exit ${result.status}). ${result.stderr ?? ""}`.trim());
  }
  return result.stdout ?? "";
}

function query(url, sql) {
  return run("psql", ["-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-d", url, "-c", sql], {
    capture: true,
  })
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
}

function migrations(url) {
  return query(
    url,
    "select migration_name from _prisma_migrations where finished_at is not null and rolled_back_at is null order by 1",
  );
}

function tableCounts(url, tables) {
  return Object.fromEntries(
    tables.map((table) => [table, Number(query(url, `select count(*) from "${table}"`)[0])]),
  );
}

function main() {
  const prodEnv = readEnv(".env.production.local");
  const localEnv = readEnv(".env.local");

  const sourceRaw =
    prodEnv.DATABASE_URL_UNPOOLED ?? prodEnv.POSTGRES_URL_NON_POOLING ?? prodEnv.DATABASE_URL;
  if (!sourceRaw) throw new Error("No DATABASE_URL in .env.production.local.");
  if (!localEnv.DATABASE_URL) throw new Error("No DATABASE_URL in .env.local.");

  const source = toLibpqUrl(sourceRaw);
  const target = toLibpqUrl(localEnv.DATABASE_URL);
  const targetHost = new URL(target).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(targetHost)) {
    throw new Error(`Refusing to write to non-local database host "${targetHost}".`);
  }
  if (new URL(source).hostname === targetHost) {
    throw new Error("Source and target resolve to the same host; aborting.");
  }

  console.log(`Source (read only): ${new URL(source).hostname}`);
  console.log(`Target (local):     ${targetHost}/${new URL(target).pathname.slice(1)}`);

  const sourceMigrations = migrations(source);
  const targetMigrations = new Set(migrations(target));
  const missing = sourceMigrations.filter((name) => !targetMigrations.has(name));
  if (missing.length) {
    throw new Error(`Local schema is behind production. Run "npm run prisma:deploy" first. Missing: ${missing.join(", ")}`);
  }

  const tables = query(
    target,
    "select tablename from pg_tables where schemaname = 'public' and tablename <> '_prisma_migrations' order by 1",
  );
  console.log("Production row counts:", tableCounts(source, tables));

  const keysMatch = prodEnv.CREDENTIAL_ENCRYPTION_KEY === localEnv.CREDENTIAL_ENCRYPTION_KEY;
  if (!prodEnv.CREDENTIAL_ENCRYPTION_KEY) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY missing from .env.production.local.");
  }
  if (!keysMatch && !syncKey) {
    throw new Error(
      "Local CREDENTIAL_ENCRYPTION_KEY differs from production, so copied data would not decrypt. Re-run with --sync-key.",
    );
  }

  if (!confirmed) {
    console.log(`\nDry run OK. Re-run with --yes to EMPTY ${tables.length} local tables and restore production data.`);
    return;
  }

  const dumpFile = path.join(os.tmpdir(), `mt-license-prod-${Date.now()}.dump`);
  try {
    console.log("\nDumping production data...");
    run("pg_dump", ["--data-only", "--format=custom", "--no-owner", "--exclude-table=_prisma_migrations", "-f", dumpFile, "-d", source]);

    console.log("Emptying local tables...");
    query(target, `truncate ${tables.map((table) => `"${table}"`).join(", ")} restart identity cascade`);

    console.log("Restoring into local database...");
    run("pg_restore", ["--data-only", "--disable-triggers", "--no-owner", "--single-transaction", "-d", target, dumpFile]);
  } finally {
    fs.rmSync(dumpFile, { force: true });
  }

  if (!keysMatch) {
    const envText = fs.readFileSync(".env.local", "utf8");
    const line = `CREDENTIAL_ENCRYPTION_KEY="${prodEnv.CREDENTIAL_ENCRYPTION_KEY}"`;
    const next = /^CREDENTIAL_ENCRYPTION_KEY=.*$/m.test(envText)
      ? envText.replace(/^CREDENTIAL_ENCRYPTION_KEY=.*$/m, line)
      : `${envText.trimEnd()}\n${line}\n`;
    fs.writeFileSync(".env.local", next);
    console.log("Updated CREDENTIAL_ENCRYPTION_KEY in .env.local (restart the dev server).");
  }

  console.log("Local row counts:", tableCounts(target, tables));
  console.log("Done. Sign in locally with your production account.");
}

try {
  main();
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
