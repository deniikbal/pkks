import Link from "next/link"
import { redirect } from "next/navigation"
import { penggunaSaatIni } from "@/lib/auth"
import { aksiKeluar } from "@/app/actions"

export const dynamic = "force-dynamic"

export default async function TataLetakDasbor({
  children,
}: {
  children: React.ReactNode
}) {
  const pengguna = await penggunaSaatIni()
  if (!pengguna) redirect("/login")

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="flex min-h-11 items-baseline gap-3 rounded-sm"
          >
            <span className="text-sm font-semibold tracking-wide">PKKS</span>
            <span className="hidden text-xs text-white/80 sm:inline">
              SMAN 1 Bantarujeg
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/sandi"
              className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <span className="sm:hidden">Sandi</span>
              <span className="hidden sm:inline">Ganti sandi</span>
            </Link>
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium">{pengguna.nama}</div>
              <div className="text-xs text-white/75">
                {pengguna.peran === "admin" ? "Admin" : "Pengawas"}
              </div>
            </div>
            <form action={aksiKeluar}>
              <button
                type="submit"
                className="min-h-11 rounded-sm border border-white/30 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-garis px-4 py-4 text-xs text-redup sm:px-6">
        <div className="mx-auto max-w-5xl">
          Arsip dokumen PKKS, SMA Negeri 1 Bantarujeg. Isi dokumen tersimpan di
          Google Drive sekolah.
        </div>
      </footer>
    </div>
  )
}
