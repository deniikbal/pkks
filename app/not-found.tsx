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

export default function TidakDitemukan() {
  return (
    <Empty className="mx-auto max-w-2xl border border-dashed border-border bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle className="text-base">
          Halaman atau dokumen tidak ditemukan
        </EmptyTitle>
        <EmptyDescription>
          Alamat yang dibuka tidak cocok dengan dokumen mana pun di arsip ini.
          Dokumen bisa saja sudah dihapus atau dipindahkan di Google Drive sejak
          sinkronisasi terakhir.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeftIcon />
          Kembali ke daftar arsip
        </Button>
      </EmptyContent>
    </Empty>
  )
}
