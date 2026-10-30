"use client"

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function GalatDasbor({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Daftar dokumen gagal dimuat</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Alert variant="destructive" className="bg-destructive/5">
          <TriangleAlertIcon />
          <AlertTitle>Halaman tidak bisa membaca data</AlertTitle>
          <AlertDescription>
            Bisa jadi koneksi database sedang terputus. Coba muat ulang, dan
            kalau tetap gagal, laporkan ke admin sekolah beserta waktu
            kejadiannya.
          </AlertDescription>
        </Alert>

        {error.digest ? (
          <p className="text-xs text-muted-foreground">
            Kode kejadian:{" "}
            <span className="font-mono text-foreground">{error.digest}</span>
          </p>
        ) : null}
      </CardContent>

      <CardFooter>
        <Button onClick={reset}>
          <RotateCcwIcon />
          Muat ulang halaman
        </Button>
      </CardFooter>
    </Card>
  )
}
