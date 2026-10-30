"use client"

export default function GalatDasbor({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="border-l-[3px] border-arsip bg-arsip-lembut p-5">
      <h2 className="text-base font-semibold text-arsip">
        Daftar dokumen gagal dimuat
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-tinta">
        Halaman tidak bisa membaca data dari database. Bisa jadi koneksi
        database sedang terputus. Coba muat ulang, dan kalau tetap gagal,
        laporkan ke admin sekolah beserta waktu kejadiannya.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-redup">Kode kejadian: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-4 min-h-11 rounded-sm bg-navy px-4 text-sm font-semibold text-white"
      >
        Muat ulang halaman
      </button>
    </div>
  )
}
