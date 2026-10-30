"use client"

import { useActionState } from "react"
import { CircleAlertIcon, LogInIcon } from "lucide-react"

import { aksiMasuk, type KeadaanMasuk } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const keadaanAwal: KeadaanMasuk = { galat: null }

export function FormMasuk() {
  const [keadaan, kirim, sedangKirim] = useActionState(aksiMasuk, keadaanAwal)

  return (
    <form action={kirim} noValidate>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="nama@sekolah.sch.id"
            aria-invalid={keadaan.galat ? true : undefined}
            className="h-11 text-base md:text-base"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="sandi">Kata sandi</FieldLabel>
          <Input
            id="sandi"
            name="sandi"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={keadaan.galat ? true : undefined}
            className="h-11 text-base md:text-base"
          />
        </Field>

        {keadaan.galat ? (
          <Alert variant="destructive" className="bg-destructive/5">
            <CircleAlertIcon />
            <AlertTitle>Tidak bisa masuk</AlertTitle>
            <AlertDescription>{keadaan.galat}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          disabled={sedangKirim}
          className="h-11 w-full text-base"
        >
          {sedangKirim ? <Spinner /> : <LogInIcon />}
          {sedangKirim ? "Memeriksa..." : "Masuk"}
        </Button>
      </FieldGroup>
    </form>
  )
}
