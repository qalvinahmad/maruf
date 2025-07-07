import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FiArrowUpRight } from "react-icons/fi";

export const Features = () => {
  const features = [
    {
      title: "Pengenalan & Validasi huruf",
      description: "Sistem canggih untuk merekam, menganalisis, dan memvalidasi pelafalan huruf hijaiyah dengan teknologi AI dan validasi guru.",
      imgUrl: "https://cdn.dribbble.com/userupload/26430705/file/original-108bf0d360ff00f15162fc4a0fa987a6.png?resize=752x&vertical=center"
    },
  ];

  return (
    <section id="features" className="bg-white py-20">
      <div className="container mx-auto px-4 mb-16 text-center">
        <h2 className="mb-4 font-poppins text-4xl font-bold text-[#00acee] md:text-5xl">
          Fitur Utama
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 font-poppins">
          Platform kami menyediakan berbagai fitur inovatif untuk memudahkan pembelajaran Al-Qur'an dan makhrajul huruf
        </p>
      </div>

      {features.map((feature, index) => (
        <TextParallaxContent
          key={index}
          imgUrl={feature.imgUrl}
          subheading={feature.icon}
          heading={feature.title}
        >
          <FeatureContent 
            title={feature.title}
            description={feature.description}
          />
        </TextParallaxContent>
      ))}
    </section>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({
  imgUrl,
  subheading,
  heading,
  children,

}) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({
  subheading,
  heading,

}) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-6xl md:mb-4 md:text-8xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const FeatureContent = ({ title, description }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold font-poppins md:col-span-4">
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-8 text-xl text-neutral-600 font-poppins md:text-2xl">
        {description}
      </p>
      <button className="w-full rounded bg-[#00acee] px-9 py-4 text-xl text-white transition-colors hover:bg-[#0096d1] md:w-fit font-poppins">
        Pelajari Lebih Lanjut <FiArrowUpRight className="inline" />
      </button>
    </div>
  </div>
);

export default Features;