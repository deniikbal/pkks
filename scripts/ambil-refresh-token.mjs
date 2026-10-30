import fs from "node:fs"
import http from "node:http"
import path from "node:path"

// Skrip sekali pakai: menukar izin Google menjadi refresh token untuk Drive.
//
// Pemakaian:
//   node scripts/ambil-refresh-token.mjs
//
// Sebelum dijalankan, isi dulu PKKS_GOOGLE_CLIENT_ID dan
// PKKS_GOOGLE_CLIENT_SECRET di .env (lihat docs/oauth-google-drive.md).
//
// Skrip membuka server kecil di 127.0.0.1 supaya Google bisa mengembalikan
// kode otorisasi. Tidak ada data yang dikirim ke mana pun selain ke Google.

const PORT = 53682
const CAKUPAN = "https://www.googleapis.com/auth/drive.readonly"
const ALIHKAN = `http://127.0.0.1:${PORT}`

// Dibaca manual supaya skrip bisa jalan tanpa dependensi tambahan.
// "\r" dibuang karena berkas .env di Windows bisa memakai akhir baris CRLF.
function muatEnv() {
  const jalur = path.resolve(".env")
  if (!fs.existsSync(jalur)) return
  for (const baris of fs.readFileSync(jalur, "utf8").replace(/\r/g, "").split("\n")) {
    const cocok = baris.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!cocok) continue
    if (process.env[cocok[1]] === undefined) {
      process.env[cocok[1]] = cocok[2].replace(/^["']|["']$/g, "")
    }
  }
}

muatEnv()

const clientId = process.env.PKKS_GOOGLE_CLIENT_ID?.trim() ?? ""
const clientSecret = process.env.PKKS_GOOGLE_CLIENT_SECRET?.trim() ?? ""

if (!clientId || !clientSecret) {
  console.error("PKKS_GOOGLE_CLIENT_ID dan PKKS_GOOGLE_CLIENT_SECRET belum diisi di .env.")
  console.error("Ikuti langkah 1-4 di docs/oauth-google-drive.md lebih dulu.")
  process.exit(1)
}

const urlOtorisasi = new URL("https://accounts.google.com/o/oauth2/v2/auth")
urlOtorisasi.searchParams.set("client_id", clientId)
urlOtorisasi.searchParams.set("redirect_uri", ALIHKAN)
urlOtorisasi.searchParams.set("response_type", "code")
urlOtorisasi.searchParams.set("scope", CAKUPAN)
// Dua parameter ini yang membuat Google mengirim refresh token.
urlOtorisasi.searchParams.set("access_type", "offline")
urlOtorisasi.searchParams.set("prompt", "consent")

// Menulis ulang nilai di .env tanpa menyentuh baris lain.
function tulisKeEnv(nilai) {
  const jalur = path.resolve(".env")
  let teks = fs.existsSync(jalur) ? fs.readFileSync(jalur, "utf8").replace(/\r/g, "") : ""

  for (const [kunci, isi] of Object.entries(nilai)) {
    const pola = new RegExp(`^${kunci}=.*$`, "m")
    if (pola.test(teks)) teks = teks.replace(pola, `${kunci}=${isi}`)
    else teks += `${teks.endsWith("\n") || teks === "" ? "" : "\n"}${kunci}=${isi}\n`
  }

  fs.writeFileSync(jalur, teks)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", ALIHKAN)
  const kode = url.searchParams.get("code")
  const galat = url.searchParams.get("error")

  if (galat) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" })
    res.end(`<h1>Ditolak</h1><p>Google mengembalikan: ${galat}</p>`)
    console.error(`\nIzin ditolak atau gagal: ${galat}`)
    server.close()
    process.exit(1)
  }

  if (!kode) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Tidak ada parameter code pada permintaan ini.")
    return
  }

  try {
    const respons = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: kode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: ALIHKAN,
        grant_type: "authorization_code",
      }),
    })
    const data = await respons.json()

    if (!respons.ok) {
      const pesan = data.error_description ?? data.error ?? "tidak diketahui"
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" })
      res.end(`<h1>Gagal menukar kode</h1><pre>${pesan}</pre>`)
      console.error(`\nGoogle menolak penukaran kode: ${pesan}`)
      server.close()
      process.exit(1)
    }

    if (!data.refresh_token) {
      // Terjadi kalau izin sebelumnya belum dicabut: Google hanya mengirim
      // refresh token pada persetujuan pertama. Solusinya cabut akses dulu.
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" })
      res.end("<h1>Tidak ada refresh token</h1><p>Cabut akses aplikasi ini di akun Google lalu ulangi.</p>")
      console.error("\nGoogle tidak mengirim refresh_token.")
      console.error("Cabut akses aplikasi di https://myaccount.google.com/permissions lalu ulangi.")
      server.close()
      process.exit(1)
    }

    tulisKeEnv({
      PKKS_GOOGLE_CLIENT_ID: clientId,
      PKKS_GOOGLE_CLIENT_SECRET: clientSecret,
      PKKS_GOOGLE_REFRESH_TOKEN: data.refresh_token,
    })

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(
      "<h1>Berhasil</h1><p>Refresh token sudah disimpan ke .env. " +
        "Silakan tutup tab ini dan kembali ke terminal.</p>"
    )

    console.log("\nBerhasil. Refresh token sudah ditulis ke .env.")
    console.log(`Cakupan yang diberikan: ${data.scope ?? CAKUPAN}`)
    console.log("\nLangkah berikutnya: restart server lalu klik Sinkronkan.")
    server.close()
    process.exit(0)
  } catch (galat) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Gagal menghubungi Google.")
    console.error("\nGagal menghubungi Google:", galat instanceof Error ? galat.message : galat)
    server.close()
    process.exit(1)
  }
})

server.listen(PORT, "127.0.0.1", () => {
  console.log("Buka tautan berikut di browser, lalu setujui akses Drive:\n")
  console.log(urlOtorisasi.toString())
  console.log(`\nMenunggu jawaban dari Google di ${ALIHKAN} ...`)
  console.log("Pastikan browser login dengan akun Google yang punya akses ke folder PKKS.\n")
})
