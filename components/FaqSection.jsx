import { motion } from "framer-motion";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const FaqSection = () => {
  const faqs = [
    {
      question: "Apa itu Ma'ruf?",
      answer: "Ma'ruf adalah platform belajar Al-Qur'an interaktif yang menggunakan teknologi AI untuk membantu validasi makhraj huruf dan tajwid. Platform ini dirancang untuk memudahkan proses belajar membaca Al-Qur'an dengan cara yang menyenangkan dan efektif."
    },
    {
      question: "Bagaimana cara memulai belajar di Ma'ruf?",
      answer: "Untuk memulai, Anda cukup mendaftar akun di platform kami. Setelah itu, Anda akan mendapatkan akses ke materi pembelajaran bertingkat, mulai dari pengenalan huruf hijaiyah hingga praktik membaca surah pendek."
    },
    {
      question: "Apakah Ma'ruf bisa digunakan untuk anak-anak?",
      answer: "Ya, Ma'ruf dirancang untuk semua usia, termasuk anak-anak. Interface yang menarik dan sistem gamifikasi membuat proses belajar lebih menyenangkan untuk anak-anak."
    },
    {
      question: "Bagaimana sistem validasi makhraj huruf bekerja?",
      answer: "Sistem validasi makhraj huruf menggunakan teknologi AI untuk menganalisis pengucapan pengguna dan memberikan umpan balik real-time. Sistem ini membantu memastikan ketepatan pelafalan huruf hijaiyah."
    },
    {
      question: "Apakah ada komunitas untuk berdiskusi?",
      answer: "Ya, Ma'ruf menyediakan forum komunitas di mana pengguna dapat berdiskusi, berbagi pengalaman, dan saling membantu dalam proses pembelajaran Al-Qur'an."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-poppins text-4xl font-bold text-[#00acee] md:text-5xl">
            FAQ
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 font-poppins">
            Pertanyaan yang Sering Diajukan
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem key={index} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FaqItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={false}
        animate={{ height: isOpen ? "auto" : "auto" }}
      >
        <button
          className="w-full px-6 py-4 text-left flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-poppins font-medium text-gray-900">{faq.question}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown className="text-gray-500" />
          </motion.span>
        </button>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            height: isOpen ? "auto" : 0
          }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-4"
        >
          <p className="text-gray-600 font-poppins">{faq.answer}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FaqSection;