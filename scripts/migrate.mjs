import fs from "node:fs"
import path from "node:path"
import { Client } from "pg"

// Membaca .env tanpa pustaka tambahan, supaya skrip bisa dijalankan
// sebelum aplikasi dibangun.
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

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum ada di .env")
  process.exit(1)
}

const skema = fs.readFileSync(path.resolve("db/schema.sql"), "utf8")
const klien = new Client({ connectionString: process.env.DATABASE_URL })

await klien.connect()
try {
  await klien.query(skema)
  const tabel = await klien.query(
    `select table_name from information_schema.tables
      where table_schema = 'public' order by table_name`
  )
  console.log(
    "Migrasi selesai. Tabel:",
    tabel.rows.map((r) => r.table_name).join(", ")
  )
} finally {
  await klien.end()
}
