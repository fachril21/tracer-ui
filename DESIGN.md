# Tracer: Panduan Desain Revamp 2026

> Berlaku untuk dashboard Tracer hasil revamp (pengganti tampilan `tracer-fe`). Fungsi tiap halaman tetap mengikuti implementasi `tracer-fe` dan `docs/spec/04`; dokumen ini mengatur arah visual, token, pola interaksi, dan kerangka aplikasi.
> Dasar tren: "UI Design Trends 2026" dari Tubik Studio (7 tren), diterjemahkan ke kebutuhan produk analitik yang padat data.
> Label: **[Wajib]** mengikat. **[Usulan]** arah yang disarankan, perlu persetujuan pemilik produk. **[Nanti]** pola untuk fitur yang belum dibangun. **[BELUM DIPUTUSKAN]** jangan berasumsi.
> Seluruh teks UI tetap Bahasa Indonesia.

---

## 0. Dari tren ke Tracer

| Tren 2026 (Tubik)                         | Arti untuk Tracer                                                                                                                                       | Bobot     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Raw aesthetics: mono, grid, wireframe     | **Arah visual utama.** Tracer alat instrumen: struktur ditampilkan, bukan disembunyikan. Grid terlihat, angka gaya buku besar, mono untuk data teknis.  | Inti      |
| Anti liquid glass                         | Tidak ada efek kaca, blur, atau gradien di atas data, pemutar, dan heatmap. Kedalaman hanya untuk lapisan yang melayang.                                | Inti      |
| Purposeful motion                         | Gerak hanya untuk status, struktur, dan umpan balik. Aksi sering = instan. Aksi kritis jarang = jeda sengaja yang terlihat.                             | Inti      |
| Inclusive visuals (kendali gerak)         | Hormati `prefers-reduced-motion` dan sediakan pengaturan gerak di dalam aplikasi.                                                                       | Wajib     |
| Fluid typography (rem + clamp)            | Judul dan angka statistik mengalir; teks tabel dan kontrol tetap di ukuran minimum terbaca supaya kepadatan data stabil.                                | Terbatas  |
| AI collaboration, not automation          | **[Nanti]** Asisten sebagai panel samping yang dipanggil, tidak pernah mengubah data, filter, atau angka tanpa persetujuan.                             | Nanti     |
| Crafted, not prompted                     | Identitas yang terasa dibuat tangan: elemen tanda tangan (garis jejak, penggaris koordinat), suara produk yang jujur, bukan template dashboard generik. | Karakter  |

---

## 1. Prinsip

1. **Instrumen, bukan brosur.** Setiap piksel melayani pembacaan data. Dekorasi yang tidak membawa makna dihapus.
2. **Tunjukkan strukturnya.** Grid, penggaris, garis tipis, dan label koordinat terlihat. Pengguna harus bisa menebak bagaimana angka dihitung dari cara angka itu disusun.
3. **Jujur soal data, ringkas soal kata.** Kualitas data (celah, sesi sebagian, klik tak terhitung) selalu terlihat sebagai ringkasan satu baris. Penjelasan panjang dibuka bertahap, tidak dihapus.
4. **Satu aksen, sisanya netral.** Aksen hanya untuk aksi utama, item aktif, fokus, dan tautan. Warna status punya peran sendiri dan tidak dipakai sebagai hiasan.
5. **Gerak = informasi.** Tidak ada animasi yang tidak menjawab pertanyaan "apa yang sedang terjadi?".
6. **Pengguna memegang kendali.** Gerak, sumber daya eksternal pemutar, kepadatan tabel, dan tema bisa diatur. Pilihan privasi selalu default paling aman.
7. **Semua nilai lewat token.** Tidak ada warna, ukuran, radius, atau durasi yang ditulis langsung di komponen.

---

## 2. Arah visual: "Buku Besar Operasional" [Usulan]

Dashboard Tracer terasa seperti **lembar kerja teknis yang rapi**: kertas netral hangat, garis rambut, grid yang terlihat di area panggung (pemutar, heatmap, peta gulir), angka berlebar tetap yang rata kanan seperti buku besar, dan tipografi mono untuk semua yang bersifat mesin (URL, selector, path, timecode, ID sesi, kunci).

Ciri pembeda dari dashboard SaaS generik:

- **Grid terlihat sebagai alat, bukan latar.** Panggung snapshot memakai kertas grid 8 px dengan garis mayor tiap 64 px, plus **penggaris koordinat** (0/25/50/75/100%) di tepi atas dan kiri.
- **Garis jejak (trace line).** Motif tanda tangan Tracer: garis 1 px dengan simpul persegi kecil yang menandai kejadian (pindah halaman, smart event, chunk). Dipakai di timeline pemutar, linimasa navigasi, dan ringkasan sesi di tabel.
- **Simpul persegi, bukan titik bulat.** Penanda kejadian berbentuk persegi 6 px (mengikuti contoh node persegi di tren raw). Lingkaran hanya untuk avatar dan indikator "hidup".
- **Sudut tegas.** Radius kecil (4–8 px). Pil hanya untuk lencana dan chip.
- **Tanpa bayangan pada kartu.** Pemisahan memakai garis dan beda permukaan. Satu bayangan saja untuk lapisan melayang.

Yang ditolak secara sadar: glassmorphism, gradien mesh di latar, ilustrasi 3D generik, kartu statistik berwarna-warni, ikon dalam kotak bergradien, dan "hero" di dalam aplikasi.

---

## 3. Token

### 3.1 Warna, tema terang (default) [Usulan]

| Token                                           | Nilai                             | Pakai                                                                 |
| ----------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `paper`                                         | `#F6F6F3`                         | Latar halaman dan sidebar (kertas hangat)                             |
| `canvas`                                        | `#FFFFFF`                         | Kartu, tabel, panel, dialog                                           |
| `surface-soft`                                  | `#F0F0EC`                         | Header tabel, blok kode, latar sisipan                                |
| `surface-hover`                                 | `#EAEAE5`                         | Hover baris dan item navigasi                                         |
| `surface-active`                                | `#E3E3DD`                         | Item navigasi aktif, baris terpilih                                   |
| `grid-minor` / `grid-major`                     | `#ECECE7` / `#DADAD3`             | Kertas grid panggung                                                  |
| `hairline`                                      | `#DEDED8`                         | Pembatas dekoratif                                                    |
| `border-control`                                | `#8A8C92`                         | Tepi input, checkbox, tombol sekunder                                 |
| `ink`                                           | `#16171A`                         | Teks utama                                                            |
| `charcoal`                                      | `#3A3B3F`                         | Teks sekunder kuat                                                    |
| `mute`                                          | `#5B5D63`                         | Teks pendukung, placeholder                                           |
| `stone`                                         | `#8E9096`                         | Ikon pasif, label grup. **Bukan untuk teks isi**                      |
| `faint`                                         | `#C8C9C4`                         | Nonaktif, dekoratif                                                   |
| `primary`                                       | `#2B48E0`                         | Aksi utama, aktif, cincin fokus, tautan                               |
| `primary-pressed`                               | `#1F37B8`                         | Hover dan ditekan                                                     |
| `primary-soft`                                  | `#E9EDFF`                         | Chip terpilih, sorotan baris kejadian di pemutar                      |
| `on-primary`                                    | `#FFFFFF`                         | Teks di atas `primary`                                                |
| `success-text` / `success-bg` / `success-solid` | `#17663A` / `#E6F4EC` / `#2E8B57` | Terdeteksi, lengkap, berlangsung                                      |
| `warning-text` / `warning-bg` / `warning-solid` | `#8A4B00` / `#FFF3DF` / `#E07B00` | Menunggu, ada celah, rage/dead click                                  |
| `danger-text` / `danger-bg` / `danger-solid`    | `#B4232F` / `#FDECEE` / `#E03A47` | Error JS, gagal, destruktif                                           |

Aksen kobalt dipilih karena netral terhadap semantik status (tidak bertabrakan dengan hijau, kuning, merah) dan tetap tegas di atas kertas hangat. Mengganti warna merek cukup mengubah tiga token `primary*` lalu cek ulang kontras.

### 3.2 Warna, tema gelap [Usulan]

Tren anti liquid glass menekankan sistem yang bekerja lintas tema. Semua token punya padanan gelap dengan nama yang sama.

| Token                                           | Nilai                             |
| ----------------------------------------------- | --------------------------------- |
| `paper`                                         | `#111214`                         |
| `canvas`                                        | `#18191C`                         |
| `surface-soft` / `surface-hover` / `surface-active` | `#1E1F23` / `#24262A` / `#2B2D32` |
| `grid-minor` / `grid-major`                     | `#1E2023` / `#2A2C30`             |
| `hairline`                                      | `#2C2E33`                         |
| `border-control`                                | `#73757C`                         |
| `ink` / `charcoal` / `mute` / `stone` / `faint` | `#ECECE8` / `#CFD0CC` / `#A3A5AB` / `#6E7076` / `#3A3C41` |
| `primary` / `primary-pressed` / `primary-soft` / `on-primary` | `#8C9BFF` / `#A9B4FF` / `#1D2350` / `#0D0F1A` |
| `success-text` / `success-bg`                   | `#6FD49B` / `#12291C`             |
| `warning-text` / `warning-bg`                   | `#F2B45C` / `#2E2110`             |
| `danger-text` / `danger-bg`                     | `#FF8A93` / `#331618`             |

[Wajib] Panggung pemutar dan snapshot heatmap **tetap berlatar terang** di kedua tema karena menampilkan website pengunjung apa adanya. Bingkai panggung mengikuti tema.

Tema dipilih lewat menu akun: **Ikuti sistem** (default), Terang, Gelap.

### 3.3 Kontras terhitung (WCAG)

| Pasangan (terang)                          | Rasio | Izin pakai                         |
| ------------------------------------------ | ----- | ---------------------------------- |
| `ink` di `canvas` / di `paper`             | 17,9 / 16,6 | Semua teks                   |
| `charcoal` di `canvas`                     | 11,2  | Teks sekunder                      |
| `mute` di `canvas` / di `paper`            | 6,6 / 6,1 | Teks pendukung                 |
| `primary` di `canvas`, `on-primary` di `primary` | 6,8 | Tautan, tombol utama           |
| `primary-pressed` di `primary-soft`        | 7,9   | Chip terpilih                      |
| `success-text` / `warning-text` / `danger-text` di `canvas` | 7,0 / 6,8 / 6,5 | Teks status |
| `*-text` di `*-bg` masing-masing           | 6,2 / 6,2 / 5,7 | Lencana                  |
| `border-control` di `canvas`               | 3,4   | Tepi kontrol (minimal 3)           |
| `stone` di `canvas`                        | 3,2   | Hanya non-teks                     |
| `success-solid` / `danger-solid`           | 4,3 / 4,3 | Hanya non-teks atau teks besar |
| `warning-solid`                            | 3,0   | Hanya non-teks, wajib dengan ikon atau teks |
| `hairline`                                 | 1,4   | Hanya dekoratif                    |

| Pasangan (gelap)                           | Rasio |
| ------------------------------------------ | ----- |
| `ink` di `canvas` / di `paper`             | 14,8 / 15,8 |
| `mute` di `canvas`                         | 7,1   |
| `primary` di `canvas`, `on-primary` di `primary` | 6,9 / 7,5 |
| `success-text` / `warning-text` / `danger-text` di `canvas` | 9,7 / 9,6 / 7,8 |
| `*-text` di `*-bg` masing-masing           | 8,5 / 8,5 / 7,3 |
| `border-control` / `stone` di `canvas`     | 3,8 / 3,6 |

[Wajib] Teks status memakai varian `*-text`, tidak pernah `*-solid`.

### 3.4 Tipografi [Usulan]

Dua keluarga, sesuai batas performa:

- **IBM Plex Sans** untuk UI, bobot 400, 500, dan 600. Berkarakter teknis-humanis dan cocok dengan arah "buku besar".
- **IBM Plex Mono** untuk data mesin, bobot 400 dan 500: URL, path, selector, ID, kunci, snippet, timecode, dan **angka statistik besar** (gaya ledger).

Keduanya open source (OFL). Di-self-host dengan subset Latin dan `font-display: swap`. Hanya Plex Sans 400 yang di-preload. Fallback: `system-ui, sans-serif` dan `ui-monospace, monospace`. Semua angka di tabel dan statistik memakai `font-variant-numeric: tabular-nums`.

Serif untuk judul (yang disebut di contoh tren raw) sengaja **tidak** dipakai: anggaran dua keluarga lebih berharga untuk mono, dan di layar padat data serif menambah noise.

**Skala fluid, hanya untuk tampilan besar** (tren fluid typography). Teks kerja tetap ukuran tetap karena tabel padat butuh ukuran minimum yang pasti.

| Token         | Ukuran                                         | Tinggi baris | Bobot | Keluarga | Pakai                          |
| ------------- | ---------------------------------------------- | ------------ | ----- | -------- | ------------------------------ |
| `page-title`  | `clamp(1.5rem, 1.1rem + 1.2vw, 2rem)` (24–32)  | 1,2          | 600   | Sans     | Judul halaman                  |
| `stat`        | `clamp(1.5rem, 1.15rem + 1vw, 2rem)` (24–32)   | 1,1          | 500   | Mono     | Angka kartu statistik          |
| `heading-lg`  | `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)` (18–22) | 1,35      | 600   | Sans     | Judul bagian                   |
| `heading-md`  | 1rem (16)                                      | 1,5          | 600   | Sans     | Judul kartu                    |
| `heading-sm`  | 0.875rem (14)                                  | 1,45         | 600   | Sans     | Judul kecil                    |
| `body-lg`     | 1rem (16)                                      | 1,6          | 400   | Sans     | Bacaan panjang (Pemasangan)    |
| `body`        | 0.875rem (14)                                  | 1,45         | 400   | Sans     | Standar UI, tabel, formulir    |
| `body-strong` | 0.875rem (14)                                  | 1,45         | 600   | Sans     | Penekanan, item aktif          |
| `caption`     | 0.75rem (12)                                   | 1,35         | 400   | Sans     | Meta, bantuan                  |
| `label`       | 0.6875rem (11), kapital, jarak huruf +0,06em   | 1,45         | 500   | Mono     | Label grup, header penggaris, kolom koordinat |
| `mono`        | 0.8125rem (13)                                 | 1,55         | 400   | Mono     | Kode, selector, URL            |

[Wajib] Semua ukuran memakai `rem` supaya zoom peramban dan ukuran huruf sistem dihormati. Nilai `clamp()` disimpan sebagai variabel CSS, tidak dihitung ulang per komponen.

### 3.5 Jarak, bentuk, ukuran

| Kelompok        | Nilai                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Jarak (basis 4) | 4, 8, 12, 16, 20, 24, 32, 48, 64. Gunakan ritme berbeda: rapat di dalam kartu (8–12), lega antar bagian (32–48) |
| Radius          | `xs` 2 (simpul, tick), `sm` 4 (tag, input kecil), `md` 6 (tombol, input, item navigasi), `lg` 8 (kartu, menu, dialog), `full` (lencana, chip, avatar) |
| Tinggi kontrol  | `sm` 28, `md` 34 (default), `lg` 44 (sentuh, CTA pemasangan)                                  |
| Ukuran tetap    | Sidebar 240 (terlipat 56), bilah atas 52, baris tabel 40 (padat) / 48 (lega), ikon navigasi 18, ikon sebaris 16 |
| Fokus           | Cincin 2 px `primary`, offset 2 px, hanya saat `:focus-visible`                               |
| Nonaktif        | Opasitas 50%, kursor `not-allowed`, tetap punya alasan via tooltip atau teks bantuan          |
| Bayangan        | Hanya `overlay` = `0 1px 0 hairline, 0 12px 32px rgba(22,23,26,0.14)` untuk menu, popover, dialog, laci |

### 3.6 Grid

- **Grid tata letak:** 12 kolom, gutter 16 (24 pada ≥ 1280). Konten tabel dan grafik lebar maksimal 1440 px; halaman bacaan dan formulir 760 px.
- **Grid panggung:** kertas 8 px (`grid-minor`) dengan garis mayor 64 px (`grid-major`), penggaris koordinat mono di tepi. Hanya di panggung pemutar, Peta Klik, dan Peta Gulir.
- Grid tidak pernah tampil di belakang teks bacaan atau tabel.

---

## 4. Sistem gerak (purposeful + inclusive)

### 4.1 Durasi dan easing

| Token              | Nilai                          | Pakai                                                        |
| ------------------ | ------------------------------ | ------------------------------------------------------------ |
| `motion-instant`   | 0 ms                           | Sortir tabel, ganti tab, ganti filter, pindah halaman, kontrol pemutar |
| `motion-fast`      | 120 ms                         | Hover, tekan, munculnya tooltip                               |
| `motion-base`      | 200 ms                         | Buka/tutup menu, popover, accordion                          |
| `motion-panel`     | 260 ms                         | Laci sidebar, panel samping                                  |
| `motion-deliberate`| 700 ms (minimum tampil)        | Konfirmasi aksi kritis yang jarang (lihat 4.2)               |
| `ease-out`         | `cubic-bezier(0.2, 0, 0, 1)`   | Masuk                                                        |
| `ease-in`          | `cubic-bezier(0.4, 0, 1, 1)`   | Keluar                                                       |

Hanya `transform`, `opacity`, dan `clip-path` yang dianimasikan.

### 4.2 Aturan "trust architecture"

- **Aksi sering selalu instan.** Filter, sortir, pagination, play/pause, seek, dan pindah tab tidak boleh diberi jeda buatan.
- **Aksi kritis dan jarang memakai status proses yang terlihat**, minimal `motion-deliberate`, lalu konfirmasi eksplisit. Berlaku untuk: **Putar kunci**, **Hapus project**, **Hapus anggota**, **Hapus email allowlist**, dan ubah peran admin. Tombol berubah menjadi "Memutar kunci…" lalu menjadi status hasil ("Kunci baru aktif") sebelum dialog tertutup.
- **Analisis berat menampilkan apa yang sedang dikerjakan**, bukan spinner kosong. Contoh Peta Klik: "Mencocokkan sesi… → Menganalisis 64 dari 100 sesi… → Menggambar peta". Peta Gulir sama. Langkah hanya ditampilkan kalau backend atau klien memang melaluinya; tidak boleh ada langkah palsu.
- **Kemajuan nyata pakai bar determinan** (muat chunk, muat stylesheet di pemutar). Kemajuan tak diketahui pakai skeleton berukuran sama dengan konten.
- **Penutupan loop:** setiap simpan menghasilkan perubahan di tempat (nilai baru tampil) ditambah toast. Toast tidak menggantikan perubahan di tempat.

### 4.3 Kendali gerak [Wajib]

- Ikuti `prefers-reduced-motion: reduce` dari sistem.
- Menu akun punya pengaturan **Gerakan: Ikuti sistem / Kurangi / Penuh**, disimpan per peramban.
- Mode "Kurangi": semua transisi menjadi pudar ≤ 120 ms atau instan, tanpa geser, skala, atau animasi heatmap (titik langsung tampil), dan indikator loading berupa teks plus bar statis.
- Pemutaran rekaman adalah **konten**, bukan dekorasi, jadi tidak terpengaruh. Pemutar **tidak pernah autoplay**.

---

## 5. Kerangka aplikasi

```
+---------+-----------------------------------------------------------+
| Sidebar | Bilah atas: [≡] breadcrumb ......... status, ⌘K, akun      |
| 240     |-----------------------------------------------------------|
| (56     | Judul halaman + meta ....................... aksi halaman  |
| terlipat)| Ringkasan kualitas data (satu baris, bila relevan)        |
|         | Konten                                                     |
+---------+-----------------------------------------------------------+
```

### 5.1 Sidebar

| Area            | Isi                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Header          | Pemilih project: monogram persegi (radius `sm`, latar `ink`, teks `paper`), nama, domain dalam mono `caption`. Menu: cari project, daftar, "Buat project baru" |
| Ringkasan       | **Ikhtisar** (beranda project yang dirombak, lihat 8.1)                                               |
| `REKAMAN`       | Histori Sesi · Live Users [Nanti], dengan lencana jumlah aktif                                        |
| `ANALITIK`      | Peta Klik · Peta Gulir · Funnel [Nanti]                                                              |
| `MASUKAN`       | Feedback [Nanti]                                                                                      |
| Bawah           | Pemasangan (titik status persegi) · Pengaturan Project · `ADMIN`: Semua project, Allowlist Email · menu akun (email, peran, tema, gerakan, Keluar) |

- Label grup memakai token `label` (mono kapital). Item yang belum dibangun **disembunyikan**.
- Item 34 px, ikon 18 px, aktif = `surface-active` + teks `ink` 600 + garis 2 px `primary` di kiri + `aria-current="page"`.
- **Dapat dilipat** [Usulan] menjadi rel ikon 56 px dengan tooltip. Status lipat disimpan per peramban.

### 5.2 Bilah atas (52 px, sticky, garis bawah `hairline`)

- Kiri: tombol menu (< 1024 px), breadcrumb. Ruas terakhir bukan tautan. ID panjang ditampilkan dalam mono dan dipotong di tengah (`sess_8f3a…c21e`).
- Kanan: chip status pemasangan, **palet perintah ⌘K / Ctrl K** [Usulan] (cari project, lompat ke halaman, buka sesi lewat ID), avatar.
- Latar solid `canvas`. Saat konten tergulir di bawahnya, garis bawah menebal menjadi `grid-major`. **Tanpa blur.**

### 5.3 Responsif [Wajib]

| Lebar        | Perilaku                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------ |
| ≥ 1280       | Sidebar penuh, navigasi isi halaman lengket di kanan pada halaman panjang                          |
| 1024–1279    | Sidebar penuh atau terlipat, navigasi isi halaman menjadi tab anchor                             |
| < 1024       | **Sidebar menjadi laci kiri** lewat tombol menu: fokus terkunci, tutup dengan Esc, ketuk luar, atau pilih item. (Celah di `tracer-fe`: navigasi hilang total di ukuran ini.) |
| < 768        | Satu kolom. Tabel menjadi daftar kartu ringkas **atau** digulir horizontal di dalam kontainer dengan kolom pertama lengket. Target sentuh 44 px. Halaman tidak pernah menggulir menyamping |

---

## 6. Komponen

| Komponen                 | Spesifikasi                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tombol utama             | `primary`, teks `on-primary`, `body-strong`, tinggi `md`, radius `md`. Maksimal satu per area pandang                                               |
| Tombol sekunder          | `canvas`, garis `border-control`, teks `ink`                                                                                                        |
| Tombol ghost             | Tanpa latar, hover `surface-hover`. Untuk bilah, baris tabel, toolbar pemutar                                                                       |
| Tombol destruktif        | Garis dan teks `danger-text`. Tombol konfirmasi di dialog: latar `danger-text`, teks `on-primary`, dengan status proses (4.2)                       |
| Input, select, tanggal   | Tinggi `md`, garis `border-control`, radius `sm`. Galat: garis `danger-solid` + teks `danger-text` di bawah, isi dari backend apa adanya            |
| Kartu                    | `canvas`, garis `hairline`, radius `lg`, padding 20. Judul kartu bisa diberi label mono kecil di kanan (mis. jumlah baris, zona waktu)             |
| **Kartu statistik**      | Label `caption` `mute`, angka `stat` mono, satuan `caption`. **Delta** ditampilkan sebagai teks + panah (`▲ 12%`) dengan warna status hanya bila maknanya jelas baik/buruk. Tanpa ikon dekoratif besar |
| **Strip kualitas data**  | Satu baris di bawah judul halaman analitik: ikon + ringkasan ("87 dari 100 sesi dianalisis · 12 klik tidak dihitung · 3 sesi ada celah") + tautan "Rincian". Rincian membuka panel samping. Pengganti blok penjelasan panjang di atas konten |
| **Disclosure "Tentang data ini"** | Penjelasan metodologi (disclaimer pemutar, catatan integritas) masuk accordion berlabel jelas, tertutup secara default, tetap bisa dicari dan dibaca pembaca layar |
| Tabel                    | Header lengket `surface-soft` (label `caption` 600), baris 40/48 sesuai pilihan **Kepadatan: Padat/Lega**, garis `hairline`, hover `surface-hover`, angka rata kanan mono tabular. Kolom bisa disembunyikan [Usulan] |
| Lencana status           | Pil `*-bg` + `*-text` + **ikon wajib**. Berlangsung = hijau dengan titik berdenyut (berhenti di mode gerak dikurangi), Selesai = netral, Kedaluwarsa = kuning |
| Lencana integritas       | Lengkap = hijau ikon centang, Ada celah = kuning ikon segitiga, Tidak diketahui = netral ikon tanda tanya, Belum dinilai = netral garis putus     |
| Lencana smart event      | Rage click (ikon api, warning), Dead click (ikon kursor coret, warning), Error JS (ikon bug, danger). Jumlah nol tampil `faint` tanpa latar      |
| Chip filter              | Pil. Terpilih = `primary-soft` + `primary-pressed` + ikon centang. Filter aktif tampil sebagai chip di atas tabel dengan × untuk menghapus satu per satu |
| Blok kode                | `surface-soft`, mono, tombol "Salin" ghost di kanan atas, umpan balik "Tersalin" dengan `aria-live`. Nilai rahasia (bila ada) dimasking dengan tombol tampilkan |
| Keadaan kosong           | Ilustrasi garis tipis gaya wireframe (dibuat khusus, satu warna `stone`), judul `heading-sm`, satu kalimat, satu aksi. Pesan dibedakan: belum ada data / filter terlalu ketat / rentang tanggal kosong |
| Memuat                   | Skeleton sama ukuran dengan konten (tanpa shimmer di mode gerak dikurangi). Spinner hanya di dalam tombol                                          |
| Galat                    | Pesan backend apa adanya + "Coba Lagi" bila bisa diulang + hitung mundur untuk 429. Tidak ada teks galat karangan klien                          |
| Toast                    | Kanan bawah, 5 detik, bisa ditutup, `aria-live="polite"`, tidak menutupi kontrol pemutar                                                          |
| Menu, popover, dialog, laci | `canvas`, radius `lg`, bayangan `overlay`, fokus terkunci, Esc menutup, fokus kembali ke pemicu. Lapisan belakang `ink` 40%, **tanpa blur**     |
| Panel samping (sheet)    | Lebar 400–480 px dari kanan untuk rincian (kualitas data, detail smart event, asisten [Nanti]). Tidak menutupi panggung pemutar di ≥ 1280      |

---

## 7. Visualisasi data

### 7.1 Aturan umum [Wajib]

- Makna tidak pernah hanya lewat warna: selalu ada label langsung, legenda, atau angka.
- Setiap grafik punya ringkasan teks untuk pembaca layar.
- Angka gaya Indonesia (`113.505`, `12,5%`). Tanggal: `9 Okt 2026, 07.27` di zona waktu peramban, zona selalu tersebut di dekat filter tanggal.
- Durasi [Usulan]: `1 j 04 m`, `4 m 12 d`, `38 d`. Timecode pemutar: `mm:ss` atau `h:mm:ss` mono.

### 7.2 Palet kategori [Usulan]

Urut pakai: `#2B48E0` kobalt, `#0F8A7E` teal, `#C2410C` bata, `#7C3AED` ungu, `#B08900` kunyit, `#475569` batu tulis. Maksimal 6 seri; lebih dari itu digabung menjadi "Lainnya". Wajib divalidasi simulasi buta warna sebelum final.

### 7.3 Heatmap Peta Klik [Usulan]

- Gradasi sekuensial **magma terpotong** yang aman buta warna dan seragam secara persepsi: `#3B0F70` → `#8C2981` → `#DE4968` → `#FE9F6D` → `#FCFDBF`. Opasitas naik dari 0,15 ke 0,7 seiring intensitas, sehingga area dingin tetap memperlihatkan halaman.
- Titik terpanas diberi kontur 1 px `ink` 40% supaya tetap terbaca di atas latar halaman yang terang.
- Legenda di dekat panggung: batang gradasi "Sedikit klik → Banyak klik", teks "relatif terhadap titik terpanas di tampilan ini", dan bobot titik terpanas dalam angka.
- Kontrol panggung dalam satu toolbar: **Desktop/Mobile · Layar pertama/Seluruh halaman · Zoom · Intensitas · Tampilkan/sembunyikan latar halaman**.

### 7.4 Peta Gulir

- 20 pita (5%), warna sekuensial satu hue dari `primary`: `#E9EDFF`, `#C7D0FF`, `#9AA9FA`, `#6A7EF0`, `#3F57E3`, `#1F37B8`. Teks angka di pita otomatis `ink` atau `on-primary` mengikuti kontras.
- Penggaris mono 0/25/50/75/100% di kiri, garis putus-putus rata-rata kedalaman dengan label nilai, dan **garis lipatan layar pertama** (fold) berlabel.
- Hover atau fokus pita: "X% kunjungan terukur mencapai titik ini".

### 7.5 Timeline pemutar (garis jejak)

- Trek 4 px `surface-active`, bagian yang sudah diputar `ink`.
- Di atas trek: simpul persegi untuk **pindah halaman** (`charcoal`), **smart event** (warna lencana masing-masing), dan **error jaringan** (`danger-solid`). Hover simpul menampilkan tooltip; klik melompat.
- Rentang tidak aktif ditandai arsiran diagonal `grid-major`. Saat "Lewati periode tidak aktif" menyala, rentang itu dipadatkan.
- Di bawah trek: timecode mono, total, dan "Halaman saat ini" dalam mono.

### 7.6 Grafik tren (Ikhtisar)

Grafik area garis 2 px `primary`, isian `primary` 10%, grid horizontal `hairline` saja, label sumbu `caption` `mute`, tooltip bergaya menu. Tanpa animasi menggambar garis.

---

## 8. Pola per halaman (arah revamp)

### 8.1 Ikhtisar project (pengganti beranda kosong)

- Strip status pemasangan; bila "Menunggu", tampil CTA ke Pemasangan.
- Empat kartu statistik untuk rentang terpilih (default 7 hari): Sesi, Sesi bermasalah, Smart events, Rata-rata durasi.
- Tren sesi harian.
- "Sesi yang perlu dilihat": 5 sesi dengan skor masalah tertinggi, langsung ke pemutar.
- "Halaman populer" dengan pintasan "Buka Peta Klik" dan "Buka Peta Gulir" yang sudah terisi halaman itu.
- Semua angka bergantung pada endpoint yang ada atau yang disepakati dengan backend. **Kartu tanpa data nyata tidak ditampilkan.**

### 8.2 Histori Sesi

- Filter utama sebagai bilah chip horizontal (Status, Integritas, Smart events, Hanya bermasalah, Rentang tanggal). Filter lanjutan (alasan celah, dsb.) di popover "Filter lainnya".
- Filter aktif tampil sebagai chip yang bisa dihapus, plus "Hapus semua". State tetap di URL.
- Kolom default dipangkas: Perangkat, Mulai, Durasi, Halaman awal, Smart events, Skor masalah, Integritas. Kolom teknis (Chunk, Ukuran, Aktif terakhir) bisa dimunculkan lewat "Kolom".
- Baris bisa diklik seluruhnya. Pratinjau mini garis jejak per baris [Usulan].

### 8.3 Detail Sesi

- **Tata letak dua kolom pada ≥ 1280:** kiri pemutar (lengket), kanan panel bertab: Kejadian (smart events + navigasi digabung dalam satu linimasa), Jaringan, Info, Integritas. Klik baris di panel melompatkan pemutar dan menyorot baris yang sedang diputar.
- Di < 1280: pemutar di atas, tab di bawahnya.
- Disclaimer pemutar masuk "Tentang pemutaran ini". Toggle **"Muat sumber daya dari situs asli"** tetap terlihat di toolbar pemutar, default mati, dengan peringatan privasi saat dinyalakan.
- Pintasan keyboard pemutar: Spasi (putar/jeda), ← → (±5 d), `[` `]` (kejadian sebelum/berikutnya), 1–4 (kecepatan). Daftar pintasan lewat tombol `?`.

### 8.4 Peta Klik dan Peta Gulir

- Panggung menjadi elemen utama, filter mengecil menjadi satu baris di atasnya: halaman (combobox dengan saran populer), mode pencocokan, rentang tanggal, "Tampilkan peta".
- **Tidak ada kanvas kosong**: bila belum ada halaman dipilih, tampilkan daftar halaman populer sebagai pilihan awal yang bisa diklik.
- Kualitas data mengikuti pola strip + panel samping (6).
- Tombol cepat untuk berpindah antara Peta Klik dan Peta Gulir dengan filter yang sama.

### 8.5 Pemasangan

- Format **checklist bertahap**: 1) Salin snippet (pilih framework lewat tab), 2) Daftarkan origin, 3) Verifikasi. Langkah selesai diberi centang dari data nyata (origin terisi, pemasangan terdeteksi).
- "Periksa pemasangan" memakai status proses yang terlihat (4.2) dan menampilkan hasil di tempat.
- Penyebab umum gagal dalam disclosure, terbuka otomatis hanya bila status masih "Menunggu".

### 8.6 Pengaturan, Anggota, Admin

- Halaman bacaan 760 px dengan navigasi bagian di kiri (Informasi, Origin gambar, Anggota, Zona bahaya).
- **Zona bahaya** dipisah di bawah dengan garis `danger-solid` di kiri kartu.
- Tabel admin memakai pola tabel standar dengan pencarian email/nama.

---

## 9. Asisten AI [Nanti]

Belum ada fitur AI di Tracer. Bila ditambahkan, aturannya mengikuti tren "AI collaboration, not automation":

- Asisten hidup di **panel samping yang dipanggil pengguna** (tombol "Tanya tentang sesi ini" atau dari palet perintah), tidak pernah terbuka sendiri.
- Asisten **tidak pernah mengubah** filter, angka, rekaman, atau pengaturan. Usulannya tampil sebagai aksi yang perlu diklik ("Terapkan filter ini").
- Setiap jawaban menyebut sumbernya (ID sesi, rentang waktu, jumlah sesi) dan tautan untuk memeriksa sendiri, misalnya "Lompat ke 02:14".
- Bila ada beberapa kemungkinan, tampilkan opsi dan trade-off-nya, bukan satu jawaban "benar".
- Konten buatan AI diberi label kecil "Ringkasan otomatis" dan bisa ditutup.
- Kandidat pemakaian: ringkasan sesi bermasalah, penjelasan pola rage click di satu halaman, dan penerjemah laporan kualitas data ke bahasa awam.

---

## 10. Suara produk dan karakter (crafted, not prompted)

- **Bahasa:** Indonesia formal-santai, kalimat pendek, kata kerja di depan ("Salin snippet", "Tampilkan peta"). Istilah teknis dipertahankan konsisten: smart event, chunk, network log, origin, rage click, dead click.
- **Kejujuran data adalah suara Tracer.** Kalimat seperti "Ini bukan bukti isi rekaman benar" dipertahankan, tetapi dipindah ke tempat yang tepat (disclosure, tooltip) dan ditulis sekali, tidak diulang di setiap kartu.
- **Galat:** pesan backend apa adanya. Klien hanya menambah konteks aksi ("Coba Lagi", hitung mundur).
- **Elemen buatan tangan:** ilustrasi keadaan kosong bergaya garis wireframe yang dibuat khusus untuk Tracer, ikon simpul dan garis jejak, dan label koordinat. Pustaka ikon dasar tetap Lucide (sudah dipakai), dengan stroke 1,5 px agar serasi dengan Plex.
- Tidak memakai ilustrasi stok, avatar 3D, atau gambar hasil generator.

---

## 11. Aksesibilitas [Wajib]

- Kontras sesuai 3.3 di kedua tema. Tepi kontrol minimal 3:1.
- `nav` untuk sidebar, `header` untuk bilah atas, `main` untuk konten. Item aktif memakai `aria-current="page"`.
- Fokus keyboard selalu terlihat, urutan tab logis. Laci, dialog, dan panel samping mengunci fokus lalu mengembalikannya ke pemicu.
- Panggung pemutar, heatmap, dan peta gulir punya ringkasan teks. Simpul timeline bisa difokus dan dioperasikan keyboard.
- Gerak mengikuti 4.3. Tidak ada konten yang berkedip lebih dari 3 kali per detik.
- Berfungsi pada zoom 200% dan ukuran huruf sistem besar. Tidak ada teks di bawah 11 px.
- Target sentuh 44 px di layar sentuh.
- Ikon berdiri sendiri wajib punya label. Status selalu ikon ditambah teks.

---

## 12. Lakukan dan jangan

| Lakukan                                                        | Jangan                                                            |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Tampilkan grid dan penggaris di panggung data                  | Menaruh grid di belakang teks atau tabel                          |
| Mono untuk URL, selector, ID, timecode, angka statistik        | Mono untuk paragraf atau label tombol                             |
| Pisahkan dengan garis dan beda permukaan                       | Bayangan pada kartu, blur kaca, gradien latar                     |
| Gerak hanya untuk status dan struktur                          | Animasi masuk berurutan pada kartu dan tabel                      |
| Jeda proses yang terlihat untuk aksi kritis yang jarang        | Jeda buatan pada filter, sortir, dan kontrol pemutar              |
| Ringkas kualitas data dalam satu baris, rincian di panel       | Menghapus informasi kualitas data demi tampilan bersih            |
| Satu aksen per area pandang                                    | Warna merek kedua atau warna status sebagai hiasan                |
| Fluid type untuk judul dan angka besar                         | Fluid type untuk teks tabel dan kontrol                           |
| Pilihan privasi default paling aman                            | Menyalakan sumber daya eksternal pemutar secara diam-diam         |
| Pesan galat dari backend apa adanya                            | Mengarang atau menerjemahkan pesan galat di klien                 |

---

## 13. Implementasi

- Token sebagai variabel CSS di `:root`, dengan `[data-theme="dark"]` dan `@media (prefers-color-scheme: dark)` (dijaga oleh `:root:not([data-theme="light"])`), lalu dipetakan ke Tailwind 4 lewat `@theme`.
- Atribut `data-motion="reduce|full"` di `<html>` berdampingan dengan media query `prefers-reduced-motion`; semua durasi membaca token sehingga mode kurangi cukup mengganti nilai token.
- Komponen dasar tetap shadcn/Radix (sudah dipakai di `tracer-fe`), diberi gaya ulang dengan token di atas. Tambahan yang dibutuhkan: Sheet (panel samping dan laci), Command (palet ⌘K), Accordion (disclosure), Toggle Group (kontrol panggung).
- Font self-host di `/assets/fonts`, subset Latin, `woff2`.
- Setiap library baru tetap butuh persetujuan pemilik produk.

---

## 14. Keputusan terbuka

- Persetujuan arah visual "Buku Besar Operasional", aksen kobalt `#2B48E0`, dan pasangan IBM Plex Sans + Mono.
- Tema gelap masuk MVP revamp atau menyusul.
- Palet kategori dan heatmap magma setelah uji simulasi buta warna.
- Format durasi final.
- Palet perintah ⌘K dan sidebar terlipat masuk cakupan pertama atau tidak.
- Data untuk Ikhtisar project: endpoint mana yang tersedia di `tracer-be`, mana yang perlu dibuat.
- Kapan dan apakah Asisten AI masuk peta jalan.
