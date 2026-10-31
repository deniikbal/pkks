import { CalendarClockIcon, FilesIcon, InfoIcon } from "lucide-react"

import { KartuBagian, type BerkasTampil } from "@/components/publik-daftar"
import { KepalaPublik } from "@/components/publik-kerangka"
import { PencarianArsip } from "@/components/pencarian-arsip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { akarDari, ambilRingkasan, ambilSemuaItem, hitungKeturunan } from "@/lib/data"
import { statusSumber } from "@/lib/drive"
import { formatTanggalJam } from "@/lib/format"

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
  const bagian = akar ? items.filter((i) => i.folder && i.indukId === akar.id) : []

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
        <section className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-7 sm:px-6 lg:h-[calc(100dvh-4rem-1px)] lg:min-h-[540px] lg:pb-8">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <div>
              <Badge
                variant="outline"
                className="gap-2 border-transparent bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-aksen"
              >
                <span aria-hidden="true" className="h-px w-6 bg-aksen/40" />
                Arsip terbuka
              </Badge>
              <h1 className="mt-2 text-[clamp(1.35rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-tight text-balance">
                Dokumen Penilaian Kinerja Kepala Sekolah
              </h1>
            </div>
          </div>

          {/* Ringkasan isi arsip: tiga angka yang dibaca sekilas sebelum
              memilih bagian. Dipisah garis tegak, bukan kartu terpisah, supaya
              tetap satu baris dengan judul. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            <Badge variant="secondary" className="h-6 gap-1.5 px-2 font-normal">
              <FilesIcon className="size-3.5" aria-hidden="true" />
              {angka.format(ringkasan.jumlahBerkas)} berkas
            </Badge>

            <Separator orientation="vertical" className="hidden h-3.5! sm:block" />

            <Badge variant="secondary" className="h-6 gap-1.5 px-2 font-normal">
              <FilesIcon className="size-3.5" aria-hidden="true" />
              {angka.format(ringkasan.jumlahFolder)} folder
            </Badge>

            <Separator orientation="vertical" className="hidden h-3.5! sm:block" />

            <Badge
              variant="secondary"
              className="hidden h-6 gap-1.5 px-2 font-normal sm:inline-flex"
            >
              <CalendarClockIcon className="size-3.5" aria-hidden="true" />
              {formatTanggalJam(ringkasan.diperbaruiPada)}
            </Badge>
          </div>

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
              <h2 className="sr-only">Empat bagian penilaian</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-rows-2">
                {bagian.map((b) => (
                  <KartuBagian
                    key={b.id}
                    ringkas
                    item={b}
                    jumlahBerkas={keturunan.get(b.id)?.berkas ?? 0}
                    subfolder={items.filter(
                      (i) => i.folder && i.indukId === b.id
                    )}
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
