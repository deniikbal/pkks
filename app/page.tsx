import { CalendarClockIcon, FilesIcon, InfoIcon } from "lucide-react"

import { KartuBagian, type BerkasTampil } from "@/components/publik-daftar"
import { KepalaPublik } from "@/components/publik-kerangka"
import { PencarianArsip } from "@/components/pencarian-arsip"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-aksen">
                <span aria-hidden="true" className="h-px w-6 bg-aksen/40" />
                Arsip terbuka
              </p>
              <h1 className="mt-2 text-[clamp(1.35rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-tight text-balance">
                Dokumen Penilaian Kinerja Kepala Sekolah
              </h1>
            </div>

            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <FilesIcon className="size-4" aria-hidden="true" />
              {angka.format(ringkasan.jumlahBerkas)} berkas
              <span aria-hidden="true" className="text-border">
                ·
              </span>
              {angka.format(ringkasan.jumlahFolder)} folder
              <span aria-hidden="true" className="hidden text-border sm:inline">
                ·
              </span>
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <CalendarClockIcon className="size-4" aria-hidden="true" />
                {formatTanggalJam(ringkasan.diperbaruiPada)}
              </span>
            </p>
          </div>

          {!sumber.siap || !adaData ? (
            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <Empty className="border border-dashed border-border bg-muted/60">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InfoIcon />
                  </EmptyMedia>
                  <EmptyTitle className="text-base">
                    Arsip belum bisa ditampilkan
                  </EmptyTitle>
                  <EmptyDescription>
                    Daftar dokumen belum tersinkron dari Google Drive sekolah.
                    Hubungi admin sekolah untuk menjalankan sinkronisasi.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
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
