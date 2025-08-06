
import React from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRef } from "react";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Ahmad Fauzi",
      role: "Orang Tua",
      content: "Platform ini sangat membantu anak saya belajar Al-Qur'an dengan cara yang menyenangkan. Fitur validasi makhraj membuat pelafalan anak saya menjadi lebih baik.",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Siti Aminah",
      role: "Guru Mengaji",
      content: "Sebagai guru, saya sangat terbantu dengan adanya platform ini. Fitur kelas virtual dan sistem validasi memudahkan saya memantau perkembangan murid-murid saya.",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      name: "Rizki Ramadhan",
      role: "Pengguna, 12 tahun",
      content: "Belajar mengaji jadi lebih seru dengan game dan tantangan. Saya senang bisa mendapatkan badge setiap kali menyelesaikan level baru.",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-poppins text-4xl font-bold text-[#00acee] md:text-5xl">
            Testimoni
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 font-poppins">
            Apa kata mereka tentang pengalaman belajar Al-Qur'an dengan platform kami
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TiltCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = 32.5 / 2;

const TiltCard = ({ testimonial }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return [0, 0];

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="relative h-96 w-full rounded-xl bg-gradient-to-br from-[#00acee] to-[#0077cc]"
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 grid place-content-center rounded-xl bg-white shadow-lg p-6"
      >
        <div className="flex flex-col items-center text-center">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="mb-4 h-20 w-20 rounded-full"
            style={{
              transform: "translateZ(25px)",
            }}
          />
          <h3
            className="text-xl font-bold font-poppins"
            style={{
              transform: "translateZ(50px)",
            }}
          >
            {testimonial.name}
          </h3>
          <p
            className="text-gray-600 font-poppins mb-4"
            style={{
              transform: "translateZ(35px)",
            }}
          >
            {testimonial.role}
          </p>
          <p
            className="text-gray-600 font-poppins"
            style={{
              transform: "translateZ(25px)",
            }}
          >
            {testimonial.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialSection;