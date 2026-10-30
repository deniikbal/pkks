const ZONA = "Asia/Jakarta"

// Ukuran berkas dalam satuan yang dibaca manusia. Koma dipakai sebagai
// desimal karena pembacanya berbahasa Indonesia.
export function formatUkuran(byte: number | null | undefined): string {
  if (byte === null || byte === undefined || Number.isNaN(byte)) return "-"
  if (byte < 1024) return `${byte} B`
  const satuan = ["KB", "MB", "GB", "TB"]
  let nilai = byte / 1024
  let i = 0
  while (nilai >= 1024 && i < satuan.length - 1) {
    nilai /= 1024
    i += 1
  }
  return `${nilai.toFixed(nilai >= 10 ? 0 : 1).replace(".", ",")} ${satuan[i]}`
}

export function formatTanggal(
  nilai: string | Date | null | undefined
): string {
  if (!nilai) return "-"
  const tanggal = typeof nilai === "string" ? new Date(nilai) : nilai
  if (Number.isNaN(tanggal.getTime())) return "-"
  const bagian = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: ZONA,
  }).format(tanggal)
  return bagian.replace(/\./g, "")
}

export function formatTanggalJam(
  nilai: string | Date | null | undefined
): string {
  if (!nilai) return "-"
  const tanggal = typeof nilai === "string" ? new Date(nilai) : nilai
  if (Number.isNaN(tanggal.getTime())) return "-"
  const jam = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA,
  })
    .format(tanggal)
    .replace(":", ".")
  return `${formatTanggal(tanggal)}, ${jam}`
}

// Label jenis berkas diambil dari MIME yang benar-benar dikirim Drive,
// bukan dari akhiran nama yang bisa saja salah.
export function jenisBerkas(mime: string, folder: boolean): string {
  if (folder) return "Folder"
  const peta: Record<string, string> = {
    "application/pdf": "PDF",
    "application/vnd.google-apps.document": "Docs",
    "application/vnd.google-apps.spreadsheet": "Sheets",
    "application/vnd.google-apps.presentation": "Slides",
    "application/vnd.google-apps.form": "Form",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PPTX",
    "application/vnd.ms-excel": "XLS",
    "application/msword": "DOC",
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "video/mp4": "MP4",
    "application/zip": "ZIP",
  }
  if (peta[mime]) return peta[mime]
  if (mime.startsWith("image/")) return "Gambar"
  if (mime.startsWith("video/")) return "Video"
  if (mime.startsWith("audio/")) return "Audio"
  const akhiran = mime.split("/").pop() ?? ""
  return akhiran ? akhiran.toUpperCase().slice(0, 6) : "Berkas"
}

export function tautanUnduh(id: string): string {
  return `https://drive.google.com/uc?export=download&id=${id}`
}

export function tautanPratinjau(id: string): string {
  return `https://drive.google.com/file/d/${id}/preview`
}
