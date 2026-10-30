import Link from "next/link"
import { PanelTidakAda } from "@/components/panel-tidak-ada"
import { ambilSemuaItem, jalurKe, type ItemDrive } from "@/lib/data"
import { BarisBerkas, KartuFolder } from "@/components/daftar-item"

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
    <div className="space-y-6">
      <nav aria-label="Lokasi folder" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-redup">
          <li>
            <Link
              href="/dashboard"
              className="font-medium text-navy underline underline-offset-2"
            >
              Arsip
            </Link>
          </li>
          {remah.map((bagian, urutan) => {
            const terakhir = urutan === remah.length - 1
            return (
              <li key={bagian.id} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {terakhir ? (
                  <span className="text-tinta">{bagian.nama}</span>
                ) : (
                  <Link
                    href={`/dashboard/folder/${bagian.id}`}
                    className="font-medium text-navy underline underline-offset-2"
                  >
                    {bagian.nama}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-tinta sm:text-2xl">
          {folder.nama}
        </h1>
        <p className="mt-1 text-sm text-redup">
          {subfolder.length} subfolder, {berkas.length} berkas langsung di
          folder ini.
        </p>
      </div>

      {anak.length === 0 ? (
        <p className="border-l-[3px] border-garis bg-kertas-tinggi px-4 py-6 text-sm text-redup">
          Folder ini kosong, atau isinya belum ikut tersinkron. Admin bisa
          menjalankan sinkronisasi dari halaman arsip.
        </p>
      ) : null}

      {subfolder.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-tinta">Subfolder</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <section>
          <h2 className="text-sm font-semibold text-tinta">Berkas</h2>
          <ul className="mt-3 border-l-[3px] border-navy bg-kertas-tinggi">
            {berkas.map((item) => (
              <BarisBerkas key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
