# PKKS SMAN 1 Bantarujeg

Halaman muka arsip dokumen Penilaian Kinerja Kepala Sekolah. Daftar dokumen
diambil dari satu folder Google Drive sekolah; berkas aslinya tetap tinggal di
Drive dan tidak disalin ke server. Yang disimpan lokal hanya metadata hasil
sinkronisasi, akun pengguna, dan catatan sesi.

## Tumpukan

- Next.js 16.4 (App Router, Server Actions)
- Tailwind CSS 4
- PostgreSQL lokal (database `pkks`, peran `pkks_app`)
- Port aplikasi 3004, dikelola PM2 dengan nama `pkks`

## Perintah harian

```bash
cd /var/www/pkks
pnpm run build          # bangun ulang setelah mengubah kode
pm2 restart pkks        # terapkan hasil bangun
pm2 logs pkks           # lihat log
node scripts/migrate.mjs        # terapkan skema (aman dijalankan berulang)
node scripts/buat-admin.mjs <email> <nama> [admin|pengawas]
```

`buat-admin.mjs` membuatkan kata sandi acak dan menuliskannya ke
`/root/pkks-sandi-admin.txt` (mode 600). Sandi tidak dicetak ke layar. Setelah
masuk, ganti sandi lewat menu **Ganti sandi**.

## Menyambungkan Google Drive

Ada dua cara. Pilih satu, isi di `.env`, lalu jalankan sinkronisasi dari
halaman arsip (akun admin).

### Cara A: service account (disarankan, tidak perlu login ulang)

1. Buka Google Cloud Console, buat project, aktifkan **Google Drive API**.
2. Buat **Service Account**, lalu buat kunci dalam format **JSON**, unduh.
3. Simpan berkasnya di server, misalnya `/var/www/pkks/kredensial/drive.json`,
   lalu `chmod 600` berkas itu dan folder `kredensial`.
4. Salin alamat email service account (berakhiran
   `@...iam.gserviceaccount.com`).
5. Di Google Drive, buka folder PKKS, klik **Bagikan**, tempel email service
   account, pilih **Pelihat** (Viewer).
6. Isi `.env`:

   ```
   PKKS_DRIVE_FOLDER_ID=<id folder, ambil dari URL drive>
   PKKS_GOOGLE_SERVICE_ACCOUNT_JSON=/var/www/pkks/kredensial/drive.json
   ```

### Cara B: OAuth refresh token

Isi `PKKS_GOOGLE_CLIENT_ID`, `PKKS_GOOGLE_CLIENT_SECRET`,
`PKKS_GOOGLE_REFRESH_TOKEN`, dan `PKKS_DRIVE_FOLDER_ID`. Refresh token harus
punya cakupan `https://www.googleapis.com/auth/drive.readonly`. Cakupan
`drive.file` tidak cukup: dengan cakupan itu aplikasi hanya melihat berkas yang
dibuatnya sendiri.

Setelah `.env` diubah: `pm2 restart pkks`.

## Domain dan SSL

Aplikasi berjalan di `127.0.0.1:3004`. Supaya bisa diakses lewat
`pkks.sman1bantarujeg.sch.id`:

1. Tambahkan DNS record `A` untuk `pkks` ke `103.196.152.211`.
2. Setelah DNS aktif, terbitkan sertifikat lalu aktifkan vhost nginx
   (berkas contoh ada di `deploy/nginx-pkks.conf`).
3. `pm2 save` supaya proses ikut hidup setelah server reboot.

## Keamanan

- Kata sandi disimpan sebagai bcrypt (cost 11), tidak pernah sebagai teks biasa.
- Sesi berupa token acak; yang disimpan di database hanya hash SHA-256-nya,
  berlaku 12 jam.
- Percobaan masuk dibatasi 5 kali gagal per IP dalam 5 menit.
- Cookie sesi httpOnly, SameSite Lax, dan Secure saat produksi.
- Ganti sandi memutus sesi di perangkat lain.
- Hanya akun berperan `admin` yang bisa menjalankan sinkronisasi.

## Yang belum ada

- Pendaftaran akun mandiri (akun dibuat lewat `scripts/buat-admin.mjs`).
- Unggah berkas dari halaman ini; unggahan dilakukan langsung di Google Drive.
- Sinkronisasi otomatis terjadwal; saat ini dijalankan manual oleh admin.
