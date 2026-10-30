"use client"

import { useState } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import type { BerkasTampil } from "@/components/publik-daftar"
import { Spinner } from "@/components/ui/spinner"

// Berkas Google asli tidak bisa disematkan langsung; yang bisa disematkan
// adalah penampil milik Drive sendiri. Dokumen native Google punya domain
// sendiri, jadi alamatnya dibedakan menurut MIME.
function tautanPratinjau(id: string, mime: string): string {
  const peta: Record<string, string> = {
    "application/vnd.google-apps.document":
      "https://docs.google.com/document/d/",
    "application/vnd.google-apps.spreadsheet":
      "https://docs.google.com/spreadsheets/d/",
    "application/vnd.google-apps.presentation":
      "https://docs.google.com/presentation/d/",
    "application/vnd.google-apps.drawing":
      "https://docs.google.com/drawings/d/",
  }
  return `${peta[mime] ?? "https://drive.google.com/file/d/"}${id}/preview`
}

function IsiPratinjau({ berkas }: { berkas: BerkasTampil }) {
  const [siap, setSiap] = useState(false)

  return (
    <>
      <DialogPrimitive.Title className="sr-only">
        {berkas.nama}
      </DialogPrimitive.Title>

      {siap ? null : (
        <div className="absolute inset-0 grid place-items-center text-white/70">
          <span className="flex items-center gap-3 text-sm">
            <Spinner className="size-5" />
            Memuat dokumen…
          </span>
        </div>
      )}

      <iframe
        src={tautanPratinjau(berkas.id, berkas.mime)}
        title={berkas.nama}
        onLoad={() => setSiap(true)}
        allow="autoplay"
        className="relative h-full w-full border-0"
      />
    </>
  )
}

// Penampil layar penuh: tanpa bingkai, tanpa jarak, hanya isi berkasnya.
export function PratinjauBerkas({
  berkas,
  onTutup,
}: {
  berkas: BerkasTampil | null
  onTutup: () => void
}) {
  return (
    <DialogPrimitive.Root
      open={Boolean(berkas)}
      onOpenChange={(buka) => {
        if (!buka) onTutup()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/90 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-neutral-950 outline-none">
          {berkas ? <IsiPratinjau key={berkas.id} berkas={berkas} /> : null}

          {/* Tombol tutup sengaja putih pekat dengan teks navy: latar penampil
              hampir hitam, jadi bidang terang inilah yang paling kontras.
              Garis tipis gelap + bayangan menjaga tepinya tetap terbaca kalau
              kebetulan berada di atas halaman dokumen yang putih. */}
          <DialogPrimitive.Close
            aria-label="Tutup pratinjau"
            className="absolute top-3 right-3 z-20 inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-primary shadow-[0_4px_16px_rgba(0,0,0,0.35)] ring-1 ring-black/15 transition-colors outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <XIcon className="size-4.5" aria-hidden="true" />
            Tutup
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
