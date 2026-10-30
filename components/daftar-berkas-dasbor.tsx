"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRightIcon, FolderIcon, Maximize2Icon } from "lucide-react"

import { IkonBerkas } from "@/components/daftar-item"
import { PratinjauBerkas } from "@/components/pratinjau-berkas"
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

// Bentuk minimal satu baris. `ItemDrive` memenuhinya, jadi halaman dasbor bisa
// mengoper datanya langsung tanpa pemetaan.
export type BerkasDasbor = {
  id: string
  nama: string
  mime: string
  folder: boolean
  ukuran: number | null
  diubahPada: string | null
}

export type BarisBerkas = { item: BerkasDasbor; jalur?: string }

// Daftar berkas di dasbor. Folder tetap berpindah halaman (di dalam aplikasi),
// berkas dibuka sebagai pratinjau layar penuh — sama seperti halaman publik.
// Satu penampil dipakai bersama seluruh baris; kalau tiap baris punya penampil
// sendiri, jumlah dialog di halaman ikut sebanyak jumlah berkas.
export function DaftarBerkas({ baris }: { baris: BarisBerkas[] }) {
  const [dibuka, setDibuka] = useState<BerkasDasbor | null>(null)

  return (
    <>
      <ItemGroup className="gap-0 divide-y divide-border overflow-hidden rounded-xl bg-card shadow-kartu ring-1 ring-foreground/[0.07]">
        {baris.map(({ item, jalur }) =>
          item.folder ? (
            <Item
              key={item.id}
              render={<Link href={`/dashboard/folder/${item.id}`} />}
              className="gap-3 rounded-none px-4 py-3 hover:bg-accent/50 focus-visible:ring-inset"
            >
              <ItemMedia variant="icon" className="text-primary">
                <FolderIcon aria-hidden="true" />
              </ItemMedia>

              <ItemContent className="min-w-0">
                <ItemTitle className="w-full min-w-0">
                  <span className="truncate">{item.nama}</span>
                </ItemTitle>
                <ItemDescription className="text-xs">
                  Folder{jalur ? ` · ${jalur}` : null}
                </ItemDescription>
              </ItemContent>

              <ItemActions className="shrink-0 text-xs text-muted-foreground">
                <ChevronRightIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Buka folder</span>
              </ItemActions>
            </Item>
          ) : (
            <Item
              key={item.id}
              render={
                <button type="button" onClick={() => setDibuka(item)} />
              }
              className="w-full cursor-pointer gap-3 rounded-none px-4 py-3 text-left hover:bg-accent/50 focus-visible:ring-inset"
            >
              <ItemMedia variant="icon" className="text-muted-foreground">
                <IkonBerkas mime={item.mime} folder={false} />
              </ItemMedia>

              <ItemContent className="min-w-0">
                <ItemTitle className="w-full min-w-0">
                  <span className="truncate">{item.nama}</span>
                </ItemTitle>
                <ItemDescription className="text-xs">
                  {jenisBerkas(item.mime, false)}
                  {jalur ? ` · ${jalur}` : null}
                </ItemDescription>
              </ItemContent>

              <ItemActions className="w-full justify-between gap-4 text-xs text-muted-foreground sm:w-auto sm:justify-end">
                <span className="tabular-nums">{formatUkuran(item.ukuran)}</span>
                <span className="tabular-nums">
                  {formatTanggal(item.diubahPada)}
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
