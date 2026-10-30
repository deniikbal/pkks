import { redirect } from "next/navigation"

import { KepalaAplikasi } from "@/components/kepala-aplikasi"
import { penggunaSaatIni } from "@/lib/auth"

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
      <KepalaAplikasi pengguna={pengguna} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <span>Arsip dokumen PKKS, SMA Negeri 1 Bantarujeg.</span>
          <span>Isi dokumen tersimpan di Google Drive sekolah.</span>
        </div>
      </footer>
    </div>
  )
}
