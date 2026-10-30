import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "PKKS SMAN 1 Bantarujeg",
  description:
    "Portal arsip dokumen Penilaian Kinerja Kepala Sekolah SMAN 1 Bantarujeg.",
}

// Font sengaja memakai system UI stack (diatur di globals.css), bukan
// next/font: build di server sekolah tidak boleh bergantung pada unduhan
// Google Fonts, dan teks administratif tidak butuh bentuk huruf khusus.
export default function AkarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
