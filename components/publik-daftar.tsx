import Link from "next/link"
import {
  ArrowRightIcon,
  ClipboardListIcon,
  CompassIcon,
  EyeIcon,
  FolderIcon,
  SproutIcon,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ItemDrive } from "@/lib/data"
import { cn } from "@/lib/utils"

// Nama folder di Drive sudah bernomor ("1.1 Manajerial"). Nomornya dipakai
// sebagai penanda visual, judulnya dibersihkan supaya tidak dobel.
export function pecahNama(nama: string): { nomor: string | null; judul: string } {
  const cocok = nama.match(/^(\d+(?:\.\d+)*)\.?\s+(.+)$/)
  return cocok
    ? { nomor: cocok[1], judul: cocok[2] }
    : { nomor: null, judul: nama }
}

// Ikon dipilih dari kata kunci nama bagian, dengan fallback folder biasa.
// Tidak ada daftar tetap, jadi bagian baru tetap tampil wajar.
export function ikonBagian(nama: string): LucideIcon {
  const n = nama.toLowerCase()
  if (n.includes("manajerial")) return ClipboardListIcon
  if (n.includes("supervisi")) return EyeIcon
  if (n.includes("wirausaha")) return SproutIcon
  if (n.includes("pancawaluya")) return CompassIcon
  return FolderIcon
}

export function KartuBagian({
  item,
  jumlahBerkas,
  subfolder,
  ringkas = false,
}: {
  item: ItemDrive
  jumlahBerkas: number
  subfolder: ItemDrive[]
  /** Versi padat untuk grid empat kolom di beranda (satu layar penuh). */
  ringkas?: boolean
}) {
  const { nomor, judul } = pecahNama(item.nama)
  const Ikon = ikonBagian(item.nama)
  const contoh = subfolder.slice(0, 3)
  const sisa = subfolder.length - contoh.length

  // Bagian yang benar-benar kosong tidak dijadikan tautan: tidak ada gunanya
  // mengantar pembaca ke halaman kosong. Di beranda kartunya mengisi sel dan
  // isinya ditengahkan supaya sejajar dengan kartu lain; di halaman folder
  // dibiarkan pendek supaya terlihat memang kecil isinya.
  if (subfolder.length === 0 && jumlahBerkas === 0) {
    return (
      <div
        className={cn(
          // Bagian kosong dibuat sebagai "lubang" (abu-abu tenggelam, garis
          // putus-putus) supaya beda jelas dengan kartu berisi yang putih dan
          // terangkat.
          "flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/70 p-4",
          ringkas ? "h-full" : "self-start"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "grid shrink-0 place-items-center bg-background text-muted-foreground/60",
              ringkas ? "size-10 rounded-lg" : "size-11 rounded-xl"
            )}
          >
            <Ikon className="size-5" aria-hidden="true" />
          </span>
          {nomor ? (
            <span className="text-sm font-semibold tabular-nums text-muted-foreground/40">
              {nomor}
            </span>
          ) : null}
        </div>
        <div>
          <p
            className={cn(
              "font-medium leading-snug text-muted-foreground",
              ringkas ? "text-base" : "text-lg"
            )}
          >
            {judul}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            Belum ada dokumen di bagian ini.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/arsip/${item.id}`}
      className="group/card block h-full rounded-2xl outline-offset-4"
    >
      <Card
        size={ringkas ? "sm" : "default"}
        className="h-full gap-0 transition-[background-color,box-shadow] group-hover/card:bg-muted/40 group-hover/card:shadow-kartu-naik group-hover/card:ring-aksen/35"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <span
              className={cn(
                "grid shrink-0 place-items-center bg-aksen-lembut text-aksen",
                ringkas ? "size-10 rounded-lg" : "size-11 rounded-xl"
              )}
            >
              <Ikon className="size-5" aria-hidden="true" />
            </span>
            {nomor ? (
              <span className="text-sm font-semibold tabular-nums text-aksen/70">
                {nomor}
              </span>
            ) : null}
          </div>

          <CardTitle
            className={cn("tracking-tight", ringkas ? "mt-3" : "mt-4 text-lg")}
          >
            {judul}
          </CardTitle>
          <CardDescription className={ringkas ? "text-xs" : "text-sm"}>
            {subfolder.length} subfolder · {jumlahBerkas} berkas
          </CardDescription>
        </CardHeader>

        <CardContent
          className={cn(
            "mt-4 flex flex-1 flex-col justify-between gap-4",
            ringkas && "mt-3 gap-3"
          )}
        >
          {contoh.length > 0 ? (
            <ul className={ringkas ? "space-y-1" : "space-y-1.5"}>
              {contoh.map((sub) => (
                <li
                  key={sub.id}
                  className={cn(
                    "flex min-w-0 items-start gap-2 text-muted-foreground",
                    ringkas ? "text-xs" : "text-sm"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1 shrink-0 rounded-full bg-aksen/40",
                      ringkas ? "mt-[6px]" : "mt-[7px]"
                    )}
                  />
                  <span className="line-clamp-2">{pecahNama(sub.nama).judul}</span>
                </li>
              ))}
              {sisa > 0 ? (
                <li className="pl-3 text-xs text-muted-foreground/80">
                  +{sisa} subfolder lain
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Berkas langsung di bagian ini.
            </p>
          )}

          <span
            className={cn(
              "inline-flex items-center gap-1.5 font-medium text-aksen",
              ringkas ? "text-xs" : "text-sm"
            )}
          >
            Lihat isi bagian
            <ArrowRightIcon
              className="size-4 transition-transform group-hover/card:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

// Bentuk minimal yang dibutuhkan daftar. `ItemDrive` memenuhinya, jadi halaman
// folder bisa langsung mengoper datanya tanpa pemetaan. Halaman beranda memakai
// bentuk ramping ini supaya data yang dikirim ke peramban tidak membawa kolom
// yang tidak dipakai pencarian.
export type BerkasTampil = {
  id: string
  nama: string
  mime: string
  folder: boolean
  ukuran: number | null
  diubahPada: string | null
}
