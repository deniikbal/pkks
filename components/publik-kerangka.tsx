import Link from "next/link"
import { ArchiveIcon, ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

// Kerangka halaman publik. Sengaja terpisah dari kerangka dasbor: halaman ini
// dibaca orang tua, jadi tidak ada menu internal, tidak ada nama pengguna, dan
// tidak ada tombol yang hanya berguna bagi staf.
export function KepalaPublik({ masuk }: { masuk: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg outline-offset-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ArchiveIcon className="size-4.5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide">PKKS</span>
            <span className="mt-1 text-[11px] text-muted-foreground">
              SMAN 1 Bantarujeg
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-aksen/25 bg-aksen-lembut px-2.5 py-1 text-[11px] font-medium text-aksen sm:inline-flex">
            <span className="size-1.5 rounded-full bg-aksen" aria-hidden="true" />
            Arsip publik
          </span>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={masuk ? "/dashboard" : "/login"} />}
            className="h-9 px-3.5"
          >
            {masuk ? "Buka dasbor" : "Masuk staf"}
          </Button>
        </div>
      </div>
    </header>
  )
}

export function KakiPublik() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ArchiveIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">Arsip PKKS</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            SMA Negeri 1 Bantarujeg, Kabupaten Majalengka. Daftar dokumen ini
            mengikuti isi Google Drive sekolah; berkas aslinya tidak disalin ke
            aplikasi.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium">Untuk staf sekolah</p>
          <p className="mt-1 text-muted-foreground">
            Kelola arsip dan jalankan sinkronisasi dari dasbor.
          </p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
            className="mt-3"
          >
            Masuk ke dasbor
            <ExternalLinkIcon />
          </Button>
        </div>
      </div>
    </footer>
  )
}
