import Link from "next/link"

// Ditampilkan di dalam halaman, bukan lewat notFound(), supaya pesannya pasti
// muncul walaupun halaman ini dirender bertahap (streaming).
export function PanelTidakAda({
  judul,
  keterangan,
}: {
  judul: string
  keterangan: string
}) {
  return (
    <div className="border-l-[3px] border-arsip bg-arsip-lembut p-5">
      <h1 className="text-lg font-semibold text-tinta">{judul}</h1>
      <p className="mt-2 text-sm leading-relaxed text-tinta">{keterangan}</p>
      <Link
        href="/dashboard"
        className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-navy px-4 text-sm font-semibold text-navy transition-colors hover:bg-navy-lembut"
      >
        Kembali ke daftar arsip
      </Link>
    </div>
  )
}
