import { motion } from "framer-motion";

export const SplitText = ({
  text,
  className = "",
  delay = 0.1,
  duration = 0.6,
  initialY = 40,
}) => {
  // Split text into words
  const words = text.split(" ");

  // Animation variants for container
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: delay, delayChildren: delay * i },
    }),
  };

  // Animation variants for each word
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: initialY,
    },
  };

  return (
    <motion.div
      className={`overflow-hidden inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          style={{ display: "inline-block", marginRight: "0.25em" }}
          variants={child}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default SplitText;
