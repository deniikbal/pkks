"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { DaftarDokumen } from "@/components/daftar-dokumen-publik"
import type { BerkasTampil } from "@/components/publik-daftar"
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

// Penyaringan dilakukan di peramban atas daftar yang sudah dimuat halaman ini.
// Satu kali muat data (663 berkas) jauh lebih murah daripada meminta server
// menyusun ulang seluruh halaman pada tiap ketikan.
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

export function PencarianArsip({
  awal,
  daftar,
  children,
}: {
  awal: string
  daftar: BerkasTampil[]
  children: ReactNode
}) {
  const [kata, setKata] = useState(awal)
  const bersih = kata.trim()

  const hasil = useMemo(() => {
    if (!bersih) return []
    return daftar.filter((b) => cocok(b.nama, bersih))
  }, [bersih, daftar])

  const tampil = hasil.slice(0, BATAS_HASIL)
  const terpotong = hasil.length > BATAS_HASIL

  // Alamat halaman tetap mengikuti kata pencarian supaya tautannya bisa
  // dibagikan dan tombol kembali bekerja, tapi tanpa memuat ulang halaman.
  useEffect(() => {
    const j = setTimeout(() => {
      const url = bersih ? `/?q=${encodeURIComponent(bersih)}` : "/"
      window.history.replaceState(null, "", url)
    }, JEDA_URL)
    return () => clearTimeout(j)
  }, [bersih])

  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col">
      <form
        action="/"
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
            placeholder="Cari dokumen, misalnya RKAS"
            aria-label="Cari dokumen di arsip"
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
          : "Menampilkan empat bagian penilaian"}
      </p>

      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        {bersih ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {terpotong
                    ? `${BATAS_HASIL} dari ${hasil.length}`
                    : hasil.length}
                </span>{" "}
                hasil cocok dengan{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{bersih}&rdquo;
                </span>
              </p>
              <Button variant="ghost" size="sm" onClick={() => setKata("")}>
                Hapus pencarian
              </Button>
            </div>

            <div className="mt-3 min-h-0 flex-1 lg:overflow-y-auto">
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
                      telusuri lewat empat bagian penilaian.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <DaftarDokumen items={tampil} />
              )}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
