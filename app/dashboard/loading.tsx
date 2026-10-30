export default function Memuat() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <p className="text-sm text-redup">Memuat daftar dokumen...</p>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((baris) => (
          <div
            key={baris}
            className="h-16 animate-pulse border-l-[3px] border-garis bg-kertas-tinggi"
          />
        ))}
      </div>
    </div>
  )
}
