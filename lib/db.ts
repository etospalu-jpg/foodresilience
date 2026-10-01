import { neon } from "@neondatabase/serverless";

function getDatabaseUrl() {
  const raw =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL ??
    "";

  const url = raw.trim();
  return url || null;
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
}
