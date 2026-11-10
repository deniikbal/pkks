import { createSign } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { query, satu } from "./db"

const CAKUPAN = "https://www.googleapis.com/auth/drive.readonly"
const BATAS_ITEM = 5000
const BATAS_KEDALAMAN = 8

export type StatusSumber = {
  siap: boolean
  cara: "service-account" | "oauth" | "belum-diisi"
  folderId: string
  pesan: string
}

type MetadataDrive = {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime?: string
  webViewLink?: string
  shortcutDetails?: {
    targetId?: string
    targetMimeType?: string
  }
  thumbnailLink?: string
}

function b64url(nilai: Buffer | string): string {
  const buf = typeof nilai === "string" ? Buffer.from(nilai) : nilai
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

export function statusSumber(): StatusSumber {
  const folderId = process.env.PKKS_DRIVE_FOLDER_ID?.trim() ?? ""
  const jalurSa = process.env.PKKS_GOOGLE_SERVICE_ACCOUNT_JSON?.trim() ?? ""
  const refresh = process.env.PKKS_GOOGLE_REFRESH_TOKEN?.trim() ?? ""

  if (jalurSa) {
    let ada = false
    try {
      // Jalur kredensial datang dari env, jadi tidak bisa ditelusuri statis.
      ada = readFileSync(path.resolve(/*turbopackIgnore: true*/ jalurSa)).length > 0
    } catch {
      ada = false
    }
    return {
      siap: ada && Boolean(folderId),
      cara: "service-account",
      folderId,
      pesan: !ada
        ? "Berkas service account tidak ditemukan di jalur yang diisi."
        : !folderId
          ? "ID folder Google Drive belum diisi."
          : "Siap disinkronkan lewat service account.",
    }
  }

  if (refresh) {
    return {
      siap: Boolean(folderId),
      cara: "oauth",
      folderId,
      pesan: !folderId
        ? "ID folder Google Drive belum diisi."
        : "Siap disinkronkan lewat OAuth refresh token.",
    }
  }

  return {
    siap: false,
    cara: "belum-diisi",
    folderId,
    pesan: "Kredensial Google Drive belum diisi, jadi data dokumen belum bisa diambil.",
  }
}

async function tokenServiceAccount(jalur: string): Promise<string> {
  const kunci = JSON.parse(
    readFileSync(/*turbopackIgnore: true*/ path.resolve(jalur), "utf8")
  ) as {
    client_email: string
    private_key: string
    token_uri: string
  }

  const sekarang = Math.floor(Date.now() / 1000)
  const kepala = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const badan = b64url(
    JSON.stringify({
      iss: kunci.client_email,
      scope: CAKUPAN,
      aud: kunci.token_uri,
      iat: sekarang,
      exp: sekarang + 3600,
    })
  )
  const penanda = createSign("RSA-SHA256")
  penanda.update(`${kepala}.${badan}`)
  const tandaTangan = b64url(penanda.sign(kunci.private_key))

  const respons = await fetch(kunci.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${kepala}.${badan}.${tandaTangan}`,
    }),
    cache: "no-store",
  })

  if (!respons.ok) {
    throw new Error(
      `Google menolak service account: ${(await respons.text()).slice(0, 200)}`
    )
  }
  const data = (await respons.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("Google tidak mengirim access token.")
  return data.access_token
}

async function tokenOauth(): Promise<string> {
  const respons = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.PKKS_GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.PKKS_GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.PKKS_GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })

  if (!respons.ok) {
    throw new Error(
      `Google menolak refresh token: ${(await respons.text()).slice(0, 200)}`
    )
  }
  const data = (await respons.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("Google tidak mengirim access token.")
  return data.access_token
}

async function tokenAkses(): Promise<string> {
  const jalurSa = process.env.PKKS_GOOGLE_SERVICE_ACCOUNT_JSON?.trim() ?? ""
  if (jalurSa) return tokenServiceAccount(jalurSa)
  return tokenOauth()
}

async function ambilJson<T>(url: string, token: string): Promise<T> {
  const respons = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!respons.ok) {
    const isi = (await respons.text()).slice(0, 300)
    throw new Error(`Permintaan Drive gagal (${respons.status}): ${isi}`)
  }
  return (await respons.json()) as T
}

async function metadataItem(id: string, token: string): Promise<MetadataDrive> {
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${id}`)
  url.searchParams.set(
    "fields",
    "id,name,mimeType,size,modifiedTime,webViewLink,shortcutDetails,thumbnailLink"
  )
  url.searchParams.set("supportsAllDrives", "true")
  return ambilJson<MetadataDrive>(url.toString(), token)
}

async function anakFolder(
  idFolder: string,
  token: string
): Promise<MetadataDrive[]> {
  const kumpulan: MetadataDrive[] = []
  let halaman: string | undefined

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files")
    url.searchParams.set("q", `'${idFolder}' in parents and trashed = false`)
    url.searchParams.set(
      "fields",
      "nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,shortcutDetails,thumbnailLink)"
    )
    url.searchParams.set("pageSize", "1000")
    url.searchParams.set("orderBy", "folder,name")
    url.searchParams.set("supportsAllDrives", "true")
    url.searchParams.set("includeItemsFromAllDrives", "true")
    if (halaman) url.searchParams.set("pageToken", halaman)

    const data = await ambilJson<{
      files?: MetadataDrive[]
      nextPageToken?: string
    }>(url.toString(), token)

    kumpulan.push(...(data.files ?? []))
    halaman = data.nextPageToken
  } while (halaman)

  return kumpulan
}

export async function ujiKoneksiDrive(): Promise<{ ok: boolean; pesan: string }> {
  const status = statusSumber()
  if (!status.siap) return { ok: false, pesan: status.pesan }

  try {
    const token = await tokenAkses()
    const akar = await metadataItem(status.folderId, token)
    return { ok: true, pesan: `Terhubung ke folder "${akar.name}".` }
  } catch (galat) {
    return {
      ok: false,
      pesan: galat instanceof Error ? galat.message : "Gagal menghubungi Drive.",
    }
  }
}

export type HasilSinkron = {
  jumlahItem: number
  jumlahFolder: number
  totalByte: number
  idLog: string | null
}

export class GalatSinkron extends Error {
  readonly idLog: string | null
  constructor(pesan: string, idLog: string | null) {
    super(pesan)
    this.name = "GalatSinkron"
    this.idLog = idLog
  }
}

export type TahapSinkron = "token" | "akar" | "jelajah" | "rapikan" | "selesai"

export async function sinkronkanDrive(oleh: string): Promise<HasilSinkron> {
  const status = statusSumber()
  if (!status.siap) throw new Error(status.pesan)

  const log = await satu<{ id: string }>(`insert into sinkron_log (oleh, tahap, folder_total, perkiraan_total) values ($1, 'token', 1, coalesce((select jumlah_folder from sinkron_log where status = 'sukses' order by mulai desc limit 1), 0)) returning id::text`, [oleh])
  const logId = log?.id

  const waktuMulaiDb = (await satu<{ sekarang: string }>("select now()::text as sekarang"))?.sekarang ?? new Date().toISOString()

  let jumlahItem = 0
  let jumlahFolder = 0
  let totalByte = 0
  let folderSelesai = 0
  let folderTotal = 1
  let tulisTerakhir = 0

  async function catatKemajuan(tahap: TahapSinkron, paksa = false) {
    if (!logId) return
    const sekarang = Date.now()
    if (!paksa && sekarang - tulisTerakhir < 400) return
    tulisTerakhir = sekarang
    await query(`update sinkron_log set tahap = $2, folder_selesai = $3, folder_total = $4, jumlah_item = $5, jumlah_folder = $6, total_byte = $7, diperbarui = now() where id = $1`, [logId, tahap, folderSelesai, folderTotal, jumlahItem, jumlahFolder, totalByte])
  }

  try {
    const token = await tokenAkses()
    await catatKemajuan("akar", true)
    const akar = await metadataItem(status.folderId, token)

    await simpanItem(akar, null, 0)
    jumlahFolder += 1

    const antrean: Array<{ id: string; kedalaman: number }> = [{ id: akar.id, kedalaman: 0 }]

    while (antrean.length > 0 && jumlahItem < BATAS_ITEM) {
      const sekarang = antrean.shift()
      if (!sekarang) break
      if (sekarang.kedalaman >= BATAS_KEDALAMAN) {
        folderSelesai += 1
        await catatKemajuan("jelajah")
        continue
      }

      const isi = await anakFolder(sekarang.id, token)

      for (const item of isi) {
        if (jumlahItem >= BATAS_ITEM) break
        // Shortcut ke folder juga dianggap folder
        const folder = isFolder(item) || isShortcut(item)
        await simpanItem(item, sekarang.id, sekarang.kedalaman + 1, folder)
        jumlahItem += 1
        if (jumlahItem === 1) await catatKemajuan("jelajah", true)
        if (folder) {
          jumlahFolder += 1
          folderTotal += 1
          // Untuk shortcut, gunakan targetId sebagai ID yang akan ditelusuri
          const idUntukDitelusuri = item.shortcutDetails?.targetId ?? item.id
          antrean.push({ id: idUntukDitelusuri, kedalaman: sekarang.kedalaman + 1 })
        } else {
          totalByte += Number(item.size ?? 0)
        }
      }

      folderSelesai += 1
      await catatKemajuan("jelajah")
    }

    await catatKemajuan("rapikan", true)

    await query(`update drive_item set aktif = false where disinkron_pada < $1 and id <> $2`, [waktuMulaiDb, akar.id])

    if (logId) {
      await query(`update sinkron_log set selesai = now(), jumlah_item = $2, jumlah_folder = $3, total_byte = $4, status = 'sukses', tahap = 'selesai', folder_selesai = $5, folder_total = $5, perkiraan_total = $5 where id = $1`, [logId, jumlahItem, jumlahFolder, totalByte, folderTotal])
    }

    return { jumlahItem, jumlahFolder, totalByte, idLog: logId ?? null }
  } catch (galat) {
    const pesan = galat instanceof Error ? galat.message : "Gagal sinkron."
    if (logId) {
      await query(`update sinkron_log set selesai = now(), jumlah_item = $2, jumlah_folder = $3, total_byte = $4, status = 'gagal', galat = $5, folder_selesai = $6, folder_total = $7 where id = $1`, [logId, jumlahItem, jumlahFolder, totalByte, pesan.slice(0, 500), folderSelesai, folderTotal])
    }
    throw new GalatSinkron(pesan, logId ?? null)
  }
}

function isFolder(item: MetadataDrive): boolean {
  const folderTypes = [
    "application/vnd.google-apps.folder",
    "application/folder",
  ] as const
  return folderTypes.includes(item.mimeType as typeof folderTypes[number])
}

function isShortcut(item: MetadataDrive): boolean {
  return item.mimeType === "application/vnd.google-apps.shortcut"
}

function dapatkanLink(item: MetadataDrive): string | null {
  if (isFolder(item)) {
    return item.webViewLink ?? null
  }
  if (isShortcut(item) && item.shortcutDetails?.targetId) {
    return `https://drive.google.com/drive/u/0/folder?id=${item.shortcutDetails.targetId}`
  }
  return item.webViewLink ?? null
}

async function simpanItem(
  item: MetadataDrive,
  indukId: string | null,
  kedalaman: number,
  folderPaksa?: boolean
): Promise<void> {
  const folder = isFolder(item) || folderPaksa
  const tautan = dapatkanLink(item)

  await query(
    `insert into drive_item
       (id, induk_id, nama, mime, folder, ukuran, diubah_pada,
        tautan_lihat, tautan_thumb, kedalaman, aktif, disinkron_pada)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, now())
     on conflict (id) do update
        set induk_id = excluded.induk_id,
            nama = excluded.nama,
            mime = excluded.mime,
            folder = excluded.folder,
            ukuran = excluded.ukuran,
            diubah_pada = excluded.diubah_pada,
            tautan_lihat = excluded.tautan_lihat,
            tautan_thumb = excluded.tautan_thumb,
            kedalaman = excluded.kedalaman,
            aktif = true,
            disinkron_pada = now()`,
    [
      item.id,
      indukId,
      item.name,
      item.mimeType,
      folder,
      item.size ? Number(item.size) : null,
      item.modifiedTime ?? null,
      tautan,
      item.thumbnailLink ?? null,
      kedalaman,
    ]
  )
}