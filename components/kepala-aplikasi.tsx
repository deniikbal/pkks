import Link from "next/link"
import { ArchiveIcon } from "lucide-react"

import { MenuPengguna } from "@/components/menu-pengguna"

export function Merek({ ringkas = false }: { ringkas?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-lg outline-offset-4"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
        <ArchiveIcon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-wide">PKKS</span>
        <span className="mt-1 text-[11px] text-primary-foreground/70">
          {ringkas ? "Arsip dokumen" : "SMAN 1 Bantarujeg"}
        </span>
      </span>
    </Link>
  )
}

export function KepalaAplikasi({
  pengguna,
}: {
  pengguna: { nama: string; email: string; peran: "admin" | "pengawas" }
}) {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Merek />

        <div className="ml-auto flex items-center gap-1">
          <MenuPengguna
            nama={pengguna.nama}
            email={pengguna.email}
            peran={pengguna.peran}
          />
        </div>
      </div>
    </header>
  )
}
