"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  alamatIp,
  buatSesi,
  catatPercobaan,
  hapusSesi,
  masuk,
  penggunaSaatIni,
  terlaluBanyakCoba,
} from "@/lib/auth"
import { sinkronkanDrive } from "@/lib/drive"

export type KeadaanMasuk = { galat: string | null }

export async function aksiMasuk(
  _keadaanSebelumnya: KeadaanMasuk,
  data: FormData
): Promise<KeadaanMasuk> {
  const email = String(data.get("email") ?? "").trim()
  const sandi = String(data.get("sandi") ?? "")
  const ip = await alamatIp()

  if (!email || !sandi) {
    return { galat: "Email dan kata sandi wajib diisi." }
  }

  if (await terlaluBanyakCoba(ip)) {
    return {
      galat:
        "Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi dalam 5 menit.",
    }
  }

  const pengguna = await masuk(email, sandi)
  if (!pengguna) {
    await catatPercobaan(ip, email, false)
    return { galat: "Email atau kata sandi tidak cocok." }
  }

  await catatPercobaan(ip, email, true)
  await buatSesi(pengguna.id)
  redirect("/dashboard")
}

export async function aksiKeluar(): Promise<void> {
  await hapusSesi()
  redirect("/login")
}

export type KeadaanSinkron = { pesan: string | null; jenis: "sukses" | "gagal" | null }
export async function aksiSinkron(
  _keadaanSebelumnya: KeadaanSinkron,
  _data: FormData
): Promise<KeadaanSinkron> {
  const pengguna = await penggunaSaatIni()
  if (!pengguna) {
    return { pesan: "Sesi sudah berakhir. Masuk ulang dulu.", jenis: "gagal" }
  }
  if (pengguna.peran !== "admin") {
    return {
      pesan: "Hanya admin yang boleh menjalankan sinkronisasi.",
      jenis: "gagal",
    }
  }

  try {
    const hasil = await sinkronkanDrive(pengguna.email)
    revalidatePath("/dashboard")
    return {
      pesan: `Sinkron selesai: ${hasil.jumlahItem} berkas, ${hasil.jumlahFolder} folder.`,
      jenis: "sukses",
    }
  } catch (galat) {
    return {
      pesan:
        galat instanceof Error
          ? `Sinkron gagal: ${galat.message}`
          : "Sinkron gagal tanpa keterangan.",
      jenis: "gagal",
    }
  }
}
