import { redirect } from "next/navigation"
import { penggunaSaatIni } from "@/lib/auth"

export default async function Halaman() {
  const pengguna = await penggunaSaatIni()
  redirect(pengguna ? "/dashboard" : "/login")
}
