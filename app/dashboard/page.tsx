import Link from "next/link"
import { penggunaSaatIni } from "@/lib/auth"
import {
  ambilLogTerakhir,
  ambilRingkasan,
  ambilSemuaItem,
  cariItem,
  jalurKe,
  type ItemDrive,
} from "@/lib/data"
import { statusSumber } from "@/lib/drive"
import { formatTanggalJam, formatUkuran } from "@/lib/format"
import { BarisBerkas, KartuFolder } from "@/components/daftar-item"
import { TombolSinkron } from "@/components/tombol-sinkron"

export const dynamic = "force-dynamic"

function PanelKeterangan({
  judul,
  nada,
  children,
}: {
  judul: string
  nada: "arsip" | "netral"
  children: React.ReactNode
}) {
  const kelas =
    nada === "arsip"
      ? "border-arsip bg-arsip-lembut"
      : "border-garis bg-kertas-tinggi"
  return (
    <section className={`border-l-[3px] ${kelas} p-5`}>
      <h2 className="text-base font-semibold text-tinta">{judul}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-tinta">
        {children}
      </div>
    </section>
  )
}

export default async function Dasbor({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const pengguna = await penggunaSaatIni()
  const kata = ((await searchParams).q ?? "").trim()
  const sumber = statusSumber()
  const ringkasan = await ambilRingkasan()
  const log = await ambilLogTerakhir()
  const items = await ambilSemuaItem()

  const peta = new Map<string, ItemDrive>(items.map((i) => [i.id, i]))
  const jumlahAnak = new Map<string, { folder: number; berkas: number }>()
  for (const item of items) {
    if (!item.indukId) continue
    const sekarang = jumlahAnak.get(item.indukId) ?? { folder: 0, berkas: 0 }
    if (item.folder) sekarang.folder += 1
    else sekarang.berkas += 1
    jumlahAnak.set(item.indukId, sekarang)
  }

  const akar = items.find((i) => !i.indukId) ?? null
  const folderPuncak = akar
    ? items.filter((i) => i.folder && i.indukId === akar.id)
    : items.filter((i) => i.folder && !i.indukId)

  const berkasTerbaru = items
    .filter((i) => !i.folder)
    .sort((a, b) => {
      const ta = a.diubahPada ? Date.parse(a.diubahPada) : 0
      const tb = b.diubahPada ? Date.parse(b.diubahPada) : 0
      return tb - ta
    })
    .slice(0, 12)

  const hasilCari = kata ? await cariItem(kata) : []
  const adaData = ringkasan.jumlahBerkas + ringkasan.jumlahFolder > 0
  const admin = pengguna?.peran === "admin"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-tinta sm:text-2xl">
          Arsip dokumen PKKS
        </h1>
        <p className="mt-1 text-sm text-redup">
          Daftar dokumen penilaian kinerja kepala sekolah yang tersimpan di
          Google Drive sekolah.
        </p>
      </div>

      {/* Blok status sumber data. Ini satu-satunya bagian yang berbeda dari
          pola daftar di bawahnya, supaya keadaan "belum tersambung" tidak
          terlewat. */}
      {!sumber.siap ? (
        <PanelKeterangan judul="Sumber data belum tersambung" nada="arsip">
          <p>{sumber.pesan}</p>
          <p>
            Yang perlu dilengkapi admin sekolah: ID folder Google Drive, berkas
            kredensial service account, lalu folder itu dibagikan ke alamat
            email service account dengan izin lihat. Selama tiga hal itu belum
            lengkap, halaman ini memang tidak menampilkan dokumen apa pun.
          </p>
          <p className="text-xs text-redup">
            Cara pengisiannya ada di berkas README pada server aplikasi ini.
          </p>
        </PanelKeterangan>
      ) : !adaData ? (
        <PanelKeterangan judul="Belum ada data tersinkron" nada="netral">
          <p>
            Kredensial dan folder sudah terisi, tetapi belum ada data yang
            diambil dari Google Drive. Jalankan sinkronisasi sekali untuk
            mengisi daftar.
          </p>
          {admin ? (
            <TombolSinkron boleh />
          ) : (
            <p className="text-xs text-redup">
              Sinkronisasi hanya bisa dijalankan akun admin.
            </p>
          )}
        </PanelKeterangan>
      ) : (
        <section className="border-l-[3px] border-navy bg-kertas-tinggi px-4 py-3">
          <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-redup">Berkas</dt>
              <dd className="font-semibold tabular-nums text-tinta">
                {ringkasan.jumlahBerkas}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-redup">Folder</dt>
              <dd className="font-semibold tabular-nums text-tinta">
                {ringkasan.jumlahFolder}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-redup">Ukuran</dt>
              <dd className="font-semibold tabular-nums text-tinta">
                {formatUkuran(ringkasan.totalByte)}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-redup">Terakhir diambil</dt>
              <dd className="tabular-nums text-tinta">
                {formatTanggalJam(ringkasan.diperbaruiPada)}
              </dd>
            </div>
          </dl>
          {log && log.status === "gagal" ? (
            <p className="mt-3 border-t border-garis pt-3 text-sm text-arsip">
              Sinkron terakhir gagal: {log.galat ?? "tanpa keterangan"}.
            </p>
          ) : null}
          {admin ? (
            <div className="mt-3 border-t border-garis pt-3">
              <TombolSinkron boleh={sumber.siap} />
            </div>
          ) : null}
        </section>
      )}

      <form action="/dashboard" method="get" className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Cari dokumen
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={kata}
          placeholder="Cari nama dokumen"
          className="h-12 w-full min-w-0 rounded-sm border border-garis bg-kertas-tinggi px-3 text-base text-tinta placeholder:text-redup/70"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-sm border border-navy px-4 text-sm font-semibold text-navy transition-colors hover:bg-navy-lembut"
        >
          Cari
        </button>
      </form>

      {kata ? (
        <section>
          <h2 className="text-sm font-semibold text-tinta">
            Hasil pencarian &quot;{kata}&quot;
            <span className="ml-2 font-normal text-redup">
              {hasilCari.length} item
            </span>
          </h2>
          {hasilCari.length === 0 ? (
            <p className="mt-3 border-l-[3px] border-garis bg-kertas-tinggi px-4 py-6 text-sm text-redup">
              Tidak ada dokumen dengan nama itu. Coba kata lain, atau telusuri
              lewat daftar folder di{" "}
              <Link
                href="/dashboard"
                className="font-medium text-navy underline underline-offset-2"
              >
                halaman utama
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 border-l-[3px] border-navy bg-kertas-tinggi">
              {hasilCari.map((item) => {
                const induk = item.indukId ? peta.get(item.indukId) : null
                return (
                  <BarisBerkas
                    key={item.id}
                    item={item}
                    jalur={induk ? jalurKe(induk, peta).map((j) => j.nama).join(" / ") : undefined}
                  />
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {!kata && folderPuncak.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-tinta">Folder</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {folderPuncak.map((folder) => (
              <KartuFolder
                key={folder.id}
                item={folder}
                isi={jumlahAnak.get(folder.id) ?? { folder: 0, berkas: 0 }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!kata && berkasTerbaru.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-tinta">
            Berkas terbaru diubah
          </h2>
          <ul className="mt-3 border-l-[3px] border-navy bg-kertas-tinggi">
            {berkasTerbaru.map((item) => (
              <BarisBerkas key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
