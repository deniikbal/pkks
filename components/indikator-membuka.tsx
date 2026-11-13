"use client"

import { useLinkStatus } from "next/link"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Tanda bahwa klik pada kartu sudah diterima. Selama navigasi berjalan,
// kartu yang diklik menampilkan spinner dan teks "Membuka…". Tanpa tanda
// ini, halaman lama tetap terlihat diam-diam saja sehingga pembaca mengira
// kartunya tidak bisa diklik.
//
// Overlay-nya Posisi absolute supaya tidak menggeser isi kartu, dan
// pointer-events-none supaya tidak menahan klik lain.
export function IndikatorMembuka({ className }: { className?: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-[inherit] bg-background/70 text-sm font-semibold text-foreground opacity-0 transition-opacity duration-150",
          pending && "opacity-100",
          className
        )}
      >
        <Spinner className="size-4" />
        Membuka…
      </span>
      {/* Pembaca layar mendapat kabar yang sama, karena teks di overlay
          disembunyikan darinya. */}
      <span role="status" className="sr-only">
        {pending ? "Membuka folder…" : ""}
      </span>
    </>
  )
}
