import { InfoIcon } from "lucide-react"

import { KartuBagian, type BerkasTampil } from "@/components/publik-daftar"
import { KepalaPublik } from "@/components/publik-kerangka"
import { PencarianArsip } from "@/components/pencarian-arsip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  akarDari,
  ambilRingkasan,
  ambilSemuaItem,
  anakDari,
  hitungKeturunan,
} from "@/lib/data"
import { statusSumber } from "@/lib/drive"
import { formatTanggalJam } from "@/lib/format"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const angka = new Intl.NumberFormat("id-ID")

export default async function BerandaPublik({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const kata = ((await searchParams).q ?? "").trim()
  const items = await ambilSemuaItem()
  const ringkasan = await ambilRingkasan()
  const sumber = statusSumber()

  const akar = akarDari(items, process.env.PKKS_DRIVE_FOLDER_ID ?? "")
  const bagian = akar ? anakDari(items, akar).filter((i) => i.folder) : []

  // Angka di kartu bagian menghitung seluruh isi di bawahnya, bukan hanya satu
  // lapis, supaya pembaca tahu besar kecilnya bagian sebelum membukanya.
  const keturunan = hitungKeturunan(items)

  // Daftar ramping untuk pencarian di peramban: hanya kolom yang ditampilkan.
  // Folder ikut disertakan — pencarian harus bisa menemukan bagian, bukan hanya
  // berkas. Urutannya sudah "folder dulu, lalu nama" dari query, jadi folder
  // muncul di atas hasil.
  const daftarBerkas: BerkasTampil[] = items.map((i) => ({
    id: i.id,
    nama: i.nama,
    mime: i.mime,
    folder: i.folder,
    ukuran: i.ukuran,
    diubahPada: i.diubahPada,
  }))

  const adaData = ringkasan.jumlahBerkas + ringkasan.jumlahFolder > 0
  const adaBagian = bagian.length > 0

  return (
    <div className="flex min-h-dvh flex-col">
      <KepalaPublik />

      {/* Seluruh halaman hanya satu layar: judul ringkas, pencarian selebar
          halaman, lalu empat bagian penilaian. Tidak ada bagian lain di bawah
          lipatan — begitu kartu terlihat, halaman selesai. */}
      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-12 pt-8 sm:px-6 lg:px-10">
          {/* Judul dan catatan waktu sinkron: judul di kiri, waktu di kanan
              sebagai teks tenang supaya jam tidak berebut perhatian dengan
              judul halaman. */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-aksen">
                <span aria-hidden="true" className="h-px w-6 bg-aksen/60" />
                Arsip terbuka
              </p>
              <h1 className="mt-2 text-[clamp(1.7rem,3.2vw,2.25rem)] font-bold leading-tight tracking-tight text-balance">
                Dokumen Penilaian Kinerja Kepala Sekolah
              </h1>
            </div>

            <p className="flex flex-col items-end text-right leading-tight">
              <span className="text-[13px] text-muted-foreground">
                Terakhir disinkronkan
              </span>
              <span className="mt-0.5 text-base font-semibold tabular-nums">
                {formatTanggalJam(ringkasan.diperbaruiPada)}
              </span>
            </p>
          </div>

          {/* Kalimat pengantar bahasa sehari-hari: siapa yang boleh membaca,
              apa isinya, dan harus mulai dari mana. Orang tua yang membuka
              tautan ini tidak tahu istilah "PKKS", jadi halaman harus
              menjelaskannya sendiri, bukan mengandalkan judul. */}
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Halaman ini memuat dokumen penilaian kinerja kepala sekolah yang
            bisa dibaca siapa saja. Anda tidak perlu masuk atau punya akun. Pilih
            salah satu bagian di bawah, atau ketik nama dokumen pada kotak
            pencarian.
          </p>

          {/* Ringkasan isi arsip: satu bilah angka. Angka besar dibaca
              sekilas, labelnya kecil; dipisah garis tegak, bukan tiga kartu
              terpisah, supaya tetap terbaca sebagai satu kesatuan. */}
          <dl className="mt-6 rounded-xl border border-border bg-card shadow-sm sm:flex">
            {[
              { label: "Berkas dokumen", nilai: ringkasan.jumlahBerkas },
              { label: "Folder terkelola", nilai: ringkasan.jumlahFolder },
              { label: "Bagian penilaian", nilai: bagian.length },
            ].map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  // Ponsel: satu angka per baris, angka di kiri dan label di
                  // kanan. Tiga angka dalam satu baris terlalu sempit — labelnya
                  // pecah dan baris ketiga menggantung sendiri.
                  "flex items-baseline justify-between gap-4 px-5 py-3",
                  i > 0 && "border-t border-border",
                  // Layar lebar: tiga angka dalam satu baris, dipisah garis tegak.
                  "sm:flex-1 sm:justify-start sm:gap-3 sm:border-t-0 sm:py-4",
                  i > 0 && "sm:border-l sm:border-border"
                )}
              >
                <dt className="order-2 text-sm text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="order-1 text-2xl font-bold tabular-nums sm:text-3xl">
                  {angka.format(s.nilai)}
                </dd>
              </div>
            ))}
          </dl>

          {!sumber.siap || !adaData ? (
            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <Alert
                variant="destructive"
                className="border border-dashed border-border bg-muted/60"
              >
                <InfoIcon />
                <AlertTitle>Arsip belum bisa ditampilkan</AlertTitle>
                <AlertDescription>
                  Daftar dokumen belum tersinkron dari Google Drive sekolah.
                  Hubungi admin sekolah untuk menjalankan sinkronisasi. Begitu
                  sinkronisasi jalan, empat bagian penilaian dan pencarian akan
                  muncul di sini.
                </AlertDescription>
              </Alert>
            </div>
          ) : !adaBagian ? (
            /* Ada isi di arsip, tapi tidak satu pun bagian langsung di bawah
               folder akar yang bisa ditemukan. Ini terjadi kalau folder akar
               sendiri tidak aktif atau PKKS_DRIVE_FOLDER_ID tidak cocok dengan
               baris mana pun — tanpa pesan ini halaman tampak kosong begitu
               saja dan sebabnya tidak terlihat. */
            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <Alert
                variant="destructive"
                className="border border-dashed border-border bg-muted/60"
              >
                <InfoIcon />
                <AlertTitle>Bagian penilaian tidak ditemukan</AlertTitle>
                <AlertDescription>
                  Arsip berisi {angka.format(ringkasan.jumlahBerkas)} berkas,
                  tetapi tidak ada bagian yang bisa ditampilkan di bawah folder
                  akar. Folder akar kemungkinan sudah tidak aktif atau tidak
                  cocok dengan pengaturan PKKS_DRIVE_FOLDER_ID. Jalankan
                  sinkronisasi ulang dari dasbor admin.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <PencarianArsip awal={kata} daftar={daftarBerkas}>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">
                  Empat bagian penilaian
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pilih bagian untuk melihat isinya
                </p>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {bagian.map((b) => (
                  <KartuBagian
                    key={b.id}
                    ringkas
                    item={b}
                    jumlahBerkas={keturunan.get(b.id)?.berkas ?? 0}
                    subfolder={anakDari(items, b).filter((i) => i.folder)}
                  />
                ))}
              </div>
            </PencarianArsip>
          )}
        </section>
      </main>
    </div>
  )
}
