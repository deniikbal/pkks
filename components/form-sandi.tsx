"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CircleAlertIcon, CircleCheckIcon, SaveIcon } from "lucide-react"

import { aksiGantiSandi, type KeadaanSandi } from "@/app/sandi-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const keadaanAwal: KeadaanSandi = { galat: null, sukses: null }

function TombolSimpan() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-11 self-start px-4">
      {pending ? <Spinner /> : <SaveIcon />}
      {pending ? "Menyimpan..." : "Simpan kata sandi baru"}
    </Button>
  )
}

function Kolom({
  id,
  label,
  keterangan,
  autoComplete,
  panjangMinimum,
}: {
  id: string
  label: string
  keterangan?: string
  autoComplete: string
  panjangMinimum?: number
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={id}
        type="password"
        autoComplete={autoComplete}
        required
        minLength={panjangMinimum}
        className="h-11 text-base md:text-base"
      />
      {keterangan ? <FieldDescription>{keterangan}</FieldDescription> : null}
    </Field>
  )
}

export function FormSandi() {
  const [keadaan, kirim] = useActionState(aksiGantiSandi, keadaanAwal)

  return (
    <form action={kirim} className="w-full">
      <FieldGroup className="gap-5">
        <Kolom
          id="lama"
          label="Kata sandi sekarang"
          autoComplete="current-password"
        />
        <Kolom
          id="baru"
          label="Kata sandi baru"
          keterangan="Minimal 10 karakter."
          autoComplete="new-password"
          panjangMinimum={10}
        />
        <Kolom
          id="ulang"
          label="Ulangi kata sandi baru"
          autoComplete="new-password"
          panjangMinimum={10}
        />

        {keadaan.galat ? (
          <Alert variant="destructive" className="bg-destructive/5">
            <CircleAlertIcon />
            <AlertTitle>Kata sandi belum bisa diganti</AlertTitle>
            <AlertDescription>{keadaan.galat}</AlertDescription>
          </Alert>
        ) : null}

        {keadaan.sukses ? (
          <Alert className="border-sahih/30 bg-sahih-lembut text-sahih [&_[data-slot=alert-description]]:text-sahih">
            <CircleCheckIcon />
            <AlertTitle>Berhasil</AlertTitle>
            <AlertDescription>
              {keadaan.sukses} Perangkat lain yang masih masuk sudah dikeluarkan.
            </AlertDescription>
          </Alert>
        ) : null}

        <TombolSimpan />
      </FieldGroup>
    </form>
  )
}
