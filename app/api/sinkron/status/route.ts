import { penggunaSaatIni } from "@/lib/auth"
import { ambilLogMilik, type TahapSinkron } from "@/lib/data"

// Kemajuan sinkronisasi ditanyakan berulang oleh bilah progres di dasbor,
// kira-kira sekali per detik selama proses berjalan.
export const dynamic = "force-dynamic"

/** Bobot tiap tahap terhadap panjang bilah. Penelusuran folder adalah
 *  bagian terpanjang, jadi porsinya paling besar. */
const BOBOT: Record<TahapSinkron, number> = {
  token: 2,
  akar: 5,
  jelajah: 88,
  rapikan: 5,
  selesai: 0,
}

/**
 * Persen kemajuan.
 *
 * Total folder sebenarnya tidak diketahui sampai penelusuran usai: antrean
 * melebar, jadi angka `folder_total` terus bertambah di tengah jalan. Memakai
 * `selesai / total` mentah-mentah membuat bilah mundur di data sekolah ini
 * (terukur 64% → 40% → 36%), dan menebak laju pertumbuhannya pun tetap mundur
 * saat antrean melonjak. Jadi yang dipakai sebagai penyebut adalah jumlah
 * folder dari sinkron terakhir yang sukses — angka nyata, bukan tebakan.
 *
 * Kalau penelusuran ternyata lebih besar dari perkiraan itu, bilah ditahan di
 * 97% sampai tahap rapikan, lalu 100% saat selesai. Lebih baik bilah berhenti
 * di ujung sekali daripada bergerak mundur berulang kali.
 */
function persen(
  tahap: TahapSinkron | null,
  selesai: number,
  total: number,
  perkiraanTotal: number
) {
  if (!tahap) return 0
  if (tahap === "selesai") return 100

  let dasar = 0
  for (const [nama, bobot] of Object.entries(BOBOT) as [TahapSinkron, number][]) {
    if (nama === tahap) break
    dasar += bobot
  }

  // Penyebut: perkiraan dari sinkron sebelumnya, tapi tidak pernah lebih kecil
  // dari jumlah folder yang sudah terlihat di jalannya sendiri.
  const acuan = Math.max(perkiraanTotal, total, 1)
  const bagian =
    tahap === "jelajah" ? Math.min(1, selesai / acuan) : 0

  return Math.round(dasar + BOBOT[tahap] * bagian)
}

export async function GET(request: Request) {
  const pengguna = await penggunaSaatIni()
  if (!pengguna) {
    return Response.json({ pesan: "Sesi sudah berakhir." }, { status: 401 })
  }

  const id = new URL(request.url).searchParams.get("id")
  const log = await ambilLogMilik(id)

  if (!log) {
    return Response.json({ pesan: "Log sinkron tidak ditemukan." }, { status: 404 })
  }

  // Kebugaran baris log (termasuk baris 'jalan' yang tertinggal karena
  // prosesnya mati) sudah diputuskan di ambilLogMilik.
  return Response.json(
    {
      status: log.status,
      tahap: log.tahap,
      persen: persen(
        log.tahap,
        log.folderSelesai,
        log.folderTotal,
        log.perkiraanTotal
      ),
      folderSelesai: log.folderSelesai,
      folderTotal: log.folderTotal,
      perkiraanTotal: log.perkiraanTotal,
      jumlahItem: log.jumlahItem,
      jumlahFolder: log.jumlahFolder,
      totalByte: log.totalByte,
      galat: log.galat,
      mulai: log.mulai,
      selesai: log.selesai,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
