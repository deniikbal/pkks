"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { aksiSinkron, type KeadaanSinkron } from "@/app/actions"

const keadaanAwal: KeadaanSinkron = { pesan: null, jenis: null }

function TombolKirim({ boleh }: { boleh: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || !boleh}
      className="min-h-11 rounded-sm bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menyinkronkan..." : "Sinkronkan dari Drive"}
    </button>
  )
}

export function TombolSinkron({ boleh }: { boleh: boolean }) {
  const [keadaan, kirim] = useActionState(aksiSinkron, keadaanAwal)

  return (
    <div className="space-y-3">
      <form action={kirim}>
        <TombolKirim boleh={boleh} />
      </form>
      {keadaan.pesan ? (
        <p
          role="status"
          className={
            keadaan.jenis === "gagal"
              ? "rounded-sm border border-arsip/40 bg-arsip-lembut px-3 py-2 text-sm text-arsip"
              : "rounded-sm border border-sahih/40 bg-sahih-lembut px-3 py-2 text-sm text-sahih"
          }
        >
          {keadaan.pesan}
        </p>
      ) : null}
    </div>
  )
}
