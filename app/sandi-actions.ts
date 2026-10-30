"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { penggunaSaatIni } from "@/lib/auth"
import { query, satu } from "@/lib/db"

export type KeadaanSandi = { galat: string | null; sukses: string | null }

export async function aksiGantiSandi(
  _keadaanSebelumnya: KeadaanSandi,
  data: FormData
): Promise<KeadaanSandi> {
  const pengguna = await penggunaSaatIni()
  if (!pengguna) redirect("/login")

  const lama = String(data.get("lama") ?? "")
  const baru = String(data.get("baru") ?? "")
  const ulang = String(data.get("ulang") ?? "")

  if (!lama || !baru || !ulang) {
    return { galat: "Semua kolom wajib diisi.", sukses: null }
  }
  if (baru.length < 10) {
    return {
      galat: "Kata sandi baru minimal 10 karakter.",
      sukses: null,
    }
  }
  if (baru !== ulang) {
    return { galat: "Ulangan kata sandi tidak sama.", sukses: null }
  }

  const baris = await satu<{ kata_sandi_hash: string }>(
    "select kata_sandi_hash from pengguna where id = $1",
    [pengguna.id]
  )
  if (!baris) {
    return { galat: "Akun tidak ditemukan.", sukses: null }
  }

  const cocok = await bcrypt.compare(lama, baris.kata_sandi_hash)
  if (!cocok) {
    return { galat: "Kata sandi lama tidak cocok.", sukses: null }
  }

  await query("update pengguna set kata_sandi_hash = $2 where id = $1", [
    pengguna.id,
    bcrypt.hashSync(baru, 11),
  ])

  // Sesi lain diputus supaya sandi lama tidak lagi berguna di perangkat lain.
  await query(
    `delete from sesi
      where pengguna_id = $1
        and id <> (
          select id from sesi where pengguna_id = $1 order by dibuat_pada desc limit 1
        )`,
    [pengguna.id]
  )

  return { galat: null, sukses: "Kata sandi sudah diganti." }
}
