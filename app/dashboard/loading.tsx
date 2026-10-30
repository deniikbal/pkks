import { Skeleton } from "@/components/ui/skeleton"

export default function Memuat() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((baris) => (
          <Skeleton key={baris} className="h-20 rounded-xl" />
        ))}
      </div>

      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((baris) => (
          <Skeleton key={baris} className="h-14 rounded-xl" />
        ))}
      </div>

      <span className="sr-only">Memuat daftar dokumen...</span>
    </div>
  )
}
