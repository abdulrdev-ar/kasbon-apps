"use client"

import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function DashboardError({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Catatan gagal dimuat</EmptyTitle>
          <EmptyDescription>Mungkin koneksi lagi putus atau server lagi gangguan. Data kamu aman.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={retry}>
            Coba lagi
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
