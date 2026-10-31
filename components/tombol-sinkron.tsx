"use client"

import { useEffect, useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { CircleCheckIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"

import { aksiSinkron, type KeadaanSinkron } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

const keadaanAwal: KeadaanSinkron = { pesan: null, jenis: null, idLog: null }

/** Bentuk balasan /api/sinkron/status. */
type Kemajuan = {
  status: "jalan" | "sukses" | "gagal"
  tahap: string | null
  persen: number
  folderSelesai: number
  folderTotal: number
  jumlahItem: number
  jumlahFolder: number
  galat: string | null
}

const JEDA_PANTAU_MS = 1000

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

  // Sebelum baris log dibuat (dan sebelum idLog diketahui), server action
  // belum mengirim apa pun. Selama itu bilah tampil tanpa angka — lebih jujur
  // daripada menampilkan 0% yang tidak bergerak.
  if (pending && !adaSumber) {
    return (
      <div className="space-y-1.5">
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

  const berjalan = kemajuan.status === "jalan"
  const persen = kemajuan.persen

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
        <span className="font-medium">
          {berjalan
            ? labelTahap(kemajuan)
            : kemajuan.status === "sukses"
              ? "Sinkron selesai"
              : "Sinkron berhenti"}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {berjalan && kemajuan.tahap === "jelajah"
            ? `${persen}% · ${kemajuan.jumlahItem} item`
            : `${persen}%`}
        </span>
      </div>

      <Progress
        value={persen}
        getAriaValueText={() => labelTahap(kemajuan)}
        className="gap-0"
      >
        <ProgressTrack className="h-1.5 bg-muted-foreground/15">
          <ProgressIndicator
            className={
              kemajuan.status === "gagal" ? "bg-destructive" : "bg-primary"
            }
          />
        </ProgressTrack>
      </Progress>

      {berjalan ? (
        <p className="text-[11px] text-muted-foreground">
          Diperbarui tiap detik. Jumlah folder total baru pasti setelah
          penelusuran selesai, jadi angka ini perkiraan yang terus maju.
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
