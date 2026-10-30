import { redirect } from "next/navigation"
import { ArchiveIcon, HardDriveIcon, ShieldCheckIcon } from "lucide-react"

import { FormMasuk } from "@/components/form-masuk"
import { Merek } from "@/components/kepala-aplikasi"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { penggunaSaatIni } from "@/lib/auth"

export const dynamic = "force-dynamic"

const keterangan = [
  {
    ikon: ShieldCheckIcon,
    judul: "Terbatas untuk tim PKKS",
    isi: "Hanya tim PKKS, pengawas, dan kepala sekolah. Tidak ada pendaftaran mandiri.",
  },
  {
    ikon: ArchiveIcon,
    judul: "Satu sumber, tanpa salinan",
    isi: "Daftar ini mengikuti isi Google Drive sekolah, jadi tidak ada versi berkas yang berbeda.",
  },
  {
    ikon: HardDriveIcon,
    judul: "Dokumen tetap di Drive",
    isi: "Aplikasi hanya menampilkan daftar dan pratinjau. Berkas aslinya tidak disalin.",
  },
]

export default async function HalamanMasuk() {
  const pengguna = await penggunaSaatIni()
  if (pengguna) redirect("/dashboard")

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Merek />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <section className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Portal arsip sekolah
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            Dokumen Penilaian Kinerja Kepala Sekolah, satu pintu.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Arsip yang tersimpan di Google Drive sekolah, disusun ulang supaya
            bisa ditelusuri per folder dan dicari per nama berkas.
          </p>

          <ul className="mt-10 space-y-5">
            {keterangan.map((butir) => (
              <li key={butir.judul} className="flex gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <butir.ikon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">{butir.judul}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {butir.isi}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Masuk ke portal</CardTitle>
              <CardDescription>
                Gunakan akun yang diberikan admin sekolah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormMasuk />
            </CardContent>
            <CardFooter className="text-xs leading-relaxed text-muted-foreground">
              Belum punya akses? Minta admin sekolah membuatkan akun. Tidak ada
              pendaftaran mandiri di halaman ini.
            </CardFooter>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <div className="mx-auto max-w-6xl">
          SMA Negeri 1 Bantarujeg, Kabupaten Majalengka.
        </div>
      </footer>
    </main>
  )
}
