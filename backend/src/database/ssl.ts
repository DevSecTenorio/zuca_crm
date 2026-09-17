export function getDatabaseSslConfig(databaseUrl?: string) {
  if (!databaseUrl) return false;
  const requiresSsl = /supabase|railway|render|neon\.tech|amazonaws/i.test(
    databaseUrl,
  );
  return requiresSsl ? { rejectUnauthorized: false } : false;
}
