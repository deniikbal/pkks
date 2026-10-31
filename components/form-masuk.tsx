"use client"

import { useActionState, useState } from "react"
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
} from "lucide-react"

import { aksiMasuk, type KeadaanMasuk } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const keadaanAwal: KeadaanMasuk = { galat: null }

export function FormMasuk() {
  const [keadaan, kirim, sedangKirim] = useActionState(aksiMasuk, keadaanAwal)
  const [sandiTerlihat, setSandiTerlihat] = useState(false)

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
          <div className="relative">
            <Input
              id="sandi"
              name="sandi"
              type={sandiTerlihat ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={keadaan.galat ? true : undefined}
              className="h-11 pr-12 text-base md:text-base"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={
                sandiTerlihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              aria-pressed={sandiTerlihat}
              aria-controls="sandi"
              onClick={() => setSandiTerlihat((lihat) => !lihat)}
              className="absolute inset-y-0 right-1.5 my-auto rounded-md text-muted-foreground hover:text-foreground aria-pressed:text-foreground"
            >
              {sandiTerlihat ? (
                <EyeOffIcon className="size-[18px]" />
              ) : (
                <EyeIcon className="size-[18px]" />
              )}
            </Button>
          </div>
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
