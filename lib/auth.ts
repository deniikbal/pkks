import { createHash, randomBytes } from "node:crypto"
import { cookies, headers } from "next/headers"
import bcrypt from "bcryptjs"
import { query, satu } from "./db"

const NAMA_COOKIE = "pkks_sesi"
const UMUR_SESI_MS = 12 * 60 * 60 * 1000
const BATAS_PERCOBAAN = 5
const JENDELA_PERCOBAAN_MENIT = 5

export type Pengguna = {
  id: string
  email: string
  nama: string
  peran: "admin" | "pengawas"
}

export function hashSandi(sandi: string): string {
  return bcrypt.hashSync(sandi, 11)
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function alamatIp(): Promise<string> {
  const h = await headers()
  const diteruskan = h.get("x-forwarded-for")
  if (diteruskan) return diteruskan.split(",")[0].trim()
  return h.get("x-real-ip") ?? "tidak-diketahui"
}

// Menahan tebak sandi: hitung percobaan gagal per IP dalam jendela waktu.
export async function terlaluBanyakCoba(ip: string): Promise<boolean> {
  const baris = await satu<{ jumlah: string }>(
    `select count(*)::text as jumlah
       from percobaan_masuk
      where ip = $1
        and berhasil = false
        and pada > now() - ($2 || ' minutes')::interval`,
    [ip, String(JENDELA_PERCOBAAN_MENIT)]
  )
  return Number(baris?.jumlah ?? "0") >= BATAS_PERCOBAAN
}

export async function catatPercobaan(
  ip: string,
  email: string,
  berhasil: boolean
): Promise<void> {
  await query(
    "insert into percobaan_masuk (ip, email, berhasil) values ($1, $2, $3)",
    [ip, email, berhasil]
  )
}

export async function masuk(
  email: string,
  sandi: string
): Promise<Pengguna | null> {
  const baris = await satu<{
    id: string
    email: string
    nama: string
    peran: "admin" | "pengawas"
    kata_sandi_hash: string
  }>(
    `select id::text, email, nama, peran, kata_sandi_hash
       from pengguna
      where lower(email) = lower($1)
        and aktif = true`,
    [email]
  )

  if (!baris) return null
  const cocok = await bcrypt.compare(sandi, baris.kata_sandi_hash)
  if (!cocok) return null

  return {
    id: baris.id,
    email: baris.email,
    nama: baris.nama,
    peran: baris.peran,
  }
}

export async function buatSesi(penggunaId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url")
  const kedaluwarsa = new Date(Date.now() + UMUR_SESI_MS)
  const h = await headers()

  await query(
    `insert into sesi (id, pengguna_id, kedaluwarsa, ip, agen)
     values ($1, $2, $3, $4, $5)`,
    [
      hashToken(token),
      penggunaId,
      kedaluwarsa,
      await alamatIp(),
      h.get("user-agent")?.slice(0, 250) ?? null,
    ]
  )

  const jar = await cookies()
  jar.set(NAMA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: kedaluwarsa,
  })
}

export async function hapusSesi(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(NAMA_COOKIE)?.value
  if (token) {
    await query("delete from sesi where id = $1", [hashToken(token)])
  }
  jar.delete(NAMA_COOKIE)
}

export async function penggunaSaatIni(): Promise<Pengguna | null> {
  const jar = await cookies()
  const token = jar.get(NAMA_COOKIE)?.value
  if (!token) return null

  const baris = await satu<{
    id: string
    email: string
    nama: string
    peran: "admin" | "pengawas"
  }>(
    `select p.id::text, p.email, p.nama, p.peran
       from sesi s
       join pengguna p on p.id = s.pengguna_id
      where s.id = $1
        and s.kedaluwarsa > now()
        and p.aktif = true`,
    [hashToken(token)]
  )

  return baris ?? null
}

export async function bersihkanSesiKedaluwarsa(): Promise<void> {
  await query("delete from sesi where kedaluwarsa < now()")
}
