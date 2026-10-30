import Link from "next/link"

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <h1 className="text-xl font-semibold tracking-tight text-tinta sm:text-2xl">
        Halaman atau dokumen tidak ditemukan
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-redup">
        Alamat yang dibuka tidak cocok dengan dokumen mana pun di arsip ini.
        Dokumen bisa saja sudah dihapus atau dipindahkan di Google Drive sejak
        sinkronisasi terakhir.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-navy px-4 text-sm font-semibold text-white"
      >
        Kembali ke daftar arsip
      </Link>
    </div>
  )
}
