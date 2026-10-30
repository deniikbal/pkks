import Link from "next/link"
import {
  CalendarClockIcon,
  FilesIcon,
  FolderTreeIcon,
  HardDriveIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  DaftarBerkas,
  KartuFolder,
  KelompokBerkas,
} from "@/components/daftar-item"
import { TombolSinkron } from "@/components/tombol-sinkron"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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

  const hasilCari = kata ? await cariItem(kata) : []
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
                <TombolSinkron boleh={sumber.siap} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <form action="/dashboard" method="get" role="search" className="max-w-xl">
        <InputGroup className="h-11 bg-card">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            type="search"
            defaultValue={kata}
            placeholder="Cari nama dokumen"
            aria-label="Cari dokumen"
            className="h-11 text-base md:text-base"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="secondary" size="sm">
              Cari
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      {kata ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            Hasil pencarian &quot;{kata}&quot;
            <span className="ml-2 font-normal text-muted-foreground">
              {hasilCari.length} item
            </span>
          </h2>

          {hasilCari.length === 0 ? (
            <Empty className="border border-dashed border-border bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>Tidak ada dokumen dengan nama itu</EmptyTitle>
                <EmptyDescription>
                  Coba kata lain, atau telusuri lewat daftar folder di{" "}
                  <Link href="/dashboard">halaman utama</Link>.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <KelompokBerkas>
              {hasilCari.map((item) => {
                const induk = item.indukId ? peta.get(item.indukId) : null
                return (
                  <DaftarBerkas
                    key={item.id}
                    item={item}
                    jalur={
                      induk
                        ? jalurKe(induk, peta)
                            .map((j) => j.nama)
                            .join(" / ")
                        : undefined
                    }
                  />
                )
              })}
            </KelompokBerkas>
          )}
        </section>
      ) : null}

      {!kata && folderPuncak.length > 0 ? (
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

      {!kata && berkasTerbaru.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Berkas terbaru diubah</h2>
          <KelompokBerkas>
            {berkasTerbaru.map((item) => (
              <DaftarBerkas key={item.id} item={item} />
            ))}
          </KelompokBerkas>
        </section>
      ) : null}
    </div>
  )
}
