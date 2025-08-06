import { IconArrowLeft, IconShield } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Kebijakan Privasi - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Kebijakan privasi aplikasi pembelajaran makhrojul huruf" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
              <IconArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconShield size={20} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kebijakan Privasi</h1>
                <p className="text-gray-600">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan informasi yang Anda berikan kepada kami secara langsung, seperti:
            </p>
            <ul>
              <li>Nama dan alamat email saat mendaftar</li>
              <li>Progress pembelajaran dan hasil latihan</li>
              <li>Preferensi dan pengaturan aplikasi</li>
            </ul>

            <h2>2. Bagaimana Kami Menggunakan Informasi</h2>
            <p>
              Informasi yang kami kumpulkan digunakan untuk:
            </p>
            <ul>
              <li>Menyediakan dan meningkatkan layanan pembelajaran</li>
              <li>Melacak progress dan pencapaian Anda</li>
              <li>Mengirimkan notifikasi dan update penting</li>
              <li>Menganalisis penggunaan untuk perbaikan aplikasi</li>
            </ul>

            <h2>3. Keamanan Data</h2>
            <p>
              Kami menggunakan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda, termasuk enkripsi data dan akses terbatas.
            </p>

            <h2>4. Berbagi Informasi</h2>
            <p>
              Kami tidak menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga, kecuali:
            </p>
            <ul>
              <li>Dengan persetujuan eksplisit Anda</li>
              <li>Untuk mematuhi hukum yang berlaku</li>
              <li>Untuk melindungi hak dan keamanan kami</li>
            </ul>

            <h2>5. Hak Anda</h2>
            <p>
              Anda memiliki hak untuk:
            </p>
            <ul>
              <li>Mengakses dan memperbarui informasi pribadi Anda</li>
              <li>Menghapus akun dan data Anda</li>
              <li>Menolak penggunaan data untuk tujuan tertentu</li>
              <li>Menerima salinan data Anda</li>
            </ul>

            <h2>6. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:
            </p>
            <ul>
              <li>Email: bantuan@almakruf.com</li>
              
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconArrowLeft size={20} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
