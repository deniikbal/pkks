import Link from "next/link"
import {
  ChevronRightIcon,
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { ItemDrive } from "@/lib/data"
import { formatTanggal, formatUkuran, jenisBerkas } from "@/lib/format"

// Ikon dipilih dari MIME yang benar-benar dikirim Drive, bukan dari akhiran
// nama berkas yang bisa saja salah.
export function IkonBerkas({ mime, folder }: { mime: string; folder: boolean }) {
  if (folder) return <FolderIcon aria-hidden="true" />
  if (mime.startsWith("image/")) return <FileImageIcon aria-hidden="true" />
  if (mime.includes("spreadsheet") || mime.includes("ms-excel"))
    return <FileSpreadsheetIcon aria-hidden="true" />
  if (
    mime === "application/pdf" ||
    mime.includes("document") ||
    mime.includes("word")
  )
    return <FileTextIcon aria-hidden="true" />
  return <FileIcon aria-hidden="true" />
}

// Kartu folder: menampilkan nama folder dan jumlah isi yang benar-benar
// tersinkron, bukan angka karangan.
export function KartuFolder({
  item,
  isi,
}: {
  item: ItemDrive
  isi: { folder: number; berkas: number }
}) {
  const keterangan = [
    isi.folder > 0 ? `${isi.folder} subfolder` : null,
    isi.berkas > 0 ? `${isi.berkas} berkas` : null,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Link
      href={`/dashboard/folder/${item.id}`}
      className="group/card rounded-xl outline-offset-4"
    >
      <Card
        size="sm"
        className="h-full transition-colors group-hover/card:bg-accent/50 group-hover/card:ring-primary/25"
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <FolderIcon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-2 text-sm leading-snug">
                {item.nama}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {keterangan || "Folder kosong"}
              </CardDescription>
            </div>
            <ChevronRightIcon
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover/card:translate-x-0.5"
            />
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

// Satu baris berkas. Seluruh baris adalah tautan, jadi pengguna tidak perlu
// mengarahkan kursor tepat ke nama berkas.
export function DaftarBerkas({
  item,
  jalur,
}: {
  item: ItemDrive
  jalur?: string
}) {
  return (
    <Item
      render={<Link href={`/dashboard/dokumen/${item.id}`} />}
      className="gap-3 rounded-none px-4 py-3 hover:bg-accent/50 focus-visible:ring-inset"
    >
      <ItemMedia variant="icon" className="text-muted-foreground">
        <IkonBerkas mime={item.mime} folder={item.folder} />
      </ItemMedia>

      <ItemContent className="min-w-0">
        <ItemTitle className="w-full min-w-0">
          <span className="truncate">{item.nama}</span>
        </ItemTitle>
        <ItemDescription className="text-xs">
          {jenisBerkas(item.mime, item.folder)}
          {jalur ? ` · ${jalur}` : null}
        </ItemDescription>
      </ItemContent>

      <ItemActions className="w-full justify-between gap-4 text-xs text-muted-foreground sm:w-auto sm:justify-end">
        <span className="tabular-nums">{formatUkuran(item.ukuran)}</span>
        <span className="tabular-nums">{formatTanggal(item.diubahPada)}</span>
      </ItemActions>
    </Item>
  )
}

// Pembungkus daftar: satu bidang berkartu dengan garis pemisah antar baris.
export function KelompokBerkas({ children }: { children: React.ReactNode }) {
  return (
    <ItemGroup className="gap-0 divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {children}
    </ItemGroup>
  )
}
