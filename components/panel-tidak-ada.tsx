import Link from "next/link"
import { ArrowLeftIcon, FileQuestionIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

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
    <Empty className="border border-dashed border-border bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle className="text-base">{judul}</EmptyTitle>
        <EmptyDescription>{keterangan}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeftIcon />
          Kembali ke daftar arsip
        </Button>
      </EmptyContent>
    </Empty>
  )
}
