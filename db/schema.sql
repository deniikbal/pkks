-- Skema PKKS: portal arsip dokumen dari Google Drive.
-- Yang disimpan lokal hanya metadata hasil sinkronisasi dan akun pengguna.
-- Isi dokumen tetap tinggal di Google Drive.

create table if not exists pengguna (
  id             bigserial primary key,
  email          text not null unique,
  nama           text not null,
  kata_sandi_hash text not null,
  peran          text not null default 'pengawas'
                 check (peran in ('admin', 'pengawas')),
  aktif          boolean not null default true,
  dibuat_pada    timestamptz not null default now()
);

-- Sesi disimpan sebagai hash token, bukan token mentah, supaya bocornya isi
-- tabel tidak langsung memberi akses masuk.
create table if not exists sesi (
  id           text primary key,
  pengguna_id  bigint not null references pengguna(id) on delete cascade,
  kedaluwarsa  timestamptz not null,
  dibuat_pada  timestamptz not null default now(),
  ip           text,
  agen         text
);

create index if not exists idx_sesi_pengguna on sesi (pengguna_id);

create table if not exists percobaan_masuk (
  id        bigserial primary key,
  ip        text not null,
  email     text,
  berhasil  boolean not null default false,
  pada      timestamptz not null default now()
);

create index if not exists idx_percobaan_ip on percobaan_masuk (ip, pada desc);

-- Metadata item Drive (folder maupun berkas).
create table if not exists drive_item (
  id              text primary key,
  induk_id        text,
  nama            text not null,
  mime            text not null,
  folder          boolean not null default false,
  ukuran          bigint,
  diubah_pada     timestamptz,
  tautan_lihat    text,
  tautan_thumb    text,
  kedalaman       integer not null default 0,
  aktif           boolean not null default true,
  disinkron_pada  timestamptz not null default now()
);

create index if not exists idx_drive_induk on drive_item (induk_id, folder, nama);
create index if not exists idx_drive_diubah on drive_item (diubah_pada desc);
-- Pencarian nama memakai ILIKE, jadi indeks pola huruf kecil ini yang dipakai.
create index if not exists idx_drive_nama on drive_item (lower(nama) text_pattern_ops);

create table if not exists sinkron_log (
  id            bigserial primary key,
  mulai         timestamptz not null default now(),
  selesai       timestamptz,
  jumlah_item   integer not null default 0,
  jumlah_folder integer not null default 0,
  total_byte    bigint not null default 0,
  status        text not null default 'jalan'
                check (status in ('jalan', 'sukses', 'gagal')),
  galat         text,
  oleh          text,
  -- Kemajuan penelusuran Drive, ditulis berkala selama status masih 'jalan'
  -- supaya halaman dasbor bisa menampilkan progres tanpa menebak-nebak.
  -- tahap: 'token' -> 'akar' -> 'jelajah' -> 'rapikan' -> 'selesai'.
  tahap         text,
  folder_selesai integer not null default 0,
  folder_total   integer not null default 0
);

create index if not exists idx_sinkron_mulai on sinkron_log (mulai desc);

-- Kolom kemajuan sinkronisasi ditambahkan belakangan; `create table if not
-- exists` di atas tidak menyentuh tabel yang sudah ada, jadi ditambahkan di
-- sini agar `npm run migrate` tetap aman dijalankan berulang.
alter table sinkron_log add column if not exists tahap text;
alter table sinkron_log
  add column if not exists folder_selesai integer not null default 0;
alter table sinkron_log
  add column if not exists folder_total integer not null default 0;

-- Perkiraan jumlah folder untuk menghitung persen kemajuan. Diisi dari jumlah
-- folder sinkron terakhir yang sukses saat baris baru dibuat, karena total
-- sebenarnya baru pasti setelah penelusuran usai. Lihat catatan di
-- app/api/sinkron/status/route.ts.
alter table sinkron_log
  add column if not exists perkiraan_total integer not null default 0;

-- Waktu kemajuan terakhir ditulis, untuk membedakan proses yang masih hidup
-- dari baris 'jalan' yang tertinggal karena prosesnya mati.
alter table sinkron_log
  add column if not exists diperbarui timestamptz;
