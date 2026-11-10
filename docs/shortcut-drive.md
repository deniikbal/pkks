# Perbaikan Dukungan Shortcut Google Drive

## Masalah
Folder pintasan (shortcut) di Google Drive tidak bisa dibuka setelah disinkronisasi ke aplikasi PKKS.

## Penyebab
Google Drive API mengembalikan metadata khusus untuk shortcut:
- `mimeType`: `application/vnd.google-apps.shortcut`
- `shortcutDetails.targetId`: ID folder/file tujuan shortcut

Kode sebelumnya tidak menangani shortcut secara khusus, sehingga:
1. Shortcut dianggap sebagai file (bukan folder)
2. Link yang disimpan tidak bisa membuka folder tujuan

## Solusi

### 1. Update Metadata yang Diambil
File: `lib/drive.ts`

Tambahkan `shortcutDetails` ke fields yang diminta dari Google Drive API:
```typescript
url.searchParams.set(
  "fields",
  "id,name,mimeType,size,modifiedTime,webViewLink,shortcutDetails,thumbnailLink"
)
```

### 2. Tambahkan Helper Functions
```typescript
function isFolder(item: MetadataDrive): boolean
function isShortcut(item: MetadataDrive): boolean
function dapatkanLink(item: MetadataDrive): string | null
```

### 3. Update Logika Penelusuran Folder
Shortcut yang pointing ke folder sekarang:
- Dianggap sebagai folder (`folder = true`)
- Ditelusuri isinya menggunakan `targetId`
- Link yang disimpan mengarah ke folder tujuan

## Hasil
Setelah sinkronisasi ulang:
- ✅ Shortcut folder muncul sebagai folder di aplikasi
- ✅ Klik shortcut membuka folder tujuan yang benar
- ✅ Isi folder shortcut ikut tersinkronisasi

## Cara Menggunakan
1. Jalankan sinkronisasi ulang dari halaman Dashboard
2. Shortcut folder akan muncul dengan ikon folder
3. Klik shortcut untuk membuka folder tujuan

## Catatan
- Shortcut ke file tetap dianggap sebagai file
- Hanya shortcut ke folder yang diperlakukan khusus
- Kedalaman penelusuran tetap dibatasi 8 level
