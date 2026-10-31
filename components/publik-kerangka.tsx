import Link from "next/link"
import { ArchiveIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ItemMedia } from "@/components/ui/item"

// Kerangka halaman publik. Sengaja terpisah dari kerangka dasbor: halaman ini
// dibaca orang tua, jadi tidak ada menu internal, tidak ada nama pengguna, dan
// tidak ada jalan masuk ke area staf. Pintu staf cukup lewat alamat /login
// yang dibagikan admin, bukan dipasang di setiap halaman.
export function KepalaPublik() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg outline-offset-4">
          <ItemMedia
            variant="icon"
            className="size-9 rounded-lg bg-primary text-primary-foreground"
          >
            <ArchiveIcon className="size-4.5" aria-hidden="true" />
          </ItemMedia>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide">PKKS</span>
            <span className="mt-1 text-[11px] text-muted-foreground">
              SMAN 1 Bantarujeg
            </span>
          </span>
        </Link>

        <Badge
          variant="outline"
          className="gap-1.5 border-aksen/25 bg-aksen-lembut px-2.5 py-1 text-[11px] font-medium text-aksen"
        >
          <span className="size-1.5 rounded-full bg-aksen" aria-hidden="true" />
          Arsip publik
        </Badge>
      </div>
    </header>
  )
}
