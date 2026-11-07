"use client"

import { useEffect, useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  CircleCheckIcon,
  ClockIcon,
  FilesIcon,
  FolderTreeIcon,
  HardDriveIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { aksiSinkron, type KeadaanSinkron } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { formatUkuran } from "@/lib/format"

const keadaanAwal: KeadaanSinkron = { pesan: null, jenis: null, idLog: null }

/** Bentuk balasan /api/sinkron/status. */
type Kemajuan = {
  status: "jalan" | "sukses" | "gagal"
  tahap: string | null
  persen: number
  folderSelesai: number
  folderTotal: number
  perkiraanTotal: number
  jumlahItem: number
  jumlahFolder: number
  totalByte: number
  galat: string | null
  mulai: string | null
  selesai: string | null
}

const JEDA_PANTAU_MS = 1000

/** Angka ribuan gaya Indonesia, dipakai untuk hitungan item/folder. */
const angka = new Intl.NumberFormat("id-ID")

/** "1m 23d" dari milidetik. Dipakai untuk lama proses berjalan. */
function durasi(ms: number): string {
  const totalDetik = Math.max(0, Math.floor(ms / 1000))
  const menit = Math.floor(totalDetik / 60)
  const detik = totalDetik % 60
  return menit > 0 ? `${menit}m ${detik}d` : `${detik}d`
}

/** Kalimat keadaan untuk pembaca. Ditulis apa adanya, bukan kode tahap. */
function labelTahap(k: Kemajuan | null): string {
  switch (k?.tahap) {
    case "token":
      return "Menghubungi Google Drive"
    case "akar":
      return "Membaca folder akar"
    case "jelajah":
      return k.folderTotal > 0
        ? `Menelusuri folder ${k.folderSelesai} dari ${k.folderTotal}`
        : "Menelusuri folder"
    case "rapikan":
      return "Merapikan daftar yang tidak lagi ada di Drive"
    default:
      return "Menyiapkan sinkronisasi"
  }
}

/** Satu angka ringkas: ikon kecil, nilai, label. Dipakai di baris statistik
 *  supaya tiga angka bisa dibandingkan sekilas, bukan dibaca satu per satu. */
function Angka({
  ikon,
  nilai,
  label,
}: {
  ikon: React.ReactNode
  nilai: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground [&_svg]:size-4">{ikon}</span>
      <span className="leading-tight">
        <span className="block font-semibold tabular-nums">{nilai}</span>
        <span className="block text-[11px] text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  )
}

/** Isi bilah. Dipisah komponennya supaya useFormStatus() bisa dipakai; hook
 *  itu hanya membaca status form di atasnya. */
function Bilah({
  kemajuan,
  adaSumber,
}: {
  kemajuan: Kemajuan | null
  adaSumber: boolean
}) {
  const { pending } = useFormStatus()

  // Jam berdetak tiap detik selama proses jalan, dipakai untuk "sudah berjalan
  // 2m 13d". Tanpa ini, proses yang sedang memindai folder besar terlihat
  // diam saja di mata admin, padahal ia bekerja.
  const [sekarang, setSekarang] = useState(() => Date.now())
  const berjalan = kemajuan?.status === "jalan"

  useEffect(() => {
    if (!berjalan) return
    const t = setInterval(() => setSekarang(Date.now()), JEDA_PANTAU_MS)
    return () => clearInterval(t)
  }, [berjalan])

  // Sebelum baris log dibuat (dan sebelum idLog diketahui), server action
  // belum mengirim apa pun. Selama itu bilah tampil tanpa angka — lebih jujur
  // daripada menampilkan 0% yang tidak bergerak.
  if (pending && !adaSumber) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium">{labelTahap(null)}</p>
        <Progress value={null} className="gap-0">
          <ProgressTrack className="h-1.5 bg-muted-foreground/15">
            <ProgressIndicator className="w-1/3 animate-pulse" />
          </ProgressTrack>
        </Progress>
      </div>
    )
  }

  if (!kemajuan) return null

  const persen = kemajuan.persen
  const lagiJelajah = berjalan && kemajuan.tahap === "jelajah"

  // Lama berjalan: dari waktu mulai log sampai sekarang (kalau masih jalan)
  // atau sampai waktu selesai (kalau sudah berhenti).
  const mulai = kemajuan.mulai ? Date.parse(kemajuan.mulai) : null
  const akhir = kemajuan.selesai ? Date.parse(kemajuan.selesai) : sekarang
  const lama = mulai ? durasi(akhir - mulai) : null

  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-muted/40 p-3"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-sm font-semibold">
          {berjalan
            ? labelTahap(kemajuan)
            : kemajuan.status === "sukses"
              ? "Sinkron selesai"
              : "Sinkron berhenti"}
        </span>
        <span className="text-sm font-semibold tabular-nums">{persen}%</span>
      </div>

      <Progress
        value={persen}
        getAriaValueText={() => labelTahap(kemajuan)}
        className="gap-0"
      >
        <ProgressTrack className="h-2 bg-muted-foreground/15">
          <ProgressIndicator
            className={
              kemajuan.status === "gagal" ? "bg-destructive" : "bg-primary"
            }
          />
        </ProgressTrack>
      </Progress>

      {/* Statistik hidup. Ditampilkan sejak awal proses, jadi admin melihat
          angkanya bertambah meski tahapnya masih "Menghubungi Google Drive". */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Angka
          ikon={<FolderTreeIcon aria-hidden="true" />}
          nilai={
            lagiJelajah
              ? `${angka.format(kemajuan.folderSelesai)} / ${angka.format(
                  Math.max(kemajuan.perkiraanTotal, kemajuan.folderTotal, 1)
                )}`
              : angka.format(kemajuan.jumlahFolder)
          }
          label={lagiJelajah ? "folder dipindai (perkiraan)" : "folder"}
        />
        <Angka
          ikon={<FilesIcon aria-hidden="true" />}
          nilai={angka.format(kemajuan.jumlahItem)}
          label="item ditemukan"
        />
        {kemajuan.totalByte > 0 ? (
          <Angka
            ikon={<HardDriveIcon aria-hidden="true" />}
            nilai={formatUkuran(kemajuan.totalByte)}
            label="ukuran terbaca"
          />
        ) : null}
        {lama ? (
          <Angka
            ikon={<ClockIcon aria-hidden="true" />}
            nilai={lama}
            label={berjalan ? "berjalan" : "selesai dalam"}
          />
        ) : null}
      </div>

      {lagiJelajah ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Jumlah folder total baru pasti setelah penelusuran selesai, jadi
          angka penyebutnya perkiraan dari sinkron terakhir. Bilah sengaja
          ditahan di ujung daripada bergerak mundur.
        </p>
      ) : null}
    </div>
  )
}

export function TombolSinkron({
  boleh,
  idBerjalan = null,
}: {
  boleh: boolean
  /** Id log sinkron yang masih 'jalan' saat halaman dimuat — misalnya karena
   *  halaman dimuat ulang di tengah proses. */
  idBerjalan?: string | null
}) {
  const [keadaan, kirim] = useActionState(aksiSinkron, keadaanAwal)
  const [kemajuan, setKemajuan] = useState<Kemajuan | null>(null)
  const gagal = keadaan.jenis === "gagal"

  // Baris log mana yang sedang dipantau: hasil aksi di halaman ini, atau baris
  // yang sudah berjalan sebelum halaman dimuat.
  const idDipantau = keadaan.jenis ? keadaan.idLog : idBerjalan

  // Server action tidak mengirim kemajuan apa pun ke peramban selama berjalan,
  // jadi bilah menanyakannya sendiri tiap detik dan berhenti begitu status log
  // tidak lagi "jalan".
  useEffect(() => {
    if (!idDipantau) {
      setKemajuan(null)
      return
    }

    let batal = false
    let pengatur: ReturnType<typeof setTimeout> | undefined

    async function pantau(id: string) {
      try {
        const respons = await fetch(
          `/api/sinkron/status?id=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        )
        if (!respons.ok) throw new Error(String(respons.status))
        const data = (await respons.json()) as Kemajuan
        if (batal) return
        setKemajuan(data)
        if (data.status === "jalan") {
          pengatur = setTimeout(() => pantau(id), JEDA_PANTAU_MS)
        }
      } catch {
        if (batal) return
        pengatur = setTimeout(() => pantau(id), JEDA_PANTAU_MS * 3)
      }
    }

    pantau(idDipantau)
    return () => {
      batal = true
      if (pengatur) clearTimeout(pengatur)
    }
  }, [idDipantau])

  return (
    <div className="space-y-3">
      <form action={kirim} className="space-y-3">
        <TombolKirim boleh={boleh} />
        <Bilah kemajuan={kemajuan} adaSumber={Boolean(idDipantau)} />
      </form>

      {keadaan.pesan ? (
        <Alert
          role={gagal ? "alert" : "status"}
          variant={gagal ? "destructive" : "default"}
          className={
            gagal
              ? "bg-destructive/5"
              : "border-sahih/30 bg-sahih-lembut text-sahih [&_[data-slot=alert-description]]:text-sahih"
          }
        >
          {gagal ? <TriangleAlertIcon /> : <CircleCheckIcon />}
          <AlertTitle>{gagal ? "Sinkron gagal" : "Sinkron selesai"}</AlertTitle>
          <AlertDescription>{keadaan.pesan}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

function TombolKirim({ boleh }: { boleh: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || !boleh} className="h-9 px-3.5">
      {pending ? <Spinner /> : <RefreshCwIcon />}
      {pending ? "Menyinkronkan..." : "Sinkronkan dari Drive"}
    </Button>
  )
}
