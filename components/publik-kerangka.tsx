import Link from "next/link"
import { ArchiveIcon } from "lucide-react"

import { ItemMedia } from "@/components/ui/item"

// Kerangka halaman publik. Sengaja terpisah dari kerangka dasbor: halaman ini
// dibaca orang tua, jadi tidak ada menu internal, tidak ada nama pengguna, dan
// tidak ada jalan masuk ke area staf. Pintu staf cukup lewat alamat /login
// yang dibagikan admin, bukan dipasang di setiap halaman.
//
// Kepala halaman memakai bidang navy penuh, bukan bilah putih tipis: warna
// institusi muncul sebagai bingkai halaman, seperti kop surat sekolah.
export function KepalaPublik() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg outline-offset-4"
        >
          <ItemMedia
            variant="icon"
            className="size-9.5 rounded-lg bg-aksen text-white"
          >
            <ArchiveIcon className="size-4.5" aria-hidden="true" />
          </ItemMedia>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-[0.06em]">
              PKKS SMAN 1 BANTARUJEG
            </span>
            <span className="mt-1.5 text-[13px] text-primary-foreground/75">
              Arsip dokumen penilaian kepala sekolah
            </span>
          </span>
        </Link>

        <span className="hidden items-center gap-1.5 rounded-full bg-aksen px-3.5 py-1.5 text-[13px] font-semibold text-white sm:inline-flex">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-[#7fe3d3]"
          />
          Arsip publik
        </span>
      </div>
    </header>
  )
}
