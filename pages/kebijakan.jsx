import { IconArrowLeft, IconFileText } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Syarat dan Ketentuan - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Syarat dan ketentuan penggunaan aplikasi pembelajaran makhrojul huruf" />
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <IconFileText size={20} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Syarat dan Ketentuan</h1>
                <p className="text-gray-600">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Penerimaan Ketentuan</h2>
            <p>
              Dengan menggunakan aplikasi "Belajar Makhrojul Huruf", Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.
            </p>

            <h2>2. Penggunaan Layanan</h2>
            <p>
              Anda setuju untuk menggunakan layanan ini hanya untuk tujuan pembelajaran yang sah dan sesuai dengan hukum yang berlaku.
            </p>

            <h2>3. Akun Pengguna</h2>
            <ul>
              <li>Anda bertanggung jawab menjaga kerahasiaan akun dan password</li>
              <li>Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
              <li>Anda harus segera melaporkan penggunaan tidak sah atas akun Anda</li>
            </ul>

            <h2>4. Konten dan Materi</h2>
            <p>
              Semua konten pembelajaran dalam aplikasi ini dilindungi hak cipta. Anda tidak diperkenankan:
            </p>
            <ul>
              <li>Menyalin atau mendistribusikan materi tanpa izin</li>
              <li>Menggunakan konten untuk tujuan komersial</li>
              <li>Memodifikasi atau membuat karya turunan</li>
            </ul>

            <h2>5. Pembatasan Tanggung Jawab</h2>
            <p>
              Kami tidak bertanggung jawab atas kerugian langsung atau tidak langsung yang mungkin timbul dari penggunaan aplikasi ini.
            </p>

            <h2>6. Perubahan Layanan</h2>
            <p>
              Kami berhak untuk mengubah, menangguhkan, atau menghentikan layanan kapan saja dengan atau tanpa pemberitahuan.
            </p>

            <h2>7. Pelanggaran</h2>
            <p>
              Pelanggaran terhadap syarat dan ketentuan ini dapat mengakibatkan penangguhan atau penghapusan akun Anda.
            </p>

            <h2>8. Hukum yang Berlaku</h2>
            <p>
              Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia.
            </p>

            <h2>9. Kontak</h2>
            <p>
              Untuk pertanyaan mengenai syarat dan ketentuan ini, hubungi kami di:
            </p>
            <ul>
              <li>Email: support@makhrojulhuruf.com</li>
              <li>Telepon: [Nomor Telepon]</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <IconArrowLeft size={20} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
