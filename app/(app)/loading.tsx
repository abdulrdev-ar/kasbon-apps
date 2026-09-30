import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6" aria-busy="true" aria-label="Memuat">
      <Skeleton className="h-11 w-48" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-8 w-full md:w-2/3" />
      <Skeleton className="h-72" />
    </div>
  )
}
