import Link from "next/link"
import { redirect } from "next/navigation"
import { PanelTidakAda } from "@/components/panel-tidak-ada"
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

  return (
    <div className="space-y-6">
      <nav aria-label="Lokasi berkas" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-redup">
          <li>
            <Link
              href="/dashboard"
              className="font-medium text-navy underline underline-offset-2"
            >
              Arsip
            </Link>
          </li>
          {remah.map((bagian) => (
            <li key={bagian.id} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <Link
                href={`/dashboard/folder/${bagian.id}`}
                className="font-medium text-navy underline underline-offset-2"
              >
                {bagian.nama}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div>
        <h1 className="text-xl font-semibold leading-snug tracking-tight text-tinta sm:text-2xl">
          {item.nama}
        </h1>
        <p className="mt-1 text-sm text-redup">
          {jenisBerkas(item.mime, false)} · {formatUkuran(item.ukuran)} ·
          diubah {formatTanggalJam(item.diubahPada)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={item.tautanLihat ?? `https://drive.google.com/file/d/${item.id}/view`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-sm bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          Buka di Google Drive
        </a>
        {!asliGoogle ? (
          <a
            href={tautanUnduh(item.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-sm border border-navy px-4 text-sm font-semibold text-navy transition-colors hover:bg-navy-lembut"
          >
            Unduh berkas
          </a>
        ) : null}
        {induk ? (
          <Link
            href={`/dashboard/folder/${induk.id}`}
            className="inline-flex min-h-11 items-center rounded-sm border border-garis px-4 text-sm font-medium text-tinta transition-colors hover:bg-kertas-tinggi"
          >
            Kembali ke {induk.nama}
          </Link>
        ) : null}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-tinta">Pratinjau</h2>
        {bisaDipratinjau(item.mime) ? (
          <div className="mt-3 border-l-[3px] border-navy bg-kertas-tinggi">
            <iframe
              src={tautanPratinjau(item.id)}
              title={`Pratinjau ${item.nama}`}
              className="h-[70dvh] w-full"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <p className="mt-3 border-l-[3px] border-garis bg-kertas-tinggi px-4 py-6 text-sm leading-relaxed text-redup">
            Jenis berkas ini tidak bisa ditampilkan di dalam halaman. Pakai
            tombol unduh, atau buka berkasnya langsung di Google Drive.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-tinta">Rincian</h2>
        <dl className="mt-3 divide-y divide-garis border-l-[3px] border-navy bg-kertas-tinggi text-sm">
          {[
            { label: "Nama berkas", nilai: item.nama },
            { label: "Jenis", nilai: jenisBerkas(item.mime, false) },
            { label: "Ukuran", nilai: formatUkuran(item.ukuran) },
            { label: "Terakhir diubah", nilai: formatTanggalJam(item.diubahPada) },
            { label: "Folder induk", nilai: induk ? induk.nama : "Akar arsip" },
            { label: "ID berkas di Drive", nilai: item.id },
          ].map((baris) => (
            <div
              key={baris.label}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <dt className="shrink-0 text-redup">{baris.label}</dt>
              <dd className="break-words text-tinta sm:text-right">
                {baris.nilai}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
