import { ArrowLeft } from "lucide-react";
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from 'next/router';
import React from "react";

const TermsAndConditions = () => {
  const router = useRouter();

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
            <title>Syarat dan Ketentuan | Makruf</title>
            <meta name="description" content="Syarat dan ketentuan penggunaan aplikasi Makruf" />
          </Head>

          <h1 className="font-poppins text-3xl font-bold text-gray-800 mb-8">
            Syarat & Ketentuan
          </h1>

          <div className="space-y-8 font-poppins text-gray-700">
            <p className="text-gray-600 mb-6">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Pendahuluan</h2>
              <p className="text-gray-600">
                Dengan menggunakan aplikasi Makruf, Anda menyetujui syarat dan ketentuan ini.
                Harap membaca dengan seksama sebelum menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Penggunaan Layanan</h2>
              <p className="text-gray-600">
                Layanan ini disediakan untuk membantu pembelajaran makhrojul huruf.
                Pengguna bertanggung jawab atas penggunaan akun dan menjaga kerahasiaan kredensial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Definisi
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>"Platform"</strong> mengacu pada aplikasi, situs web, dan layanan 
                  Ma'ruf.
                </li>
                <li>
                  <strong>"Pengguna"</strong> mengacu pada siapa pun yang mengakses atau 
                  menggunakan Platform.
                </li>
                <li>
                  <strong>"Konten"</strong> mengacu pada semua materi pembelajaran, audio, video, 
                  teks, grafik, dan elemen interaktif lainnya yang tersedia di Platform.
                </li>
                <li>
                  <strong>"Akun"</strong> mengacu pada registrasi pengguna yang memberikan akses 
                  ke fitur Platform.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Pendaftaran Akun
              </h2>
              <p className="mb-4 leading-relaxed">
                Untuk mengakses fitur lengkap Platform, Anda perlu membuat akun. Saat 
                mendaftar, Anda setuju untuk:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Memberikan informasi yang benar, akurat, dan lengkap</li>
                <li>Menjaga kerahasiaan kata sandi Anda</li>
                <li>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
                <li>Memberi tahu kami segera tentang akses tidak sah ke akun Anda</li>
                <li>Tidak membuat lebih dari satu akun per pengguna</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Penggunaan Platform
              </h2>
              <p className="mb-4 leading-relaxed">
                Dengan menggunakan Platform kami, Anda setuju untuk:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Tidak menggunakan Platform untuk tujuan ilegal atau terlarang
                </li>
                <li>
                  Tidak melakukan tindakan yang dapat merusak, menonaktifkan, membebani, 
                  atau mengganggu Platform
                </li>
                <li>
                  Tidak menggunakan robot, spider, crawler, atau alat otomatis lainnya 
                  untuk mengakses Platform
                </li>
                <li>
                  Tidak mengumpulkan informasi pengguna lain tanpa persetujuan mereka
                </li>
                <li>
                  Tidak memposting konten yang melanggar hukum, menyinggung, atau melecehkan
                </li>
                <li>
                  Menggunakan platform dengan cara yang menghormati nilai-nilai Islam dan 
                  pengguna lain
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Konten dan Hak Kekayaan Intelektual
              </h2>
              <p className="mb-4 leading-relaxed">
                Seluruh konten di Platform, termasuk teks, grafik, logo, audio, dan 
                materi pembelajaran dilindungi oleh hak cipta dan hak kekayaan intelektual lainnya.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Anda diizinkan menggunakan konten hanya untuk tujuan pembelajaran pribadi
                </li>
                <li>
                  Anda tidak boleh mendistribusikan ulang, mereproduksi, atau memodifikasi 
                  konten tanpa izin tertulis dari kami
                </li>
                <li>
                  Anda mempertahankan kepemilikan atas konten yang Anda unggah, tetapi 
                  memberi kami lisensi untuk menggunakan konten tersebut dalam kaitannya 
                  dengan layanan kami
                </li>
                <li>
                  Al-Qur'an dan teks keagamaan disediakan dengan penuh hormat dan harus 
                  diperlakukan sesuai dengan nilai-nilai Islam
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Pembayaran dan Berlangganan
              </h2>
              <p className="mb-4 leading-relaxed">
                Platform kami menawarkan layanan gratis dan berbayar:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Harga dan detail berlangganan ditampilkan sebelum pembelian
                </li>
                <li>
                  Pembayaran berlangganan akan diperbarui secara otomatis kecuali Anda 
                  membatalkannya sebelum siklus penagihan berikutnya
                </li>
                <li>
                  Pengembalian dana dapat diminta dalam 7 hari setelah pembayaran jika 
                  terdapat masalah teknis yang signifikan
                </li>
                <li>
                  Kami berhak mengubah harga berlangganan dengan pemberitahuan sebelumnya
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Pembatasan Jaminan dan Tanggung Jawab
              </h2>
              <p className="mb-4 leading-relaxed">
                Platform disediakan "apa adanya" dan "sebagaimana tersedia" tanpa jaminan apa pun:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Kami tidak menjamin keakuratan sempurna dari semua konten pembelajaran
                </li>
                <li>
                  Kami tidak bertanggung jawab atas kerugian atau kerusakan yang timbul 
                  dari penggunaan Platform
                </li>
                <li>
                  Tanggung jawab kami terbatas pada jumlah yang Anda bayarkan kepada kami 
                  dalam 12 bulan terakhir
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Penghentian Akun
              </h2>
              <p className="leading-relaxed">
                Kami berhak, atas kebijakan kami sendiri, untuk membatasi, menangguhkan, 
                atau mengakhiri akses Anda ke Platform jika Anda melanggar Syarat & Ketentuan 
                ini. Anda juga dapat menghentikan akun Anda kapan saja melalui pengaturan 
                akun atau dengan menghubungi dukungan pelanggan kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Perubahan pada Syarat & Ketentuan
              </h2>
              <p className="leading-relaxed">
                Kami berhak mengubah Syarat & Ketentuan ini kapan saja. Perubahan signifikan 
                akan diberitahukan kepada Anda melalui email atau pemberitahuan di Platform. 
                Penggunaan berkelanjutan setelah perubahan berarti Anda menerima ketentuan 
                yang diperbarui.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Hukum yang Berlaku
              </h2>
              <p className="leading-relaxed">
                Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum 
                Indonesia. Setiap perselisihan yang timbul akan diselesaikan melalui 
                konsultasi bersama atau, jika diperlukan, melalui arbitrase di Jakarta, 
                Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Hubungi Kami
              </h2>
              <p className="leading-relaxed">
                Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan 
                hubungi kami di:{" "}
                <a
                  href="mailto:bantuan@almakruf.com"
                  className="text-[#00acee] hover:underline"
                >
                  bantuan@almakruf.com
                </a>
              </p>
            </section>

            <p className="text-sm text-gray-500 pt-6">
              Terakhir diperbarui: 22 Mei 2025
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="mt-8 bg-secondary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

// Disable static optimization for this page
export const getServerSideProps = async () => {
  return {
    props: {}
  };
};

export default TermsAndConditions;