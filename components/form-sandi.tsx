"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { aksiGantiSandi, type KeadaanSandi } from "@/app/sandi-actions"

const keadaanAwal: KeadaanSandi = { galat: null, sukses: null }

function TombolSimpan() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-sm bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "Simpan kata sandi baru"}
    </button>
  )
}

function Kolom({
  id,
  label,
  autoComplete,
}: {
  id: string
  label: string
  autoComplete: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-tinta">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        autoComplete={autoComplete}
        required
        minLength={id === "lama" ? undefined : 10}
        className="h-12 w-full rounded-sm border border-garis bg-kertas-tinggi px-3 text-base text-tinta"
      />
    </div>
  )
}

export function FormSandi() {
  const [keadaan, kirim] = useActionState(aksiGantiSandi, keadaanAwal)

  return (
    <form action={kirim} className="max-w-sm space-y-5">
      <Kolom id="lama" label="Kata sandi sekarang" autoComplete="current-password" />
      <Kolom id="baru" label="Kata sandi baru (minimal 10 karakter)" autoComplete="new-password" />
      <Kolom id="ulang" label="Ulangi kata sandi baru" autoComplete="new-password" />

      {keadaan.galat ? (
        <p
          role="alert"
          className="rounded-sm border border-arsip/40 bg-arsip-lembut px-3 py-2 text-sm text-arsip"
        >
          {keadaan.galat}
        </p>
      ) : null}
      {keadaan.sukses ? (
        <p
          role="status"
          className="rounded-sm border border-sahih/40 bg-sahih-lembut px-3 py-2 text-sm text-sahih"
        >
          {keadaan.sukses} Perangkat lain yang masih masuk sudah dikeluarkan.
        </p>
      ) : null}

      <TombolSimpan />
    </form>
  )
}
