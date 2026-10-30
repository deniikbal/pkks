"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { DaftarBerkas, type BarisBerkas } from "@/components/daftar-berkas-dasbor"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

// Sama seperti halaman publik: penyaringan dilakukan di peramban atas daftar
// yang sudah dimuat halaman ini. Satu kali muat data jauh lebih murah daripada
// meminta server menyusun ulang seluruh halaman pada tiap ketikan.
const BATAS_HASIL = 60
const JEDA_URL = 350

function cocok(nama: string, kata: string): boolean {
  const teks = nama.toLowerCase()
  // Setiap kata harus muncul, tidak harus berurutan: "laporan rkas" tetap
  // menemukan "Laporan RKAS 2026".
  return kata
    .toLowerCase()
    .split(/\s+/)
    .every((potong) => teks.includes(potong))
}

export function PencarianDasbor({
  awal,
  daftar,
  children,
}: {
  awal: string
  daftar: BarisBerkas[]
  children: ReactNode
}) {
  const [kata, setKata] = useState(awal)
  const bersih = kata.trim()

  const hasil = useMemo(() => {
    if (!bersih) return []
    return daftar.filter((b) => cocok(b.item.nama, bersih))
  }, [bersih, daftar])

  const tampil = hasil.slice(0, BATAS_HASIL)
  const terpotong = hasil.length > BATAS_HASIL
  const jumlahFolder = hasil.filter((h) => h.item.folder).length
  const jumlahBerkas = hasil.length - jumlahFolder

  // Alamat halaman tetap mengikuti kata pencarian supaya tautannya bisa
  // dibagikan dan tombol kembali bekerja, tapi tanpa memuat ulang halaman.
  useEffect(() => {
    const j = setTimeout(() => {
      const url = bersih ? `/dashboard?q=${encodeURIComponent(bersih)}` : "/dashboard"
      window.history.replaceState(null, "", url)
    }, JEDA_URL)
    return () => clearTimeout(j)
  }, [bersih])

  return (
    <div className="space-y-4">
      <form
        action="/dashboard"
        method="get"
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="w-full"
      >
        <InputGroup className="h-12 w-full bg-card shadow-sm">
          <InputGroupAddon aria-hidden="true">
            <SearchIcon />
          </InputGroupAddon>

          <InputGroupInput
            name="q"
            type="text"
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Cari dokumen atau folder, misalnya RKAS"
            aria-label="Cari dokumen atau folder"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            className="h-12 text-base md:text-base"
          />

          <InputGroupAddon align="inline-end" className="gap-1">
            {kata ? (
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Hapus kata pencarian"
                onClick={() => setKata("")}
              >
                <XIcon />
              </InputGroupButton>
            ) : null}
            <InputGroupButton type="submit" variant="secondary" size="sm">
              Cari
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      <p aria-live="polite" className="sr-only">
        {bersih
          ? `${hasil.length} hasil cocok dengan ${bersih}`
          : "Menampilkan folder dan berkas"}
      </p>

      {bersih ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {terpotong ? `${BATAS_HASIL} dari ${hasil.length}` : hasil.length}
              </span>{" "}
              hasil cocok dengan{" "}
              <span className="font-medium text-foreground">
                &ldquo;{bersih}&rdquo;
              </span>
              {hasil.length > 0 ? (
                <span className="text-muted-foreground/80">
                  {" "}
                  — {jumlahFolder} folder, {jumlahBerkas} berkas
                </span>
              ) : null}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setKata("")}>
              Hapus pencarian
            </Button>
          </div>

          {tampil.length === 0 ? (
            <Empty className="border border-dashed border-border bg-muted/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle className="text-base">
                  Tidak ada berkas atau folder dengan nama itu
                </EmptyTitle>
                <EmptyDescription>
                  Coba kata yang lebih pendek, atau kosongkan pencarian lalu
                  telusuri lewat daftar folder.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <DaftarBerkas baris={tampil} />
          )}
        </>
      ) : (
        <div className="space-y-8">{children}</div>
      )}
    </div>
  )
}
