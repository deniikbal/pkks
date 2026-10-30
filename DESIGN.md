# DESIGN.md — PKKS SMAN 1 Bantarujeg

Arah desain ini diturunkan dari identitas yang sudah dipakai aplikasi sekolah
yang ada (E-Voting, Rekapin): biru institusi sebagai warna utama, netral terang
seperti kertas. Bukan selera baru, tapi kelanjutan keluarga aplikasi yang sama.

## Design Read

Reading this as: portal arsip dokumen internal sekolah untuk tim PKKS dan
pengawas, dengan bahasa visual institusional seperti lembar arsip cetak, dial
ENERGY 1 / RHYTHM 2 / MOTION 1.

## Dials

- **ENERGY 1** — tenang. Yang dibaca adalah nama dokumen dan tanggal, bukan ajakan.
- **RHYTHM 2** — pola dasar seragam (daftar arsip), dengan satu jeda: blok status
  sumber data di atas daftar. Bukan halaman yang tiap bagiannya beda gaya.
- **MOTION 1** — hanya state hover dan focus. Tidak ada animasi masuk, tidak ada
  denyut berulang. Alasannya: pengguna sedang memindai daftar, bukan menonton.

## Palet (maksimal 3 warna inti + 1 aksen)

| Peran | Nilai | Alasan |
|---|---|---|
| Tinta (teks) | `#101828` | Teks utama, kontras ±15:1 di atas kertas |
| Navy (identitas) | `#14264a` | Warna institusi sekolah, dipakai di kepala halaman dan tombol utama |
| Kertas (latar) | `#f7f5f0` | Latar hangat meniru kertas arsip, membedakan dari putih aplikasi lain |
| Aksen arsip | `#b45309` | Hanya untuk keadaan yang butuh perhatian (belum tersambung, gagal sinkron). Kontras 4,9:1 |
| Sahih | `#15803d` | Hanya untuk keadaan berhasil/tersinkron. Kontras 4,8:1 |

Warna tidak dipakai sebagai dekorasi. Navy = identitas dan aksi utama. Amber =
ada yang perlu diurus. Hijau = data sudah sahih dari sumbernya.

## Tipografi

System UI stack (Segoe UI/Roboto/Helvetica). Alasan: tidak ada unduhan font,
render instan, dan bentuk hurufnya netral untuk teks administratif berbahasa
Indonesia. Angka memakai `tabular-nums` supaya kolom ukuran dan tanggal rata.

## Motif identitas

Garis tegak navy 3px di tepi kiri blok daftar, seperti punggung berkas arsip.
Muncul di setiap blok daftar dan kartu folder, tidak di tempat lain.

## Tema

Terang saja, tanpa tombol gelap. Alasannya: halaman ini dibaca seperti arsip
cetak dan sering ditampilkan lewat proyektor di ruang rapat, di mana latar
terang lebih terbaca. Ini keputusan, bukan kelalaian.
