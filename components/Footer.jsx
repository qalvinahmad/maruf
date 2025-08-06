"use client";
import { LinkPreview } from "@/components/ui/link-preview";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from 'next/link';
import { useRef } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 py-10 text-white">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row md:justify-between gap-12">
          {/* Brand Section */}
          <div className="max-w-sm flex-shrink-0">
            <h3 className="font-poppins text-xl font-bold mb-3">Ma'ruf</h3>
            <p className="text-gray-300 text-sm mb-4 font-poppins leading-relaxed">
              Platform belajar Al-Qur'an dan makhrajul huruf interaktif untuk semua usia.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="max-w-md flex-grow">
            <h3 className="font-poppins text-2xl font-bold mb-3">Fitur</h3>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3">
              <li>
                <LinkPreview
                  url="https://www.youtube.com/watch?v=S-z6vyR89Ig&list=RDMM&index=3"
                  imageSrc="/img/preview/1.png"
                  isStatic
                  className="font-semibold text-gray-300"
                >
                  Pengenalan Makhraj
                </LinkPreview>
              </li>
              <li>
                <LinkPreview
                  url="https://www.youtube.com/watch?v=S-z6vyR89Ig&list=RDMM&index=3"
                  imageSrc="/img/preview/2.png"
                  isStatic
                  className="font-semibold text-gray-300"
                >
                  Pembelajaran Bertingkat
                </LinkPreview>
              </li>
              <li>
                <LinkPreview
                  url="https://www.youtube.com/watch?v=S-z6vyR89Ig&list=RDMM&index=3"
                  imageSrc="/img/preview/3.png"
                  isStatic
                  className="font-semibold text-gray-300"
                >
                  Sistem Reward & Personalisasi
                </LinkPreview>
              </li>
              <li>
                <LinkPreview
                  url="https://www.youtube.com/watch?v=S-z6vyR89Ig&list=RDMM&index=3"
                  imageSrc="/img/preview/4.png"
                  isStatic
                  className="font-semibold text-gray-300"
                >
                  Kelas Virtual
                </LinkPreview>
              </li>
              <li>
                <LinkPreview
                  url="https://www.youtube.com/watch?v=S-z6vyR89Ig&list=RDMM&index=3"
                  imageSrc="/img/preview/5.png"
                  isStatic
                  className="font-semibold text-gray-300"
                >
                  Achivement & Daily Challange
                </LinkPreview>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="font-poppins mb-2 sm:mb-0">© {currentYear} Ma'ruf. All Rights Reserved</p>
          <div className="flex space-x-4 font-poppins text-sm">
            <Link href="/footer/privacy" className="hover:text-white transition-colors duration-200">
              Privasi
            </Link>
            <Link href="/footer/terms" className="hover:text-white transition-colors duration-200">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const AnimatedPreviewLink = ({ heading, subheading, imgSrc, href }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const top = useTransform(mouseYSpring, [0.5, -0.5], ["40%", "60%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["60%", "70%"]);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center border-b-2 border-neutral-700 py-2 transition-colors duration-500 hover:border-neutral-50"
    >
      <Link href={href} className="relative z-10 w-full">
        <span className="relative z-10 block text-base font-bold transition-colors duration-500 group-hover:text-white font-poppins">
          {heading}
        </span>
        <span className="relative z-10 ml-2 block text-xs text-neutral-400 transition-colors duration-500 group-hover:text-neutral-50">
          {subheading}
        </span>
      </Link>
      <motion.img
        style={{ top, left, translateX: "-50%", translateY: "-50%" }}
        initial={{ scale: 0, rotate: "-12.5deg" }}
        whileHover={{ scale: 1, rotate: "12.5deg" }}
        transition={{ type: "spring" }}
        src={imgSrc}
        className="absolute z-0 h-16 w-24 rounded-lg object-cover"
        alt={`Preview for ${heading}`}
      />
    </motion.div>
  );
};
