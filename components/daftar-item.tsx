import Link from "next/link"
import type { ItemDrive } from "@/lib/data"
import { formatTanggal, formatUkuran, jenisBerkas } from "@/lib/format"

// Kartu folder: menampilkan nama folder dan jumlah isi yang benar-benar
// tersinkron, bukan angka karangan.
export function KartuFolder({
  item,
  isi,
}: {
  item: ItemDrive
  isi: { folder: number; berkas: number }
}) {
  return (
    <Link
      href={`/dashboard/folder/${item.id}`}
      className="flex min-h-24 flex-col justify-between border-l-[3px] border-navy bg-kertas-tinggi p-4 transition-colors hover:bg-navy-lembut/60"
    >
      <span className="text-sm font-semibold leading-snug text-tinta">
        {item.nama}
      </span>
      <span className="mt-3 text-xs text-redup">
        {isi.folder > 0 ? `${isi.folder} subfolder` : null}
        {isi.folder > 0 && isi.berkas > 0 ? ", " : null}
        {isi.berkas > 0 ? `${isi.berkas} berkas` : null}
        {isi.folder === 0 && isi.berkas === 0 ? "Folder kosong" : null}
      </span>
    </Link>
  )
}

// Satu baris berkas. Di layar sempit susunannya menumpuk, di layar lebar
// menjadi satu baris dengan kolom kanan sejajar.
export function BarisBerkas({
  item,
  jalur,
}: {
  item: ItemDrive
  jalur?: string
}) {
  return (
    <li className="border-b border-garis last:border-b-0">
      <Link
        href={`/dashboard/dokumen/${item.id}`}
        className="flex min-h-14 flex-col gap-1 px-4 py-3 transition-colors hover:bg-navy-lembut/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-tinta">
            {item.nama}
          </span>
          <span className="mt-0.5 block text-xs text-redup">
            {jenisBerkas(item.mime, item.folder)}
            {jalur ? ` · ${jalur}` : null}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-4 text-xs text-redup">
          <span className="tabular-nums">
            {formatUkuran(item.ukuran)}
          </span>
          <span className="tabular-nums">{formatTanggal(item.diubahPada)}</span>
        </span>
      </Link>
    </li>
  )
}
