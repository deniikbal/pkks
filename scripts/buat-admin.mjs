import fs from "node:fs"
import path from "node:path"
import { randomBytes } from "node:crypto"
import { Client } from "pg"
import bcrypt from "bcryptjs"

// Pemakaian:
//   node scripts/buat-admin.mjs <email> <nama> [peran]
// Kalau kata sandi tidak diberikan lewat env PKKS_SANDI, skrip membuatkan
// sandi acak dan menuliskannya ke berkas 600 di luar folder aplikasi.
// Sandi tidak pernah dicetak ke layar.

function muatEnv() {
  const jalur = path.resolve(".env")
  if (!fs.existsSync(jalur)) return
  for (const baris of fs.readFileSync(jalur, "utf8").split("\n")) {
    const cocok = baris.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!cocok) continue
    if (process.env[cocok[1]] === undefined) {
      process.env[cocok[1]] = cocok[2].replace(/^["']|["']$/g, "")
    }
  }
}

muatEnv()

const [email, nama, peran = "admin"] = process.argv.slice(2)
if (!email || !nama) {
  console.error("Pemakaian: node scripts/buat-admin.mjs <email> <nama> [admin|pengawas]")
  process.exit(1)
}
if (!["admin", "pengawas"].includes(peran)) {
  console.error("Peran harus admin atau pengawas.")
  process.exit(1)
}

const sandi = process.env.PKKS_SANDI || randomBytes(9).toString("base64url")
const hash = bcrypt.hashSync(sandi, 11)

const klien = new Client({ connectionString: process.env.DATABASE_URL })
await klien.connect()

try {
  const hasil = await klien.query(
    `insert into pengguna (email, nama, kata_sandi_hash, peran)
     values (lower($1), $2, $3, $4)
     on conflict (email) do update
        set nama = excluded.nama,
            kata_sandi_hash = excluded.kata_sandi_hash,
            peran = excluded.peran,
            aktif = true
     returning id::text, email, peran`,
    [email, nama, hash, peran]
  )
  const akun = hasil.rows[0]
  console.log(`Akun siap: ${akun.email} (${akun.peran}), id ${akun.id}`)

  if (!process.env.PKKS_SANDI) {
    const berkas = "/root/pkks-sandi-admin.txt"
    fs.writeFileSync(
      berkas,
      `Akun: ${akun.email}\nSandi: ${sandi}\nDibuat: ${new Date().toISOString()}\nGanti sandi lewat menu Ganti sandi setelah masuk.\n`,
      { mode: 0o600 }
    )
    console.log(`Sandi acak ditulis ke ${berkas} (mode 600). Tidak dicetak di sini.`)
  }
} finally {
  await klien.end()
}
