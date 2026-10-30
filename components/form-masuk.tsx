"use client"

import { useActionState } from "react"
import { aksiMasuk, type KeadaanMasuk } from "@/app/actions"

const keadaanAwal: KeadaanMasuk = { galat: null }

export function FormMasuk() {
  const [keadaan, kirim, sedangKirim] = useActionState(aksiMasuk, keadaanAwal)

  return (
    <form action={kirim} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-tinta"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-12 w-full rounded-sm border border-garis bg-kertas-tinggi px-3 text-base text-tinta placeholder:text-redup/70"
          placeholder="nama@sekolah.sch.id"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="sandi"
          className="block text-sm font-medium text-tinta"
        >
          Kata sandi
        </label>
        <input
          id="sandi"
          name="sandi"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-sm border border-garis bg-kertas-tinggi px-3 text-base text-tinta"
        />
      </div>

      {keadaan.galat ? (
        <p
          role="alert"
          className="rounded-sm border border-arsip/40 bg-arsip-lembut px-3 py-2 text-sm text-arsip"
        >
          {keadaan.galat}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sedangKirim}
        className="h-12 w-full rounded-sm bg-navy px-4 text-base font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sedangKirim ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  )
}
