
import React from 'react';

const FeatureSection = () => {
  const features = [
    {
      title: "Pengenalan & Validasi Makhrajul Huruf",
      description: "Sistem canggih untuk merekam, menganalisis, dan memvalidasi pelafalan huruf hijaiyah dengan teknologi AI dan validasi guru.",
      icon: "🎙️",
    },
    {
      title: "Pembelajaran Bertingkat",
      description: "Materi pembelajaran yang terstruktur dari tingkat dasar hingga mahir, disesuaikan dengan kemampuan dan perkembangan pengguna.",
      icon: "📚",
    },
    {
      title: "Sistem Reward & Gamifikasi",
      description: "Belajar menjadi menyenangkan dengan sistem badge, achievement, dan tantangan yang memotivasi konsistensi belajar.",
      icon: "🏆",
    },
    {
      title: "Fitur Sosial & Komunitas",
      description: "Terhubung dengan guru, teman belajar, dan orang tua melalui kelas virtual dan forum diskusi untuk belajar bersama.",
      icon: "👥",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-poppins text-4xl font-bold text-[#00acee] md:text-5xl">
            Fitur Utama
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 font-poppins">
            Platform kami menyediakan berbagai fitur inovatif untuk memudahkan pembelajaran Al-Qur'an dan makhrajul huruf
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg bg-white p-8 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-4 font-poppins text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600 font-poppins">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;