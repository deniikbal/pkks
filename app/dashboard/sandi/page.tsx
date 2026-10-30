import Link from "next/link"
import { FormSandi } from "@/components/form-sandi"

export const dynamic = "force-dynamic"

export default function HalamanSandi() {
  return (
    <div className="space-y-6">
      <nav aria-label="Lokasi halaman" className="text-sm">
        <Link
          href="/dashboard"
          className="font-medium text-navy underline underline-offset-2"
        >
          Arsip
        </Link>
        <span className="mx-2 text-redup">/</span>
        <span className="text-tinta">Ganti kata sandi</span>
      </nav>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-tinta sm:text-2xl">
          Ganti kata sandi
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-redup">
          Setelah kata sandi diganti, sesi di perangkat lain yang masih terbuka
          akan diputus. Perangkat ini tetap masuk.
        </p>
      </div>

      <div className="border-l-[3px] border-navy bg-kertas-tinggi p-5">
        <FormSandi />
      </div>
    </div>
  )
}
