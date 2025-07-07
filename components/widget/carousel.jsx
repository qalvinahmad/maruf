import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const LevelCarousel = () => {
  return (
    <section id="levels" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          
          <h2 className="mb-4 font-poppins text-4xl font-bold text-[#00acee] md:text-5xl">
            Tingkatan Pembelajaran
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 font-poppins">
            Kami menyediakan pembelajaran bertingkat yang disesuaikan dengan kemampuan dan perkembangan pengguna
          </p>
        </div>
        <ScrollCarousel />
      </div>
    </section>
  );
};

const ScrollCarousel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);

  return (
    <section ref={targetRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8">
          {levels.map((level) => {
            return <LevelCard level={level} key={level.id} />;
          })}
        </motion.div>
      </div>
    </section>
  );
};

const LevelCard = ({ level }) => {
  return (
    <div
      key={level.id}
      className="group relative h-[500px] w-[400px] overflow-hidden rounded-xl bg-white shadow-lg"
    >
      <div
        style={{
          backgroundImage: `url(${level.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-105"
      ></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
        <h3 className="text-2xl font-bold text-white font-poppins mb-3">
          {level.title}
        </h3>
        <p className="text-white/90 font-poppins text-sm">
          {level.description}
        </p>
      </div>
    </div>
  );
};

export default LevelCarousel;

const levels = [
  {
    id: 0,
    title: "Tingkat Persiapan: Gerbang ke Bahasa Arab",
    description: "Pendahuluan sebelum mengenal huruf hijaiyah. Fokus pada bentuk dasar huruf Arab, perbedaan huruf serupa, tanwin, sukoon, dan shaddah.",
    image: "https://cdn.dribbble.com/userupload/3358722/file/original-469a039aa280544b155f281399137330.jpg?resize=752x&vertical=center"
  },
  {
    id: 1,
    title: "Tingkat Dasar: Pengenalan Bentuk",
    description: "Belajar mengenali bentuk huruf hijaiyah secara visual, memahami struktur dasar dan perbedaan antar huruf.",
    image: "https://cdn.dribbble.com/userupload/8893692/file/original-b8dcd9f3c9aec3be808ad5865c60abee.jpg?resize=752x&vertical=center"
  },
  {
    id: 2,
    title: "Tingkat Dasar: Pengenalan Pelafalan",
    description: "Mengenal cara pelafalan huruf hijaiyah dengan benar melalui latihan audio dan interaktif.",
    image: "https://cdn.dribbble.com/userupload/22049640/file/original-3a923e60db6bd86988b5c2cac9418333.jpg?format=webp&resize=400x300&vertical=center"
  },
  {
    id: 3,
    title: "Tingkat Menengah: Harakat Dasar",
    description: "Memahami harakat dasar seperti Fathah, Kasrah, dan Dhammah serta penerapannya dalam bacaan.",
    image: "https://cdn.dribbble.com/userupload/6689674/file/original-93bf4a8f3bb511dcf8a215c791034c43.jpg?resize=752x&vertical=center"
  },
  {
    id: 4,
    title: "Tingkat Menengah: Harakat Tambahan",
    description: "Mempelajari harakat tambahan seperti Tanwin dan Sukun, memperkaya pemahaman terhadap pengucapan.",
    image: "https://cdn.dribbble.com/userupload/32300531/file/original-a3e683410985cc877e7bc5dee1f2da80.png?resize=752x&vertical=center"
  },
  {
    id: 5,
    title: "Tingkat Menengah: Kombinasi Huruf",
    description: "Latihan membaca kombinasi huruf dengan berbagai harakat untuk meningkatkan kelancaran.",
    image: "https://cdn.dribbble.com/userupload/41480023/file/original-9de57d4a6bb674b0721b0abc5f38d8b7.jpg?resize=752x&vertical=center"
  },
  {
    id: 6,
    title: "Tingkat Menengah: Mad Dasar",
    description: "Pengenalan mad thobi’i dan cara penggunaannya dalam bacaan Al-Qur'an.",
    image: "https://cdn.dribbble.com/userupload/40901450/file/original-a40d39930877b0727e0e03d0b894b2b7.jpg?resize=752x&vertical=center"
  },
  {
    id: 7,
    title: "Tingkat Menengah: Makhaarij Al-Huruf",
    description: "Memahami titik keluarnya huruf hijaiyah dari mulut, tenggorokan, dan hidung. Penting untuk akurasi pelafalan.",
    image: "https://cdn.dribbble.com/userupload/31037239/file/original-4fbd886f575b2efaed1b4fc3ee0b6cb4.jpg?resize=752x&vertical=center"
  },
  {
    id: 8,
    title: "Tingkat Menengah: Sifaatul Huruf",
    description: "Mempelajari sifat huruf-huruf hijaiyah seperti jahr, rakhawah, isti’la, dll untuk memperhalus bacaan.",
    image: "https://cdn.dribbble.com/userupload/28362722/file/original-f61a45c593f4189d1969d219c803e661.jpg?resize=752x&vertical=center"
  },
  {
    id: 9,
    title: "Tingkat Lanjut: Tajwid Hukum Nun Mati dan Tanwin",
    description: "Pembelajaran hukum tajwid terkait nun mati dan tanwin seperti idzhar, idgham, iqlab, dan ikhfa.",
    image: "https://cdn.dribbble.com/userupload/5224494/file/original-bae35d883f0b53ea4c1b6253080030f8.jpg?resize=752x&vertical=center"
  },
  {
    id: 10,
    title: "Tingkat Lanjut: Tajwid Hukum Mim Mati",
    description: "Mengenal hukum mim mati seperti idzhar syafawi, idgham mimi, dan ikhfa syafawi.",
    image: "https://cdn.dribbble.com/userupload/5471267/file/original-271252915f4108f7aa760ec801d1b51d.jpg?resize=752x&vertical=center"
  },
  {
    id: 11,
    title: "Tingkat Lanjut: Qalqalah",
    description: "Mempelajari huruf-huruf qalqalah dan cara pengucapan yang tepat dalam bacaan.",
    image: "https://cdn.dribbble.com/userupload/4729021/file/original-0a8dbc086c2357c73f5d89bc6171071b.jpg?resize=752x&vertical=center"
  },
  {
    id: 12,
    title: "Tingkat Lanjut: Mad Far'i",
    description: "Pemahaman tentang mad far’i dan variasi pemanjangan dalam bacaan Al-Qur’an.",
    image: "https://cdn.dribbble.com/userupload/5022021/file/original-3dea36c1bd8f8853f7cd5850808f527a.jpg?resize=752x&vertical=center"
  },
  {
    id: 13,
    title: "Tingkat Lanjut: Sifat Huruf Lanjutan & Tafkheem",
    description: "Pendalaman sifat huruf dan penerapan tafkheem (penguatan suara) pada huruf tertentu.",
    image: "https://cdn.dribbble.com/userupload/4918065/file/original-adbbf8fe9d825a9ea18a27347647b683.png?resize=752x&vertical=center"
  },
  {
    id: 14,
    title: "Tingkat Lanjut: Aturan Ra dan Huruf Tebal",
    description: "Mempelajari cara mengucapkan huruf Ra, kapan ia dibaca tebal atau tipis.",
    image: "https://cdn.dribbble.com/userupload/41326018/file/original-833feaec229c998425985b2bd3b5d43d.jpg?resize=752x&vertical=center"
  },
  {
    id: 15,
    title: "Tingkat Mahir: Praktik Surah Pendek",
    description: "Latihan membaca dan menghafal surah-surah pendek dengan tartil dan tajwid.",
    image: "https://cdn.dribbble.com/userupload/40814112/file/original-d5efbbbfc353619d4a6d125f4f64c4e2.jpg?resize=752x&vertical=center"
  },
  {
    id: 16,
    title: "Tingkat Mahir: Tartil",
    description: "Pendalaman bacaan tartil dan memperbaiki makharijul huruf serta waqaf ibtida.",
    image: "https://cdn.dribbble.com/userupload/5244100/file/original-3bba195e2106abf94095bd23d7814a7d.jpg?resize=752x&vertical=center"
  },
  {
    id: 17,
    title: "Tingkat Mahir: Hamzatul Wasl dan Qat'",
    description: "Pelajari perbedaan antara Hamzatul Wasl dan Hamzatul Qat', dan kapan masing-masing dibaca atau diabaikan.",
    image: "https://cdn.dribbble.com/userupload/5328035/file/original-e8322c158d21616279294456f7e9ed11.png?resize=752x&vertical=center"
  },
  {
    id: 18,
    title: "Tingkat Mahir: Tes",
    description: "Evaluasi akhir untuk mengukur penguasaan materi secara keseluruhan.",
    image: "https://cdn.dribbble.com/userupload/43803884/file/original-209f77e57427b2748ef46c9079c75209.png?resize=752x&vertical=center"
  }
];

