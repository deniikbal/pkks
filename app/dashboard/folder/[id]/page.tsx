import { Fragment } from "react"
import Link from "next/link"

import {
  DaftarBerkas,
  KartuFolder,
  KelompokBerkas,
} from "@/components/daftar-item"
import { PanelTidakAda } from "@/components/panel-tidak-ada"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ambilSemuaItem, jalurKe, type ItemDrive } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function HalamanFolder({
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
      <PanelTidakAda
        judul="Folder tidak ditemukan"
        keterangan="Folder dengan alamat ini tidak ada di data hasil sinkronisasi terakhir. Folder mungkin sudah dihapus atau dipindahkan di Google Drive. Jalankan sinkronisasi lagi dari halaman arsip untuk memperbarui daftar."
      />
    )
  }

  const anak = items.filter((i) => i.indukId === folder.id)
  const subfolder = anak.filter((i) => i.folder)
  const berkas = anak.filter((i) => !i.folder)
  const remah = jalurKe(folder, peta)

  const jumlahAnak = new Map<string, { folder: number; berkas: number }>()
  for (const item of items) {
    if (!item.indukId) continue
    const sekarang = jumlahAnak.get(item.indukId) ?? { folder: 0, berkas: 0 }
    if (item.folder) sekarang.folder += 1
    else sekarang.berkas += 1
    jumlahAnak.set(item.indukId, sekarang)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Arsip
              </BreadcrumbLink>
            </BreadcrumbItem>
            {remah.map((bagian, urutan) => (
              <Fragment key={bagian.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {urutan === remah.length - 1 ? (
                    <BreadcrumbPage>{bagian.nama}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={`/dashboard/folder/${bagian.id}`} />}
                    >
                      {bagian.nama}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {folder.nama}
          </h1>
          <p className="text-sm text-muted-foreground">
            {subfolder.length} subfolder, {berkas.length} berkas langsung di
            folder ini.
          </p>
        </header>
      </div>

      {anak.length === 0 ? (
        <Empty className="border border-dashed border-border bg-card/70">
          <EmptyHeader>
            <EmptyTitle>Folder ini kosong</EmptyTitle>
            <EmptyDescription>
              Isinya belum ikut tersinkron. Admin bisa menjalankan sinkronisasi
              dari halaman arsip.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {subfolder.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Subfolder</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subfolder.map((sub) => (
              <KartuFolder
                key={sub.id}
                item={sub}
                isi={jumlahAnak.get(sub.id) ?? { folder: 0, berkas: 0 }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {berkas.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Berkas</h2>
          <KelompokBerkas>
            {berkas.map((item) => (
              <DaftarBerkas key={item.id} item={item} />
            ))}
          </KelompokBerkas>
        </section>
      ) : null}
    </div>
  )
}
