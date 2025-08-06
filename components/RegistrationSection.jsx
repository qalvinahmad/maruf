"use client";
import Link from "next/link";
import RotatingText from "../src/blocks/TextAnimations/RotatingText/RotatingText";

const RegistrationSection = () => {
  return (
    <section
      className="py-12 text-white flex flex-col items-center justify-center min-h-screen px-4"
      style={{ backgroundColor: "#00acee" }}
    >
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8 font-poppins">
        <p className="text-3xl font-semibold whitespace-nowrap">
          Belajar dengan Ma'ruf&nbsp;
        </p>

        <RotatingText
          texts={["Menyenangkan", "Interaktif", "Mengasyikkan"]}
          mainClassName="inline-block px-2 bg-white overflow-hidden text-3xl text-[#00acee] font-semibold font-poppins py-0.5 rounded-lg"
          staggerFrom={"last"}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-120%", opacity: 0 }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
      </div>

      <Link
        href="/authentication/register"
        className="inline-block rounded-md bg-black text-white px-8 py-3 text-lg font-medium hover:bg-gray-800 transition-colors duration-200 font-poppins"
      >
        Gabung Sekarang
      </Link>
    </section>
  );
};

export default RegistrationSection;
