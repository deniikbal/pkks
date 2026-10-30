"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CircleCheckIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"

import { aksiSinkron, type KeadaanSinkron } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const keadaanAwal: KeadaanSinkron = { pesan: null, jenis: null }

function TombolKirim({ boleh }: { boleh: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || !boleh} className="h-9 px-3.5">
      {pending ? <Spinner /> : <RefreshCwIcon />}
      {pending ? "Menyinkronkan..." : "Sinkronkan dari Drive"}
    </Button>
  )
}

export function TombolSinkron({ boleh }: { boleh: boolean }) {
  const [keadaan, kirim] = useActionState(aksiSinkron, keadaanAwal)
  const gagal = keadaan.jenis === "gagal"

  return (
    <div className="space-y-3">
      <form action={kirim}>
        <TombolKirim boleh={boleh} />
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
