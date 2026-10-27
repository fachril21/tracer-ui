// Penjelasan istilah yang tampil di aplikasi. Satu sumber supaya definisi tidak berbeda antar halaman.
const GLOSSARY = {
  // Ikhtisar
  sesi: "Satu kunjungan seorang pengunjung dari saat ia membuka website sampai berhenti aktif. Jika ia kembali setelah lama pergi, itu dihitung sesi baru.",
  sesiBermasalah:
    "Sesi yang terekam punya minimal satu sinyal masalah: rage click, dead click, atau error JS. Makin kecil makin baik.",
  smartEvents:
    "Kejadian yang dideteksi otomatis dan biasanya menandakan pengunjung kesulitan: rage click, dead click, dan error JS.",
  rataDurasi:
    "Lama rata-rata satu sesi, dari awal sampai pengunjung berhenti aktif. Durasi panjang belum tentu bagus, bisa juga tanda bingung.",
  kedalamanGulir:
    "Seberapa jauh pengunjung rata-rata menggulir halaman, dalam persen dari panjang halaman. 100% berarti sampai paling bawah.",
  waktuAktif:
    "Total waktu pengunjung benar-benar berinteraksi (klik, gulir, ketik). Waktu saat tab dibiarkan terbuka tidak dihitung.",
  perubahan:
    "Selisih dengan periode sebelumnya yang panjangnya sama. Warna hijau berarti arahnya baik untuk angka itu, bukan sekadar naik.",
  sumber: "Dari mana pengunjung datang, misalnya pencarian, media sosial, atau mengetik alamat langsung.",
  halamanPopuler: "Halaman yang paling sering jadi halaman pertama yang dibuka pengunjung.",
  sesiPerluDilihat:
    "Lima sesi dengan skor masalah tertinggi pada rentang waktu ini. Titik awal paling cepat untuk menemukan kendala.",
  skorMasalah:
    "Angka gabungan dari sinyal masalah di satu sesi. Makin tinggi, makin banyak atau makin serius sinyalnya. Error JS bobotnya paling berat.",
  rageClick:
    "Pengunjung mengklik elemen yang sama berkali-kali dengan cepat. Biasanya tanda elemen tidak merespons dan ia kesal.",
  deadClick:
    "Klik pada elemen yang tidak menghasilkan apa-apa. Biasanya elemen yang terlihat bisa diklik, padahal tidak.",
  errorJs:
    "Galat kode JavaScript di halaman saat pengunjung memakainya. Bisa membuat tombol atau formulir berhenti bekerja.",

  // Histori sesi dan detail sesi
  kelengkapan:
    "“Celah” berarti ada bagian rekaman yang hilang dan tidak bisa diputar. “Belum pasti” berarti sesi mungkin terputus sebelum selesai dikirim.",
  aktifTerakhir: "Saat terakhir kali Tracer menerima aktivitas dari sesi ini.",
  selesai: "Saat sesi ditutup. Kosong berarti sesi belum ditutup, atau terputus sebelum sempat dikirim.",
  chunk: "Rekaman dikirim dalam potongan-potongan kecil (chunk). Angka ini jumlah potongan yang sudah diterima.",
  ukuran: "Besar data rekaman sesi ini yang tersimpan.",
  halamanAwal: "Halaman pertama yang dibuka pengunjung di sesi ini.",
  userAgent: "Teks identitas yang dikirim browser pengunjung, berisi jenis browser, versi, dan sistem operasi.",
  zonaWaktu: "Semua jam di halaman ini ditampilkan dalam Asia/Jakarta, bukan zona waktu pengunjung.",
  kecepatanPutar:
    "Mempercepat putaran rekaman. Waktu diam ikut dilewati cepat, jadi gerakan bisa terlihat melompat.",

  // Peta klik dan peta gulir
  lapisan: "Pilih klik apa yang ditampilkan: semua klik, hanya rage click, atau hanya dead click.",
  elemenDiklik: "Tombol atau tautan yang paling sering diklik di halaman ini pada rentang waktu terpilih.",
  layarPertama:
    "Batas bagian halaman yang langsung terlihat tanpa menggulir. Bagian di bawah garis ini hanya terlihat setelah digulir.",
  rataKedalaman: "Seberapa jauh pengunjung rata-rata menggulir, dalam persen halaman.",
  sampaiSetengah: "Persen sesi yang menggulir sampai minimal setengah halaman.",
  sampaiAkhir: "Persen sesi yang sampai di bagian paling bawah halaman.",
  bagianDilihat: "Bagian halaman yang paling lama berada di layar pengunjung, dalam porsi waktu.",

  // Live users
  pengunjungAktif:
    "Orang yang sedang membuka website sekarang dan baru saja berinteraksi. Angka ini berubah tiap beberapa detik.",
  statusLive:
    "LIVE: data diperbarui otomatis. Dijeda: Anda menghentikannya sementara. Terputus: sambungan hilang, yang tampil adalah data terakhir.",
  sebaranHalaman:
    "Jumlah pengunjung aktif di tiap halaman saat ini. Kotak kuning menandakan pengunjung yang mengalami sinyal masalah.",
  bersinyalMasalah:
    "Pengunjung yang sesi hidupnya sudah memunculkan rage click, dead click, atau error JS.",
  tonton:
    "Memutar rekaman pengunjung yang sedang aktif, mengikuti kejadiannya sampai saat ini. Tidak terlihat oleh pengunjung.",

  // Feedback
  ringkasanNilai: "Rata-rata bintang (1 sampai 5) dari semua masukan, dan berapa banyak masukan di tiap nilai.",
  statusMasukan:
    "Penanda untuk tim Anda sendiri. Baru: belum dibuka. Dibaca: sudah dilihat. Selesai: sudah ditangani.",
  jenisMasukan: "Dipilih sendiri oleh pengunjung saat mengirim masukan: masalah, saran, atau pujian.",
  rekamanMenyertai:
    "Jika tersedia, masukan ini terhubung ke sesi pengunjung tadi, sehingga Anda bisa melihat apa yang ia alami.",
  widget:
    "Tab kecil di pinggir layar website Anda yang dipakai pengunjung untuk mengirim masukan tanpa meninggalkan halaman.",

  // Funnel
  funnel:
    "Urutan langkah yang diharapkan dilalui pengunjung, misalnya produk, keranjang, lalu checkout. Menunjukkan di langkah mana mereka berhenti.",
  langkah: "Langkah bisa berupa halaman yang dibuka, atau kejadian cerdas seperti rage click.",
  penurunanTerbesar:
    "Langkah dengan jumlah pengunjung hilang paling banyak dari langkah sebelumnya. Perbaikan paling berdampak biasanya ada di sini.",
  persenFunnel: "Porsi dari pengunjung yang masuk langkah pertama. Langkah pertama selalu 100%.",
  berhentiSebelum:
    "Jumlah sesi yang sampai langkah sebelumnya tetapi tidak melanjutkan ke langkah ini. Klik untuk melihat contoh sesinya.",
  bandingkanPerangkat:
    "Menampilkan funnel yang sama untuk dua jenis perangkat, supaya terlihat apakah masalahnya khusus di salah satunya.",

  // Pengaturan dan pemasangan
  originSesi: "Alamat website yang boleh mengirim rekaman ke project ini. Alamat lain akan ditolak.",
  originGambar:
    "Alamat tempat gambar website Anda disimpan. Perlu didaftarkan agar gambar muncul saat rekaman diputar.",
  terdeteksi: "Tracer sudah menerima data pertama dari website Anda, jadi skripnya terpasang dengan benar.",

  // Asisten
  ringkasanOtomatis:
    "Jawaban dibuat otomatis dari data project Anda. Periksa sumber yang disertakan sebelum mengambil keputusan.",
  kuotaPertanyaan: "Jumlah pertanyaan yang bisa diajukan per hari. Kuota kembali pukul 00.00.",
} as const;

type GlossaryKey = keyof typeof GLOSSARY;

export { GLOSSARY };
export type { GlossaryKey };
