import { motion } from 'framer-motion';
import { ArrowLeft } from "lucide-react";
import Head from 'next/head';
import Link from "next/link";
import React from "react";

export default function Privacy() {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-[#00acee] transition-colors duration-200"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span className="font-poppins">Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <Head>
            <title>Privacy Policy | Makruf</title>
            <meta name="description" content="Privacy policy and data protection information" />
          </Head>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-sm"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Kebijakan Privasi
            </h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  1. Informasi yang Kami Kumpulkan
                </h2>
                <p className="text-gray-600">
                  Kami mengumpulkan informasi yang Anda berikan saat mendaftar dan menggunakan aplikasi kami, termasuk:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Nama lengkap</li>
                  <li>Alamat email</li>
                  <li>Data pembelajaran dan progres</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  2. Penggunaan Informasi
                </h2>
                <p className="text-gray-600">
                  Informasi yang kami kumpulkan digunakan untuk:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Menyediakan dan meningkatkan layanan kami</li>
                  <li>Personalisasi pengalaman pembelajaran</li>
                  <li>Komunikasi terkait layanan</li>
                  <li>Analisis penggunaan untuk meningkatkan platform</li>
                  <li>Memberikan dukungan teknis</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  3. Perlindungan Data
                </h2>
                <p className="text-gray-600">
                  Kami berkomitmen melindungi data pribadi Anda dengan:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Enkripsi data yang sensitif</li>
                  <li>Akses terbatas hanya untuk personel yang berwenang</li>
                  <li>Pembaruan keamanan sistem secara berkala</li>
                  <li>Backup data secara teratur</li>
                  <li>Monitoring aktivitas sistem 24/7</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  4. Berbagi Informasi
                </h2>
                <p className="text-gray-600 mb-3">
                  Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga, kecuali:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Dengan persetujuan eksplisit dari Anda</li>
                  <li>Untuk memenuhi kewajiban hukum</li>
                  <li>Kepada penyedia layanan yang membantu operasional platform (dengan perjanjian kerahasiaan)</li>
                  <li>Dalam situasi darurat untuk melindungi keselamatan pengguna</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  5. Hak Pengguna
                </h2>
                <p className="text-gray-600 mb-3">
                  Anda memiliki hak untuk:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Mengakses data pribadi yang kami simpan</li>
                  <li>Memperbarui atau mengoreksi informasi yang tidak akurat</li>
                  <li>Meminta penghapusan data pribadi Anda</li>
                  <li>Menarik persetujuan penggunaan data</li>
                  <li>Meminta portabilitas data Anda</li>
                  <li>Mengajukan keluhan terkait pemrosesan data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  6. Cookie dan Teknologi Pelacakan
                </h2>
                <p className="text-gray-600">
                  Platform kami menggunakan cookie dan teknologi serupa untuk:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Mengingat preferensi pengguna</li>
                  <li>Menganalisis pola penggunaan website</li>
                  <li>Meningkatkan performa dan fungsionalitas</li>
                  <li>Menyediakan konten yang relevan</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  Anda dapat mengelola pengaturan cookie melalui browser Anda.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  7. Penyimpanan Data
                </h2>
                <p className="text-gray-600">
                  Data pribadi Anda akan disimpan selama:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Akun aktif: Selama akun Anda masih aktif</li>
                  <li>Akun tidak aktif: Hingga 2 tahun setelah ketidakaktifan terakhir</li>
                  <li>Data pembelajaran: Disimpan untuk keperluan analisis dan peningkatan layanan</li>
                  <li>Data log: Maksimal 12 bulan untuk keperluan keamanan</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  8. Keamanan Data Anak
                </h2>
                <p className="text-gray-600">
                  Platform ini dapat digunakan oleh anak-anak di bawah pengawasan orang tua/wali. Kami berkomitmen untuk:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Memerlukan persetujuan orang tua untuk pengguna di bawah 13 tahun</li>
                  <li>Membatasi pengumpulan data dari anak-anak</li>
                  <li>Tidak menampilkan iklan yang tidak pantas</li>
                  <li>Menyediakan kontrol orang tua yang komprehensif</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  9. Perubahan Kebijakan
                </h2>
                <p className="text-gray-600">
                  Kebijakan privasi ini dapat diperbarui dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Email notifikasi kepada pengguna terdaftar</li>
                  <li>Pemberitahuan di platform</li>
                  <li>Update tanggal "Terakhir diperbarui" di halaman ini</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  10. Kontak
                </h2>
                <p className="text-gray-600 mb-3">
                  Untuk pertanyaan tentang kebijakan privasi ini atau penanganan data pribadi Anda, hubungi kami:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2"><strong>Email:</strong> bantuan@almakruf.com</p>
                  <p className="text-gray-600 mb-2"><strong>Alamat:</strong> Indonesia</p>
                  <p className="text-gray-600"><strong>Waktu Respons:</strong> Maksimal 7 hari kerja</p>
                </div>
              </section>

              <section className="mb-8 bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Komitmen Kami
                </h2>
                <p className="text-blue-700">
                  Ma'ruf berkomitmen penuh untuk melindungi privasi dan data pribadi semua pengguna. 
                  Kami terus memperbarui praktik keamanan dan privasi kami sesuai dengan standar 
                  internasional dan peraturan yang berlaku di Indonesia.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};