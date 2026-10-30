import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "PKKS SMAN 1 Bantarujeg",
  description:
    "Portal arsip dokumen Penilaian Kinerja Kepala Sekolah SMAN 1 Bantarujeg.",
}

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
