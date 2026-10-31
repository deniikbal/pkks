import { query, satu } from "./db"

export type ItemDrive = {
  id: string
  indukId: string | null
  nama: string
  mime: string
  folder: boolean
  ukuran: number | null
  diubahPada: string | null
  tautanLihat: string | null
  tautanThumb: string | null
  kedalaman: number
}

type BarisItem = {
  id: string
  induk_id: string | null
  nama: string
  mime: string
  folder: boolean
  ukuran: string | null
  diubah_pada: string | null
  tautan_lihat: string | null
  tautan_thumb: string | null
  kedalaman: number
}

function petakan(baris: BarisItem): ItemDrive {
  return {
    id: baris.id,
    indukId: baris.induk_id,
    nama: baris.nama,
    mime: baris.mime,
    folder: baris.folder,
    ukuran: baris.ukuran === null ? null : Number(baris.ukuran),
    diubahPada: baris.diubah_pada,
    tautanLihat: baris.tautan_lihat,
    tautanThumb: baris.tautan_thumb,
    kedalaman: baris.kedalaman,
  }
}

export async function ambilSemuaItem(): Promise<ItemDrive[]> {
  const baris = await query<BarisItem>(
    `select id, induk_id, nama, mime, folder, ukuran::text, diubah_pada,
            tautan_lihat, tautan_thumb, kedalaman
       from drive_item
      where aktif = true
      order by folder desc, nama asc`
  )
  return baris.map(petakan)
}

export async function ambilItem(id: string): Promise<ItemDrive | null> {
  const baris = await satu<BarisItem>(
    `select id, induk_id, nama, mime, folder, ukuran::text, diubah_pada,
            tautan_lihat, tautan_thumb, kedalaman
       from drive_item
      where id = $1
        and aktif = true`,
    [id]
  )
  return baris ? petakan(baris) : null
}

// Pencarian tidak lagi lewat SQL: halaman publik dan dasbor menyaring daftar
// yang sudah dimuat di peramban, supaya hasilnya muncul tanpa menunggu server
// menyusun ulang halaman (1,2–2,2 detik per navigasi di app ini).

// Jumlah seluruh keturunan tiap folder (bukan hanya anak langsung). Dipakai
// halaman publik untuk menuliskan "5 subfolder, 118 berkas" — angka yang
// berguna bagi pembaca, bukan sekadar isi satu lapis.
export function hitungKeturunan(
  items: ItemDrive[]
): Map<string, { folder: number; berkas: number }> {
  const anak = new Map<string, ItemDrive[]>()
  for (const item of items) {
    if (!item.indukId) continue
    const daftar = anak.get(item.indukId)
    if (daftar) daftar.push(item)
    else anak.set(item.indukId, [item])
  }

  const hasil = new Map<string, { folder: number; berkas: number }>()
  for (const item of items) {
    if (!item.folder) continue

    let folder = 0
    let berkas = 0
    const tumpuk = [...(anak.get(item.id) ?? [])]
    const dilihat = new Set<string>([item.id])

    while (tumpuk.length > 0) {
      const sekarang = tumpuk.pop()
      if (!sekarang || dilihat.has(sekarang.id)) continue
      dilihat.add(sekarang.id)
      if (sekarang.folder) {
        folder += 1
        tumpuk.push(...(anak.get(sekarang.id) ?? []))
      } else {
        berkas += 1
      }
    }

    hasil.set(item.id, { folder, berkas })
  }

  return hasil
}

// Jalur dari akar ke sebuah item, dipakai untuk remah roti.
export function jalurKe(
  item: ItemDrive,
  peta: Map<string, ItemDrive>
): ItemDrive[] {
  const hasil: ItemDrive[] = [item]
  let sekarang = item
  const penjaga = new Set<string>([item.id])
  while (sekarang.indukId) {
    const induk = peta.get(sekarang.indukId)
    if (!induk || penjaga.has(induk.id)) break
    hasil.unshift(induk)
    penjaga.add(induk.id)
    sekarang = induk
  }
  return hasil
}

export function akarDari(
  items: ItemDrive[],
  folderId: string
): ItemDrive | null {
  return items.find((i) => i.id === folderId) ?? items.find((i) => !i.indukId) ?? null
}

export type Ringkasan = {
  jumlahBerkas: number
  jumlahFolder: number
  totalByte: number
  diperbaruiPada: string | null
}

export async function ambilRingkasan(): Promise<Ringkasan> {
  const baris = await satu<{
    jumlah_berkas: string
    jumlah_folder: string
    total_byte: string
    diperbarui: string | null
  }>(
    `select
       count(*) filter (where folder = false)::text as jumlah_berkas,
       count(*) filter (where folder = true)::text as jumlah_folder,
       coalesce(sum(ukuran) filter (where folder = false), 0)::text as total_byte,
       max(disinkron_pada)::text as diperbarui
     from drive_item
     where aktif = true`
  )

  return {
    jumlahBerkas: Number(baris?.jumlah_berkas ?? "0"),
    jumlahFolder: Number(baris?.jumlah_folder ?? "0"),
    totalByte: Number(baris?.total_byte ?? "0"),
    diperbaruiPada: baris?.diperbarui ?? null,
  }
}

export type TahapSinkron = "token" | "akar" | "jelajah" | "rapikan" | "selesai"

export type LogSinkron = {
  id: string
  mulai: string
  selesai: string | null
  jumlahItem: number
  jumlahFolder: number
  totalByte: number
  status: "jalan" | "sukses" | "gagal"
  galat: string | null
  oleh: string | null
  tahap: TahapSinkron | null
  folderSelesai: number
  folderTotal: number
  perkiraanTotal: number
  /** Waktu kemajuan terakhir ditulis; null sebelum penulisan pertama. */
  diperbarui: string | null
}

export async function ambilLogTerakhir(): Promise<LogSinkron | null> {
  return ambilLogMilik(null)
}

// Dipakai dua tempat: dasbor (log terakhir) dan endpoint kemajuan
// /api/sinkron/status, yang mengambil satu baris tertentu berdasarkan id.
export async function ambilLogMilik(
  id: string | null
): Promise<LogSinkron | null> {
  const baris = await satu<{
    id: string
    mulai: string
    selesai: string | null
    jumlah_item: number
    jumlah_folder: number
    total_byte: string
    status: "jalan" | "sukses" | "gagal"
    galat: string | null
    oleh: string | null
    tahap: TahapSinkron | null
    folder_selesai: number
    folder_total: number
    perkiraan_total: number
    diperbarui: string | null
  }>(
    `select id::text, mulai::text, selesai::text, jumlah_item, jumlah_folder,
            total_byte::text, status, galat, oleh, tahap,
            folder_selesai, folder_total, perkiraan_total, diperbarui::text
       from sinkron_log
      ${id ? "where id = $1" : ""}
      order by mulai desc
      limit 1`,
    id ? [id] : []
  )

  if (!baris) return null

  // Baris 'jalan' yang tidak bergerak lama berasal dari proses yang mati di
  // tengah jalan (server restart, proses dibunuh). Kemajuan ditulis paling
  // lambat tiap ~0,4 detik, jadi hening 10 menit berarti prosesnya sudah tidak
  // ada — jangan biarkan dasbor menampilkan bilah yang berputar selamanya.
  const BASI_MS = 10 * 60 * 1000
  const basi =
    baris.status === "jalan" &&
    Date.now() - Date.parse(baris.diperbarui ?? baris.mulai) > BASI_MS

  return {
    id: baris.id,
    mulai: baris.mulai,
    selesai: baris.selesai,
    jumlahItem: baris.jumlah_item,
    jumlahFolder: baris.jumlah_folder,
    totalByte: Number(baris.total_byte),
    status: basi ? "gagal" : baris.status,
    galat: basi
      ? "Sinkron berhenti tanpa penutup (proses terhenti). Jalankan ulang."
      : baris.galat,
    oleh: baris.oleh,
    tahap: baris.tahap,
    folderSelesai: baris.folder_selesai,
    folderTotal: baris.folder_total,
    perkiraanTotal: baris.perkiraan_total,
    diperbarui: baris.diperbarui,
  }
}
