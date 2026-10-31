import Link from "next/link"
import {
  CalendarClockIcon,
  FilesIcon,
  FolderTreeIcon,
  HardDriveIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { DaftarBerkas } from "@/components/daftar-berkas-dasbor"
import { KartuFolder } from "@/components/daftar-item"
import { PencarianDasbor } from "@/components/pencarian-dasbor"
import { TombolSinkron } from "@/components/tombol-sinkron"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { penggunaSaatIni } from "@/lib/auth"
import {
  ambilLogTerakhir,
  ambilRingkasan,
  ambilSemuaItem,
  jalurKe,
  type ItemDrive,
} from "@/lib/data"
import { statusSumber } from "@/lib/drive"
import { formatTanggalJam, formatUkuran } from "@/lib/format"

export const dynamic = "force-dynamic"

const angka = new Intl.NumberFormat("id-ID")

function KartuStatistik({
  label,
  nilai,
  ikon,
}: {
  label: string
  nilai: string
  ikon: React.ReactNode
}) {
  return (
    <Card size="sm" className="gap-1.5">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground/70 [&_svg]:size-3.5">
            {ikon}
          </span>
          {label}
        </CardDescription>
        <CardTitle className="text-lg font-semibold tracking-tight tabular-nums">
          {nilai}
        </CardTitle>
      </CardHeader>
    </Card>
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

  // Daftar untuk pencarian di peramban. Jalur folder dihitung di sini supaya
  // baris hasil bisa menyebut letak berkas tanpa satu query tambahan, dan
  // folder akar ("PKKS 2026") dilewati — sama seperti remah roti.
  const daftarCari = items.map((i) => {
    const induk = i.indukId ? peta.get(i.indukId) : null
    return {
      item: i,
      jalur: induk
        ? jalurKe(induk, peta)
            .filter((j) => j.indukId !== null)
            .map((j) => j.nama)
            .join(" / ")
        : undefined,
    }
  })
  const adaData = ringkasan.jumlahBerkas + ringkasan.jumlahFolder > 0
  const admin = pengguna?.peran === "admin"

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Arsip dokumen PKKS
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Daftar dokumen penilaian kinerja kepala sekolah yang tersimpan di
          Google Drive sekolah.
        </p>
      </header>

      {/* Keadaan sumber data. Selalu muncul paling atas supaya keadaan "belum
          tersambung" tidak terlewat di balik daftar yang kosong. */}
      {!sumber.siap ? (
        <Alert variant="destructive" className="bg-destructive/5">
          <TriangleAlertIcon />
          <AlertTitle>Sumber data belum tersambung</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{sumber.pesan}</p>
            <p>
              Yang perlu dilengkapi admin sekolah: ID folder Google Drive,
              kredensial akun layanan, lalu folder itu dibagikan ke alamat email
              akun tersebut dengan izin lihat. Selama tiga hal itu belum
              lengkap, halaman ini memang tidak menampilkan dokumen apa pun.
            </p>
            <p className="text-xs">
              Panduan pengisian ada di README dan docs/oauth-google-drive.md.
            </p>
          </AlertDescription>
        </Alert>
      ) : !adaData ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada data tersinkron</CardTitle>
            <CardDescription>
              Kredensial dan folder sudah terisi, tetapi belum ada data yang
              diambil dari Google Drive. Jalankan sinkronisasi sekali untuk
              mengisi daftar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admin ? (
              <TombolSinkron boleh />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sinkronisasi hanya bisa dijalankan akun admin.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <section
            aria-label="Ringkasan arsip"
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            <KartuStatistik
              label="Berkas"
              nilai={angka.format(ringkasan.jumlahBerkas)}
              ikon={<FilesIcon aria-hidden="true" />}
            />
            <KartuStatistik
              label="Folder"
              nilai={angka.format(ringkasan.jumlahFolder)}
              ikon={<FolderTreeIcon aria-hidden="true" />}
            />
            <KartuStatistik
              label="Ukuran"
              nilai={formatUkuran(ringkasan.totalByte)}
              ikon={<HardDriveIcon aria-hidden="true" />}
            />
            <KartuStatistik
              label="Terakhir diambil"
              nilai={formatTanggalJam(ringkasan.diperbaruiPada)}
              ikon={<CalendarClockIcon aria-hidden="true" />}
            />
          </section>

          {log && log.status === "gagal" ? (
            <Alert variant="destructive" className="bg-destructive/5">
              <TriangleAlertIcon />
              <AlertTitle>Sinkron terakhir gagal</AlertTitle>
              <AlertDescription>
                {log.galat ?? "Tanpa keterangan."}
              </AlertDescription>
            </Alert>
          ) : null}

          {admin ? (
            <Card size="sm">
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Ambil ulang daftar berkas dari Google Drive sekolah.
                </p>
                <TombolSinkron
                  boleh={sumber.siap}
                  idBerjalan={
                    log?.status === "jalan" ? log.id : null
                  }
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <PencarianDasbor awal={kata} daftar={daftarCari}>
        {folderPuncak.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Folder</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

        {berkasTerbaru.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Berkas terbaru diubah</h2>
            <DaftarBerkas baris={berkasTerbaru.map((item) => ({ item }))} />
          </section>
        ) : null}
      </PencarianDasbor>
    </div>
  )
}
