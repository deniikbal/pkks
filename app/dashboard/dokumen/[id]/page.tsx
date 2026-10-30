import { Fragment } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowLeftIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileQuestionIcon,
} from "lucide-react"

import { PanelTidakAda } from "@/components/panel-tidak-ada"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { ambilSemuaItem, jalurKe, type ItemDrive } from "@/lib/data"
import {
  formatTanggalJam,
  formatUkuran,
  jenisBerkas,
  tautanPratinjau,
  tautanUnduh,
} from "@/lib/format"

export const dynamic = "force-dynamic"

const MIME_GOOGLE = "application/vnd.google-apps."

// Jenis yang bisa ditampilkan langsung di dalam halaman. Selain ini, pengguna
// diarahkan membuka atau mengunduh berkasnya, bukan diberi kotak kosong.
function bisaDipratinjau(mime: string): boolean {
  if (mime.startsWith("image/")) return true
  if (mime === "application/pdf") return true
  if (mime === `${MIME_GOOGLE}document`) return true
  if (mime === `${MIME_GOOGLE}spreadsheet`) return true
  if (mime === `${MIME_GOOGLE}presentation`) return true
  return false
}

export default async function HalamanDokumen({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const items = await ambilSemuaItem()
  const peta = new Map<string, ItemDrive>(items.map((i) => [i.id, i]))
  const item = peta.get(id)

  if (!item) {
    return (
      <PanelTidakAda
        judul="Dokumen tidak ditemukan"
        keterangan="Dokumen dengan alamat ini tidak ada di data hasil sinkronisasi terakhir. Berkasnya mungkin sudah dihapus atau dipindahkan di Google Drive. Jalankan sinkronisasi lagi dari halaman arsip untuk memperbarui daftar."
      />
    )
  }
  if (item.folder) redirect(`/dashboard/folder/${item.id}`)

  const induk = item.indukId ? peta.get(item.indukId) ?? null : null
  const remah = induk ? jalurKe(induk, peta) : []
  const asliGoogle = item.mime.startsWith(MIME_GOOGLE)

  const rincian = [
    { label: "Nama berkas", nilai: item.nama },
    { label: "Jenis", nilai: jenisBerkas(item.mime, false) },
    { label: "Ukuran", nilai: formatUkuran(item.ukuran) },
    { label: "Terakhir diubah", nilai: formatTanggalJam(item.diubahPada) },
    { label: "Folder induk", nilai: induk ? induk.nama : "Akar arsip" },
    { label: "ID berkas di Drive", nilai: item.id },
  ]

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
            {remah.map((bagian) => (
              <Fragment key={bagian.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={<Link href={`/dashboard/folder/${bagian.id}`} />}
                  >
                    {bagian.nama}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-balance">
            {item.nama}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{jenisBerkas(item.mime, false)}</Badge>
            <span className="tabular-nums">{formatUkuran(item.ukuran)}</span>
            <span aria-hidden="true" className="text-border">
              |
            </span>
            <span className="tabular-nums">
              Diubah {formatTanggalJam(item.diubahPada)}
            </span>
          </div>
        </header>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          render={
            <a
              href={
                item.tautanLihat ??
                `https://drive.google.com/file/d/${item.id}/view`
              }
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLinkIcon />
          Buka di Google Drive
        </Button>

        {!asliGoogle ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={tautanUnduh(item.id)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <DownloadIcon />
            Unduh berkas
          </Button>
        ) : null}

        {induk ? (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={`/dashboard/folder/${induk.id}`} />}
          >
            <ArrowLeftIcon />
            Kembali ke {induk.nama}
          </Button>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Pratinjau</h2>
        {bisaDipratinjau(item.mime) ? (
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <iframe
              src={tautanPratinjau(item.id)}
              title={`Pratinjau ${item.nama}`}
              className="h-[70dvh] w-full"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <Empty className="border border-dashed border-border bg-card/70">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestionIcon />
              </EmptyMedia>
              <EmptyTitle>Jenis berkas ini tidak bisa dipratinjau</EmptyTitle>
              <EmptyDescription>
                Pakai tombol unduh, atau buka berkasnya langsung di Google
                Drive.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Rincian</h2>
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableBody>
              {rincian.map((baris) => (
                <TableRow key={baris.label} className="hover:bg-transparent">
                  <TableCell className="w-40 whitespace-normal px-4 py-3 align-top text-muted-foreground sm:w-52">
                    {baris.label}
                  </TableCell>
                  <TableCell className="whitespace-normal px-4 py-3 break-words">
                    {baris.nilai}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
