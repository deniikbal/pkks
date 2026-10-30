import { redirect } from "next/navigation"
import { penggunaSaatIni } from "@/lib/auth"
import { FormMasuk } from "@/components/form-masuk"

export const dynamic = "force-dynamic"

export default async function HalamanMasuk() {
  const pengguna = await penggunaSaatIni()
  if (pengguna) redirect("/dashboard")

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="bg-navy px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-5xl items-baseline gap-3">
          <span className="text-sm font-semibold tracking-wide">PKKS</span>
          <span className="text-xs text-white/80">SMAN 1 Bantarujeg</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-tinta">
            Masuk ke portal PKKS
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-redup">
            Portal ini menampilkan daftar dokumen Penilaian Kinerja Kepala
            Sekolah yang tersimpan di Google Drive sekolah. Hanya untuk tim
            PKKS, pengawas, dan kepala sekolah.
          </p>

          <div className="mt-8 border-l-[3px] border-navy bg-kertas-tinggi p-5">
            <FormMasuk />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-redup">
            Belum punya akses? Minta admin sekolah membuatkan akun. Tidak ada
            pendaftaran mandiri di halaman ini.
          </p>
        </div>
      </div>

      <footer className="border-t border-garis px-4 py-4 text-xs text-redup sm:px-6">
        <div className="mx-auto max-w-5xl">
          SMA Negeri 1 Bantarujeg, Kabupaten Majalengka.
        </div>
      </footer>
    </main>
  )
}
