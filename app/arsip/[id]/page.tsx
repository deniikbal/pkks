import { Fragment } from "react"
import Link from "next/link"
import { ArrowLeftIcon, FolderIcon, FolderTreeIcon } from "lucide-react"

import { DaftarDokumen } from "@/components/daftar-dokumen-publik"
import { KartuBagian, pecahNama } from "@/components/publik-daftar"
import { KepalaPublik } from "@/components/publik-kerangka"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ambilSemuaItem, hitungKeturunan, jalurKe, type ItemDrive } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function HalamanArsipPublik({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const items = await ambilSemuaItem()
  const peta = new Map<string, ItemDrive>(items.map((i) => [i.id, i]))
  const folder = peta.get(id)

  if (!folder || !folder.folder) {
    return (
      <div className="flex min-h-dvh flex-col">
        <KepalaPublik />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
          <Empty className="border border-dashed border-border bg-muted/60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderIcon />
              </EmptyMedia>
              <EmptyTitle className="text-base">
                Folder tidak ditemukan
              </EmptyTitle>
              <EmptyDescription>
                Folder dengan alamat ini tidak ada di data hasil sinkronisasi
                terakhir. Mungkin sudah dipindahkan atau dihapus di Google Drive.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button nativeButton={false} render={<Link href="/" />}>
                <ArrowLeftIcon />
                Kembali ke halaman arsip
              </Button>
            </EmptyContent>
          </Empty>
        </main>
      </div>
    )
  }

  const anak = items.filter((i) => i.indukId === folder.id)
  const subfolder = anak.filter((i) => i.folder)
  const berkas = anak.filter((i) => !i.folder)
  // Folder akar ("PKKS 2026") tidak ditampilkan di remah roti. Pembaca datang
  // dari halaman "Arsip", jadi langkah perantara itu hanya menambah satu klik
  // yang tidak berguna — kecuali kalau folder akar itu sendiri yang dibuka.
  const jalur = jalurKe(folder, peta)
  const remah = jalur.length > 1 ? jalur.filter((b) => b.indukId !== null) : jalur

  const keturunan = hitungKeturunan(items)

  // Kalimat ringkas di bawah judul disusun dari isi yang benar-benar ada, supaya
  // tidak pernah muncul "5 subfolder dan 0 dokumen" — angka nol terbaca seperti
  // halaman rusak bagi orang tua yang membukanya.
  const keterangan = [
    subfolder.length > 0
      ? `${subfolder.length} subfolder`
      : null,
    berkas.length > 0 ? `${berkas.length} dokumen` : null,
  ]
    .filter(Boolean)
    .join(" dan ")

  const { nomor, judul } = pecahNama(folder.nama)

  return (
    <div className="flex min-h-dvh flex-col">
      <KepalaPublik />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>
                  Arsip
                </BreadcrumbLink>
              </BreadcrumbItem>
              {remah.map((bagian, urutan) => (
                <Fragment key={bagian.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {/* Nama folder dipakai apa adanya supaya nomor bagiannya
                        ikut tampil ("1.1 Manajerial"), sama seperti remah roti
                        di dasbor. Judul besar di bawah tetap tanpa nomor. */}
                    {urutan === remah.length - 1 ? (
                      <BreadcrumbPage>{bagian.nama}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<Link href={`/arsip/${bagian.id}`} />}
                      >
                        {bagian.nama}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <header className="mt-6 flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <div className="max-w-2xl">
              {nomor ? (
                <p className="text-sm font-semibold tabular-nums text-aksen">
                  Bagian {nomor}
                </p>
              ) : null}
              <h1 className="mt-2 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-tight tracking-tight text-balance">
                {judul}
              </h1>
              {keterangan ? (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {keterangan} di bagian ini. Berkas dibuka langsung di halaman
                  ini.
                </p>
              ) : null}
            </div>

            {anak.length > 0 ? (
              <p className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                <FolderTreeIcon className="size-4" aria-hidden="true" />
                {anak.length} item
              </p>
            ) : null}
          </header>

          {anak.length === 0 ? (
            <Empty className="mt-10 border border-dashed border-border bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderIcon />
                </EmptyMedia>
                <EmptyTitle className="text-base">
                  Bagian ini masih kosong
                </EmptyTitle>
                <EmptyDescription>
                  Belum ada subfolder atau dokumen yang tersinkron dari Google
                  Drive sekolah.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {subfolder.length > 0 ? (
            <section aria-labelledby="judul-subfolder" className="mt-10">
              <h2
                id="judul-subfolder"
                className="text-xl font-semibold tracking-tight"
              >
                Subfolder
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {subfolder.map((sub) => (
                  <KartuBagian
                    key={sub.id}
                    item={sub}
                    jumlahBerkas={keturunan.get(sub.id)?.berkas ?? 0}
                    subfolder={items.filter((i) => i.folder && i.indukId === sub.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {berkas.length > 0 ? (
            <section aria-labelledby="judul-berkas" className="mt-12">
              <h2
                id="judul-berkas"
                className="text-xl font-semibold tracking-tight"
              >
                Dokumen di bagian ini
              </h2>
              <div className="mt-5">
                <DaftarDokumen items={berkas} />
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}
