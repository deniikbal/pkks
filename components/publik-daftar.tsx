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

import { IndikatorMembuka } from "@/components/indikator-membuka"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemDescription,
  ItemGroup,
  ItemMedia,
} from "@/components/ui/item"
import type { ItemDrive } from "@/lib/data"
import { cn } from "@/lib/utils"

// Nama folder di Drive sudah bernomor. Dua pola yang dipakai arsip ini:
// "A. Kepribadian" (huruf bagian) dan "A.1   Integritas" / "1.1 Manajerial"
// (subfolder). Keduanya diurai jadi nomor penanda + judul bersih, supaya
// nomornya tidak tampil dua kali (di ubin dan di judul).
export function pecahNama(nama: string): { nomor: string | null; judul: string } {
  // Awalan huruf bagian atau angka bertingkat, boleh diikuti nomor subfolder
  // ("A", "A.1", "1.1"), lalu judulnya. Spasi dirapatkan supaya
  // "A.1   Integritas" (spasi ganda dari Drive) tidak menyisakan celah lebar.
  const cocok = nama.match(/^([A-Za-z]|\d+(?:\.\d+)*)(?:\.\d+)*\.?\s+(.+)$/)
  if (!cocok) return { nomor: null, judul: nama }
  return {
    nomor: cocok[1].toUpperCase(),
    judul: cocok[2].replace(/\s+/g, " ").trim(),
  }
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

// Warna bagian dipilih dari nomor bagian (A/B/C/D). Bagian tanpa nomor tetap
// memakai aksen teal bawaan. Nilainya adalah nama token Tailwind yang sudah
// didefinisikan di globals.css, bukan warna mentah, supaya tema tetap satu
// sumber. Dipakai hanya untuk garis tepi kartu dan ubin nomor.
function warnaBagian(nomor: string | null) {
  switch (nomor) {
    case "A":
      return {
        tepi: "border-bagian-a",
        ubin: "bg-bagian-a-lembut text-bagian-a",
        titik: "bg-bagian-a",
        teks: "text-bagian-a",
      }
    case "B":
      return {
        tepi: "border-bagian-b",
        ubin: "bg-bagian-b-lembut text-bagian-b",
        titik: "bg-bagian-b",
        teks: "text-bagian-b",
      }
    case "C":
      return {
        tepi: "border-bagian-c",
        ubin: "bg-bagian-c-lembut text-bagian-c",
        titik: "bg-bagian-c",
        teks: "text-bagian-c",
      }
    case "D":
      return {
        tepi: "border-bagian-d",
        ubin: "bg-bagian-d-lembut text-bagian-d",
        titik: "bg-bagian-d",
        teks: "text-bagian-d",
      }
    default:
      return {
        tepi: "border-border",
        ubin: "bg-aksen-lembut text-aksen",
        titik: "bg-aksen",
        teks: "text-aksen",
      }
  }
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
  const warna = warnaBagian(nomor)
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
          // terangkat. Garis tepinya tetap memakai warna bagian, dipudarkan,
          // supaya masih terlihat bagian mana ini.
          "flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/70 p-4",
          ringkas ? "h-full" : "self-start"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <ItemMedia
            variant="icon"
            className={cn(
              "bg-background text-muted-foreground",
              ringkas ? "size-10 rounded-lg" : "size-11 rounded-xl"
            )}
          >
            <Ikon className="size-5" aria-hidden="true" />
          </ItemMedia>
          {nomor ? (
            <Badge
              variant="ghost"
              className="px-0 text-sm font-semibold tabular-nums text-muted-foreground"
            >
              {nomor}
            </Badge>
          ) : null}
        </div>
        <div>
          <p
            className={cn(
              "font-semibold leading-snug text-muted-foreground",
              ringkas ? "text-lg" : "text-xl"
            )}
          >
            {judul}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Belum ada dokumen di bagian ini.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/arsip/${item.id}`}
      // prefetch dimatikan: kalau tidak, tautan yang sudah dipramuat membuat
      // navigasi selesai seketika dan tanda "Membuka…" tidak pernah muncul —
      // padahal di koneksi lambat tanda itulah yang dibutuhkan pembaca.
      prefetch={false}
      className="group/card relative block h-full rounded-2xl outline-offset-4"
    >
      <Card
        size={ringkas ? "sm" : "default"}
        className={cn(
          // Garis tepi berwarna per bagian, bukan abu-abu seragam. Ketebalan
          // 1px tetap; warnanya yang membedakan, seperti tab folder arsip.
          // shadow-sm sengaja dibuang: kartu dasar sudah memakai shadow-kartu
          // (dua lapis) yang lebih jelas. ring tipis juga dimatikan karena
          // garis tepi berwarna sudah jadi batasnya — dua garis tipis sekaligus
          // membuat tepi terlihat kotor.
          "h-full gap-0 border-2 shadow-kartu ring-0 transition-[background-color,box-shadow,border-color] group-hover/card:bg-muted/40 group-hover/card:shadow-kartu-naik",
          warna.tepi
        )}
      >
        <CardHeader>
          {/* Baris atas: penanda nomor bagian sebagai ubin, hitungan isi di
              kanan. Hitungan di sini dibaca lebih dulu daripada daftar contoh,
              jadi ia yang berdiri sejajar nomor, bukan judul. */}
          <div className="flex items-start justify-between gap-4">
            <ItemMedia
              variant="icon"
              className={cn(
                warna.ubin,
                ringkas ? "size-10 rounded-lg" : "size-11 rounded-xl"
              )}
            >
              {nomor ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "font-bold tabular-nums",
                    ringkas ? "text-base" : "text-lg"
                  )}
                >
                  {nomor}
                </span>
              ) : (
                <Ikon className="size-5" aria-hidden="true" />
              )}
            </ItemMedia>

            <span
              className={cn(
                "shrink-0 text-right tabular-nums text-muted-foreground",
                ringkas ? "text-sm" : "text-sm"
              )}
            >
              {subfolder.length} subfolder · {jumlahBerkas} berkas
            </span>
          </div>

          <CardTitle
            className={cn(
              "tracking-tight",
              ringkas ? "mt-3 text-2xl" : "mt-4 text-2xl"
            )}
          >
            {judul}
          </CardTitle>
        </CardHeader>

        <CardContent
          className={cn(
            "mt-4 flex flex-1 flex-col justify-between gap-4",
            ringkas && "mt-3 gap-3"
          )}
        >
          {contoh.length > 0 ? (
            <ItemGroup className={ringkas ? "gap-1.5" : "gap-2"}>
              {contoh.map((sub) => (
                <Item
                  key={sub.id}
                  size="xs"
                  className={cn(
                    // flex-nowrap membatalkan flex-wrap bawaan Item: tanpa ini,
                    // judul panjang menolak menyusut lalu didorong ke baris flex
                    // berikutnya sehingga jatuh di bawah butir, bukan di sampingnya.
                    "min-w-0 flex-nowrap items-start gap-2.5 border-transparent px-0 py-0 text-sm text-muted-foreground"
                  )}
                >
                  {/* Butir disejajarkan dengan baris pertama teks, bukan tengah
                      seluruh paragraf: items-center pada kotak setinggi satu
                      baris (leading-normal + text-sm = 1.5em). Tetap sejajar
                      walau judul dua baris atau ukuran font berubah. */}
                  <span
                    aria-hidden="true"
                    className="flex h-[1.5em] shrink-0 items-center"
                  >
                    <span className={cn("size-1.5 rounded-full", warna.titik)} />
                  </span>
                  {/* flex-1 membuat teks mengambil sisa lebar lalu membungkus di
                      dalam kolomnya sendiri, tidak mendorong baris flex baru. */}
                  <ItemDescription className="min-w-0 flex-1 line-clamp-2 leading-normal text-muted-foreground">
                    {pecahNama(sub.nama).judul}
                  </ItemDescription>
                </Item>
              ))}
              {sisa > 0 ? (
                <Item size="xs" className="border-transparent py-0 pl-3.5 text-sm">
                  <ItemDescription className="text-muted-foreground">
                    +{sisa} subfolder lain
                  </ItemDescription>
                </Item>
              ) : null}
            </ItemGroup>
          ) : (
            <Item size="xs" className="border-transparent px-0 text-sm">
              <ItemDescription className="text-muted-foreground">
                Berkas langsung di bagian ini.
              </ItemDescription>
            </Item>
          )}

          {/* Ajakan ini bukan kontrol tersendiri: seluruh kartu sudah menjadi
              <Link>, jadi menaruh <button> di dalamnya menghasilkan kontrol
              bersarang (HTML tidak valid + membingungkan pembaca layar).
              Teks biasa bergaya aksen sudah cukup — klik di mana pun pada kartu
              tetap membuka bagiannya. */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 self-start font-semibold",
              warna.teks,
              ringkas ? "text-sm" : "text-base"
            )}
          >
            Lihat isi bagian
            <ArrowRightIcon
              className="size-4.5 transition-transform group-hover/card:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </CardContent>
      </Card>
      <IndikatorMembuka />
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
