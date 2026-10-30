import { Pool, type QueryResultRow } from "pg"

// Satu pool dipakai ulang antar request supaya tidak membuat koneksi baru
// setiap kali halaman dibuka.
const simpanGlobal = globalThis as unknown as { _poolPkks?: Pool }

export const pool =
  simpanGlobal._poolPkks ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 6,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
  })

simpanGlobal._poolPkks = pool

export async function query<T extends QueryResultRow>(
  teks: string,
  nilai: unknown[] = []
): Promise<T[]> {
  const hasil = await pool.query<T>(teks, nilai)
  return hasil.rows
}

export async function satu<T extends QueryResultRow>(
  teks: string,
  nilai: unknown[] = []
): Promise<T | null> {
  const baris = await query<T>(teks, nilai)
  return baris[0] ?? null
}
