

const AboutSection = () => {
  return (
    <section id="levels" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-poppins text-4xl font-bold text-[#00acee] md:text-5xl">
            Tingkatan Pembelajaran
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 font-poppins">
            Kami dwdad
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="order-2 flex items-center md:order-1">
            <div>
              <h3 className="mb-4 font-poppins text-2xl font-bold">Tingkat Dasar: Pengenalan Huruf</h3>
              <p className="mb-6 text-gray-600 font-poppins">
                Pengenalan visual dan audio huruf hijaiyah, dengan fokus pada bentuk, karakteristik, dan cara pengucapan dasar. 
                Dilengkapi dengan game interaktif dan tantangan sederhana untuk memudahkan pembelajaran.
              </p>
              
              <h3 className="mb-4 font-poppins text-2xl font-bold">Tingkat Menengah: Harakat & Kombinasi</h3>
              <p className="mb-6 text-gray-600 font-poppins">
                Pembelajaran harakat dasar (Fathah, Kasrah, Dhammah) dan tambahan (Tanwin, Sukun), serta kombinasi huruf 
                dengan berbagai harakat. Pengenalan pemanjangan bunyi dasar (mad thobi'i).
              </p>
              
              <h3 className="mb-4 font-poppins text-2xl font-bold">Tingkat Lanjut: Tajwid Dasar</h3>
              <p className="mb-6 text-gray-600 font-poppins">
                Pembelajaran hukum nun mati/tanwin, hukum mim mati, qalqalah, dan mad far'i. Fokus pada penerapan 
                aturan tajwid dalam membaca Al-Qur'an dengan benar.
              </p>
              
              <h3 className="mb-4 font-poppins text-2xl font-bold">Tingkat Mahir: Praktik Surah & Tartil</h3>
              <p className="text-gray-600 font-poppins">
                Praktik membaca dan menghafal surah-surah pendek, membaca dengan tartil, serta mempelajari aturan 
                waqaf dan ibtida. Dilengkapi dengan ujian kenaikan untuk evaluasi komprehensif.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="https://illustrations.popsy.co/amber/student-with-books.svg"
              alt="Tingkatan Pembelajaran"
              className="mx-auto w-full max-w-md rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;