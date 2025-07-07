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
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};