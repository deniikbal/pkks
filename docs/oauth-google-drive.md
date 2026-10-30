# Mendapatkan Kredensial OAuth Google Drive

Panduan ini menghasilkan tiga nilai untuk `.env`:

```
PKKS_GOOGLE_CLIENT_ID=...
PKKS_GOOGLE_CLIENT_SECRET=...
PKKS_GOOGLE_REFRESH_TOKEN=...
```

Perkiraan waktu: 10–15 menit.

---

## Baca dulu: tiga hal yang menentukan berhasil atau tidak

### 1. Akun yang login saat consent adalah akun yang dipakai aplikasi

Refresh token mewakili akun Google yang menekan tombol **Izinkan**. Aplikasi hanya
bisa melihat berkas yang bisa dilihat akun itu. Kalau folder PKKS tidak dibagikan
ke akun tersebut, sinkronisasi akan gagal dengan **404 File not found** — bukan
403. Google sengaja menyamarkan agar keberadaan berkas tidak bisa ditebak.

Jadi: login dengan akun yang **memang punya akses** ke folder arsip, atau
bagikan foldernya ke akun tersebut sebagai **Pelihat**.

### 2. Status *Testing* membunuh refresh token setiap 7 hari

Selama **Publishing status** masih `Testing`, refresh token hanya berlaku 7 hari.
Setelah itu sinkronisasi gagal dengan:

```
Google menolak refresh token: { "error": "invalid_grant", ... }
```

Ini bukan kerusakan aplikasi. Solusinya ada di Langkah 7.

### 3. Scope Drive termasuk *restricted*, dan itu punya konsekuensi

`drive.readonly` tergolong **restricted scope**. Untuk dipakai di Production,
Google mewajibkan verifikasi aplikasi (termasuk penilaian keamanan berkala).
Sampai terverifikasi, aplikasi dibatasi **100 pengguna** dan menampilkan layar
peringatan "Google hasn't verified this app".

Ringkasan pilihan untuk aplikasi sekolah internal:

| Cara | Token tahan lama | Beban |
|---|---|---|
| OAuth, status Testing | ❌ mati tiap 7 hari | paling ringan |
| OAuth, Production tanpa verifikasi | ✅ | peringatan + batas 100 user |
| OAuth, Production terverifikasi | ✅ | proses verifikasi berat |
| **Service account** | ✅ | tidak perlu OAuth sama sekali |

**Untuk pemakaian jangka panjang, service account lebih tepat** — lihat README
bagian "Cara A". Panduan ini tetap disusun karena OAuth kadang diperlukan,
misalnya saat folder dimiliki akun pribadi dan tidak bisa dibagikan ke service
account.

---

## Langkah 1 — Buat project

1. Buka <https://console.cloud.google.com>
2. Klik pemilih project di kiri atas → **New Project**
3. Nama: `pkks` (bebas) → **Create**
4. Pastikan project yang baru dibuat sedang aktif

## Langkah 2 — Aktifkan Google Drive API

1. Menu **APIs & Services** → **Library**
2. Cari `Google Drive API`
3. Klik hasilnya → **Enable**

Tanpa langkah ini, semua permintaan Drive akan ditolak.

## Langkah 3 — Isi Google Auth Platform

Menu (☰) → **Google Auth Platform**.

Kalau baru pertama kali membuka, klik **Get started** lalu isi:

| Kolom | Isi |
|---|---|
| App name | `PKKS` |
| User support email | email kamu |
| Audience | **External** |
| Contact information | email kamu |

Setujui kebijakan → **Create**.

> **Catatan:** dulu menu ini bernama *OAuth consent screen*. Nama dan letaknya
> berubah, tapi isinya sama.

### 3a. Tambahkan scope

**Google Auth Platform** → **Data Access** → **Add or remove scopes**

Tempel atau centang:

```
https://www.googleapis.com/auth/drive.readonly
```

→ **Update** → **Save**.

Scope ini wajib tepat. `drive.file` **tidak cukup**: dengan scope itu aplikasi
hanya melihat berkas yang dibuatnya sendiri, sehingga folder arsip tidak akan
pernah muncul.

### 3b. Tambahkan test user

Hanya perlu kalau status masih `Testing`.

**Google Auth Platform** → **Audience** → **Test users** → **Add users**

Masukkan akun Google yang akan dipakai, misalnya
`kesiswaansmansaba2026@gmail.com`. Akun di luar daftar ini akan ditolak dengan
`access_denied`.

## Langkah 4 — Buat OAuth Client

**Google Auth Platform** → **Clients** → **Create client**

| Kolom | Isi |
|---|---|
| Application type | **Desktop app** |
| Name | `PKKS Server` |

→ **Create**.

Muncul **Client ID** dan **Client secret**. Salin keduanya sekarang.

> **Kenapa Desktop app?** Tipe ini mengizinkan pengalihan ke
> `http://127.0.0.1:<port>` apa pun tanpa perlu mendaftarkan URI lebih dulu,
> sehingga skrip di Langkah 6 bisa langsung dipakai. Kalau kamu memilih tipe
> *Web application*, kamu harus menambahkan redirect URI secara manual dan
> biasanya berakhir dengan galat `redirect_uri_mismatch`.

## Langkah 5 — Isi client ID dan secret ke `.env`

```dotenv
PKKS_GOOGLE_CLIENT_ID=215955215330-xxxxxxxx.apps.googleusercontent.com
PKKS_GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
```

Pastikan `.env` memakai akhir baris **LF**, bukan CRLF. Kalau tidak,
`scripts/migrate.mjs` dan `scripts/buat-admin.mjs` akan mengeluh variabelnya
tidak ada. (Skrip di langkah berikut sudah tahan terhadap CRLF.)

## Langkah 6 — Ambil refresh token

Jalankan dari akar proyek:

```bash
node scripts/ambil-refresh-token.mjs
```

Terminal akan menampilkan tautan. Alurnya:

1. Buka tautan itu di browser
2. **Login dengan akun yang punya akses ke folder PKKS** — ini bagian paling
   sering terlewat
3. Kalau muncul layar **"Google hasn't verified this app"**, klik
   **Advanced** → **Go to PKKS (unsafe)**. Aman: aplikasi ini milikmu sendiri
4. Setujui permintaan akses Drive
5. Browser dialihkan ke halaman **Berhasil**
6. Skrip otomatis menulis `PKKS_GOOGLE_REFRESH_TOKEN` ke `.env`

Kalau muncul pesan **"Google tidak mengirim refresh_token"**, artinya kamu sudah
pernah menyetujui aplikasi ini sebelumnya. Cabut dulu aksesnya di
<https://myaccount.google.com/permissions>, lalu jalankan skrip lagi.

### Alternatif tanpa skrip: OAuth Playground

1. Buka <https://developers.google.com/oauthplayground>
2. Klik ikon gerigi (kanan atas) → centang **Use your own OAuth credentials**
3. Isi client ID dan client secret dari Langkah 4
4. Di kotak *Input your own scopes*, tempel
   `https://www.googleapis.com/auth/drive.readonly` → **Authorize APIs**
5. Setelah kembali, klik **Exchange authorization code for tokens**
6. Salin nilai `refresh_token`

Kalau Playground menolak dengan `redirect_uri_mismatch`, kembali ke skrip di
atas — itu lebih andal.

## Langkah 7 — Publish aplikasi (kalau ingin token tahan lama)

**Google Auth Platform** → **Audience** → pada **Publishing status** klik
**Publish app** → **Confirm**.

Tanpa langkah ini, refresh token mati dalam 7 hari dan kamu harus mengulang
Langkah 6 setiap minggu.

Karena `drive.readonly` adalah restricted scope, Google bisa meminta verifikasi
setelah aplikasi dipublikasikan. Sampai terverifikasi, aplikasi tetap jalan
tetapi dibatasi 100 pengguna dan menampilkan layar peringatan.

## Langkah 8 — Uji

Restart server, lalu klik **Sinkronkan** dari halaman arsip. Kalau masih gagal,
periksa tabel di bawah.

---

## Pemecahan masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| `404 File not found` | Folder tidak dibagikan ke akun pemilik token | Bagikan folder ke akun itu sebagai Pelihat |
| `invalid_grant` | Token kedaluwarsa (status Testing, 7 hari) atau dicabut | Ulangi Langkah 6 |
| `redirect_uri_mismatch` | Client bukan tipe Desktop app | Buat client baru tipe Desktop app |
| `access_denied` | Akun tidak terdaftar sebagai test user | Tambahkan di Audience → Test users |
| `Google tidak mengirim refresh_token` | Sudah pernah consent sebelumnya | Cabut akses di myaccount.google.com/permissions |
| `403 insufficient authentication scopes` | Scope kurang atau salah | Pastikan `drive.readonly` di Langkah 3a |
| `deleted_client` | OAuth client sudah dihapus | Buat client baru |

---

## Setelah selesai

- **Jangan commit `.env`.** Berkas ini sudah masuk `.gitignore`; nilai di
  dalamnya setara kata sandi.
- Kalau kredensial pernah bocor ke repository publik, anggap sudah kompromi:
  cabut di <https://myaccount.google.com/permissions> dan buat ulang.
- Catat tanggal pembuatan token. Kalau memakai status Testing, ingat token mati
  7 hari kemudian.
