"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, Maximize2Icon } from "lucide-react"

import { IkonBerkas } from "@/components/daftar-item"
import { PratinjauBerkas } from "@/components/pratinjau-berkas"
import type { BerkasTampil } from "@/components/publik-daftar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { formatTanggal, formatUkuran, jenisBerkas } from "@/lib/format"

// Daftar berkas versi publik. Dua perilaku yang berbeda menurut jenis baris:
// folder membuka halaman folder di aplikasi ini, berkas dibuka sebagai
// pratinjau layar penuh — bukan tab baru ke Google Drive.
export function DaftarDokumen({ items }: { items: BerkasTampil[] }) {
  const [dibuka, setDibuka] = useState<BerkasTampil | null>(null)

  return (
    <>
      <ItemGroup className="gap-0 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-kartu ring-1 ring-foreground/[0.07]">
        {items.map((item) =>
          item.folder ? (
            <Item
              key={item.id}
              render={<Link href={`/arsip/${item.id}`} />}
              className="gap-3 rounded-none px-4 py-4 hover:bg-muted/50 focus-visible:ring-inset sm:px-5"
            >
              <ItemMedia variant="icon" className="text-aksen">
                <IkonBerkas mime={item.mime} folder />
              </ItemMedia>

              <ItemContent className="min-w-0">
                <ItemTitle className="w-full min-w-0 text-base">
                  <span className="truncate">{item.nama}</span>
                </ItemTitle>
                <ItemDescription className="text-sm">
                  Folder · diubah {formatTanggal(item.diubahPada)}
                </ItemDescription>
              </ItemContent>

              <ItemActions className="shrink-0 gap-3 text-sm text-muted-foreground">
                <ArrowRightIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Buka folder di aplikasi</span>
              </ItemActions>
            </Item>
          ) : (
            <Item
              key={item.id}
              render={<button type="button" onClick={() => setDibuka(item)} />}
              className="w-full cursor-pointer gap-3 rounded-none px-4 py-4 text-left hover:bg-muted/50 focus-visible:ring-inset sm:px-5"
            >
              <ItemMedia variant="icon" className="text-muted-foreground">
                <IkonBerkas mime={item.mime} folder={false} />
              </ItemMedia>

              <ItemContent className="min-w-0">
                <ItemTitle className="w-full min-w-0 text-base">
                  <span className="truncate">{item.nama}</span>
                </ItemTitle>
                <ItemDescription className="text-sm">
                  {jenisBerkas(item.mime, false)} ·{" "}
                  {formatTanggal(item.diubahPada)}
                </ItemDescription>
              </ItemContent>

              <ItemActions className="shrink-0 gap-3 text-sm text-muted-foreground">
                <span className="hidden tabular-nums sm:inline">
                  {formatUkuran(item.ukuran)}
                </span>
                <Maximize2Icon className="size-4" aria-hidden="true" />
                <span className="sr-only">Buka pratinjau dokumen</span>
              </ItemActions>
            </Item>
          )
        )}
      </ItemGroup>

      <PratinjauBerkas berkas={dibuka} onTutup={() => setDibuka(null)} />
    </>
  )
}
